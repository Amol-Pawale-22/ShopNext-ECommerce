import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('image', image);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to add product.');
      }

      navigate('/admin/products');
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || 'Unable to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316' }}>Add Product</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
        <label style={labelStyle}>
          Name
          <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} required rows="4" style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Price
          <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Category
          <input name="category" value={form.category} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Stock
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Product image
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required style={inputStyle} />
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/admin/products')} style={{ background: '#3f3f46' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const containerStyle = { maxWidth: '700px', margin: '40px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
const formStyle = { display: 'grid', gap: '18px' };
const labelStyle = { display: 'grid', gap: '8px', color: '#d4d4d8' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #3f3f46', background: '#09090b', color: '#fafafa' };

export default AddProduct;
