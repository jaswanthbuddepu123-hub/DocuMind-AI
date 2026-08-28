const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const transformPdf = async (fileBuffer, operation, instruction) => {
  // Load the original PDF
  const pdfDoc = await PDFDocument.load(fileBuffer);
  
  if (operation === 'REMOVE_IMAGES') {
    // pdf-lib does not have a native "remove all images" high-level API,
    // but we can recreate a new PDF and copy pages without resources, 
    // or we can just create a text-only PDF if that's what the user wants.
    // A simpler approach for the hackathon to "remove images" is to extract text
    // and draw it on a new PDF, or strip the XObjects.
    
    // For a robust implementation without breaking the structure, we can iterate
    // over pages and remove XObject references that are images.
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { node } = page;
      if (node.Resources && node.Resources.XObject) {
        // Clear all XObjects (which usually includes images)
        page.node.set(
          pdfDoc.context.obj('Resources'),
          pdfDoc.context.obj({
            ...page.node.Resources.dict,
            XObject: pdfDoc.context.obj({})
          })
        );
      }
    }
    
    return await pdfDoc.save();
  }
  
  if (operation === 'APPEND_TEXT') {
    // Basic text extraction from intent would be needed in a full implementation.
    // Here we'll append a generic marker or extract the specific text if possible.
    const pages = pdfDoc.getPages();
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Determine what to add based on instruction. Simple heuristic for hackathon:
      let textToAdd = "Document reviewed and transformed by DocuMind AI.";
      if (instruction.toLowerCase().includes("name")) {
        textToAdd = "Name: Authenticated User (Added via DocuMind AI)";
      } else {
        // Try to extract the sentence if they used quotes
        const match = instruction.match(/["']([^"']+)["']/);
        if (match) {
          textToAdd = match[1];
        }
      }
      
      lastPage.drawText(textToAdd, {
        x: 50,
        y: 50,
        size: 12,
        font: font,
        color: rgb(0, 0, 0.5),
      });
    }
    return await pdfDoc.save();
  }
  
  // Default: if no specific PDF manipulation, just return original or basic text PDF
  // (In a full app we'd handle 'EXTRACT_TEXT', 'SUMMARIZE', etc.)
  return await pdfDoc.save();
};

module.exports = {
  transformPdf
};
