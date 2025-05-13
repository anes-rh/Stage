import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//stagiaire
import PageAccueil from './pages/stagiaire/PageAccueil';
import Parametres from './pages/stagiaire/Parametres';
import MesDocuments from './pages/stagiaire/MesDocuments';
import SuiviStage from './pages/stagiaire/SuiviStage';
import ListeEvaluations from './pages/stagiaire/ListeEvaluations';
import Evaluations from './pages/stagiaire/Evaluations';
import Memoire from './pages/stagiaire/Memoire';
//admin
import AdminAccueil from './pages/admin/AdminAccueil';
import CreationMembreDirection from './pages/admin/CreationMembreDirection';
import DepartementsDomainesPage from './pages/admin/DepartementsDomainesPage';
import CreationEncadreurs from './pages/admin/CreationEncadreurs';
import CreationChefDepartement from './pages/admin/CreationChefDepartement';
import Adminparameteres from './pages/admin/Adminparameteres';
//membre direction
import AccueilMembreDirection from './pages/membredirection/AccueilMembreDirection';
import CreationStagiaires from './pages/membredirection/CreationStagiaires';
import CreationDemandeStage from './pages/membredirection/CreationDemandeStage';
import DemandesStage from './pages/membredirection/DemandesStage';
import DemandesAccord from './pages/membredirection/DemandesAccord';
import Conventions from './pages/membredirection/Conventions';
import Stages from './pages/membredirection/Stages';

