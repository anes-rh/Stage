import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, User, X, CheckCircle, XCircle, Clock, AlertCircle, BookOpen, Building } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeAccordAPI } from '../../utils/demandeAccordAPI';
import { departementApi } from '../../services/departementApi';
import { chefdepartementAPI } from '../../utils/chefdepartementAPI';
import { demandeStageAPI } from '../../utils/demandeStageAPI';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';
import { themesAPI } from '../../utils/ThemeApi';

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

export default function DemandesAccord() {
  const [filtres, setFiltres] = useState({status: 'tous', search: ''});
  const [dropdowns, setDropdowns] = useState({});
  const [demandesAccord, setDemandesAccord] = useState([]);
  const [demandesStage, setDemandesStage] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [chefsDepartement, setChefsDepartement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showCompleterModal, setShowCompleterModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    themeNom: '', departementId: '', domaineId: '', natureStage: '',
    universiteInstitutEcole: '', filiereSpecialite: '', diplomeObtention: ''
  });
  const [chefDepartementSearch, setChefDepartementSearch] = useState('');
  const [selectedChefDepartement, setSelectedChefDepartement] = useState(null);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [departementAssigne, setDepartementAssigne] = useState(false);
  const [domaineAssigne, setDomaineAssigne] = useState(false);
  const [themeDetails, setThemeDetails] = useState({});

  useEffect(() => { fetchInitialData(); }, []);
  
  useEffect(() => {
    if (formData.departementId && domaines.length > 0) {
      setFilteredDomaines(domaines.filter(dom => dom.departementId === parseInt(formData.departementId)));
    } else {
      setFilteredDomaines([]);
    }
  }, [formData.departementId, domaines]);

  useEffect(() => {
    if (chefDepartementSearch) {
      const searchTerm = chefDepartementSearch.toLowerCase();
      setFilteredChefs(chefsDepartement.filter(chef => 
        `${chef.prenom} ${chef.nom}`.toLowerCase().includes(searchTerm) ||
        `${chef.nom} ${chef.prenom}`.toLowerCase().includes(searchTerm)
      ));
    } else {
      setFilteredChefs([]);
    }
  }, [chefDepartementSearch, chefsDepartement]);

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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [demandesAccordData, demandesStageData, departementsData, domainesData, chefsData, userData] = await Promise.all([
        demandeAccordAPI.getAllDemandesAccord(),
        demandeStageAPI.getAllDemandesStage(),
        departementApi.getAllDepartements(),
        departementApi.getAllDomaines(),
        chefdepartementAPI.getAllChefDepartements(),
        membreDirectionAPI.getCurrentUser()
      ]);
      
      setCurrentUser(userData);
      
      const demandesAccordWithNumericStatus = demandesAccordData.map(demande => ({
        ...demande,
        status: typeof demande.status === 'string' ? STATUS_CONVERSION[demande.status] : demande.status
      }));
      
      const demandesFiltrees = demandesAccordWithNumericStatus.filter(demande => {
        const demandeStage = demandesStageData.find(ds => ds.id === demande.demandeStageId);
        return demandeStage && demandeStage.membreDirection && demandeStage.membreDirection.id === userData.id;
      });
      
      setDemandesAccord(demandesFiltrees);
      setDemandesStage(demandesStageData);
      setDepartements(departementsData);
      setDomaines(domainesData);
      setChefsDepartement(chefsData.filter(chef => chef.estActif));
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDropdown = (name) => setDropdowns(prev => ({...prev, [name]: !prev[name]}));
  
  const updateFilterState = (key, value) => {
    setFiltres(prev => ({...prev, [key]: value}));
    setDropdowns({});
  };

  const updateDemandeStatus = async (id, newStatus) => {
    try {
      setError('');
      setSuccessMessage('');
      
      // Vérifie si le statut a déjà été modifié (n'est plus à 0 ou 3)
      const demande = demandesAccord.find(d => d.id === id);
      if (demande && (demande.status === 1 || demande.status === 2)) {
        setError(`Le statut de la demande #${id} a déjà été définitivement modifié et ne peut plus être changé.`);
        return;
      }
      
      await demandeAccordAPI.updateStatus(id, newStatus);
      setDemandesAccord(prevDemandes => 
        prevDemandes.map(demande => demande.id === id ? { ...demande, status: newStatus } : demande)
      );
      setSuccessMessage(`Le statut de la demande #${id} a été mis à jour avec succès.`);
      
      // Ferme le message de succès après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(`Impossible de mettre à jour le statut de la demande #${id}: ${err.message || err}`);
    }
  };

  const assignChefDepartement = async () => {
    if (!selectedDemande || !selectedChefDepartement) return;
    try {
      setError('');
      setSuccessMessage('');
      await demandeAccordAPI.assignChefDepartement(selectedDemande.id, selectedChefDepartement.id);
      setSuccessMessage(`Chef de département ${selectedChefDepartement.prenom} ${selectedChefDepartement.nom} assigné avec succès!`);
      await fetchInitialData();
      
      // Ferme le message de succès après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(`Erreur lors de l'assignation du chef de département: ${err.message || err}`);
    }
  };

  const handleModalActions = {
    open: async (demande) => {
      try {
        const completeDemandeData = await demandeAccordAPI.getDemandeAccord(demande.id);
        setSelectedDemande(completeDemandeData);
        const demandeStage = demandesStage.find(ds => ds.id === completeDemandeData.demandeStageId);
        const stagiaires = demandeStage?.stagiaires || [];
        
        let universiteValue = '';
        let filiereValue = '';
        if (stagiaires.length > 0) {
          universiteValue = stagiaires.find(s => s.universiteInstitutEcole)?.universiteInstitutEcole || 
                          stagiaires.find(s => s.universite)?.universite || '';
          filiereValue = stagiaires.find(s => s.filiereSpecialite)?.filiereSpecialite || 
                        stagiaires.find(s => s.specialite)?.specialite || '';
        }
        
        setFormData({
          themeNom: completeDemandeData.themeNom || '',
          departementId: completeDemandeData.chefDepartement?.departementId || '',
          domaineId: completeDemandeData.theme?.domaineId || '',
          natureStage: completeDemandeData.natureStage || '',
          universiteInstitutEcole: completeDemandeData.universiteInstitutEcole || universiteValue || '',
          filiereSpecialite: completeDemandeData.filiereSpecialite || filiereValue || '',
          diplomeObtention: completeDemandeData.diplomeObtention || '',
        });
        
        setChefDepartementSearch('');
        setFilteredChefs([]);
        
        if (completeDemandeData.chefDepartementId) {
          setSelectedChefDepartement(chefsDepartement.find(chef => chef.id === completeDemandeData.chefDepartementId) || null);
        } else {
          setSelectedChefDepartement(null);
        }
        
        setDepartementAssigne(!!completeDemandeData.chefDepartement?.departementId);
        setDomaineAssigne(!!completeDemandeData.theme?.domaineId);
        
        setShowCompleterModal(true);
      } catch (err) {
        setError(`Erreur lors de la récupération des détails de la demande #${demande.id}: ${err.message || err}`);
      }
    },
    close: () => {
      setShowCompleterModal(false);
      setSelectedDemande(null);
      setSelectedChefDepartement(null);
      setChefDepartementSearch('');
    },
    save: async (e) => {
      e.preventDefault();
      if (!selectedDemande) return;
      try {
        setError('');
        setSuccessMessage('');
        await demandeAccordAPI.updateMembreDirectionPart(selectedDemande.id, {
          themeNom: formData.themeNom,
          departementId: parseInt(formData.departementId) || 0,
          domaineId: parseInt(formData.domaineId) || 0,
          natureStage: formData.natureStage,
          universiteInstitutEcole: formData.universiteInstitutEcole,
          filiereSpecialite: formData.filiereSpecialite,
          diplomeObtention: formData.diplomeObtention
        });
        await fetchInitialData();
        setSuccessMessage("Les informations ont été enregistrées avec succès!");
        setShowCompleterModal(false);
        
        // Ferme le message de succès après 5 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } catch (err) {
        setError(`Erreur lors de la mise à jour des informations: ${err.message || err}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const selectChefDepartement = (chef) => {
    setSelectedChefDepartement(chef);
    setChefDepartementSearch('');
    setFilteredChefs([]);
  };

  const clearSelectedChefDepartement = () => {
    setSelectedChefDepartement(null);
    setChefDepartementSearch('');
  };

  const getDemandeStageInfo = (demandeStageId) => demandesStage.find(ds => ds.id === demandeStageId) || {};

  const formatStagiaires = (demande) => {
    if (!demande.stagiaireNomComplet) {
      return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    }
    
    const demandeStage = getDemandeStageInfo(demande.demandeStageId);
    const stagiaireInfos = demandeStage.stagiaires || [];
    
    const stagiaireItems = stagiaireInfos.map((stagiaire, index) => (
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
      let uni = '';
      let spec = '';
      
      if (stagiaireInfos.length > 0) {
        uni = stagiaireInfos[0].universite || stagiaireInfos[0].universiteInstitutEcole || demande.universiteInstitutEcole || '';
        spec = stagiaireInfos[0].specialite || stagiaireInfos[0].filiereSpecialite || demande.filiereSpecialite || '';
      }
      
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
      'tous': true,'en_cours': demande.status === 0, 'accepte': demande.status === 1,
      'rejete': demande.status === 2,'en_attente': demande.status === 3
    };
    
    const matchStatus = statusMap[filtres.status] || filtres.status === 'tous';
    
    const searchLower = filtres.search.toLowerCase();
    if (!searchLower) return matchStatus;
    
    let matchStagiaires = false;
    if (demande.stagiaireNomComplet) {
      matchStagiaires = demande.stagiaireNomComplet.toLowerCase().includes(searchLower);
    }
    
    const demandeStage = getDemandeStageInfo(demande.demandeStageId);
    const stagiaireInfo = demandeStage.stagiaires || [];
    
    const matchStagiaireInfo = stagiaireInfo.some(s => 
      (s.nom + ' ' + s.prenom).toLowerCase().includes(searchLower) ||
      (s.email && s.email.toLowerCase().includes(searchLower)) ||
      (s.universiteInstitutEcole && s.universiteInstitutEcole.toLowerCase().includes(searchLower)) ||
      (s.filiereSpecialite && s.filiereSpecialite.toLowerCase().includes(searchLower))
    );
    
    const fieldsToSearch = [
      demande.id?.toString(), demande.themeNom, demande.universiteInstitutEcole,
      demande.filiereSpecialite, demande.email
    ].filter(Boolean).join(' ').toLowerCase();
    
    return matchStatus && (matchStagiaires || matchStagiaireInfo || fieldsToSearch.includes(searchLower));
  });

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="demandes-accord">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des demandes d'accord...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  const canChangeStatus = (demande) => demande.status === 0 || demande.status === 3;

  return (
    <MembreDirectionLayout defaultActivePage="demandes-accord">
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Demandes d'accord</h1>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button className="ml-auto text-red-700 hover:text-red-900" onClick={() => setError('')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
            <button className="ml-auto text-green-700 hover:text-green-900" onClick={() => setSuccessMessage('')}>
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
                      {canChangeStatus(demande) ? (
                        <>
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors" 
                            onClick={() => updateDemandeStatus(demande.id, 1)}
                          >
                            Accepter
                          </button>
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors" 
                            onClick={() => updateDemandeStatus(demande.id, 2)}
                          >
                            Rejeter
                          </button>
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors" 
                            onClick={() => handleModalActions.open(demande)}
                          >
                            Compléter
                          </button>
                        </>
                      ) : null}
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
              {demandesAccord.length === 0 ? "Vous n'avez pas encore de demandes d'accord." : "Essayez de modifier vos critères de recherche ou de filtre."}
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
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Chef de département</h4>
            <div className="mb-4">
              {selectedChefDepartement ? (
                <div className="flex items-center space-x-2 p-3 border rounded-md bg-green-50">
                  <div className="flex-grow">
                    <div className="font-medium">{selectedChefDepartement.prenom} {selectedChefDepartement.nom}</div>
                    {selectedChefDepartement.email && <div className="text-sm text-gray-500">{selectedChefDepartement.email}</div>}
                  </div>
                  <button 
                    type="button"
                    onClick={clearSelectedChefDepartement}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={chefDepartementSearch}
                    onChange={(e) => setChefDepartementSearch(e.target.value)}
                    placeholder="Rechercher un chef de département..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  />
                  {filteredChefs.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredChefs.map((chef) => (
                        <div 
                          key={chef.id}
                          onClick={() => selectChefDepartement(chef)}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                        >
                          <div className="font-medium">{chef.prenom} {chef.nom}</div>
                          {chef.email && <div className="text-xs text-gray-500">{chef.email}</div>}
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
                onClick={assignChefDepartement}
                disabled={!selectedChefDepartement}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assigner le chef de département
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Informations générales</h4>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Diplôme d'obtention</label>
              <input 
                type="text" 
                name="diplomeObtention"
                value={formData.diplomeObtention}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300" 
                placeholder="Diplôme pour tous les stagiaires"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Université/Institut/École</label>
              <input 
                type="text" 
                name="universiteInstitutEcole"
                value={formData.universiteInstitutEcole}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300" 
                placeholder="Nom de l'établissement"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Filière/Spécialité</label>
              <input 
                type="text" 
                name="filiereSpecialite"
                value={formData.filiereSpecialite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300" 
                placeholder="Filière ou spécialité"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Département</label>
                <select 
                  name="departementId"
                  value={formData.departementId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  disabled={departementAssigne}
                >
                  <option value="">Sélectionner</option>
                  {departements.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.nom}</option>
                  ))}
                </select>
                {departementAssigne && <p className="text-xs text-gray-500 mt-1">Le département est déjà assigné et ne peut plus être modifié.</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Domaine</label>
                <select 
                  name="domaineId"
                  value={formData.domaineId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
                  disabled={domaineAssigne}
                >
                  <option value="">Sélectionner</option>
                  {filteredDomaines.map((domaine) => (
                    <option key={domaine.id} value={domaine.id}>{domaine.nom}</option>
                  ))}
                </select>
                {domaineAssigne && <p className="text-xs text-gray-500 mt-1">Le domaine est déjà assigné et ne peut plus être modifié.</p>}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Informations du stage</h4>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Thème</label>
              <input 
                type="text"
                name="themeNom"
                value={formData.themeNom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300" 
                placeholder="Titre du sujet"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Nature du stage sollicité</label>
              <select 
                name="natureStage"
                value={formData.natureStage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300"
              >
                <option value="">Sélectionner</option>
                <option value="StageImpregnation">Stage d'imprégnation</option>
                <option value="StageFinEtude">Stage pour un mémoire de fin d'étude</option>
              </select>
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
    </MembreDirectionLayout>
  );
}