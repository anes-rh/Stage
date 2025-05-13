import { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { encadreurAPI } from '../../utils/encadreurAPI';

export default function AccueilEncadreur() {
  const [encadreur, setEncadreur] = useState(null);
  const [statistiques, setStatistiques] = useState({
    totalStagiaires: 0,
    stagiairesActifs: 0,
    stages: {
      total: 0,
      enCours: 0,
      termines: 0,
      annules: 0,
      enAttente: 0,
      prolonges: 0
    },
    maxStagiaires: 0,
    estDisponible: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setEncadreur(userData);
    
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        const data = await encadreurAPI.getStatistiques();
        
        setStatistiques({
          totalStagiaires: data.totalStagiaires || 0,
          stagiairesActifs: data.stagiairesActifs || 0,
          stages: {
            total: data.stages?.total || 0,
            enCours: data.stages?.enCours || 0,
            termines: data.stages?.termines || 0,
            annules: data.stages?.annules || 0,
            enAttente: data.stages?.enAttente || 0,
            prolonges: data.stages?.prolonges || 0
          },
          maxStagiaires: data.maxStagiaires || 0,
          estDisponible: data.estDisponible
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
    <EncadreurLayout defaultActivePage="accueil">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de bord encadreur
          {encadreur && <span className="ml-2 text-lg font-normal text-gray-500">| Bienvenue, {encadreur.prenom} {encadreur.nom}</span>}
        </h1>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord d'encadreur de Mobilis Stage</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Chargement des statistiques...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stagiaires</p>
              <h3 className="text-3xl font-bold">{statistiques.totalStagiaires}</h3>
              <p className="text-sm text-green-600 mt-1">
                <Users className="inline h-4 w-4 mr-1" />
                {statistiques.stagiairesActifs} actifs
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {statistiques.maxStagiaires} stagiaires
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total des stages</p>
              <h3 className="text-3xl font-bold">{statistiques.stages.total}</h3>
              <p className="text-sm text-blue-600 mt-1">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Tous les stages
              </p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <Briefcase />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stages en cours</p>
              <h3 className="text-3xl font-bold">{statistiques.stages.enCours}</h3>
              <p className="text-sm text-green-600 mt-1">
                <Clock className="inline h-4 w-4 mr-1" />
                En cours
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <Clock />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stages terminés</p>
              <h3 className="text-3xl font-bold">{statistiques.stages.termines}</h3>
              <p className="text-sm text-blue-600 mt-1">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Terminés
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <CheckCircle />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-4">
            <h3 className="text-lg font-semibold mb-3">Détails des statuts de stage</h3>
            <div className="flex flex-wrap justify-around">
              <div className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-500 mr-1" />
                </div>
                <p className="text-gray-500 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-500">{statistiques.stages.enAttente}</p>
              </div>
              <div className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-green-500 mr-1" />
                </div>
                <p className="text-gray-500 text-sm">En cours</p>
                <p className="text-2xl font-bold text-green-500">{statistiques.stages.enCours}</p>
              </div>
              <div className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-1" />
                </div>
                <p className="text-gray-500 text-sm">Terminés</p>
                <p className="text-2xl font-bold text-blue-500">{statistiques.stages.termines}</p>
              </div>
              <div className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-5 w-5 text-red-500 mr-1" />
                </div>
                <p className="text-gray-500 text-sm">Annulés</p>
                <p className="text-2xl font-bold text-red-500">{statistiques.stages.annules}</p>
              </div>
              <div className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-purple-500 mr-1" />
                </div>
                <p className="text-gray-500 text-sm">Prolongés</p>
                <p className="text-2xl font-bold text-purple-500">{statistiques.stages.prolonges}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </EncadreurLayout>
  );
}