import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/mobilis-logo.png';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { departementApi } from '../../services/departementApi';

export default function SignUpEncadreurPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    username: '',
    telephone: '',
    fonction: '',
    departement: '',
    domaine: '',
    motDePasse: '',
    confirmPassword: ''
  });
  
  const [departements, setDepartements] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const navigate = useNavigate();

  // Charger les départements et domaines au chargement de la page
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const departementsData = await departementApi.getAllDepartements();
        setDepartements(departementsData);
        
        const domainesData = await departementApi.getAllDomaines();
        setDomaines(domainesData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setSubmitError("Impossible de charger les départements et domaines. Veuillez réessayer.");
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrer les domaines lorsque le département change
  useEffect(() => {
    if (formData.departement && domaines.length > 0) {
      // Trouver l'ID du département sélectionné
      const selectedDept = departements.find(dept => dept.nom === formData.departement);
      if (selectedDept) {
        // Filtrer les domaines qui appartiennent au département sélectionné
        const filteredDoms = domaines.filter(dom => dom.departementId === selectedDept.id);
        setFilteredDomaines(filteredDoms);
      } else {
        setFilteredDomaines([]);
      }
    } else {
      setFilteredDomaines([]);
    }
  }, [formData.departement, departements, domaines]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    
    // Réinitialiser la sélection du domaine si le département change
    if (id === 'departement') {
      setFormData(prevData => ({
        ...prevData,
        domaine: ''
      }));
    }
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
    
    if (!formData.departement.trim()) {
      newErrors.departement = "Le département est requis";
    }
    
    if (!formData.domaine.trim()) {
      newErrors.domaine = "Le domaine est requis";
    }
    
    if (!formData.fonction.trim()) {
      newErrors.fonction = "La fonction est requise";
    }
    
    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Trouver les IDs du département et du domaine sélectionnés
    const selectedDepartement = departements.find(dept => dept.nom === formData.departement);
    const selectedDomaine = domaines.find(dom => dom.nom === formData.domaine);
    
    if (!selectedDepartement || !selectedDomaine) {
      setSubmitError("Département ou domaine invalide. Veuillez réessayer.");
      return;
    }
    
    // Create encadreur submission data
    const encadreurData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      username: formData.username,
      telephone: formData.telephone || '',
      fonction: formData.fonction,
      departementId: selectedDepartement.id,
      domaineId: selectedDomaine.id,
      motDePasse: formData.motDePasse
      // estActif est défini à true par défaut dans le backend
    };
    
    try {
      setIsLoading(true);
      console.log("Données envoyées au serveur:", encadreurData);
      await encadreurAPI.createEncadreur(encadreurData);
      setSubmitSuccess("L'encadreur a été créé avec succès! Son compte est actif et prêt à être utilisé.");
      
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        telephone: '',
        fonction: '',
        departement: '',
        domaine: '',
        motDePasse: '',
        confirmPassword: ''
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/creation-encadreurs');
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
          <h1 className="text-2xl font-bold mb-2">Créer un compte encadreur</h1>
          <p className="text-gray-600">Remplissez les informations pour créer un nouvel encadreur</p>
          <p className="text-green-600 font-medium mt-1">Les comptes sont activés automatiquement</p>
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
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">
                Département<span className="text-red-500">*</span>
              </label>
              <select
                id="departement"
                value={formData.departement}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.departement ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading || isDataLoading}
              >
                <option value="">Sélectionner un département</option>
                {departements.map(dept => (
                  <option key={dept.id} value={dept.nom}>
                    {dept.nom}
                  </option>
                ))}
              </select>
              {errors.departement && <p className="mt-1 text-sm text-red-600">{errors.departement}</p>}
            </div>
            
            <div>
              <label htmlFor="domaine" className="block text-sm font-medium text-gray-700 mb-1">
                Domaine<span className="text-red-500">*</span>
              </label>
              <select
                id="domaine"
                value={formData.domaine}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.domaine ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading || isDataLoading || !formData.departement}
              >
                <option value="">Sélectionner un domaine</option>
                {filteredDomaines.map(dom => (
                  <option key={dom.id} value={dom.nom}>
                    {dom.nom}
                  </option>
                ))}
              </select>
              {errors.domaine && <p className="mt-1 text-sm text-red-600">{errors.domaine}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fonction" className="block text-sm font-medium text-gray-700 mb-1">
                Fonction<span className="text-red-500">*</span>
              </label>
              <input
                id="fonction"
                type="text"
                value={formData.fonction}
                onChange={handleChange}
                placeholder="Fonction dans l'entreprise"
                className={`w-full px-3 py-2 border rounded-md ${errors.fonction ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.fonction && <p className="mt-1 text-sm text-red-600">{errors.fonction}</p>}
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
              onClick={() => navigate('/admin/creation-encadreurs')}
              className="text-green-600 hover:text-green-800 font-medium"
              disabled={isLoading}
            >
              Retour à la liste des encadreurs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}