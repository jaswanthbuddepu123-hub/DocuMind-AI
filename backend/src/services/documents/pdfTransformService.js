const { PDFDocument, rgb } = require('pdf-lib');

const applyTransformActions = async (originalBuffer, mimeType, actions, imageBuffer = null) => {
  try {
    let pdfDoc;
    
    // Check if the original document is an image
    if (mimeType && mimeType.startsWith('image/')) {
      pdfDoc = await PDFDocument.create();
      let embeddedImage;
      if (mimeType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(originalBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(originalBuffer);
      }
      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    } else {
      // Assume PDF
      pdfDoc = await PDFDocument.load(originalBuffer);
    }

    const pages = pdfDoc.getPages();

    for (const action of actions) {
      // PDF pages are 0-indexed in pdf-lib, but our schema is 1-indexed
      const pageIndex = Math.max(0, (action.page || 1) - 1);
      if (pageIndex >= pages.length) continue;
      
      const page = pages[pageIndex];

      if (action.type === 'addText' && action.text) {
        page.drawText(action.text, {
          x: action.x,
          y: action.y,
          size: 14,
          color: rgb(0, 0, 0),
        });
      }

      if (action.type === 'redact') {
        page.drawRectangle({
          x: action.x,
          y: action.y,
          width: action.width || 100,
          height: action.height || 20,
          color: rgb(0, 0, 0),
        });
      }

      if (action.type === 'erase') {
        page.drawRectangle({
          x: action.x,
          y: action.y,
          width: action.width || 200,
          height: action.height || 100,
          color: rgb(1, 1, 1), // White box to visually delete content
        });
      }

      if (action.type === 'addImage' && imageBuffer) {
        let pdfImage;
        try {
          // Try embedding as PNG first, fallback to JPEG
          pdfImage = await pdfDoc.embedPng(imageBuffer);
        } catch (e) {
          try {
            pdfImage = await pdfDoc.embedJpg(imageBuffer);
          } catch (e2) {
            console.error('Could not embed image as PNG or JPG');
            continue;
          }
        }
        
        const imgDims = pdfImage.scale(0.5); // scale down default size
        page.drawImage(pdfImage, {
          x: action.x,
          y: action.y,
          width: action.width || imgDims.width,
          height: action.height || imgDims.height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF Transform Error:', error);
    throw error;
  }
};

module.exports = {
  applyTransformActions
};
