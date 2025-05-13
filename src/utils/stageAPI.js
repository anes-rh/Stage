import api from './api';

export const stageAPI = {
  getAllStages: async () => {
    try {
      const response = await api.get('/Stages');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération stages:', error);
      throw error;
    }
  },
  getStage: async (id) => {
    try {
      const response = await api.get(`/Stages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération stage ${id}:`, error);
      throw error;
    }
  },
  createStage: async (stageData) => {
    try {
      console.log('Données stage envoyées:', JSON.stringify(stageData, null, 2));
      const response = await api.post('/Stages', stageData);
      return response.data;
    } catch (error) {
      console.error('Erreur création stage:', error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création du stage";
      }
    }
  },
  updateStage: async (id, updateData) => {
    try {
      console.log('Données mise à jour stage envoyées:', JSON.stringify(updateData, null, 2));
      const response = await api.put(`/Stages/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour stage ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour du stage";
      }
    }
  },
  updateStageStatus: async (id, statut, raison = null) => {
    try {
      const statusData = {
        Statut: statut,
        Raison: raison
      };
      console.log('Données statut stage envoyées:', JSON.stringify(statusData, null, 2));
      const response = await api.patch(`/Stages/${id}/Status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour statut stage ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour du statut";
      }
    }
  },
  deleteStage: async (id) => {
    try {
      const response = await api.delete(`/Stages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression stage ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la suppression du stage";
      }
    }
  },
  getStagesByDepartement: async (departementId) => {
    try {
      const response = await api.get(`/Stages/Departement/${departementId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération stages par département ${departementId}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la récupération des stages par département";
      }
    }
  },
  searchStages: async (query) => {
    try {
      const response = await api.get(`/Stages/Search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur recherche de stages avec le terme '${query}':`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la recherche de stages";
      }
    }
  },
  getStagesByEncadreur: async (encadreurId) => {
    try {
      const response = await api.get(`/Stages/Encadreur/${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération stages par encadreur ${encadreurId}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la récupération des stages par encadreur";
      }
    }
  },
  terminerStage: async (id) => {
    return stageAPI.updateStageStatus(id, 'Termine');
  },
  annulerStage: async (id, raison) => {
    return stageAPI.updateStageStatus(id, 'Annule', raison);
  },
  prolongerStage: async (id, raison) => {
    return stageAPI.updateStageStatus(id, 'Prolonge', raison);
  }
};

export default stageAPI;