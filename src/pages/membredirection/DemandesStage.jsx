import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, User, FileText, X, CheckCircle, XCircle, Clock, AlertCircle, Upload, BookOpen, Building, MessageSquare } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeStageAPI } from '../../utils/demandeStageAPI';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

export default function DemandesStage() {
  const [filtreStatus, setFiltreStatus] = useState('tous');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [demandesStage, setDemandesStage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeDemandeId, setActiveDemandeId] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [commentaire, setCommentaire] = useState('');
  const [showCommentaireModal, setShowCommentaireModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const fileInputRef = useRef(null);
  const commentaireRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await membreDirectionAPI.getCurrentUser();
        setCurrentUser(userData);
        const demandes = await demandeStageAPI.getAllDemandesStage();
        //const demandesFiltrees = demandes.filter(demande => 
         // demande.membreDirection?.id === userData.id
        //);
        //setDemandesStage(demandesFiltrees);
        setDemandesStage(demandes);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les demandes de stage. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 512000) {
      setError("La taille du fichier dépasse 500KB. Veuillez sélectionner un fichier plus petit.");
      return;
    }
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 
      'image/jpg', 
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non supporté. Veuillez utiliser PDF, DOC, DOCX, JPG ou PNG.');
      return;
    }
    
    setSelectedFile(file);
    setError('');
  };
  
  const handleFileUploadClick = (demandeId) => {
    setActiveDemandeId(demandeId);
    fileInputRef.current.click();
  };
  
  const handleDocumentDownload = async (cheminFichier) => {
    try {
      if (!cheminFichier || !cheminFichier.includes('/')) {
        setError('Lien de document invalide. Veuillez réessayer de télécharger le fichier.');
        return;
      }
      
      setLoading(true);
      await demandeStageAPI.downloadFile(cheminFichier);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du téléchargement du document:', err);
      setError(`Échec du téléchargement: ${err}`);
      setLoading(false);
    }
  };

  const updateDemandeFile = async () => {
    if (!activeDemandeId || !selectedFile) return;
  
    try {
      setLoading(true);
      setError('');
      
      const fileResponse = await demandeStageAPI.uploadFile(selectedFile);
      if (typeof fileResponse !== 'string') {
        throw new Error("Le serveur n'a pas renvoyé un chemin de fichier valide");
      }
      const cheminFichier = fileResponse;
      await demandeStageAPI.updateDemandeStage(activeDemandeId, {
        cheminFichier: cheminFichier
      });
      setDemandesStage(prevDemandes => 
        prevDemandes.map(demande => 
          demande.id === activeDemandeId ? { ...demande, cheminFichier } : demande
        )
      );
      setSuccess("Le fichier a été mis à jour avec succès.");
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du fichier de la demande ${activeDemandeId}:`, err);
      setError(`Impossible de mettre à jour le fichier de la demande #${activeDemandeId}: ${err}`);
    } finally {
      setSelectedFile(null);
      setActiveDemandeId(null);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedFile) {
      updateDemandeFile();
    }
  }, [selectedFile]);

  const handleStatusChange = (id, newStatus) => {
    setActiveDemandeId(id);
    setStatusToUpdate(newStatus);
    setCommentaire('');
    setShowCommentaireModal(true);
    
    // Focus sur le champ de commentaire une fois qu'il est rendu
    setTimeout(() => {
      if (commentaireRef.current) {
        commentaireRef.current.focus();
      }
    }, 100);
  };

  const updateDemandeStatus = async () => {
    if (loadingStatus[activeDemandeId]) return;
    
    try {
      setLoadingStatus(prev => ({ ...prev, [activeDemandeId]: true }));
      await demandeStageAPI.updateDemandeStage(activeDemandeId, { 
        statut: statusToUpdate,
        commentaire: commentaire
      });
      setDemandesStage(prevDemandes => 
        prevDemandes.map(demande => 
          demande.id === activeDemandeId ? { 
            ...demande, 
            statut: statusToUpdate,
            commentaire: commentaire
          } : demande
        )
      );
      
      const statusLabel = statusToUpdate === 1 ? "acceptée" : "rejetée";
      setSuccess(`La demande #${activeDemandeId} a été ${statusLabel} avec succès.`);
      setShowCommentaireModal(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du statut de la demande ${activeDemandeId}:`, err);
      setError(`Impossible de mettre à jour le statut de la demande #${activeDemandeId}.`);
    } finally {
      setLoadingStatus(prev => ({ ...prev, [activeDemandeId]: false }));
      setActiveDemandeId(null);
      setStatusToUpdate(null);
    }
  };

  const handleCommentaireSubmit = (e) => {
    e.preventDefault();
    updateDemandeStatus();
  };

  const handleCancelCommentaire = () => {
    setShowCommentaireModal(false);
    setActiveDemandeId(null);
    setStatusToUpdate(null);
    setCommentaire('');
  };

  const deleteDemande = async (id) => {
    try {
      setLoading(true);
      await demandeStageAPI.deleteDemandeStage(id);
      setDemandesStage(prevDemandes => prevDemandes.filter(demande => demande.id !== id));
      setSuccess(`La demande #${id} a été supprimée avec succès.`);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors de la suppression de la demande ${id}:`, err);
      setError(`Impossible de supprimer la demande #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  const demandesFiltrees = demandesStage.filter(demande => {
    const statusMap = {
      'en_attente': 0,
      'accepte': 1,
      'rejete': 2
    };
    
    const matchStatus = filtreStatus === 'tous' || 
                       (typeof demande.statut === 'number' && demande.statut === statusMap[filtreStatus]) ||
                       demande.statut === filtreStatus;
    
    const searchLower = filtreSearch.toLowerCase();
    
    const matchStagiaires = demande.stagiaires?.some(stagiaire => 
      stagiaire.nom?.toLowerCase().includes(searchLower) ||
      stagiaire.prenom?.toLowerCase().includes(searchLower) ||
      stagiaire.email?.toLowerCase().includes(searchLower) ||
      stagiaire.universite?.toLowerCase().includes(searchLower) ||
      stagiaire.specialite?.toLowerCase().includes(searchLower)
    ) || false;
    
    const matchOtherFields = 
      demande.id?.toString().includes(searchLower) ||
      demande.membreDirection?.nom?.toLowerCase().includes(searchLower) ||
      demande.membreDirection?.prenom?.toLowerCase().includes(searchLower);
    
    return matchStatus && (matchStagiaires || matchOtherFields || !searchLower);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  const getStatusDisplay = (status) => {
    const statusValue = typeof status === 'number' ? status : 
                       (status === 'en_attente' ? 0 : 
                        status === 'accepte' ? 1 : 
                        status === 'rejete' ? 2 : -1);
    
    switch(statusValue) {
      case 0:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> };
      case 1:
        return { label: 'Acceptée', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 2:
        return { label: 'Rejetée', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };
  
  const formatStagiaires = (stagiaires) => {
    if (!stagiaires || stagiaires.length === 0) return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    
    // Regrouper les stagiaires par université et spécialité
    const uniSpecGroups = {};
    
    stagiaires.forEach(stagiaire => {
      const uniqueId = `${stagiaire.universite || ''}__${stagiaire.specialite || ''}`;
      
      if (!uniSpecGroups[uniqueId]) {
        uniSpecGroups[uniqueId] = {
          universite: stagiaire.universite,
          specialite: stagiaire.specialite,
          stagiaires: [],
          count: 0
        };
      }
      
      uniSpecGroups[uniqueId].stagiaires.push(stagiaire);
      uniSpecGroups[uniqueId].count++;
    });
    
    // Afficher tous les stagiaires individuellement
    const stagiaireItems = stagiaires.map((stagiaire, index) => (
      <div key={`stagiaire-${index}`} className="flex items-center text-sm text-gray-600 mb-2">
        <div className="flex-shrink-0 w-6">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <span className="font-medium">{stagiaire.prenom} {stagiaire.nom}</span>
          {stagiaire.email && (
            <>
              <span className="mx-1">-</span>
              <span className="text-gray-500 truncate">{stagiaire.email}</span>
            </>
          )}
        </div>
      </div>
    ));
    
    // Afficher les universités et spécialités regroupées
    const uniSpecItems = Object.values(uniSpecGroups).map((group, index) => (
      <div key={`unispec-${index}`} className="mt-3">
        {group.specialite && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="flex-shrink-0 w-6">
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
            <span>{group.specialite}</span>
            {group.count > 1 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {group.count}
              </span>
            )}
          </div>
        )}
        {group.universite && (
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <div className="flex-shrink-0 w-6">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <span>{group.universite}</span>
            {group.count > 1 && !group.specialite && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {group.count}
              </span>
            )}
          </div>
        )}
      </div>
    ));
    
    return (
      <div>
        <div className="mb-2">{stagiaireItems}</div>
        {uniSpecItems}
      </div>
    );
  };
  
  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="demandes-stage">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des demandes de stage...</p>
        </div>
      </MembreDirectionLayout>
    );
  }
  
  return (
    <MembreDirectionLayout defaultActivePage="demandes-stage">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
      />
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Demandes de stage</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button className="ml-auto text-red-700 hover:text-red-900" onClick={() => setError('')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
            <button className="ml-auto text-green-700 hover:text-green-900" onClick={() => setSuccess('')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
              value={filtreSearch}
              onChange={(e) => setFiltreSearch(e.target.value)}
            />
            {filtreSearch && (
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600" onClick={() => setFiltreSearch('')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtrer par status</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showFilterDropdown && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'tous' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('tous');
                    setShowFilterDropdown(false);
                  }}
                >
                  Toutes les demandes
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'en_attente' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('en_attente');
                    setShowFilterDropdown(false);
                  }}
                >
                  En attente
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'accepte' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('accepte');
                    setShowFilterDropdown(false);
                  }}
                >
                  Acceptées
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'rejete' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('rejete');
                    setShowFilterDropdown(false);
                  }}
                >
                  Rejetées
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandesFiltrees.map((demande) => {
            const statusInfo = getStatusDisplay(demande.statut);
            return (
              <div key={demande.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Demande #{demande.id}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="mb-2">
                      {formatStagiaires(demande.stagiaires)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex-shrink-0 w-6">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center">
                        {demande.cheminFichier && demande.cheminFichier !== 'chemin_temporaire_sans_upload.pdf' ? (
                          <button 
                            onClick={() => handleDocumentDownload(demande.cheminFichier)}
                            className="text-blue-600 hover:underline mr-2 flex items-center"
                          >
                            Télécharger le document
                          </button>
                        ) : (
                          <span className="text-gray-500 mr-2">Aucun document</span>
                        )}
                        
                        <button 
                          onClick={() => handleFileUploadClick(demande.id)}
                          className="text-green-600 hover:text-green-800 text-xs flex items-center"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {demande.cheminFichier ? 'Modifier' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                    
                    {demande.commentaire && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start text-sm text-gray-600">
                          <div className="flex-shrink-0 w-6 mt-0.5">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Commentaire:</span>
                            <p className="text-gray-600 mt-1">{demande.commentaire}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Créée le {formatDate(demande.dateDemande)}
                    </span>
                    <div className="flex space-x-2">
                      {demande.statut === 0 && (
                        <>
                          <button 
                            disabled={loadingStatus[demande.id]}
                            className={`px-3 py-1 text-xs font-medium rounded ${loadingStatus[demande.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'} transition-colors`}
                            onClick={() => handleStatusChange(demande.id, 1)}
                          >
                            {loadingStatus[demande.id] ? 'Traitement...' : 'Accepter'}
                          </button>
                          <button 
                            disabled={loadingStatus[demande.id]}
                            className={`px-3 py-1 text-xs font-medium rounded ${loadingStatus[demande.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition-colors`}
                            onClick={() => handleStatusChange(demande.id, 2)}
                          >
                            {loadingStatus[demande.id] ? 'Traitement...' : 'Rejeter'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {demandesFiltrees.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune demande trouvée</h3>
            <p className="text-gray-600">
              {demandesStage.length === 0 
                ? "Vous n'avez pas encore créé de demandes de stage."
                : "Essayez de modifier vos critères de recherche ou de filtre."
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Modal pour ajouter un commentaire lors du changement de statut */}
      {showCommentaireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <form onSubmit={handleCommentaireSubmit}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {statusToUpdate === 1 ? "Accepter" : "Rejeter"} la demande #{activeDemandeId}
              </h3>
              <div className="mb-4">
                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire {statusToUpdate === 2 ? "(obligatoire)" : "(optionnel)"}
                </label>
                <textarea
                  id="commentaire"
                  ref={commentaireRef}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  rows="4"
                  placeholder={statusToUpdate === 1 ? "Commentaire optionnel pour l'acceptation..." : "Veuillez préciser la raison du refus..."}
                  required={statusToUpdate === 2}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelCommentaire}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={statusToUpdate === 2 && !commentaire.trim()}
                  className={`px-4 py-2 rounded-md text-white ${
                    statusToUpdate === 1 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } transition-colors ${
                    (statusToUpdate === 2 && !commentaire.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {statusToUpdate === 1 ? "Accepter" : "Rejeter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MembreDirectionLayout>
  );
}