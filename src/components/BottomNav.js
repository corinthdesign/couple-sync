import { NavLink } from 'react-router-dom';


export default function BottomNav() {


  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">
        <div><img alt="" height="10px" src="/logo512.png" /></div>
        <span>Sync Dashboard</span>
      </NavLink>
      <NavLink to="/" className="nav-item">
        <div>♾️</div>
        <span>My Metrics</span>
      </NavLink>
      <NavLink to="/link" className="nav-item">
        <div>❤️</div>
        <span>My Partner</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <div>👤</div>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
