import api from './api';
export const encadreurAPI = {
  createEncadreur: async (encadreurData) => {
    try {
      const cleanedData = {
        nom: encadreurData.nom,
        prenom: encadreurData.prenom,
        email: encadreurData.email,
        username: encadreurData.username,
        telephone: encadreurData.telephone || '',
        photoUrl: encadreurData.photoUrl || '',
        motDePasse: encadreurData.motDePasse,
        departementId: encadreurData.departementId,
        domaineId: encadreurData.domaineId,
        fonction: encadreurData.fonction || "Non spécifiée"
      };
      const response = await api.post('/Encadreurs', cleanedData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la création du compte";
      }
    }
  },
  getAllEncadreurs: async () => {
    try {
      const response = await api.get('/Encadreurs');
      const normalisedData = response.data.map(encadreur => ({
        ...encadreur,
        estDisponible: Boolean(encadreur.estDisponible || encadreur.EstDisponible || false),
        estActif: Boolean(encadreur.estActif || encadreur.EstActif || false),
        fonction: encadreur.fonction || "Non spécifiée",
        departement: encadreur.departement || { 
          nom: encadreur.departementNom || 'Non assigné',
          id: encadreur.departementId 
        },
        domaine: encadreur.domaine || { 
          nom: encadreur.domaineNom || 'Non assigné',
          id: encadreur.domaineId 
        }
      }));
      return normalisedData;
    } catch (error) {
      throw error;
    }
  },
  getEncadreur: async (id) => {
    try {
      const response = await api.get(`/Encadreurs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  toggleDisponibilite: async (id) => {
    try {
      const encadreur = await encadreurAPI.getEncadreur(id);
      const updateData = {
        id: encadreur.id,
        nom: encadreur.nom,
        prenom: encadreur.prenom,
        email: encadreur.email,
        username: encadreur.username || encadreur.email,
        telephone: encadreur.telephone || '',
        photoUrl: encadreur.photoUrl || '',
        departementId: encadreur.departementId || (encadreur.departement ? encadreur.departement.id : null),
        domaineId: encadreur.domaineId || (encadreur.domaine ? encadreur.domaine.id : null),
        fonction: encadreur.fonction || "Non spécifiée",
        estActif: encadreur.estActif || false,
        estDisponible: !encadreur.estDisponible
      };
      const response = await api.put(`/Encadreurs/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteEncadreur: async (id) => {
    try {
      const response = await api.delete(`/Encadreurs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEncadreursDisponibles: async () => {
    try {
      const response = await api.get('/Encadreurs/disponibles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEncadreursByDepartement: async (departementId) => {
    try {
      const response = await api.get(`/Encadreurs/byDepartement/${departementId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEncadreursByDomaine: async (domaineId) => {
    try {
      const response = await api.get(`/Encadreurs/byDomaine/${domaineId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/Encadreurs/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des informations utilisateur';
    }
  },
  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/Encadreurs/update-password', {
        currentPassword, newPassword, confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du mot de passe';
    }
  },
  toggleStatus: async (id) => {
    try {
      const encadreur = await encadreurAPI.getEncadreur(id);
      const updateData = {
        id: encadreur.id,
        nom: encadreur.nom,
        prenom: encadreur.prenom,
        email: encadreur.email,
        username: encadreur.username || encadreur.email,
        telephone: encadreur.telephone || '',
        photoUrl: encadreur.photoUrl || '',
        departementId: encadreur.departementId || (encadreur.departement ? encadreur.departement.id : null),
        domaineId: encadreur.domaineId || (encadreur.domaine ? encadreur.domaine.id : null),
        fonction: encadreur.fonction || "Non spécifiée",
        estActif: !encadreur.estActif,
        estDisponible: encadreur.estDisponible || false
      };
      const response = await api.put(`/Encadreurs/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateEncadreur: async (id, updateData) => {
    try {
      const validUpdateData = {};
      if ('email' in updateData) { validUpdateData.email = updateData.email; }
      if ('telephone' in updateData) { validUpdateData.telephone = updateData.telephone; }
      if (Object.keys(validUpdateData).length === 0) {
        throw "Aucune donnée valide à mettre à jour";
      }
      const response = await api.put('/Encadreurs/update-encadreur-info', validUpdateData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour des informations";
      }
    }
  },
  updateEncadreurDepartementDomaineFunction: async (id, updateData) => {
    try {
      const encadreur = await encadreurAPI.getEncadreur(id);
      const updatedEncadreur = {
        id: encadreur.id,
        nom: encadreur.nom,
        prenom: encadreur.prenom,
        email: encadreur.email,
        username: encadreur.username || encadreur.email,
        telephone: encadreur.telephone || '',
        photoUrl: encadreur.photoUrl || '',
        departementId: updateData.departementId,
        domaineId: updateData.domaineId,
        fonction: updateData.fonction,
        estActif: Boolean(encadreur.estActif ?? true),
        estDisponible: Boolean(encadreur.estDisponible ?? false)
      };
      const response = await api.put(`/Encadreurs/${id}`, updatedEncadreur);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || JSON.stringify(error.response.data));
      } else if (error.request) {
        throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
      } else {
        throw error.message || "Une erreur est survenue lors de la mise à jour des informations";
      }
    }
  },
  getStatistiques: async () => {
  try {
    const response = await api.get('/EncadreurStatistiques');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    if (error.response) {
      throw typeof error.response.data === 'string' 
        ? error.response.data 
        : (error.response.data.message || JSON.stringify(error.response.data));
    } else if (error.request) {
      throw "Le serveur n'a pas répondu. Vérifiez que le backend est en cours d'exécution.";
    } else {
      throw error.message || "Une erreur est survenue lors de la récupération des statistiques";
    }
  }
},
};