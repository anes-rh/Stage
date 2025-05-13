import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DepartementForm from '../../components/departement/DepartementForm';
import DomaineForm from '../../components/departement/DomaineForm';
import DepartementList from '../../components/departement/DepartementList';
import DomaineList from '../../components/departement/DomaineList';
import { departementApi } from '../../services/departementApi';
import { RefreshCw, BookOpen, Layers, AlertCircle, Search, ChevronDown, Plus } from 'lucide-react';

export default function DepartementsDomainesPage() {
  const [activeTab, setActiveTab] = useState('departements');
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [expandedDomains, setExpandedDomains] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-expand departments containing matching domains when searching
    if (activeTab === 'domaines' && searchTerm.length > 0) {
      const deptWithMatchingDomains = {};
      
      // Find departments that have matching domains
      domaines.forEach(domaine => {
        if (domaine.nom?.toLowerCase().includes(searchTerm.toLowerCase())) {
          deptWithMatchingDomains[domaine.departementId] = true;
        }
      });
      
      // Expand those departments
      setExpandedDomains(prev => {
        const newState = {...prev};
        Object.keys(deptWithMatchingDomains).forEach(deptId => {
          newState[deptId] = true;
        });
        return newState;
      });
    }
  }, [searchTerm, activeTab, domaines]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log("Début du chargement des données");
      
      const departementsData = await departementApi.getAllDepartements();
      console.log("Départements chargés:", departementsData);
      setDepartements(departementsData);
      
      const domainesData = await departementApi.getAllDomaines();
      console.log("Domaines chargés:", domainesData);
      setDomaines(domainesData);
      
      // Initialiser tous les départements comme repliés
      const initExpandedState = {};
      departementsData.forEach(dept => {
        initExpandedState[dept.id] = false;
      });
      setExpandedDepts(initExpandedState);
      
      // Initialiser tous les domaines comme repliés
      const initDomainsState = {};
      departementsData.forEach(dept => {
        initDomainsState[dept.id] = false;
      });
      setExpandedDomains(initDomainsState);
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartementCreated = (newDepartement) => {
    setDepartements([...departements, newDepartement]);
    // Initialiser le nouveau département comme replié
    setExpandedDepts(prev => ({ ...prev, [newDepartement.id]: false }));
    setExpandedDomains(prev => ({ ...prev, [newDepartement.id]: false }));
  };

  const handleDomaineCreated = (newDomaine) => {
    setDomaines([...domaines, newDomaine]);
  };

  const handleDepartementDeleted = async (id) => {
    try {
      await departementApi.deleteDepartement(id);
      setDepartements(departements.filter(dept => dept.id !== id));
      // Supprimer également les domaines associés à ce département
      setDomaines(domaines.filter(domaine => domaine.departementId !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du département:", error);
      setError("Impossible de supprimer le département. Veuillez réessayer plus tard.");
    }
  };

  const handleDomaineDeleted = async (id) => {
    try {
      await departementApi.deleteDomaine(id);
      setDomaines(domaines.filter(domaine => domaine.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du domaine:", error);
      setError("Impossible de supprimer le domaine. Veuillez réessayer plus tard.");
    }
  };

  const handleTabChange = (value) => {
    console.log("Changement d'onglet vers:", value);
    setActiveTab(value);
  };

  const toggleDeptExpand = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const toggleDomainsView = (deptId) => {
    setExpandedDomains(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  // Filtrer les départements selon le terme de recherche
  const filteredDepartements = departements.filter(dept => 
    dept.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les domaines selon le terme de recherche
  const filteredDomaines = domaines.filter(domaine => 
    domaine.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les départements qui contiennent des domaines correspondant au terme de recherche
  const deptsWithFilteredDomains = activeTab === 'domaines' && searchTerm.length > 0
    ? departements.filter(dept => 
        domaines.some(
          domaine => domaine.departementId === dept.id && 
          domaine.nom?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : departements;

  return (
    <AdminLayout defaultActivePage="departements-domaines">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              className={`px-8 py-5 text-sm font-medium transition duration-200 ${
                activeTab === 'departements'
                  ? 'border-b-2 border-green-600 text-green-700 bg-white'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
              onClick={() => handleTabChange('departements')}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Départements
              </div>
            </button>
            <button
              className={`px-8 py-5 text-sm font-medium transition duration-200 ${
                activeTab === 'domaines'
                  ? 'border-b-2 border-green-600 text-green-700 bg-white'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
              onClick={() => handleTabChange('domaines')}
            >
              <div className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Domaines
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* En-tête avec titre et description */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-3 text-gray-800">
              Gestion des {activeTab === 'departements' ? 'Départements' : 'Domaines'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'departements' 
                ? 'Créez et gérez les départements de votre structure' 
                : 'Créez et gérez les domaines associés aux départements'}
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-8 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-red-800">{error}</p>
                  <button 
                    onClick={fetchData} 
                    className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche et bouton d'actualisation */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
                  placeholder={`Rechercher un ${activeTab === 'departements' ? 'département' : 'domaine'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-auto flex space-x-2">
              <button 
                onClick={fetchData} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          {/* Contenu de l'onglet Départements */}
          {activeTab === 'departements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-800">Ajouter un département</h2>
                  <p className="text-sm text-gray-500 mt-1">Créez un nouveau département dans votre organisation</p>
                </div>
                <div className="p-6">
                  <DepartementForm 
                       onDepartementCreated={handleDepartementCreated} 
                       className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-800">Liste des départements</h2>
                  <p className="text-sm text-gray-500 mt-1">Gérez vos départements existants</p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="inline-flex items-center px-4 py-2 text-sm leading-6 text-green-600">
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" />
                        Chargement des départements...
                      </div>
                    </div>
                  ) : filteredDepartements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun département trouvé
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDepartements.map(dept => (
                        <div key={dept.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div 
                            className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleDeptExpand(dept.id)}
                          >
                            <div className="font-medium text-gray-800">{dept.nom}</div>
                            <button className="text-gray-500 hover:text-gray-700">
                              <ChevronDown className={`h-5 w-5 transform transition-transform ${expandedDepts[dept.id] ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          
                          {expandedDepts[dept.id] && (
                            <div className="p-4 border-t border-gray-200">
                              <div className="mt-3 flex space-x-2">
                                <button 
                                  onClick={() => handleDepartementDeleted(dept.id)} 
                                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200"
                                >
                                  Supprimer
                                </button>
                              </div>
                              
                              {/* Bouton pour afficher/masquer les domaines associés */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDomainsView(dept.id);
                                  }}
                                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-green-600"
                                >
                                  <span>Domaines associés</span>
                                  <ChevronDown 
                                    className={`h-4 w-4 transform transition-transform ${expandedDomains[dept.id] ? 'rotate-180' : ''}`} 
                                  />
                                </button>
                                
                                {expandedDomains[dept.id] && (
                                  <div className="mt-2">
                                    {domaines.filter(domaine => domaine.departementId === dept.id).length === 0 ? (
                                      <div className="text-sm text-gray-500 italic">Aucun domaine associé</div>
                                    ) : (
                                      <ul className="space-y-2">
                                        {domaines
                                          .filter(domaine => domaine.departementId === dept.id)
                                          .map(domaine => (
                                            <li key={domaine.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                              <span className="text-sm font-medium">{domaine.nom}</span>
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDomaineDeleted(domaine.id);
                                                }} 
                                                className="text-red-600 hover:text-red-800 text-sm"
                                              >
                                                Supprimer
                                              </button>
                                            </li>
                                          ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Contenu de l'onglet Domaines */}
          {activeTab === 'domaines' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-800">Ajouter un domaine</h2>
                  <p className="text-sm text-gray-500 mt-1">Créez un nouveau domaine et associez-le à un département</p>
                </div>
                <div className="p-6">
                  <DomaineForm 
                    departements={departements} 
                    onDomaineCreated={handleDomaineCreated}
                     className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-800">Liste des domaines par département</h2>
                  <p className="text-sm text-gray-500 mt-1">Visualisez et gérez vos domaines par département</p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="inline-flex items-center px-4 py-2 text-sm leading-6 text-green-600">
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" />
                        Chargement des domaines...
                      </div>
                    </div>
                  ) : searchTerm && filteredDomaines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun domaine trouvé pour "{searchTerm}"
                    </div>
                  ) : deptsWithFilteredDomains.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun département disponible
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {deptsWithFilteredDomains.map(dept => {
                        // Filtrer les domaines pour ce département
                        const deptDomaines = filteredDomaines.filter(d => d.departementId === dept.id);
                        
                        // Ne pas afficher les départements sans domaines correspondants lors d'une recherche
                        if (searchTerm && deptDomaines.length === 0) {
                          return null;
                        }
                        
                        return (
                          <div key={dept.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div 
                              className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                              onClick={() => toggleDomainsView(dept.id)}
                            >
                              <h3 className="font-medium text-gray-800">{dept.nom}</h3>
                              <button className="text-gray-500 hover:text-gray-700">
                                <ChevronDown className={`h-5 w-5 transform transition-transform ${expandedDomains[dept.id] ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                            
                            {(expandedDomains[dept.id] || (searchTerm && deptDomaines.length > 0)) && (
                              <div className="p-4">
                                {deptDomaines.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    Aucun domaine pour ce département
                                  </div>
                                ) : (
                                  <ul className="divide-y divide-gray-100">
                                    {deptDomaines.map(domaine => (
                                      <li key={domaine.id} className="py-3 flex justify-between items-center">
                                        <div>
                                          <div className={`font-medium ${searchTerm && domaine.nom.toLowerCase().includes(searchTerm.toLowerCase()) ? 'text-green-700 bg-green-50 px-2 py-1 rounded' : 'text-gray-800'}`}>
                                            {domaine.nom}
                                          </div>
                                        </div>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDomaineDeleted(domaine.id);
                                          }} 
                                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                                        >
                                          Supprimer
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}