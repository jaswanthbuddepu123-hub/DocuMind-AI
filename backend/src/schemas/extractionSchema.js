const { z } = require('zod');

const extractionSchema = z.object({
  documentType: z.enum(["invoice", "receipt", "contract", "purchase_order", "other"]),
  confidence: z.number().min(0).max(1),
  fields: z.record(z.string(), z.any()),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    unitPrice: z.number().nullable(),
    amount: z.number().nullable()
  })),
  validation: z.object({
    isValid: z.boolean(),
    issues: z.array(z.string())
  }),
  insights: z.array(z.string())
});

module.exports = {
  extractionSchema
};
