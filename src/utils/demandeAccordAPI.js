import api from './api';

export const demandeAccordAPI = {
  getAllDemandesAccord: async () => {
    try {
      const response = await api.get('/Demandeaccord');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération demandes d\'accord:', error);
      throw error;
    }
  },
  
  getDemandeAccord: async (id) => {
    try {
      const response = await api.get(`/Demandeaccord/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demande d'accord ${id}:`, error);
      throw error;
    }
  },
  
  updateMembreDirectionPart: async (id, membreDirectionData) => {
    try {
      const cleanedData = {
        themeNom: membreDirectionData.themeNom,
        departementId: membreDirectionData.departementId,
        domaineId: membreDirectionData.domaineId,
        natureStage: membreDirectionData.natureStage,
        universiteInstitutEcole: membreDirectionData.universiteInstitutEcole,
        filiereSpecialite: membreDirectionData.filiereSpecialite,
        diplomeObtention: membreDirectionData.diplomeObtention,
      };
      console.log('Données membre direction envoyées:', JSON.stringify(cleanedData, null, 2));
      const response = await api.put(`/Demandeaccord/MembreDirectionUpdate/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour partie membre direction ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour de la partie membre de direction";
      }
    }
  },
  
  updateChefDepartementPart: async (id, chefDepartementData) => {
    try {
      const cleanedData = {
        serviceAccueil: chefDepartementData.serviceAccueil,
        dateDebut: chefDepartementData.dateDebut,
        dateFin: chefDepartementData.dateFin,
        nombreSeancesParSemaine: chefDepartementData.nombreSeancesParSemaine,
        dureeSeances: chefDepartementData.dureeSeances
      };
      console.log('Données chef département envoyées:', JSON.stringify(cleanedData, null, 2));
      const response = await api.put(`/Demandeaccord/ChefDepartementUpdate/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour partie chef département ${id}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour de la partie chef de département";
      }
    }
  },
  
  assignEncadreur: async (id, encadreurId) => {
    try {
      const response = await api.put(`/Demandeaccord/AssignEncadreur/${id}?encadreurId=${encadreurId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur assignation encadreur ${id}:`, error);
      throw error;
    }
  },
  
  assignChefDepartement: async (id, chefDepartementId) => {
    try {
      const response = await api.put(`/Demandeaccord/AssignChefDepartement/${id}?chefDepartementId=${chefDepartementId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur assignation chef département ${id}:`, error);
      throw error;
    }
  },
  
  updateStatus: async (id, status, commentaire) => {
    try {
      const response = await api.put(`/Demandeaccord/UpdateStatus/${id}`, { status, commentaire });
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour statut demande d'accord ${id}:`, error);
      if (error.response) {
        console.error('Données d\'erreur complètes:', error.response.data);
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
  
  deleteDemandeAccord: async (id) => {
    try {
      const response = await api.delete(`/Demandeaccord/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur suppression demande d'accord ${id}:`, error);
      throw error;
    }
  },
  
  getDemandesByChefDepartement: async (chefId) => {
    try {
      const response = await api.get(`/Demandeaccord/ByChefDepartement/${chefId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération demandes d'accord pour chef ${chefId}:`, error);
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la récupération des demandes";
      }
    }
  }
};

export default demandeAccordAPI;