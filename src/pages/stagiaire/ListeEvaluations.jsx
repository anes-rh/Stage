import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clipboard, 
  ChevronRight, 
  AlertCircle, 
  FileText,
  Calendar,
  User,
  Clock,
  Users
} from 'lucide-react';
import { ficheEvaluationEncadreurAPI } from '../../utils/ficheEvaluationEncadreurAPI';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { stageAPI } from '../../utils/stageAPI';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ListeEvaluations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stagiaire, setStagiaire] = useState(null);
  const [stages, setStages] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stagiaireData = await stagiaireAPI.getCurrentUser();
        setStagiaire(stagiaireData);
        
        if (stagiaireData.stageId) {
          const stageData = await stageAPI.getStage(stagiaireData.stageId);
          setStages([stageData]);
          
          if (stageData && stageData.encadreurId) {
            try {
              const ficheData = await ficheEvaluationEncadreurAPI.getFicheEvaluationByStage(stageData.id);
              setEvaluations(Array.isArray(ficheData) ? ficheData : [ficheData].filter(Boolean));
            } catch (err) {
              console.log("Pas d'évaluation trouvée pour ce stage");
              setEvaluations([]);
            }
          }
        } else {
          const allStages = await stageAPI.getAllStages();
          const stagiaireStages = allStages.filter(stage => 
            stage.stagiaires && stage.stagiaires.some(s => s.id === stagiaireData.id)
          );
          
          setStages(stagiaireStages);
          
          if (stagiaireStages.length > 0) {
            const allEvaluations = [];
            
            for (const stage of stagiaireStages) {
              if (stage.encadreurId) {
                try {
                  const ficheData = await ficheEvaluationEncadreurAPI.getFicheEvaluationByStage(stage.id);
                  if (ficheData) {
                    allEvaluations.push(Array.isArray(ficheData) ? [...ficheData] : ficheData);
                  }
                } catch (err) {
                  console.log(`Pas d'évaluation trouvée pour le stage ${stage.id}`);
                }
              }
            }
            
            setEvaluations(allEvaluations.flat().filter(Boolean));
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout defaultActivePage="evaluations">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="h-8 w-8 border-3 border-t-green-500 border-gray-200 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement des évaluations...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultActivePage="evaluations">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Message d'alerte pour la concertation entre stagiaires */}
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Users className="h-5 w-5 mr-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Concertation requise entre stagiaires</h3>
              <p className="text-amber-700 text-sm mt-1">
                Nous vous rappelons que cette fiche d'évaluation doit être remplie en concertation avec les autres stagiaires de votre groupe. 
                Veuillez prendre le temps d'échanger vos impressions et d'établir une évaluation collective qui reflète fidèlement l'expérience partagée. 
                Cette démarche collaborative garantira une évaluation équilibrée et constructive de votre encadreur.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <Clipboard className="h-5 w-5 mr-2 text-green-600" />
             Évaluation d'Encadreur
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Consultez la  fiche d'évaluation pour votre encadreur de stage
            </p>
          </div>

          {error && (
            <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded flex items-start text-sm">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {evaluations.length > 0 ? (
            <div className="p-0 divide-y divide-gray-100">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-green-600" />
                        Évaluation de {evaluation.nomPrenomEncadreur}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Créée le {new Date(evaluation.dateCreation).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          <span>Fonction: {evaluation.fonctionEncadreur}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 sm:col-span-2">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Période: {new Date(evaluation.dateDebutStage).toLocaleDateString('fr-FR')} au {new Date(evaluation.dateFinStage).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/stagiaire/evaluations/${evaluation.id}`)}
                      className="flex items-center px-3 py-1.5 text-xs font-medium rounded border border-green-600 bg-white text-green-600 hover:bg-green-50"
                    >
                      <span>Consulter</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : stages.length > 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium text-gray-700">Aucune évaluation disponible</h3>
              </div>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Vous n'avez pas encore d'évaluations à consulter pour vos stages en cours.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium text-gray-700">Aucun stage trouvé</h3>
              </div>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Vous n'avez pas encore de stage attribué. Vous pourrez consulter les évaluations une fois que vous aurez un stage en cours.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}