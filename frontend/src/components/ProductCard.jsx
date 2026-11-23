import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty: 1,
    }));
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-info">
        <div>
          <h3>
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          <p style={{ color: '#a1a1aa', marginBottom: '8px' }}>{product.category}</p>
          <p className="price">₹{Number(product.price).toFixed(2)}</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={handleAddToCart}
          disabled={Number(product.stock) <= 0}
        >
          {Number(product.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
