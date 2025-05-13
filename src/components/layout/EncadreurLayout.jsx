// src/components/layout/EncadreurLayout.jsx
import { useState } from 'react';
import Header from '../encadreur/EncadreurHeader';
import EncadreurSidebar from '../encadreur/EncadreurSidebar';

export default function EncadreurLayout({ children, defaultActivePage }) {
  const [activePage, setActivePage] = useState(defaultActivePage);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 mx-auto">
      <Header isAdmin={false} />
      
      <div className="flex flex-1 overflow-hidden">
        <EncadreurSidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}