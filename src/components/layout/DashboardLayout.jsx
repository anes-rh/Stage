// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

export default function DashboardLayout({ children, defaultActivePage }) {
  const [activePage, setActivePage] = useState(defaultActivePage);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 mx-auto">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}