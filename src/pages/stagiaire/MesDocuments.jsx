// src/pages/stagiaire/MesDocuments.jsx
import { useState } from 'react';
import { FileText, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function MesDocuments() {
  const [activeDocument, setActiveDocument] = useState(null);

  // Documents data
  const documents = [
    {
      id: 1,
      title: "Demande de stage",
      type: "PDF",
      dateSubmitted: "10/04/2025",
      status: "approved",
      fileSize: "420 Ko",
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    {
      id: 2,
      title: "Demande d'accord de stage",
      type: "PDF",
      dateSubmitted: "12/04/2025",
      status: "pending",
      fileSize: "380 Ko",
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    {
      id: 3,
      title: "Convention de stage",
      type: "PDF",
      dateSubmitted: "-",
      status: "notSubmitted",
      fileSize: "520 Ko",
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    {
      id: 4,
      title: "Attestation de stage",
      type: "PDF",
      dateSubmitted: "-",
      status: "notAvailable",
      fileSize: "- Ko",
      icon: <FileText className="h-4 w-4 text-blue-500" />
    }
  ];

  // Get status badge based on document status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
          <CheckCircle className="h-3 w-3 mr-1" /> Approuvé
        </span>;
      case 'pending':
        return <span className="flex items-center px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          <Clock className="h-3 w-3 mr-1" /> En attente
        </span>;
      case 'notSubmitted':
        return <span className="flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
          <AlertTriangle className="h-3 w-3 mr-1" /> Non soumis
        </span>;
      case 'notAvailable':
        return <span className="flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
          <AlertTriangle className="h-3 w-3 mr-1" /> Non disponible
        </span>;
      default:
        return null;
    }
  };

  // Handle document selection
  const handleDocumentClick = (doc) => {
    if (doc.status !== 'notAvailable') {
      setActiveDocument(doc);
    }
  };

  // Document preview component
  const DocumentPreview = ({ document }) => {
    if (!document) return null;

    return (
      <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{document.title}</h3>
          {document.status !== 'notSubmitted' && document.status !== 'notAvailable' && (
            <button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              <Download className="h-3 w-3 mr-1" /> Télécharger
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-md">
          {document.status === 'notSubmitted' ? (
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Ce document n'a pas encore été soumis.</p>
            </div>
          ) : document.status === 'notAvailable' ? (
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Ce document sera disponible après la fin de votre stage.</p>
            </div>
          ) : (
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Aperçu du document {document.title}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{document.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Taille</p>
            <p className="font-medium">{document.fileSize}</p>
          </div>
          <div>
            <p className="text-gray-500">Date de soumission</p>
            <p className="font-medium">{document.dateSubmitted}</p>
          </div>
          <div>
            <p className="text-gray-500">Statut</p>
            <div className="font-medium">{getStatusBadge(document.status)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout defaultActivePage="documents">
      <h1 className="text-2xl font-bold mb-1">Mes Documents</h1>
      <p className="text-sm text-gray-600 mb-6">
        Consultez vos documents de stage et suivez leur statut.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-5 rounded-md shadow-md h-full">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-green-600" />
              Documents de stage
            </h2>
            
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li 
                  key={doc.id} 
                  className={`p-3 rounded-md transition-colors cursor-pointer border ${
                    activeDocument && activeDocument.id === doc.id
                      ? 'bg-green-50 border-green-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${doc.status === 'notAvailable' ? 'opacity-60' : ''}`}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-center">
                    {doc.icon}
                    <span className="ml-2 text-sm font-medium">{doc.title}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      {doc.status !== 'notSubmitted' && doc.status !== 'notAvailable' 
                        ? `Soumis le ${doc.dateSubmitted}` 
                        : doc.status === 'notSubmitted' 
                          ? 'À soumettre' 
                          : 'Disponible après le stage'}
                    </div>
                    <div>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {activeDocument ? (
            <DocumentPreview document={activeDocument} />
          ) : (
            <div className="bg-white p-5 rounded-md shadow-md h-full flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">Sélectionnez un document</h3>
              <p className="text-sm text-gray-500">
                Cliquez sur un document dans la liste pour afficher son aperçu et les détails.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}