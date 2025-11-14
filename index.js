const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const IFTTT_KEY = 'cKVkvJ_McWvfi_fwtFlXRq';

let lastHighAlert = null;

app.post('/alert/high', async (req, res) => {
  try {
    const glucoseValue = req.query.value || req.query.sgv || req.body.value || 'unknown';
    const now = new Date();
    

    
    const iftttUrl = `https://maker.ifttt.com/trigger/high_alert/with/key/${IFTTT_KEY}`;
    
    const response = await fetch(iftttUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value1: glucoseValue,
        value2: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      })
    });
    
    if (response.ok) {
      lastHighAlert = now;
      console.log(`Alert sent: glucose ${glucoseValue}`);
      res.json({ success: true, glucoseValue });
    } else {
      console.log(`IFTTT error: ${response.status}`);
      res.json({ success: false, error: 'IFTTT request failed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for GET requests
app.get('/alert/high', (req, res) => {
  const testValue = req.query.value || '185';
  res.send(`
    <html>
      <body>
        <h2>Test High Glucose Alert</h2>
        <p>Click the button below to simulate a high glucose reading of ${testValue}</p>
        <form action="/alert/high?value=${testValue}" method="POST">
          <button type="submit" style="padding: 10px 20px; font-size: 16px;">
            Send Test Alert (${testValue} mg/dl)
          </button>
        </form>
      </body>
    </html>
  `);
});

app.get('/', (req, res) => {
  res.send('Glucose Rate Limiter Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
