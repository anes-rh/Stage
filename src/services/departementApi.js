import api from '../utils/api';
export const departementApi = {
  getAllDepartements: async () => {
    try {
      const response = await api.get('/Departements');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      throw error;
    }
  },
  getDepartement: async (id) => {
    try {
      const response = await api.get(`/Departements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du département ${id}:`, error);
      throw error;
    }
  },
  createDepartement: async (departementData) => {
    try {
      const response = await api.post('/Departements', departementData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du département:', error);
      throw error;
    }
  },
  updateDepartement: async (id, departementData) => {
    try {
      const response = await api.put(`/Departements/${id}`, departementData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du département ${id}:`, error);
      throw error;
    }
  },
  deleteDepartement: async (id) => {
    try {
      await api.delete(`/Departements/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du département ${id}:`, error);
      throw error;
    }
  },
  getAllDomaines: async () => {
    try {
      const response = await api.get('/Domaines');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des domaines:', error);
      throw error;
    }
  },
  getDomaine: async (id) => {
    try {
      const response = await api.get(`/Domaines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du domaine ${id}:`, error);
      throw error;
    }
  },
  createDomaine: async (domaineData) => {
    try {
      const response = await api.post('/Domaines', domaineData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du domaine:', error);
      throw error;
    }
  },
  updateDomaine: async (id, domaineData) => {
    try {
      const response = await api.put(`/Domaines/${id}`, domaineData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du domaine ${id}:`, error);
      throw error;
    }
  },
  deleteDomaine: async (id) => {
    try {
      await api.delete(`/Domaines/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du domaine ${id}:`, error);
      throw error;
    }
  }
};
export default departementApi;