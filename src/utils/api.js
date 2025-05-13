// src/utils/api.js
import axios from 'axios';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: 'https://localhost:7199/api', // URL corrigée - un seul slash
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add an interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Requête envoyée à:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // La requête a été effectuée et le serveur a répondu avec un code d'état
      console.error('Données de réponse complètes:', error.response.data);
      console.error('Statut:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Si la réponse est un objet avec des erreurs de validation
      if (error.response.data && typeof error.response.data === 'object' && error.response.data.errors) {
        console.error('Erreurs de validation:', error.response.data.errors);
        // Retourner un message d'erreur formatté
        return Promise.reject(
          Object.values(error.response.data.errors).flat().join(', ') || 
          `Erreur ${error.response.status}`
        );
      }
      
      return Promise.reject(
        error.response.data?.message || 
        (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) || 
        `Erreur ${error.response.status}`
      );
    } else if (error.request) {
      console.error('Requête sans réponse:', error.request);
      return Promise.reject("Pas de réponse du serveur. Vérifiez que le backend est en cours d'exécution.");
    } else {
      console.error('Erreur de configuration:', error.message);
      return Promise.reject(error.message);
    }
  }
);
// Authentication API calls
export const authAPI = {
  login: async (username, password) => {
  try {
    console.log("URL d'envoi: ", api.defaults.baseURL + '/Logins');
    console.log("Données envoyées: ", { username, motDePasse: password });
    
    const response = await api.post('/Logins', {
      username: username,
      motDePasse: password
    });
    
    console.log("Réponse brute de login: ", response);
    
    if (!response.data) {
      throw new Error("Réponse vide du serveur");
    }
    
    // S'assurer que les propriétés essentielles existent
    if (!response.data.token) {
      console.error("Token manquant dans la réponse");
    }
    
    // Normaliser le type d'utilisateur
    let userType = response.data.userType;
    
    if (userType) {
  if (userType.toLowerCase().includes('admin')) {
    response.data.userType = 'Admin';
  } else if (userType.toLowerCase().includes('membredirection') || 
            userType.toLowerCase().includes('membre direction') ||
            userType.toLowerCase().includes('membre_direction')) {
    response.data.userType = 'MembreDirection';
  } else if (userType.toLowerCase().includes('stagiaire')) {
    response.data.userType = 'Stagiaire';
  } else if (userType.toLowerCase().includes('encadreur')) {
    response.data.userType = 'Encadreur';
  } else if (userType.toLowerCase().includes('chefdepartement') || 
            userType.toLowerCase().includes('chef departement') ||
            userType.toLowerCase().includes('chef_departement')) {
    response.data.userType = 'ChefDepartement';
  } else {
    console.error("Type d'utilisateur manquant dans la réponse");
  }
}
    
    return response.data;
  } catch (error) {
    console.error('Erreur détaillée de login:', error);
    
    // Rejeter avec un message d'erreur plus informatif
    if (error.response && error.response.data) {
      throw error.response.data;
    } else if (error.response) {
      throw `Erreur ${error.response.status}`;
    } else if (error.request) {
      throw "Pas de réponse du serveur. Vérifiez que le backend est en cours d'exécution.";
    } else {
      throw error.message || "Erreur lors de la connexion";
    }
  }
},
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
  },
  
  
  // Vérifier si le token est toujours valide
  checkAuthStatus: async () => {
    try {
      // Endpoint pour vérifier si le token est valide (à adapter selon votre API)
      const response = await api.get('/Logins/verify');
      return response.data;
    } catch (error) {
      // Si une erreur survient, nous supprimons les données d'authentification
      authAPI.logout();
      throw error;
    }
  }
};

// Admin-specific API calls
export const adminAPI = {
  // Dans api.js, ajouter à adminAPI
  getCurrentUser: async () => {
    try {
       const response = await api.get('/Admin/current-user');
      return response.data;
    } catch (error) {
       throw error.response?.data || 'Une erreur est survenue lors de la récupération des informations utilisateur';
  }
  },
  // Ajouter cette méthode dans adminAPI dans le fichier api.js
updatePassword: async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.put('/Admin/update-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Une erreur est survenue lors de la mise à jour du mot de passe';
  }
},
updateAdmin: async (adminId, updateData) => {
  try {
    const response = await api.put(`/Admin/update-info`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Une erreur est survenue lors de la mise à jour des informations';
  }
},
  getAllUsers: async () => {
    try {
      const response = await api.get('/Admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des utilisateurs';
    }
  },
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/Admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la modification du statut';
    }
  },
  getStatistiques: async () => {
    try {
      const response = await api.get('/Statistiques');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des statistiques';
    }
  },
  getStatistiquesByType: async (type) => {
    try {
      const response = await api.get(`/Statistiques/${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération des statistiques par type';
    }
  },
  getTotalUtilisateurs: async () => {
    try {
      const response = await api.get('/Statistiques/total');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Une erreur est survenue lors de la récupération du total des utilisateurs';
    }
  },
};

export default api;