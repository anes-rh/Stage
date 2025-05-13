import { Search, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';
import logo from '../../assets/images/mobilis-logo.png';

export default function MembreDirectionHeader({ isAdmin = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nom: 'Membre', prenom: 'Direction' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Possibilité d'appeler une API de déconnexion
      // await authAPI.logout();
      
      // Supprimer les données d'authentification du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      
      // Attendre un peu pour afficher le statut de déconnexion
      setTimeout(() => {
        setIsLoggingOut(false);
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-2 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        <img src={logo} alt="Mobilis Logo" className="h-12 w-auto" />
        {isAdmin && (
          <span className="ml-3 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            Admin Panel
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
          />
        </div>
        
        {isAdmin && (
          <button className="relative p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        )}
        
        <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-green-600 transition-colors">
          <span className="text-white font-medium text-xs">{getInitials()}</span>
        </div>
        
        <button 
          className="text-gray-600 hover:text-red-500 transition-colors focus:outline-none relative"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Se déconnecter"
        >
          {isLoggingOut ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-t-red-500 border-r-red-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}