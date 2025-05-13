import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, X, FileText, Calendar, User } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { fichePointageAPI } from '../../utils/fichePointageAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const FicheCard = ({ fiche }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-base text-gray-800">Fiche #{fiche.id}</h3>
          <div className="flex items-center mt-1">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">{fiche.nomPrenomStagiaire}</h4>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap mb-3 text-sm">
        <div className="w-full">
          <div className="flex items-center text-gray-600 mb-1">
            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
            <span className="truncate">
              {formatDate(fiche.dateDebutStage)} - {formatDate(fiche.dateFinStage)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Link 
          to={`/encadreur/fiche-pointage/${fiche.id}`}
          className="flex items-center px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        >
          <FileText className="h-3 w-3 mr-1" />
          Voir détails
        </Link>
      </div>
    </div>
  </div>
);

const EmptyState = ({ noFiches, hasSearch }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-gray-400 mb-3">
      <FileText className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune fiche de pointage trouvée</h3>
    <p className="text-gray-600">
      {noFiches 
        ? "Vous n'avez pas encore créé de fiches de pointage."
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
      placeholder="Rechercher une fiche..."
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

export default function ListeFichesPointage() {
  const [fichePointages, setFichePointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreSearch, setFiltreSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await encadreurAPI.getCurrentUser();
        const fichesData = await fichePointageAPI.getFichesPointageByEncadreur(userData.id);
        setFichePointages(fichesData);
      } catch (err) {
        console.error("Erreur lors du chargement des fiches de pointage:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des fiches de pointage.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fichesFiltrees = useMemo(() => {
    if (!filtreSearch) return fichePointages;
    
    const searchLower = filtreSearch.toLowerCase();
    return fichePointages.filter(fiche => 
      fiche.nomPrenomStagiaire?.toLowerCase().includes(searchLower) ||
      fiche.structureAccueil?.toLowerCase().includes(searchLower) ||
      fiche.nomQualitePersonneChargeSuivi?.toLowerCase().includes(searchLower) ||
      fiche.themeStage?.toLowerCase().includes(searchLower)
    );
  }, [fichePointages, filtreSearch]);

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="fiches-pointage">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des fiches de pointage...</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="fiches-pointage">
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fiches de Pointage</h1>
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
        </div>

        <div className="flex flex-col gap-3">
          {fichesFiltrees.length > 0 ? (
            fichesFiltrees.map((fiche) => <FicheCard key={fiche.id} fiche={fiche} />)
          ) : (
            <EmptyState 
              noFiches={fichePointages.length === 0} 
              hasSearch={filtreSearch.length > 0} 
            />
          )}
        </div>
      </div>
    </EncadreurLayout>
  );
}