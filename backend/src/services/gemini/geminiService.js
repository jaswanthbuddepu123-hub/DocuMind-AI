const ai = require('./geminiClient');
const { extractionSchema } = require('../../schemas/extractionSchema');
const { chatSchema } = require('../../schemas/chatSchema');
const { transformSchema } = require('../../schemas/transformSchema');

const analyzeDocument = async (fileBuffer, mimeType) => {
  try {
    const prompt = `You are a highly capable document intelligence system.
Analyze the provided document and perform the following tasks:
1. Document classification
2. Field extraction: Extract structured fields dynamically based on the actual document type (e.g. vendorName, invoiceNumber, dueDate for invoices, merchantName, total for receipts).
3. Line items: If the document contains a table or list of items, extract them into 'lineItems' (description, quantity, unitPrice, amount). If none exist, return an empty array. Do not invent line items.
4. Validation: Validate internal consistency based ONLY on extracted data (e.g., does subtotal + tax equal total? Are important fields missing?).
5. Insights: Generate useful insights based ONLY on the uploaded document (e.g., important dates, high-value amounts, missing info). Do not generate generic insights.

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

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
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
        break;
      } catch (err) {
        if (err.status === 429 || err.status === 503 || (err.message && (err.message.includes('429') || err.message.includes('503')))) {
          retries -= 1;
          if (retries === 0) throw err;
          console.log(`AI Service unavailable or rate limited, waiting 10 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          throw err;
        }
      }
    }

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
    if (error.status === 429 || error.status === 503 || (error.message && (error.message.includes('429') || error.message.includes('503') || error.message.includes('quota')))) {
      errorMsg = 'AI service is currently busy or rate limited. Please try again in a few moments.';
    } else if (errorMsg.includes('fetch failed') || errorMsg.includes('timeout')) {
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

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: chatContents,
          config: {
            responseMimeType: 'application/json'
          }
        });
        break;
      } catch (err) {
        if (err.status === 429 || err.status === 503 || (err.message && (err.message.includes('429') || err.message.includes('503')))) {
          retries -= 1;
          if (retries === 0) throw err;
          console.log(`AI Service unavailable or rate limited, waiting 10 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          throw err;
        }
      }
    }

    const rawJson = response.text;
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsedData = JSON.parse(cleanJson);

    const validatedData = chatSchema.parse(parsedData);

    return { success: true, data: validatedData };
  } catch (error) {
    console.error('Gemini chat error:', error);
    if (error.status === 429 || error.status === 503 || (error.message && (error.message.includes('429') || error.message.includes('503') || error.message.includes('quota')))) {
      return { success: false, error: 'AI service is currently busy or rate limited. Please try again in a few moments.' };
    }
    return { success: false, error: error.message || 'Failed to chat with document' };
  }
};

const transformDocumentContent = async (fileBuffer, mimeType, instruction, hasImage) => {
  try {
    const prompt = `You are a Visual PDF Editor AI.
The user wants to physically draw on or manipulate this document visually.
A standard PDF page is roughly X: 600 points wide and Y: 842 points tall.
X=0 is the left edge. Y=0 is the BOTTOM edge. Y=842 is the TOP edge.

You MUST respond ONLY with a raw JSON object exactly matching this structure. Do not use markdown fences (no \`\`\`json) and include no prose.
{
  "actions": [
    {
      "type": "addText" | "addImage" | "redact" | "erase",
      "text": "The text to draw (if addText)",
      "x": 300,
      "y": 421,
      "width": 200,
      "height": 100,
      "page": 1
    }
  ]
}

RULES:
- 'addImage' should ONLY be used if the user requested to add an image (hasImage=${hasImage}).
- 'redact' draws a black box over coordinates to hide sensitive information.
- 'erase' draws a WHITE box over coordinates to visually delete or erase content or images from the PDF. ALWAYS use this when the user asks to "delete" or "remove" something. Use a large width and height (e.g., width: 300, height: 100) if they don't specify, to ensure it covers the area.
- 'addText' writes new text on top of the PDF.
- Calculate approximate coordinates based on the user's natural language (e.g. "top right" -> X=450, Y=750. "middle" -> X=300, Y=421. "bottom" -> Y=50). If unsure, guess reasonable coordinates based on the description.

User Instruction: "${instruction}"`;

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
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
        break; // Success, exit loop
      } catch (err) {
        if (err.status === 429 || err.status === 503 || (err.message && (err.message.includes('429') || err.message.includes('503')))) {
          retries -= 1;
          if (retries === 0) throw err;
          console.log(`AI Service unavailable or rate limited, waiting 10 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          throw err;
        }
      }
    }

    const rawJson = response.text;
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsedData = JSON.parse(cleanJson);

    const validatedData = transformSchema.parse(parsedData);

    return { success: true, data: validatedData };
  } catch (error) {
    console.error('Gemini transform error:', error);
    if (error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('quota'))) {
      return { success: false, error: 'AI service request limit has been reached. Please try again in a few moments.' };
    }
    return { success: false, error: error.message || 'Failed to transform document' };
  }
};

module.exports = {
  analyzeDocument,
  chatWithDocument,
  transformDocumentContent
};
