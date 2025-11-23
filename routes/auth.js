const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const dbConnect = require('../lib/dbConnect');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }
    // (Tambahkan validasi lain jika perlu)
    
    await dbConnect();

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id, // Penting untuk Favorites
        email: user.email,
        username: user.username,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        favorites: user.favorites
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login.', error: error.message });
  }
});

router.post('/setup-2fa', async(req, res) => {
  try {
    const { userId } = req.body;
    await dbConnect();
    const user = await User.findById(userId);

    const secret = speakeasy.generateSecret({ name: `Pick A Brick (${user.email})`});

    user.twoFactorSecret = secret.base32;
    await user.save();

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      res.json({ qrCode: data_url, secret: secret.base32 });
    })
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, token } = req.body;
    await dbConnect();
    const user = await User.findById(userId);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      if (!user.isTwoFactorEnabled) {
        user.isTwoFactorEnabled = true;
        await user.save();
      }
      res.json({ message: 'Verified', isValid: true });
    } else {
      res.status(400).json({ message: 'Invalid Token', isValid: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;