import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, ChevronRight, Eye, ChevronDown, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { memoireAPI } from '../../utils/memoireAPI';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';
import { stageAPI } from '../../utils/stageAPI';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { departementApi } from '../../services/departementApi';
import { themesAPI } from '../../utils/ThemeApi';

export default function Memoire() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState({});
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStage, setUserStage] = useState(null);
  const [userMemoire, setUserMemoire] = useState(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [memoires, setMemoires] = useState([]);
  const [departementsList, setDepartementsList] = useState([]);
  const [domainesList, setDomainesList] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [memoireTitle, setMemoireTitle] = useState('');
  const [canSubmitMemoire, setCanSubmitMemoire] = useState(false);
  const [approvedDemandeId, setApprovedDemandeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        const userData = await stagiaireAPI.getCurrentUser();
        setCurrentUser(userData);
        
        const departementsData = await departementApi.getAllDepartements();
        const domainesData = await departementApi.getAllDomaines();
        setDepartementsList(departementsData);
        setDomainesList(domainesData);
        
        const memoiresData = await memoireAPI.getAllMemoires();
        setMemoires(memoiresData);
        
        const themesData = await themesAPI.getAllThemes();
        setThemes(themesData);
        
        if (userData && userData.stageId) {
          try {
            const stage = await stageAPI.getStage(userData.stageId);
            if (stage) {
              setUserStage(stage);
              
              try {
                const stageMemoire = await memoireAPI.getMemoireByStage(stage.id);
                if (stageMemoire) {
                  setUserMemoire(stageMemoire);
                }
              } catch (error) {
                console.log("Pas de mémoire existant pour ce stage");
              }
              
              try {
                const stageDemandeDepot = await demandeDepotMemoireAPI.getDemandeDepotMemoireByStage(stage.id);
                if (stageDemandeDepot) {
                  setDemandes([stageDemandeDepot]);
                  
                  if (stageDemandeDepot.statut === 1) {
                    setApprovedDemandeId(stageDemandeDepot.id);
                    setCanSubmitMemoire(true);
                  }
                }
              } catch (error) {
                console.log("Pas de demande de dépôt pour ce stage");
              }
            }
          } catch (error) {
            console.error("Erreur lors de la récupération du stage de l'utilisateur", error);
          }
        }
        
        // Corriger l'organisation des données pour l'affichage
        organizeMemoiresData(departementsData, domainesData, memoiresData);
        
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        setUploadError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (departments.length > 0 && searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      
      const filtered = departments.map(dept => {
        const isDeptMatch = dept.name.toLowerCase().includes(lowercasedSearch);
        
        const filteredDomains = dept.domains.filter(domain => 
          isDeptMatch || domain.name.toLowerCase().includes(lowercasedSearch) ||
          domain.memoires.some(memoire => 
            memoire.title.toLowerCase().includes(lowercasedSearch) ||
            memoire.authors.some(author => author.toLowerCase().includes(lowercasedSearch))
          )
        );
        
        return {
          ...dept,
          domains: filteredDomains,
          isMatch: isDeptMatch || filteredDomains.length > 0
        };
      }).filter(dept => dept.isMatch);
      
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
  }, [searchTerm, departments]);

  // Fonction améliorée pour organiser les mémoires par département et domaine
  const organizeMemoiresData = (departements, domaines, memoiresData) => {
    // Préparation des départements
    const organizedData = departements.map(dept => {
      // Filtrer les domaines qui appartiennent à ce département
      const deptDomaines = domaines.filter(domain => domain.departementId === dept.id);
      
      return {
        id: dept.id,
        name: dept.nom,
        domains: deptDomaines.map(domain => {
          // Pour chaque domaine, trouver les mémoires correspondants
          // On va assigner tous les mémoires disponibles pour le moment
          // et les filtrer plus tard pour faciliter le débogage
          return {
            id: domain.id,
            name: domain.nom,
            memoires: [] // On remplira ceci après
          };
        })
      };
    });

    // Créer une structure plus facile à manipuler pour les domaines
    const domainMap = {};
    domaines.forEach(domain => {
      domainMap[domain.id] = {
        departementId: domain.departementId,
        nom: domain.nom
      };
    });

    // Maintenant, associons les mémoires aux domaines appropriés
    memoiresData.forEach(memoire => {
      // Pour chaque mémoire, essayons de trouver son département et domaine
      let departementId = null;
      let domaineId = null;

      // 1. Essayer de trouver via le stage associé
      if (memoire.stageId) {
        const associatedStage = userStage && userStage.id === memoire.stageId ? userStage : null;
        if (associatedStage) {
          departementId = associatedStage.departementId;
          domaineId = associatedStage.domaineId;
        }
      }

      // 2. Si on n'a pas les IDs, on peut utiliser le titre ou d'autres informations pour une correspondance approximative
      if (!departementId || !domaineId) {
        // Essayer d'associer à n'importe quel domaine pour l'instant
        // Ceci est juste pour déboguer - on verra tous les mémoires
        departementId = organizedData[0]?.id || null;
        domaineId = organizedData[0]?.domains[0]?.id || null;
      }

      if (departementId && domaineId) {
        // Trouver le département correct
        const deptIndex = organizedData.findIndex(dept => dept.id === departementId);
        if (deptIndex !== -1) {
          // Trouver le domaine correct
          const domainIndex = organizedData[deptIndex].domains.findIndex(domain => domain.id === domaineId);
          if (domainIndex !== -1) {
            // Ajouter le mémoire au domaine
            organizedData[deptIndex].domains[domainIndex].memoires.push({
              id: memoire.id,
              title: memoire.titre,
              authors: memoire.nomPrenomStagiaire ? memoire.nomPrenomStagiaire.split(', ') : [],
              submissionDate: new Date(memoire.dateDepot).toLocaleDateString('fr-FR'),
              size: "PDF",
              cheminFichier: memoire.cheminFichier
            });
          }
        }
      }
    });

    // SOLUTION TEMPORAIRE : Ajouter tous les mémoires au premier domaine du premier département
    // Utile pour vérifier si les mémoires sont bien récupérés
    if (organizedData.length > 0 && organizedData[0].domains.length > 0) {
      memoiresData.forEach(memoire => {
        organizedData[0].domains[0].memoires.push({
          id: memoire.id,
          title: memoire.titre,
          authors: memoire.nomPrenomStagiaire ? memoire.nomPrenomStagiaire.split(', ') : ["Auteur inconnu"],
          submissionDate: new Date(memoire.dateDepot).toLocaleDateString('fr-FR'),
          size: "PDF",
          cheminFichier: memoire.cheminFichier
        });
      });
    }
    
    console.log("Données organisées:", organizedData);
    setDepartments(organizedData);
    setFilteredDepartments(organizedData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelection(files[0]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelection(file);
  };

  const handleFileSelection = (file) => {
    setUploadError('');
    setUploadSuccess(false);
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Seuls les fichiers PDF sont acceptés');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('La taille du fichier dépasse la limite de 10 Mo');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !memoireTitle.trim() || !userStage || !approvedDemandeId) {
      setUploadError("Informations manquantes pour le dépôt du mémoire");
      return;
    }
    
    try {
      setUploadInProgress(true);
      
      const uploadResponse = await memoireAPI.uploadFile(selectedFile);
      
      const memoireData = {
        titre: memoireTitle,
        cheminFichier: uploadResponse,
        demandeDepotMemoireId: approvedDemandeId,
        stageId: userStage.id
      };
      
      await memoireAPI.createMemoire(memoireData);
      
      setUploadSuccess(true);
      
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
        setMemoireTitle('');
        
        memoireAPI.getMemoireByStage(userStage.id)
          .then(memoire => {
            setUserMemoire(memoire);
            setCanSubmitMemoire(false);
          })
          .catch(err => console.error("Impossible de recharger le mémoire", err));
          
      }, 3000);
    } catch (error) {
      console.error("Erreur lors du dépôt du mémoire", error);
      setUploadError(typeof error === 'string' ? error : "Erreur lors du dépôt du mémoire");
    } finally {
      setUploadInProgress(false);
    }
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepartment(expandedDepartment === deptId ? null : deptId);
    if (expandedDepartment === deptId) {
      setExpandedDomain({});
    }
  };

  const toggleDomain = (deptId, domainId) => {
    setExpandedDomain(prev => ({
      ...prev,
      [`${deptId}-${domainId}`]: !prev[`${deptId}-${domainId}`]
    }));
  };

  const isDomainExpanded = (deptId, domainId) => {
    return !!expandedDomain[`${deptId}-${domainId}`];
  };

  const handleViewMemoire = (cheminFichier) => {
    const newWindow = window.open(cheminFichier, '_blank');
    
    if (newWindow) {
      newWindow.addEventListener('load', () => {
        newWindow.document.addEventListener('contextmenu', e => e.preventDefault());
        newWindow.document.addEventListener('copy', e => e.preventDefault());
        newWindow.document.addEventListener('selectstart', e => e.preventDefault());
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout defaultActivePage="memoire">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des données...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultActivePage="memoire">
      <h1 className="text-2xl font-bold mb-1">Mémoire de Stage</h1>
      <p className="text-sm text-gray-600 mb-6">
        Gérez et consultez votre mémoire de stage et ceux des autres stagiaires.
      </p>
      
      <div className="bg-white p-6 rounded-md shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          Déposer votre mémoire
        </h2>
        
        {userMemoire ? (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="font-medium">Vous avez déjà déposé un mémoire pour ce stage :</p>
            <div className="mt-2 p-3 bg-white rounded-md border border-green-200">
              <h3 className="font-medium text-green-700">{userMemoire.titre}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Déposé le {new Date(userMemoire.dateDepot).toLocaleDateString('fr-FR')}
              </p>
              <button 
                onClick={() => handleViewMemoire(userMemoire.cheminFichier)}
                className="mt-2 text-green-600 flex items-center text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Consulter votre mémoire
              </button>
            </div>
          </div>
        ) : !canSubmitMemoire ? (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-700">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Vous devez d'abord soumettre une demande de dépôt de mémoire et attendre sa validation
              avant de pouvoir déposer votre mémoire.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="memoireTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du mémoire
              </label>
              <input
                type="text"
                id="memoireTitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={memoireTitle}
                onChange={(e) => setMemoireTitle(e.target.value)}
                placeholder="Entrez le titre de votre mémoire"
              />
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              
              {!selectedFile ? (
                <div>
                  <div className="mx-auto bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Glissez votre fichier ici ou cliquez pour parcourir</p>
                  <p className="text-xs text-gray-500 mt-2">Format accepté: PDF uniquement (max. 10 Mo)</p>
                </div>
              ) : (
                <div>
                  <div className="mx-auto bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                  </p>
                </div>
              )}
            </div>
            
            {uploadError && (
              <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{uploadError}</span>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Votre mémoire a été déposé avec succès!</span>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              {selectedFile && !uploadSuccess && memoireTitle.trim() && (
                <button 
                  className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors ${
                    uploadInProgress ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleUpload}
                  disabled={uploadInProgress}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadInProgress ? 'Dépôt en cours...' : 'Déposer le mémoire'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-green-600" />
          Bibliothèque des mémoires
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Consultez les mémoires par département et domaine de recherche.
        </p>
        
        <div className="relative group mb-6">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un département ou domaine..."
            className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-full transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {memoires.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun mémoire n'est disponible dans la bibliothèque
            </div>
          )}
          
          {filteredDepartments.map(department => (
            <div key={department.id} className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  expandedDepartment === department.id ? 'bg-green-50' : 'bg-gray-50'
                }`}
                onClick={() => toggleDepartment(department.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{department.name}</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-green-600 transition-transform ${
                  expandedDepartment === department.id ? 'transform rotate-180' : ''
                }`} />
              </div>
              
              {expandedDepartment === department.id && (
                <div className="px-4 py-2 divide-y divide-gray-100">
                  {department.domains.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                      Aucun domaine disponible pour ce département
                    </div>
                  )}
                  
                  {department.domains.map(domain => (
                    <div key={domain.id} className="py-2">
                      <div 
                        className="flex justify-between items-center py-2 cursor-pointer"
                        onClick={() => toggleDomain(department.id, domain.id)}
                      >
                        <h4 className="font-medium text-gray-800">
                          {domain.name} <span className="text-gray-500 text-sm">({domain.memoires.length} mémoires)</span>
                        </h4>
                        <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${
                          isDomainExpanded(department.id, domain.id) ? 'transform rotate-180' : ''
                        }`} />
                      </div>
                      
                      {isDomainExpanded(department.id, domain.id) && (
                        <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
                          {domain.memoires.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Titre
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    Auteur(s)
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    Date de soumission
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {domain.memoires.map(memoire => (
                                  <tr key={memoire.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {memoire.title}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                                      {memoire.authors.join(", ")}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                      {memoire.submissionDate}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                      <button 
                                        className="text-green-600 hover:text-green-800 flex items-center space-x-1 ml-auto"
                                        onClick={() => handleViewMemoire(memoire.cheminFichier)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>Consulter</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Aucun mémoire disponible pour ce domaine
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}