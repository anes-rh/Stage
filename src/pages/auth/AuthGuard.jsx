// src/components/auth/AuthGuard.jsx
import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children, requiredRole = null }) {
  // Vérifier si les clés existent dans localStorage avant de les utiliser
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  console.log("Token présent:", !!token);
  console.log("Type d'utilisateur:", userType);
  // S'assurer que 'user' existe dans localStorage avant de le parser
  // Si 'user' est undefined, utiliser un objet vide comme fallback
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  
  // Check if user is authenticated
  if (!token) {
    console.log("Pas de token, redirection vers login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role (if specified)
  if (requiredRole && userType !== requiredRole) {
    console.log(`Le rôle ${userType} ne correspond pas au rôle requis ${requiredRole}`);
    // Redirect based on role
    if (userType === 'Admin') {
      return <Navigate to="/admin/accueil" replace />;
    } else if (userType === 'MembreDirection') {
      return <Navigate to="/membredirection/accueil" replace />;
    } else if (userType === 'Stagiaire') {
      return <Navigate to="/stagiaire/accueil" replace />;
    } else if (userType === 'Encadreur') {
      return <Navigate to="/encadreur/accueil" replace />;
    } else if (userType === 'ChefDepartement') {
      return <Navigate to="/chefdepartement/accueil" replace />;
    }
  }
  
  return children;
}