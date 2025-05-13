// src/pages/stagiaire/Parametres.jsx
import { useState, useEffect } from 'react';
import { User, Lock, Home, LogOut, ChevronRight, Save, AlertCircle, Edit, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { authAPI } from '../../utils/api';

export default function Parametres() {
  const [activeSection, setActiveSection] = useState('personal');
  const [userData, setUserData] = useState({
    id: '',
    nom: '',
    prenom: '',
    email: '',
    username: '',
    telephone: '',
    universite: '',
    specialite: ''
  });
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    telephone: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  
  const navigate = useNavigate();

  // Charger les données du stagiaire au chargement du composant
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await stagiaireAPI.getCurrentUser();
        setUserData({
          id: userData.id || '',
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          username: userData.username || '',
          telephone: userData.telephone || '',
          universite: userData.universite || '',
          specialite: userData.specialite || ''
        });
        setEditFormData({
          email: userData.email || '',
          telephone: userData.telephone || ''
        });
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError('Impossible de charger vos informations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction pour gérer l'affichage des sections
  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection('');
    } else {
      setActiveSection(section);
    }
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    return `${userData.prenom.charAt(0)}${userData.nom.charAt(0)}`;
  };

  // Gérer les changements dans le formulaire de mot de passe
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    // Réinitialiser les messages d'erreur/succès quand l'utilisateur tape
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Soumettre le formulaire de changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification de base
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await stagiaireAPI.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      
      setPasswordSuccess('Mot de passe mis à jour avec succès!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(typeof err === 'string' ? err : 'Une erreur est survenue lors de la mise à jour du mot de passe');
    }
  };

  // Gérer l'édition des champs
  const handleEdit = (field) => {
    setEditingField(field);
    setUpdateError('');
    setUpdateSuccess('');
  };

  // Gérer les changements dans les champs éditables
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumettre les modifications
  const handleEditSubmit = async (field) => {
    try {
      // Utiliser la nouvelle API pour mettre à jour les informations
      await stagiaireAPI.updateStagiaireInfo({ [field]: editFormData[field] });
      
      // Mettre à jour les données locales
      setUserData(prev => ({ ...prev, [field]: editFormData[field] }));
      setUpdateSuccess(`${field === 'email' ? 'Email' : 'Téléphone'} mis à jour avec succès!`);
      setEditingField(null);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du ${field}:`, err);
      setUpdateError(`Impossible de mettre à jour le ${field === 'email' ? 'email' : 'téléphone'}`);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditFormData({
      email: userData.email,
      telephone: userData.telephone
    });
    setEditingField(null);
    setUpdateError('');
  };

 // Fonction de déconnexion mise à jour
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Possibilité d'appeler une API de déconnexion si nécessaire
      await authAPI.logout();
      
      // Supprimer les données d'authentification du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      
      // Attendre un peu pour afficher le statut de déconnexion
      setTimeout(() => {
        setIsLoggingOut(false);
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };
  return (
    <DashboardLayout defaultActivePage="parametres">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Paramètres du Compte</h1>
            <p className="text-sm text-gray-600">
              Consultez vos informations personnelles et gérez votre mot de passe.
            </p>
          </div>
          <div className="bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-semibold text-xl">{getInitials()}</span>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center shadow-sm">
            <Check className="h-5 w-5 mr-2" />
            {updateSuccess}
          </div>
        )}

        {updateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-2" />
            {updateError}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* Personal Information */}
            <div className="border-b border-gray-100">
              <button 
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-green-50 transition-colors"
                onClick={() => toggleSection('personal')}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-4" />
                  <span className="font-medium">Informations personnelles</span>
                </div>
                <ChevronRight className={`h-5 w-5 text-green-600 transition-transform ${activeSection === 'personal' ? 'transform rotate-90' : ''}`} />
              </button>
              
              {activeSection === 'personal' && (
                <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom</label>
                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-md text-sm flex justify-between items-center">
                          <span>{userData.nom}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Prénom</label>
                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-md text-sm flex justify-between items-center">
                          <span>{userData.prenom}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                        {editingField === 'email' ? (
                          <div className="flex">
                            <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2.5 border border-green-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                            <div className="flex">
                              <button 
                                onClick={() => handleEditSubmit('email')}
                                className="bg-green-500 hover:bg-green-600 p-2.5 text-white transition-colors duration-200 flex items-center justify-center w-10"
                                title="Confirmer"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="bg-red-500 hover:bg-red-600 p-2.5 rounded-r-md text-white transition-colors duration-200 flex items-center justify-center w-10"
                                title="Annuler"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-md text-sm shadow-sm flex justify-between items-center">
                            <span>{userData.email}</span>
                            <Edit 
                              className="h-4 w-4 text-green-500 cursor-pointer hover:text-green-600" 
                              onClick={() => handleEdit('email')}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-md text-sm flex justify-between items-center">
                          <span>{userData.username || 'Non défini'}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Téléphone</label>
                        {editingField === 'telephone' ? (
                          <div className="flex">
                            <input
                              type="text"
                              name="telephone"
                              value={editFormData.telephone}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2.5 border border-green-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                            <div className="flex">
                              <button 
                                onClick={() => handleEditSubmit('telephone')}
                                className="bg-green-500 hover:bg-green-600 p-2.5 text-white transition-colors duration-200 flex items-center justify-center w-10"
                                title="Confirmer"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="bg-red-500 hover:bg-red-600 p-2.5 rounded-r-md text-white transition-colors duration-200 flex items-center justify-center w-10"
                                title="Annuler"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-md text-sm shadow-sm flex justify-between items-center">
                            <span>{userData.telephone}</span>
                            <Edit 
                              className="h-4 w-4 text-green-500 cursor-pointer hover:text-green-600" 
                              onClick={() => handleEdit('telephone')}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Université</label>
                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-md text-sm flex justify-between items-center">
                          <span>{userData.universite}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Spécialité</label>
                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-md text-sm flex justify-between items-center">
                          <span>{userData.specialite}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="opacity-0">
                        {/* Champ caché pour maintenir la grille */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password & Security */}
            <div>
              <button 
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-green-50 transition-colors"
                onClick={() => toggleSection('security')}
              >
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-green-600 mr-4" />
                  <span className="font-medium">Mot de passe et sécurité</span>
                </div>
                <ChevronRight className={`h-5 w-5 text-green-600 transition-transform ${activeSection === 'security' ? 'transform rotate-90' : ''}`} />
              </button>
              
              {activeSection === 'security' && (
                <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
                  {passwordError && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center">
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  
                  <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="flex justify-between items-center">
          <button 
            className="bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center border border-gray-200"
            onClick={() => navigate('/stagiaire/accueil')}
          >
            <Home className="h-4 w-4 mr-2 text-green-600" />
            Retour à l'accueil
          </button>
          
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <div className="h-4 w-4 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Déconnexion
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}