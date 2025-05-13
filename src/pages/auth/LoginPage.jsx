import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/mobilis-logo.png';
import { authAPI } from '../../utils/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors = {};
    setLoginError('');
    
    // Validate fields
    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    if (!password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Tentative de connexion avec:", { username, password: '***' });
      
      const response = await authAPI.login(username, password);
      
      console.log("Réponse de login complète:", response);
      console.log("Type d'utilisateur:", response.userType);
      console.log("Objet utilisateur:", response.user);
      
      // Stocker les données d'authentification
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Normaliser le type d'utilisateur pour éviter les problèmes de casse
      let userType = response.userType;
      
      // Gérer différents formats de "MembreDirection"
      if (userType && (userType.toLowerCase().includes('membredirection') || 
          userType.toLowerCase().includes('membre direction') ||
          userType.toLowerCase().includes('membre_direction'))) {
        userType = 'MembreDirection';
      } 
      // Gérer différents formats de "Admin"
      else if (userType && userType.toLowerCase().includes('admin')) {
        userType = 'Admin';
      }
      
      // Stocker le type d'utilisateur normalisé
      localStorage.setItem('userType', userType);
      
      // Stocker l'objet utilisateur
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Rediriger en fonction du type d'utilisateur
      if (userType === 'Admin') {
  console.log("Redirection vers le tableau de bord admin");
  navigate('/admin/accueil');
} else if (userType === 'MembreDirection') {
  console.log("Redirection vers le tableau de bord membre de direction");
  navigate('/membredirection/accueil');
} else if (userType === 'Stagiaire') {
  console.log("Redirection vers le tableau de bord stagiaire");
  navigate('/stagiaire/accueil');
} else if (userType === 'Encadreur') {
  console.log("Redirection vers le tableau de bord encadreur");
  navigate('/encadreur/accueil');
} else if (userType === 'ChefDepartement') {
  console.log("Redirection vers le tableau de bord chef de département");
  navigate('/chefdepartement/accueil');
}else {
  console.log("Redirection vers l'accueil par défaut");
  navigate('/accueil');
}
    } catch (error) {
      console.error('Login error détaillé:', error);
      setLoginError(typeof error === 'string' ? error : "Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="Mobilis Logo" 
            className="h-32 w-auto" 
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          />
        </div>
        
        {/* Sign in heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Connectez-vous à MOBILIS STAGE</h1>
          <p className="text-gray-600">Commencez à suivre votre parcours avec Mobilis</p>
        </div>
        
        {/* Login error message */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {loginError}
          </div>
        )}
        
        {/* Sign in form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrer votre nom d'utilisateur"
              className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrer votre mot de passe"
              className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-green-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition duration-150 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Footer logo */}
        <div className="mt-12 flex justify-center">
          <img 
            src={logo} 
            alt="Mobilis Logo" 
            className="h-24 w-auto" 
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}