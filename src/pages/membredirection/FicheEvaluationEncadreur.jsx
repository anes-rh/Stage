import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, AlertCircle, Check, X, Info, CheckCircle, User, FileText, Building, Briefcase } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { ficheEvaluationEncadreurAPI } from '../../utils/ficheEvaluationEncadreurAPI';

export default function FicheEvaluationEncadreur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchFicheEvaluation = async () => {
      try {
        setLoading(true);
        const ficheData = await ficheEvaluationEncadreurAPI.getFicheEvaluationEncadreur(id);
        setFiche(ficheData);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFicheEvaluation();
    }
  }, [id]);

  const refreshFicheEvaluation = async () => {
    try {
      setLoading(true);
      const ficheData = await ficheEvaluationEncadreurAPI.getFicheEvaluationEncadreur(id);
      setFiche(ficheData);
      setError('');
    } catch (err) {
      console.error("Erreur lors du rechargement:", err);
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors du rechargement.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFicheValidation = async () => {
    try {
      setValidating(true);
      setError('');
      setSuccess('');
      await ficheEvaluationEncadreurAPI.validateFicheEvaluationEncadreur(id, !fiche.estValide);
      await refreshFicheEvaluation();
      setSuccess(!fiche.estValide 
        ? "La fiche d'évaluation a été validée avec succès."
        : "La fiche d'évaluation a été invalidée avec succès."
      );
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la validation.");
    } finally {
      setValidating(false);
    }
  };

  const renderNiveauIndicator = (niveau) => {
    if (!niveau) return null;
    
    const labels = ["Insuffisant", "Moyen", "Bon", "Excellent"];
    const colors = [
      "bg-red-100 text-red-800 border-red-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200"
    ];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[niveau - 1]}`}>
        {labels[niveau - 1]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const renderEvaluationTable = (items) => {
    return (
      <table className="min-w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="w-1/3 text-left text-xs font-medium text-gray-700 py-2">Critère</th>
            <th className="w-2/3 text-xs font-medium text-gray-700 py-2" colSpan="4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>Insuffisant</div>
                <div>Moyen</div>
                <div>Bon</div>
                <div>Excellent</div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-50">
          {items.map((item, index) => (
            <tr key={index} className="border-t border-gray-200">
              <td className="text-sm py-3 pl-3">{item.label}</td>
              <td className="py-3" colSpan="4">
                <div className="flex justify-between w-full">
                  {[1, 2, 3, 4].map((niveau) => (
                    <div key={niveau} className="flex items-center justify-center w-1/4">
                      {fiche[item.key] === niveau && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="fiches-evaluation2">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement de la fiche d'évaluation...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  if (!fiche) {
    return (
      <MembreDirectionLayout defaultActivePage="fiches-evaluation2">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>Fiche d'évaluation non trouvée.</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  const calculateEvaluationSummary = () => {
    const criteres = [
      "fixeObjectifsClairs", "gereImprevus", "rencontreRegulierementEtudiants", "organiseEtapesRecherche", 
      "expliqueClairementContenu", "interrogeEtudiantsFeedback", "maitriseConnaissances", "enseigneFaitDemonstrations", 
      "inviteEtudiantsQuestions", "repondQuestionsEtudiants", "encourageInitiativesEtudiants", 
      "interrogeEtudiantsTravailEffectue", "accepteExpressionPointsVueDifferents", "communiqueClairementSimplement", 
      "critiqueConstructive", "pondereQuantiteInformation", "efficaceGestionSupervision", "maintientAttitudeProfessionnelle", 
      "transmetDonneesFiables", "orienteEtudiantsRessourcesPertinentes", "montreImportanceSujetTraite", 
      "prodigueEncouragementsFeedback", "demontreInteretRecherche"
    ];
    
    let somme = 0;
    let count = 0;
    
    criteres.forEach(critere => {
      if (fiche[critere]) {
        somme += fiche[critere];
        count++;
      }
    });
    
    if (count === 0) return { moyenne: 0, niveau: "Non évalué" };
    
    const moyenne = somme / count;
    
    let niveau = "Non évalué";
    if (moyenne < 1.5) niveau = "Insuffisant";
    else if (moyenne < 2.5) niveau = "Moyen";
    else if (moyenne < 3.5) niveau = "Bon";
    else niveau = "Excellent";
    
    return {
      moyenne: Math.round(moyenne * 100) / 100,
      niveau
    };
  };

  const planificationTravailItems = [
    { key: "fixeObjectifsClairs", label: "Fixe des objectifs clairs" },
    { key: "gereImprevus", label: "Gère les imprévus" },
    { key: "rencontreRegulierementEtudiants", label: "Rencontre régulièrement les étudiants" },
    { key: "organiseEtapesRecherche", label: "Organise les étapes de recherche" }
  ];

  const comprendreEtFaireComprendreItems = [
    { key: "expliqueClairementContenu", label: "Explique clairement le contenu" },
    { key: "interrogeEtudiantsFeedback", label: "Interroge les étudiants pour le feedback" },
    { key: "maitriseConnaissances", label: "Maîtrise des connaissances" },
    { key: "enseigneFaitDemonstrations", label: "Enseigne et fait des démonstrations" }
  ];

  const susciterParticipationItems = [
    { key: "inviteEtudiantsQuestions", label: "Invite les étudiants à poser des questions" },
    { key: "repondQuestionsEtudiants", label: "Répond aux questions des étudiants" },
    { key: "encourageInitiativesEtudiants", label: "Encourage les initiatives des étudiants" },
    { key: "interrogeEtudiantsTravailEffectue", label: "Interroge les étudiants sur le travail effectué" },
    { key: "accepteExpressionPointsVueDifferents", label: "Accepte l'expression de points de vue différents" }
  ];

  const communicationOraleItems = [
    { key: "communiqueClairementSimplement", label: "Communique clairement et simplement" },
    { key: "critiqueConstructive", label: "Offre une critique constructive" },
    { key: "pondereQuantiteInformation", label: "Pondère la quantité d'information" }
  ];

  const sensResponsabiliteItems = [
    { key: "efficaceGestionSupervision", label: "Efficace dans la gestion et la supervision" },
    { key: "maintientAttitudeProfessionnelle", label: "Maintient une attitude professionnelle" },
    { key: "transmetDonneesFiables", label: "Transmet des données fiables" }
  ];

  const stimulerMotivationItems = [
    { key: "orienteEtudiantsRessourcesPertinentes", label: "Oriente les étudiants vers des ressources pertinentes" },
    { key: "montreImportanceSujetTraite", label: "Montre l'importance du sujet traité" },
    { key: "prodigueEncouragementsFeedback", label: "Prodigue des encouragements et du feedback" },
    { key: "demontreInteretRecherche", label: "Démontre un intérêt pour la recherche" }
  ];

  const evaluationSummary = calculateEvaluationSummary();

  return (
    <MembreDirectionLayout defaultActivePage="fiches-evaluation2">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate('/membredirection/fiches-evaluation2', { state: { refresh: true } })} className="flex items-center text-gray-600 hover:text-green-600 mr-3">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Fiche d'Évaluation Encadreur #{fiche.id}</h1>
          </div>
          <button 
            onClick={toggleFicheValidation}
            disabled={validating}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded ${
              fiche.estValide 
                ? "bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100" 
                : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"
            }`}
          >
            {fiche.estValide ? (
              <>
                <X className="h-4 w-4 mr-1.5" />
                <span>{validating ? 'Invalidation...' : 'Invalider la fiche'}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                <span>{validating ? 'Validation...' : 'Valider la fiche'}</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button 
              className="ml-auto text-red-700 hover:text-red-900" 
              onClick={() => setError('')}
              aria-label="Fermer le message d'erreur"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
            <button 
              className="ml-auto text-green-700 hover:text-green-900" 
              onClick={() => setSuccess('')}
              aria-label="Fermer le message de succès"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Informations de l'Encadreur</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom et prénom</p>
                <p className="text-base text-gray-900">{fiche.nomPrenomEncadreur}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fonction</p>
                <p className="text-base text-gray-900">{fiche.fonctionEncadreur || "Non spécifié"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Détails du Stage</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Période du stage</p>
                <p className="text-base text-gray-900">{formatDate(fiche.dateDebutStage)} au {formatDate(fiche.dateFinStage)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Stagiaire évaluateur</p>
                <p className="text-base text-gray-900">{fiche.nomPrenomStagiaireEvaluateur || "Non spécifié"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'évaluation</p>
                <p className="text-base text-gray-900">{formatDate(fiche.dateCreation)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Évaluation Globale</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Moyenne d'évaluation</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-semibold text-gray-900 mr-2">{evaluationSummary.moyenne}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    evaluationSummary.niveau === "Excellent" ? "bg-green-100 text-green-800" :
                    evaluationSummary.niveau === "Bon" ? "bg-blue-100 text-blue-800" :
                    evaluationSummary.niveau === "Moyen" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {evaluationSummary.niveau}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">État de validation</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1 ${
                  fiche.estValide ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {fiche.estValide ? 'Validée' : 'Non validée'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Briefcase className="h-5 w-5 text-green-600 mr-2" />
              Planification du travail & Compréhension
            </h2>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Planification du travail</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(planificationTravailItems)}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Comprendre et faire comprendre</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(comprendreEtFaireComprendreItems)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Participation & Communication
            </h2>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Susciter la participation</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(susciterParticipationItems)}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Communication orale</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(communicationOraleItems)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Briefcase className="h-5 w-5 text-green-600 mr-2" />
              Responsabilité & Motivation
            </h2>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Sens de responsabilité</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(sensResponsabiliteItems)}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Stimuler la motivation des étudiants</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(stimulerMotivationItems)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Info className="h-5 w-5 text-green-600 mr-2" />
              Observations du Stagiaire
            </h2>
          </div>
          
          <div className="p-5">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{fiche.observations || "Aucune observation fournie."}</p>
            </div>
          </div>
        </div>
      </div>
    </MembreDirectionLayout>
  );
}