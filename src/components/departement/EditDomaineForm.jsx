import { useState, useEffect } from 'react';
import { departementApi } from '../../services/departementApi';

export default function EditDomaineForm({ domaine, departements, onDomaineUpdated, onClose }) {
  const [nom, setNom] = useState('');
  const [departementId, setDepartementId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialiser le formulaire avec les données du domaine
  useEffect(() => {
    if (domaine) {
      setNom(domaine.nom || '');
      setDepartementId(domaine.departementId ? domaine.departementId.toString() : '');
    }
  }, [domaine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!nom.trim()) {
        throw new Error('Le nom du domaine est requis');
      }
      
      if (!departementId) {
        throw new Error('Veuillez sélectionner un département');
      }

      const updatedDomaine = await departementApi.updateDomaine(domaine.id, {
        nom,
        departementId: parseInt(departementId)
      });
      
      // Informer le composant parent de la mise à jour
      if (onDomaineUpdated) {
        onDomaineUpdated(updatedDomaine);
      }
      
      // Fermer le formulaire
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour du domaine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-2 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="edit-departement" className="block text-sm font-medium text-gray-700 mb-1">
          Département
        </label>
        <select
          id="edit-departement"
          value={departementId}
          onChange={(e) => setDepartementId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting || departements.length === 0}
        >
          <option value="">Sélectionner un département</option>
          {departements.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.nom}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du domaine
        </label>
        <input
          type="text"
          id="edit-nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Développement Web"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}