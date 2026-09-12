import { useState, useEffect } from 'react';
import type { CarbonPassport } from '../types';
import { fetchCarbonPassport } from '../services/api';
import { ShieldCheck, Download, Award, CheckCircle2 } from 'lucide-react';

export const CarbonPassportView: React.FC = () => {
  const [passport, setPassport] = useState<CarbonPassport | null>(null);

  useEffect(() => {
    fetchCarbonPassport().then(setPassport).catch(console.error);
  }, []);

  const handleDownloadReport = () => {
    window.open('http://localhost:8000/api/reports/html?farm_id=ALG-001', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Passport Card Wrapper */}
      <div className="glass-panel-glow rounded-3xl p-8 border border-emerald-500/50 relative overflow-hidden shadow-2xl">
        
        {/* Background Emblem */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Passport Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                DIGITAL CARBON PASSPORT
              </span>
              <h2 className="text-2xl font-extrabold text-white">Gujarat Algae Farm</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gujarat, India • 23.21°N, 72.63°E • 10.5 Hectares
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-slate-900/90 rounded-2xl border border-emerald-500/40 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Passport ID</span>
              <span className="text-xs font-bold text-emerald-400">
                {passport ? passport.passport_id : 'PASSPORT-A89F2E01'}
              </span>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Core Passport Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Estimated CO₂ Captured</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {passport ? passport.estimated_co2_captured_tonnes.toFixed(2) : '2.31'} <span className="text-xs text-slate-400">tonnes</span>
            </div>
            <span className="text-[11px] text-slate-400">Avg 78.4 kg/day</span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Dry Biomass</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {passport ? passport.total_biomass_tonnes.toFixed(2) : '1.24'} <span className="text-xs text-slate-400">tonnes</span>
            </div>
            <span className="text-[11px] text-slate-400">6 Cultivation Ponds</span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Verification Confidence</span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {passport ? passport.verification_confidence_pct : 91.0}%
            </div>
            <span className="text-[11px] text-slate-400">Cross-Source Verified</span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Data Completeness</span>
            <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
              {passport ? passport.data_completeness_pct : 97.0}%
            </div>
            <span className="text-[11px] text-slate-400">{passport ? passport.anomalies_count : 2} Anomalies Logged</span>
          </div>

        </div>

        {/* Evidence Sources List */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Digital MRV Evidence Audit Trail</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {passport?.evidence_sources.map((src, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{src}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
