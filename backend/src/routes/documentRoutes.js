const express = require('express');
const documentController = require('../controllers/documentController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth); // Protect all document routes

router.post('/upload', upload.single('document'), documentController.uploadHandler);
router.get('/stats', documentController.getDocumentStats);
router.get('/graph-stats', documentController.getGraphStats);
router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/:id/download', documentController.downloadDocument);
router.patch('/:id', documentController.updateDocumentResult);
router.post('/:id/retry', documentController.retryDocument);
router.post('/:id/transform', documentController.transformDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
