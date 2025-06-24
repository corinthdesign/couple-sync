import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="bg-white border-b p-4 shadow-sm mb-6">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-600 font-medium hover:underline">Dashboard</Link>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline">Profile</Link>
          <Link to="/" onClick={() => window.scrollTo(0, document.body.scrollHeight)} className="text-blue-600 font-medium hover:underline">Add Metric</Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 font-medium hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
