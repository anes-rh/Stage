
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, AlertCircle, Check, X, Info, CheckCircle, User, FileText, Building, Briefcase } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { fichePointageAPI } from '../../utils/fichePointageAPI';

export default function FichePointageDirecteur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pointageMois, setPointageMois] = useState([]);
  const [moisSelectionne, setMoisSelectionne] = useState(null);
  const [validating, setValidating] = useState(false);

  const getNomMois = (numeroMois) => {
    const noms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return noms[numeroMois - 1] || "Mois inconnu";
  };

  useEffect(() => {
    const fetchFichePointage = async () => {
      try {
        setLoading(true);
        const ficheData = await fichePointageAPI.getFichePointage(id);
        setFiche(ficheData);
        
        const pointageData = await fichePointageAPI.getPointageMois(id);
        
        const preparedPointageMois = pointageData.map(mois => {
          const joursPresence = mois.joursPresence && Array.isArray(mois.joursPresence) 
            ? mois.joursPresence.map(jour => ({
                ...jour,
                jourSemaineFr: getJourSemaineFromNumber(jour.jourSemaine)
              }))
            : [];
            
          return {
            ...mois,
            joursPresence
          };
        });
        
        setPointageMois(preparedPointageMois);
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const currentMonthData = preparedPointageMois.find(
          m => (typeof m.mois === 'string' ? parseInt(m.mois) : m.mois) === currentMonth && m.annee === currentYear
        );
        
        setMoisSelectionne(currentMonthData || (preparedPointageMois.length > 0 ? preparedPointageMois[0] : null));
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFichePointage();
    }
  }, [id]);

  const getJourSemaineFromNumber = (number) => {
    const jourNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return jourNames[number] || 'lundi';
  };

  const handleMoisChange = (e) => {
    const [mois, annee] = e.target.value.split('-').map(Number);
    const selected = pointageMois.find(m => 
      (typeof m.mois === 'string' ? parseInt(m.mois) : m.mois) === mois && 
      m.annee === annee
    );
    if (selected) setMoisSelectionne(selected);
  };

  const toggleFicheValidation = async () => {
    try {
      setValidating(true);
      setError('');
      setSuccess('');
      
      await fichePointageAPI.validateFichePointage(id, !fiche.estValide);
      
      setFiche({
        ...fiche,
        estValide: !fiche.estValide
      });
      
      setSuccess(fiche.estValide 
        ? "La fiche de pointage a été invalidée avec succès."
        : "La fiche de pointage a été validée avec succès."
      );
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la validation.");
    } finally {
      setValidating(false);
    }
  };

  const isDateInStagePeriod = (date) => {
    if (!fiche) return false;
    const dateObj = new Date(date);
    const dateDebut = new Date(fiche.dateDebutStage);
    const dateFin = new Date(fiche.dateFinStage);
    
    dateObj.setHours(0, 0, 0, 0);
    dateDebut.setHours(0, 0, 0, 0);
    dateFin.setHours(0, 0, 0, 0);
    
    return dateObj >= dateDebut && dateObj <= dateFin;
  };

  const isWeekend = (jourSemaine) => {
    if (typeof jourSemaine === 'number') {
      return jourSemaine === 5 || jourSemaine === 6;
    } else if (typeof jourSemaine === 'string') {
      return ["vendredi", "samedi"].includes(jourSemaine.toLowerCase());
    }
    return false;
  };

  const getJourSemaineDisplay = (jour) => {
    if (jour.jourSemaineFr) return jour.jourSemaineFr;
    if (typeof jour.jourSemaine === 'number') {
      return getJourSemaineFromNumber(jour.jourSemaine);
    }
    return jour.jourSemaine || 'Jour inconnu';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStageType = (natureStage) => {
    switch (natureStage) {
      case 0:
        return "Stage d'imprégnation";
      case 1:
        return "Stage de fin d'études";
      default:
        return "Type inconnu";
    }
  };

  const calculatePresenceSummary = () => {
    if (!pointageMois || pointageMois.length === 0) return { total: 0, present: 0, absent: 0 };
    
    let totalJours = 0;
    let joursPresent = 0;
    let joursAbsent = 0;
    
    pointageMois.forEach(mois => {
      if (mois.joursPresence && Array.isArray(mois.joursPresence)) {
        mois.joursPresence.forEach(jour => {
          const date = new Date(mois.annee, (typeof mois.mois === 'string' ? parseInt(mois.mois) : mois.mois) - 1, jour.jour);
          
          if (isDateInStagePeriod(date) && !isWeekend(jour.jourSemaine)) {
            if (jour.estPresent !== undefined || jour.commentaire) {
              totalJours++;
              if (jour.estPresent) {
                joursPresent++;
              } else if (jour.commentaire) {
                joursAbsent++;
              }
            }
          }
        });
      }
    });
    
    return {
      total: totalJours,
      present: joursPresent,
      absent: joursAbsent,
      tauxPresence: totalJours > 0 ? Math.round((joursPresent / totalJours) * 100) : 0
    };
  };

  const presenceSummary = calculatePresenceSummary();

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="fiches-pointage">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement de la fiche de pointage...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  if (!fiche) {
    return (
      <MembreDirectionLayout defaultActivePage="fiches-pointage">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>Fiche de pointage non trouvée.</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="fiches-pointage">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate('/membredirection/fiches-pointage1')} className="flex items-center text-gray-600 hover:text-green-600 mr-3">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Fiche de Pointage #{fiche.id}</h1>
          </div>
          <button 
            onClick={toggleFicheValidation}
            disabled={validating}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded ${
              fiche.estValide 
                ? "bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100" 
                : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"
            }`}
          >
            {fiche.estValide ? (
              <>
                <X className="h-4 w-4 mr-1.5" />
                <span>{validating ? 'Invalidation...' : 'Invalider la fiche'}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                <span>{validating ? 'Validation...' : 'Valider la fiche'}</span>
              </>
            )}
          </button>
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
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
            <button 
              className="ml-auto text-green-700 hover:text-green-900" 
              onClick={() => setSuccess('')}
              aria-label="Fermer le message de succès"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Informations du Stagiaire</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom et prénom</p>
                <p className="text-base text-gray-900">{fiche.nomPrenomStagiaire}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Type de stage</p>
                <p className="text-base text-gray-900">{getStageType(fiche.natureStage)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Période du stage</p>
                <p className="text-base text-gray-900">{formatDate(fiche.dateDebutStage)} au {formatDate(fiche.dateFinStage)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Structure d'Accueil</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom de la structure</p>
                <p className="text-base text-gray-900">{fiche.structureAccueil}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Encadreur</p>
                <p className="text-base text-gray-900">{fiche.nomQualitePersonneChargeSuivi}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 col-span-1">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Statut de la Fiche</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">État de validation</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1 ${
                  fiche.estValide ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {fiche.estValide ? 'Validée' : 'Non validée'}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Récapitulatif présence</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">Total jours</p>
                    <p className="text-lg font-medium text-gray-800">{presenceSummary.total}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="text-xs text-green-700">Présent</p>
                    <p className="text-lg font-medium text-green-800">{presenceSummary.present}</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-center">
                    <p className="text-xs text-red-700">Absent</p>
                    <p className="text-lg font-medium text-red-800">{presenceSummary.absent}</p>
                  </div>
                </div>
                <div className="mt-2 bg-blue-50 p-2 rounded text-center">
                  <p className="text-xs text-blue-700">Taux de présence</p>
                  <p className="text-lg font-medium text-blue-800">{presenceSummary.tauxPresence}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Détails du Pointage
            </h2>
            
            {pointageMois && pointageMois.length > 0 && (
              <select
                value={moisSelectionne ? `${typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois}-${moisSelectionne.annee}` : ''}
                onChange={handleMoisChange}
                className="text-sm pl-3 pr-8 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {pointageMois.map(mois => {
                  const moisNumber = typeof mois.mois === 'string' ? parseInt(mois.mois) : mois.mois;
                  return (
                    <option key={`${moisNumber}-${mois.annee}`} value={`${moisNumber}-${mois.annee}`}>
                      {getNomMois(moisNumber)} {mois.annee}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          
          <div className="p-5">
            {moisSelectionne && moisSelectionne.joursPresence && moisSelectionne.joursPresence.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour semaine</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moisSelectionne.joursPresence.map((jour) => {
                      const date = new Date(moisSelectionne.annee, (typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois) - 1, jour.jour);
                      const jourSemaineDisplay = getJourSemaineDisplay(jour);
                      const isWeekendDay = isWeekend(jour.jourSemaine);
                      const isOutOfStagePeriod = !isDateInStagePeriod(date);
                      
                      let statusDisplay;
                      let statusClass;
                      let commentaireText;
                      
                      if (isWeekendDay) {
                        statusDisplay = "Weekend";
                        statusClass = "bg-gray-100 text-gray-600";
                        commentaireText = "";
                      } else if (isOutOfStagePeriod) {
                        statusDisplay = "Hors période";
                        statusClass = "bg-gray-100 text-gray-600";
                        commentaireText = "";
                      } else if (jour.estPresent !== undefined || jour.commentaire) {
                        if (jour.estPresent) {
                          statusDisplay = "Présent";
                          statusClass = "bg-green-100 text-green-700";
                          commentaireText = jour.commentaire || "";
                        } else if (jour.commentaire) {
                          statusDisplay = "Absent";
                          statusClass = "bg-red-100 text-red-700";
                          commentaireText = jour.commentaire;
                        } else {
                          statusDisplay = "-";
                          statusClass = "bg-gray-100 text-gray-600";
                          commentaireText = "-";
                        }
                      } else {
                        statusDisplay = "-";
                        statusClass = "bg-gray-100 text-gray-600";
                        commentaireText = "-";
                      }
                      
                      return (
                        <tr key={jour.jour} className={`hover:bg-gray-50 ${(isWeekendDay || isOutOfStagePeriod) ? 'bg-gray-50 text-gray-500' : ''}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{jour.jour}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">{jourSemaineDisplay}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                              {statusDisplay}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {commentaireText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-10 bg-gray-50 rounded-md">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Aucune donnée de pointage disponible pour ce mois.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MembreDirectionLayout>
  );
}