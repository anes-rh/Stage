import api from './api';

export const fichePointageAPI = {
  getAllFichesPointage: async () => {
    try {
      const response = await api.get('/FichesPointages');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération fiches de pointage:', error);
      throw error;
    }
  },
  getFichePointage: async (id) => {
    try {
      const response = await api.get(`/FichesPointages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche de pointage ${id}:`, error);
      throw error;
    }
  },
  updateFichePointage: async (id, updateData) => {
    try {
      console.log('Données envoyées au backend:', JSON.stringify(updateData, null, 2));
      const response = await api.put(`/FichesPointages/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour fiche de pointage ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour de la fiche de pointage";
      }
    }
  },
  deleteFichePointage: async (id) => {
    try {
      const response = await api.delete(`/FichesPointages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression fiche de pointage ${id}:`, error);
      throw error;
    }
  },
  getPointageMois: async (ficheId) => {
    try {
      const response = await api.get(`/FichesPointages/${ficheId}/PointageMois`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération mois de pointage pour fiche ${ficheId}:`, error);
      throw error;
    }
  },
  validateFichePointage: async (id, estValide) => {
    try {
      // Fixed: Changed from /FichesPointages/Validate to /FichesPointages/{id}/Validate
      const response = await api.post(`/FichesPointages/${id}/Validate`, {
        estValide
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur validation fiche de pointage ${id}:`, error);
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
  getFichesPointageByStagiaire: async (stagiaireId) => {
    try {
      const response = await api.get(`/FichesPointages/Stagiaire/${stagiaireId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiches de pointage pour stagiaire ${stagiaireId}:`, error);
      throw error;
    }
  },
  getFichesPointageByEncadreur: async (encadreurId) => {
    try {
      const response = await api.get(`/FichesPointages/Encadreur/${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiches de pointage pour encadreur ${encadreurId}:`, error);
      throw error;
    }
  }
};

export default fichePointageAPI;