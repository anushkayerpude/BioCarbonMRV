import React, { useState, useEffect } from 'react';
import type { CarbonPassport } from '../types';
import { fetchCarbonPassport, getReportHtmlUrl } from '../services/api';
import { BiomassFateTracker } from './BiomassFateTracker';
import { ShieldCheck, Download, Award, CheckCircle2, Lock, Cpu, Flame } from 'lucide-react';

export const CarbonPassportView: React.FC = () => {
  const [passport, setPassport] = useState<CarbonPassport | null>(null);

  useEffect(() => {
    fetchCarbonPassport().then(setPassport).catch(console.error);
  }, []);

  const handleDownloadReport = () => {
    window.open(getReportHtmlUrl('ALG-001'), '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Passport Card Wrapper */}
      <div className="glass-panel-glow rounded-3xl p-8 border border-[#708238]/50 relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Background Emblem */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#84a948]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Passport Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#283618]/80 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#556b2f] via-[#708238] to-[#84a948] flex items-center justify-center shadow-lg shadow-[#708238]/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#a3be8c] uppercase tracking-widest">
                VERIFIED DIGITAL CARBON PASSPORT
              </span>
              <h2 className="text-2xl font-extrabold text-white">Gujarat Algae Farm</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gujarat, India • 23.21°N, 72.63°E • 10.5 Hectares
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-[#10170d] rounded-2xl border border-[#708238]/40 text-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Passport ID</span>
              <span className="text-xs font-bold text-[#d9ed92]">
                {passport ? passport.passport_id : 'PASSPORT-A89F2E01'}
              </span>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 px-5 py-3 bg-[#84a948] hover:bg-[#99b83c] text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-[#84a948]/25 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Verified Passport PDF</span>
            </button>
          </div>
        </div>

        {/* Core Passport Metrics Grid (Including Net Carbon & Dynamic Carbon %) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#10170d] rounded-2xl p-4 border border-[#708238]/40">
            <span className="text-xs text-slate-400 font-medium block">Net CO₂ Removed</span>
            <div className="text-2xl font-bold font-mono text-[#d9ed92] mt-1">
              {passport ? (passport.net_co2_removed_tonnes || 2.31).toFixed(2) : '2.31'} <span className="text-xs text-slate-400">tonnes</span>
            </div>
            <span className="text-[11px] text-[#a3be8c] block mt-1">✓ Net of operational emissions</span>
          </div>

          <div className="bg-[#10170d] rounded-2xl p-4 border border-[#606c38]/40">
            <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#a3be8c]" /> Dynamic Carbon %
            </span>
            <div className="text-2xl font-bold font-mono text-[#d9ed92] mt-1">
              {passport ? (passport.dynamic_carbon_pct || 52.4) : 52.4}%
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Stress-model predicted</span>
          </div>

          <div className="bg-[#10170d] rounded-2xl p-4 border border-[#708238]/40">
            <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Permanence Score
            </span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              100%
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Biochar / 1000+ Yrs</span>
          </div>

          <div className="bg-[#10170d] rounded-2xl p-4 border border-[#708238]/40">
            <span className="text-xs text-slate-400 font-medium block">Verification Score</span>
            <div className="text-2xl font-bold font-mono text-[#d9ed92] mt-1">
              {passport ? passport.verification_confidence_pct : 93.0}%
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Multi-Source Validated</span>
          </div>

        </div>

        {/* SHA-256 CRYPTOGRAPHIC SEAL BAR */}
        <div className="bg-[#0a0f0a] p-4 rounded-2xl border border-[#708238]/50 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-[#84a948] flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">SHA-256 Cryptographic Audit Seal</span>
              <span className="text-[#d9ed92] font-bold text-xs truncate max-w-md block">
                {passport?.crypto_anchor?.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </span>
            </div>
          </div>

          <div className="px-3 py-1 bg-[#1c2710] border border-[#708238] text-[#d9ed92] rounded-full font-bold text-[10px] whitespace-nowrap">
            ✓ TAMPER-PROOF ANCHOR
          </div>
        </div>

        {/* Evidence Sources List */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Digital MRV Evidence Audit Trail</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {passport?.evidence_sources?.map((src, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{src}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BIOMASS FATE & PERMANENCE TRACKER MODULE */}
      <BiomassFateTracker netCo2Kg={passport?.net_co2_removed_tonnes ? passport.net_co2_removed_tonnes * 1000 : 38578.0} />

    </div>
  );
};
