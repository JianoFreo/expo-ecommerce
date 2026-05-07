import express from 'express';

const app = express();

app.get('/api/health', (req, res) => {
  res.staus(200).json({ message: 'Server is healthy' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
