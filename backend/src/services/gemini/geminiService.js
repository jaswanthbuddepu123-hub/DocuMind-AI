const ai = require('./geminiClient');
const { extractionSchema } = require('../../schemas/extractionSchema');
const { chatSchema } = require('../../schemas/chatSchema');

const analyzeDocument = async (fileBuffer, mimeType) => {
  try {
    const prompt = `You are a highly capable document intelligence system.
Analyze the provided document and perform the following tasks:
1. Document classification
2. Field extraction (e.g. vendorName, invoiceNumber, invoiceDate, dueDate, subtotal, tax, total, etc. depending on documentType)
3. Extract all line items
4. Validate internal consistency (e.g. does subtotal + tax equal total?)
5. Generate short actionable insights based on the document contents.

You MUST respond ONLY with a raw JSON object exactly matching this structure. Do not use markdown fences (no \`\`\`json) and include no prose:
{
  "documentType": "invoice" | "receipt" | "contract" | "purchase_order" | "other",
  "confidence": <number between 0 and 1>,
  "fields": { "<key>": <value string, number, or null> },
  "lineItems": [
    { "description": "...", "quantity": <number or null>, "unitPrice": <number or null>, "amount": <number or null> }
  ],
  "validation": { "isValid": <true/false>, "issues": ["any issues found"] },
  "insights": ["insight 1", "insight 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawJson = response.text;

    // Clean potential markdown fences just in case
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

    const parsedData = JSON.parse(cleanJson);

    // Validate against Zod schema
    const validatedData = extractionSchema.parse(parsedData);

    return { success: true, data: validatedData };
  } catch (error) {
    console.error('Gemini processing error:', error);
    let errorMsg = error.message || 'Failed to process document';
    if (errorMsg.includes('fetch failed') || errorMsg.includes('timeout')) {
      errorMsg = 'AI Service connection timeout. Please try again later.';
    }
    return { success: false, error: errorMsg };
  }
};

const chatWithDocument = async (fileBuffer, mimeType, message, history = []) => {
  try {
    const prompt = `You are a helpful AI assistant representing DocuMind AI.
You are helping the user understand a document they uploaded.
Answer the user's question based ONLY on the provided document.
If the answer cannot be found in the document, say "I cannot find the answer to that in the document."

You MUST respond ONLY with a raw JSON object exactly matching this structure. Do not use markdown fences and include no prose:
{
  "answer": "The primary answer",
  "summary": "Optional brief summary",
  "keyPoints": ["Optional", "key", "points"],
  "confidence": 0.95,
  "sources": ["Page 1", "Section 2"]
}

User Question:
${message}`;

    const chatContents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: fileBuffer.toString('base64'),
              mimeType: mimeType
            }
          },
          { text: "Here is the document. Please use it to answer my following questions." }
        ]
      },
      {
        role: 'model',
        parts: [{ text: "I have read the document and am ready to answer your questions based ONLY on its contents." }]
      }
    ];

    for (const msg of history) {
      chatContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    chatContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: chatContents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawJson = response.text;
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsedData = JSON.parse(cleanJson);

    const validatedData = chatSchema.parse(parsedData);

    return { success: true, data: validatedData };
  } catch (error) {
    console.error('Gemini chat error:', error);
    return { success: false, error: error.message || 'Failed to chat with document' };
  }
};

const transformDocumentContent = async (fileBuffer, mimeType, instruction) => {
  try {
    const prompt = `You are an AI document transformation tool.
The user wants to transform this document based on the following instruction:
"${instruction}"

Output the transformed document text. Do not wrap it in markdown blockquotes unless specifically asked. Do not add conversational intro/outro text, just output the raw transformed content.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType
          }
        },
        prompt
      ]
    });

    return { success: true, text: response.text };
  } catch (error) {
    console.error('Gemini transform error:', error);
    return { success: false, error: error.message || 'Failed to transform document' };
  }
};

const identifyTransformationIntent = async (instruction) => {
  try {
    const prompt = `You are a Document Transformation Analyzer.
Analyze the following user instruction for modifying a PDF document.
Determine the core operation requested.
Valid operations are: 'REMOVE_IMAGES', 'APPEND_TEXT', 'EXTRACT_TEXT', 'SUMMARIZE', 'OTHER'.

Return ONLY a JSON object with this exact structure:
{
  "operation": "APPEND_TEXT",
  "explanation": "Brief explanation of what will be done"
}

User instruction: "${instruction}"
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt
    });

    const text = result.text;

    const cleanJson = text
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '');

    const data = JSON.parse(cleanJson);

    return {
      success: true,
      operation: data.operation || 'OTHER'
    };

  } catch (error) {
    console.error('Intent identification error:', error);

    return {
      success: false,
      operation: 'OTHER'
    };
  }
};

module.exports = {
  analyzeDocument,
  chatWithDocument,
  transformDocumentContent,
  identifyTransformationIntent
};
