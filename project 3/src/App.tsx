import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initDB } from './db/database';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Receipt from './pages/Receipt';
import History from './pages/History';
import Catalogue from './pages/Catalogue';
import Settings from './pages/Settings';

export default function App() {
  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="billing" element={<Billing />} />
          <Route path="receipt/:billId" element={<Receipt />} />
          <Route path="history" element={<History />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="shop" element={<Navigate to="/catalogue" replace />} />
          <Route path="shop/settings" element={<Navigate to="/settings" replace />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
