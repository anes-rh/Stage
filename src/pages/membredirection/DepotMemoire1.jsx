import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, BookOpen, CheckCircle, XCircle, AlertCircle, UserCheck } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

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

export default function DepotMemoire1() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
        const userData = await membreDirectionAPI.getCurrentUser();
        setCurrentUser(userData);
        
        // Récupérer la demande existante
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
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleValidation = async (estApprouve) => {
    if (!currentUser) {
      setError("Impossible d'identifier le membre de direction");
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const validationData = {
        EstApprouve: estApprouve,
        MembreDirectionId: currentUser.id
      };

      await demandeDepotMemoireAPI.validerDemandeDepotMemoire(id, validationData);
      
      // Recharger la demande pour voir le nouveau statut
      const demandeData = await demandeDepotMemoireAPI.getDemandeDepotMemoire(id);
      setDemande(demandeData);
      
      setSuccess(estApprouve ? "La demande a été validée avec succès." : "La demande a été rejetée.");
    } catch (err) {
      console.error("Erreur lors de la validation de la demande:", err);
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la validation de la demande.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="Demandes-Depot-Memoire1">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="Demandes-Depot-Memoire1">
      <div className="pb-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              to="/membredirection/Demandes-Depot-Memoire1"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Retour à la liste
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              Demande de dépôt de mémoire #{demande?.id}
            </h1>
          </div>
          
          {/* Statut de la demande */}
          {demande && (
            <div className={`flex items-center px-3 py-2 rounded-lg border ${getStatutColor(demande.statut)}`}>
              {getStatutIcon(demande.statut)}
              <span className="ml-2 font-medium">{getStatutLabel(demande.statut)}</span>
            </div>
          )}
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

        {/* Informations de la demande */}
        {demande && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations de la demande</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Date de demande:</span>
                  <span className="ml-2">{formatDate(demande.dateDemande)}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">Encadreur:</span>
                  <span className="ml-2">{demande.nomPrenomEncadreur}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium">Période de stage:</span>
                  <span className="ml-2">
                    {formatDate(demande.dateDebutStage)} - {formatDate(demande.dateFinStage)}
                  </span>
                </div>
                {demande.dateValidation && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span className="font-medium">Date de validation:</span>
                    <span className="ml-2">{formatDate(demande.dateValidation)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de demande */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Demande de dépôt de mémoire</h2>
            <p className="text-sm text-gray-600 mt-1">
              Consultation de la demande soumise par l'encadreur.
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-8 border-b pb-6">
              <div className="text-lg font-semibold mb-4">Je soussigné(e) Mme/Mr</div>
              <div className="flex flex-col border-b border-dotted border-gray-400 py-2 bg-gray-50 px-3 rounded">
                <span className="text-gray-900 font-medium">
                  {demande?.nomPrenomEncadreur}
                </span>
                <span className="text-sm text-gray-500">encadreur du mémoire de fin d'études</span>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">de l'étudiant(e) en</div>
              <div className="border-b border-dotted border-gray-400 py-2 mb-4 bg-gray-50 px-3 rounded">
                <span className="text-gray-900">{formData.stagiaireGroup || 'Non spécifié'}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">désigné(s) ci-dessous</div>
              <div className="grid grid-cols-1 gap-4">
                {formData.etudiants.map((etudiant, index) => (
                  <div key={index} className="border-b border-dotted border-gray-400 py-2 bg-gray-50 px-3 rounded">
                    <span className="text-gray-700">{index + 1}. </span>
                    <span className="text-gray-900">{etudiant || 'Non renseigné'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-semibold mb-4">Ayant pour thème</div>
              {formData.themeLines.map((ligne, index) => (
                <div key={index} className="border-b border-dotted border-gray-400 py-2 mt-2 bg-gray-50 px-3 rounded">
                  <span className="text-gray-900">{ligne || 'Non renseigné'}</span>
                </div>
              ))}
            </div>
            
            <div className="mb-8">
              <div className="text-lg font-normal mb-4 text-gray-700">
                Atteste avoir validé le travail effectué et autorisé l'étudiant(e) à déposer son mémoire en vue de programmer sa soutenance
              </div>
            </div>

            {/* Actions de validation */}
            {demande?.statut === 'EnAttente' && (
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleValidation(false)}
                  disabled={processing}
                  className="flex items-center px-4 py-2 text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter la demande
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleValidation(true)}
                  disabled={processing}
                  className="flex items-center px-4 py-2 text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider la demande
                    </>
                  )}
                </button>
              </div>
            )}

            {demande?.statut !== 'EnAttente' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-gray-600">
                  <p>Cette demande a déjà été traitée le {formatDate(demande.dateValidation)}</p>
                  {demande.membreDirection && (
                    <p className="text-sm mt-1">
                      Par {demande.membreDirection.nom} {demande.membreDirection.prenom}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MembreDirectionLayout>
  );
}