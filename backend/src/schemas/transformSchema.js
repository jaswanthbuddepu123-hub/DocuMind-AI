const { z } = require('zod');

const transformSchema = z.object({
  actions: z.array(z.object({
    type: z.enum(['addText', 'addImage', 'redact', 'erase']),
    text: z.string().optional(),
    x: z.number().describe('X coordinate on the page (0 is far left, max ~600)'),
    y: z.number().describe('Y coordinate on the page (0 is bottom, max ~800 is top)'),
    width: z.number().optional().describe('Optional width for image or redaction block'),
    height: z.number().optional().describe('Optional height for image or redaction block'),
    page: z.number().default(1).describe('Page number, 1-indexed')
  }))
});

module.exports = {
  transformSchema
};
