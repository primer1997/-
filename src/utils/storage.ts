import {
  SubCentreConfig,
  ContainerSurveyData,
  PatientRecord,
  TbPatientRecord,
  LeprosyPatientRecord,
  CataractPatientRecord,
  DeathRecord,
} from '../types';
import {
  initialConfig,
  initialSurveyData,
  initialMonthlySurveys,
  initialPatients,
  initialTbPatients,
  initialLeprosyPatients,
  initialCataractPatients,
} from '../data/initialData';

const CONFIG_KEY = 'arogya_sevak_config_v2';
const SURVEY_KEY = 'arogya_sevak_survey_v2';
const MONTHLY_SURVEYS_KEY = 'arogya_sevak_monthly_surveys_v2';
const PATIENTS_KEY = 'arogya_sevak_patients_v2';
const TB_PATIENTS_KEY = 'arogya_sevak_tb_patients_v1';
const LEPROSY_PATIENTS_KEY = 'arogya_sevak_leprosy_patients_v1';
const CATARACT_PATIENTS_KEY = 'arogya_sevak_cataract_patients_v1';
const DEATHS_KEY = 'arogya_sevak_deaths_v1';

export function loadConfig(): SubCentreConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load config from storage', e);
  }
  return initialConfig;
}

export function saveConfig(config: SubCentreConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

export function loadMonthlySurveys(): Record<string, ContainerSurveyData> {
  try {
    const raw = localStorage.getItem(MONTHLY_SURVEYS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialMonthlySurveys, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load monthly surveys from storage', e);
  }
  return { ...initialMonthlySurveys };
}

export function saveMonthlySurveys(map: Record<string, ContainerSurveyData>) {
  try {
    localStorage.setItem(MONTHLY_SURVEYS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save monthly surveys', e);
  }
}

/**
 * Creates dynamic default data for a new month based on previous month's baseline
 */
export function deriveDynamicNextMonthSurvey(prev: ContainerSurveyData): ContainerSurveyData {
  return {
    // Container survey: Insp houses baseline, pos houses starts fresh for new month
    inspHouses: prev.inspHouses,
    posHouses: 0,
    inspCont: prev.inspHouses, // approx 1 container per house initial
    posCont: 0,
    temephosCont: 0,
    emptiedCont: 0,
    guppySites: prev.guppySites,

    // Water testing defaults
    waterBioSent: 2,
    waterBioSentStatus: 'होय',
    waterChemSent: 2,
    waterChemSentStatus: 'होय',
    saltSampleSent: 10,
    saltSampleSentStatus: 'होय',
    tclUsedKg: 15,
    chlorineTests: 30,

    // TB: continuing cases carry forward
    tbTotal: prev.tbTotal,
    tbSuspected: 0,
    tbUnderTreatment: prev.tbUnderTreatment,

    // Leprosy: continuing under treatment carry forward
    leprosySuspected: 0,
    leprosyUnderTreatment: prev.leprosyUnderTreatment,

    // Cataract: remaining suspects carry forward
    cataractSuspected: Math.max(0, prev.cataractSuspected - prev.cataractOperated),
    cataractOperated: 0,

    notes: 'मागील महिन्याच्या आकडेवारीनुसार नवीन महिन्याचे आकडे स्वयंचलित तयार झाले.',
  };
}

export function getSurveyForMonth(monthKey: string, prevMonthKey?: string): ContainerSurveyData {
  const map = loadMonthlySurveys();
  if (map[monthKey]) {
    return map[monthKey];
  }

  // If previous month exists, dynamically derive
  if (prevMonthKey && map[prevMonthKey]) {
    const derived = deriveDynamicNextMonthSurvey(map[prevMonthKey]);
    map[monthKey] = derived;
    saveMonthlySurveys(map);
    return derived;
  }

  // Fallback to initial survey
  return initialSurveyData;
}

export function saveSurveyForMonth(monthKey: string, survey: ContainerSurveyData) {
  const map = loadMonthlySurveys();
  map[monthKey] = survey;
  saveMonthlySurveys(map);
  // Also save active survey key
  saveSurveyData(survey);
}

export function loadSurveyData(): ContainerSurveyData {
  try {
    const raw = localStorage.getItem(SURVEY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load survey from storage', e);
  }
  return initialSurveyData;
}

export function saveSurveyData(survey: ContainerSurveyData) {
  try {
    localStorage.setItem(SURVEY_KEY, JSON.stringify(survey));
  } catch (e) {
    console.error('Failed to save survey', e);
  }
}

export function loadPatients(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load patients from storage', e);
  }
  return initialPatients;
}

export function savePatients(patients: PatientRecord[]) {
  try {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save patients', e);
  }
}

// १. क्षयरुग्ण (TB)
export function loadTbPatients(): TbPatientRecord[] {
  try {
    const raw = localStorage.getItem(TB_PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load TB patients from storage', e);
  }
  return initialTbPatients;
}

export function saveTbPatients(patients: TbPatientRecord[]) {
  try {
    localStorage.setItem(TB_PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save TB patients', e);
  }
}

// २. कुष्ठरुग्ण (Leprosy)
export function loadLeprosyPatients(): LeprosyPatientRecord[] {
  try {
    const raw = localStorage.getItem(LEPROSY_PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load Leprosy patients from storage', e);
  }
  return initialLeprosyPatients;
}

export function saveLeprosyPatients(patients: LeprosyPatientRecord[]) {
  try {
    localStorage.setItem(LEPROSY_PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save Leprosy patients', e);
  }
}

// ३. मोतीबिंदू (Cataract)
export function loadCataractPatients(): CataractPatientRecord[] {
  try {
    const raw = localStorage.getItem(CATARACT_PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load Cataract patients from storage', e);
  }
  return initialCataractPatients;
}

export function saveCataractPatients(patients: CataractPatientRecord[]) {
  try {
    localStorage.setItem(CATARACT_PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save Cataract patients', e);
  }
}

export function loadDeaths(): DeathRecord[] {
  try {
    const raw = localStorage.getItem(DEATHS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load death records from storage', e);
  }
  return [];
}

export function saveDeaths(records: DeathRecord[]) {
  try {
    localStorage.setItem(DEATHS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save death records', e);
  }
}

export function resetAllData() {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(SURVEY_KEY);
  localStorage.removeItem(MONTHLY_SURVEYS_KEY);
  localStorage.removeItem(PATIENTS_KEY);
  localStorage.removeItem(TB_PATIENTS_KEY);
  localStorage.removeItem(LEPROSY_PATIENTS_KEY);
  localStorage.removeItem(CATARACT_PATIENTS_KEY);
  localStorage.removeItem(DEATHS_KEY);
}

