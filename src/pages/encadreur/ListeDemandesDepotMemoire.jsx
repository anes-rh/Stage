import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, X, FileText, Calendar, User, Filter, ChevronDown, Clock } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatutColorClass = (statut) => {
  const statutValue = typeof statut === 'number' ? statut : 
                     (statut === 'EnAttente' ? 0 : 
                      statut === 'Valide' ? 1 : 
                      statut === 'Rejete' ? 2 : 
                      statut === 'Archive' ? 3 : -1);
  
  switch(statutValue) {
    case 0:
      return 'bg-yellow-100 text-yellow-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-red-100 text-red-800';
    case 3:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatutLabel = (statut) => {
  const statutValue = typeof statut === 'number' ? statut : 
                     (statut === 'EnAttente' ? 0 : 
                      statut === 'Valide' ? 1 : 
                      statut === 'Rejete' ? 2 : 
                      statut === 'Archive' ? 3 : -1);
  
  switch(statutValue) {
    case 0:
      return 'En attente';
    case 1:
      return 'Validé';
    case 2:
      return 'Rejeté';
    case 3:
      return 'Archivé';
    default:
      return 'Inconnu';
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
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatutColorClass(demande.statut)}`}>
          <Clock className="h-3 w-3 mr-1" />
          {getStatutLabel(demande.statut)}
        </span>
      </div>
      
      <div className="mb-3">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Thème</h5>
        <p className="text-sm text-gray-600">{demande.nomTheme}</p>
      </div>

      <div className="mb-3">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Période de stage</h5>
        <p className="text-sm text-gray-600">{formatDate(demande.dateDebutStage)} - {formatDate(demande.dateFinStage)}</p>
      </div>

      <div className="flex flex-wrap mb-3 text-sm">
        <div className="w-full">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
            <span>Demande du {formatDate(demande.dateDemande)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Link 
          to={`/encadreur/demandes-depot-memoire/${demande.id}`}
          className="flex items-center px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        >
          <FileText className="h-3 w-3 mr-1" />
          Voir détails
        </Link>
      </div>
    </div>
  </div>
);

const EmptyState = ({ noDemandesDepotMemoire, hasSearch }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-gray-400 mb-3">
      <FileText className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune demande de dépôt de mémoire trouvée</h3>
    <p className="text-gray-600">
      {noDemandesDepotMemoire 
        ? "Vous n'avez pas encore créé de demandes de dépôt de mémoire."
        : "Essayez de modifier vos critères de recherche."
      }
    </p>
  </div>
);

const SearchBar = ({ filtreSearch, setFiltreSearch }) => (
  <div className="relative group">
    <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 group-hover:text-green-500 transition-colors" />
    <input
      type="text"
      placeholder="Rechercher une demande..."
      className="pl-10 pr-4 py-2 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border border-transparent focus:border-green-300 w-64 transition-all"
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

const FilterDropdown = ({ value, onChange, isOpen, toggleOpen }) => (
  <div className="relative">
    <button 
      onClick={toggleOpen}
      className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
    >
      <Filter className="h-4 w-4 mr-2" />
      <span>Filtrer par statut</span>
      <ChevronDown className="h-4 w-4 ml-2" />
    </button>

    {isOpen && (
      <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'Tous' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('Tous');
            toggleOpen();
          }}
        >
          Tous
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'EnAttente' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('EnAttente');
            toggleOpen();
          }}
        >
          En attente
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'Valide' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('Valide');
            toggleOpen();
          }}
        >
          Validé
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'Rejete' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('Rejete');
            toggleOpen();
          }}
        >
          Rejeté
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'Archive' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('Archive');
            toggleOpen();
          }}
        >
          Archivé
        </button>
      </div>
    )}
  </div>
);

export default function ListeDemandesDepotMemoire() {
  const [demandesDepotMemoire, setDemandesDepotMemoire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('Tous');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await encadreurAPI.getCurrentUser();
        setCurrentUser(userData);
        
        const demandesData = await demandeDepotMemoireAPI.getDemandesDepotMemoireByEncadreur(userData.id);
        setDemandesDepotMemoire(demandesData);
      } catch (err) {
        console.error("Erreur lors du chargement des demandes de dépôt de mémoire:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des demandes de dépôt de mémoire.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(prev => !prev);
  };

  const demandesFiltrees = useMemo(() => {
    let filteredDemandes = [...demandesDepotMemoire];
    
    if (filtreSearch) {
      const searchLower = filtreSearch.toLowerCase();
      filteredDemandes = filteredDemandes.filter(demande => 
        demande.nomPrenomEtudiants?.toLowerCase().includes(searchLower) ||
        demande.nomTheme?.toLowerCase().includes(searchLower) ||
        String(demande.id).includes(searchLower)
      );
    }
    
    if (filtreStatut !== 'Tous') {
      filteredDemandes = filteredDemandes.filter(demande => {
        // Gérer le statut qu'il soit sous forme d'enum string ou valeur numérique
        const statutEnum = demande.statut;
        return statutEnum === filtreStatut || 
               (typeof statutEnum === 'number' && 
                (filtreStatut === 'EnAttente' && statutEnum === 0) ||
                (filtreStatut === 'Valide' && statutEnum === 1) ||
                (filtreStatut === 'Rejete' && statutEnum === 2) ||
                (filtreStatut === 'Archive' && statutEnum === 3));
      });
    }
    
    return filteredDemandes;
  }, [demandesDepotMemoire, filtreSearch, filtreStatut]);

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="demandes-depot-memoire">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des demandes de dépôt de mémoire...</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="demandes-depot-memoire">
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Demandes de Dépôt de Mémoire</h1>
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
          
          <div className="flex items-center">
            <FilterDropdown 
              value={filtreStatut}
              onChange={setFiltreStatut}
              isOpen={showFilterDropdown}
              toggleOpen={toggleFilterDropdown}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {demandesFiltrees.length > 0 ? (
            demandesFiltrees.map(demande => (
              <DemandeCard key={demande.id} demande={demande} />
            ))
          ) : (
            <EmptyState 
              noDemandesDepotMemoire={demandesDepotMemoire.length === 0} 
              hasSearch={filtreSearch.length > 0 || filtreStatut !== 'Tous'} 
            />
          )}
        </div>
      </div>
    </EncadreurLayout>
  );
}