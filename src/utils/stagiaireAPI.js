import api from './api';
export const stagiaireAPI = {
  createStagiaire: async (stagiaireData) => {
    try {
      const cleanedData = {
        nom: stagiaireData.nom,
        prenom: stagiaireData.prenom,
        email: stagiaireData.email,
        username: stagiaireData.username,
        telephone: stagiaireData.telephone || '',
        universite: stagiaireData.universite || '',
        specialite: stagiaireData.specialite || '',
        photoUrl: stagiaireData.photoUrl || '',
        motDePasse: stagiaireData.motDePasse
      };
      const response = await api.post('/Stagiaires', cleanedData);
      return response.data;
    } catch (error) {
      if (error.response) {
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
  getAllStagiaires: async () => {
    try {
      const response = await api.get('/Stagiaires');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getStagiaire: async (id) => {
    try {
      const response = await api.get(`/Stagiaires/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  toggleStatus: async (id) => {
    try {
      const stagiaire = await stagiaireAPI.getStagiaire(id);
      const patchDoc = [
        {
          op: "replace",
          path: "/estActif",
          value: !stagiaire.estActif
        }
      ];
      const response = await api.patch(`/Stagiaires/${id}`, patchDoc);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteStagiaire: async (id) => {
    try {
      const response = await api.delete(`/Stagiaires/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/Stagiaires/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des informations utilisateur';
    }
  },
  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/Stagiaires/update-password', {
        currentPassword, newPassword, confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du mot de passe';
    }
  },
  updateStagiaireInfo: async (updateData) => {
    try {
      const response = await api.put('/Stagiaires/update-stagiaire-info', updateData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw typeof error.response.data === 'string'
          ? error.response.data
          : (error.response.data.message || JSON.stringify(error.response.data));
      }
      throw 'Une erreur est survenue lors de la mise à jour des informations';
    }
  }
};