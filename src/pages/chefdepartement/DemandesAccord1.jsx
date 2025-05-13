import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, User, X, CheckCircle, XCircle, Clock, AlertCircle, BookOpen, Building } from 'lucide-react';
import ChefDepartementLayout from '../../components/layout/ChefDepartementLayout';
import { demandeAccordAPI } from '../../utils/demandeAccordAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { chefdepartementAPI } from '../../utils/chefdepartementAPI';
import { themesAPI } from '../../utils/ThemeApi';
import { demandeStageAPI } from '../../utils/demandeStageAPI';

const STATUS_MAP = {
  0: {label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4 mr-1" />},
  1: {label: 'Acceptée', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" />},
  2: {label: 'Rejetée', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" />},
  3: {label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" />}
};

const STATUS_CONVERSION = {
  'EnCours': 0, 'Accepte': 1, 'Refuse': 2, 'EnAttente': 3
};

const formatDate = (dateString) => !dateString ? 'Date inconnue' : 
  new Date(dateString).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'});

const getStatusInfo = (status) => {
  const statusValue = typeof status === 'string' ? STATUS_CONVERSION[status] : status;
  return STATUS_MAP[statusValue] || {label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="h-4 w-4 mr-1" />};
};

// Composant Toast pour les notifications
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 
                 type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
                 'bg-blue-50 border-blue-200 text-blue-700';
  
  const icon = type === 'success' ? <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /> :
              type === 'error' ? <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /> :
              <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`mb-4 ${bgColor} border px-4 py-3 rounded-lg flex items-start shadow-sm`}>
      {icon}
      <p>{message}</p>
      <button className="ml-auto text-current hover:text-gray-900" onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function DemandesAccord1() {
  const [filtres, setFiltres] = useState({status: 'tous', search: ''});
  const [dropdowns, setDropdowns] = useState({});
  const [demandesAccord, setDemandesAccord] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showCompleterModal, setShowCompleterModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    serviceAccueil: '', dateDebut: '', dateFin: '', 
    nombreSeancesParSemaine: 1, dureeSeances: 1
  });
  const [encadreurSearch, setEncadreurSearch] = useState('');
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [filteredEncadreurs, setFilteredEncadreurs] = useState([]);
  const [themeDetails, setThemeDetails] = useState({});
  const [demandesStageMap, setDemandesStageMap] = useState({});
  // État pour les notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchInitialData(); }, []);
  
  useEffect(() => {
    if (encadreurSearch) {
      const searchTerm = encadreurSearch.toLowerCase();
      setFilteredEncadreurs(encadreurs.filter(encadreur => 
        `${encadreur.nom} ${encadreur.prenom}`.toLowerCase().includes(searchTerm) ||
        `${encadreur.prenom} ${encadreur.nom}`.toLowerCase().includes(searchTerm)
      ));
    } else {
      setFilteredEncadreurs([]);
    }
  }, [encadreurSearch, encadreurs]);

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        const themes = {};
        for (const demande of demandesAccord) {
          if (demande.themeId) {
            themes[demande.themeId] = await themesAPI.getTheme(demande.themeId);
          }
        }
        setThemeDetails(themes);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails des thèmes:", err);
      }
    };
    
    if (demandesAccord.length > 0) {
      fetchThemeDetails();
    }
  }, [demandesAccord]);

  useEffect(() => {
    const fetchDemandesStage = async () => {
      try {
        const demandesStageData = {};
        
        for (const demande of demandesAccord) {
          if (demande.demandeStageId) {
            const demandeStage = await demandeStageAPI.getDemandeStage(demande.demandeStageId);
            demandesStageData[demande.demandeStageId] = demandeStage;
          }
        }
        
        setDemandesStageMap(demandesStageData);
      } catch (err) {
        console.error("Erreur lors de la récupération des demandes de stage:", err);
      }
    };
    
    if (demandesAccord.length > 0) {
      fetchDemandesStage();
    }
  }, [demandesAccord]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const userData = await chefdepartementAPI.getCurrentUser();
      setCurrentUser(userData);
      
      const demandesAccordData = await demandeAccordAPI.getDemandesByChefDepartement(userData.id);
      
      const demandesAccordWithNumericStatus = demandesAccordData.map(demande => ({
        ...demande,
        status: typeof demande.status === 'string' ? STATUS_CONVERSION[demande.status] : demande.status
      }));
      
      setDemandesAccord(demandesAccordWithNumericStatus);
      
      const encadreursData = await encadreurAPI.getAllEncadreurs();
      setEncadreurs(encadreursData.filter(encadreur => encadreur.estActif));
      
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter une notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-effacement après 5 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };

  // Fonction pour supprimer une notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const toggleDropdown = (name) => setDropdowns(prev => ({...prev, [name]: !prev[name]}));
  const updateFilterState = (key, value) => {
    setFiltres(prev => ({...prev, [key]: value}));
    setDropdowns({});
  };

  const assignEncadreur = async () => {
    if (!selectedDemande || !selectedEncadreur) return;
    try {
      setError('');
      await demandeAccordAPI.assignEncadreur(selectedDemande.id, selectedEncadreur.id);
      // Remplacer l'alerte par une notification
      addNotification(`Encadreur ${selectedEncadreur.prenom} ${selectedEncadreur.nom} assigné avec succès!`, 'success');
      await fetchInitialData();
    } catch (err) {
      setError(`Erreur lors de l'assignation de l'encadreur: ${err.message || err}`);
    }
  };

  const handleModalActions = {
    open: async (demande) => {
      try {
        const completeDemandeData = await demandeAccordAPI.getDemandeAccord(demande.id);
        setSelectedDemande(completeDemandeData);
        
        setFormData({
          serviceAccueil: completeDemandeData.serviceAccueil || '',
          dateDebut: completeDemandeData.dateDebut ? new Date(completeDemandeData.dateDebut).toISOString().split('T')[0] : '',
          dateFin: completeDemandeData.dateFin ? new Date(completeDemandeData.dateFin).toISOString().split('T')[0] : '',
          nombreSeancesParSemaine: completeDemandeData.nombreSeancesParSemaine || 1,
          dureeSeances: completeDemandeData.dureeSeances || 1,
        });
        
        setEncadreurSearch('');
        setFilteredEncadreurs([]);
        
        if (completeDemandeData.encadreurId) {
          try {
            const encadreurData = await encadreurAPI.getEncadreur(completeDemandeData.encadreurId);
            setSelectedEncadreur(encadreurData || null);
          } catch (err) {
            console.error("Erreur lors de la récupération de l'encadreur:", err);
            setSelectedEncadreur(null);
          }
        } else {
          setSelectedEncadreur(null);
        }
        
        setShowCompleterModal(true);
      } catch (err) {
        setError(`Erreur lors de la récupération des détails de la demande #${demande.id}: ${err.message || err}`);
      }
    },
    close: () => {
      setShowCompleterModal(false);
      setSelectedDemande(null);
      setSelectedEncadreur(null);
      setEncadreurSearch('');
    },
    save: async (e) => {
      e.preventDefault();
      if (!selectedDemande) return;
      try {
        setError('');
        await demandeAccordAPI.updateChefDepartementPart(selectedDemande.id, {
          serviceAccueil: formData.serviceAccueil,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          nombreSeancesParSemaine: parseInt(formData.nombreSeancesParSemaine) || 1,
          dureeSeances: parseInt(formData.dureeSeances) || 1
        });
        await fetchInitialData();
        // Remplacer l'alerte par une notification
        addNotification("Les informations ont été enregistrées avec succès!", "success");
        setShowCompleterModal(false);
      } catch (err) {
        setError(`Erreur lors de la mise à jour des informations: ${err.message || err}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const selectEncadreur = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setEncadreurSearch('');
    setFilteredEncadreurs([]);
  };

  const clearSelectedEncadreur = () => {
    setSelectedEncadreur(null);
    setEncadreurSearch('');
  };

  const formatStagiaires = (demande) => {
    // Récupérer les stagiaires de la demande de stage associée si disponible
    let stagiairesInfo = [];
    
    if (demande.demandeStageId && demandesStageMap[demande.demandeStageId]) {
      const demandeStage = demandesStageMap[demande.demandeStageId];
      
      if (demandeStage.stagiaires && Array.isArray(demandeStage.stagiaires)) {
        stagiairesInfo = demandeStage.stagiaires;
      }
    }
    
    // Utiliser également les stagiaires déjà associés à la demande d'accord si disponibles
    if (demande.stagiaires && Array.isArray(demande.stagiaires) && demande.stagiaires.length > 0) {
      // Si nous avons déjà des stagiaires dans la demande d'accord, utiliser ceux-ci
      stagiairesInfo = demande.stagiaires;
    }
    
    if (stagiairesInfo.length === 0 && demande.stagiaireNomComplet) {
      // Fallback si nous n'avons que le nom complet
      stagiairesInfo = [{ nom: demande.stagiaireNomComplet, prenom: '', email: '' }];
    }
    
    if (stagiairesInfo.length === 0) {
      return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    }
    
    const stagiaireItems = stagiairesInfo.map((stagiaire, index) => (
      <div key={`stagiaire-${index}`} className="flex items-center text-sm text-gray-600 mb-2">
        <div className="flex-shrink-0 w-6"><User className="h-4 w-4 text-gray-400" /></div>
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
    
    const getUniqueUniSpec = () => {
      const uni = demande.universiteInstitutEcole || '';
      const spec = demande.filiereSpecialite || '';
      return { uni, spec };
    };
    
    const { uni, spec } = getUniqueUniSpec();
    
    const getThemeInfo = () => {
      let themeName = demande.themeNom || '';
      let departementName = '';
      let domaineName = '';
      
      if (demande.themeId && themeDetails[demande.themeId]) {
        const theme = themeDetails[demande.themeId];
        themeName = theme.nom || themeName;
        departementName = theme.departement?.nom || '';
        domaineName = theme.domaine?.nom || '';
      } else if (demande.theme) {
        themeName = demande.theme.nom || themeName;
        departementName = demande.theme.departement?.nom || '';
        domaineName = demande.theme.domaine?.nom || '';
      }
      
      return { themeName, departementName, domaineName };
    };
    
    const { themeName, departementName, domaineName } = getThemeInfo();
    
    const getNatureStage = (natureValue) => {
      const natureMap = {
        'StageImpregnation': 'Stage d\'imprégnation', 'StageFinEtude': 'Stage de fin d\'étude',
        '0': 'Stage d\'imprégnation', '1': 'Stage de fin d\'étude',
        0: 'Stage d\'imprégnation', 1: 'Stage de fin d\'étude'
      };
      return natureMap[natureValue] || natureValue || '';
    };
    
    return (
      <div>
        <div className="mb-2">{stagiaireItems}</div>
        
        {(uni || spec) && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="flex-shrink-0 w-6"><Building className="h-4 w-4 text-gray-400" /></div>
            <span>{uni}{uni && spec && ' - '}{spec}</span>
          </div>
        )}
        
        {(themeName || departementName || domaineName) && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="flex-shrink-0 w-6"><BookOpen className="h-4 w-4 text-gray-400" /></div>
            <span>
              {themeName && <span className="font-medium">{themeName}</span>}
              {themeName && (departementName || domaineName) && ' - '}
              {departementName}{departementName && domaineName && ' / '}{domaineName}
            </span>
          </div>
        )}
        
        {demande.natureStage !== null && demande.natureStage !== undefined && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="flex-shrink-0 w-6"><Clock className="h-4 w-4 text-gray-400" /></div>
            <span>{getNatureStage(demande.natureStage)}</span>
          </div>
        )}
      </div>
    );
  };

  const demandesFiltrees = demandesAccord.filter(demande => {
    const statusMap = {
      'tous': true, 'en_cours': demande.status === 0, 'accepte': demande.status === 1,
      'rejete': demande.status === 2,'en_attente' : demande.status === 3
    };
    
    const matchStatus = statusMap[filtres.status] || filtres.status === 'tous';
    
    const searchLower = filtres.search.toLowerCase();
    if (!searchLower) return matchStatus;
    
    let matchStagiaires = false;
    if (demande.stagiaireNomComplet) {
      matchStagiaires = demande.stagiaireNomComplet.toLowerCase().includes(searchLower);
    }
    
    // Recherche dans les stagiaires de la demande
    const searchInStagiaires = (stagiaires) => {
      if (!stagiaires || !Array.isArray(stagiaires)) return false;
      return stagiaires.some(s => 
        (s.nom + ' ' + s.prenom).toLowerCase().includes(searchLower) ||
        (s.prenom + ' ' + s.nom).toLowerCase().includes(searchLower) ||
        (s.email && s.email.toLowerCase().includes(searchLower))
      );
    };
    
    const matchStagiaireInfo = searchInStagiaires(demande.stagiaires);
    
    // Recherche dans les stagiaires de la demande de stage associée
    let matchDemandeStage = false;
    if (demande.demandeStageId && demandesStageMap[demande.demandeStageId]) {
      const demandeStage = demandesStageMap[demande.demandeStageId];
      matchDemandeStage = searchInStagiaires(demandeStage.stagiaires);
    }
    
    const fieldsToSearch = [
      demande.id?.toString(), demande.themeNom, demande.universiteInstitutEcole,
      demande.filiereSpecialite, demande.email, demande.serviceAccueil
    ].filter(Boolean).join(' ').toLowerCase();
    
    return matchStatus && (matchStagiaires || matchStagiaireInfo || matchDemandeStage || fieldsToSearch.includes(searchLower));
  });

  if (loading) {
    return (
      <ChefDepartementLayout defaultActivePage="demandes-accord">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des demandes d'accord...</p>
        </div>
      </ChefDepartementLayout>
    );
  }

  return (
    <ChefDepartementLayout defaultActivePage="demandes-accord">
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Demandes d'accord</h1>
        
        {/* Zone de notifications */}
        <div className="notifications-container mb-4">
          {notifications.map(notification => (
            <Toast
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button className="ml-auto text-red-700 hover:text-red-900" onClick={() => setError('')}>
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
              value={filtres.search}
              onChange={(e) => updateFilterState('search', e.target.value)}
            />
            {filtres.search && (
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600" onClick={() => updateFilterState('search', '')}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('filter')} 
              className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtrer par statut</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {dropdowns.filter && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <button className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtres.status === 'tous' ? 'bg-green-50 text-green-700' : ''}`} onClick={() => updateFilterState('status', 'tous')}>Toutes les demandes</button>
                <button className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtres.status === 'en_attente' ? 'bg-green-50 text-green-700' : ''}`} onClick={() => updateFilterState('status', 'en_attente')}>En attente</button>
                <button className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtres.status === 'accepte' ? 'bg-green-50 text-green-700' : ''}`} onClick={() => updateFilterState('status', 'accepte')}>Acceptées</button>
                <button className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtres.status === 'rejete' ? 'bg-green-50 text-green-700' : ''}`} onClick={() => updateFilterState('status', 'rejete')}>Rejetées</button>
                <button className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtres.status === 'en_cours' ? 'bg-green-50 text-green-700' : ''}`} onClick={() => updateFilterState('status', 'en_cours')}>En cours</button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandesFiltrees.map((demande) => {
            const statusInfo = getStatusInfo(demande.status);
            const statusChanged = demande.status === 1 || demande.status === 2; // Statut Accepté ou Rejeté
            
            return (
              <div key={demande.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">Accord #{demande.id}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {formatStagiaires(demande)}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Créée le {formatDate(demande.dateCreation)}</span>
                    <div className="flex space-x-2">
                      {/* Le bouton Compléter ne s'affiche que si le statut n'est pas changé */}
                      {!statusChanged && (
                        <button 
                          className="px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors" 
                          onClick={() => handleModalActions.open(demande)}
                        >
                          Compléter
                        </button>
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
            <div className="text-gray-400 mb-3"><Search className="h-12 w-12 mx-auto" /></div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune demande d'accord trouvée</h3>
            <p className="text-gray-600">
              {demandesAccord.length === 0 ? "Vous n'avez pas encore de demandes d'accord assignées." : "Essayez de modifier vos critères de recherche ou de filtre."}
            </p>
          </div>
        )}
      </div>
      {showCompleterModal && selectedDemande && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <div className="p-5 bg-green-50 border-b border-green-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-green-800">Compléter les informations - Accord #{selectedDemande.id}</h3>
        <button onClick={handleModalActions.close} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={handleModalActions.save} className="p-5 overflow-y-auto max-h-[calc(90vh-4rem)]">
        <div className="space-y-5">
          {/* Assignation d'encadreur */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Encadreur</h4>
            <div className="mb-4">
              {selectedEncadreur ? (
                <div className="flex items-center space-x-2 p-3 border rounded-md bg-green-50">
                  <div className="flex-grow">
                    <div className="font-medium">{selectedEncadreur.prenom} {selectedEncadreur.nom}</div>
                    {selectedEncadreur.email && <div className="text-sm text-gray-500">{selectedEncadreur.email}</div>}
                  </div>
                  <button 
                    type="button"
                    onClick={clearSelectedEncadreur}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={encadreurSearch}
                    onChange={(e) => setEncadreurSearch(e.target.value)}
                    placeholder="Rechercher un encadreur..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  />
                  {filteredEncadreurs.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredEncadreurs.map((encadreur) => (
                        <div 
                          key={encadreur.id}
                          onClick={() => selectEncadreur(encadreur)}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                        >
                          <div className="font-medium">{encadreur.prenom} {encadreur.nom}</div>
                          {encadreur.email && <div className="text-xs text-gray-500">{encadreur.email}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={assignEncadreur}
                disabled={!selectedEncadreur}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assigner l'encadreur
              </button>
            </div>
          </div>
          
          {/* Informations spécifiques au chef de département */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Informations du stage</h4>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Service d'accueil <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="serviceAccueil"
                value={formData.serviceAccueil}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300" 
                placeholder="Nom du service d'accueil"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date de début <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date de fin <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre de séances par semaine <span className="text-red-500">*</span></label>
                <select 
                  name="nombreSeancesParSemaine"
                  value={formData.nombreSeancesParSemaine}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  required
                >
                  <option value="1">1 séance</option>
                  <option value="2">2 séances</option>
                  <option value="3">3 séances</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Durée des séances (heures) <span className="text-red-500">*</span></label>
                <select 
                  name="dureeSeances"
                  value={formData.dureeSeances}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  required
                >
                  <option value="1">1 heure</option>
                  <option value="2">2 heures</option>
                  <option value="3">3 heures</option>
                  <option value="4">4 heures</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleModalActions.close} className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">Annuler</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
)}
</ChefDepartementLayout>
  );
}