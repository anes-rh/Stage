import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, AlertCircle, Check, X, Info, CheckCircle, User, FileText, Building, Briefcase } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { ficheEvaluationStagiaireAPI } from '../../utils/ficheEvaluationStagiaireAPI';

export default function FicheEvaluationDirecteur() {
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
        const ficheData = await ficheEvaluationStagiaireAPI.getFicheEvaluationStagiaire(id);
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
      const ficheData = await ficheEvaluationStagiaireAPI.getFicheEvaluationStagiaire(id);
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
      await ficheEvaluationStagiaireAPI.validateFicheEvaluationStagiaire(id, !fiche.estValide);
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
    
    const labels = ["Insatisfaisant", "Peu satisfaisant", "Satisfaisant", "Très satisfaisant"];
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
                <div>Insatisfaisant</div>
                <div>Peu satisfaisant</div>
                <div>Satisfaisant</div>
                <div>Très satisfaisant</div>
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
      <MembreDirectionLayout defaultActivePage="fiches-evaluation1">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement de la fiche d'évaluation...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  if (!fiche) {
    return (
      <MembreDirectionLayout defaultActivePage="fiches-evaluation1">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>Fiche d'évaluation non trouvée.</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  const calculateEvaluationSummary = () => {
    const criteres = [
      "realisationMissionsConfiees", "respectDelaisProcedures", "comprehensionTravaux",
      "appreciationRenduTravail", "utilisationMoyensMisDisposition", "niveauConnaissances",
      "competencesGenerales", "adaptationOrganisationMethodesTravail", "ponctualiteAssiduite",
      "rigueurSerieux", "disponibiliteMotivationEngagement", "integrationSeinService",
      "aptitudes", "travailEquipe", "capaciteApprendreComprendre",
      "applicationConnaissancesNouvelles", "rechercheInformations", "methodeOrganisationTravail",
      "analyseExplicationSynthese", "communication"
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
    if (moyenne < 1.5) niveau = "Insatisfaisant";
    else if (moyenne < 2.5) niveau = "Peu satisfaisant";
    else if (moyenne < 3.5) niveau = "Satisfaisant";
    else niveau = "Très satisfaisant";
    
    return {
      moyenne: Math.round(moyenne * 100) / 100,
      niveau
    };
  };

  const realisationTravailItems = [
    { key: "realisationMissionsConfiees", label: "Réalisation des missions confiées" },
    { key: "respectDelaisProcedures", label: "Respect des délais et procédures" },
    { key: "comprehensionTravaux", label: "Compréhension des travaux" },
    { key: "appreciationRenduTravail", label: "Appréciation du rendu du travail" },
    { key: "utilisationMoyensMisDisposition", label: "Utilisation des moyens mis à disposition" }
  ];

  const connaissancesCompetencesItems = [
    { key: "niveauConnaissances", label: "Niveau de connaissances" },
    { key: "competencesGenerales", label: "Compétences générales" },
    { key: "adaptationOrganisationMethodesTravail", label: "Adaptation à l'organisation et méthodes" }
  ];

  const qualitesProfessionnellesItems = [
    { key: "ponctualiteAssiduite", label: "Ponctualité et assiduité" },
    { key: "rigueurSerieux", label: "Rigueur et sérieux" },
    { key: "disponibiliteMotivationEngagement", label: "Disponibilité, motivation et engagement" },
    { key: "integrationSeinService", label: "Intégration au sein du service" },
    { key: "aptitudes", label: "Aptitudes" },
    { key: "travailEquipe", label: "Travail en équipe" }
  ];

  const capacitesApprentissageItems = [
    { key: "capaciteApprendreComprendre", label: "Capacité à apprendre et comprendre" },
    { key: "applicationConnaissancesNouvelles", label: "Application des connaissances nouvelles" },
    { key: "rechercheInformations", label: "Recherche d'informations" },
    { key: "methodeOrganisationTravail", label: "Méthode et organisation du travail" },
    { key: "analyseExplicationSynthese", label: "Analyse, explication et synthèse" },
    { key: "communication", label: "Communication" }
  ];

  const evaluationSummary = calculateEvaluationSummary();

  return (
    <MembreDirectionLayout defaultActivePage="fiches-evaluation1">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
          <button onClick={() => navigate('/membredirection/fiches-evaluation1', { state: { refresh: true } })} className="flex items-center text-gray-600 hover:text-green-600 mr-3">
  <ChevronLeft className="h-5 w-5" />
</button>
            <h1 className="text-2xl font-bold text-gray-800">Fiche d'Évaluation #{fiche.id}</h1>
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
              <h2 className="text-lg font-semibold text-gray-800">Informations du Stagiaire</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom et prénom</p>
                <p className="text-base text-gray-900">{fiche.nomPrenomStagiaire}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Formation</p>
                <p className="text-base text-gray-900">{fiche.formationStagiaire}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Période du stage</p>
                <p className="text-base text-gray-900">{formatDate(fiche.periodeDu)} au {formatDate(fiche.periodeAu)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Structure et Thème</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Structure d'accueil</p>
                <p className="text-base text-gray-900">{fiche.structureAccueil}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Thème du stage</p>
                <p className="text-base text-gray-900">{fiche.themeStage}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Missions confiées</p>
                <p className="text-base text-gray-900">{fiche.missionsConfieesAuStagiaire || "Non spécifié"}</p>
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
                <p className="text-sm font-medium text-gray-500">Encadreur / Évaluateur</p>
                <p className="text-base text-gray-900">{fiche.nomPrenomEvaluateur || fiche.nomPrenomEncadreur}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Moyenne d'évaluation</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-semibold text-gray-900 mr-2">{evaluationSummary.moyenne}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    evaluationSummary.niveau === "Très satisfaisant" ? "bg-green-100 text-green-800" :
                    evaluationSummary.niveau === "Satisfaisant" ? "bg-blue-100 text-blue-800" :
                    evaluationSummary.niveau === "Peu satisfaisant" ? "bg-yellow-100 text-yellow-800" :
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
              Réalisation du travail & Connaissances
            </h2>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Réalisation du travail</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(realisationTravailItems)}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Connaissances et compétences</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(connaissancesCompetencesItems)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Qualités professionnelles & Apprentissage
            </h2>
          </div>
          
          <div className="p-5">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Qualités professionnelles</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(qualitesProfessionnellesItems)}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Capacités d'apprentissage</h3>
              <div className="overflow-x-auto">
                {renderEvaluationTable(capacitesApprentissageItems)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Info className="h-5 w-5 text-green-600 mr-2" />
              Appréciation Globale
            </h2>
          </div>
          
          <div className="p-5">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{fiche.appreciationGlobaleTuteur || "Aucune appréciation globale fournie pour ce stagiaire."}"</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Info className="h-5 w-5 text-green-600 mr-2" />
              Observations
            </h2>
          </div>
          
          <div className="p-5">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{fiche.observations || "Aucune observation fournie pour ce stagiaire."}</p>
            </div>
          </div>
        </div>
      </div>
    </MembreDirectionLayout>
  );
}