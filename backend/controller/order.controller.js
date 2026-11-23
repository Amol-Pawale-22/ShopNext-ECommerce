const mongoose = require("mongoose");
const Order = require("../models/Order");

const createOrder = async function (req, res) {
  try {
    const { items, totalAmount, address, paymentId } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !Number.isFinite(Number(totalAmount)) ||
      Number(totalAmount) <= 0 ||
      !address ||
      !paymentId
    ) {
      return res.status(400).json({ message: "Invalid order details." });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount: Number(totalAmount),
      address,
      paymentId,
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Failed to create order:", error);
    return res.status(400).json({
      message: "Unable to create order.",
      error: error.message,
    });
  }
};

const getOrders = async function (req, res) {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return res.status(500).json({ message: "Unable to fetch orders." });
  }
};

const getOrderById = async function (req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (
      req.user.role !== "admin" &&
      (!order.user || order.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return res.status(500).json({ message: "Unable to fetch order." });
  }
};

const updateOrderStatus = async function (req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const status =
      typeof req.body.status === "string" ? req.body.status.toLowerCase() : "";
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return res.status(500).json({ message: "Unable to update order status." });
  }
};

const myOrders = async function (req, res) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(orders);
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return res.status(500).json({ message: "Unable to fetch your orders." });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  myOrders,
};
