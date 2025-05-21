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
        throw error.message || "Une erreur est survenue lors de la mise à jour de la demande";
      }
    }
  },

  changeStatut: async (id, statutData) => {
    try {
      const response = await api.post(`/DemandeDepotMemoire/${id}/ChangeStatut`, statutData);
      return response.data;
    } catch (error) {
      console.error(`Erreur changement statut demande de dépôt de mémoire ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors du changement de statut";
      }
    }
  },

  deleteDemandeDepotMemoire: async (id) => {
    try {
      const response = await api.delete(`/DemandeDepotMemoire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression demande de dépôt de mémoire ${id}:`, error);
      throw error;
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