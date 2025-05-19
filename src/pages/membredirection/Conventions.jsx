import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, User, FileText, X, CheckCircle, XCircle, Clock, AlertCircle, Upload, BookOpen, Building, Calendar, Briefcase, MessageSquare } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { conventionAPI } from '../../utils/conventionAPI';
import { stageAPI } from '../../utils/stageAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { departementApi } from '../../services/departementApi';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';
import { stagiaireAPI } from '../../utils/stagiaireAPI';

export default function Conventions() {
  const [filtreStatus, setFiltreStatus] = useState('tous');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [conventions, setConventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeConventionId, setActiveConventionId] = useState(null);
  const [stagesDetails, setStagesDetails] = useState({});
  const [encadreursDetails, setEncadreursDetails] = useState({});
  const [departementsDetails, setDepartementsDetails] = useState({});
  const [domainesDetails, setDomainesDetails] = useState({});
  const [stagiairesDetails, setStagiairesDetails] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});
  const fileInputRef = useRef(null);
  
  const [commentaire, setCommentaire] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await membreDirectionAPI.getCurrentUser();
        setCurrentUser(userData);
        
        const allConventions = await conventionAPI.getAllConventions();
        {/*const conventionsFiltrees = allConventions.filter(convention => 
          convention.membreDirectionId === userData.id
        );
        setConventions(conventionsFiltrees);*/}
        setConventions(allConventions);
        const departements = await departementApi.getAllDepartements();
        const departmentsMap = {};
        departements.forEach(dept => {
          departmentsMap[dept.id] = dept;
        });
        setDepartementsDetails(departmentsMap);
        
        const domaines = await departementApi.getAllDomaines();
        const domainesMap = {};
        domaines.forEach(domaine => {
          domainesMap[domaine.id] = domaine;
        });
        setDomainesDetails(domainesMap);
        
        const stageIds = [...new Set(allConventions.map(conv => conv.stageId))];
        const stageDetailsMap = {};
        const encadreursMap = {};
        const stagiairesMap = {};
        
        const allStagiaires = await stagiaireAPI.getAllStagiaires();
        const stagiairesById = {};
        allStagiaires.forEach(stagiaire => {
          stagiairesById[stagiaire.id] = stagiaire;
        });
        
        for (const stageId of stageIds) {
          if (stageId) {
            try {
              const stageDetail = await stageAPI.getStage(stageId);
              stageDetailsMap[stageId] = stageDetail;
              
              if (stageDetail.stagiaires && stageDetail.stagiaires.length > 0) {
                stageDetail.stagiaires = stageDetail.stagiaires.map(stagiaire => {
                  if (stagiaire.id && stagiairesById[stagiaire.id]) {
                    return {
                      ...stagiaire,
                      ...stagiairesById[stagiaire.id]
                    };
                  }
                  return stagiaire;
                });
              }
              
              if (stageDetail.encadreurId && !encadreursMap[stageDetail.encadreurId]) {
                try {
                  const encadreurDetail = await encadreurAPI.getEncadreur(stageDetail.encadreurId);
                  encadreursMap[stageDetail.encadreurId] = encadreurDetail;
                } catch (encErr) {
                  console.error(`Erreur lors de la récupération de l'encadreur ${stageDetail.encadreurId}:`, encErr);
                }
              }
            } catch (stageErr) {
              console.error(`Erreur lors de la récupération du stage ${stageId}:`, stageErr);
            }
          }
        }
        
        setStagesDetails(stageDetailsMap);
        setEncadreursDetails(encadreursMap);
        setStagiairesDetails(stagiairesById);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les conventions. Veuillez réessayer plus tard.");
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

  const handleFileUploadClick = (conventionId) => {
    setActiveConventionId(conventionId);
    fileInputRef.current.click();
  };

  const handleDocumentDownload = async (cheminFichier) => {
    try {
      if (!cheminFichier || !cheminFichier.includes('/')) {
        setError('Lien de document invalide. Veuillez réessayer de télécharger le fichier.');
        return;
      }
      
      setLoading(true);
      await conventionAPI.downloadFile(cheminFichier);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du téléchargement du document:', err);
      setError(`Échec du téléchargement: ${err}`);
      setLoading(false);
    }
  };

  const updateConventionFile = async () => {
    if (!activeConventionId || !selectedFile) return;

    try {
      setLoading(true);
      setError('');
      
      const fileResponse = await conventionAPI.uploadFile(selectedFile);
      if (typeof fileResponse !== 'string') {
        throw new Error("Le serveur n'a pas renvoyé un chemin de fichier valide");
      }
      
      const cheminFichier = fileResponse;
      
      await conventionAPI.updateConvention(activeConventionId, {
        CheminFichier: cheminFichier
      });
      
      setConventions(prevConventions => 
        prevConventions.map(convention => 
          convention.id === activeConventionId ? { ...convention, cheminFichier } : convention
        )
      );
      
      setSuccess("Le fichier a été mis à jour avec succès.");
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du fichier de la convention ${activeConventionId}:`, err);
      setError(`Impossible de mettre à jour le fichier de la convention #${activeConventionId}: ${err}`);
    } finally {
      setSelectedFile(null);
      setActiveConventionId(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      updateConventionFile();
    }
  }, [selectedFile]);

  const accepterConvention = async (id) => {
    if (loadingStatus[id]) return;
    
    try {
      setLoadingStatus(prev => ({ ...prev, [id]: true }));
      await conventionAPI.updateConvention(id, {
        Status: 'Accepte'
      });
      
      setConventions(prevConventions => 
        prevConventions.map(convention => 
          convention.id === id ? { ...convention, status: 1 } : convention
        )
      );
      
      setSuccess(`La convention #${id} a été acceptée avec succès.`);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors de l'acceptation de la convention ${id}:`, err);
      setError(`Impossible d'accepter la convention #${id}.`);
    } finally {
      setLoadingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  const refuserConvention = async (id) => {
    if (loadingStatus[id]) return;
    
    try {
      setLoadingStatus(prev => ({ ...prev, [id]: true }));
      await conventionAPI.updateConvention(id, {
        Status: 'Refuse'
      });
      
      setConventions(prevConventions => 
        prevConventions.map(convention => 
          convention.id === id ? { ...convention, status: 2 } : convention
        )
      );
      
      setSuccess(`La convention #${id} a été rejetée avec succès.`);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors du refus de la convention ${id}:`, err);
      setError(`Impossible de refuser la convention #${id}.`);
    } finally {
      setLoadingStatus(prev => ({ ...prev, [id]: false }));
    }
  };
  const openCommentModal = (id, type) => {
    setActiveConventionId(id);
    setActionType(type);
    setCommentaire('');
    setShowCommentModal(true);
  };
  
  const handleConfirmAction = async () => {
    if (!activeConventionId || !actionType) return;
    
    try {
      setLoadingStatus(prev => ({ ...prev, [activeConventionId]: true }));
      
      if (actionType === 'accept') {
        await conventionAPI.updateConvention(activeConventionId, {
          Status: 'Accepte',
          Commentaire: commentaire
        });
        
        setConventions(prevConventions => 
          prevConventions.map(convention => 
            convention.id === activeConventionId ? { ...convention, status: 1, commentaire } : convention
          )
        );
        
        setSuccess(`La convention #${activeConventionId} a été acceptée avec succès.`);
      } else {
        await conventionAPI.updateConvention(activeConventionId, {
          Status: 'Refuse',
          Commentaire: commentaire
        });
        
        setConventions(prevConventions => 
          prevConventions.map(convention => 
            convention.id === activeConventionId ? { ...convention, status: 2, commentaire } : convention
          )
        );
        
        setSuccess(`La convention #${activeConventionId} a été rejetée avec succès.`);
      }
      
      setShowCommentModal(false);
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error(`Erreur lors du traitement de la convention ${activeConventionId}:`, err);
      setError(`Impossible de traiter la convention #${activeConventionId}.`);
    } finally {
      setLoadingStatus(prev => ({ ...prev, [activeConventionId]: false }));
    }
  };
  const conventionsFiltrees = conventions.filter(convention => {
    const statusMap = {
      'en_attente': 0,
      'accepte': 1,
      'rejete': 2
    };
    
    const matchStatus = filtreStatus === 'tous' || 
                       (typeof convention.status === 'number' && convention.status === statusMap[filtreStatus]) ||
                       convention.status === filtreStatus;
    
    const searchLower = filtreSearch.toLowerCase();
    const stageDetail = stagesDetails[convention.stageId];
    
    let matchStage = false;
    if (stageDetail) {
      const encadreur = encadreursDetails[stageDetail.encadreurId];
      
      const matchStagiaires = stageDetail.stagiaires?.some(stagiaire => 
        stagiaire.nom?.toLowerCase().includes(searchLower) ||
        stagiaire.prenom?.toLowerCase().includes(searchLower) ||
        stagiaire.email?.toLowerCase().includes(searchLower) ||
        stagiaire.universite?.toLowerCase().includes(searchLower) ||
        stagiaire.specialite?.toLowerCase().includes(searchLower)
      ) || false;
      
      const matchEncadreur = encadreur && (
        encadreur.nom?.toLowerCase().includes(searchLower) ||
        encadreur.prenom?.toLowerCase().includes(searchLower)
      );
      
      const departement = departementsDetails[stageDetail.departementId];
      const matchDepartement = departement && 
        departement.nom?.toLowerCase().includes(searchLower);
      
      const domaine = domainesDetails[stageDetail.domaineId];
      const matchDomaine = domaine && 
        domaine.nom?.toLowerCase().includes(searchLower);
      
      matchStage = matchStagiaires || matchEncadreur || matchDepartement || matchDomaine;
    }
    
    const matchOtherFields = 
      convention.id?.toString().includes(searchLower);
    
    return matchStatus && (matchStage || matchOtherFields || !searchLower);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusDisplay = (status) => {
    const statusValue = typeof status === 'number' ? status : 
                       (status === 'EnAttente' ? 0 : 
                        status === 'Accepte' ? 1 : 
                        status === 'Refuse' ? 2 : -1);
    
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

  const formatStagiaires = (stageId) => {
    const stageDetail = stagesDetails[stageId];
    
    if (!stageDetail || !stageDetail.stagiaires || stageDetail.stagiaires.length === 0) {
      return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    }
    
    return (
      <div>
        {stageDetail.stagiaires.map((stagiaire, index) => {
          const stagiaireComplet = stagiaire.id && stagiairesDetails[stagiaire.id] 
            ? { ...stagiaire, ...stagiairesDetails[stagiaire.id] } 
            : stagiaire;
          
          return (
            <div key={`stagiaire-${index}`} className="flex items-center text-sm text-gray-600 mb-2">
              <div className="flex-shrink-0 w-6">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <span className="font-medium">{stagiaireComplet.prenom} {stagiaireComplet.nom}</span>
                {stagiaireComplet.email && (
                  <>
                    <span className="mx-1">-</span>
                    <span className="text-gray-500 truncate">{stagiaireComplet.email}</span>
                  </>
                )}
                {stagiaireComplet.universite && (
                  <>
                    <span className="block text-xs text-gray-500">
                      {stagiaireComplet.universite}{stagiaireComplet.specialite ? ` - ${stagiaireComplet.specialite}` : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatStageDetails = (stageId) => {
    const stageDetail = stagesDetails[stageId];
    
    if (!stageDetail) {
      return <div className="text-sm text-gray-500">Détails du stage indisponibles</div>;
    }
    
    const encadreur = encadreursDetails[stageDetail.encadreurId];
    const departement = departementsDetails[stageDetail.departementId];
    const domaine = domainesDetails[stageDetail.domaineId];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <div className="flex-shrink-0 w-6">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <span>
            {formatDate(stageDetail.dateDebut)} - {formatDate(stageDetail.dateFin)}
          </span>
        </div>
        
        {departement && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-shrink-0 w-6">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <span>{departement.nom}</span>
          </div>
        )}
        
        {domaine && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-shrink-0 w-6">
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
            <span>{domaine.nom}</span>
          </div>
        )}
        
        {encadreur && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-shrink-0 w-6">
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <span>Encadré par {encadreur.prenom} {encadreur.nom}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="conventions">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des conventions...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="conventions">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
      />
      
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Conventions de stage</h1>
        
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
                  Toutes les conventions
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
          {conventionsFiltrees.map((convention) => {
            const statusInfo = getStatusDisplay(convention.status);
            
            return (
              <div key={convention.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Convention #{convention.id}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-4 mb-3">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Stagiaires</h4>
                      {formatStagiaires(convention.stageId)}
                    </div>
                    
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Détails du stage</h4>
                      {formatStageDetails(convention.stageId)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex-shrink-0 w-6">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center">
                        {convention.cheminFichier && convention.cheminFichier !== 'chemin_temporaire_sans_upload.pdf' ? (
                          <button 
                            onClick={() => handleDocumentDownload(convention.cheminFichier)}
                            className="text-blue-600 hover:underline mr-2 flex items-center"
                          >
                            Télécharger le document
                          </button>
                        ) : (
                          <span className="text-gray-500 mr-2">Aucun document</span>
                        )}
                        
                        <button 
                          onClick={() => handleFileUploadClick(convention.id)}
                          className="text-green-600 hover:text-green-800 text-xs flex items-center"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {convention.cheminFichier ? 'Modifier' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                    {convention.commentaire && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start text-sm text-gray-600">
                          <div className="flex-shrink-0 w-6 mt-0.5">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Commentaire:</span>
                            <p className="text-gray-600 mt-1">{convention.commentaire}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Crée le {formatDate(convention.dateDepot)}
                    </span>
                    <div className="flex space-x-2">
                    {convention.status === 0 && (
  <>
    <button 
      disabled={loadingStatus[convention.id]}
      className={`px-3 py-1 text-xs font-medium rounded ${loadingStatus[convention.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'} transition-colors`}
      onClick={() => openCommentModal(convention.id, 'accept')}
    >
      {loadingStatus[convention.id] ? 'Traitement...' : 'Accepter'}
    </button>
    <button 
      disabled={loadingStatus[convention.id]}
      className={`px-3 py-1 text-xs font-medium rounded ${loadingStatus[convention.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition-colors`}
      onClick={() => openCommentModal(convention.id, 'refuse')}
    >
      {loadingStatus[convention.id] ? 'Traitement...' : 'Rejeter'}
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

        {conventionsFiltrees.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune convention trouvée</h3>
            <p className="text-gray-600">
              {conventions.length === 0 
                ? "Aucune convention n'a été attribuée à votre service."
                : "Essayez de modifier vos critères de recherche ou de filtre."
              }
            </p>
          </div>
        )}
      </div>
      {showCommentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {actionType === 'accept' ? 'Accepter' : 'Rejeter'} la convention
      </h3>
      
      <div className="mb-4">
        <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
          Commentaire (facultatif)
        </label>
        <textarea
          id="commentaire"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          rows="4"
          placeholder="Ajoutez un commentaire explicatif..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={() => setShowCommentModal(false)}
        >
          Annuler
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
            actionType === 'accept' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
          onClick={handleConfirmAction}
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
)}
    </MembreDirectionLayout>
  );
}