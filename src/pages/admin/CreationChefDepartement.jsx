// src/pages/membre-direction/CreationChefDepartement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, AlertCircle, Search, RefreshCw, Trash2, Edit, CheckCircle, Filter, Check, X, Mail, Phone } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { chefdepartementAPI } from '../../utils/chefdepartementAPI';
import { departementApi } from '../../services/departementApi';

export default function CreationChefDepartement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [chefDepartements, setChefDepartements] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // État pour la modal de modification du département
  const [showModal, setShowModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [selectedDepartementId, setSelectedDepartementId] = useState('');

  // Charger les chefs de département et les départements au chargement de la page
  useEffect(() => {
    fetchChefDepartements();
    fetchDepartements();
  }, []);

  // Fonction pour récupérer les départements
  const fetchDepartements = async () => {
    try {
      const data = await departementApi.getAllDepartements();
      setDepartements(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des départements:", err);
    }
  };

  // Fonction pour récupérer les chefs de département
  const fetchChefDepartements = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await chefdepartementAPI.getAllChefDepartements();
      // Normaliser les noms de propriétés
      const normalisedData = data.map(chefDepartement => ({
        ...chefDepartement,
        // S'assurer que estActif est un booléen
        estActif: Boolean(chefDepartement.estActif || chefDepartement.EstActif || false)
      }));
      setChefDepartements(normalisedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des chefs de département:", err);
      setError("Impossible de charger la liste des chefs de département. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer un chef de département
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chef de département ? Cette action est irréversible.")) {
      try {
        await chefdepartementAPI.deleteChefDepartement(id);
        // Rafraîchir la liste après suppression
        fetchChefDepartements();
        setSuccessMessage("Chef de département supprimé avec succès");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError("Erreur lors de la suppression du chef de département: " + (err.message || err));
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Fonction pour activer/désactiver un chef de département
  const toggleStatus = async (id) => {
    try {
      await chefdepartementAPI.toggleStatus(id);
      // Rafraîchir la liste après mise à jour
      fetchChefDepartements();
      setSuccessMessage("Statut modifié avec succès");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError("Erreur lors du changement de statut du chef de département: " + (err.message || err));
      setTimeout(() => setError(""), 3000);
    }
  };

  // Fonction pour ouvrir la modal de modification du département
  const handleEditDepartement = (chef) => {
    setSelectedChef(chef);
    setSelectedDepartementId(chef.departement?.id || '');
    setShowModal(true);
  };

  // Fonction pour sauvegarder les modifications du département
  const handleSaveDepartement = async () => {
    if (!selectedChef || !selectedDepartementId) {
      setError("Veuillez sélectionner un département valide");
      return;
    }

    try {
      // Préparer les données pour la mise à jour
      const updateData = {
        id: selectedChef.id, // Assurez-vous que l'ID est inclus
        nom: selectedChef.nom,
        prenom: selectedChef.prenom,
        email: selectedChef.email,
        username: selectedChef.username || selectedChef.email,
        telephone: selectedChef.telephone || '',
        photoUrl: selectedChef.photoUrl || '',
        departementId: parseInt(selectedDepartementId, 10),
      };
      
      console.log("Données de mise à jour:", updateData); // Pour déboguer
      
      await chefdepartementAPI.updateChefDepartement(selectedChef.id, updateData);
      setShowModal(false);
      fetchChefDepartements();
      setSuccessMessage("Département mis à jour avec succès");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du département:", err);
      setError("Erreur lors de la mise à jour du département: " + (err.message || err));
      setTimeout(() => setError(""), 3000);
    }
  };

  // Filtrer les chefs de département selon le terme de recherche et le filtre de statut
  const filteredChefDepartements = chefDepartements.filter(chef => {
    const searchMatch = 
      chef.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      chef.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.departement?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return searchMatch;
    if (statusFilter === 'active') return searchMatch && chef.estActif;
    if (statusFilter === 'inactive') return searchMatch && !chef.estActif;
    
    return searchMatch;
  });

  return (
    <AdminLayout defaultActivePage="creation-chef-departement">
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
                Nouveau chef de département
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
                Liste des chefs de département
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'form' ? (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Création d'un nouveau chef de département</h1>
                <p className="text-gray-600">Remplissez le formulaire pour ajouter un nouveau chef de département</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-green-500 p-5 mb-8 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-green-800">
                      Pour ajouter un nouveau chef de département, veuillez créer un compte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center py-10">
                <button 
                  onClick={() => navigate('/auth/signup-chef-departement')} 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Créer un compte chef de département
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Liste des chefs de département</h1>
                <p className="text-gray-600">Gérez les chefs de département existants</p>
              </div>
              
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                    placeholder="Rechercher un chef de département..."
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
                    onClick={fetchChefDepartements} 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center shadow-sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>
              
              {/* Chef departements list */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                {isLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
                
                {!isLoading && (
                  filteredChefDepartements.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredChefDepartements.map((chef) => (
                        <div key={chef.id} className="hover:bg-gray-50 transition-colors duration-150 p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex flex-col mb-4 md:mb-0">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center text-xl font-semibold text-green-700">
                                    {chef.prenom?.charAt(0)}{chef.nom?.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <h4 className="text-lg font-semibold text-gray-800">{chef.nom} {chef.prenom}</h4>
                                  <div className="mt-1 flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chef.estActif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {chef.estActif ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                      {chef.estActif ? 'Actif' : 'Inactif'}
                                    </span>
                                    {chef.departement && (
                                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {chef.departement.nom}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4">
                              <div className="flex items-center text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="text-sm">{chef.email}</span>
                              </div>
                              {chef.telephone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{chef.telephone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-3">
                            <button 
                              className="py-2 px-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-medium flex items-center transition-colors duration-200"
                              onClick={() => handleEditDepartement(chef)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier département
                            </button>
                            <button 
                              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                chef.estActif 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              onClick={() => toggleStatus(chef.id)}
                            >
                              {chef.estActif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button 
                              className="py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium flex items-center transition-colors duration-200"
                              onClick={() => handleDelete(chef.id)}
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
                      <h3 className="text-lg font-medium text-gray-700">Aucun chef de département trouvé</h3>
                      <p className="text-gray-500 mt-2">Ajoutez des chefs de département ou modifiez vos critères de recherche</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour modifier le département */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Modifier le département
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chef de département
              </label>
              <p className="text-gray-800 font-medium">
                {selectedChef?.nom} {selectedChef?.prenom}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select 
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={selectedDepartementId}
                onChange={(e) => setSelectedDepartementId(e.target.value)}
              >
                <option value="">Sélectionner un département</option>
                {departements.map(departement => (
                  <option key={departement.id} value={departement.id}>
                    {departement.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDepartement}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}