const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'News' },
  thumbnail: { type: String }, // simpan URL/Path gambarnya saja
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);