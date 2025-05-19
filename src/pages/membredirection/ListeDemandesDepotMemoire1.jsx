import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, X, FileText, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatutColor = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Valide':
      return 'bg-green-100 text-green-800';
    case 'Rejete':
      return 'bg-red-100 text-red-800';
    case 'Archive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatutIcon = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return <span className="h-3 w-3 bg-yellow-500 rounded-full mr-1" />;
    case 'Valide':
      return <CheckCircle className="h-3 w-3 mr-1" />;
    case 'Rejete':
      return <XCircle className="h-3 w-3 mr-1" />;
    case 'Archive':
      return <FileText className="h-3 w-3 mr-1" />;
    default:
      return <span className="h-3 w-3 bg-gray-500 rounded-full mr-1" />;
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case 'EnAttente':
      return 'En attente';
    case 'Valide':
      return 'Validé';
    case 'Rejete':
      return 'Rejeté';
    case 'Archive':
      return 'Archivé';
    default:
      return statut;
  }
};

const DemandeCard = ({ demande }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-base text-gray-800">Demande #{demande.id}</h3>
          <div className="flex items-center mt-1">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">{demande.nomPrenomEtudiants}</h4>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(demande.statut)}`}>
          {getStatutIcon(demande.statut)}
          {getStatutLabel(demande.statut)}
        </span>
      </div>

      <div className="mb-3">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Thème</h5>
        <p className="text-sm text-gray-600">{demande.nomTheme}</p>
      </div>

      <div className="mb-3">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Encadreur</h5>
        <p className="text-sm text-gray-600">{demande.nomPrenomEncadreur}</p>
      </div>

      <div className="flex flex-wrap mb-3 text-sm">
        <div className="w-full mb-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
            <span>Demande du {formatDate(demande.dateDemande)}</span>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
            <span className="truncate">
              Stage: {formatDate(demande.dateDebutStage)} - {formatDate(demande.dateFinStage)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Link 
          to={`/membredirection/Demandes-Depot-Memoire1/${demande.id}`}
          className="flex items-center px-3 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <FileText className="h-3 w-3 mr-1" />
          Voir détails
        </Link>
      </div>
    </div>
  </div>
);

const EmptyState = ({ noDemandes, hasSearch }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-gray-400 mb-3">
      <FileText className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune demande de dépôt trouvée</h3>
    <p className="text-gray-600">
      {noDemandes 
        ? "Il n'y a pas encore de demandes de dépôt de mémoire."
        : "Essayez de modifier vos critères de recherche."
      }
    </p>
  </div>
);

const SearchBar = ({ filtreSearch, setFiltreSearch }) => (
  <div className="relative group">
    <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-blue-500 transition-colors" />
    <input
      type="text"
      placeholder="Rechercher une demande..."
      className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-300 w-64 transition-all"
      value={filtreSearch}
      onChange={(e) => setFiltreSearch(e.target.value)}
    />
    {filtreSearch && (
      <button 
        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600" 
        onClick={() => setFiltreSearch('')}
        aria-label="Effacer la recherche"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const StatutFilter = ({ selectedStatut, setSelectedStatut }) => (
  <select
    value={selectedStatut}
    onChange={(e) => setSelectedStatut(e.target.value)}
    className="px-3 py-2 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-300 transition-all"
  >
    <option value="">Tous les statuts</option>
    <option value="EnAttente">En attente</option>
    <option value="Valide">Validé</option>
    <option value="Rejete">Rejeté</option>
    <option value="Archive">Archivé</option>
  </select>
);

export default function ListeDemandesDepotMemoire1() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const demandesData = await demandeDepotMemoireAPI.getAllDemandesDepotMemoire();
        setDemandes(demandesData);
      } catch (err) {
        console.error("Erreur lors du chargement des demandes:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des demandes.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const demandesFiltrees = useMemo(() => {
    let filteredDemandes = demandes;
    
    if (selectedStatut) {
      filteredDemandes = filteredDemandes.filter(demande => demande.statut === selectedStatut);
    }
    
    if (filtreSearch) {
      const searchLower = filtreSearch.toLowerCase();
      filteredDemandes = filteredDemandes.filter(demande => 
        demande.nomPrenomEtudiants?.toLowerCase().includes(searchLower) ||
        demande.nomTheme?.toLowerCase().includes(searchLower) ||
        demande.nomPrenomEncadreur?.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredDemandes;
  }, [demandes, filtreSearch, selectedStatut]);

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="Demandes-Depot-Memoire1">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="Demandes-Depot-Memoire1">
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Toutes les Demandes de Dépôt de Mémoire</h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button 
              className="ml-auto text-red-700 hover:text-red-900" 
              onClick={() => setError('')}
              aria-label="Fermer le message d'erreur"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <SearchBar filtreSearch={filtreSearch} setFiltreSearch={setFiltreSearch} />
          <StatutFilter selectedStatut={selectedStatut} setSelectedStatut={setSelectedStatut} />
        </div>

        <div className="flex flex-col gap-3">
          {demandesFiltrees.length > 0 ? (
            demandesFiltrees.map((demande) => <DemandeCard key={demande.id} demande={demande} />)
          ) : (
            <EmptyState 
              noDemandes={demandes.length === 0} 
              hasSearch={filtreSearch.length > 0 || selectedStatut.length > 0} 
            />
          )}
        </div>
      </div>
    </MembreDirectionLayout>
  );
}