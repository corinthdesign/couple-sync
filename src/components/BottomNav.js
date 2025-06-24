import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Home, PlusCircle } from 'lucide-react'; // optional icon set

export default function BottomNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        <NavItem to="/" icon={<Home size={24} />} active={location.pathname === '/'} label="Home" />
        <NavItem to="/profile" icon={<User size={24} />} active={location.pathname === '/profile'} label="Profile" />
        <NavItem
          to="/"
          icon={<PlusCircle size={28} />}
          onClick={() => window.scrollTo(0, document.body.scrollHeight)}
          label="Add"
        />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-600 hover:text-red-500"
        >
          <LogOut size={24} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex flex-col items-center ${active ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
