import { NavLink } from 'react-router-dom';


export default function BottomNav() {


  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">
        <div><img alt="" height="15px" src="/logo512.png" /></div>
        <span>Sync Dashboard</span>
      </NavLink>
      <NavLink to="/" className="nav-item">
        <div><img alt="" height="15px" src="/icons/sliders-solid.svg" /></div>
        <span>My Metrics</span>
      </NavLink>
      <NavLink to="/link" className="nav-item">
        <div><img alt="" height="15px" src="/icons/heart-regular.svg" /></div>
        <span>My Partner</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <div><img alt="" height="15px" src="/icons/user-solid.svg" /></div>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
