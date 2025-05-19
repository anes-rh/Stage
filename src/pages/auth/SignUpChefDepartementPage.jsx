import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/mobilis-logo.png';
import { chefdepartementAPI } from '../../utils/chefdepartementAPI';
import { departementApi } from '../../services/departementApi';

export default function SignUpChefDepartementPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    username: '',
    telephone: '',
    departement: ''
  });
  
  const [departements, setDepartements] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const departementsData = await departementApi.getAllDepartements();
        setDepartements(departementsData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setSubmitError("Impossible de charger les départements. Veuillez réessayer.");
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitError('');
    setSubmitSuccess('');
    
    const newErrors = {};
    
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
    
    if (!formData.departement.trim()) {
      newErrors.departement = "Le département est requis";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const selectedDepartement = departements.find(dept => dept.nom === formData.departement);
    
    if (!selectedDepartement) {
      setSubmitError("Département invalide. Veuillez réessayer.");
      return;
    }
    
    const chefDepartementData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      username: formData.username,
      telephone: formData.telephone || '',
      departementId: selectedDepartement.id
    };
    
    try {
      setIsLoading(true);
      console.log("Données envoyées au serveur:", chefDepartementData);
      
      const response = await chefdepartementAPI.createChefDepartement(chefDepartementData);
      console.log("Réponse du serveur:", response);
      setSubmitSuccess("Le chef de département a été créé avec succès! Son compte est actif et un email contenant ses identifiants lui a été envoyé.");
      
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        telephone: '',
        departement: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error("Erreur détaillée lors de la création:", error);
      let errorMessage = "Une erreur est survenue lors de la création du compte";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
      } else if (error && error.response && error.response.data) {
        errorMessage = error.response.data;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Mobilis Logo" 
            className="h-24 w-auto" 
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Créer un compte chef de département</h1>
          <p className="text-gray-600">Remplissez les informations pour créer un nouveau chef de département</p>
          <p className="text-green-600 font-medium mt-1">Le compte créé sera automatiquement activé</p>
        </div>
        
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {submitSuccess}
          </div>
        )}
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {submitError}
          </div>
        )}
        
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
              onClick={() => navigate('/admin/creation-chefdepartement')}
              className="text-green-600 hover:text-green-800 font-medium"
              disabled={isLoading}
            >
              Retour à la liste des chefs de département
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}