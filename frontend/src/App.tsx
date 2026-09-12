import { useState, useEffect } from 'react';
import { BioCarbonNavbar } from './components/BioCarbonNavbar';
import { BioCarbonSidebar } from './components/BioCarbonSidebar';
import { BioCarbonGISMap } from './components/BioCarbonGISMap';
import { BioCarbonCommandCenter } from './components/BioCarbonCommandCenter';
import { BioCarbonBottomKPIs } from './components/BioCarbonBottomKPIs';
import { BiomassFateTracker } from './components/BiomassFateTracker';
import { LandingPage } from './components/LandingPage';
import { FarmMap } from './components/FarmMap';
import { PondDigitalTwin } from './components/PondDigitalTwin';
import { EvidenceModal } from './components/EvidenceModal';
import { RemoteSensingViewer } from './components/RemoteSensingViewer';
import { CarbonPassportView } from './components/CarbonPassportView';
import { ReportGenerator } from './components/ReportGenerator';
import { DemoScenarioWalker } from './components/DemoScenarioWalker';

import type { Pond, CO2Sequestration, VerificationScore } from './types';
import { fetchFarmPonds, fetchFarmCarbon, fetchFarmVerification, triggerSensorTick } from './services/api';

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
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans pb-24 overflow-x-hidden">
      
      {/* Top BioCarbonMRV Navbar */}
      <BioCarbonNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />

      {/* Main Body View */}
      {activeTab === 'landing' ? (
        <LandingPage onEnterPlatform={() => setActiveTab('dashboard')} />
      ) : (
        <div className="flex w-full min-h-[calc(100vh-60px)]">
          
          {/* Left Vertical Sidebar */}
          <BioCarbonSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Dashboard Workspace */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-w-0">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Main Upper Grid: Satellite GIS Map + Right Command Center */}
                <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
                  
                  {/* Central GIS Satellite Map */}
                  <div className="flex-1 w-full min-w-0">
                    <BioCarbonGISMap
                      ponds={ponds}
                      onSelectPond={setSelectedPond}
                      selectedPondId={selectedPond?.pond_id}
                    />
                  </div>

                  {/* Right Command Center Panel */}
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <BioCarbonCommandCenter
                      carbonData={carbonData}
                      verificationData={verificationData}
                      ponds={ponds}
                      onOpenEvidence={handleOpenEvidence}
                      onSelectPond={setSelectedPond}
                    />
                  </div>

                </div>

                {/* Bottom Row of 4 KPI Metric Cards */}
                <BioCarbonBottomKPIs
                  carbonData={carbonData}
                  verificationData={verificationData}
                  ponds={ponds}
                  onOpenEvidence={() => handleOpenEvidence()}
                />

                {/* Biomass Fate & Permanence Tracker Module */}
                <BiomassFateTracker netCo2Kg={carbonData?.net_co2_removed_kg || 41097.5} />

              </div>
            )}

            {activeTab === 'farm_map' && (
              <div className="max-w-7xl mx-auto">
                <FarmMap
                  ponds={ponds}
                  onSelectPond={setSelectedPond}
                  selectedPondId={selectedPond?.pond_id}
                />
              </div>
            )}

            {activeTab === 'remote_sensing' && (
              <div className="max-w-7xl mx-auto">
                <RemoteSensingViewer ponds={ponds} />
              </div>
            )}

            {activeTab === 'passport' && (
              <div className="max-w-7xl mx-auto">
                <CarbonPassportView />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="max-w-7xl mx-auto">
                <ReportGenerator />
              </div>
            )}

          </main>
        </div>
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

      {/* Demo Scenario Interactive Walker Bar */}
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
