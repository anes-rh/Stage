import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, BookOpen, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeDepotMemoireAPI } from '../../utils/demandeDepotMemoireAPI';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatutColor = (statut) => {
  const statutValue = typeof statut === 'number' ? statut : 
                     (statut === 'EnAttente' ? 0 : 
                      statut === 'Valide' ? 1 : 
                      statut === 'Rejete' ? 2 : 
                      statut === 'Archive' ? 3 : -1);
  
  switch(statutValue) {
    case 0:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 1:
      return 'bg-green-100 text-green-800 border-green-200';
    case 2:
      return 'bg-red-100 text-red-800 border-red-200';
    case 3:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatutIcon = (statut) => {
  const statutValue = typeof statut === 'number' ? statut : 
                     (statut === 'EnAttente' ? 0 : 
                      statut === 'Valide' ? 1 : 
                      statut === 'Rejete' ? 2 : 
                      statut === 'Archive' ? 3 : -1);
  
  switch(statutValue) {
    case 0:
      return <Clock className="h-4 w-4" />;
    case 1:
      return <CheckCircle className="h-4 w-4" />;
    case 2:
      return <XCircle className="h-4 w-4" />;
    case 3:
      return <BookOpen className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
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

export default function DepotMemoire1() {
  const { id } = useParams();
  
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    stagiaireGroup: '',
    etudiants: [],
    themeLines: ['', '', '']
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const demandeData = await demandeDepotMemoireAPI.getDemandeDepotMemoire(id);
        setDemande(demandeData);
        
        if (demandeData.nomPrenomEtudiants) {
          const etudiantsArray = demandeData.nomPrenomEtudiants.split(',').map(e => e.trim());
          
          setFormData({
            stagiaireGroup: demandeData.stagiaireGroup || '',
            etudiants: etudiantsArray,
            themeLines: demandeData.nomTheme ? demandeData.nomTheme.split('\n').slice(0, 3).concat(['', '', '']).slice(0, 3) : ['', '', '']
          });
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(typeof err === 'string' ? err : "Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <MembreDirectionLayout defaultActivePage="demandes-depot-memoire">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </MembreDirectionLayout>
    );
  }

  return (
    <MembreDirectionLayout defaultActivePage="demandes-depot-memoire">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              to="/membredirection/demandes-depot-memoire1"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Retour à la liste
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start shadow-sm animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {demande && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800">Demande de dépôt de mémoire</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Détails de la demande soumise par l'encadreur
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-8 border-b pb-6">
                    <div className="text-lg font-semibold mb-4 text-green-800">Je soussigné(e) Mme/Mr</div>
                    <div className="flex flex-col border-b border-dotted border-gray-400 py-2 bg-gray-50 px-3 rounded-md">
                      <span className="text-gray-900 font-medium">
                        {demande.nomPrenomEncadreur || 'Encadreur non renseigné'}
                      </span>
                      <span className="text-sm text-gray-500">encadreur du mémoire de fin d'études</span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-lg font-semibold mb-4 text-green-800">de l'étudiant(e) en</div>
                    <div className="border-b border-dotted border-gray-400 py-2 mb-4">
                      <div className="w-full bg-gray-50 px-3 py-2 rounded transition-all duration-200 text-gray-700">
                        {formData.stagiaireGroup || 'Formation non renseignée'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-lg font-semibold mb-4 text-green-800">désigné(s) ci-dessous</div>
                    <div className="grid grid-cols-1 gap-3">
                      {formData.etudiants.length > 0 ? formData.etudiants.map((etudiant, index) => (
                        <div key={index} className="flex items-center border-b border-dotted border-gray-400 py-2 bg-gray-50 px-3 rounded-md">
                          <span className="h-6 w-6 flex items-center justify-center bg-green-600 text-white rounded-full text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-gray-700">{etudiant}</span>
                        </div>
                      )) : (
                        <div className="text-gray-500 italic">Aucun étudiant renseigné</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-lg font-semibold mb-4 text-green-800">Ayant pour thème</div>
                    {formData.themeLines.map((ligne, index) => (
                      <div key={index} className="border-b border-dotted border-gray-400 py-2 mt-2">
                        <div className="w-full bg-gray-50 px-3 py-2 rounded transition-all duration-200 text-gray-700">
                          {ligne || `Ligne ${index + 1} du thème`}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-lg font-medium mb-4 bg-green-50 p-4 rounded-lg border border-green-100 text-green-800">
                      Atteste avoir validé le travail effectué et autorisé l'étudiant(e) à déposer son mémoire en vue de programmer sa soutenance
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Informations de la demande</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Numéro de demande</div>
                      <div className="text-gray-900">#{demande.id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Date de demande</div>
                      <div className="text-gray-900">{formatDate(demande.dateDemande)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Encadreur</div>
                      <div className="text-gray-900">{demande.nomPrenomEncadreur}</div>
                    </div>
                  </div>
                  
                  {demande.dateValidation && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Date de validation</div>
                        <div className="text-gray-900">{formatDate(demande.dateValidation)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {demande.dateDebutStage && demande.dateFinStage && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Période de stage</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Du</div>
                        <div className="text-gray-900">{formatDate(demande.dateDebutStage)}</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Au</div>
                        <div className="text-gray-900">{formatDate(demande.dateFinStage)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MembreDirectionLayout>
  );
}