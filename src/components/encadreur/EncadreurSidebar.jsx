import { BookOpen, Home, Settings,Users} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { encadreurAPI } from '../../utils/encadreurAPI';

export default function EncadreurSidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: 'Encadreur', prenom: 'Encadreur' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await encadreurAPI.getCurrentUser();
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
                navigate('/encadreur/accueil');
              }}
            >
              <Home className={`h-4 w-4 ${activePage === 'accueil' ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Accueil</span>
            </button>
          </li>
            <li>
  <button
    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
      activePage === 'stages-stagiaires' 
        ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
    onClick={() => {
      setActivePage('stages-stagiaires');
      navigate('/encadreur/stages-stagiaires');
    }}
  >
    <Users className={`h-4 w-4 ${activePage === 'stages-stagiaires' ? 'text-green-600' : 'text-gray-500'}`} />
    <span>Stages & Stagiaires</span>
  </button>
</li>
          <li>
  <button
    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
      activePage === 'fiches-pointage' 
        ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
    onClick={() => {
      setActivePage('fiches-pointage');
      navigate('/encadreur/fiches-pointage');
    }}
  >
    <BookOpen className={`h-4 w-4 ${activePage === 'fiches-pointage' ? 'text-green-600' : 'text-gray-500'}`} />
    <span>Fiches de pointage</span>
  </button>
</li>
<li>
  <button
    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
      activePage === 'Demandes-Depot-Memoire' 
        ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
    onClick={() => {
      setActivePage('Demandes-Depot-Memoire');
      navigate('/encadreur/Demandes-Depot-Memoire');
    }}
  >
    <BookOpen className={`h-4 w-4 ${activePage === 'Demandes-Depot-Memoire' ? 'text-green-600' : 'text-gray-500'}`} />
    <span>Demandes-Depot-Memoire</span>
  </button>
</li>


          <li>
  <button
    className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
      activePage === 'fiches-evaluation' 
        ? 'bg-green-50 text-green-700 font-medium shadow-sm' 
        : 'text-gray-700 hover:bg-gray-50'
    }`}
    onClick={() => {
      setActivePage('fiches-evaluation');
      navigate('/encadreur/fiches-evaluation');
    }}
  >
    <BookOpen className={`h-4 w-4 ${activePage === 'fiches-evaluation' ? 'text-green-600' : 'text-gray-500'}`} />
    <span>Fiches d'évaluation</span>
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
                navigate('/encadreur/parametres');
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