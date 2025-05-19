import api from './api';

export const demandeDepotMemoireAPI = {
  getAllDemandesDepotMemoire: async () => {
    try {
      const response = await api.get('/DemandeDepotMemoire');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération demandes de dépôt de mémoire:', error);
      throw error;
    }
  },

  getDemandeDepotMemoire: async (id) => {
    try {
      const response = await api.get(`/DemandeDepotMemoire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demande de dépôt de mémoire ${id}:`, error);
      throw error;
    }
  },

  createDemandeDepotMemoire: async (demandeData) => {
    try {
      console.log('Données envoyées pour création demande:', JSON.stringify(demandeData, null, 2));
      const response = await api.post('/DemandeDepotMemoire', demandeData);
      return response.data;
    } catch (error) {
      console.error('Erreur création demande de dépôt de mémoire:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création de la demande";
      }
    }
  },

  updateDemandeDepotMemoire: async (id, updateData) => {
    try {
      console.log('Données envoyées pour mise à jour:', JSON.stringify(updateData, null, 2));
      const response = await api.put(`/DemandeDepotMemoire/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour demande de dépôt de mémoire ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour";
      }
    }
  },

  validerDemandeDepotMemoire: async (id, validationData) => {
    try {
      console.log('Données envoyées pour validation:', JSON.stringify(validationData, null, 2));
      const response = await api.post(`/DemandeDepotMemoire/Valider/${id}`, validationData);
      return response.data;
    } catch (error) {
      console.error(`Erreur validation demande de dépôt de mémoire ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la validation";
      }
    }
  },

  deleteDemandeDepotMemoire: async (id) => {
    try {
      const response = await api.delete(`/DemandeDepotMemoire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression demande de dépôt de mémoire ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la suppression";
      }
    }
  },

  getDemandeDepotMemoireByStage: async (stageId) => {
    try {
      const response = await api.get(`/DemandeDepotMemoire/Stage/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demande de dépôt de mémoire pour stage ${stageId}:`, error);
      throw error;
    }
  },

  getDemandesDepotMemoireByEncadreur: async (encadreurId) => {
    try {
      const response = await api.get(`/DemandeDepotMemoire/Encadreur/${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demandes de dépôt de mémoire pour encadreur ${encadreurId}:`, error);
      throw error;
    }
  }
};

export default demandeDepotMemoireAPI;