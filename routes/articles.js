const express = require('express');
const router = express.Router();
const multer = require('multer');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Article = require('../models/Article');
const dbConnect = require('../lib/dbConnect');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lego-app',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    await dbConnect();
    
    const { title, content, category, status } = req.body;
    
    const thumbnailPath = req.file ? req.file.path : null;

    const newArticle = new Article({
      title,
      content,
      category,
      status: status || 'draft',
      thumbnail: thumbnailPath // Simpan URL lengkap Cloudinary
    });

    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const articles = await Article.find().sort({ createdAt: -1 }); 
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbConnect();
    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    await dbConnect();
    
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const { title, content, category, status } = req.body;
    
    let thumbnailPath = article.thumbnail;
    if (req.file) {
        thumbnailPath = req.file.path; // Untuk Cloudinary

    }

    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    article.status = status || article.status;
    article.thumbnail = thumbnailPath;

    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;