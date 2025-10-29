const express = require('express');
const router = express.Router();

// Alertmanager webhook receiver
router.post('/', (req, res) => {
  try {
    const payload = req.body;
    console.log('Received alert payload from Alertmanager:', JSON.stringify(payload, null, 2));
    // here we could store alerts to DB or forward to other channels
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing alert webhook', err);
    res.status(500).json({ error: 'processing error' });
  }
});

module.exports = router;
