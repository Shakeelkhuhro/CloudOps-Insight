const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Deployment = require('../models/deployment');

// list deployments
router.get('/', async (req, res) => {
  const list = await Deployment.find().sort({ timestamp: -1 }).limit(50).lean();
  res.json(list);
});

// trigger a simulated deployment
router.post('/', async (req, res) => {
  const id = uuidv4();
  const branch = req.body.branch || 'main';
  const start = Date.now();
  const deployment = new Deployment({ id, status: 'running', branch });
  await deployment.save();
  // simulate async deployment process
  setTimeout(async () => {
    const duration = Math.round(Math.random() * 40) + 10;
    const success = Math.random() > 0.1;
    deployment.status = success ? 'success' : 'failed';
    deployment.duration = duration;
    await deployment.save();
    // emit deployment event over socket.io if available
    try {
      const io = req.app.get('io');
      if (io) io.emit('deployment', deployment);
    } catch (e) {
      console.warn('Could not emit deployment event', e.message);
    }
  }, 3000);

  res.status(202).json({ id, status: 'running' });
});

module.exports = router;
