import api from './api';
export const chefdepartementAPI = {
  createChefDepartement: async (chefDepartementData) => {
    try {
      const cleanedData = {
        nom: chefDepartementData.nom,
        prenom: chefDepartementData.prenom,
        email: chefDepartementData.email,
        username: chefDepartementData.username,
        telephone: chefDepartementData.telephone || '',
        photoUrl: chefDepartementData.photoUrl || '',
        motDePasse: chefDepartementData.motDePasse,
        departementId: chefDepartementData.departementId
      };
      console.log('Données envoyées au backend pour chef département:', JSON.stringify(cleanedData, null, 2));
      const response = await api.post('/ChefDepartements', cleanedData);
      console.log('Réponse création chef de département:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création chef de département détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        console.error('Headers:', error.response.headers);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création du compte";
      }
    }
  },
  getAllChefDepartements: async () => {
    try {
      const response = await api.get('/ChefDepartements');
      const normalisedData = response.data.map(chef => ({
        ...chef,
        estActif: Boolean(chef.estActif || chef.EstActif || false),
        departement: chef.departement || { 
          nom: chef.departementNom || 'Non assigné',
          id: chef.departementId || null
        }
      }));
      return normalisedData;
    } catch (error) {
      console.error('Erreur récupération chefs de département:', error);
      throw error;
    }
  },
  getChefDepartement: async (id) => {
    try {
      const response = await api.get(`/ChefDepartements/${id}`);
      const chef = response.data;
      return {
        ...chef,
        estActif: Boolean(chef.estActif || chef.EstActif || false),
        departement: chef.departement || { 
          nom: chef.departementNom || 'Non assigné',
          id: chef.departementId || null
        }
      };
    } catch (error) {
      console.error(`Erreur récupération chef de département ${id}:`, error);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/ChefDepartements/current');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération utilisateur courant:', error);
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des informations utilisateur';
    }
  },
  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/ChefDepartements/update-password', {
        currentPassword, newPassword, confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du mot de passe';
    }
  },
  updateChefDepartement: async (id, data) => {
    try {
      console.log('Mise à jour du chef de département avec données:', JSON.stringify(data, null, 2));
      const response = await api.put(`/ChefDepartements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour chef de département ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        console.error('Headers:', error.response.headers);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour du chef de département";
      }
    }
  },
  toggleStatus: async (id) => {
    try {
      const chefDepartement = await chefdepartementAPI.getChefDepartement(id);
      const updateData = {
        id: chefDepartement.id,
        nom: chefDepartement.nom,
        prenom: chefDepartement.prenom,
        email: chefDepartement.email,
        username: chefDepartement.username || chefDepartement.email,
        telephone: chefDepartement.telephone || '',
        photoUrl: chefDepartement.photoUrl || '',
        departementId: chefDepartement.departementId || (chefDepartement.departement ? chefDepartement.departement.id : null),
        estActif: !chefDepartement.estActif
      };
      const response = await api.put(`/ChefDepartements/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur changement statut chef de département ${id}:`, error);
      throw error;
    }
  },
  deleteChefDepartement: async (id) => {
    try {
      const response = await api.delete(`/ChefDepartements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression chef de département ${id}:`, error);
      throw error;
    }
  },
  getChefDepartementsByDepartement: async (departementId) => {
    try {
      const response = await api.get(`/ChefDepartements/byDepartement/${departementId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération chefs de département par département ${departementId}:`, error);
      throw error;
    }
  },
  updateProfile: async (data) => {
    try {
      const filteredData = {
        email: data.email,
        telephone: data.telephone
      };
      const response = await api.put('/ChefDepartements/update-profile', filteredData);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du profil';
    }
  },
  getStatistiques: async () => {
    try {
      const response = await api.get('/ChefDepartementStatistiques');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la récupération des statistiques";
      }
    }
  },
};