const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser } = require("../controller/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { admin } = require("../middleware/admin.middleware");


router.post('/register', registerUser);
router.post('/login', loginUser);   
router.get('/users', protect, admin, getUser);






module.exports = router;