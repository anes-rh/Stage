// DepartementForm.jsx
import { useState } from 'react';
import { departementApi } from '../../services/departementApi';
import { BookOpen, Plus } from 'lucide-react';

export default function DepartementForm({ onDepartementCreated, className, buttonIcon, buttonText }) {
  const [nom, setNom] = useState('');
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
        throw new Error('Le nom du département est requis');
      }

      const newDepartement = await departementApi.createDepartement({ nom });
      
      // Réinitialiser le formulaire
      setNom('');
      setSuccess(true);
      
      // Informer le composant parent du nouveau département
      if (onDepartementCreated) {
        onDepartementCreated(newDepartement);
      }
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création du département');
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
          Département créé avec succès!
        </div>
      )}
      
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du département
        </label>
        <div className="relative">
          <input
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-2 pl-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-all"
            placeholder="Ex: Informatique"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <button
        type="submit"
        className={className || "flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all"}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          'Création en cours...'
        ) : (
          <>
            <BookOpen className="h-5 w-5 mr-2" />
            <Plus className="h-4 w-4 mr-2" />
            Créer le département
          </>
        )}
      </button>
    </form>
  );
}
