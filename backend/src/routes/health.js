const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const status = {
    frontend: 'running',
    backend: 'healthy',
    database: 'connected',
    timestamp: Date.now()
  };
  res.json(status);
});

module.exports = router;
