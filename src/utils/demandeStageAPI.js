import api from './api';
export const demandeStageAPI = {
  createDemandeStage: async (demandeData) => {
    try {
      const cleanedData = {
        cheminFichier: demandeData.cheminFichier,
        stagiaireIds: demandeData.stagiaireIds,
        membreDirectionId: demandeData.membreDirectionId,
        dateDemande: demandeData.dateDemande || new Date().toISOString()
      };
      console.log('Données envoyées au backend:', JSON.stringify(cleanedData, null, 2));
      const response = await api.post('/DemandeDeStage', cleanedData);
      console.log('Réponse création demande de stage:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur création demande de stage détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création de la demande de stage";
      }
    }
  },
  getAllDemandesStage: async () => {
    try {
      const response = await api.get('/DemandeDeStage');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération demandes de stage:', error);
      throw error;
    }
  },
  getDemandeStage: async (id) => {
    try {
      const response = await api.get(`/DemandeDeStage/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demande de stage ${id}:`, error);
      throw error;
    }
  },
  updateDemandeStage: async (id, updateData) => {
    try {
      const dataToSend = {
        statut: updateData.statut,
        commentaire: updateData.commentaire || "",
        ...(updateData.cheminFichier && { cheminFichier: updateData.cheminFichier })
      };
      const response = await api.put(`/DemandeDeStage/${id}`, dataToSend);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour demande de stage ${id}:`, error);
      throw error;
    }
  },
  deleteDemandeStage: async (id) => {
    try {
      const response = await api.delete(`/DemandeDeStage/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression demande de stage ${id}:`, error);
      throw error;
    }
  },
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/DemandeDeStage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response && response.data) {
        console.log('Réponse du serveur pour l', response.data);
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
  },
  downloadFile: async (fileName) => {
    try {
      const fileNameOnly = fileName.split('/').pop();
      const response = await api.get(`/DemandeDeStage/download/${fileNameOnly}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileNameOnly);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
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
export default demandeStageAPI;