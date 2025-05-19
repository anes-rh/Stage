import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle, Check, X, Info, CheckCircle } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { ficheEvaluationStagiaireAPI } from '../../utils/ficheEvaluationStagiaireAPI';

export default function FichesEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFicheEvaluation = async () => {
      try {
        setLoading(true);
        const ficheData = await ficheEvaluationStagiaireAPI.getFicheEvaluationStagiaire(id);
        
        const updatedFiche = {
          ...ficheData,
          nomPrenomEvaluateur: ficheData.nomPrenomEvaluateur || ficheData.nomPrenomEncadreur
        };
        
        setFiche(updatedFiche);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFicheEvaluation();
  }, [id]);

  const handleNiveauChange = (critere, valeur) => {
    if (!fiche) return;
    setFiche({
      ...fiche,
      [critere]: valeur
    });
  };

  const sauvegarderFiche = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      if (!fiche) {
        setError("Aucune fiche à sauvegarder.");
        return;
      }
      
      const updateData = {
        missionsConfieesAuStagiaire: fiche.missionsConfieesAuStagiaire,
        realisationMissionsConfiees: fiche.realisationMissionsConfiees,
        respectDelaisProcedures: fiche.respectDelaisProcedures,
        comprehensionTravaux: fiche.comprehensionTravaux,
        appreciationRenduTravail: fiche.appreciationRenduTravail,
        utilisationMoyensMisDisposition: fiche.utilisationMoyensMisDisposition,
        niveauConnaissances: fiche.niveauConnaissances,
        competencesGenerales: fiche.competencesGenerales,
        adaptationOrganisationMethodesTravail: fiche.adaptationOrganisationMethodesTravail,
        ponctualiteAssiduite: fiche.ponctualiteAssiduite,
        rigueurSerieux: fiche.rigueurSerieux,
        disponibiliteMotivationEngagement: fiche.disponibiliteMotivationEngagement,
        integrationSeinService: fiche.integrationSeinService,
        aptitudes: fiche.aptitudes,
        travailEquipe: fiche.travailEquipe,
        capaciteApprendreComprendre: fiche.capaciteApprendreComprendre,
        applicationConnaissancesNouvelles: fiche.applicationConnaissancesNouvelles,
        rechercheInformations: fiche.rechercheInformations,
        methodeOrganisationTravail: fiche.methodeOrganisationTravail,
        analyseExplicationSynthese: fiche.analyseExplicationSynthese,
        communication: fiche.communication,
        appreciationGlobaleTuteur: fiche.appreciationGlobaleTuteur || '',
        observations: fiche.observations || '',
        nomPrenomEvaluateur: fiche.nomPrenomEvaluateur,
      };
      
      await ficheEvaluationStagiaireAPI.updateFicheEvaluationStagiaire(id, updateData);
      setSuccess("La fiche d'évaluation a été sauvegardée avec succès.");
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const renderNiveauCheckboxes = (critere, valeur) => {
    return (
      <div className="flex justify-between w-full">
        {[1, 2, 3, 4].map((niveau) => (
          <div key={niveau} className="flex items-center justify-center w-1/4">
            <input 
              type="checkbox" 
              checked={valeur === niveau}
              onChange={() => handleNiveauChange(critere, niveau)}
              className="h-4 w-4 accent-green-500 appearance-none border border-gray-300 rounded checked:bg-transparent checked:border-green-500 relative"
              style={{
                backgroundImage: valeur === niveau ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='green' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")" : "",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderEvaluationTable = (title, items, criteriaPrefix) => {
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
                {renderNiveauCheckboxes(item.key, fiche[item.key])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="fiches">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="h-8 w-8 border-3 border-t-green-500 border-gray-200 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement de la fiche d'évaluation...</p>
        </div>
      </EncadreurLayout>
    );
  }

  if (!fiche) {
    return (
      <EncadreurLayout defaultActivePage="fiches">
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">Fiche d'évaluation non trouvée.</p>
        </div>
      </EncadreurLayout>
    );
  }

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

  return (
    <EncadreurLayout defaultActivePage="fiches">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-green-600 text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Retour</span>
          </button>
          <button 
            onClick={sauvegarderFiche}
            disabled={saving}
            className="flex items-center px-3 py-1.5 text-xs font-medium rounded border border-green-600 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded flex items-start text-sm">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button className="ml-auto text-red-700 hover:text-red-900" onClick={() => setError('')}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded flex items-start text-sm">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
            <button className="ml-auto text-green-700 hover:text-green-900" onClick={() => setSuccess('')}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800">Fiche d'Évaluation</h1>
            <p className="text-gray-500 text-sm mt-0.5">Évaluation du stagiaire</p>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200">
            <div>
              <h2 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-1.5 text-green-600" />
                Informations générales
              </h2>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom et prénom</label>
                  <p className="text-sm text-gray-900">{fiche.nomPrenomStagiaire}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Formation</label>
                  <p className="text-sm text-gray-900">{fiche.formationStagiaire}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Structure d'accueil</label>
                  <p className="text-sm text-gray-900">{fiche.structureAccueil}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-1.5 text-green-600" />
                Détails du stage
              </h2>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Thème du stage</label>
                  <p className="text-sm text-gray-900">{fiche.themeStage}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
                  <p className="text-sm text-gray-900">
                    Du {new Date(fiche.periodeDu).toLocaleDateString('fr-FR')} au {new Date(fiche.periodeAu).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Encadreur</label>
                  <p className="text-sm text-gray-900">{fiche.nomPrenomEncadreur}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h2 className="text-md font-medium text-gray-800 mb-4 flex items-center">
              <Check className="h-4 w-4 mr-1.5 text-green-600" />
              Évaluation des compétences
            </h2>
            
            <div className="overflow-x-auto">
              <h3 className="text-sm font-semibold mb-2">Réalisation du travail</h3>
              <p className="text-sm text-gray-500 mb-4">La réalisation du travail est l'exécution des tâches et missions confiées au stagiaire dans le respect des délais et des procédures.</p>
              {renderEvaluationTable("Réalisation du travail", realisationTravailItems)}
              
              <h3 className="text-sm font-semibold mb-2">Connaissances et compétences</h3>
              <p className="text-sm text-gray-500 mb-4">Les connaissances et compétences évaluent le niveau d'expertise technique et l'adaptabilité du stagiaire aux méthodes de travail.</p>
              {renderEvaluationTable("Connaissances et compétences", connaissancesCompetencesItems)}
              
              <h3 className="text-sm font-semibold mb-2">Qualités professionnelles</h3>
              <p className="text-sm text-gray-500 mb-4">Les qualités professionnelles reflètent le comportement, l'engagement et l'intégration du stagiaire dans son environnement de travail.</p>
              {renderEvaluationTable("Qualités professionnelles", qualitesProfessionnellesItems)}
              
              <h3 className="text-sm font-semibold mb-2">Capacités d'apprentissage</h3>
              <p className="text-sm text-gray-500 mb-4">Les capacités d'apprentissage mesurent l'aptitude du stagiaire à assimiler de nouvelles connaissances et à les appliquer efficacement.</p>
              {renderEvaluationTable("Capacités d'apprentissage", capacitesApprentissageItems)}
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Appréciation globale du tuteur</h3>
                <textarea
                  value={fiche.appreciationGlobaleTuteur || ''}
                  onChange={(e) => setFiche({...fiche, appreciationGlobaleTuteur: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Appréciation globale..."
                ></textarea>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Observations</h3>
                <textarea
                  value={fiche.observations || ''}
                  onChange={(e) => setFiche({...fiche, observations: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Observations supplémentaires..."
                ></textarea>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Évaluateur</h3>
                <input
                  type="text"
                  value={fiche.nomPrenomEvaluateur || ''}
                  onChange={(e) => setFiche({...fiche, nomPrenomEvaluateur: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nom et prénom de l'évaluateur"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </EncadreurLayout>
  );
}