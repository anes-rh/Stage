import { useState, useEffect } from 'react';
import { Upload, FileText, X, Check, User, Search, AlertCircle } from 'lucide-react';
import MembreDirectionLayout from '../../components/layout/MembreDirectionLayout';
import { demandeStageAPI } from '../../utils/demandeStageAPI';
import { stagiaireAPI } from '../../utils/stagiaireAPI';
import { membreDirectionAPI } from '../../utils/membreDirectionAPI';

export default function CreationDemandeStage() {
  const [fichier, setFichier] = useState(null);
  const [stagiaireIds, setStagiaireIds] = useState([]);
  const [stagiairesDropdownOpen, setStagiairesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stagiaires, setStagiaires] = useState([]);
  const [stagiaireSelectionnes, setStagiaireSelectionnes] = useState([]);
  const [currentMembreDirection, setCurrentMembreDirection] = useState(null);
  const [formData, setFormData] = useState({
    cheminFichier: 'chemin_temporaire_sans_upload.pdf',
    stagiaireIds: [],
    membreDirectionId: null,
    dateDemande: new Date().toISOString()
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stagiaireData = await stagiaireAPI.getAllStagiaires();
        const stagiairesFiltres = stagiaireData.filter(stagiaire => stagiaire.estActif);
        setStagiaires(stagiairesFiltres);
        const membreData = await membreDirectionAPI.getCurrentUser();
        setCurrentMembreDirection(membreData);
        setFormData(prev => ({ ...prev, membreDirectionId: membreData.id }));
      } catch (err) {
        setError("Erreur lors du chargement des données: " + err.toString());
      }
    };
    loadInitialData();
  }, []);

  const filteredStagiaires = stagiaires.filter(stagiaire => {
    const fullName = `${stagiaire.nom} ${stagiaire.prenom}`.toLowerCase();
    const email = stagiaire.email ? stagiaire.email.toLowerCase() : '';
    const query = searchQuery.toLowerCase().trim();
    return !stagiaireSelectionnes.some(s => s.id === stagiaire.id) && 
           (fullName.includes(query) || email.includes(query));
  });

  const ajouterStagiaire = (stagiaire) => {
    if (!stagiaireSelectionnes.some(s => s.id === stagiaire.id)) {
      setStagiaireSelectionnes([...stagiaireSelectionnes, stagiaire]);
      const newIds = [...stagiaireIds, stagiaire.id];
      setStagiaireIds(newIds);
      setFormData(prev => ({ ...prev, stagiaireIds: newIds }));
    }
    setStagiairesDropdownOpen(false);
    setSearchQuery('');
  };

  const retirerStagiaire = (id) => {
    setStagiaireSelectionnes(stagiaireSelectionnes.filter(s => s.id !== id));
    const newIds = stagiaireIds.filter(sId => sId !== id);
    setStagiaireIds(newIds);
    setFormData(prev => ({ ...prev, stagiaireIds: newIds }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Format de fichier non supporté. Veuillez utiliser PDF, DOC, DOCX, JPG ou PNG.');
        return;
      }
      if (selectedFile.size > 512000) {
        setError('La taille du fichier dépasse 500KB. Veuillez télécharger un fichier plus petit.');
        return;
      }
      setFichier(selectedFile);
      setError('');
      const fileName = `uploads/${Date.now()}_${selectedFile.name}`;
      setFormData(prev => ({ ...prev, cheminFichier: fileName }));
    }
  };

  const reinitialiserFormulaire = () => {
    setFichier(null);
    setStagiaireSelectionnes([]);
    setStagiaireIds([]);
    setFormData({
      cheminFichier: 'chemin_temporaire_sans_upload.pdf',
      stagiaireIds: [],
      membreDirectionId: currentMembreDirection?.id || null,
      dateDemande: new Date().toISOString()
    });
    setFormSubmitted(false);
    setError('');
  };

  const soumettreFormulaire = async () => {
    if (stagiaireIds.length === 0) {
      setError('Veuillez sélectionner au moins un stagiaire');
      return;
    }
    if (!formData.membreDirectionId) {
      setError('Une erreur est survenue avec votre compte. Veuillez vous reconnecter.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let cheminFichier = formData.cheminFichier;
      if (fichier) {
        cheminFichier = await demandeStageAPI.uploadFile(fichier);
      }
      const donneesAEnvoyer = {
        ...formData,
        cheminFichier: cheminFichier
      };
      await demandeStageAPI.createDemandeStage(donneesAEnvoyer);
      setLoading(false);
      setFormSubmitted(true);
      setTimeout(() => {
        reinitialiserFormulaire();
      }, 5000);
    } catch (err) {
      setLoading(false);
      setError(err.toString());
    }
  };

  const handleClickOutside = () => {
    setStagiairesDropdownOpen(false);
  };

  const formContent = (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Créer une demande de stage</h1>
        <p className="text-gray-600">Remplissez les informations pour soumettre votre demande de stage</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Document de demande <span className="text-gray-500">(optionnel)</span>
          </label>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              fichier 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {!fichier ? (
              <div className="cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Cliquez pour télécharger votre document</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, DOC, JPG, PNG (Max. 500KB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-green-500 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{fichier.name}</p>
                    <p className="text-xs text-gray-500">{(fichier.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                  onClick={() => setFichier(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Stagiaires <span className="text-red-500">*</span></label>
          {stagiaireSelectionnes.length > 0 && (
            <div className="mb-3">
              {stagiaireSelectionnes.map(stagiaire => (
                <div key={stagiaire.id} className="flex items-center justify-between bg-blue-50 p-2 rounded mb-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-2">
                      <User size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stagiaire.nom} {stagiaire.prenom}</p>
                      <p className="text-xs text-gray-600">{stagiaire.email}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
                    onClick={() => retirerStagiaire(stagiaire.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <div
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg p-2 bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => setStagiairesDropdownOpen(!stagiairesDropdownOpen)}
            >
              <div className="flex-1 flex items-center">
                <Search size={16} className="text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Rechercher des stagiaires..."
                  className="w-full border-none focus:outline-none text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStagiairesDropdownOpen(true);
                  }}
                />
              </div>
            </div>
            {stagiairesDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredStagiaires.length > 0 ? (
                  filteredStagiaires.map(stagiaire => (
                    <div
                      key={stagiaire.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => ajouterStagiaire(stagiaire)}
                    >
                      <p className="font-medium">{stagiaire.nom} {stagiaire.prenom}</p>
                      <p className="text-xs text-gray-600">{stagiaire.email}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">
                    {searchQuery ? "Aucun stagiaire trouvé" : "Tous les stagiaires ont été sélectionnés"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Membre de direction</label>
          {currentMembreDirection ? (
            <div className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <User size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{currentMembreDirection.nom} {currentMembreDirection.prenom}</p>
                <p className="text-xs text-gray-600">{currentMembreDirection.fonction || "Membre de direction"}</p>
              </div>
            </div>
          ) : (
            <div className="p-2 border border-gray-200 rounded-lg text-gray-500">
              Chargement des informations...
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={reinitialiserFormulaire}
          >
            Annuler
          </button>
          <button
            type="button"
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading || (stagiaireIds.length === 0 || !formData.membreDirectionId)}
            onClick={soumettreFormulaire}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-r-white border-b-white border-l-white rounded-full animate-spin mr-2"></div>
                Traitement...
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Soumettre la demande
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );

  const successMessage = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Demande créée avec succès !</h2>
      <p className="text-gray-600 mb-6 text-center">
        Votre demande de stage a été soumise avec succès. Vous pouvez suivre son statut dans la section "Demandes de stage".
      </p>
      <button
        type="button"
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        onClick={reinitialiserFormulaire}
      >
        Créer une nouvelle demande
      </button>
    </div>
  );

  return (
    <MembreDirectionLayout defaultActivePage="creation-demandes-stage">
      <div onClick={handleClickOutside}>
        {formSubmitted ? successMessage : formContent}
      </div>
    </MembreDirectionLayout>
  );
}