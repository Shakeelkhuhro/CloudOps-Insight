const express = require('express');
const router = express.Router();

// Return mock metrics points (or could be hooked to real collectors)
router.get('/', (req, res) => {
  const now = Date.now();
  const metrics = {
    cpu: (20 + Math.random() * 60).toFixed(2),
    memory: (30 + Math.random() * 50).toFixed(2),
    disk: (10 + Math.random() * 70).toFixed(2),
    networkIn: (Math.random() * 100).toFixed(2),
    networkOut: (Math.random() * 100).toFixed(2),
    timestamp: now
  };
  res.json(metrics);
});

module.exports = router;
