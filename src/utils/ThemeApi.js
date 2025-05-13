import api from './api';

export const themesAPI = {
  // Récupérer tous les thèmes
  getAllThemes: async () => {
    try {
      const response = await api.get('/Themes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Récupérer un thème spécifique
  getTheme: async (id) => {
    try {
      const response = await api.get(`/Themes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Créer un nouveau thème
  createTheme: async (themeData) => {
    try {
      const cleanedData = {
        nom: themeData.nom,
        demandeaccordId: themeData.demandeaccordId,
        stageId: themeData.stageId || null
      };
      
      const response = await api.post('/Themes', cleanedData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création du thème";
      }
    }
  },
  
  // Mettre à jour un thème existant
  updateTheme: async (id, updateData) => {
    try {
      const cleanedData = {
        nom: updateData.nom
      };
      
      const response = await api.put(`/Themes/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour du thème";
      }
    }
  },
  
  // Assigner un stage à un thème
  assignStageToTheme: async (themeId, stageId) => {
    try {
      const response = await api.put(`/Themes/${themeId}/AssignStage/${stageId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else {
        throw error.message || "Une erreur est survenue lors de l'assignation du stage au thème";
      }
    }
  },
  
  // Supprimer un thème
  deleteTheme: async (id) => {
    try {
      const response = await api.delete(`/Themes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};