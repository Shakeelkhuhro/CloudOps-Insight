const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3101;

app.use(bodyParser.raw({ type: '*/*', limit: '10mb' }));

// Accept Loki push API and just log number of streams and sample content for demo
app.post('/loki/api/v1/push', (req, res) => {
  try {
    const text = req.body.toString('utf8');
    // promtail sends JSON; try to parse
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
    if (parsed && parsed.streams) {
      console.log(`[logreceiver] received ${parsed.streams.length} stream(s)`);
      parsed.streams.forEach((s, i) => {
        const entries = s.values || [];
        console.log(`  stream ${i}: labels=${s.labels} entries=${Math.min(entries.length,3)}`);
        if (entries.length) console.log(`    sample: ${entries[0][1]}`);
      });
    } else {
      console.log('[logreceiver] received payload (non-json or unexpected format)');
    }
    res.json({ status: 'received' });
  } catch (err) {
    console.error('Error in logreceiver', err);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, () => console.log(`logreceiver listening on ${port}`));
