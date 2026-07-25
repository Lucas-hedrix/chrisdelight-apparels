import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { account, databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { Query } from 'appwrite';
import './Admin.css';

interface Product {
  $id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const user = await account.get();
        if (user.email !== 'admin@example.com') {
          navigate('/');
          return;
        }
        fetchProducts();
      } catch (error) {
        navigate('/login');
      }
    };
    checkAuthAndFetchData();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        [Query.limit(100)]
      );
      setProducts(response.documents as unknown as Product[]);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          id
        );
        setProducts(products.filter(p => p.$id !== id));
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Link to="/" className="btn-secondary">View Store</Link>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="admin-content">
        <div className="content-header">
          <h2>Products Catalog</h2>
          <div className="content-header-actions">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            <Link to="/admin/products/new" className="btn-primary btn-add-product">
              <Plus size={20} /> <span>Add New Product</span>
            </Link>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">No products found. Add one above!</td>
                </tr>
              ) : (
                products
                  .filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    product.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                  <tr key={product.$id}>
                    <td>
                      <img src={product.image} alt={product.name} className="admin-product-thumb" />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₦{product.price.toLocaleString()}</td>
                    <td className="action-cells">
                      <button 
                        onClick={() => handleDelete(product.$id)} 
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
