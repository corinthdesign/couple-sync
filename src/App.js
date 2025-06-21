// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import LinkPartner from "./pages/LinkPartner";
import Settings from "./pages/Settings";
import Onboarding from './pages/Onboarding';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
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

        <Route path="/onboarding" element={
         <RequireAuth>
            <Onboarding />
        </RequireAuth>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;