import { useState } from 'react';
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <p>{isLogin ? 'Welcome back to ChrisApparel.' : 'Join us for seamless checkout and more.'}</p>
        
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
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
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
