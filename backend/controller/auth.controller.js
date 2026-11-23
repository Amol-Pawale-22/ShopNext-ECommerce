const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports.registerUser = async function (req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000);

      const message = `Wecome to ShopNext, ${name}!
          Thank you for registering with us . Your OTP for ShopNext is: ${otp}`;

      await sendEmail(email, "Welcome to ShopNext - OTP Verification", message);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: "User registered successfully. OTP sent to email.",
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

//  Login User

module.exports.loginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: "User logged in successfully",
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error logging in user",
      error: error.message,
    });
  }
};

module.exports.getUser = async function (req, res) {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);

    module.exports.loginUser = async function (req, res) {
      const { email, password } = req.body;

      try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          message: "User logged in successfully",
        });
      } catch (error) {
        return res.status(500).json({
          message: "Error logging in user",
          error: error.message,
        });
      }
    };
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// module.exports.logoutUser = function (req, res) {
//     res.send("User Logged Out From Controllers");
// }
