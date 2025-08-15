const express = require('express');
const router = express.Router();

// Export routes
router.post('/pdf', (req, res) => {
  // TODO: Export newsletter as PDF
  res.json({ message: 'PDF export endpoint - implementation pending' });
});

router.post('/docx', (req, res) => {
  // TODO: Export newsletter as DOCX
  res.json({ message: 'DOCX export endpoint - implementation pending' });
});

router.post('/google-docs', (req, res) => {
  // TODO: Export to Google Docs
  res.json({ message: 'Google Docs export endpoint - implementation pending' });
});

module.exports = router;