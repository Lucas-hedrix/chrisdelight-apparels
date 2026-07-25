import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { account, ID } from '../lib/appwrite';
import toast from 'react-hot-toast';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin) {
        // Sign Up
        await account.create(ID.unique(), email, password, name);
      }
      // Login (after sign up or if login mode)
      await account.createEmailPasswordSession(email, password);
      toast.success(isLogin ? 'Successfully logged in' : 'Account created successfully');
      
      // Where to redirect?
      // If admin, they probably know to go to /admin or we check their role.
      // For now, if they login successfully, redirect to home, or if they came from cart, to home (cart opens).
      // Let's redirect to home for now. If they are admin, they can navigate to /admin manually or we can add a link in header.
      // Wait, if they are 'admin@example.com', let's route them to /admin!
      if (email === 'admin@example.com') {
        navigate('/admin');
      } else {
        const from = location.state?.from || '/';
        navigate(from);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('password` param')) {
        toast.error('Password must be between 8 and 256 characters long.');
      } else {
        toast.error(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const UNSPLASH_IMAGES = [
    'https://images.unsplash.com/photo-1696962678565-bee84e6b9cb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8bmlnZXJpYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc4NTAwMDY1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1589199051916-92cd36b97ffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8bmlnZXJpYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc4NTAwMDY1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1661332306744-70f9ed1a7f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8N3x8bmlnZXJpYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc4NTAwMDY1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1641932156899-a9a319476799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTJ8fG5pZ2VyaWFuJTIwZmFzaGlvbnxlbnwwfHx8fDE3ODUwMDA2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % UNSPLASH_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-page">
      {/* Background Slideshow */}
      <div className="auth-slideshow">
        {UNSPLASH_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`auth-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-card-container">
        <div className="auth-card glassmorphism">
          <div className="auth-header">
            <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="auth-subtitle">{isLogin ? 'Welcome back to ChrisApparel.' : 'Join us for seamless checkout and more.'}</p>
          </div>
          
          <form onSubmit={handleAuth} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="you@example.com"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
