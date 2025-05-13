import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/mobilis-logo.png';
import { stagiaireAPI } from '../../utils/stagiaireAPI';

export default function SignUpStagiairePage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    username: '',
    telephone: '',
    universite: '',
    specialite: '',
    motDePasse: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setSubmitError('');
    setSubmitSuccess('');
    
    // Reset errors
    const newErrors = {};
    
    // Validate fields
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    if (!formData.motDePasse.trim()) {
      newErrors.motDePasse = "Le mot de passe est requis";
    } else if (formData.motDePasse.length < 8) {
      newErrors.motDePasse = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    if (formData.motDePasse !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    if (!formData.universite.trim()) {
      newErrors.universite = "L'université est requise";
    }
    
    if (!formData.specialite.trim()) {
      newErrors.specialite = "La spécialité est requise";
    }
    
    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create stagiaire submission data (exclude confirmPassword)
    const stagiaireData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      username: formData.username,
      telephone: formData.telephone || '',
      universite: formData.universite,
      specialite: formData.specialite,
      motDePasse: formData.motDePasse
      // Le backend définit EstActif = true par défaut, pas besoin de l'envoyer
    };
    
    try {
      setIsLoading(true);
      console.log("Données envoyées au serveur:", stagiaireData);
      const response = await stagiaireAPI.createStagiaire(stagiaireData);
      setSubmitSuccess("Le compte stagiaire a été créé avec succès! Le stagiaire peut se connecter immédiatement.");
      
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        telephone: '',
        universite: '',
        specialite: '',
        motDePasse: '',
        confirmPassword: ''
      });
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/membredirection/creation-stagiaires');
      }, 2000);
      
    } catch (error) {
      console.error("Erreur détaillée lors de la création:", error);
      // Afficher l'erreur telle qu'elle est renvoyée
      if (typeof error === 'string') {
        setSubmitError(error);
      } else if (error && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Une erreur est survenue lors de la création du compte");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Mobilis Logo" 
            className="h-24 w-auto" 
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          />
        </div>
        
        {/* Sign up heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Créer un compte stagiaire</h1>
          <p className="text-gray-600">Remplissez les informations pour créer un nouveau stagiaire (Le compte sera actif immédiatement)</p>
        </div>
        
        {/* Success message */}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {submitSuccess}
          </div>
        )}
        
        {/* Error message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {submitError}
          </div>
        )}
        
        {/* Sign up form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom<span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Entrer le nom"
                className={`w-full px-3 py-2 border rounded-md ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>
            
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom<span className="text-red-500">*</span>
              </label>
              <input
                id="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Entrer le prénom"
                className={`w-full px-3 py-2 border rounded-md ${errors.prenom ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur<span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Entrer un nom d'utilisateur"
                className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="universite" className="block text-sm font-medium text-gray-700 mb-1">
                Université<span className="text-red-500">*</span>
              </label>
              <input
                id="universite"
                type="text"
                value={formData.universite}
                onChange={handleChange}
                placeholder="Nom de l'université"
                className={`w-full px-3 py-2 border rounded-md ${errors.universite ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.universite && <p className="mt-1 text-sm text-red-600">{errors.universite}</p>}
            </div>
            
            <div>
              <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité<span className="text-red-500">*</span>
              </label>
              <input
                id="specialite"
                type="text"
                value={formData.specialite}
                onChange={handleChange}
                placeholder="Spécialité du stagiaire"
                className={`w-full px-3 py-2 border rounded-md ${errors.specialite ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.specialite && <p className="mt-1 text-sm text-red-600">{errors.specialite}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              id="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Numéro de téléphone"
              className={`w-full px-3 py-2 border rounded-md ${errors.telephone ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe<span className="text-red-500">*</span>
              </label>
              <input
                id="motDePasse"
                type="password"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className={`w-full px-3 py-2 border rounded-md ${errors.motDePasse ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.motDePasse && <p className="mt-1 text-sm text-red-600">{errors.motDePasse}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe<span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe"
                className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition duration-150 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Création en cours...' : 'Créer le compte'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => navigate('/membredirection/creation-stagiaires')}
              className="text-green-600 hover:text-green-800 font-medium"
              disabled={isLoading}
            >
              Retour à la liste des stagiaires
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}