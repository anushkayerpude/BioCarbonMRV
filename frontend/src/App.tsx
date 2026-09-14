import { useState, useEffect } from 'react';
import { BioCarbonNavbar } from './components/BioCarbonNavbar';
import { BioCarbonSidebar } from './components/BioCarbonSidebar';
import { BioCarbonGISMap } from './components/BioCarbonGISMap';
import { BioCarbonCommandCenter } from './components/BioCarbonCommandCenter';
import { BioCarbonBottomKPIs } from './components/BioCarbonBottomKPIs';
import { LandingPage } from './components/LandingPage';
import { FarmMap } from './components/FarmMap';
import { PondDigitalTwin } from './components/PondDigitalTwin';
import { EvidenceModal } from './components/EvidenceModal';
import { RemoteSensingViewer } from './components/RemoteSensingViewer';
import { CarbonPassportView } from './components/CarbonPassportView';
import { ReportGenerator } from './components/ReportGenerator';
import { DemoScenarioWalker } from './components/DemoScenarioWalker';
import { BioCarbonPondFleetGrid } from './components/BioCarbonPondFleetGrid';
import { useTelemetryWebSocket } from './services/websocket';
import type { Pond, CO2Sequestration, VerificationScore, NWDPEnvironmentalContext } from './types';
import { fetchFarmPonds, fetchFarmCarbon, fetchFarmVerification, fetchNWDPContext, triggerSensorTick } from './services/api';
import { CarbonCursor } from './components/CarbonCursor';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [carbonData, setCarbonData] = useState<CO2Sequestration | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationScore | null>(null);
  const [nwdpContext, setNwdpContext] = useState<NWDPEnvironmentalContext | null>(null);

  const [selectedPond, setSelectedPond] = useState<Pond | null>(null);
  const [evidencePondId, setEvidencePondId] = useState<string | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Real-time WebSocket Telemetry Stream Consumer with Auto-Reconnect
  const { status: wsStatus } = useTelemetryWebSocket((frame) => {
    if (frame.nwdp_environmental_context) {
      setNwdpContext(frame.nwdp_environmental_context);
    }
    if (frame.farm_carbon) {
      setCarbonData((prev) => (prev ? { ...prev, ...frame.farm_carbon } : (frame.farm_carbon as CO2Sequestration)));
    }
    if (frame.farm_verification) {
      setVerificationData((prev) => (prev ? { ...prev, ...frame.farm_verification } : (frame.farm_verification as VerificationScore)));
    }
    if (frame.ponds && frame.ponds.length > 0) {
      setPonds((prevPonds) =>
        prevPonds.map((p) => {
          const updated = frame.ponds?.find((up) => up.pond_id === p.pond_id);
          if (!updated) return p;
          return {
            ...p,
            status: updated.status,
            current_biomass: updated.sensor_values?.biomass_density ?? p.current_biomass
          };
        })
      );
    }
  });

  // Initial load & REST polling loop fallback if WebSocket disconnected
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, cData, vData, nData] = await Promise.all([
          fetchFarmPonds(),
          fetchFarmCarbon(),
          fetchFarmVerification(),
          fetchNWDPContext().catch(() => null)
        ]);
        setPonds(pData);
        setCarbonData(cData);
        setVerificationData(vData);
        if (nData) setNwdpContext(nData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    // Only run REST polling if WebSocket is NOT connected (REST fallback)
    const interval = setInterval(async () => {
      if (isSimulating && wsStatus !== 'CONNECTED') {
        await triggerSensorTick();
        loadData();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, wsStatus]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Immediately dismiss any active modal/twin when navigating between tabs
    setSelectedPond(null);
    setIsEvidenceOpen(false);
  };

  const handleOpenEvidence = (pondId?: string, closeTwin = false) => {
    if (pondId) setEvidencePondId(pondId);
    if (closeTwin) setSelectedPond(null);
    setIsEvidenceOpen(true);
  };

  // Universal Escape key safeguard for all active overlays
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEvidenceOpen) {
          setIsEvidenceOpen(false);
        } else if (selectedPond) {
          setSelectedPond(null);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isEvidenceOpen, selectedPond]);

  return (
    <div className={`min-h-screen bg-dark-olive-algae text-slate-100 font-sans overflow-x-hidden ${activeTab !== 'landing' ? 'pb-24' : ''}`}>
      {/* BioCarbon Carbon Atom Custom Cursor */}
      <CarbonCursor />
      
      {/* Top BioCarbonMRV Navbar (hidden on landing page) */}
      {activeTab !== 'landing' && (
        <BioCarbonNavbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          wsStatus={wsStatus}
        />
      )}

      {/* Main Body View */}
      {activeTab === 'landing' ? (
        <LandingPage onEnterPlatform={() => handleTabChange('dashboard')} />
      ) : (
        <div className="flex w-full min-h-[calc(100vh-60px)]">
          
          {/* Left Vertical Sidebar */}
          <BioCarbonSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />

          {/* Main Dashboard Workspace */}
          <main className="flex-1 p-5 lg:p-8 overflow-y-auto min-w-0">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-7 lg:space-y-8 max-w-[1720px] mx-auto">
                
                {/* 1. PRIMARY GIS SATELLITE & BHUVAN MAP (Positioned Above Everything Else & Enlarged) */}
                <div className="w-full">
                  <BioCarbonGISMap
                    ponds={ponds}
                    onSelectPond={setSelectedPond}
                    selectedPondId={selectedPond?.pond_id}
                  />
                </div>

                {/* 2. Top Executive KPI Strip: 4 Minimal Non-Redundant Signals with Generous Spacing */}
                <BioCarbonBottomKPIs
                  carbonData={carbonData}
                  verificationData={verificationData}
                  ponds={ponds}
                  onOpenEvidence={() => handleOpenEvidence()}
                  onSelectPond={setSelectedPond}
                />

                {/* 3. Main Operational Workspace: Raceway Fleet Grid (60%) & Intelligence Center (40%) */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-stretch w-full">
                  
                  {/* Cultivation Fleet Quick-Status Raceway Grid (60% width) */}
                  <div className="w-full lg:w-[60%] flex-[6] min-w-0 flex flex-col">
                    <BioCarbonPondFleetGrid
                      ponds={ponds}
                      onSelectPond={setSelectedPond}
                      selectedPondId={selectedPond?.pond_id}
                    />
                  </div>

                  {/* Right Intelligence & Diagnostics Panel (40% width) */}
                  <div className="w-full lg:w-[40%] flex-[4] min-w-0 flex flex-col">
                    <BioCarbonCommandCenter
                      carbonData={carbonData}
                      verificationData={verificationData}
                      ponds={ponds}
                      nwdpContext={nwdpContext}
                      onOpenEvidence={handleOpenEvidence}
                      onSelectPond={setSelectedPond}
                    />
                  </div>

                </div>

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
          pond={ponds.find((p) => p.pond_id === selectedPond.pond_id) || selectedPond}
          onClose={() => setSelectedPond(null)}
          onOpenEvidence={(pId) => handleOpenEvidence(pId, true)}
        />
      )}

      {/* Cross-Source Evidence Modal */}
      {isEvidenceOpen && (
        <EvidenceModal
          pondId={evidencePondId || undefined}
          onClose={() => setIsEvidenceOpen(false)}
        />
      )}

      {/* Demo Scenario Interactive Walker Bar (hidden on landing page) */}
      {activeTab !== 'landing' && (
        <DemoScenarioWalker
          setActiveTab={handleTabChange}
          onSelectPond={setSelectedPond}
          onOpenEvidence={(pId) => handleOpenEvidence(pId, true)}
          onCloseModals={() => {
            setSelectedPond(null);
            setIsEvidenceOpen(false);
          }}
          ponds={ponds}
        />
      )}

    </div>
  );
}

export default App;
