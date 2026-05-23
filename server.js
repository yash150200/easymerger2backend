require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

app.use('/api/convert', require('./routes/convert'));
app.use('/api/merge', require('./routes/merge'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});