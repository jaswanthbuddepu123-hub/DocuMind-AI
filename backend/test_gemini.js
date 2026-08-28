const fs = require('fs');
const geminiService = require('./src/services/gemini/geminiService');

const testGemini = async () => {
  console.log('Testing Gemini connection and structure validation...');
  
  // We'll create a minimal valid PDF with a dummy text
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Invoice Total: 100) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000307 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n402\n%%EOF',
    'ascii'
  );
  
  try {
    const result = await geminiService.analyzeDocument(minimalPdf, 'application/pdf');
    
    console.log('Gemini Success:', result.success);
    if (result.success) {
      console.log('Data returned successfully according to Zod schema!');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Test crashed:', error);
  }
};

testGemini();
