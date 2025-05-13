import { Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { departementApi } from '../../services/departementApi';

export default function DomaineList({ domaines, departements, onDomaineDeleted, onRefresh }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce domaine? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await departementApi.deleteDomaine(id);
      onDomaineDeleted(id);
    } catch (err) {
      setError(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fonction pour obtenir le nom du département à partir de son ID
  const getDepartementNom = (departementId) => {
    const departement = departements.find(d => d.id === departementId);
    return departement ? departement.nom : 'Inconnu';
  };

  if (domaines.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Aucun domaine n'a été créé.</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 flex items-center justify-center mx-auto text-sm text-blue-600 hover:text-blue-800"
          disabled={isRefreshing}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          disabled={isRefreshing}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Département
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domaines.map((domaine) => (
              <tr key={domaine.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {domaine.nom}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {getDepartementNom(domaine.departementId)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      disabled={isDeleting}
                      onClick={() => handleDelete(domaine.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}