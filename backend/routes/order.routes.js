const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");
const { createOrder, getOrders, getOrderById, updateOrderStatus, myOrders } = require("../controller/order.controller");



const router = express.Router();

router.post("/", protect, createOrder);

router.get("/myorders", protect, myOrders );
router.get("/", protect, admin, getOrders); 
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);


module.exports = router;
