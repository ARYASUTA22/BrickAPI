require('dotenv').config();
const express = require('express');
const cors = require('cors');
const articlesRoutes = require('./routes/articles');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

app.use('/api', authRoutes); 
app.use('/api', favoritesRoutes);
app.use('/api/articles', articlesRoutes);

app.get('/', (req, res) => {
  res.send('Server backend LEGO berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});