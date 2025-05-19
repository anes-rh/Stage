
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, Save, AlertCircle, Check, X, Info, CheckCircle } from 'lucide-react';
import { fichePointageAPI } from '../../utils/fichePointageAPI';
import EncadreurLayout from '../../components/layout/EncadreurLayout';

export default function FichePointage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pointageMois, setPointageMois] = useState([]);
  const [moisSelectionne, setMoisSelectionne] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  const convertDayNameToDayOfWeek = (frenchDayName) => {
    const mapping = { 'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6 };
    return mapping[frenchDayName.toLowerCase()] !== undefined ? mapping[frenchDayName.toLowerCase()] : 0;
  };

  const initializeMonthsForStagePeriod = (ficheData) => {
    if (!ficheData) return [];
    const dateDebut = new Date(ficheData.dateDebutStage);
    const dateFin = new Date(ficheData.dateFinStage);
    const months = [];
    let currentDate = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), 1);
    
    while (currentDate <= dateFin) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const newJours = [];
      
      for (let jour = 1; jour <= daysInMonth; jour++) {
        const date = new Date(year, month - 1, jour);
        const jourSemaine = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        const jourSemaineValue = convertDayNameToDayOfWeek(jourSemaine);
        
        newJours.push({
          jour,
          jourSemaine: jourSemaineValue,
          jourSemaineFr: jourSemaine,
          estPresent: false,
          commentaire: ''
        });
      }
      
      months.push({
        id: 0,
        mois: month,
        annee: year,
        joursPresence: newJours
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  useEffect(() => {
    const fetchFichePointage = async () => {
      try {
        setLoading(true);
        const ficheData = await fichePointageAPI.getFichePointage(id);
        setFiche(ficheData);
        
        const pointageData = await fichePointageAPI.getPointageMois(id);
        
        let preparedPointageMois;
        
        if (pointageData.length === 0) {
          preparedPointageMois = initializeMonthsForStagePeriod(ficheData);
          console.log("Données de pointage initialisées:", preparedPointageMois);
        } else {
          preparedPointageMois = pointageData.map(mois => {
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
          console.log("Données de pointage existantes chargées:", preparedPointageMois);
        }
        
        setPointageMois(preparedPointageMois);
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const currentMonthData = preparedPointageMois.find(
          m => (typeof m.mois === 'string' ? parseInt(m.mois) : m.mois) === currentMonth && m.annee === currentYear
        );
        
        setMoisSelectionne(currentMonthData || (preparedPointageMois.length > 0 ? preparedPointageMois[0] : null));
        setDataInitialized(true);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    if (id && !dataInitialized) {
      fetchFichePointage();
    }
  }, [id, dataInitialized]);

  const getJourSemaineFromNumber = (number) => {
    const jourNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return jourNames[number] || 'lundi';
  };

  const handleJourChange = (jour, field, value) => {
    if (!moisSelectionne || fiche.estValide) return;
    
    const updatedPointageMois = pointageMois.map(mois => {
      if ((typeof mois.mois === 'string' ? parseInt(mois.mois) : mois.mois) === 
          (typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois) && 
          mois.annee === moisSelectionne.annee) {
        const updatedJours = mois.joursPresence.map(j => {
          if (j.jour === jour.jour) return { ...j, [field]: value };
          return j;
        });
        return { ...mois, joursPresence: updatedJours };
      }
      return mois;
    });
    
    setPointageMois(updatedPointageMois);
    
    const updatedSelectedMonth = updatedPointageMois.find(
      m => (typeof m.mois === 'string' ? parseInt(m.mois) : m.mois) === 
          (typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois) && 
          m.annee === moisSelectionne.annee
    );
    setMoisSelectionne(updatedSelectedMonth);
  };

  const getNomMois = (numeroMois) => {
    const noms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return noms[numeroMois - 1] || "Mois inconnu";
  };

  const sauvegarderFiche = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      if (!fiche) {
        setError("Aucune fiche à sauvegarder.");
        return;
      }
      
      const pointageMoisForBackend = JSON.parse(JSON.stringify(pointageMois));
      
      pointageMoisForBackend.forEach(mois => {
        if (mois.joursPresence && Array.isArray(mois.joursPresence)) {
          mois.joursPresence.forEach(jour => {
            if (typeof jour.jourSemaine === 'string') {
              jour.jourSemaine = convertDayNameToDayOfWeek(jour.jourSemaine);
            }
            if (jour.jourSemaineFr) delete jour.jourSemaineFr;
          });
        }
      });
      
      const updateData = {
        nomPrenomStagiaire: fiche.nomPrenomStagiaire,
        structureAccueil: fiche.structureAccueil,
        nomQualitePersonneChargeSuivi: fiche.nomQualitePersonneChargeSuivi,
        dateDebutStage: fiche.dateDebutStage,
        dateFinStage: fiche.dateFinStage,
        natureStage: fiche.natureStage,
        donneesPointage: JSON.stringify(pointageMoisForBackend),
        pointageMois: pointageMoisForBackend
      };
      
      await fichePointageAPI.updateFichePointage(id, updateData);
      setSuccess("La fiche de pointage a été sauvegardée avec succès.");
    } catch (err) {
      setError(typeof err === 'string' ? err : "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
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

  const getJoursDePeriodeStage = (mois) => {
    if (!mois || !mois.joursPresence || !fiche) return [];
    return mois.joursPresence.filter(jour => {
      const date = new Date(mois.annee, (typeof mois.mois === 'string' ? parseInt(mois.mois) : mois.mois) - 1, jour.jour);
      return isDateInStagePeriod(date) && !isWeekend(jour.jourSemaine);
    });
  };

  const getJourSemaineDisplay = (jour) => {
    if (jour.jourSemaineFr) return jour.jourSemaineFr;
    if (typeof jour.jourSemaine === 'number') {
      return getJourSemaineFromNumber(jour.jourSemaine);
    }
    return jour.jourSemaine || 'Jour inconnu';
  };

  const handleMoisChange = (e) => {
    const [mois, annee] = e.target.value.split('-').map(Number);
    const selected = pointageMois.find(m => 
      (typeof m.mois === 'string' ? parseInt(m.mois) : m.mois) === mois && 
      m.annee === annee
    );
    if (selected) setMoisSelectionne(selected);
  };

  if (loading) {
    return (
      <EncadreurLayout defaultActivePage="fichesPointage">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="h-8 w-8 border-3 border-t-green-500 border-gray-200 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement de la fiche...</p>
        </div>
      </EncadreurLayout>
    );
  }

  if (!fiche) {
    return (
      <EncadreurLayout defaultActivePage="fichesPointage">
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">Fiche de pointage non trouvée.</p>
        </div>
      </EncadreurLayout>
    );
  }

  return (
    <EncadreurLayout defaultActivePage="fichesPointage">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-green-600 text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Retour</span>
          </button>
          {!fiche.estValide && (
            <button 
              onClick={sauvegarderFiche}
              disabled={saving}
              className="flex items-center px-3 py-1.5 text-xs font-medium rounded border border-green-600 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          )}
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded flex items-start text-sm">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
            <button className="ml-auto text-red-700 hover:text-red-900" onClick={() => setError('')}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded flex items-start text-sm">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{success}</p>
            <button className="ml-auto text-green-700 hover:text-green-900" onClick={() => setSuccess('')}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {fiche.estValide && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded flex items-start text-sm">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Cette fiche de pointage a été validée. Les modifications ne sont plus possibles.</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800">Fiche de Pointage</h1>
            <p className="text-gray-500 text-sm mt-0.5">Suivi de présence du stagiaire</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200">
            <div>
              <h2 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-green-600" />
                Informations générales
              </h2>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom et prénom</label>
                  <p className="text-sm text-gray-900">{fiche.nomPrenomStagiaire}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Structure d'accueil</label>
                  <p className="text-sm text-gray-900">{fiche.structureAccueil}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Encadreur</label>
                  <p className="text-sm text-gray-900">{fiche.nomQualitePersonneChargeSuivi}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-1.5 text-green-600" />
                Détails du stage
              </h2>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nature du stage</label>
                  <p className="text-sm text-gray-900">
                    {fiche.natureStage === 0 ? "Stage d'imprégnation" : "Stage de fin d'études"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
                  <p className="text-sm text-gray-900">
                    Du {new Date(fiche.dateDebutStage).toLocaleDateString('fr-FR')} au {new Date(fiche.dateFinStage).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-md font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                Suivi des présences
              </h2>
              <div className="flex space-x-2">
                {pointageMois && pointageMois.length > 0 && (
                  <select
                    value={moisSelectionne ? `${typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois}-${moisSelectionne.annee}` : ''}
                    onChange={handleMoisChange}
                    className="text-xs pl-2 pr-6 py-1.5 rounded bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
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
            </div>
            {moisSelectionne && moisSelectionne.joursPresence && moisSelectionne.joursPresence.length > 0 ? (
              <div>
                <div className="mb-3 bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm text-green-800">
                      {getNomMois(typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois)} {moisSelectionne.annee}
                    </h3>
                  </div>
                </div>
                <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour de la semaine</th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Présence</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {moisSelectionne.joursPresence.map((jour) => {
                          const date = new Date(moisSelectionne.annee, (typeof moisSelectionne.mois === 'string' ? parseInt(moisSelectionne.mois) : moisSelectionne.mois) - 1, jour.jour);
                          const jourSemaineDisplay = getJourSemaineDisplay(jour);
                          const isWeekendDay = isWeekend(jour.jourSemaine);
                          const isOutOfStagePeriod = !isDateInStagePeriod(date);
                          const isDisabled = isWeekendDay || isOutOfStagePeriod || fiche.estValide;
                          
                          return (
                            <tr key={jour.jour} className={`hover:bg-gray-50 ${(isWeekendDay || isOutOfStagePeriod) ? 'bg-gray-50 text-gray-400' : ''}`}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{jour.jour}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm capitalize">{jourSemaineDisplay}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-center">
                                {!isWeekendDay && !isOutOfStagePeriod ? (
                                  <input 
                                    type="checkbox" 
                                    checked={jour.estPresent}
                                    onChange={(e) => !fiche.estValide && handleJourChange(jour, 'estPresent', e.target.checked)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 accent-green-500 appearance-none border border-gray-300 rounded checked:bg-transparent checked:border-green-500 relative"
                                    style={{
                                      backgroundImage: jour.estPresent ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='green' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")" : "",
                                      backgroundSize: "100% 100%",
                                      backgroundPosition: "center",
                                      backgroundRepeat: "no-repeat"
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs">{isWeekendDay ? "Weekend" : "Hors stage"}</span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {!isWeekendDay && !isOutOfStagePeriod && (
                                  <input
                                    type="text"
                                    value={jour.commentaire || ''}
                                    onChange={(e) => !fiche.estValide && handleJourChange(jour, 'commentaire', e.target.value)}
                                    disabled={isDisabled}
                                    placeholder="Ajouter un commentaire"
                                    className="w-full text-sm p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Aucun jour disponible pour ce mois.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </EncadreurLayout>
  );
}