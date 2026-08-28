const fs = require('fs');
const path = require('path');

const checkMagicNumber = (filePath) => {
  const buffer = Buffer.alloc(8);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);

  const hex = buffer.toString('hex').toUpperCase();

  if (hex.startsWith('255044462D')) return 'application/pdf'; // %PDF-
  if (hex.startsWith('FFD8FF')) return 'image/jpeg'; // JPEG
  if (hex.startsWith('89504E470D0A1A0A')) return 'image/png'; // PNG
  
  return 'unknown';
};

const validateFile = (file) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

  // 1. Sanitize filename (strip special characters, path traversal)
  const ext = path.extname(file.originalname).toLowerCase();
  const sanitizedName = file.originalname
    .replace(/^.*[\\\/]/, '') // Remove path traversal
    .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars with underscore

  // 2. Check extension
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Extension ${ext} is not allowed.`);
  }

  // 3. Re-check MIME type based on magic numbers
  const realMimeType = checkMagicNumber(file.path);
  
  if (!allowedMimeTypes.includes(realMimeType)) {
    throw new Error(`Invalid file content. Expected one of ${allowedMimeTypes.join(', ')} but got ${realMimeType}`);
  }

  // 4. Ensure extension matches MIME type roughly
  if (realMimeType === 'application/pdf' && ext !== '.pdf') throw new Error('Mismatched extension and content');
  if (realMimeType === 'image/jpeg' && !['.jpg', '.jpeg'].includes(ext)) throw new Error('Mismatched extension and content');
  if (realMimeType === 'image/png' && ext !== '.png') throw new Error('Mismatched extension and content');

  return sanitizedName;
};

module.exports = {
  validateFile
};
