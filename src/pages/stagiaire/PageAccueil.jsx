import { useState, useEffect } from 'react';
import { Clock, ClipboardList } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Task from '../../components/common/Task';

export default function PageAccueil() {
  const [progressValue, setProgressValue] = useState(0);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [stagiaire, setStagiaire] = useState(null);
  
  // Get stagiaire user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setStagiaire(userData);
  }, []);
  
  // Animation for progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(20);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // All tasks data
  const allTasks = [
    {
      id: 1,
      title: "Déposer la demande de stage",
      description: "C'est la première étape pour votre stage",
      status: 'completed'
    },
    {
      id: 2,
      title: "Remplir la demande d'accord de stage",
      description: "après l'acceptation de la demande de stage",
      status: 'pending'
    },
    {
      id: 3,
      title: "Déposer la convention signée",
      description: "Récupérer la convention depuis l'université",
      status: 'pending'
    },
    {
      id: 4,
      title: "Suivre votre stage et remplir ces fiches",
      description: "des fiches régulières de suivi d'évolution",
      status: 'pending'
    },
    {
      id: 5,
      title: "Dépôt mémoire",
      description: "Soumettre votre mémoire de stage final",
      status: 'rejected'
    }
  ];
  
  // Initial visible tasks (first 4)
  const initialTasks = allTasks.slice(0, 4);
  
  // Tasks to display based on showAllTasks state
  const displayedTasks = showAllTasks ? allTasks : initialTasks;

  return (
    <DashboardLayout defaultActivePage="accueil">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Tableau de bord stagiaire
          {stagiaire && <span className="ml-2 text-lg font-normal text-gray-500">| Bienvenue, {stagiaire.prenom} {stagiaire.nom}</span>}
        </h1>
        <p className="text-gray-600">Suivez l'avancement de votre stage sur Mobilis Stage</p>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-green-600" />
          Progression du stage
        </h2>
        <div className="relative pt-1">
          <div className="bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${progressValue >= 0 ? 'bg-green-500' : 'bg-gray-300'} mb-0.5`}></div>
              <span>Demande de stage</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${progressValue >= 25 ? 'bg-green-500' : 'bg-gray-300'} mb-0.5`}></div>
              <span>Demande d'accord</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${progressValue >= 50 ? 'bg-green-500' : 'bg-gray-300'} mb-0.5`}></div>
              <span>Convention</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${progressValue >= 75 ? 'bg-green-500' : 'bg-gray-300'} mb-0.5`}></div>
              <span>En stage</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${progressValue >= 100 ? 'bg-green-500' : 'bg-gray-300'} mb-0.5`}></div>
              <span>Clôture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks to Complete - Now expandable with a button */}
      <div className="bg-white p-5 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <ClipboardList className="h-4 w-4 mr-2 text-green-600" />
          TÂCHES À COMPLÉTER
        </h2>
        
        <div className="space-y-3">
          {displayedTasks.map(task => (
            <Task
              key={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
            />
          ))}
        </div>
  
        {/* Button to toggle task visibility */}
        <div className="mt-5 text-center">
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
            onClick={() => setShowAllTasks(!showAllTasks)}
          >
            {showAllTasks ? 'Voir moins de tâches' : 'Voir toutes les tâches'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}