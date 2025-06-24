import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function BottomNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">
        <div>♾️</div>
        <span>Sync Dashboard</span>
      </NavLink>
      <NavLink to="/link" className="nav-item">
        <div>❤️</div>
        <span>My Partner</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <div>👤</div>
        <span>Profile</span>
      </NavLink>
      <button onClick={handleLogout} className="nav-item logout-button">
        <div>🚪</div>
        <span>Logout</span>
      </button>
    </nav>
  );
}
