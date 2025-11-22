const express = require('express');
const router = express.Router();
const User = require('../models/User');
const dbConnect = require('../lib/dbConnect');

// PATCH /api/favorites
router.patch('/favorites', async (req, res) => {
  try {
    const { userId, productId, action } = req.body;
    if (!userId || !productId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
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

    await User.findByIdAndUpdate(userId, updateOperation);
    res.status(200).json({ message: 'Favorites updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error updating favorites', error: error.message });
  }
});

module.exports = router;