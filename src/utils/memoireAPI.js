import api from './api';

export const memoireAPI = {
  createMemoire: async (memoireData) => {
    try {
      const cleanedData = {
        titre: memoireData.titre,
        cheminFichier: memoireData.cheminFichier,
        demandeDepotMemoireId: memoireData.demandeDepotMemoireId,
        stageId: memoireData.stageId
      };
      console.log('Données envoyées au backend:', JSON.stringify(cleanedData, null, 2));
      const response = await api.post('/Memoire', cleanedData);
      console.log('Réponse création mémoire:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création mémoire détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création du mémoire";
      }
    }
  },

  getAllMemoires: async () => {
    try {
      const response = await api.get('/Memoire');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération mémoires:', error);
      throw error;
    }
  },

  getMemoire: async (id) => {
    try {
      const response = await api.get(`/Memoire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération mémoire ${id}:`, error);
      throw error;
    }
  },

  getMemoireByStage: async (stageId) => {
    try {
      const response = await api.get(`/Memoire/Stage/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération mémoire par stage ${stageId}:`, error);
      throw error;
    }
  },

  getMemoireByDemandeDepot: async (demandeDepotId) => {
    try {
      const response = await api.get(`/Memoire/DemandeDepot/${demandeDepotId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération mémoire par demande de dépôt ${demandeDepotId}:`, error);
      throw error;
    }
  },

  updateMemoire: async (id, updateData) => {
    try {
      const dataToSend = {
        id: id,
        titre: updateData.titre,
        ...(updateData.cheminFichier && { cheminFichier: updateData.cheminFichier })
      };
      const response = await api.put(`/Memoire/${id}`, dataToSend);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour mémoire ${id}:`, error);
      throw error;
    }
  },

  deleteMemoire: async (id) => {
    try {
      const response = await api.delete(`/Memoire/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression mémoire ${id}:`, error);
      throw error;
    }
  },

  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/Memoire/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response && response.data) {
        console.log('Réponse du serveur pour l\'upload:', response.data);
        return response.data;
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (error) {
      console.error('Erreur téléchargement fichier:', error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors du téléchargement du fichier";
      }
    }
  }
};

export default memoireAPI;