import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, X, FileText, Calendar, User, Star, Filter, ChevronDown } from 'lucide-react';
import EncadreurLayout from '../../components/layout/EncadreurLayout';
import { ficheEvaluationStagiaireAPI } from '../../utils/ficheEvaluationStagiaireAPI';
import { encadreurAPI } from '../../utils/encadreurAPI';
import { stageAPI } from '../../utils/stageAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getScoreColorClass = (score) => {
  if (score >= 3) return 'bg-green-100 text-green-800';
  if (score >= 2) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const StageGroupCard = ({ stage, fiches }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <h3 className="font-semibold text-lg text-gray-800">
        {"Stage #" + (fiches[0]?.stageId || "")}
      </h3>
      <div className="text-sm text-gray-600 mt-1">
        {stage?.structureAccueil || fiches[0]?.structureAccueil || "Structure non spécifiée"}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        <FileText className="h-3 w-3 inline mr-1 text-gray-400" />
        {stage?.themeStage || fiches[0]?.themeStage || "Thème non spécifié"}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        <Calendar className="h-3 w-3 inline mr-1 text-gray-400" />
        {formatDate(stage?.dateDebut)} - {formatDate(stage?.dateFin)}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {fiches.map(fiche => (
        <div key={fiche.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-base text-gray-800">Évaluation #{fiche.id}</h3>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">{fiche.nomPrenomStagiaire}</h4>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColorClass(fiche.scoreMoyen)}`}>
                <Star className="h-3 w-3 mr-1 fill-current" />
                {fiche.scoreMoyen.toFixed(1)}/4
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Link 
                to={`/encadreur/fiches-evaluation/${fiche.id}`}
                className="flex items-center px-3 py-1 text-xs font-medium rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <FileText className="h-3 w-3 mr-1" />
                Voir détails
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ noFiches, hasSearch }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="text-gray-400 mb-3">
      <FileText className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune fiche d'évaluation trouvée</h3>
    <p className="text-gray-600">
      {noFiches 
        ? "Vous n'avez pas encore créé de fiches d'évaluation."
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

const FilterDropdown = ({ value, onChange, isOpen, toggleOpen }) => (
  <div className="relative">
    <button 
      onClick={toggleOpen}
      className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
    >
      <Filter className="h-4 w-4 mr-2" />
      <span>Filtrer par score</span>
      <ChevronDown className="h-4 w-4 ml-2" />
    </button>

    {isOpen && (
      <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'tous' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('tous');
            toggleOpen();
          }}
        >
          Tous
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'excellent' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('excellent');
            toggleOpen();
          }}
        >
          Excellent (≥ 3.0)
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'bon' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('bon');
            toggleOpen();
          }}
        >
          Bon (2.0 - 2.9)
        </button>
        <button 
          className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${value === 'faible' ? 'bg-green-50 text-green-700' : ''}`}
          onClick={() => {
            onChange('faible');
            toggleOpen();
          }}
        >
          À améliorer (&lt; 2.0)
        </button>
      </div>
    )}
  </div>
);

export default function ListeFichesEvaluation() {
  const [fichesEvaluation, setFichesEvaluation] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreSearch, setFiltreSearch] = useState('');
  const [filtreScore, setFiltreScore] = useState('tous');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await encadreurAPI.getCurrentUser();
        setCurrentUser(userData);
        
        const fichesData = await ficheEvaluationStagiaireAPI.getFichesEvaluationByEncadreur(userData.id);
        setFichesEvaluation(fichesData);

        const stagesData = await stageAPI.getAllStages();
        setStages(stagesData);
      } catch (err) {
        console.error("Erreur lors du chargement des fiches d'évaluation:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des fiches d'évaluation.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(prev => !prev);
  };

  const fichesFiltrees = useMemo(() => {
    let filteredFiches = [...fichesEvaluation];
    
    if (filtreSearch) {
      const searchLower = filtreSearch.toLowerCase();
      filteredFiches = filteredFiches.filter(fiche => 
        fiche.nomPrenomStagiaire?.toLowerCase().includes(searchLower) ||
        fiche.formationStagiaire?.toLowerCase().includes(searchLower) ||
        fiche.themeStage?.toLowerCase().includes(searchLower) ||
        fiche.structureAccueil?.toLowerCase().includes(searchLower) ||
        stages.find(s => s.id === fiche.stageId)?.themeStage?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filtreScore === 'excellent') {
      filteredFiches = filteredFiches.filter(fiche => fiche.scoreMoyen >= 3);
    } else if (filtreScore === 'bon') {
      filteredFiches = filteredFiches.filter(fiche => fiche.scoreMoyen >= 2 && fiche.scoreMoyen < 3);
    } else if (filtreScore === 'faible') {
      filteredFiches = filteredFiches.filter(fiche => fiche.scoreMoyen < 2);
    }
    
    return filteredFiches;
  }, [fichesEvaluation, filtreSearch, filtreScore, stages]);

  const fichesGroupeesByStage = useMemo(() => {
    const groupedFiches = {};
    
    fichesFiltrees.forEach(fiche => {
      if (!groupedFiches[fiche.stageId]) {
        groupedFiches[fiche.stageId] = [];
      }
      groupedFiches[fiche.stageId].push(fiche);
    });
    
    return groupedFiches;
  }, [fichesFiltrees]);

  const findStage = (stageId) => {
    return stages.find(s => s.id === stageId);
  };

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="fiches-evaluation">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des fiches d'évaluation...</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="fiches-evaluation">
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fiches d'Évaluation</h1>
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
              value={filtreScore}
              onChange={setFiltreScore}
              isOpen={showFilterDropdown}
              toggleOpen={toggleFilterDropdown}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {Object.keys(fichesGroupeesByStage).length > 0 ? (
            Object.entries(fichesGroupeesByStage).map(([stageId, fiches]) => (
              <StageGroupCard 
                key={stageId} 
                stage={findStage(parseInt(stageId))} 
                fiches={fiches} 
              />
            ))
          ) : (
            <EmptyState 
              noFiches={fichesEvaluation.length === 0} 
              hasSearch={filtreSearch.length > 0 || filtreScore !== 'tous'} 
            />
          )}
        </div>
      </div>
    </EncadreurLayout>
  );
}