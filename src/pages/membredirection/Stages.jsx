import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, ChevronDown, User, X, CheckCircle, XCircle, Clock, 
  AlertCircle, Calendar, Building, BookOpen, Briefcase, Clipboard, Users, 
  BarChart2, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { stageAPI } from '../../utils/stageAPI';
import { departementApi } from '../../services/departementApi';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { themesAPI } from '../../utils/ThemeApi';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { fichePointageAPI } from '../../utils/fichePointageAPI';

// Components
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600">Chargement des stages...</p>
  </div>
);

const ErrorMessage = ({ message, onClose }) => (
  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
    <p>{message}</p>
    <button className="ml-auto text-red-700 hover:text-red-900" onClick={onClose}>
      <X className="h-4 w-4" />
    </button>
  </div>
);

const EmptyState = ({ hasStages }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-gray-400 mb-3">
      <Search className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-1">Aucun stage trouvé</h3>
    <p className="text-gray-600">
      {!hasStages 
        ? "Aucun stage n'a été attribué à votre service."
        : "Essayez de modifier vos critères de recherche ou de filtre."
      }
    </p>
  </div>
);

const SearchBar = ({ value, onChange }) => (
  <div className="relative group">
    <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
    <input
      type="text"
      placeholder="Rechercher..."
      className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button 
        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600" 
        onClick={() => onChange('')}
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const FilterDropdown = ({ value, onChange, isOpen, toggleOpen }) => (
  <div className="relative">
    <button 
      onClick={toggleOpen}
      className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
    >
      <Filter className="h-4 w-4 mr-2" />
      <span>Filtrer par status</span>
      <ChevronDown className="h-4 w-4 ml-2" />
    </button>

    {isOpen && (
      <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
        {[
          { id: 'tous', label: 'Tous les stages' },
          { id: 'en_attente', label: 'En attente' },
          { id: 'en_cours', label: 'En cours' },
          { id: 'termine', label: 'Terminé' },
          { id: 'annule', label: 'Annulé' },
          { id: 'prolonge', label: 'Prolongé' }
        ].map(status => (
          <button 
            key={status.id}
            className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === status.id ? 'bg-green-50 text-green-700' : ''}`}
            onClick={() => {
              onChange(status.id);
              toggleOpen();
            }}
          >
            {status.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

// Main Component
export default function Stages() {
  const [filtreStatus, setFiltreStatus] = useState('tous');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedStageId, setExpandedStageId] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  
  // Reference data
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [themes, setThemes] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [fichesPointage, setFichesPointage] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch all data in parallel
        const [stagesData, departementsData, domainesData, encadreursData, themesData, stagiairesData, fichesPointageData] = 
          await Promise.all([
            stageAPI.getAllStages(),
            departementApi.getAllDepartements(),
            departementApi.getAllDomaines(),
            encadreurAPI.getAllEncadreurs(),
            themesAPI.getAllThemes(),
            stagiaireAPI.getAllStagiaires(),
            fichePointageAPI.getAllFichesPointage()
          ]);
        
        // Set all state at once to avoid multiple re-renders
        setStages(stagesData);
        setDepartements(departementsData);
        setDomaines(domainesData);
        setEncadreurs(encadreursData);
        setThemes(themesData);
        setStagiaires(stagiairesData);
        setFichesPointage(fichesPointageData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helpers - moved outside component render to prevent recreation on each render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }, []);

  const getStatusDisplay = useCallback((status) => {
    switch(status) {
      case 'EnAttente':
      case 0:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> };
      case 'EnCours':
      case 1:
        return { label: 'En cours', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'Termine':
      case 2:
        return { label: 'Terminé', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'Annule':
      case 3:
        return { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> };
      case 'Prolonge':
      case 4:
        return { label: 'Prolongé', color: 'bg-purple-100 text-purple-800', icon: <ChevronRight className="h-4 w-4 mr-1" /> };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  }, []);

  // Memoize expensive operations
  const stagesEnrichis = useMemo(() => {
    return stages.map(stage => {
      const encadreurComplet = encadreurs.find(e => e.id === stage.encadreurId) || {
        nom: "Non assigné",
        prenom: "Non assigné"
      };
      
      const departementComplet = departements.find(d => d.id === stage.departementId) || {
        nom: "Non assigné"
      };
      
      const themeAssocie = themes.find(t => t.stageId === stage.id);

    const domaineComplet = themeAssocie && themeAssocie.domaineId 
      ? domaines.find(d => d.id === themeAssocie.domaineId)
      : stage.domaineId
        ? domaines.find(d => d.id === stage.domaineId)
        : { nom: "Non assigné" };

      const stagiairesEnrichis = Array.isArray(stage.stagiaires) 
        ? stage.stagiaires.map(stagiaireBasic => {
            const stagiaireComplet = stagiaires.find(s => s.id === stagiaireBasic.id);
            const fichePointageStagiaire = fichesPointage.find(f => f.stagiaireId === stagiaireBasic.id);
            return {
              ...(stagiaireComplet || stagiaireBasic),
              fichePointageId: fichePointageStagiaire?.id
            };
          })
        : [];
      
      return {
        ...stage,
        encadreur: {
          id: encadreurComplet.id,
          nom: encadreurComplet.nom,
          prenom: encadreurComplet.prenom
        },
        departement: departementComplet.nom,
        domaine: domaineComplet.nom,
        theme: themeAssocie?.nom,
        stagiaires: stagiairesEnrichis
      };
    });
  }, [stages, encadreurs, departements, domaines, themes, stagiaires, fichesPointage]);

  const stagesFiltres = useMemo(() => {
    return stagesEnrichis.filter(stage => {
      const statusMap = {
        'en_attente': stage.statut === 'EnAttente' || stage.statut === 0,
        'en_cours': stage.statut === 'EnCours' || stage.statut === 1,
        'termine': stage.statut === 'Termine' || stage.statut === 2,
        'annule': stage.statut === 'Annule' || stage.statut === 3,
        'prolonge': stage.statut === 'Prolonge' || stage.statut === 4
      };
      
      const matchStatus = filtreStatus === 'tous' || statusMap[filtreStatus];
      
      // Only perform search filtering if there's actually a search term
      if (!filtreSearch) return matchStatus;
      
      const searchLower = filtreSearch.toLowerCase();
      
      // Check all searchable fields
      return matchStatus && (
        stage.departement?.toLowerCase().includes(searchLower) ||
        stage.domaine?.toLowerCase().includes(searchLower) ||
        stage.sujet?.toLowerCase().includes(searchLower) ||
        stage.description?.toLowerCase().includes(searchLower) ||
        stage.encadreur?.nom?.toLowerCase().includes(searchLower) ||
        stage.encadreur?.prenom?.toLowerCase().includes(searchLower) ||
        stage.theme?.toLowerCase().includes(searchLower) ||
        stage.stagiaires?.some(stagiaire => 
          stagiaire.nom?.toLowerCase().includes(searchLower) ||
          stagiaire.prenom?.toLowerCase().includes(searchLower) ||
          stagiaire.email?.toLowerCase().includes(searchLower) ||
          stagiaire.universite?.toLowerCase().includes(searchLower) ||
          stagiaire.specialite?.toLowerCase().includes(searchLower)
        ) ||
        stage.id?.toString().includes(searchLower)
      );
    });
  }, [stagesEnrichis, filtreStatus, filtreSearch]);

  // Event handlers
  const toggleStageDetails = useCallback((stageId) => {
    setExpandedStageId(prevId => {
      if (prevId === stageId) return null;
      
      setActiveTab(prev => ({ ...prev, [stageId]: prev[stageId] || 'details' }));
      return stageId;
    });
  }, []);

  const handleTerminerStage = useCallback(async (stageId) => {
    try {
      setError('');
      await stageAPI.terminerStage(stageId);
      setStages(prevStages => 
        prevStages.map(stage => 
          stage.id === stageId ? { ...stage, statut: 'Termine' } : stage
        )
      );
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la mise à jour du statut.");
    }
  }, []);

  const handleAnnulerStage = useCallback(async (stageId, raison = "Annulé par l'administrateur") => {
    try {
      setError('');
      await stageAPI.annulerStage(stageId, raison);
      setStages(prevStages => 
        prevStages.map(stage => 
          stage.id === stageId ? { ...stage, statut: 'Annule' } : stage
        )
      );
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de l'annulation du stage.");
    }
  }, []);

  const formatStagiaires = useCallback((stagiaires) => {
    if (!stagiaires || stagiaires.length === 0) {
      return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    }
    
    return (
      <div className="space-y-3">
        {stagiaires.map((stagiaire, index) => (
          <div key={`stagiaire-${index}`} className="flex items-start text-sm text-gray-600">
            <div className="flex-shrink-0 w-6 mt-1">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <div className="font-medium">{stagiaire.prenom || ''} {stagiaire.nom || ''}</div>
              <div className="text-gray-500">{stagiaire.email || ''}</div>
              <div className="text-gray-500">
                {stagiaire.universite ? `${stagiaire.universite}` : 'Université non spécifiée'}
                {stagiaire.specialite ? ` - ${stagiaire.specialite}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, []);

  const toggleFilterDropdown = useCallback(() => {
    setShowFilterDropdown(prev => !prev);
  }, []);

  const renderStageDetails = useCallback((stage) => {
    return (
      <div className="p-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Stagiaires et Fiches</h3>
          {stage.stagiaires && stage.stagiaires.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stage.stagiaires.map((stagiaire) => (
                    <tr key={stagiaire.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{stagiaire.prenom} {stagiaire.nom}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{stagiaire.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{stagiaire.universite || "Non spécifié"}</div>
                        <div className="text-xs text-gray-500">{stagiaire.specialite || "Spécialité non spécifiée"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/membredirection/fiches-pointage1/${stagiaire.fichePointageId || ''}`}
                          className="text-green-600 hover:text-green-800 flex items-center mr-4"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fiche de pointage
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/membre-direction/fiches-evaluation/${stagiaire.id || ''}`}
                          className="text-green-600 hover:text-green-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fiche d'évaluation stagiaire
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/membre-direction/fiches-evaluation/${stagiaire.id || ''}`}
                          className="text-green-600 hover:text-green-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fiche d'évaluation encadreur
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">Aucun stagiaire associé à ce stage</div>
          )}
        </div>
      </div>
    );
  }, []);

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="stages">
        <LoadingState />
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="stages">
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Stages</h1>
        
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError('')} 
          />
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <SearchBar 
            value={filtreSearch} 
            onChange={setFiltreSearch} 
          />

          <FilterDropdown 
            value={filtreStatus}
            onChange={setFiltreStatus}
            isOpen={showFilterDropdown}
            toggleOpen={toggleFilterDropdown}
          />
        </div>

        <div className="flex flex-col gap-4">
          {stagesFiltres.map((stage) => {
            const statusInfo = getStatusDisplay(stage.statut);
            const isExpanded = expandedStageId === stage.id;
            
            return (
              <div key={stage.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Stage #{stage.id}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      <h4 className="text-base font-medium text-gray-700 mt-1">{stage.sujet}</h4>
                      {stage.theme && <p className="text-sm text-gray-500">Thème: {stage.theme}</p>}
                    </div>
                    
                    <button 
                      className="text-gray-500 hover:text-green-600 focus:outline-none"
                      onClick={() => toggleStageDetails(stage.id)}
                    >
                      <ChevronDown className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Informations du stage</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="flex-shrink-0 w-6">
                              <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <span>
                              {formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="flex-shrink-0 w-6">
                              <Building className="h-4 w-4 text-gray-400" />
                            </div>
                            <span>{stage.departement}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="flex-shrink-0 w-6">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                            </div>
                            <span>{stage.domaine}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="flex-shrink-0 w-6">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                            </div>
                            <span>Encadré par {stage.encadreur.prenom} {stage.encadreur.nom}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Stagiaires</h4>
                      {formatStagiaires(stage.stagiaires)}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-100 mt-2">
                    <div className="flex space-x-2">
                      {(stage.statut === 'EnCours' || stage.statut === 1) && (
                        <button 
                          className="px-4 py-2 text-sm font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          onClick={() => handleTerminerStage(stage.id)}
                        >
                          Marquer comme terminé
                        </button>
                      )}
                      
                      {(stage.statut === 'EnAttente' || stage.statut === 0 || 
                        stage.statut === 'EnCours' || stage.statut === 1) && (
                        <button 
                          className="px-4 py-2 text-sm font-medium rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                          onClick={() => handleAnnulerStage(stage.id)}
                        >
                          Annuler
                        </button>
                      )}
                      
                      <button 
                        className="px-4 py-2 text-sm font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        onClick={() => toggleStageDetails(stage.id)}
                      >
                        {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {renderStageDetails(stage)}
                  </div>
                )}
              </div>
            );
          })}
          
          {stagesFiltres.length === 0 && (
            <EmptyState hasStages={stages.length > 0} />
          )}
        </div>
      </div>
    </MembreDirectionLayout>
  );
}