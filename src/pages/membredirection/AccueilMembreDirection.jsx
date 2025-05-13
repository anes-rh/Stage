import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Award
} from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

export default function AccueilMembreDirection() {
  const [membre, setMembre] = useState(null);
  const [statistiques, setStatistiques] = useState({
    demandesDeStage: {
      total: 0,
      enAttente: 0,
      acceptees: 0,
      refusees: 0
    },
    demandesAccord: {
      total: 0,
      enAttente: 0,
      enCours: 0,
      acceptees: 0,
      refusees: 0
    },
    conventions: {
      total: 0,
      enAttente: 0,
      acceptees: 0,
      refusees: 0
    },
    stages: {
      total: 0,
      enCours: 0,
      termines: 0,
      annules: 0,
      enAttente: 0,
      prolonges: 0
    },
    attestations: {
      total: 0,
      delivrees: 0,
      nonDelivrees: 0
    },
    totalStagiaires: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setMembre(userData);
    
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        const data = await membreDirectionAPI.getStatistiques();
        
        setStatistiques({
          demandesDeStage: {
            total: data.demandesDeStage?.total || 0,
            enAttente: data.demandesDeStage?.enAttente || 0,
            acceptees: data.demandesDeStage?.acceptees || 0,
            refusees: data.demandesDeStage?.refusees || 0
          },
          demandesAccord: {
            total: data.demandesAccord?.total || 0,
            enAttente: data.demandesAccord?.enAttente || 0,
            enCours: data.demandesAccord?.enCours || 0,
            acceptees: data.demandesAccord?.acceptees || 0,
            refusees: data.demandesAccord?.refusees || 0
          },
          conventions: {
            total: data.conventions?.total || 0,
            enAttente: data.conventions?.enAttente || 0,
            acceptees: data.conventions?.acceptees || 0,
            refusees: data.conventions?.refusees || 0
          },
          stages: {
            total: data.stages?.total || 0,
            enCours: data.stages?.enCours || 0,
            termines: data.stages?.termines || 0,
            annules: data.stages?.annules || 0,
            enAttente: data.stages?.enAttente || 0,
            prolonges: data.stages?.prolonges || 0
          },
          attestations: {
            total: data.attestations?.total || 0,
            delivrees: data.attestations?.delivrees || 0,
            nonDelivrees: data.attestations?.nonDelivrees || 0
          },
          totalStagiaires: data.totalStagiaires || 0
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
    <MembreDirectionLayout defaultActivePage="accueil">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de bord membre de direction
          {membre && <span className="ml-2 text-lg font-normal text-gray-500">| Bienvenue, {membre.prenom} {membre.nom}</span>}
        </h1>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord de membre de direction de Mobilis Stage</p>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Stagiaires</p>
                <h3 className="text-3xl font-bold">{statistiques.totalStagiaires}</h3>
                <p className="text-sm text-blue-600 mt-1">
                  <Users className="inline h-4 w-4 mr-1" />
                  Total des stagiaires
                </p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <Users />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Demandes de stage</p>
                <h3 className="text-3xl font-bold">{statistiques.demandesDeStage.total}</h3>
                <p className="text-sm text-yellow-600 mt-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  {statistiques.demandesDeStage.enAttente} en attente
                </p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <FileText />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Conventions</p>
                <h3 className="text-3xl font-bold">{statistiques.conventions.total}</h3>
                <p className="text-sm text-purple-600 mt-1">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  {statistiques.conventions.acceptees} acceptées
                </p>
              </div>
              <div className="bg-purple-500 text-white p-3 rounded-lg">
                <Briefcase />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Attestations</p>
                <h3 className="text-3xl font-bold">{statistiques.attestations.total}</h3>
                <p className="text-sm text-green-600 mt-1">
                  <Award className="inline h-4 w-4 mr-1" />
                  {statistiques.attestations.delivrees} délivrées
                </p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <Award />
              </div>
            </div>
          </div>
          
          {/* Détails des stages */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
          
          {/* Détails des demandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Demandes de stage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{statistiques.demandesDeStage.total}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">En attente</p>
                  <p className="text-xl font-bold text-yellow-600">{statistiques.demandesDeStage.enAttente}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Acceptées</p>
                  <p className="text-xl font-bold text-green-600">{statistiques.demandesDeStage.acceptees}</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Refusées</p>
                  <p className="text-xl font-bold text-red-600">{statistiques.demandesDeStage.refusees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Demandes d'accord</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{statistiques.demandesAccord.total}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">En attente</p>
                  <p className="text-xl font-bold text-yellow-600">{statistiques.demandesAccord.enAttente}</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">En cours</p>
                  <p className="text-xl font-bold text-blue-600">{statistiques.demandesAccord.enCours}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Acceptées</p>
                  <p className="text-xl font-bold text-green-600">{statistiques.demandesAccord.acceptees}</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Refusées</p>
                  <p className="text-xl font-bold text-red-600">{statistiques.demandesAccord.refusees}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conventions et Attestations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Conventions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{statistiques.conventions.total}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">En attente</p>
                  <p className="text-xl font-bold text-yellow-600">{statistiques.conventions.enAttente}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Acceptées</p>
                  <p className="text-xl font-bold text-green-600">{statistiques.conventions.acceptees}</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Refusées</p>
                  <p className="text-xl font-bold text-red-600">{statistiques.conventions.refusees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Attestations</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{statistiques.attestations.total}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Délivrées</p>
                  <p className="text-xl font-bold text-green-600">{statistiques.attestations.delivrees}</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">Non délivrées</p>
                  <p className="text-xl font-bold text-yellow-600">{statistiques.attestations.nonDelivrees}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </MembreDirectionLayout>
  );
}