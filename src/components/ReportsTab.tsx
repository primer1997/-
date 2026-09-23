import React, { useState } from 'react';
import {
  SubCentreConfig,
  ContainerSurveyData,
  PatientRecord,
  TbPatientRecord,
  LeprosyPatientRecord,
  CataractPatientRecord,
  DeathRecord,
} from '../types';
import { calculateIndices, exportToExcel, exportToPDF, generateWhatsAppSummary } from '../utils/exportUtils';
import { WhatsAppSummaryModal, copyToClipboard } from './WhatsAppSummaryModal';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Share2,
  Check,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Eye,
  CreditCard,
  Hospital,
  Edit3,
} from 'lucide-react';

interface Props {
  config: SubCentreConfig;
  survey: ContainerSurveyData;
  patients: PatientRecord[];
  tbPatients?: TbPatientRecord[];
  leprosyPatients?: LeprosyPatientRecord[];
  cataractPatients?: CataractPatientRecord[];
  deaths?: DeathRecord[];
  onNavigateTab?: (tab: 'survey' | 'entry') => void;
}

export const ReportsTab: React.FC<Props> = ({
  config,
  survey,
  patients,
  tbPatients = [],
  leprosyPatients = [],
  cataractPatients = [],
  deaths = [],
  onNavigateTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const indices = calculateIndices(survey);

  const totalPatients = patients.length;
  const choleraCount = patients.filter((p) => p.suspectedDisease === 'कॉलरा').length;
  const gastroCount = patients.filter((p) => p.suspectedDisease === 'गॅस्ट्रो').length;
  const diarrheaCount = patients.filter((p) => p.suspectedDisease === 'अतिसार').length;
  const dysenteryCount = patients.filter((p) => p.suspectedDisease === 'हगवण').length;
  const encephalitisCount = patients.filter((p) => p.suspectedDisease === 'मेंदुज्वर').length;
  const jointPainCount = patients.filter((p) => p.suspectedDisease === 'सांधेदुखी').length;
  const tclDoneCount = patients.filter((p) => p.tclStatus === 'होय').length;

  const currentSummary = generateWhatsAppSummary(
    config,
    survey,
    patients,
    tbPatients,
  leprosyPatients,
  cataractPatients,
  deaths
  );

  const handleCopyWhatsApp = async () => {
    // 1. Attempt clipboard copy with fallback
    const ok = await copyToClipboard(currentSummary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
    // 2. Always also open the preview modal so user can view, copy manually or click 'Open WhatsApp'
    setShowWhatsAppModal(true);
  };

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPdf(true);
      await exportToPDF(
        config,
        survey,
        patients,
        tbPatients,
        leprosyPatients,
  cataractPatients,
  deaths,
  'printable-report'
      );
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Export Action Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1a4a72]">
            ३. उपकेंद्र मासिक प्रगती अहवाल व निर्यात (Official Reports & Export)
          </h2>
          <p className="text-xs text-slate-500">
            कंटेनर इंडेक्स, पाणी/मीठ चाचणी, TCL, क्षयरुग्ण, कुष्ठरुग्ण व मोतीबिंदू लाईनलिस्ट अहवाल निर्यात करा
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-excel-btn"
            type="button"
            onClick={() => exportToExcel(config, survey, patients, tbPatients, leprosyPatients, cataractPatients, deaths)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors min-w-[130px] justify-center cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel अहवाल (.xlsx)
          </button>

          <button
            id="export-pdf-btn"
            type="button"
            disabled={generatingPdf}
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors min-w-[130px] justify-center cursor-pointer"
          >
            {generatingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                PDF तयार होत आहे...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                PDF अहवाल (.pdf)
              </>
            )}
          </button>

          <button
            id="print-report-btn"
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1a4a72] hover:bg-[#123653] text-white text-xs font-bold rounded-lg shadow-sm transition-colors min-w-[110px] justify-center cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            प्रिंट अहवाल
          </button>

          <button
            id="copy-whatsapp-btn"
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f39c12] hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg shadow-sm transition-colors min-w-[120px] justify-center cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'प्रत झाली!' : 'WhatsApp सारांश'}
          </button>
        </div>
      </div>

      {/* Printable Sheet Frame */}
      <div
        id="printable-report"
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 print:p-0 print:border-none print:shadow-none"
      >
        {/* Government Letterhead Header */}
        <div className="border-b-2 border-[#1a4a72] pb-4 mb-6 text-center relative">
          <div className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">
            {config.stateDepartment}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1a4a72] tracking-tight">
            मासिक उपकेंद्र एकात्मिक आरोग्य प्रगती अहवाल
          </h1>
          <div className="text-sm font-semibold text-[#f39c12] mt-0.5">
            माहे: {config.reportingMonth}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">उपकेंद्र:</span>
              <span className="font-bold text-slate-900">{config.subCentreName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">प्रा. आ. केंद्र:</span>
              <span className="font-bold text-slate-900">{config.phcName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">तालुका / जिल्हा:</span>
              <span className="font-bold text-slate-900">
                {config.taluka}, {config.district}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">आरोग्य सेवक:</span>
              <span className="font-bold text-slate-900">
                {config.workerName} ({config.workerDesignation})
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Container Survey Indices */}
        <div>
          <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#1a4a72] uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#f39c12]" />
              १. डेंग्यू / चिकनगुनिया डास आळी सर्वेक्षण (NVBDCP Indices)
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${indices.riskColor}`}>
                जोखीम: {indices.riskLevel}
              </span>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('survey')}
                  className="print:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#1a4a72] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-[#f39c12]" />
                  एडिट करा
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs text-slate-500">तपासलेली घरे / भांडी</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {survey.inspHouses} <span className="text-xs font-normal text-slate-500">घरे</span>
              </div>
              <div className="text-[10px] text-slate-500">दूषित भांडी: {survey.posCont}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs text-slate-500">हाउस इंडेक्स (HI)</div>
              <div className="text-xl font-black text-slate-900 mt-1">{indices.hi}%</div>
              <div className="text-[10px] text-slate-400">मानक: &lt;१% सुरक्षित</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs text-slate-500">कंटेनर इंडेक्स (CI)</div>
              <div className="text-xl font-black text-slate-900 mt-1">{indices.ci}%</div>
              <div className="text-[10px] text-slate-400">मानक: &lt;२% सुरक्षित</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs text-slate-500">ब्रेटू इंडेक्स (BI)</div>
              <div className="text-xl font-black text-slate-900 mt-1">{indices.bi}</div>
              <div className="text-[10px] text-slate-400">मानक: &lt;५ सुरक्षित</div>
            </div>
          </div>
        </div>

        {/* Section 2: Water Quality, Salt and TCL Testing */}
        <div className="mt-6">
          <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#1a4a72] uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#f39c12]" />
              २. पाणी गुणवत्ता, मीठ नमुने व TCL क्लोरीनेशन तपासणी
            </h3>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('survey')}
                className="print:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#1a4a72] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                <Edit3 className="w-3 h-3 text-[#f39c12]" />
                एडिट करा
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5 border-b">तपासणी घटक (Parameter)</th>
                  <th className="p-2.5 border-b text-center">प्रयोगशाळेस पाठवले की नाही?</th>
                  <th className="p-2.5 border-b text-center">पाठवलेले नमुने संख्या</th>
                  <th className="p-2.5 border-b">सद्यस्थिती / शेरा</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">पाणी जैविक तपासणी (Biological Water)</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {survey.waterBioSentStatus}
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">{survey.waterBioSent} नमुने</td>
                  <td className="p-2.5 text-slate-600">प्रयोगशाळा अहवाल सुरक्षित आला</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">पाणी रासायनिक तपासणी (Chemical Water)</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {survey.waterChemSentStatus}
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">{survey.waterChemSent} नमुने</td>
                  <td className="p-2.5 text-slate-600">पिण्यायोग्य पाणी प्रमाणपत्र प्राप्त</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">मीठ नमुना तपासणी (Salt Iodine Testing)</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {survey.saltSampleSentStatus}
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">{survey.saltSampleSent} नमुने</td>
                  <td className="p-2.5 text-slate-600">आयो��ीनचे प्रमाण मानक �����िकषांप्रमाणे</td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="p-2.5 font-bold text-emerald-950">TCL (टी.सी.एल. पावडर वापर)</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                      नियमित वापर
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-black text-emerald-800">{survey.tclUsedKg} किलो वापर</td>
                  <td className="p-2.5 text-emerald-900 font-medium">
                    ओटी चाचण्या: {survey.chlorineTests} | विहिरी व पाण्याच्या टाक्यांचे क्लोरीनेशन पूर्ण
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: National Health Programs Statistics (TB, Leprosy, Cataract) */}
        <div className="mt-6">
          <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#1a4a72] uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#f39c12]" />
              ३. राष्ट्रीय आरोग्य कार्यक्रम आकडेवारी (TB, कुष्ठरोग व मोतीबिंदू)
            </h3>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('survey')}
                className="print:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#1a4a72] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                <Edit3 className="w-3 h-3 text-[#f39c12]" />
                आकडेवारी एडिट करा
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* TB Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                <span className="font-bold text-xs text-rose-800">१. क्षयरोग (TB - NTEP)</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  {tbPatients.length} लाईनलिस्ट
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">एकूण क्षयरुग्ण संख्या:</span>
                  <span className="font-bold text-slate-900">{survey.tbTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">संशयित क्षयरुग्ण संख्या:</span>
                  <span className="font-bold text-amber-700">{survey.tbSuspected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">उपचाराखालील क्षयरुग्ण:</span>
                  <span className="font-bold text-emerald-700">{survey.tbUnderTreatment}</span>
                </div>
              </div>
            </div>

            {/* Leprosy Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                <span className="font-bold text-xs text-purple-800">२. कुष्ठरोग (Leprosy - NLEP)</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                  {leprosyPatients.length} लाईनलिस्ट
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">संशयित कुष्ठरुग्ण संख्या:</span>
                  <span className="font-bold text-purple-700">{survey.leprosySuspected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">उपचाराखालील कुष्ठरुग्ण:</span>
                  <span className="font-bold text-emerald-700">{survey.leprosyUnderTreatment}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>MDT औषधोपचार:</span>
                  <span className="text-emerald-700 font-semibold">नियमित सुरू</span>
                </div>
              </div>
            </div>

            {/* Cataract Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">

              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                <span className="font-bold text-xs text-amber-800">३. मोतीबिंदू (Cataract - NPCB)</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  {cataractPatients.length} लाईनलिस्ट
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">संशयित मोतीबिंदू संख्या:</span>
                  <span className="font-bold text-amber-700">{survey.cataractSuspected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ऑपरेशन झालेले मोतीबिंदू:</span>
                  <span className="font-bold text-emerald-700">{survey.cataractOperated}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>शस्त्रक्रिया यशस्विता:</span>
                  <span className="text-emerald-700 font-semibold">१००% यशस्वी</span>
                </div>
              </div>
            </div>

            {/* Death Register Card */}
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between border-b border-red-200 pb-1.5 mb-2">
                <span className="font-bold text-xs text-red-800">४. मृत्यू नोंदणी</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">{deaths.length} नोंदी</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-600">एकूण मृत्यू:</span><span className="font-bold text-red-700">{deaths.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">गावातील मृत्यू:</span><span className="font-bold text-slate-900">{deaths.filter((death) => death.place === 'गावात').length}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">गावाबाहेरील मृत्यू:</span><span className="font-bold text-slate-900">{deaths.filter((death) => death.place === 'गावाबाहेर').length}</span></div>
              </div>
            </div>
          </div>

          {deaths.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-red-200">
              <div className="bg-red-50 px-3 py-2 text-xs font-bold text-red-800">मृत्यू नोंदणी लाईनलिस्ट</div>
              <table className="w-full text-xs text-left">
                <thead className="bg-red-100 text-red-900"><tr><th className="p-2">क्र.</th><th className="p-2">मृत्यू दिनांक</th><th className="p-2">नाव / वय</th><th className="p-2">गाव</th><th className="p-2">मृत्यू कोठे झाला</th><th className="p-2">मृत्यूचे कारण</th></tr></thead>
                <tbody>{deaths.map((death, index) => <tr key={death.id} className="border-t border-red-100"><td className="p-2">{index + 1}</td><td className="p-2 whitespace-nowrap">{death.date}</td><td className="p-2">{death.name} / {death.age}</td><td className="p-2">{death.village || '—'}</td><td className="p-2">{death.place}{death.deathPlace ? ` - ${death.deathPlace}` : ''}</td><td className="p-2">{death.cause}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 4: Waterborne Disease Register */}
        <div className="mt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#1a4a72] uppercase tracking-wide">
                ४. जलजन्य व सांधेदुखी रुग्ण सर्वेक्षण नोंदवही (कॉलरा, गॅस्ट्रो, अतिसार, हगवण, मेंदुज्वर, सांधेदुखी)
              </h3>
              <span className="text-xs text-slate-500">
                एकूण रुग्ण: {totalPatients} (कॉलरा: {choleraCount}, गॅस्ट्रो: {gastroCount}, अतिसार: {diarrheaCount}, हगवण: {dysenteryCount}, मेंदुज्वर: {encephalitisCount}, सांधेदुखी: {jointPainCount})
              </span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('entry')}
                className="print:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#1a4a72] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
              >
                <Edit3 className="w-3 h-3 text-[#f39c12]" />
                रुग्ण नो���दवही एडिट करा
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 border-b">नोंदणी क्र.</th>
                  <th className="p-2 border-b">तारीख</th>
                  <th className="p-2 border-b">रुग्ण नाव व वय</th>
                  <th className="p-2 border-b">गाव / वस्ती</th>
                  <th className="p-2 border-b">आजार प्रकार</th>
                  <th className="p-2 border-b text-center">TCL</th>
                  <th className="p-2 border-b">उपचार</th>
                  <th className="p-2 border-b">सद्यस्थिती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                      सध्या या महिन्यात नोंदवलेले जलजन्य रुग्ण नाहीत
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[11px] font-bold text-[#1a4a72]">{p.regNo}</td>
                      <td className="p-2 text-slate-600">{p.date}</td>
                      <td className="p-2 font-medium text-slate-900">
                        {p.name} ({p.age}/{p.gender[0]})
                      </td>
                      <td className="p-2 text-slate-600">{p.village}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.suspectedDisease === 'कॉलरा'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : p.suspectedDisease === 'गॅस्ट्रो'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : p.suspectedDisease === 'अतिसार'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : p.suspectedDisease === 'हगवण'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : p.suspectedDisease === 'मेंदुज्वर'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : p.suspectedDisease === 'सांधेदुखी'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : p.suspectedDisease === 'मलेरिया'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : p.suspectedDisease === 'डेंग्यू'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {p.suspectedDisease}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.tclStatus === 'होय'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.tclStatus || 'नाही'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700 max-w-[150px] truncate">{p.treatment}</td>
                      <td className="p-2 text-slate-700">{p.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Linelist Summaries for TB, Leprosy, Cataract */}
        {(tbPatients.length > 0 || leprosyPatients.length > 0 || cataractPatients.length > 0) && (
          <div className="mt-6">
            <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[#1a4a72] uppercase tracking-wide">
                ५. विशेष लाईनलिस्ट तपशील (TB, कुष्ठरोग व मोतीबिंदू वैयक्तिक नोंदी)
              </h3>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('entry')}
                  className="print:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#1a4a72] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-[#f39c12]" />
                  लाईनलिस्ट एडिट करा
                </button>
              )}
            </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* TB list */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="font-bold text-xs text-rose-800 mb-2 flex items-center justify-between">
                  <span>क्षयरुग्ण (TB) नोंदी</span>
                  <span className="text-[10px] font-mono text-slate-500">{tbPatients.length} रुग्ण</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {tbPatients.map((tb) => (
                    <div key={tb.id} className="p-2 bg-white rounded border border-slate-200">
                      <div className="font-bold text-slate-900">{tb.name} ({tb.age}व)</div>
                      <div className="text-[11px] text-slate-500 font-mono">{tb.regNo} | {tb.village}</div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-rose-700 font-medium">{tb.tbType}</span>
                        <span className="text-emerald-700 font-bold">{tb.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leprosy list */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="font-bold text-xs text-purple-800 mb-2 flex items-center justify-between">
                  <span>कुष्ठरुग्ण नोंदी</span>
                  <span className="text-[10px] font-mono text-slate-500">{leprosyPatients.length} रुग्ण</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {leprosyPatients.map((lep) => (
                    <div key={lep.id} className="p-2 bg-white rounded border border-slate-200">
                      <div className="font-bold text-slate-900">{lep.name} ({lep.age}व)</div>
                      <div className="text-[11px] text-slate-500 font-mono">{lep.regNo} | {lep.village}</div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-purple-700 font-medium">{lep.leprosyType}</span>
                        <span className="text-emerald-700 font-bold">{lep.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cataract list */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="font-bold text-xs text-amber-800 mb-2 flex items-center justify-between">
                  <span>मोतीबिंदू नोंदी</span>
                  <span className="text-[10px] font-mono text-slate-500">{cataractPatients.length} रुग्ण</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {cataractPatients.map((cat) => (
                    <div key={cat.id} className="p-2 bg-white rounded border border-slate-200">
                      <div className="font-bold text-slate-900">{cat.name} ({cat.age}व)</div>
                      <div className="text-[11px] text-slate-500 font-mono">{cat.regNo} | {cat.village}</div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-amber-700 font-medium">{cat.affectedEye}</span>
                        <span className="text-emerald-700 font-bold">{cat.surgeryStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-10 pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left text-xs text-slate-700">
          <div>
            <div className="font-bold text-slate-900">{config.workerName}</div>
            <div className="text-slate-500">{config.workerDesignation}</div>
            <div className="text-slate-500">{config.subCentreName}</div>
          </div>

          <div className="text-center">
            <div className="text-slate-400 italic mb-1">सही व शिक्का</div>
            <div className="font-bold text-slate-900">आरोग्य पर्यवेक्षक</div>
            <div className="text-slate-500">{config.phcName}</div>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-slate-400 italic mb-1">प्रतिस्वाक्षरी</div>
            <div className="font-bold text-slate-900">वैद्यकीय अधिकारी</div>
            <div className="text-slate-500">{config.phcName}</div>
          </div>
        </div>
      </div>

      {/* WhatsApp Summary Preview & Share Modal */}
      <WhatsAppSummaryModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        summaryText={currentSummary}
        reportingMonth={config.reportingMonth}
        subCentreName={config.subCentreName}
      />
    </div>
  );
};
