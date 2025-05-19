import api from './api';

export const ficheEvaluationStagiaireAPI = {
  getAllFichesEvaluationStagiaire: async () => {
    try {
      const response = await api.get('/FicheEvaluationStagiaire');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération fiches d\'évaluation des stagiaires:', error);
      throw error;
    }
  },
  getFicheEvaluationStagiaire: async (id) => {
    try {
      const response = await api.get(`/FicheEvaluationStagiaire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche d'évaluation de stagiaire ${id}:`, error);
      if (error.response && error.response.status === 403) {
        throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour consulter cette fiche d'évaluation.";
      }
      throw error;
    }
  },
  createFicheEvaluationStagiaire: async (ficheData) => {
    try {
      console.log('Données envoyées au backend:', JSON.stringify(ficheData, null, 2));
      const response = await api.post('/FicheEvaluationStagiaire', ficheData);
      console.log('Réponse création fiche d\'évaluation de stagiaire:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création fiche d\'évaluation de stagiaire détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        if (error.response.status === 403) {
          throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour créer une fiche d'évaluation.";
        }
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
  updateFicheEvaluationStagiaire: async (id, updateData) => {
    try {
      console.log(`Mise à jour fiche d'évaluation ${id}:`, JSON.stringify(updateData, null, 2));
      const response = await api.put(`/FicheEvaluationStagiaire/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour fiche d'évaluation de stagiaire ${id}:`, error);
      if (error.response) {
        if (error.response.status === 403) {
          throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour modifier cette fiche d'évaluation.";
        }
        if (error.response.status === 400 && error.response.data.includes("7 jours")) {
          throw "L'évaluation ne peut plus être modifiée après 7 jours";
        }
      }
      throw error;
    }
  },
  deleteFicheEvaluationStagiaire: async (id) => {
    try {
      const response = await api.delete(`/FicheEvaluationStagiaire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression fiche d'évaluation de stagiaire ${id}:`, error);
      if (error.response) {
        if (error.response.status === 403) {
          throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour supprimer cette fiche d'évaluation.";
        }
        if (error.response.status === 400 && error.response.data.includes("7 jours")) {
          throw "L'évaluation ne peut plus être supprimée après 7 jours";
        }
      }
      throw error;
    }
  },
  getFicheEvaluationByStagiaire: async (stagiaireId) => {
    try {
      const response = await api.get(`/FicheEvaluationStagiaire/Stagiaire/${stagiaireId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche d'évaluation pour le stagiaire ${stagiaireId}:`, error);
      if (error.response && error.response.status === 403) {
        throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour consulter ces fiches d'évaluation.";
      }
      throw error;
    }
  },
  getFichesEvaluationByEncadreur: async (encadreurId) => {
    try {
      const response = await api.get(`/FicheEvaluationStagiaire/Encadreur/${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiches d'évaluation pour l'encadreur ${encadreurId}:`, error);
      if (error.response && error.response.status === 403) {
        throw "Erreur 403: Accès refusé. Vous n'avez pas les permissions nécessaires pour consulter ces fiches d'évaluation.";
      }
      throw error;
    }
  },
  getFicheEvaluationByStage: async (stageId) => {
    try {
      const response = await api.get(`/FicheEvaluationStagiaire/Stage/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération fiche d'évaluation pour le stage ${stageId}:`, error);
      if (error.response && error.response.status === 403) {
        throw "Accès refusé. Vous n'avez pas les permissions nécessaires pour consulter cette fiche d'évaluation.";
      }
      throw error;
    }
  },
  validateFicheEvaluationStagiaire: async (id, estValide) => {
    try {
      const response = await api.post(`/FicheEvaluationStagiaire/${id}/Validate`, {
        estValide
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur validation fiche d'évaluation de stagiaire ${id}:`, error);
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
  }
};

export default ficheEvaluationStagiaireAPI;