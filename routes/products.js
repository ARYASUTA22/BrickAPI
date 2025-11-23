const express = require('express');
const router = express.Router();
const multer = require('multer');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lego-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

const Product = require('../models/Product');
const dbConnect = require('../lib/dbConnect');

router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    await dbConnect();
    const { sku, name, description, price, stock, discount, category, tokopediaLink, shopeeLink, otherLink } = req.body;
    
    const imageUrl = req.file ? req.file.path : null;

    const newProduct = new Product({
      sku, name, description, 
      price: Number(price), 
      stock: Number(stock), 
      discount: Number(discount),
      category,
      imageUrl,
      tokopediaLink, shopeeLink, otherLink
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    await dbConnect();
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { sku, name, description, price, stock, discount, category, tokopediaLink, shopeeLink, otherLink } = req.body;

    if (req.file) {
        product.imageUrl = req.file.path;
    }

    product.sku = sku || product.sku;
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price ? Number(price) : product.price;
    product.stock = stock ? Number(stock) : product.stock;
    product.discount = discount ? Number(discount) : product.discount;
    product.tokopediaLink = tokopediaLink || product.tokopediaLink;
    product.shopeeLink = shopeeLink || product.shopeeLink;
    product.otherLink = otherLink || product.otherLink;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;