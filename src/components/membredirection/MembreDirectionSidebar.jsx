import { Home, UserPlus, Settings, FileText, FilePlus, FileCheck, FileSignature, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

export default function MembreDirectionSidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: 'Direction', prenom: 'Membre' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await membreDirectionAPI.getCurrentUser();
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
                navigate('/membredirection/accueil');
              }}
            >
              <Home className={`h-4 w-4 ${activePage === 'accueil' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Tableau de bord</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'creation-stagiaires' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('creation-stagiaires');
                navigate('/membredirection/creation-stagiaires'); 
              }}
            >
              <UserPlus className={`h-4 w-4 ${activePage === 'creation-stagiaires' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Création stagiaires</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'creation-demandes-stage' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('creation-demandes-stage');
                navigate('/membredirection/creation-demandes-stage');
              }}
            >
              <FilePlus className={`h-4 w-4 ${activePage === 'creation-demandes-stage' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Création Demandes de stage</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'demandes-stage' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('demandes-stage');
                navigate('/membredirection/demandes-stage');
              }}
            >
              <FileText className={`h-4 w-4 ${activePage === 'demandes-stage' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Demandes de stage</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'demandes-accord' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('demandes-accord');
                navigate('/membredirection/demandes-accord');
              }}
            >
              <FileCheck className={`h-4 w-4 ${activePage === 'demandes-accord' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Demandes d'accord</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePage === 'conventions' 
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActivePage('conventions');
                navigate('/membredirection/conventions');
              }}
            >
              <FileSignature className={`h-4 w-4 ${activePage === 'conventions' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Conventions</span>
            </button>
          </li>
          <li>
  <button
    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
      activePage === 'stages' 
        ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
    onClick={() => {
      setActivePage('stages');
      navigate('/membredirection/stages');
    }}
  >
    <BookOpen className={`h-4 w-4 ${activePage === 'stages' ? 'text-green-600' : 'text-gray-500'}`} />
    <span>Stages</span>
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
                navigate('/membredirection/parametres');
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