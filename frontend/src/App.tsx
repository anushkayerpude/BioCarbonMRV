import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { KPICards } from './components/KPICards';
import { FarmMap } from './components/FarmMap';
import { PondDigitalTwin } from './components/PondDigitalTwin';
import { EvidenceModal } from './components/EvidenceModal';
import { RemoteSensingViewer } from './components/RemoteSensingViewer';
import { CarbonPassportView } from './components/CarbonPassportView';
import { ReportGenerator } from './components/ReportGenerator';
import { DemoScenarioWalker } from './components/DemoScenarioWalker';

import type { Pond, CO2Sequestration, VerificationScore } from './types';
import { fetchFarmPonds, fetchFarmCarbon, fetchFarmVerification, triggerSensorTick } from './services/api';
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [carbonData, setCarbonData] = useState<CO2Sequestration | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationScore | null>(null);

  const [selectedPond, setSelectedPond] = useState<Pond | null>(null);
  const [evidencePondId, setEvidencePondId] = useState<string | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Initial load & 4-second live simulation polling loop
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, cData, vData] = await Promise.all([
          fetchFarmPonds(),
          fetchFarmCarbon(),
          fetchFarmVerification()
        ]);
        setPonds(pData);
        setCarbonData(cData);
        setVerificationData(vData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    const interval = setInterval(async () => {
      if (isSimulating) {
        await triggerSensorTick();
        loadData();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleOpenEvidence = (pondId?: string) => {
    if (pondId) setEvidencePondId(pondId);
    setIsEvidenceOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-24">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />

      {/* Main Content Area */}
      {activeTab === 'landing' ? (
        <LandingPage onEnterPlatform={() => setActiveTab('dashboard')} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
          
          {activeTab === 'dashboard' && (
            <div>
              {/* Top KPI Metric Cards */}
              <KPICards
                carbonData={carbonData}
                verificationData={verificationData}
                ponds={ponds}
                onOpenEvidence={() => handleOpenEvidence()}
              />

              {/* Farm Layout & Digital Twin Schematic */}
              <FarmMap
                ponds={ponds}
                onSelectPond={setSelectedPond}
                selectedPondId={selectedPond?.pond_id}
              />

              {/* Live Alerts & System Intelligence Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Alert Center */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Anomaly Alert Center</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="bg-rose-950/60 border border-rose-600/70 p-3.5 rounded-xl flex items-start space-x-3">
                      <span className="text-rose-400 font-bold text-lg">🚨</span>
                      <div>
                        <h4 className="text-xs font-bold text-rose-300 font-mono">POND 04 CRITICAL ANOMALY</h4>
                        <p className="text-xs text-rose-200/90 mt-0.5">Biomass density collapsed 31%. Thermal spike (31.8°C) & pH elevated to 9.3.</p>
                        <button
                          onClick={() => {
                            const p04 = ponds.find(p => p.pond_id === 'P04') || null;
                            setSelectedPond(p04);
                          }}
                          className="mt-2 text-[11px] font-bold text-rose-300 hover:text-rose-100 underline font-mono"
                        >
                          Inspect Pond 04 Digital Twin ➔
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-950/60 border border-amber-600/70 p-3.5 rounded-xl flex items-start space-x-3">
                      <span className="text-amber-400 font-bold text-lg">⚠️</span>
                      <div>
                        <h4 className="text-xs font-bold text-amber-300 font-mono">POND 06 WARNING</h4>
                        <p className="text-xs text-amber-200/90 mt-0.5">pH approaching upper limit (8.85). Temperature 30.6°C.</p>
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-300 font-mono">POND 01 & 02 HEALTHY</h4>
                        <p className="text-xs text-slate-300 mt-0.5">Growth rate increased 14.2%. Photosynthetic efficiency optimal.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital MRV Audit Summary */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Digital MRV Multi-Source Audit Principle</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Do not simply report claimed CO₂ capture. We fuse 3 independent data streams (IoT Sensors + Remote Sensing + ML models) to cross-validate every claim.
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-4">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Sensor Agmt</span>
                        <span className="text-emerald-400 font-bold">{verificationData?.sensor_agreement_pct || 94}%</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Image Agmt</span>
                        <span className="text-teal-400 font-bold">{verificationData?.image_agreement_pct || 89}%</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">ML Conf</span>
                        <span className="text-cyan-400 font-bold">{verificationData?.ml_confidence_pct || 92}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEvidence()}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>Open Full Cross-Source Evidence Inspection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'farm_map' && (
            <FarmMap
              ponds={ponds}
              onSelectPond={setSelectedPond}
              selectedPondId={selectedPond?.pond_id}
            />
          )}

          {activeTab === 'remote_sensing' && (
            <RemoteSensingViewer ponds={ponds} />
          )}

          {activeTab === 'passport' && (
            <CarbonPassportView />
          )}

          {activeTab === 'reports' && (
            <ReportGenerator />
          )}

        </main>
      )}

      {/* Pond Digital Twin Modal */}
      {selectedPond && (
        <PondDigitalTwin
          pond={selectedPond}
          onClose={() => setSelectedPond(null)}
          onOpenEvidence={(pId) => handleOpenEvidence(pId)}
        />
      )}

      {/* Cross-Source Evidence Modal */}
      {isEvidenceOpen && (
        <EvidenceModal
          pondId={evidencePondId || undefined}
          onClose={() => setIsEvidenceOpen(false)}
        />
      )}

      {/* 60-Second Demo Scenario Interactive Walker Bar */}
      <DemoScenarioWalker
        setActiveTab={setActiveTab}
        onSelectPond={setSelectedPond}
        onOpenEvidence={handleOpenEvidence}
        ponds={ponds}
      />

    </div>
  );
}

export default App;
