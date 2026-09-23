import React, { useEffect, useState } from 'react';
import {
  SubCentreConfig,
  ContainerSurveyData,
  PatientRecord,
  TbPatientRecord,
  LeprosyPatientRecord,
  CataractPatientRecord,
  DeathRecord,
} from './types';
import {
  loadConfig,
  saveConfig,
  loadSurveyData,
  saveSurveyData,
  getSurveyForMonth,
  saveSurveyForMonth,
  loadPatients,
  savePatients,
  loadTbPatients,
  saveTbPatients,
  loadLeprosyPatients,
  saveLeprosyPatients,
  loadCataractPatients,
  saveCataractPatients,
  loadDeaths,
  saveDeaths,
  resetAllData,
} from './utils/storage';
import {
  parseReportingMonth,
  getMonthKey,
  getPreviousMonthInfo,
} from './utils/dateUtils';
import {
  initialConfig,
  initialSurveyData,
  initialPatients,
  initialTbPatients,
  initialLeprosyPatients,
  initialCataractPatients,
} from './data/initialData';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './lib/supabase';
import { SurveyProgramsTab } from './components/SurveyProgramsTab';
import { PatientEntryTab } from './components/PatientEntryTab';
import { ReportsTab } from './components/ReportsTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ClipboardList, Users, FileBarChart, ShieldCheck } from 'lucide-react';

