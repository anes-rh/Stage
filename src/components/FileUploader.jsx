import { useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function FileUploader({ onFileUploaded, onError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Vérifier le type de fichier
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setUploadError('Type de fichier non valide. Utilisez PDF, DOC ou DOCX.');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('Le fichier est trop volumineux. La taille maximale est de 5MB.');
        return;
      }
      
      setFile(selectedFile);
      setUploadError('');
      
      // Upload du fichier immédiatement
      await uploadFile(selectedFile);
    }
  };

  const uploadFile = async (fileToUpload) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const response = await api.post('/DemandeDeStage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploading(false);
      
      // Appeler la fonction de rappel avec le chemin du fichier
      if (onFileUploaded) {
        onFileUploaded(response.data.cheminFichier, fileToUpload);
      }
    } catch (error) {
      setUploading(false);
      const errorMessage = error.response?.data || error.message || "Erreur lors du téléchargement du fichier";
      setUploadError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError('');
    
    // Informer le composant parent que le fichier a été retiré
    if (onFileUploaded) {
      onFileUploaded('', null);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Document de demande <span className="text-red-500">*</span></label>
      
      {uploadError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{uploadError}</p>
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          file 
            ? (uploading ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50') 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {!file ? (
          <div className="cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Cliquez pour télécharger votre document</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX (Max. 5MB)</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-10 w-10 text-green-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button 
                type="button" 
                className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                onClick={removeFile}
                disabled={uploading}
              >
                <X size={16} />
              </button>
            </div>
            
            {uploading && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Téléchargement: {uploadProgress}%</p>
              </div>
            )}
          </div>
        )}
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".pdf,.docx,.doc" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}