const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'medico-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Medico service health check running on port ${PORT}`);
});
