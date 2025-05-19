import api from './api';

export const conventionAPI = {
  getAllConventions: async () => {
    try {
      const response = await api.get('/Convention');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération conventions:', error);
      throw error;
    }
  },
  getConvention: async (id) => {
    try {
      const response = await api.get(`/Convention/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération convention ${id}:`, error);
      throw error;
    }
  },
  getConventionsByStage: async (stageId) => {
    try {
      const response = await api.get(`/Convention/ByStage/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération conventions pour le stage ${stageId}:`, error);
      throw error;
    }
  },
  updateConvention: async (id, updateData) => {
    try {
      console.log('Données convention envoyées:', JSON.stringify(updateData, null, 2));
      const response = await api.put(`/Convention/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour convention ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour de la convention";
      }
    }
  },
  deleteConvention: async (id) => {
    try {
      const response = await api.delete(`/Convention/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression convention ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la suppression de la convention";
      }
    }
  },
  accepterConvention: async (id, commentaire = null, cheminFichier = null) => {
    try {
      const updateData = {
        Status: 'Accepte',
        Commentaire: commentaire
      };
      if (cheminFichier) {
        updateData.CheminFichier = cheminFichier;
      }
      const response = await api.put(`/Convention/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur acceptation convention ${id}:`, error);
      throw error;
    }
  },
  refuserConvention: async (id, commentaire = null, cheminFichier = null) => {
    try {
      const updateData = {
        Status: 'Refuse',
        Commentaire: commentaire
      };
      if (cheminFichier) {
        updateData.CheminFichier = cheminFichier;
      }
      const response = await api.put(`/Convention/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur refus convention ${id}:`, error);
      throw error;
    }
  },
uploadFile: async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/Convention/upload', formData, {
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
    console.error('Erreur téléchargement fichier convention:', error);
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
    const response = await api.get(`/Convention/download/${fileNameOnly}`, {
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
    console.error('Erreur téléchargement fichier convention:', error);
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

export default conventionAPI;