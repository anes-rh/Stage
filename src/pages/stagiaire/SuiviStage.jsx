import { useState, useEffect } from 'react';
import { Calendar, Building, Briefcase, Mail, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, BookOpen, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { stageAPI } from '../../utils/stageAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { departementApi } from '../../services/departementApi';
import { themesAPI } from '../../utils/ThemeApi';
import { stagiaireAPI } from '../../utils/stagiaireAPI';

export default function SuiviStage() {
  const [stage, setStage] = useState(null);
  const [encadreur, setEncadreur] = useState(null);
  const [departement, setDepartement] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStageInfo = async () => {
      try {
        setLoading(true);
        setError('');
        
        const currentStagiaire = await stagiaireAPI.getCurrentUser();
        
        if (!currentStagiaire || !currentStagiaire.id) {
          throw new Error("Impossible de récupérer les informations du stagiaire connecté");
        }
        
        if (currentStagiaire.stageId) {
          const currentStage = await stageAPI.getStage(currentStagiaire.stageId);
          
          if (currentStage) {
            setStage(currentStage);
            
            const promises = [];
            
            if (currentStage.encadreurId) {
              promises.push(
                encadreurAPI.getEncadreur(currentStage.encadreurId)
                  .then(encadreurData => setEncadreur(encadreurData))
                  .catch(err => console.error("Erreur lors de la récupération de l'encadreur:", err))
              );
            }
            
            if (currentStage.departementId) {
              promises.push(
                departementApi.getDepartement(currentStage.departementId)
                  .then(departementData => setDepartement(departementData))
                  .catch(err => console.error("Erreur lors de la récupération du département:", err))
              );
            }
            
            promises.push(
              themesAPI.getAllThemes()
                .then(themes => {
                  const stageTheme = themes.find(t => t.stageId === currentStage.id);
                  setTheme(stageTheme);
                })
                .catch(err => console.error("Erreur lors de la récupération des thèmes:", err))
            );
            
            await Promise.allSettled(promises);
          } else {
            console.error("Aucun stage trouvé avec l'ID:", currentStagiaire.stageId);
          }
        } else {
          const allStages = await stageAPI.getAllStages();
          
          const foundStage = allStages.find(s => {
            if (s.stagiaireId === currentStagiaire.id) return true;
            
            if (s.stagiaires && Array.isArray(s.stagiaires)) {
              return s.stagiaires.some(stagiaire => stagiaire.id === currentStagiaire.id);
            }
            
            return false;
          });
          
          if (foundStage) {
            setStage(foundStage);
            
            const promises = [];
            
            if (foundStage.encadreurId) {
              promises.push(
                encadreurAPI.getEncadreur(foundStage.encadreurId)
                  .then(encadreurData => setEncadreur(encadreurData))
                  .catch(err => console.error("Erreur lors de la récupération de l'encadreur:", err))
              );
            }
            
            if (foundStage.departementId) {
              promises.push(
                departementApi.getDepartement(foundStage.departementId)
                  .then(departementData => setDepartement(departementData))
                  .catch(err => console.error("Erreur lors de la récupération du département:", err))
              );
            }
            
            promises.push(
              themesAPI.getAllThemes()
                .then(themes => {
                  const stageTheme = themes.find(t => t.stageId === foundStage.id);
                  setTheme(stageTheme);
                })
                .catch(err => console.error("Erreur lors de la récupération des thèmes:", err))
            );
            
            await Promise.allSettled(promises);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des informations du stage:", err);
        setError(typeof err === 'string' ? err : err.message || "Une erreur est survenue lors du chargement des informations du stage.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStageInfo();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'EnAttente':
      case 0:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> };
      case 'EnCours':
      case 1:
        return { label: 'En cours', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'Termine':
      case 2:
        return { label: 'Terminé', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'Annule':
      case 3:
        return { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> };
      case 'Prolonge':
      case 4:
        return { label: 'Prolongé', color: 'bg-purple-100 text-purple-800', icon: <ChevronRight className="h-4 w-4 mr-1" /> };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  if (loading) {
    return (
      <DashboardLayout defaultActivePage="suiviStage">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des informations du stage...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout defaultActivePage="suiviStage">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stage) {
    return (
      <DashboardLayout defaultActivePage="suiviStage">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>Aucun stage en cours n'a été trouvé pour votre compte.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = getStatusDisplay(stage.statut);

  return (
    <DashboardLayout defaultActivePage="suiviStage">
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Suivi de Stage</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center mb-6">
              <div className="h-10 w-1 bg-green-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-gray-800">Résumé du stage</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de début</p>
                    <div className="flex items-center text-gray-800">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">{formatDate(stage.dateDebut)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Département/domaine</p>
                    <div className="flex items-center text-gray-800">
                      <Building className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">{departement ? departement.nom : 'Non assigné'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Statut</p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de fin</p>
                    <div className="flex items-center text-gray-800">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">{formatDate(stage.dateFin)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Encadreur</p>
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-800">
                        <Briefcase className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">
                          {encadreur ? `${encadreur.prenom} ${encadreur.nom}` : 'Non assigné'}
                        </span>
                      </div>
                      {encadreur && encadreur.email && (
                        <div className="flex items-center text-gray-600 mt-1 ml-6">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{encadreur.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {theme && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Thème</p>
                      <div className="flex items-center text-gray-800">
                        <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">{theme.nom}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {stage.description && (
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{stage.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}