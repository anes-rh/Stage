// src/pages/stagiaire/Memoire.jsx
import { useState } from 'react';
import { Upload, FileText, AlertCircle, ChevronRight, Eye, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Memoire() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState({});

  // Données des départements
  const departments = [
    {
      id: 1,
      name: "Informatique & Systèmes d'Information",
      chief: "Pr. Mohamed Alaoui",
      domains: [
        {
          id: 101,
          name: "Développement Web",
          memoires: [
            {
              id: 1001,
              title: "Développement d'une application web progressive pour la gestion des stages",
              authors: ["Ahmed Benali", "Samira Kadiri"],
              submissionDate: "15/03/2024",
              size: "3.4 MB"
            },
            {
              id: 1002,
              title: "Architecture microservices pour applications d'entreprise",
              authors: ["Karim Idrissi"],
              submissionDate: "22/01/2023",
              size: "4.2 MB"
            }
          ]
        },
        {
          id: 102,
          name: "Intelligence Artificielle",
          memoires: [
            {
              id: 1003,
              title: "Implémentation d'algorithmes de machine learning pour l'analyse prédictive",
              authors: ["Fatima Zahra", "Omar Benjelloun", "Yasmine Chaoui"],
              submissionDate: "05/04/2024",
              size: "5.2 MB"
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Génie Électrique & Télécommunications",
      chief: "Pr. Nadia Tazi",
      domains: [
        {
          id: 201,
          name: "Réseaux de Communication",
          memoires: [
            {
              id: 2001,
              title: "Optimisation des réseaux 5G pour applications industrielles",
              authors: ["Rachid El Amrani", "Leila Moussaoui"],
              submissionDate: "10/12/2023",
              size: "6.1 MB"
            }
          ]
        },
        {
          id: 202,
          name: "Systèmes Embarqués",
          memoires: [
            {
              id: 2002,
              title: "Conception de systèmes IoT pour la surveillance environnementale",
              authors: ["Khalid Berrada"],
              submissionDate: "30/09/2023",
              size: "3.8 MB"
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Sciences Économiques & Gestion",
      chief: "Pr. Laila Bennani",
      domains: [
        {
          id: 301,
          name: "Marketing Digital",
          memoires: [
            {
              id: 3001,
              title: "Stratégies de marketing d'influence pour PME marocaines",
              authors: ["Hassan Bennani", "Salma Bouazizi"],
              submissionDate: "18/02/2024",
              size: "4.5 MB"
            }
          ]
        },
        {
          id: 302,
          name: "Finance d'Entreprise",
          memoires: [
            {
              id: 3002,
              title: "Impact des fintech sur le secteur bancaire traditionnel",
              authors: ["Youssef Taoufik", "Amina Karimi", "Saad El Ouazzani"],
              submissionDate: "25/11/2023",
              size: "5.7 MB"
            }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Génie Civil & Environnement",
      chief: "Pr. Abdellah Hassouni",
      domains: [
        {
          id: 401,
          name: "Construction Durable",
          memoires: [
            {
              id: 4001,
              title: "Utilisation des matériaux recyclés dans la construction urbaine",
              authors: ["Nawal Fassi", "Mehdi Rami"],
              submissionDate: "08/01/2024",
              size: "7.2 MB"
            }
          ]
        }
      ]
    }
  ];

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
      // Vérifier le type de fichier (PDF uniquement)
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setUploadError('Seuls les fichiers PDF et Word (DOC/DOCX) sont acceptés');
        setSelectedFile(null);
        return;
      }
      
      // Vérifier la taille du fichier (max 10 Mo)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('La taille du fichier dépasse la limite de 10 Mo');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    // Simuler un téléchargement réussi
    setTimeout(() => {
      setUploadSuccess(true);
      // Réinitialiser après quelques secondes
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
      }, 3000);
    }, 1500);
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepartment(expandedDepartment === deptId ? null : deptId);
    // Réinitialiser les domaines développés si on ferme le département
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

  return (
    <DashboardLayout defaultActivePage="memoire">
      <h1 className="text-2xl font-bold mb-1">Mémoire de Stage</h1>
      <p className="text-sm text-gray-600 mb-6">
        Gérez et consultez votre mémoire de stage et ceux des autres stagiaires.
      </p>
      
      {/* Section pour déposer un mémoire */}
      <div className="bg-white p-6 rounded-md shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <Upload className="h-4 w-4 mr-2 text-blue-600" />
          Déposer votre mémoire
        </h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
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
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          
          {!selectedFile ? (
            <div>
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Glissez votre fichier ici ou cliquez pour parcourir</p>
              <p className="text-xs text-gray-500 mt-2">Format accepté: PDF ou Word (DOC/DOCX) uniquement (max. 10 Mo)</p>
            </div>
          ) : (
            <div>
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
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
          {selectedFile && !uploadSuccess && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4 mr-2" />
              Déposer le mémoire
            </button>
          )}
        </div>
      </div>
      
      {/* Section pour consulter les mémoires par département et domaine */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Bibliothèque des mémoires
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Consultez les mémoires par département et domaine de recherche.
        </p>
        
        <div className="space-y-4">
          {departments.map(department => (
            <div key={department.id} className="border border-gray-200 rounded-md overflow-hidden">
              {/* En-tête du département */}
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  expandedDepartment === department.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => toggleDepartment(department.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{department.name}</h3>
                  <p className="text-sm text-gray-600">Chef de département: {department.chief}</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform ${
                  expandedDepartment === department.id ? 'transform rotate-180' : ''
                }`} />
              </div>
              
              {/* Contenu du département (domaines) */}
              {expandedDepartment === department.id && (
                <div className="px-4 py-2 divide-y divide-gray-100">
                  {department.domains.map(domain => (
                    <div key={domain.id} className="py-2">
                      {/* En-tête du domaine */}
                      <div 
                        className="flex justify-between items-center py-2 cursor-pointer"
                        onClick={() => toggleDomain(department.id, domain.id)}
                      >
                        <h4 className="font-medium text-gray-800">
                          {domain.name} <span className="text-gray-500 text-sm">({domain.memoires.length} mémoires)</span>
                        </h4>
                        <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${
                          isDomainExpanded(department.id, domain.id) ? 'transform rotate-180' : ''
                        }`} />
                      </div>
                      
                      {/* Liste des mémoires du domaine */}
                      {isDomainExpanded(department.id, domain.id) && (
                        <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
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
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                  Taille
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
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                    {memoire.size}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 ml-auto">
                                      <Eye className="h-4 w-4" />
                                      <span>Consulter</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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