function AuthGate() {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setIsAuthenticated(Boolean(data.session));
        setIsLoadingAuth(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#0f2740] flex items-center justify-center text-white">Loading secure workspace...</div>;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <Workspace />;
}

export default function App() {
  return <AuthGate />;
}

function Workspace() {
  const [config, setConfig] = useState<SubCentreConfig>(() => loadConfig());
  const [survey, setSurvey] = useState<ContainerSurveyData>(() => {
    const loadedConfig = loadConfig();
    const { monthNum, year } = parseReportingMonth(loadedConfig.reportingMonth);
    const currentMonthKey = getMonthKey(monthNum, year);
    const { prevMonthKey } = getPreviousMonthInfo(monthNum, year);
    return getSurveyForMonth(currentMonthKey, prevMonthKey);
  });
  const [patients, setPatients] = useState<PatientRecord[]>(() => loadPatients());
  const [tbPatients, setTbPatients] = useState<TbPatientRecord[]>(() => loadTbPatients());
  const [leprosyPatients, setLeprosyPatients] = useState<LeprosyPatientRecord[]>(() => loadLeprosyPatients());
  const [cataractPatients, setCataractPatients] = useState<CataractPatientRecord[]>(() => loadCataractPatients());
  const [deaths, setDeaths] = useState<DeathRecord[]>(() => loadDeaths());

  const [activeTab, setActiveTab] = useState<'survey' | 'entry' | 'report'>('survey');

  // Config & Survey Sync
  const handleUpdateConfig = (newConfig: SubCentreConfig) => {
    const monthChanged = newConfig.reportingMonth !== config.reportingMonth;
    setConfig(newConfig);
    saveConfig(newConfig);

    if (monthChanged) {
      // Dynamically load or derive the survey for the new month based on previous month
      const { monthNum, year } = parseReportingMonth(newConfig.reportingMonth);
      const currentMonthKey = getMonthKey(monthNum, year);
      const { prevMonthKey } = getPreviousMonthInfo(monthNum, year);
      const newSurvey = getSurveyForMonth(currentMonthKey, prevMonthKey);
      setSurvey(newSurvey);
      saveSurveyData(newSurvey);
    }
  };

  const handleUpdateSurvey = (newSurvey: ContainerSurveyData) => {
    setSurvey(newSurvey);
    const { monthNum, year } = parseReportingMonth(config.reportingMonth);
    const currentMonthKey = getMonthKey(monthNum, year);
    saveSurveyForMonth(currentMonthKey, newSurvey);
  };

  // Waterborne Patients Handlers
  const handleAddPatient = (patient: PatientRecord) => {
    const updated = [patient, ...patients];
    setPatients(updated);
    savePatients(updated);
  };

  const handleUpdatePatient = (patient: PatientRecord) => {
    const updated = patients.map((p) => (p.id === patient.id ? patient : p));
    setPatients(updated);
    savePatients(updated);
  };

  const handleDeletePatient = (id: string) => {
    const updated = patients.filter((p) => p.id !== id);
    setPatients(updated);
    savePatients(updated);
  };

  // TB Linelist Handlers
  const handleAddTbPatient = (patient: TbPatientRecord) => {
    const updated = [patient, ...tbPatients];
    setTbPatients(updated);
    saveTbPatients(updated);
  };

  const handleUpdateTbPatient = (patient: TbPatientRecord) => {
    const updated = tbPatients.map((p) => (p.id === patient.id ? patient : p));
    setTbPatients(updated);
    saveTbPatients(updated);
  };

  const handleDeleteTbPatient = (id: string) => {
    const updated = tbPatients.filter((p) => p.id !== id);
    setTbPatients(updated);
    saveTbPatients(updated);
  };

  // Leprosy Linelist Handlers
  const handleAddLeprosyPatient = (patient: LeprosyPatientRecord) => {
    const updated = [patient, ...leprosyPatients];
    setLeprosyPatients(updated);
    saveLeprosyPatients(updated);
  };

  const handleUpdateLeprosyPatient = (patient: LeprosyPatientRecord) => {
    const updated = leprosyPatients.map((p) => (p.id === patient.id ? patient : p));
    setLeprosyPatients(updated);
    saveLeprosyPatients(updated);
  };

  const handleDeleteLeprosyPatient = (id: string) => {
    const updated = leprosyPatients.filter((p) => p.id !== id);
    setLeprosyPatients(updated);
    saveLeprosyPatients(updated);
  };

  // Cataract Linelist Handlers
  const handleAddCataractPatient = (patient: CataractPatientRecord) => {
    const updated = [patient, ...cataractPatients];
    setCataractPatients(updated);
    saveCataractPatients(updated);
  };

  const handleUpdateCataractPatient = (patient: CataractPatientRecord) => {
    const updated = cataractPatients.map((p) => (p.id === patient.id ? patient : p));
    setCataractPatients(updated);
    saveCataractPatients(updated);
  };

  const handleDeleteCataractPatient = (id: string) => {
    const updated = cataractPatients.filter((p) => p.id !== id);
    setCataractPatients(updated);
    saveCataractPatients(updated);
  };

  const handleAddDeath = (record: DeathRecord) => { const updated = [record, ...deaths]; setDeaths(updated); saveDeaths(updated); };
  const handleUpdateDeath = (record: DeathRecord) => { const updated = deaths.map((item) => item.id === record.id ? record : item); setDeaths(updated); saveDeaths(updated); };
  const handleDeleteDeath = (id: string) => { const updated = deaths.filter((item) => item.id !== id); setDeaths(updated); saveDeaths(updated); };

  const handleResetData = () => {
    resetAllData();
    setConfig(initialConfig);
    setSurvey(initialSurveyData);
    setPatients(initialPatients);
    setTbPatients(initialTbPatients);
    setLeprosyPatients(initialLeprosyPatients);
    setCataractPatients(initialCataractPatients);
    setDeaths([]);
  };

  const totalAllPatients =
    patients.length + tbPatients.length + leprosyPatients.length + cataractPatients.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Mukta',sans-serif] text-slate-900 selection:bg-[#1a4a72] selection:text-white">
      {/* Official Government Header */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4">
        {/* Navigation Tabs (nav-pills nav-fill matching official government system design) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-1.5 mb-4 grid grid-cols-3 gap-1.5 print:hidden">
          <button
            id="tab-survey-btn"
            type="button"
            onClick={() => setActiveTab('survey')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'survey'
                ? 'bg-[#1a4a72] text-white shadow-xs'
                : 'text-[#1a4a72] hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>सर्व्हे व कार्यक्रम</span>
          </button>

          <button
            id="tab-entry-btn"
            type="button"
            onClick={() => setActiveTab('entry')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'entry'
                ? 'bg-[#1a4a72] text-white shadow-xs'
                : 'text-[#1a4a72] hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>रुग्ण नोंदणी व लाईनलिस्ट</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'entry' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {totalAllPatients}
            </span>
          </button>

          <button
            id="tab-report-btn"
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#1a4a72] text-white shadow-xs'
                : 'text-[#1a4a72] hover:bg-slate-100'
            }`}
          >
            <FileBarChart className="w-4 h-4 shrink-0" />
            <span>अहवाल व निर्यात</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="tab-content">
          {activeTab === 'survey' && (
            <div id="tab-survey">
              <SurveyProgramsTab
                survey={survey}
                onUpdateSurvey={handleUpdateSurvey}
              />
            </div>
          )}

          {activeTab === 'entry' && (
            <div id="tab-entry">
              <PatientEntryTab
                patients={patients}
                onAddPatient={handleAddPatient}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
                tbPatients={tbPatients}
                onAddTbPatient={handleAddTbPatient}
                onUpdateTbPatient={handleUpdateTbPatient}
                onDeleteTbPatient={handleDeleteTbPatient}
                leprosyPatients={leprosyPatients}
                onAddLeprosyPatient={handleAddLeprosyPatient}
                onUpdateLeprosyPatient={handleUpdateLeprosyPatient}
                onDeleteLeprosyPatient={handleDeleteLeprosyPatient}
                cataractPatients={cataractPatients}
                onAddCataractPatient={handleAddCataractPatient}
                onUpdateCataractPatient={handleUpdateCataractPatient}
                onDeleteCataractPatient={handleDeleteCataractPatient}
                deaths={deaths}
                onAddDeath={handleAddDeath}
                onUpdateDeath={handleUpdateDeath}
                onDeleteDeath={handleDeleteDeath}
              />
            </div>
          )}

          {activeTab === 'report' && (
            <div id="tab-report">
              <ReportsTab
                config={config}
                survey={survey}
                patients={patients}
                tbPatients={tbPatients}
                leprosyPatients={leprosyPatients}
  cataractPatients={cataractPatients}
  deaths={deaths}
  onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1a4a72]" />
            <span>सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन | राष्ट्रीय आरोग्य अभियान (NHM / NVBDCP / NTEP / NLEP / NPCB)</span>
          </div>
          <div>
            उपकेंद्र: {config.subCentreName} ({config.phcName})
          </div>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
