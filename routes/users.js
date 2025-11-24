const express = require("express");
const router = express.Router();
const User = require("../models/User");
const dbConnect = require("../lib/dbConnect");

router.get("/", async (req, res) => {
  try {
    await dbConnect();
    const users = await User.find()
      .select("-password -twoFactorSecret")
      .sort({ _id: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/role", async (req, res) => {
  try {
    await dbConnect();
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    await dbConnect();
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: isActive },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await dbConnect();
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
