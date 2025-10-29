const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const client = require('prom-client');
const metricsRouter = require('./routes/metrics');
const deploymentsRouter = require('./routes/deployments');
const healthRouter = require('./routes/health');
const alertsRouter = require('./routes/alerts');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Prometheus default metrics
client.collectDefaultMetrics({ prefix: 'cloudops_' });

// simple gauge example (we'll set values when emitting)
const cpuGauge = new client.Gauge({ name: 'cloudops_cpu_percent', help: 'CPU percent' });
const memGauge = new client.Gauge({ name: 'cloudops_memory_percent', help: 'Memory percent' });

// Expose prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

app.use('/api/metrics', metricsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/health', healthRouter);
app.use('/api/alerts', alertsRouter);

const port = process.env.PORT || 5000;
const server = http.createServer(app);

// attach Socket.IO
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('New socket connection', socket.id);
});

// internal metric emitter: push mock metrics every 2s
function generateMetrics() {
  const now = Date.now();
  const metrics = {
    cpu: Number((20 + Math.random() * 60).toFixed(2)),
    memory: Number((30 + Math.random() * 50).toFixed(2)),
    disk: Number((10 + Math.random() * 70).toFixed(2)),
    networkIn: Number((Math.random() * 100).toFixed(2)),
    networkOut: Number((Math.random() * 100).toFixed(2)),
    timestamp: now
  };
  // update prometheus gauges
  cpuGauge.set(metrics.cpu);
  memGauge.set(metrics.memory);
  // emit via websocket
  io.emit('metrics', metrics);
}

setInterval(generateMetrics, 2000);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/cloudops_insight';
mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error', err));

server.listen(port, () => console.log(`Backend listening on ${port}`));
