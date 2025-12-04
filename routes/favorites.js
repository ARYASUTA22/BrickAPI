const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const dbConnect = require('../lib/dbConnect');

router.patch('/favorites', async (req, res) => {
  try {
    const { userId, productId, action } = req.body;

    if (!userId || !productId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid UserId received:", userId);
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    await dbConnect();
    let updateOperation;

    if (action === 'add') {
      updateOperation = { $addToSet: { favorites: productId } };
    } else if (action === 'remove') {
      updateOperation = { $pull: { favorites: productId } };
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateOperation, { new: true });

    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found in database' });
    }

    res.status(200).json({ 
        message: 'Favorites updated successfully', 
        favorites: updatedUser.favorites 
    });

  } catch (error) {
    console.error("Backend Error at /favorites:", error); // Supaya error tampil di terminal
    res.status(500).json({ message: 'Error updating favorites', error: error.message });
  }
});

module.exports = router;