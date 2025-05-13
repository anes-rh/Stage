import { useState } from 'react';
import { departementApi } from '../../services/departementApi';
import { Layers, Plus } from 'lucide-react';

export default function DomaineForm({ departements, onDomaineCreated, className, buttonIcon, buttonText }) {
  const [nom, setNom] = useState('');
  const [departementId, setDepartementId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validation
      if (!nom.trim()) {
        throw new Error('Le nom du domaine est requis');
      }
      
      if (!departementId) {
        throw new Error('Veuillez sélectionner un département');
      }

      const newDomaine = await departementApi.createDomaine({
        nom,
        departementId: parseInt(departementId)
      });
      
      // Réinitialiser le formulaire
      setNom('');
      setDepartementId('');
      setSuccess(true);
      
      // Informer le composant parent du nouveau domaine
      if (onDomaineCreated) {
        onDomaineCreated(newDomaine);
      }
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création du domaine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          Domaine créé avec succès!
        </div>
      )}
      
      <div>
        <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">
          Département
        </label>
        <div className="relative">
          <select
            id="departement"
            value={departementId}
            onChange={(e) => setDepartementId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 appearance-none pr-10 transition-all"
            disabled={isSubmitting || departements.length === 0}
          >
            <option value="">Sélectionner un département</option>
            {departements.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nom}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        {departements.length === 0 && (
          <p className="mt-1 text-xs text-red-500">
            Aucun département disponible. Veuillez d'abord créer un département.
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du domaine
        </label>
        <div className="relative">
          <input
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-2 pl-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-all"
            placeholder="Ex: Développement Web"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <button
        type="submit"
        className={className || "flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all"}
        disabled={isSubmitting || departements.length === 0}
      >
        {isSubmitting ? (
          'Création en cours...'
        ) : (
          <>
            <Layers className="h-5 w-5 mr-2" />
            <Plus className="h-4 w-4 mr-2" />
            Créer le domaine
          </>
        )}
      </button>
    </form>
  );
}