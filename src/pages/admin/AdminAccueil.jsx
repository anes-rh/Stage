// src/pages/admin/AdminAccueil.jsx
import { useState, useEffect } from 'react';
import { Users, UserCheck, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminAPI } from '../../utils/api';

export default function AdminAccueil() {
  const [admin, setAdmin] = useState(null);
  const [statistiques, setStatistiques] = useState({
    membreDirection: { total: 0, actifs: 0 },
    encadreur: { total: 0, actifs: 0 },
    chefDepartement: { total: 0, actifs: 0 },
    stagiaire: { total: 0, actifs: 0 },
    totalUtilisateurs: 0,
    totalUtilisateursActifs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Get admin user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setAdmin(userData);
    
    // Fetch statistics data from API
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getStatistiques();
        
        // Normalisation des données pour correspondre à notre structure
        setStatistiques({
          membreDirection: {
            total: data.membreDirection?.total || 0,
            actifs: data.membreDirection?.actifs || 0
          },
          encadreur: {
            total: data.encadreur?.total || 0,
            actifs: data.encadreur?.actifs || 0
          },
          chefDepartement: {
            total: data.chefDepartement?.total || 0,
            actifs: data.chefDepartement?.actifs || 0
          },
          stagiaire: {
            total: data.stagiaire?.total || 0,
            actifs: data.stagiaire?.actifs || 0
          },
          totalUtilisateurs: data.totalUtilisateurs || 0,
          totalUtilisateursActifs: data.totalUtilisateursActifs || 0
        });
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistiques();
  }, []);

  return (
    <AdminLayout defaultActivePage="accueil">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de bord administrateur
          {admin && <span className="ml-2 text-lg font-normal text-gray-500">| Bienvenue, {admin.prenom} {admin.nom}</span>}
        </h1>
        <p className="text-gray-600">Bienvenue sur le tableau de bord d'administration de Mobilis Stage</p>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-8">Chargement des statistiques...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Membres de direction */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Membres de direction</p>
              <h3 className="text-3xl font-bold">{statistiques.membreDirection.total}</h3>
              <p className="text-sm text-green-600 mt-1">
                <UserCheck className="inline h-4 w-4 mr-1" />
                {statistiques.membreDirection.actifs} actifs
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          {/* Chefs de département */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Chefs de département</p>
              <h3 className="text-3xl font-bold">{statistiques.chefDepartement.total}</h3>
              <p className="text-sm text-green-600 mt-1">
                <UserCheck className="inline h-4 w-4 mr-1" />
                {statistiques.chefDepartement.actifs} actifs
              </p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          {/* Encadreurs */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Encadreurs</p>
              <h3 className="text-3xl font-bold">{statistiques.encadreur.total}</h3>
              <p className="text-sm text-green-600 mt-1">
                <UserCheck className="inline h-4 w-4 mr-1" />
                {statistiques.encadreur.actifs} actifs
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          {/* Stagiaires */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stagiaires</p>
              <h3 className="text-3xl font-bold">{statistiques.stagiaire.total}</h3>
              <p className="text-sm text-green-600 mt-1">
                <UserCheck className="inline h-4 w-4 mr-1" />
                {statistiques.stagiaire.actifs} actifs
              </p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          {/* Statistique totale */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-4">
            <h3 className="text-lg font-semibold mb-3">Statistiques globales</h3>
            <div className="flex flex-wrap justify-around">
              <div className="text-center p-4">
                <p className="text-gray-500 text-sm">Total des utilisateurs</p>
                <p className="text-2xl font-bold">{statistiques.totalUtilisateurs}</p>
              </div>
              <div className="text-center p-4">
                <p className="text-gray-500 text-sm">Utilisateurs actifs</p>
                <p className="text-2xl font-bold text-green-600">{statistiques.totalUtilisateursActifs}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}