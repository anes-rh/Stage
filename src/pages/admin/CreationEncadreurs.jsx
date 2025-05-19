// src/pages/membre-direction/CreationEncadreurs.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, AlertCircle, Search, RefreshCw, Trash2, Edit, Filter, Check, X, Briefcase } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { departementApi } from '../../services/departementApi';

export default function CreationEncadreurs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [encadreurs, setEncadreurs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'available', 'unavailable'
  
  // États pour l'édition des encadreurs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [editForm, setEditForm] = useState({
    departementId: '',
    domaineId: '',
    fonction: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Charger les encadreurs au chargement de la page
  useEffect(() => {
    fetchEncadreurs();
    fetchDepartements();
    fetchDomaines();
  }, []);

  // Observer les changements de departementId pour filtrer les domaines
  useEffect(() => {
    if (editForm.departementId) {
      const domainesFiltres = domaines.filter(
        domain => domain.departementId === parseInt(editForm.departementId)
      );
      setFilteredDomaines(domainesFiltres);
      // Reset domaine selection if current doesn't belong to new department
      const currentDomainBelongsToDepartment = domainesFiltres.some(
        domain => domain.id === parseInt(editForm.domaineId)
      );
      if (!currentDomainBelongsToDepartment) {
        setEditForm(prev => ({ ...prev, domaineId: '' }));
      }
    } else {
      setFilteredDomaines([]);
    }
  }, [editForm.departementId, domaines]);

  // Fonction pour récupérer les encadreurs
  const fetchEncadreurs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await encadreurAPI.getAllEncadreurs();
      // Normaliser les noms de propriétés
      const normalisedData = data.map(encadreur => ({
        ...encadreur,
        // S'assurer que estDisponible est un booléen
        estDisponible: Boolean(encadreur.estDisponible || encadreur.EstDisponible || false),
        // S'assurer que estActif est un booléen
        estActif: Boolean(encadreur.estActif || encadreur.EstActif || false)
      }));
      setEncadreurs(normalisedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des encadreurs:", err);
      setError("Impossible de charger la liste des encadreurs. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les départements
  const fetchDepartements = async () => {
    try {
      const data = await departementApi.getAllDepartements();
      setDepartements(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des départements:", err);
    }
  };

  // Récupérer les domaines
  const fetchDomaines = async () => {
    try {
      const data = await departementApi.getAllDomaines();
      setDomaines(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des domaines:", err);
    }
  };

  // Fonction pour supprimer un encadreur
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet encadreur ? Cette action est irréversible.")) {
      try {
        await encadreurAPI.deleteEncadreur(id);
        // Rafraîchir la liste après suppression
        fetchEncadreurs();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression de l'encadreur: " + (err.message || err));
      }
    }
  };

  // Fonction pour activer/désactiver la disponibilité d'un encadreur
  const toggleDisponibilite = async (id) => {
    try {
      await encadreurAPI.toggleDisponibilite(id);
      // Rafraîchir la liste après mise à jour
      fetchEncadreurs();
    } catch (err) {
      console.error("Erreur lors du changement de disponibilité:", err);
      alert("Erreur lors du changement de disponibilité de l'encadreur: " + (err.message || err));
    }
  };

  // Fonction pour activer/désactiver un encadreur
  const toggleStatus = async (id) => {
    try {
      await encadreurAPI.toggleStatus(id);
      // Rafraîchir la liste après mise à jour
      fetchEncadreurs();
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      alert("Erreur lors du changement de statut de l'encadreur: " + (err.message || err));
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (encadreur) => {
    setSelectedEncadreur(encadreur);
    setEditForm({
      departementId: encadreur.departement?.id || '',
      domaineId: encadreur.domaine?.id || '',
      fonction: encadreur.fonction || ''
    });
    setFormErrors({});
    setUpdateSuccess('');
    setIsEditModalOpen(true);
  };

  // Fermer le modal d'édition
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEncadreur(null);
    setEditForm({ departementId: '', domaineId: '', fonction: '' });
    setFormErrors({});
    setUpdateSuccess('');
  };

  // Gérer les changements dans le formulaire
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    if (!editForm.departementId) {
      errors.departementId = "Le département est requis";
    }
    if (!editForm.domaineId) {
      errors.domaineId = "Le domaine est requis";
    }
    if (!editForm.fonction || editForm.fonction.trim() === '') {
      errors.fonction = "La fonction est requise";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire d'édition
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Utilisez l'API pour mettre à jour l'encadreur
      await encadreurAPI.updateEncadreurDepartementDomaineFunction(selectedEncadreur.id, {
        departementId: parseInt(editForm.departementId),
        domaineId: parseInt(editForm.domaineId),
        fonction: editForm.fonction
      });
      
      setUpdateSuccess("Les informations de l'encadreur ont été mises à jour avec succès.");
      
      // Rafraîchir la liste des encadreurs
      await fetchEncadreurs();
      
      setTimeout(() => {
        closeEditModal();
      }, 2000);
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'encadreur:", err);
      setFormErrors(prev => ({ 
        ...prev, 
        submit: typeof err === 'string' ? err : "Une erreur est survenue lors de la mise à jour de l'encadreur."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les encadreurs selon le terme de recherche et les filtres
  const filteredEncadreurs = encadreurs.filter(encadreur => {
    const searchMatch = 
      encadreur.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      encadreur.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encadreur.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encadreur.departement?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encadreur.domaine?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encadreur.fonction?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'all') return searchMatch;
    if (statusFilter === 'active') return searchMatch && encadreur.estActif;
    if (statusFilter === 'inactive') return searchMatch && !encadreur.estActif;
    if (statusFilter === 'available') return searchMatch && encadreur.estDisponible;
    if (statusFilter === 'unavailable') return searchMatch && !encadreur.estDisponible;
    
    return searchMatch;
  });

  return (
    <AdminLayout defaultActivePage="creation-encadreur">
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
                Nouvel encadreur
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
                Liste des encadreurs
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'form' ? (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Création d'un nouvel encadreur</h1>
                <p className="text-gray-600">Remplissez le formulaire pour ajouter un nouvel encadreur</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-green-500 p-5 mb-8 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-green-800">
                      Pour ajouter un nouvel encadreur, veuillez créer un compte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center py-10">
                <button 
                  onClick={() => navigate('/auth/signup-encadreur')} 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Créer un compte encadreur
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Liste des encadreurs</h1>
                <p className="text-gray-600">Gérez les encadreurs existants</p>
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
                    placeholder="Rechercher un encadreur..."
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
                      <option value="available">Disponibles</option>
                      <option value="unavailable">Indisponibles</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={fetchEncadreurs} 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center shadow-sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>
              
              {/* Encadreurs list */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                {isLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}
                
                {!isLoading && (
                  filteredEncadreurs.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredEncadreurs.map((encadreur) => (
                        <div key={encadreur.id} className="hover:bg-gray-50 transition-colors duration-150 p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex flex-col mb-4 md:mb-0">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center text-xl font-semibold text-green-700">
                                    {encadreur.prenom?.charAt(0)}{encadreur.nom?.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <h4 className="text-lg font-semibold text-gray-800">{encadreur.prenom} {encadreur.nom}</h4>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${encadreur.estActif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {encadreur.estActif ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                      {encadreur.estActif ? 'Actif' : 'Inactif'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${encadreur.estDisponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {encadreur.estDisponible ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                      {encadreur.estDisponible ? 'Disponible' : 'Indisponible'}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {encadreur.fonction || 'Non défini'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center text-gray-600">
                                <span className="text-sm">{encadreur.email}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <span className="text-sm font-medium">{encadreur.departement?.nom || '—'} / {encadreur.domaine?.nom || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-3">
                            <button 
                              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                encadreur.estActif 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              onClick={() => toggleStatus(encadreur.id)}
                            >
                              {encadreur.estActif ? 'Désactiver' : 'Activer'}
                            </button>
                            <button 
                              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                encadreur.estDisponible 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              onClick={() => toggleDisponibilite(encadreur.id)}
                            >
                              {encadreur.estDisponible ? 'Rendre indisponible' : 'Rendre disponible'}
                            </button>
                            <button
                              className="py-2 px-4 rounded-lg bg-green-50 text-green-600 hover:bg-blue-100 text-sm font-medium flex items-center transition-colors"
                              onClick={() => openEditModal(encadreur)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </button>
                            <button 
                              className="py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium flex items-center transition-colors"
                              onClick={() => handleDelete(encadreur.id)}
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
                      <h3 className="text-lg font-medium text-gray-700">Aucun encadreur trouvé</h3>
                      <p className="text-gray-500 mt-2">Ajoutez des encadreurs ou modifiez vos critères de recherche</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Modifier les informations de l'encadreur
              </h2>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {updateSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{updateSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {formErrors.submit && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formErrors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4">
                {/* Département */}
                <div>
                  <label htmlFor="departementId" className="block text-sm font-medium text-gray-700 mb-1">
                    Département *
                  </label>
                  <select
                    id="departementId"
                    name="departementId"
                    value={editForm.departementId}
                    onChange={handleEditFormChange}
                    className={`block w-full px-3 py-2 border ${formErrors.departementId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                  >
                    <option value="">Sélectionnez un département</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.nom}</option>
                    ))}
                  </select>
                  {formErrors.departementId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.departementId}</p>
                  )}
                </div>

                {/* Domaine */}
                <div>
                  <label htmlFor="domaineId" className="block text-sm font-medium text-gray-700 mb-1">
                    Domaine *
                  </label>
                  <select
                    id="domaineId"
                    name="domaineId"
                    value={editForm.domaineId}
                    onChange={handleEditFormChange}
                    className={`block w-full px-3 py-2 border ${formErrors.domaineId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                    disabled={!editForm.departementId}
                  >
                    <option value="">Sélectionnez un domaine</option>
                    {filteredDomaines.map(domain => (
                      <option key={domain.id} value={domain.id}>{domain.nom}</option>
                    ))}
                  </select>
                  {formErrors.domaineId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.domaineId}</p>
                  )}
                </div>

                  {/* Fonction */}
                <div>
                  <label htmlFor="fonction" className="block text-sm font-medium text-gray-700 mb-1">
                    Fonction *
                  </label>
                  <input
                    type="text"
                    id="fonction"
                    name="fonction"
                    value={editForm.fonction}
                    onChange={handleEditFormChange}
                    className={`block w-full px-3 py-2 border ${formErrors.fonction ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500`}
                    placeholder="Fonction de l'encadreur"
                  />
                  {formErrors.fonction && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fonction}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        )}
    </AdminLayout>
  );
}