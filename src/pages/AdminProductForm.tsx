import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, storage, APPWRITE_CONFIG } from '../lib/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';
import './AdminProductForm.css';

const CATEGORIES_MAP: Record<string, string[]> = {
  'Fabric': ['Wrappers'],
  'Casual wears': ['T-Shirts', 'Joggers', 'Jeans'],
  'Corporate wear': ['French suits', 'Ties', 'Suits', 'Coats'],
  'Sewn wears': [],
  'Shoes': []
};

const MAIN_CATEGORIES = Object.keys(CATEGORIES_MAP);

const AdminProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(MAIN_CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState(CATEGORIES_MAP[MAIN_CATEGORIES[0]][0] || '');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [newArrivalDuration, setNewArrivalDuration] = useState('7');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Quick auth check
    account.get().catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image file');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload image to Storage Bucket
      const fileUpload = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        ID.unique(),
        imageFile
      );

      // 2. Get file preview URL
      const imageUrl = storage.getFilePreview(
        APPWRITE_CONFIG.bucketId,
        fileUpload.$id
      ).toString();

      // 3. Save product to Database
      const availableSizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
      const availableColors = colors.split(',').map(c => c.trim()).filter(Boolean);

      let newArrivalExpiresAt = null;
      if (isNewArrival) {
        const days = parseInt(newArrivalDuration);
        if (!isNaN(days)) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + days);
          newArrivalExpiresAt = expiryDate.toISOString();
        }
      }

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        ID.unique(),
        {
          name,
          price: parseFloat(price),
          category,
          subCategory,
          image: imageUrl,
          availableSizes,
          availableColors,
          ...(newArrivalExpiresAt && { newArrivalExpiresAt })
        }
      );

      toast.success('Product created successfully');
      // 4. Redirect back to admin dashboard
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-card">
        <h2>Add New Product</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price (₦)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select 
              value={category} 
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                setSubCategory(CATEGORIES_MAP[newCat][0] || '');
              }}
            >
              {MAIN_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {CATEGORIES_MAP[category].length > 0 && (
            <div className="form-group">
              <label>Sub Category</label>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                {CATEGORIES_MAP[category].map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Available Sizes (comma separated)</label>
            <input 
              type="text" 
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="e.g. S, M, L, XL"
              required
            />
          </div>

          <div className="form-group">
            <label>Available Colors (comma separated)</label>
            <input 
              type="text" 
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Red, Blue, Black"
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              required
            />
          </div>

          <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="checkbox" 
              id="isNewArrival"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="isNewArrival" style={{ marginBottom: 0 }}>Mark as New Arrival</label>
          </div>

          {isNewArrival && (
            <div className="form-group">
              <label>New Arrival Duration (Days)</label>
              <select 
                value={newArrivalDuration} 
                onChange={(e) => setNewArrivalDuration(e.target.value)}
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
