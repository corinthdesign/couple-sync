// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Link from "./pages/Link";
import Settings from "./pages/Settings";
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } 
        />
        <Route path="/Login" element={
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
            <Link />
          </RequireAuth>
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;