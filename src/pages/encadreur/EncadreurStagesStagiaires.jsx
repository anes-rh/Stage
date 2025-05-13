import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, User, X, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Building, ChevronRight, FileText } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { stageAPI } from '../../utils/stageAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { themesAPI } from '../../utils/ThemeApi';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { departementApi } from '../../services/departementApi';
import { fichePointageAPI } from '../../utils/fichePointageAPI';

export default function EncadreurStagesStagiaires() {
  const [filtreStatus, setFiltreStatus] = useState('tous');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStageId, setExpandedStageId] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [stagiaires, setStagiaires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [themes, setThemes] = useState([]);
  const [fichesPointage, setFichesPointage] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await encadreurAPI.getCurrentUser();
        setCurrentUser(userData);
        
        const [stagesData, departmentsData, domainsData, themesData, stagiairesData, fichesPointageData] = await Promise.all([
          stageAPI.getStagesByEncadreur(userData.id),
          departementApi.getAllDepartements(),
          departementApi.getAllDomaines(),
          themesAPI.getAllThemes(),
          stagiaireAPI.getAllStagiaires(),
          fichePointageAPI.getFichesPointageByEncadreur(userData.id)
        ]);

        setStages(stagesData);
        setDepartements(departmentsData);
        setDomaines(domainsData);
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

  const stagesEnrichis = stages.map(stage => {
    const departementComplet = departements.find(d => d.id === stage.departementId) || { nom: "Non assigné" };
    const domaineComplet = domaines.find(d => d.id === stage.domaineId) || { nom: "Non assigné" };
    const themeAssocie = themes.find(t => t.stageId === stage.id);
    
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
      departement: departementComplet.nom,
      domaine: domaineComplet.nom,
      theme: themeAssocie?.nom,
      stagiaires: stagiairesEnrichis
    };
  });

  const stagesFiltres = stagesEnrichis.filter(stage => {
    const statusMap = {
      'en_attente': stage.statut === 'EnAttente' || stage.statut === 0,
      'en_cours': stage.statut === 'EnCours' || stage.statut === 1,
      'termine': stage.statut === 'Termine' || stage.statut === 2,
      'annule': stage.statut === 'Annule' || stage.statut === 3,
      'prolonge': stage.statut === 'Prolonge' || stage.statut === 4
    };
    
    const matchStatus = filtreStatus === 'tous' || statusMap[filtreStatus];
    const searchLower = filtreSearch.toLowerCase();
    
    const matchSearchFields = !searchLower || 
      stage.departement?.toLowerCase().includes(searchLower) ||
      stage.domaine?.toLowerCase().includes(searchLower) ||
      stage.sujet?.toLowerCase().includes(searchLower) ||
      stage.description?.toLowerCase().includes(searchLower) ||
      stage.theme?.toLowerCase().includes(searchLower) ||
      stage.stagiaires?.some(stagiaire => 
        stagiaire.nom?.toLowerCase().includes(searchLower) ||
        stagiaire.prenom?.toLowerCase().includes(searchLower) ||
        stagiaire.email?.toLowerCase().includes(searchLower) ||
        stagiaire.universite?.toLowerCase().includes(searchLower) ||
        stagiaire.specialite?.toLowerCase().includes(searchLower)
      ) ||
      stage.id?.toString().includes(searchLower);
    
    return matchStatus && matchSearchFields;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusDisplay = (status) => {
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
  };

  const formatStagiaires = (stagiaires) => {
    if (!stagiaires || stagiaires.length === 0) {
      return <div className="text-sm text-gray-500">Aucun stagiaire associé</div>;
    }
    
    return (
      <div className="space-y-2">
        {stagiaires.map((stagiaire, index) => (
          <div key={`stagiaire-${index}`} className="flex items-center text-sm text-gray-600">
            <User className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
            <div className="truncate">
              <span className="font-medium">{stagiaire.prenom || ''} {stagiaire.nom || ''}</span>
              {stagiaire.email && <span className="text-xs text-gray-500 ml-1">({stagiaire.email})</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const toggleStageDetails = (stageId) => {
    if (expandedStageId === stageId) {
      setExpandedStageId(null);
    } else {
      setExpandedStageId(stageId);
      setActiveTab({ ...activeTab, [stageId]: activeTab[stageId] || 'details' });
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderStageDetails = (stage) => {
    return (
      <div className="p-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Stagiaires et Fiches de Pointage</h3>
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
                          to={`/encadreur/fiches-pointage`}
                          className="text-green-600 hover:text-green-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fiche de pointage
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/encadreur/fiches-evaluation`}
                          className="text-green-600 hover:text-green-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fiche d'évaluation
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
  };

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="stages">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des stages...</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="stages">
      <div className="pb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Stages et Stagiaires</h1>
        
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
                  Tous les stages
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
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'en_cours' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('en_cours');
                    setShowFilterDropdown(false);
                  }}
                >
                  En cours
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'termine' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('termine');
                    setShowFilterDropdown(false);
                  }}
                >
                  Terminé
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'annule' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('annule');
                    setShowFilterDropdown(false);
                  }}
                >
                  Annulé
                </button>
                <button 
                  className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filtreStatus === 'prolonge' ? 'bg-green-50 text-green-700' : ''}`}
                  onClick={() => {
                    setFiltreStatus('prolonge');
                    setShowFilterDropdown(false);
                  }}
                >
                  Prolongé
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {stagesFiltres.length > 0 ? stagesFiltres.map((stage) => {
            const statusInfo = getStatusDisplay(stage.statut);
            const isExpanded = expandedStageId === stage.id;
            
            return (
              <div key={stage.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-base text-gray-800">Stage #{stage.id}</h3>
                        <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mt-1">{stage.sujet}</h4>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-green-600 focus:outline-none"
                      onClick={() => toggleStageDetails(stage.id)}
                    >
                      <ChevronDown className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap mb-2 text-sm">
                    <div className="w-full md:w-1/2 pr-2 mb-2 md:mb-0">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="truncate">{formatDate(stage.dateDebut)} - {formatDate(stage.dateFin)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Building className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="truncate">{stage.departement}</span>
                      </div>
                      {stage.theme && <div className="text-xs text-gray-500 mt-1">Thème: {stage.theme}</div>}
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Stagiaires ({stage.stagiaires?.length || 0})</div>
                      {formatStagiaires(stage.stagiaires)}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button 
                      className="px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      onClick={() => toggleStageDetails(stage.id)}
                    >
                      {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {renderStageDetails(stage)}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-3">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Aucun stage trouvé</h3>
              <p className="text-gray-600">
                {stages.length === 0 
                  ? "Vous n'avez pas encore de stages à encadrer."
                  : "Essayez de modifier vos critères de recherche ou de filtre."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </EncadreurLayout>
  );
}