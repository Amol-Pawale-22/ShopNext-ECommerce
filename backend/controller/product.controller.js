const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');




const getProducts = async function(req, res) {

    try{
         const products = await Product.find({});
         res.json(products);


    }catch(error){
        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        })  
    }
};


const getProductById = async function(req, res) {

    try{
        const product = await Product.findById(req.params.id);
         if(product){
            res.json(product);
         }  else{
            res.status(404).json({
                message: "Product not found"
            })
         }

    }catch(error){
        res.status(500).json({
            message: "Error fetching product by ID"
         
        })  
    }

};

const createProduct = async function(req, res) {
   try{ const { name, description, price, category, stock } = req.body;

    let imageUrl = '';

   if(req.file){
    const result = await cloudinary.uploader.upload(req.file.path);
    
    imageUrl = result.secure_url;

   }

   const product = new Product({
    name,
    description,
    price,
    category,
    stock,
    imageUrl
   });

   const saveProduct = await product.save();
   res.status(201).json(saveProduct);   


   }catch(error){
    res.status(500).json({
        message: "Error creating product",
        error: error.message

    })
   }

};


const updateProduct = async function(req, res){

    try{
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if(product){
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path);
            product.imageUrl = result.secure_url;
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } 
    else{
        res.status(404).json({
            message: "Product not found"
        })
    }

    }catch(error){
        res.status(500).json({
            message: "Error updating product"
            
        })
    }
};

const deleteProduct = async function(req, res){
    try{
        const product = await Product.findByIdAndDelete(req.params.id);

        if(product){
            await product.deleteOne();
            res.json({
                message: "Product deleted successfully"
            });
        } else{
            res.status(404).json({
                message: "Product not found"
            });
        }

    }catch(error){
        res.status(500).json({
            message: "Error deleting product"
        })
    }
};


module.exports = {
    getProducts,
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct
};