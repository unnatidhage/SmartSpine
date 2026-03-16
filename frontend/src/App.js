import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', fontFamily: 'var(--font-mono)', color: 'var(--accent)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
          <p>Loading SmartSpine AI…</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
