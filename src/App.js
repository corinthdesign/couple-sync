// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from './pages/Profile';
import LinkPartner from "./pages/LinkPartner";
import Settings from "./pages/Settings";
import Onboarding from './pages/Onboarding';
import RequireAuth from './components/RequireAuth';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <div className="pb-20"> {/* Prevent content from being hidden behind bottom nav */}
      <Routes>
        <Route path="/" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } 
        />
        <Route path="/login" element={
          <Login />
          } 
        />
        <Route path="/settings" element={ 
          <RequireAuth>
            <Settings />
          </RequireAuth>
        } 
        />
        <Route path="/link" element={
          <RequireAuth>
            <LinkPartner />
          </RequireAuth>
        }
        />

        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
        /> 

        <Route path="/onboarding" element={
         <RequireAuth>
            <Onboarding />
        </RequireAuth>
        
  }
/>
      </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;