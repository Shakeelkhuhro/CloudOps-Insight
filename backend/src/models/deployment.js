const { Schema, model } = require('mongoose');

const DeploymentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success','failed','running'], default: 'success' },
  duration: Number,
  branch: String
});

module.exports = model('Deployment', DeploymentSchema);
