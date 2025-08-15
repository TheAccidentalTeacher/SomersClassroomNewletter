const express = require('express');
const router = express.Router();

// Admin routes
router.get('/users', (req, res) => {
  // TODO: Get all users (admin only)
  res.json({ message: 'Admin users endpoint - implementation pending' });
});

router.get('/stats', (req, res) => {
  // TODO: Get system statistics
  res.json({ message: 'Admin stats endpoint - implementation pending' });
});

module.exports = router;