import { Home, UserPlus, Settings, FolderTree, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';

export default function AdminSidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: 'Admin', prenom: 'Admin' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await adminAPI.getCurrentUser();
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
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
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

      <nav className="flex-1 pt-2 overflow-y-auto">
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
                navigate('/admin/accueil');
              }}
            >
              <Home className={`h-4 w-4 ${activePage === 'accueil' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Tableau de bord</span>
            </button>
          </li>
          
          <li className="pt-1">
            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gestion des utilisateurs
            </div>
          </li>
          
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'creation-membre' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('creation-membre');
                navigate('/admin/creation-membre');
              }}
            >
              <UserPlus className={`h-4 w-4 ${activePage === 'creation-membre' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Création membre</span>
            </button>
          </li>
          
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'creation-encadreurs' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('creation-encadreurs');
                navigate('/admin/creation-encadreurs');
              }}
            >
              <UserPlus className={`h-4 w-4 ${activePage === 'creation-encadreurs' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Création encadreurs</span>
            </button>
          </li>
          
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'creation-chefdepartement' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('creation-chefdepartement');
                navigate('/admin/creation-chefdepartement');
              }}
            >
              <UserPlus className={`h-4 w-4 ${activePage === 'creation-chefdepartement' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Création chef dept.</span>
            </button>
          </li>
          
          <li className="pt-1">
            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organisation
            </div>
          </li>
          
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'departements-domaines' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('departements-domaines');
                navigate('/admin/departements-domaines');
              }}
            >
              <FolderTree className={`h-4 w-4 ${activePage === 'departements-domaines' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Départements & Domaines</span>
            </button>
          </li>
          
          <li className="pt-1">
            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Système
            </div>
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
                navigate('/admin/parametres');
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