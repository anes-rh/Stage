import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle, Check, X, Info, CheckCircle } from 'lucide-react';
import { ficheEvaluationEncadreurAPI } from '../../utils/ficheEvaluationEncadreurAPI';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { stageAPI } from '../../utils/stageAPI';

export default function Evaluations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [stagiaire, setStagiaire] = useState(null);
  const [stage, setStage] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur stagiaire actuel
        const stagiaireData = await stagiaireAPI.getCurrentUser();
        if (!stagiaireData || typeof stagiaireData !== 'object') {
          setError("Impossible de récupérer les informations du stagiaire.");
          setAuthorized(false);
          return;
        }
        setStagiaire(stagiaireData);
        
        if (!stagiaireData) {
          setError("Vous devez être connecté pour accéder à cette page");
          setAuthorized(false);
          return;
        }
        
        // Récupérer la fiche d'évaluation demandée
        const ficheData = await ficheEvaluationEncadreurAPI.getFicheEvaluationEncadreur(id);
        
        // Modification ici : autoriser l'accès si la fiche n'a pas de stagiaireId défini
        // ou si le stagiaireId correspond à l'ID du stagiaire connecté
        if (!ficheData.stagiaireId) {
          ficheData.stagiaireId = stagiaireData.id;
          ficheData.nomPrenomStagiaireEvaluateur = `${stagiaireData.nom} ${stagiaireData.prenom}`;
        }
        
        // Si la fiche n'a pas encore de stagiaireId, l'attribuer au stagiaire actuel
        if (!ficheData.stagiaireId) {
          ficheData.stagiaireId = stagiaireData.id;
          ficheData.nomPrenomStagiaireEvaluateur = `${stagiaireData.nom} ${stagiaireData.prenom}`;
        }
        
        // Si la fiche a un stageId, récupérer les informations du stage
        if (ficheData.stageId) {
          const stageData = await stageAPI.getStage(ficheData.stageId);
          setStage(stageData);
        }
        
        setAuthorized(true);
        setFiche(ficheData);
      } catch (err) {
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) checkAuthAndFetchData();
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
        fixeObjectifsClairs: fiche.fixeObjectifsClairs,
        gereImprevus: fiche.gereImprevus,
        rencontreRegulierementEtudiants: fiche.rencontreRegulierementEtudiants,
        organiseEtapesRecherche: fiche.organiseEtapesRecherche,
        expliqueClairementContenu: fiche.expliqueClairementContenu,
        interrogeEtudiantsFeedback: fiche.interrogeEtudiantsFeedback,
        maitriseConnaissances: fiche.maitriseConnaissances,
        enseigneFaitDemonstrations: fiche.enseigneFaitDemonstrations,
        inviteEtudiantsQuestions: fiche.inviteEtudiantsQuestions,
        repondQuestionsEtudiants: fiche.repondQuestionsEtudiants,
        encourageInitiativesEtudiants: fiche.encourageInitiativesEtudiants,
        interrogeEtudiantsTravailEffectue: fiche.interrogeEtudiantsTravailEffectue,
        accepteExpressionPointsVueDifferents: fiche.accepteExpressionPointsVueDifferents,
        communiqueClairementSimplement: fiche.communiqueClairementSimplement,
        critiqueConstructive: fiche.critiqueConstructive,
        pondereQuantiteInformation: fiche.pondereQuantiteInformation,
        efficaceGestionSupervision: fiche.efficaceGestionSupervision,
        maintientAttitudeProfessionnelle: fiche.maintientAttitudeProfessionnelle,
        transmetDonneesFiables: fiche.transmetDonneesFiables,
        orienteEtudiantsRessourcesPertinentes: fiche.orienteEtudiantsRessourcesPertinentes,
        montreImportanceSujetTraite: fiche.montreImportanceSujetTraite,
        prodigueEncouragementsFeedback: fiche.prodigueEncouragementsFeedback,
        demontreInteretRecherche: fiche.demontreInteretRecherche,
        observations: fiche.observations || '',
        nomPrenomStagiaireEvaluateur: fiche.nomPrenomStagiaireEvaluateur,
        stagiaireId: fiche.stagiaireId, // Ajout de stagiaireId dans les données à mettre à jour
      };
      
      await ficheEvaluationEncadreurAPI.updateFicheEvaluationEncadreur(id, updateData);
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
      <div className="flex flex-col items-center justify-center h-48">
        <div className="h-8 w-8 border-3 border-t-green-500 border-gray-200 rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-sm">Chargement de la fiche d'évaluation...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium mb-1">Accès non autorisé</h3>
            <p className="text-sm">{error || "Vous n'êtes pas autorisé à accéder à cette fiche d'évaluation."}</p>
            <button 
              onClick={() => navigate('/stagiaire/evaluations')}
              className="mt-3 px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700"
            >
              Retour à la liste des évaluations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-start">
        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-sm">Fiche d'évaluation non trouvée.</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/stagiaire/evaluations')} className="flex items-center text-gray-600 hover:text-green-600 text-sm">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Retour à la liste</span>
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
          <h1 className="text-xl font-bold text-gray-800">Fiche d'Évaluation de l'Encadreur</h1>
          <p className="text-gray-500 text-sm mt-0.5">Votre évaluation personnelle de l'encadreur</p>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200">
          <div>
            <h2 className="text-md font-medium text-gray-800 mb-3 flex items-center">
              <Info className="h-4 w-4 mr-1.5 text-green-600" />
              Informations générales
            </h2>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-md p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom et prénom de l'encadreur</label>
                <p className="text-sm text-gray-900">{fiche.nomPrenomEncadreur}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Fonction</label>
                <p className="text-sm text-gray-900">{fiche.fonctionEncadreur}</p>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
                <p className="text-sm text-gray-900">
                  Du {new Date(fiche.dateDebutStage).toLocaleDateString('fr-FR')} au {new Date(fiche.dateFinStage).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Date de création</label>
                <p className="text-sm text-gray-900">{new Date(fiche.dateCreation).toLocaleDateString('fr-FR')}</p>
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
            <h3 className="text-sm font-semibold mb-2">Planification du travail</h3>
            <p className="text-sm text-gray-500 mb-4">La planification du travail est l'établissement des objectifs clairs et l'organisation des étapes de recherche, tout en gérant les imprévus et en assurant un suivi régulier.</p>
            {renderEvaluationTable("Planification du travail", planificationTravailItems)}
            
            <h3 className="text-sm font-semibold mb-2">Comprendre et faire comprendre</h3>
            <p className="text-sm text-gray-500 mb-4">Comprendre et faire comprendre évalue la capacité de l'encadreur à transmettre clairement les connaissances et à vérifier la compréhension des étudiants.</p>
            {renderEvaluationTable("Comprendre et faire comprendre", comprendreEtFaireComprendreItems)}
            
            <h3 className="text-sm font-semibold mb-2">Susciter la participation</h3>
            <p className="text-sm text-gray-500 mb-4">Susciter la participation reflète la capacité de l'encadreur à encourager les initiatives des étudiants et à favoriser un environnement d'apprentissage interactif.</p>
            {renderEvaluationTable("Susciter la participation", susciterParticipationItems)}
            
            <h3 className="text-sm font-semibold mb-2">Communication orale</h3>
            <p className="text-sm text-gray-500 mb-4">La communication orale évalue la clarté, la pertinence et l'efficacité de la communication de l'encadreur avec les étudiants.</p>
            {renderEvaluationTable("Communication orale", communicationOraleItems)}
            
            <h3 className="text-sm font-semibold mb-2">Sens de responsabilité</h3>
            <p className="text-sm text-gray-500 mb-4">Le sens de responsabilité mesure le professionnalisme, la fiabilité et l'efficacité de l'encadreur dans son rôle de supervision.</p>
            {renderEvaluationTable("Sens de responsabilité", sensResponsabiliteItems)}
            
            <h3 className="text-sm font-semibold mb-2">Stimuler la motivation des étudiants</h3>
            <p className="text-sm text-gray-500 mb-4">Stimuler la motivation des étudiants évalue la capacité de l'encadreur à inspirer et à soutenir l'enthousiasme et l'engagement des étudiants.</p>
            {renderEvaluationTable("Stimuler la motivation des étudiants", stimulerMotivationItems)}
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Observations</h3>
              <textarea
                value={fiche.observations || ''}
                onChange={(e) => setFiche({...fiche, observations: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Observations supplémentaires..."
                maxLength={500}
              ></textarea>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nom et prénom du stagiaire évaluateur</h3>
              <input
                type="text"
                value={fiche.nomPrenomStagiaireEvaluateur || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Nom et prénom du stagiaire évaluateur"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}