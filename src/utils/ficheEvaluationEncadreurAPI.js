import api from './api';

export const ficheEvaluationEncadreurAPI = {
  getAllFichesEvaluationEncadreur: async () => {
    try {
      const response = await api.get('/FicheEvaluationEncadreur');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération fiches d\'évaluation des encadreurs:', error);
      throw error;
    }
  },
  getFicheEvaluationEncadreur: async (id) => {
    try {
      const response = await api.get(`/FicheEvaluationEncadreur/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche d'évaluation d'encadreur ${id}:`, error);
      throw error;
    }
  },
  createFicheEvaluationEncadreur: async (ficheData) => {
    try {
      console.log('Données envoyées au backend:', JSON.stringify(ficheData, null, 2));
      const response = await api.post('/FicheEvaluationEncadreur', ficheData);
      console.log('Réponse création fiche d\'évaluation d\'encadreur:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création fiche d\'évaluation d\'encadreur détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création de la fiche d'évaluation";
      }
    }
  },
  updateFicheEvaluationEncadreur: async (id, updateData) => {
    try {
      console.log(`Mise à jour fiche d'évaluation ${id}:`, JSON.stringify(updateData, null, 2));
      const response = await api.put(`/FicheEvaluationEncadreur/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour fiche d'évaluation d'encadreur ${id}:`, error);
      if (error.response && error.response.status === 400 && error.response.data.includes("48 heures")) {
        throw "L'évaluation ne peut plus être modifiée après 48 heures";
      }
      throw error;
    }
  },
  deleteFicheEvaluationEncadreur: async (id) => {
    try {
      const response = await api.delete(`/FicheEvaluationEncadreur/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression fiche d'évaluation d'encadreur ${id}:`, error);
      if (error.response && error.response.status === 400 && error.response.data.includes("48 heures")) {
        throw "L'évaluation ne peut plus être supprimée après 48 heures";
      }
      throw error;
    }
  },
  getFichesEvaluationByEncadreur: async (encadreurId) => {
    try {
      const response = await api.get(`/FicheEvaluationEncadreur/Encadreur/${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiches d'évaluation pour l'encadreur ${encadreurId}:`, error);
      throw error;
    }
  },
  getFicheEvaluationByStage: async (stageId) => {
    try {
      const response = await api.get(`/FicheEvaluationEncadreur/Stage/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche d'évaluation pour le stage ${stageId}:`, error);
      throw error;
    }
  }
};

export default ficheEvaluationEncadreurAPI;