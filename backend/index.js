const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("../backend/routes/order.routes");
const paymentRoutes = require("../backend/routes/payment.routes");
const analyticRoutes = require("../backend/routes/analytic.routes");

dotenv.config();

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//This is for Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
//This Is For Product Routes
app.use("/api/products", productRoutes);
app.use("/products", productRoutes);

//This is for Order Routes
app.use("/api/orders", orderRoutes);
app.use("/orders", orderRoutes);

//This is for Payment Routes
app.use("/api/payment", paymentRoutes);
app.use("/payment", paymentRoutes);

//This is for analytics Routes
app.use("/api/analytics", analyticRoutes);
app.use("/analytics", analyticRoutes);

// app.get('/', function(req,res){
// res.send("Hello from ShopNext Backend");
// });

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("ShopNest API is running in Development mode...");
  });
}

app.listen(5000, function () {
  console.log("Server is running on port 5000");
});
