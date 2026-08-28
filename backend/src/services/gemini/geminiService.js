const ai = require('./geminiClient');
const { extractionSchema } = require('../../schemas/extractionSchema');

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
      model: 'gemini-2.5-flash',
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
    return { success: false, error: error.message || 'Failed to process document' };
  }
};

module.exports = {
  analyzeDocument
};
