// src/components/layout/ChefDepartementLayout.jsx
import { useState } from 'react';
import Header from '../chefdepartement/ChefDepartementHeader';
import ChefDepartementSidebar from '../chefdepartement/ChefDepartementSidebar';

export default function ChefDepartementLayout({ children, defaultActivePage }) {
  const [activePage, setActivePage] = useState(defaultActivePage);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 mx-auto">
      <Header isAdmin={false} />
      
      <div className="flex flex-1 overflow-hidden">
        <ChefDepartementSidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}