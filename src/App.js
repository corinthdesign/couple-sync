// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from './pages/Profile';
import LinkPartner from "./pages/LinkPartner";
import Settings from "./pages/Settings";
import Onboarding from './pages/Onboarding';
import RequireAuth from './components/RequireAuth';
import BottomNav from './components/BottomNav';
import SyncDashboard from './pages/SyncDashboard';
import Dashboard from './pages/Dashboard';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <RequireAuth>
            <SyncDashboard />
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

        <Route path="/" element={
          <RequireAuth>
            <SyncDashboard />
          </RequireAuth>
        }
        /> 

        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
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
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;