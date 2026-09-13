import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import type { Pond } from '../types';

interface DemoScenarioWalkerProps {
  setActiveTab: (tab: string) => void;
  onSelectPond: (pond: Pond | null) => void;
  onOpenEvidence: (pondId?: string) => void;
  onCloseModals?: () => void;
  ponds: Pond[];
}

export const DemoScenarioWalker: React.FC<DemoScenarioWalkerProps> = ({
  setActiveTab,
  onSelectPond,
  onOpenEvidence,
  onCloseModals,
  ponds
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const steps = [
    {
      title: "Step 1: Dashboard Overview",
      desc: "Observe top KPIs: CO₂ Captured Today (78.4 kg), Monthly (2.31 tonnes), MRV Confidence (91%).",
      action: () => {
        onCloseModals?.();
        setActiveTab('dashboard');
      }
    },
    {
      title: "Step 2: Farm Map & Digital Twin",
      desc: "View 6 cultivation ponds. Notice Pond 04 is highlighted in RED (Critical Anomaly).",
      action: () => {
        onCloseModals?.();
        setActiveTab('farm_map');
      }
    },
    {
      title: "Step 3: Inspect Pond 04",
      desc: "Click Pond 04. Observe 31% biomass decline, elevated pH (9.3), and thermal spike (31.8°C).",
      action: () => {
        onCloseModals?.();
        setActiveTab('farm_map');
        const p04 = ponds.find(p => p.pond_id === 'P04') || ponds[0];
        onSelectPond(p04);
      }
    },
    {
      title: "Step 4: AI Anomaly Diagnosis",
      desc: "Inspect AI Diagnosis card: 'Productivity decline caused by pH + temp stress. Estimated capture loss: 7.3 kg/day'.",
      action: () => {
        onCloseModals?.();
        setActiveTab('farm_map');
        const p04 = ponds.find(p => p.pond_id === 'P04') || ponds[0];
        onSelectPond(p04);
      }
    },
    {
      title: "Step 5: Multi-Source Evidence",
      desc: "Open evidence view. Compare Sensor (1.42 g/L), Image (1.48 g/L), ML (1.44 g/L) cross-source agreement.",
      action: () => {
        onCloseModals?.();
        onOpenEvidence('P04');
      }
    },
    {
      title: "Step 6: MRV Carbon Report",
      desc: "Open report section. Verify 2.31 tonnes CO₂ capture estimate and 91% verification confidence.",
      action: () => {
        onCloseModals?.();
        setActiveTab('reports');
      }
    },
    {
      title: "Step 7: Digital Carbon Passport",
      desc: "Generate polished Digital Carbon Passport report with audit trail checkmarks.",
      action: () => {
        onCloseModals?.();
        setActiveTab('passport');
      }
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-gradient-to-r from-[#6b8e23] to-[#84a948] text-slate-950 font-bold text-xs rounded-full shadow-lg shadow-[#6b8e23]/30 flex items-center space-x-2 hover:scale-105 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>Launch 60-Sec Demo Presentation</span>
      </button>
    );
  }

  const step = steps[currentStep];

  const handleNext = () => {
    const nextIdx = (currentStep + 1) % steps.length;
    setCurrentStep(nextIdx);
    steps[nextIdx].action();
  };

  const handlePrev = () => {
    const prevIdx = (currentStep - 1 + steps.length) % steps.length;
    setCurrentStep(prevIdx);
    steps[prevIdx].action();
  };

  return (
    <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-50 glass-panel-glow rounded-2xl p-4 border border-[#708238]/60 bg-[#0d140b]/90 backdrop-blur-2xl shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#84a948] text-slate-950 flex items-center justify-center font-mono font-bold text-xs">
            {currentStep + 1}/{steps.length}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1">
              <span>{step.title}</span>
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1">{step.desc}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-[#182313] text-slate-300 hover:bg-[#283618] text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleNext}
            className="px-3 py-1.5 bg-[#84a948] hover:bg-[#99b83c] text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
