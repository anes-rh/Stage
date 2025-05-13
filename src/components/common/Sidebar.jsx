// src/components/common/Sidebar.jsx
import { Home, FileText, Clock, ClipboardList, Book, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { stagiaireAPI } from '../../utils/stagiaireAPI';

export default function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: 'Stagiaire', prenom: 'Stagiaire' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await stagiaireAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      }
    };

    fetchUserData();
  }, []);

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;
  };

  // Obtenir le nom d'affichage
  const getDisplayName = () => {
    return `${user.prenom.charAt(0)}. ${user.nom}`;
  };

  return (
    <aside className="w-48 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-medium text-xs">{getInitials()}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">{getDisplayName()}</div>
            <div className="text-xs font-medium text-green-500 flex items-center">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></span>
              En ligne
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 pt-2">
        <ul className="space-y-1 px-2">
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'accueil' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('accueil');
                navigate('/stagiaire/accueil');
              }}
            >
              <Home className={`h-4 w-4 ${activePage === 'accueil' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Accueil</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'documents' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('documents');
                navigate('/stagiaire/documents');
              }}
            >
              <FileText className={`h-4 w-4 ${activePage === 'documents' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Mes documents</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'suivi' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('suivi');
                navigate('/stagiaire/suivi');
              }}
            >
              <Clock className={`h-4 w-4 ${activePage === 'suivi' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Suivi de stage</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'evaluations' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('evaluations');
                navigate('/stagiaire/evaluations');
              }}
            >
              <ClipboardList className={`h-4 w-4 ${activePage === 'evaluations' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Évaluations</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'memoire' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('memoire');
                navigate('/stagiaire/memoire');
              }}
            >
              <Book className={`h-4 w-4 ${activePage === 'memoire' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Mémoire</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'parametres' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('parametres');
                navigate('/stagiaire/parametres');
              }}
            >
              <Settings className={`h-4 w-4 ${activePage === 'parametres' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Paramètres</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}