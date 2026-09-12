import React from 'react';
import { FileText, Printer, ShieldCheck } from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const handlePrintHTML = () => {
    window.open('http://localhost:8000/api/reports/html?farm_id=ALG-001', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="glass-panel rounded-3xl p-8 border border-slate-800">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              <span>Generate Carbon Verification Report</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Digital MRV Verification & Audit Documentation Generator
            </p>
          </div>

          <button
            onClick={handlePrintHTML}
            className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Generate & Open Report</span>
          </button>
        </div>

        {/* Form Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Target Farm</label>
            <input
              type="text"
              disabled
              value="Gujarat Algae Farm (ALG-001)"
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Monitoring Period</label>
            <select className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3">
              <option>September 2026 (30 Days)</option>
              <option>August 2026 (30 Days)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Verification Standard</label>
            <input
              type="text"
              disabled
              value="Digital MRV Multi-Source Standard"
              className="w-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono rounded-xl p-3 font-semibold"
            />
          </div>
        </div>

        {/* Report Preview Outline */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Report Sections Included</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300 font-mono">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">1.0</span>
              <span>Farm Identity & Cultivation Raceway Profile (6 Ponds, 10.5 ha)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">2.0</span>
              <span>Multi-Source Biomass & CO₂ Capture Audit (2.31 Tonnes CO₂ / 1.24 Tonnes Biomass)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">3.0</span>
              <span>Cross-Validation Evidence Matrix (Sensor 94% | Image 89% | ML 92%)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">4.0</span>
              <span>Parametric & IsolationForest Anomaly Audit Log (Pond 04 Thermal Stress)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">5.0</span>
              <span>Verification Confidence Synthesis Score (91.0%)</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
