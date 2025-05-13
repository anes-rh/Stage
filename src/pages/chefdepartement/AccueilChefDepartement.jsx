import { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import ChefDepartementLayout from '../../components/layout/ChefDepartementLayout';
import { chefdepartementAPI } from '../../utils/chefdepartementAPI';
import { useNavigate } from 'react-router-dom';

export default function AccueilChefDepartement() {
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [statistiques, setStatistiques] = useState({
    totalEncadreurs: 0,
    encadreursDisponibles: 0,
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
    totalDemandesAccord: 0,
    demandesAccord: {
      total: 0,
      enAttente: 0,
      approuvees: 0,
      rejetees: 0
    },
    nomDepartement: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setChef(userData);
    
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        const data = await chefdepartementAPI.getStatistiques();
        
        setStatistiques({
          totalEncadreurs: data.totalEncadreurs || 0,
          encadreursDisponibles: data.encadreursDisponibles || 0,
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
          totalDemandesAccord: data.totalDemandesAccord || 0,
          demandesAccord: {
            total: data.demandesAccord?.total || 0,
            enAttente: data.demandesAccord?.enAttente || 0,
            approuvees: data.demandesAccord?.approuvees || 0,
            rejetees: data.demandesAccord?.rejetees || 0
          },
          nomDepartement: data.nomDepartement || 'Non spécifié'
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

  const handleTraiterDemandes = () => {
    navigate('/chefdepartement/demandes-accord1');
  };

  return (
    <ChefDepartementLayout defaultActivePage="accueil">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de bord chef de département
          {chef && <span className="ml-2 text-lg font-normal text-gray-500">| Bienvenue, {chef.prenom} {chef.nom}</span>}
        </h1>
        <p className="text-gray-600">
          Bienvenue sur votre tableau de bord de chef du département {statistiques.nomDepartement}
        </p>
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
              <p className="text-gray-500 text-sm mb-1">Encadreurs</p>
              <h3 className="text-3xl font-bold">{statistiques.totalEncadreurs}</h3>
              <p className="text-sm text-green-600 mt-1">
                <Users className="inline h-4 w-4 mr-1" />
                {statistiques.encadreursDisponibles} disponibles
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Users />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stagiaires</p>
              <h3 className="text-3xl font-bold">{statistiques.totalStagiaires}</h3>
              <p className="text-sm text-blue-600 mt-1">
                <Users className="inline h-4 w-4 mr-1" />
                {statistiques.stagiairesActifs} actifs
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
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
              <p className="text-gray-500 text-sm mb-1">Demandes d'accord</p>
              <h3 className="text-3xl font-bold">{statistiques.demandesAccord.total}</h3>
              <p className="text-sm text-yellow-600 mt-1">
                <FileText className="inline h-4 w-4 mr-1" />
                {statistiques.demandesAccord.enAttente} en attente
              </p>
            </div>
            <div className="bg-amber-500 text-white p-3 rounded-lg">
              <FileText />
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistiques des demandes d'accord */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Détails des demandes d'accord</h3>
          <div className="flex flex-wrap justify-around">
            <div className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-500 mr-1" />
              </div>
              <p className="text-gray-500 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-500">{statistiques.demandesAccord.enAttente}</p>
            </div>
            <div className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
              </div>
              <p className="text-gray-500 text-sm">Approuvées</p>
              <p className="text-2xl font-bold text-green-500">{statistiques.demandesAccord.approuvees}</p>
            </div>
            <div className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-500 mr-1" />
              </div>
              <p className="text-gray-500 text-sm">Rejetées</p>
              <p className="text-2xl font-bold text-red-500">{statistiques.demandesAccord.rejetees}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className="bg-green-500 h-2 rounded-l-full" 
                style={{ width: `${statistiques.demandesAccord.total > 0 ? (statistiques.demandesAccord.approuvees / statistiques.demandesAccord.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Taux d'approbation: {statistiques.demandesAccord.total > 0 ? Math.round((statistiques.demandesAccord.approuvees / statistiques.demandesAccord.total) * 100) : 0}%</span>
              <span>Total: {statistiques.demandesAccord.total}</span>
            </div>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button 
              className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition flex items-center justify-center"
              onClick={handleTraiterDemandes}
            >
              <FileText className="h-4 w-4 mr-2" />
              Traiter les demandes d'accord
            </button>
          </div>
          
          {/* Alertes */}
          {(statistiques.demandesAccord.enAttente > 0 || statistiques.stages.enAttente > 0) && (
            <div className="mt-6">
              <h3 className="font-bold text-sm mb-3">Alertes</h3>
              <div className="space-y-2">
                {statistiques.demandesAccord.enAttente > 0 && (
                  <div className="flex items-start p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
                    <div className="flex-1">{statistiques.demandesAccord.enAttente} demande(s) d'accord en attente</div>
                    <Clock className="h-4 w-4" />
                  </div>
                )}
                {statistiques.stages.enAttente > 0 && (
                  <div className="flex items-start p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                    <div className="flex-1">{statistiques.stages.enAttente} stage(s) en attente</div>
                    <Clock className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ChefDepartementLayout>
  );
}