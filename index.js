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
    
    if (lastHighAlert) {
      const timeSinceLastAlert = now - lastHighAlert;
      const oneHour = 60 * 60 * 1000;
      
      if (timeSinceLastAlert < oneHour) {
        const minutesRemaining = Math.ceil((oneHour - timeSinceLastAlert) / 60000);
        return res.json({ success: false, reason: 'rate_limited', minutesRemaining });
      }
    }
    
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Glucose Rate Limiter Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
