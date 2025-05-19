import api from './api';
export const membreDirectionAPI = {
  createMembreDirection: async (membreData) => {
    try {
      const cleanedData = {
        nom: membreData.nom,
        prenom: membreData.prenom,
        email: membreData.email,
        username: membreData.username,
        telephone: membreData.telephone || '',
        fonction: membreData.fonction
      };
      const response = await api.post('/MembreDirection', cleanedData);
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
  getAllMembresDirection: async () => {
    try {
      const response = await api.get('/MembreDirection');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getMembreDirection: async (id) => {
    try {
      const response = await api.get(`/MembreDirection/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/MembreDirection/${id}/ToggleStatus`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteMembreDirection: async (id) => {
    try {
      const response = await api.delete(`/MembreDirection/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/MembreDirection/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des informations utilisateur';
    }
  },
  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/MembreDirection/update-password', {
        currentPassword, newPassword, confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du mot de passe';
    }
  },
  updateMembreInfo: async (updateData) => {
    try {
      const response = await api.put('/MembreDirection/update-membre-info', updateData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      }
      throw 'Une erreur est survenue lors de la mise à jour des informations';
    }
  },
  getStatistiques: async () => {
    try {
      const response = await api.get('/MembreDirectionStatistiques');
      return response.data;
    } catch (error) {
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