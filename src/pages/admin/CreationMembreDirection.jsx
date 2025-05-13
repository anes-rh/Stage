// src/pages/admin/CreationMembreDirection.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, AlertCircle, Search, RefreshCw, Trash2, Filter, Check, X, ChevronDown, Mail, Phone, Briefcase} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

export default function CreationMembreDirection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [membres, setMembres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Charger les membres de direction au chargement de la page
  useEffect(() => {
    fetchMembres();
  }, []);

  // Fonction pour récupérer les membres de direction
  const fetchMembres = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await membreDirectionAPI.getAllMembresDirection();
      // Normaliser les noms de propriétés pour s'assurer que estActif est en camelCase
      const normalisedData = data.map(membre => ({
        ...membre,
        // S'assurer que estActif est un booléen
        estActif: membre.estActif === true || membre.EstActif === true
      }));
      setMembres(normalisedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des membres:", err);
      setError("Impossible de charger la liste des membres. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer un membre
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.")) {
      try {
        setIsLoading(true);
        await membreDirectionAPI.deleteMembreDirection(id);
        // Rafraîchir la liste après suppression
        await fetchMembres();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError("Erreur lors de la suppression du membre.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fonction pour activer/désactiver un membre
  const toggleStatus = async (id) => {
    try {
      setIsLoading(true);
      await membreDirectionAPI.toggleStatus(id);
      // Rafraîchir la liste après mise à jour
      await fetchMembres();
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError("Erreur lors du changement de statut du membre.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les membres selon le terme de recherche et le filtre de statut
  const filteredMembres = membres.filter(member => {
    const searchMatch = 
      member.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.fonction?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return searchMatch;
    if (statusFilter === 'active') return searchMatch && member.estActif;
    if (statusFilter === 'inactive') return searchMatch && !member.estActif;
    
    return searchMatch;
  });

  return (
    <AdminLayout defaultActivePage="creation-membre">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with tabs */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-8 py-5 text-sm font-medium transition duration-200 ${
                activeTab === 'form'
                  ? 'border-b-2 border-green-600 text-green-700 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
              onClick={() => setActiveTab('form')}
            >
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Nouveau membre
              </div>
            </button>
            <button
              className={`px-8 py-5 text-sm font-medium transition duration-200 ${
                activeTab === 'list'
                  ? 'border-b-2 border-green-600 text-green-700 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
              onClick={() => setActiveTab('list')}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Liste des membres
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'form' ? (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Création d'un nouveau membre de direction</h1>
                <p className="text-gray-600">Remplissez le formulaire pour ajouter un nouveau membre à la direction</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-green-500 p-5 mb-8 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-green-800">
                      Pour ajouter un nouveau membre, veuillez créer un compte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center py-10">
                <button 
                  onClick={() => navigate('/auth/signup')} 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Créer un compte membre
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Liste des membres de direction</h1>
                <p className="text-gray-600">Gérez les membres existants de l'équipe de direction</p>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search and actions bar */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="w-full md:w-auto relative group">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
                  <input
                    type="text"
                    className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 shadow-sm"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actifs</option>
                      <option value="inactive">Inactifs</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={fetchMembres} 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center shadow-sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>
              
              {/* Members list */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                {isLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
                
                {!isLoading && (
                  filteredMembres.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredMembres.map((member) => (
                        <div key={member.id} className="hover:bg-gray-50 transition-colors duration-150 p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex flex-col mb-4 md:mb-0">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center text-xl font-semibold text-green-700">
                                    {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <h4 className="text-lg font-semibold text-gray-800">{member.nom} {member.prenom}</h4>
                                  <div className="mt-1 flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.estActif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {member.estActif ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                      {member.estActif ? 'Actif' : 'Inactif'}
                                    </span>
                                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {member.fonction}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4">
                              <div className="flex items-center text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="text-sm">{member.email}</span>
                              </div>
                              {member.telephone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{member.telephone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-3">
                            <button 
                              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                member.estActif 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              onClick={() => toggleStatus(member.id)}
                            >
                              {member.estActif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button 
                              className="py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium flex items-center transition-colors duration-200"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">Aucun membre trouvé</h3>
                      <p className="text-gray-500 mt-2">Ajoutez des membres ou modifiez vos critères de recherche</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}