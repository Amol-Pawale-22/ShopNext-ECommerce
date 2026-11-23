const express = require('express');

const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const multer = require('multer');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controller/product.controller');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();
//all products - 
//This Is New Method For Product Routes
// router.route('/').get(getProducts).post(protect, admin, createProduct);

router.get('/', getProducts);
router.post('/', protect, admin, upload.single('image'), createProduct);

//specific product
//This is New Method For Product Routes
// router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);  

router.get('/:id',  getProductById);
router.put('/:id', protect, admin, upload.single('image'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);  








module.exports = router;


