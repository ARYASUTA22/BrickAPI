const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const dbConnect = require("../lib/dbConnect");

router.get("/", async (req, res) => {
  try {
    await dbConnect();

    const now = new Date();
    const queryYear = req.query.year
      ? parseInt(req.query.year)
      : now.getFullYear();
    const queryMonth = req.query.month
      ? parseInt(req.query.month)
      : now.getMonth() + 1;

    const startDate = new Date(queryYear, queryMonth - 1, 1, 0, 0, 0);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

    const daysInMonth = endDate.getDate();

    const stockAggregation = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$stock" },
        },
      },
    ]);
    const totalStock =
      stockAggregation.length > 0 ? stockAggregation[0].totalQty : 0;

    const totalUsers = await User.countDocuments();

    const allUsers = await User.find().select("favorites");
    const totalReviews = allUsers.reduce(
      (acc, user) => acc + (user.favorites ? user.favorites.length : 0),
      0
    );

    const formatDailyData = (data, totalDays) => {
      const days = Array(totalDays).fill(0);
      data.forEach((item) => {
        if (item._id >= 1 && item._id <= totalDays) {
          days[item._id - 1] = item.count;
        }
      });
      return days;
    };

    const userDaily = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productDaily = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const favStatsAggregate = await User.aggregate([
      { $unwind: "$favorites" },
      {
        $addFields: {
          favoriteObjId: {
            $convert: {
              input: "$favorites",
              to: "objectId",
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $match: {
          favoriteObjId: { $ne: null }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "favoriteObjId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const favLabels = favStatsAggregate.map(
      (item) => item._id || "Uncategorized"
    );
    const favData = favStatsAggregate.map((item) => item.count);

    res.status(200).json({
      meta: {
        year: queryYear,
        month: queryMonth,
        daysInMonth: daysInMonth,
      },
      totalStock: totalStock,
      totalUsers: totalUsers,
      totalReviews: totalReviews,
      chartData: {
        users: formatDailyData(userDaily, daysInMonth),
        products: formatDailyData(productDaily, daysInMonth),
      },
      favStats: {
        labels: favLabels,
        data: favData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