import MembreDirectionParametres from './pages/membredirection/MembreDirectionParametres';
//encadreur
import AccueilEncadreur from './pages/encadreur/AccueilEncadreur';
import EncadreurStagesStagiaires  from './pages/encadreur/EncadreurStagesStagiaires';
import FichePointage from './pages/encadreur/FichePointage';
import ListeFichesPointage from './pages/encadreur/ListeFichesPointage';
import FichesEvaluation from './pages/encadreur/FichesEvaluation';
import ListeFichesEvaluation from './pages/encadreur/ListeFichesEvaluation';
import EncadreurParametres from './pages/encadreur/EncadreurParametres';
//chef de département
import AccueilChefDepartement from './pages/chefdepartement/AccueilChefDepartement';
import DemandesAccord1 from './pages/chefdepartement/DemandesAccord1';
import ChefDepartementParametres from './pages/chefdepartement/ChefDepartementParametres';
//auth
import LoginPage from './pages/auth/LoginPage';
import AuthGuard from './pages/auth/AuthGuard';
import SignUpPage from './pages/auth/SignUpPage';
import SignUpStagiairePage from './pages/auth/SignUpStagiairePage';
import SignUpEncadreurPage from './pages/auth/SignUpEncadreurPage';
import SignUpChefDepartementPage from './pages/auth/SignUpChefDepartementPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
           <Route 
            path="/auth/signup" 
            element={
              <AuthGuard requiredRole="Admin">
                <SignUpPage />
              </AuthGuard>
            } 
          />
          <Route 
          path="/auth/signup-stagiaire" 
          element={
           <AuthGuard requiredRole="MembreDirection">
               <SignUpStagiairePage />
            </AuthGuard>
          } 
         />
         <Route 
         path="/auth/signup-encadreur" 
        element={
          <AuthGuard requiredRole="Admin">
            <SignUpEncadreurPage />
          </AuthGuard>
        } 
        />
        <Route 
         path="/auth/signup-chef-departement" 
        element={
          <AuthGuard requiredRole="Admin">
            <SignUpChefDepartementPage />
          </AuthGuard>
        } 
        />
          
          {/* Admin routes */}
          <Route 
            path="/admin/accueil" 
            element={
              <AuthGuard requiredRole="Admin">
                <AdminAccueil/>
              </AuthGuard>
            } 
          />
          <Route 
            path="/admin/creation-membre" 
            element={
              <AuthGuard requiredRole="Admin">
                <CreationMembreDirection />
              </AuthGuard>
            } 
          />
          <Route 
            path="/admin/creation-encadreurs" 
            element={
              <AuthGuard requiredRole="Admin">
                <CreationEncadreurs />
              </AuthGuard>
          } 
          />
          <Route 
            path="/admin/creation-chefdepartement" 
            element={
              <AuthGuard requiredRole="Admin">
                <CreationChefDepartement/>
              </AuthGuard>
          } 
          />
          <Route 
            path="/admin/departements-domaines" 
            element={
               <AuthGuard requiredRole="Admin">
                 <DepartementsDomainesPage />
               </AuthGuard>
            } 
          />
          <Route 
            path="/admin/parametres" 
            element={
              <AuthGuard requiredRole="Admin">
                <Adminparameteres />
              </AuthGuard>
            } 
          />
          
          {/* Membre Direction routes */}
          <Route 
            path="/membredirection/accueil" 
            element={
              <AuthGuard requiredRole="MembreDirection">
                <AccueilMembreDirection/>
              </AuthGuard>
            } 
          />
           <Route 
            path="/membredirection/creation-demandes-stage" 
            element={
              <AuthGuard requiredRole="MembreDirection">
                <CreationDemandeStage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/membredirection/demandes-stage" 
            element={
              <AuthGuard requiredRole="MembreDirection">
                 <DemandesStage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/membredirection/demandes-accord" 
            element={
              <AuthGuard requiredRole="MembreDirection">
                 <DemandesAccord />
              </AuthGuard>
            } 
          />
          <Route 
  path="/membredirection/conventions" 
  element={
    <AuthGuard requiredRole="MembreDirection">
      <Conventions />
    </AuthGuard>
  } 
/>
         <Route 
           path="/membredirection/creation-stagiaires" 
           element={
               <AuthGuard requiredRole="MembreDirection">
                 <CreationStagiaires/>
               </AuthGuard>
           } 
          />
          <Route 
  path="/membredirection/stages" 
  element={
    <AuthGuard requiredRole="MembreDirection">
      <Stages />
    </AuthGuard>
  } 
/>
          <Route 
            path="/membredirection/parametres" 
            element={
              <AuthGuard requiredRole="MembreDirection">
                <MembreDirectionParametres />
              </AuthGuard>
            } 
          />
          
          {/* Stagiaire routes */}
          <Route 
            path="/stagiaire/accueil" 
            element={
              <AuthGuard requiredRole="Stagiaire">
                <PageAccueil />
              </AuthGuard>
            } 
          />
          <Route 
            path="/stagiaire/parametres" 
            element={
              <AuthGuard requiredRole="Stagiaire">
                <Parametres />
              </AuthGuard>
            } 
          />
          <Route 
            path="/stagiaire/documents" 
            element={
              <AuthGuard requiredRole="Stagiaire">
                <MesDocuments />
              </AuthGuard>
            } 
          />
          <Route 
            path="/stagiaire/suivi" 
            element={
              <AuthGuard requiredRole="Stagiaire">
                <SuiviStage />
              </AuthGuard>
            } 
          />
<Route 
  path="/stagiaire/evaluations" 
  element={
    <AuthGuard requiredRole="Stagiaire">
      <ListeEvaluations />
    </AuthGuard>
  } 
/>
<Route 
  path="/stagiaire/evaluations/:id" 
  element={
    <AuthGuard requiredRole="Stagiaire">
      <Evaluations />
    </AuthGuard>
  } 
/>
          <Route 
            path="/stagiaire/memoire" 
            element={
              <AuthGuard requiredRole="Stagiaire">
                <Memoire />
              </AuthGuard>
            } 
          />

          {/* Encadreur routes */}
          <Route 
            path="/encadreur/accueil" 
            element={
              <AuthGuard requiredRole="Encadreur">
                <AccueilEncadreur />
              </AuthGuard>
            } 
          />
          <Route 
  path="/encadreur/stages-stagiaires" 
  element={
    <AuthGuard requiredRole="Encadreur">
      <EncadreurStagesStagiaires />
    </AuthGuard>
  } 
/>
          <Route 
  path="/encadreur/fiches-pointage" 
  element={ 
    <AuthGuard requiredRole="Encadreur"> 
      <ListeFichesPointage /> 
    </AuthGuard> 
  } 
/>
<Route 
  path="/encadreur/fiche-pointage/:id" 
  element={ 
    <AuthGuard requiredRole="Encadreur"> 
      <FichePointage /> 
    </AuthGuard> 
  } 
/>        
<Route 
  path="/encadreur/fiches-evaluation" 
  element={ 
    <AuthGuard requiredRole="Encadreur"> 
      <ListeFichesEvaluation/> 
    </AuthGuard> 
  } 
/>
<Route 
  path="/encadreur/fiches-evaluation/:id" 
  element={ 
    <AuthGuard requiredRole="Encadreur"> 
      <FichesEvaluation /> 
    </AuthGuard> 
  } 
/>
          <Route 
            path="/encadreur/parametres" 
            element={
              <AuthGuard requiredRole="Encadreur">
                <EncadreurParametres />
              </AuthGuard>
            } 
          />

          <Route 
            path="/chefdepartement/accueil" 
            element={
              <AuthGuard requiredRole="ChefDepartement">
                <AccueilChefDepartement />
              </AuthGuard>
            } 
          />
          <Route 
            path="/chefdepartement/demandes-accord1" 
            element={
              <AuthGuard requiredRole="ChefDepartement">
                 <DemandesAccord1 />
              </AuthGuard>
            } 
          />
          <Route 
            path="/chefdepartement/parametres" 
            element={
              <AuthGuard requiredRole="ChefDepartement">
                <ChefDepartementParametres />
              </AuthGuard>
            } 
          />
          
          {/* Redirect to login if no path matches */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;