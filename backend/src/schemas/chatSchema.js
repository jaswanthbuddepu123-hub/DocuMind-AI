const { z } = require('zod');

const chatSchema = z.object({
  answer: z.string().describe("The primary answer to the user's question, strictly based on the document."),
  summary: z.string().optional().describe("A brief summary of the section or topic being discussed, if applicable."),
  keyPoints: z.array(z.string()).optional().describe("Bullet points of key information relevant to the user's question."),
  confidence: z.number().min(0).max(1).optional().describe("Confidence score of the answer based on the clarity of the document."),
  sources: z.array(z.string()).optional().describe("Sections, page numbers, or snippets where the answer was found.")
});

module.exports = { chatSchema };
