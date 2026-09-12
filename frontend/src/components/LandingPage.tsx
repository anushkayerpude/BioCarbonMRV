import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ShieldCheck, Cpu, Camera, Brain, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';


interface LandingPageProps {
  onEnterPlatform: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform }) => {
  const { scrollYProgress } = useScroll();

  // Scroll transforms for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section with Scroll Parallax */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity, scale: cardScale }}
        className="relative pt-20 pb-16 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10"
      >
        
        {/* Floating Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono mb-8 shadow-lg shadow-emerald-500/10"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AI-POWERED DIGITAL MRV PLATFORM</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6"
        >
          From Algae Growth to{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Verified Carbon Impact.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal"
        >
          Fusing IoT sensor telemetry, drone multispectral imagery, and RandomForest growth models into transparent, explainable carbon sequestration verification.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <button
            onClick={onEnterPlatform}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center space-x-3 group cursor-pointer"
          >
            <span>Launch Digital MRV Platform</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#mrv-pipeline"
            className="px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base rounded-2xl transition-all"
          >
            Explore Data Fusion Model
          </a>
        </motion.div>

        {/* Animated 3D Floating Hero Showcase Card */}
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full max-w-5xl glass-panel-glow rounded-3xl p-6 lg:p-8 border border-emerald-500/40 shadow-2xl text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">GUJARAT ALGAE FARM (ALG-001) • LIVE TELEMETRY</span>
            </div>
            <div className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full text-xs font-mono">
              CONFIDENCE: 91.0%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">CO₂ Captured Today</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">78.4 kg</div>
              <span className="text-[11px] text-slate-400">Fused dry biomass gain</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Monthly Projection</span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">2.31 Tonnes</div>
              <span className="text-[11px] text-slate-400">6 raceway ponds</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">Pond 04 Anomaly Audit</span>
              <div className="text-sm font-bold font-mono text-rose-400 mt-1">Thermal & pH Stress</div>
              <span className="text-[11px] text-slate-400">-31% biomass shift flagged</span>
            </div>
          </div>
        </motion.div>

      </motion.section>

      {/* Stats Counter Bar (Scroll Revealed) */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-emerald-400">3</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Independent Data Sources</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sensors + Remote Sensing + ML</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-cyan-300">91.0%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Verification Confidence</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cross-source agreement score</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-teal-300">2.31 t</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Monthly CO₂ Captured</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Estimated dry biomass fixation</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <div className="text-3xl lg:text-4xl font-extrabold font-mono text-purple-400">2 Layer</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Anomaly Detection</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Parametric rules + IsolationForest</div>
          </motion.div>

        </div>
      </section>

      {/* The Core Problem vs Digital MRV Solution (Scroll Animation) */}
      <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            The Algae Carbon Verification Problem
          </h2>
          <p className="text-slate-300 text-base">
            Algae farms capture massive CO₂ volumes, but single-source claims lack independent verification. Sensor drift and undetected pond stress undermine trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Traditional Problem */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/80 rounded-3xl p-8 border border-rose-900/50 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Traditional Unverified Claims</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Single sensor readings can drift or give false positives</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Pond stress anomalies go undetected until total crash</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Carbon buyers & verifiers receive unvalidated black-box numbers</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Digital MRV Solution */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel-glow rounded-3xl p-8 border border-emerald-500/50 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Digital MRV Solution</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>3-way cross-validation (Sensors + Satellite Imagery + ML)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>2-layer anomaly detection flags stress before productivity loss</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Audit-ready Digital Carbon Passports with confidence scoring</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </section>

      {/* Multi-Source Pipeline Section (Scroll Timeline) */}
      <section id="mrv-pipeline" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            CORE PRODUCT ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            The Multi-Source Data Fusion Pipeline
          </h2>
        </motion.div>

        {/* Timeline Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          
          {/* Step 1 */}
          <motion.div variants={itemVariants} className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center mb-4 font-mono font-bold">
              01
            </div>
            <div className="flex items-center space-x-2 text-cyan-300 font-bold mb-2">
              <Cpu className="w-4 h-4" />
              <span>IoT Telemetry</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous live streaming of pH, water temp, dissolved oxygen, turbidity, and PAR light intensity.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={itemVariants} className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-700 text-teal-400 flex items-center justify-center mb-4 font-mono font-bold">
              02
            </div>
            <div className="flex items-center space-x-2 text-teal-300 font-bold mb-2">
              <Camera className="w-4 h-4" />
              <span>Remote Sensing</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drone/Satellite multi-spectral image processing generating Normalized Green Index (NGI) algae proxies.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={itemVariants} className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700 text-purple-400 flex items-center justify-center mb-4 font-mono font-bold">
              03
            </div>
            <div className="flex items-center space-x-2 text-purple-300 font-bold mb-2">
              <Brain className="w-4 h-4" />
              <span>ML Growth Model</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              RandomForestRegressor predicting autotrophic growth rates and next-day biomass density.
            </p>
          </motion.div>

          {/* Step 4 */}
          <motion.div variants={itemVariants} className="glass-panel-glow rounded-2xl p-6 border border-emerald-500/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mb-4 font-mono font-bold">
              04
            </div>
            <div className="flex items-center space-x-2 text-emerald-300 font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Carbon Passport</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cross-source agreement calculation yielding an audit-backed confidence score and printable verification report.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-4 lg:px-8 max-w-5xl mx-auto text-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel-glow rounded-3xl p-10 lg:p-14 border border-emerald-500/50 shadow-2xl relative overflow-hidden"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Build Trust in Algae-Based Carbon Removal
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8">
            Experience real-time pond digital twins, interactive multi-source evidence inspection, and automated carbon passport generation.
          </p>

          <button
            onClick={onEnterPlatform}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/30 inline-flex items-center space-x-3 group cursor-pointer"
          >
            <span>Launch Live MRV Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
        Algae Carbon Intelligence • AI-Powered Digital MRV Platform
      </footer>

    </div>
  );
};
