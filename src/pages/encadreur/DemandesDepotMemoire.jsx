import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {ArrowLeft, Clock, Calendar, User, BookOpen, CheckCircle, XCircle, AlertCircle, Save, Plus} from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';
import { stageAPI } from '../../utils/stageAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatutColor = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Valide':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Rejete':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Archive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatutIcon = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return <Clock className="h-4 w-4" />;
    case 'Valide':
      return <CheckCircle className="h-4 w-4" />;
    case 'Rejete':
      return <XCircle className="h-4 w-4" />;
    case 'Archive':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return 'En attente';
    case 'Valide':
      return 'Validée';
    case 'Rejete':
      return 'Rejetée';
    case 'Archive':
      return 'Archivée';
    default:
      return statut;
  }
};

export default function DemandesDepotMemoire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreating = id === 'nouveau';
  
  const [demande, setDemande] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    stagiaireGroup: '',
    etudiants: ['', '', ''],
    themeLines: ['', '', '']
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur actuel
        const userData = await encadreurAPI.getCurrentUser();
        setCurrentUser(userData);
        
        if (isCreating) {
          // Mode création : récupérer les stages de l'encadreur
          const stagesData = await stageAPI.getStagesByEncadreur(userData.id);
          setStages(stagesData);
        } else {
          // Mode consultation : récupérer la demande existante
          const demandeData = await demandeDepotMemoireAPI.getDemandeDepotMemoire(id);
          setDemande(demandeData);
          
          if (demandeData.nomPrenomEtudiants) {
            const etudiantsArray = demandeData.nomPrenomEtudiants.split(',').map(e => e.trim());
            const etudiants = [...etudiantsArray, ...Array(3 - etudiantsArray.length).fill('')].slice(0, 3);
            
            setFormData({
              stagiaireGroup: demandeData.stagiaireGroup || '',
              etudiants,
              themeLines: demandeData.nomTheme ? demandeData.nomTheme.split('\n').slice(0, 3) : ['', '', '']
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isCreating]);

  const handleStageChange = async (stageId) => {
    if (!stageId) {
      setSelectedStageId('');
      return;
    }

    try {
      setSelectedStageId(stageId);
      // Optionnellement, vous pouvez récupérer plus de détails sur le stage sélectionné
    } catch (err) {
      console.error("Erreur lors de la sélection du stage:", err);
      setError("Erreur lors de la sélection du stage");
    }
  };

  const handleFormChange = (field, value, index) => {
    if (index !== undefined) {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData({...formData, [field]: updatedArray});
    } else {
      setFormData({...formData, [field]: value});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCreating && (!selectedStageId || !currentUser)) {
      setError("Veuillez sélectionner un stage");
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      if (isCreating) {
        const demandeData = {
          StageId: parseInt(selectedStageId),
          EncadreurId: currentUser.id
        };

        await demandeDepotMemoireAPI.createDemandeDepotMemoire(demandeData);
      } else {
        // Mise à jour d'une demande existante
        const demandeData = {
          stagiaireGroup: formData.stagiaireGroup,
          nomPrenomEtudiants: formData.etudiants.filter(e => e.trim()).join(', '),
          nomTheme: formData.themeLines.filter(t => t.trim()).join('\n')
        };
        
        await demandeDepotMemoireAPI.updateDemandeDepotMemoire(id, demandeData);
        setSuccess("La demande a été sauvegardée avec succès.");
      }
      
      if (isCreating) {
        navigate('/encadreur/Demandes-Depot-Memoire');
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la demande:", err);
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la sauvegarde de la demande.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="Demandes-Depot-Memoire">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="Demandes-Depot-Memoire">
      <div className="pb-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              to="/encadreur/Demandes-Depot-Memoire"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Retour à la liste
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {isCreating ? 'Nouvelle demande de dépôt de mémoire' : `Demande #${demande?.id}`}
            </h1>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center px-3 py-1.5 text-sm font-medium rounded border border-green-600 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Formulaire de demande de dépôt de mémoire</h2>
            <p className="text-sm text-gray-600 mt-1">
              Veuillez compléter les informations ci-dessous.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8 border-b pb-6">
              <div className="text-lg font-semibold mb-4">Je soussigné(e) Mme/Mr</div>
              <div className="flex flex-col border-b border-dotted border-gray-400 py-2">
                <span className="text-gray-900 font-medium">
                  {currentUser?.nom} {currentUser?.prenom}
                </span>
                <span className="text-sm text-gray-500">encadreur du mémoire de fin d'études</span>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">de l'étudiant(e) en</div>
              <div className="border-b border-dotted border-gray-400 py-2 mb-4">
                {isCreating ? (
                  <select
                    id="stage-select"
                    value={selectedStageId}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                    required
                  >
                    <option value="">Sélectionnez un stage</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.stagiaireGroup}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.stagiaireGroup}
                    onChange={(e) => handleFormChange('stagiaireGroup', e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                    placeholder="Précisez la formation de l'étudiant"
                  />
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">désigné(s) ci-dessous</div>
              <div className="grid grid-cols-1 gap-4">
                {formData.etudiants.map((etudiant, index) => (
                  <div key={index} className="border-b border-dotted border-gray-400 py-2">
                    {index + 1}. 
                    <input
                      type="text"
                      value={etudiant}
                      onChange={(e) => handleFormChange('etudiants', e.target.value, index)}
                      className="ml-2 w-4/5 bg-transparent border-none focus:outline-none focus:ring-0"
                      placeholder="Nom et prénom de l'étudiant"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">Ayant pour thème</div>
              {formData.themeLines.map((ligne, index) => (
                <div key={index} className="border-b border-dotted border-gray-400 py-2 mt-2">
                  <input
                    type="text"
                    value={ligne}
                    onChange={(e) => handleFormChange('themeLines', e.target.value, index)}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                    placeholder="Intitulé du thème"
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-normal mb-4">
                Atteste avoir validé le travail effectué et autorisé l'étudiant(e) à déposer son mémoire en vue de programmer sa soutenance
              </div>
            </div>

            {!isCreating && (
              <div className="flex justify-end space-x-3 mt-8">
                <Link
                  to="/encadreur/Demandes-Depot-Memoire"
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-lg transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder les modifications
                    </>
                  )}
                </button>
              </div>
            )}
            
            {isCreating && (
              <div className="flex justify-end space-x-3 mt-8">
                <Link
                  to="/encadreur/Demandes-Depot-Memoire"
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving || !selectedStageId}
                  className="flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-lg transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer la demande
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </EncadreurLayout>
  );
}