const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  imageUrl: { type: String }, // URL gambar (Cloudinary / Local)
  category: { type: String, default: 'Uncategorized' }, 
  
  // Link Marketplace (Opsional)
  tokopediaLink: { type: String },
  shopeeLink: { type: String },
  otherLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);