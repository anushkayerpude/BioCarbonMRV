import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  ShieldCheck, 
  Cpu, 
  Camera, 
  Brain, 
  ArrowRight, 
  Sparkles, 
  Atom as AtomIcon,
  ChevronDown,
  Microscope,
  Leaf
} from 'lucide-react';
import { CarbonAtomCanvas } from './CarbonAtomCanvas';

// Cinematic slide background assets
const HERO_BG_URL = '/hero_green_algae.jpg';
const SLIDE_MICRO_BG_URL = '/slide_micro_bg.jpg';
const SLIDE_MRV_BG_URL = '/slide_mrv_bg.jpg';
const SLIDE_CTA_BG_URL = '/slide_cta_bg.jpg';
const CARBON_ORB_URL = '/carbon_orb.png';

interface LandingPageProps {
  onEnterPlatform: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Section element refs for targeted parallax tracking
  const heroRef = useRef<HTMLElement | null>(null);
  const slide2Ref = useRef<HTMLElement | null>(null);
  const slide3Ref = useRef<HTMLElement | null>(null);
  const slide4Ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 30, stiffness: 200 });
  const [currentVelocity, setCurrentVelocity] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Parallax for individual slides using container scroll
  const heroBgScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.18]);
  const heroBgY = useTransform(scrollYProgress, [0, 0.35], [0, 80]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.1]);

  const slide2BgScale = useTransform(scrollYProgress, [0.15, 0.55], [1.05, 1.2]);
  const slide2BgY = useTransform(scrollYProgress, [0.15, 0.55], [-60, 60]);

  const slide3BgScale = useTransform(scrollYProgress, [0.45, 0.85], [1.02, 1.16]);
  const slide3BgY = useTransform(scrollYProgress, [0.45, 0.85], [-70, 70]);

  const slide4BgScale = useTransform(scrollYProgress, [0.75, 1], [1, 1.12]);
  const slide4BgY = useTransform(scrollYProgress, [0.75, 1], [-40, 40]);

  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const orbY = useTransform(scrollYProgress, [0.15, 0.6], [60, -50]);

  // Track velocity and scroll progress for canvas physics
  useEffect(() => {
    const unsubVel = smoothVelocity.on('change', (v) => {
      setCurrentVelocity(v * 2000);
    });
    const unsubProg = scrollYProgress.on('change', (p) => {
      setCurrentProgress(p);
    });
    return () => {
      unsubVel();
      unsubProg();
    };
  }, [smoothVelocity, scrollYProgress]);

  // Carbon atom count calculation derived from scroll progress
  const atomsCount = Math.floor(currentProgress * 8.42 * 100) / 100;

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
    <div ref={containerRef} className="relative min-h-screen bg-[#06090a] text-slate-100 overflow-x-hidden selection:bg-[#708238]/30 selection:text-[#d9ed92]">
      
      {/* Interactive Carbon Atom Particle Canvas Engine */}
      <CarbonAtomCanvas
        scrollVelocity={currentVelocity}
        scrollYProgress={currentProgress}
        interactive={true}
      />

      {/* Persistent Floating Carbon Fixation HUD */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-6 left-6 z-30 hidden md:flex items-center space-x-4 px-4 py-2.5 rounded-2xl bg-slate-950/85 border border-[#708238]/45 backdrop-blur-xl shadow-2xl shadow-slate-950/80"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#1c240e]/90 border border-[#708238]/60 text-[#d9ed92]">
          <AtomIcon className="w-5 h-5 animate-spin text-[#a3be8c]" style={{ animationDuration: '8s' }} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-[#a3be8c] font-bold uppercase tracking-wider">
              Carbon Atoms Fixed
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a3be8c] animate-ping" />
          </div>
          <div className="text-sm font-bold font-mono text-white">
            <span>{(1.24 + atomsCount).toFixed(2)}</span>
            <span className="text-xs text-[#d9ed92] ml-1">× 10²⁴ atoms</span>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-800" />
        <div className="text-[11px] font-mono text-slate-400">
          Scroll: <span className="text-[#d9ed92]">{Math.round(currentProgress * 100)}%</span>
        </div>
      </motion.div>

      {/* =========================================================================
          SLIDE 1: HERO (Cinematic Olive Coral Anemone Parallax Background)
         ========================================================================= */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 lg:px-8 pt-16 pb-20 overflow-hidden"
      >
        {/* Cinematic Parallax Background Layer */}
        <motion.div 
          style={{ scale: heroBgScale, y: heroBgY }}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          <img
            src={HERO_BG_URL}
            alt="Olive Green Algae Carbon Matrix"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          {/* Multi-layer cinematic vignette transitions */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-[#06090a]/30 to-[#06090a]/75" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#06090a]/40 to-[#06090a]" />
          <div className="absolute inset-0 bg-[#0e160a]/25 mix-blend-multiply" />
        </motion.div>

        {/* Atmospheric Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#708238]/15 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-[#556b2f]/15 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Hero Content Container */}
        <motion.div 
          style={{ y: heroContentY, opacity: heroOpacity }}
          className="relative z-20 max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Olive Micro-Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#1b250e]/85 border border-[#708238]/60 text-[#d9ed92] text-xs font-mono mb-8 shadow-lg shadow-[#708238]/15 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-[#a3be8c] animate-pulse" />
            <span className="tracking-wide">AI-POWERED DIGITAL MRV • BIOLOGICAL CARBON FIXATION</span>
          </motion.div>

          {/* Clean Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] mb-6 drop-shadow-2xl"
          >
            From Algae Photosynthesis to{' '}
            <span className="bg-gradient-to-r from-[#84a948] via-[#a3be8c] to-[#d9ed92] bg-clip-text text-transparent">
              Verified Carbon Atoms.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-lg sm:text-xl text-slate-200/90 max-w-2xl mb-10 leading-relaxed font-light drop-shadow"
          >
            Continuous multispectral remote sensing and IoT telemetry tracking carbon sequestration at atomic precision.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <button
              onClick={onEnterPlatform}
              className="px-8 py-4 bg-gradient-to-r from-[#6b8e23] via-[#84a948] to-[#99b83c] hover:from-[#556b2f] hover:to-[#84a948] text-slate-950 font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-[#6b8e23]/30 flex items-center space-x-3 group cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Launch Live MRV Platform</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#atomic-carbon-flow"
              className="px-8 py-4 bg-slate-950/75 hover:bg-slate-900 text-[#d9ed92] border border-[#708238]/50 hover:border-[#99b83c] font-semibold text-base rounded-2xl transition-all backdrop-blur-md"
            >
              Explore Atomic Carbon Flow
            </a>
          </motion.div>

          {/* Scroll Motion Prompt */}
          <motion.a
            href="#atomic-carbon-flow"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex flex-col items-center text-xs font-mono text-[#a3be8c] hover:text-[#d9ed92] transition-colors cursor-pointer group"
          >
            <span className="tracking-widest uppercase mb-1">Scroll down to release carbon atoms</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </motion.a>

        </motion.div>

      </section>

      {/* =========================================================================
          SLIDE 2: MOLECULAR FIXATION (Cinematic Microscopic Chloroplast Background)
         ========================================================================= */}
      <section 
        ref={slide2Ref}
        id="atomic-carbon-flow" 
        className="relative py-32 px-4 lg:px-8 max-w-7xl mx-auto z-20 overflow-hidden rounded-[40px] my-12"
      >
        {/* Cinematic Parallax Background Layer for Slide 2 */}
        <motion.div 
          style={{ scale: slide2BgScale, y: slide2BgY }}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          <img
            src={SLIDE_MICRO_BG_URL}
            alt="Microscopic Chloroplast Carbon Fixation"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-110"
          />
          {/* Deep cinematic gradient fades between slides */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-transparent to-[#06090a]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06090a] via-[#06090a]/50 to-[#06090a]" />
          <div className="absolute inset-0 bg-[#0c1409]/35 mix-blend-multiply" />
        </motion.div>

        {/* Ambient Volumetric Glow */}
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#708238]/20 rounded-full blur-[160px] pointer-events-none z-0" />

        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1b250e]/90 border border-[#708238]/60 text-[#d9ed92] text-xs font-mono mb-4 backdrop-blur-md shadow-lg"
            >
              <Microscope className="w-3.5 h-3.5 text-[#a3be8c]" />
              <span>MOLECULAR FIXATION ENGINE</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg"
            >
              Scrolling Down Synthesizes <span className="text-[#a3be8c]">Atoms of Carbon</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-200/90 text-base sm:text-lg leading-relaxed font-light drop-shadow"
            >
              As you scroll down, ambient kinetic energy splits dissolved greenhouse gas molecules, liberating atomic Carbon-12 (&sup1;&sup2;C) to bond into living algae biomass.
            </motion.p>
          </div>

          {/* 3-Part Transformation Grid with the Olive Green Carbon Orb */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Card 1: Atmospheric CO2 Cleavage */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-8 bg-slate-950/80 border border-[#708238]/40 backdrop-blur-2xl shadow-2xl hover:border-[#84a948]/70 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-[#1b250e] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center font-mono font-bold text-sm">
                    01
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    CO₂ → C + O₂
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Atmospheric Inflow</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  Gaseous carbon dioxide is bubbled through raceway ponds, dissolving into carbonate and bicarbonate ions ready for enzymatic capture by RuBisCO.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d140b]/90 border border-[#3c4a20] font-mono text-xs text-[#d9ed92] space-y-1.5 backdrop-blur-md">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reaction:</span>
                  <span className="text-[#d9ed92]">6 CO₂ + 6 H₂O + hν</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product:</span>
                  <span className="text-[#a3be8c]">C₆H₁₂O₆ + 6 O₂</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Interactive Olive Carbon Cell Orb */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl p-8 bg-gradient-to-b from-[#1b250e]/75 to-slate-950/85 border border-[#708238]/60 backdrop-blur-2xl shadow-2xl shadow-[#708238]/15 flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#708238]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Olive Green Cell/Orb Image with 3D Floating & Rotating Animation */}
              <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                {/* Pulsing ring aura */}
                <div className="absolute inset-0 rounded-full bg-[#708238]/25 blur-xl animate-pulse" />
                <div className="absolute -inset-2 rounded-full border border-[#708238]/40 border-dashed animate-spin" style={{ animationDuration: '24s' }} />

                <motion.img
                  src={CARBON_ORB_URL}
                  alt="Living Carbon Cell Matrix"
                  style={{ y: orbY, rotate: orbRotate }}
                  className="w-36 h-36 object-contain filter drop-shadow-[0_0_25px_rgba(163,190,85,0.5)] z-10 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="w-full text-left mt-2">
                <div className="flex items-center space-x-2 text-[#a3be8c] font-bold mb-1">
                  <Leaf className="w-4 h-4" />
                  <h3 className="text-lg font-bold text-white">Living Carbon Cell</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  High-density chlorophyll vesicle storing trapped organic carbon atoms in stable dry biomass matrices.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Quantum Carbon Structure */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl p-8 bg-slate-950/80 border border-[#708238]/40 backdrop-blur-2xl shadow-2xl hover:border-[#84a948]/70 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-[#1b250e] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center font-mono font-bold text-sm">
                    03
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-[#d9ed92]">
                    ¹²C • Valence: 4
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Atomic Carbon Matrix</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  With 4 covalent bonding sites, Carbon-12 forms resilient polymeric chains and bio-char skeletons with hundreds of years of permanence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Atomic Mass</span>
                  <span className="text-[#d9ed92] font-bold">12.011 u</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Electrons</span>
                  <span className="text-[#a3be8c] font-bold">1s² 2s² 2p²</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </section>

      {/* =========================================================================
          SLIDE 3: MULTI-SOURCE PIPELINE (Cinematic Aerial Satellite Raceway Background)
         ========================================================================= */}
      <section 
        ref={slide3Ref}
        className="relative py-32 px-4 lg:px-8 max-w-7xl mx-auto z-20 overflow-hidden rounded-[40px] my-12"
      >
        {/* Cinematic Parallax Background Layer for Slide 3 */}
        <motion.div 
          style={{ scale: slide3BgScale, y: slide3BgY }}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          <img
            src={SLIDE_MRV_BG_URL}
            alt="Satellite Aerial Algae Raceway Ponds"
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-110"
          />
          {/* Subtle dark vignette transitions */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-transparent to-[#06090a]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06090a] via-[#06090a]/50 to-[#06090a]" />
          <div className="absolute inset-0 bg-[#081008]/40 mix-blend-multiply" />
        </motion.div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-[#606c38]/15 rounded-full blur-[170px] pointer-events-none z-0" />

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-xs font-mono font-bold text-[#a3be8c] uppercase tracking-widest block mb-2 drop-shadow">
              CROSS-VALIDATION ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
              Verifying Sequestration From Atoms to Tonnes
            </h2>
            <p className="text-slate-200/90 text-sm sm:text-base mt-3 font-light drop-shadow">
              Merging 3 independent data streams so every carbon credit is scientifically provable and tamper-evident.
            </p>
          </motion.div>

          {/* 4 Architecture Steps with high-contrast glassmorphism */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="bg-slate-950/80 rounded-2xl p-6 border border-[#708238]/30 hover:border-[#708238]/60 transition-all backdrop-blur-xl shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[#1b250e] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center mb-4 font-mono font-bold">
                01
              </div>
              <div className="flex items-center space-x-2 text-[#d9ed92] font-bold mb-2">
                <Cpu className="w-4 h-4" />
                <span>IoT Telemetry</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Continuous live sensors logging pond pH, dissolved oxygen, water temp, and optical density.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="bg-slate-950/80 rounded-2xl p-6 border border-[#708238]/30 hover:border-[#708238]/60 transition-all backdrop-blur-xl shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[#1b250e] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center mb-4 font-mono font-bold">
                02
              </div>
              <div className="flex items-center space-x-2 text-[#d9ed92] font-bold mb-2">
                <Camera className="w-4 h-4" />
                <span>Remote Sensing</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Drone & satellite multispectral imaging generating Normalized Green Index (NGI) proxies.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="bg-slate-950/80 rounded-2xl p-6 border border-[#708238]/30 hover:border-[#708238]/60 transition-all backdrop-blur-xl shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[#1b250e] border border-[#708238]/60 text-[#d9ed92] flex items-center justify-center mb-4 font-mono font-bold">
                03
              </div>
              <div className="flex items-center space-x-2 text-[#d9ed92] font-bold mb-2">
                <Brain className="w-4 h-4" />
                <span>ML Growth Model</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                RandomForest regressors predicting autotrophic growth and flagging biological stress.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={itemVariants} className="rounded-2xl p-6 bg-gradient-to-br from-[#1b250e]/95 to-slate-950/90 border border-[#708238]/70 shadow-2xl shadow-[#708238]/15 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-[#283618] border border-[#84a948] text-[#d9ed92] flex items-center justify-center mb-4 font-mono font-bold">
                04
              </div>
              <div className="flex items-center space-x-2 text-[#d9ed92] font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Carbon Passport</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-light">
                Cryptographically stamped verification score and audit-ready proof for carbon registries.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 4: CALL TO ACTION FOOTER (Cinematic Bioluminescent Horizon Background)
         ========================================================================= */}
      <section 
        ref={slide4Ref}
        className="relative py-32 px-4 lg:px-8 max-w-5xl mx-auto text-center z-20 overflow-hidden rounded-[40px] my-12"
      >
        {/* Cinematic Parallax Background Layer for Slide 4 */}
        <motion.div 
          style={{ scale: slide4BgScale, y: slide4BgY }}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          <img
            src={SLIDE_CTA_BG_URL}
            alt="Bioluminescent Water Horizon and Starry Sky"
            className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-105"
          />
          {/* Smooth blend vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-transparent to-[#06090a]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06090a]/80 via-transparent to-[#06090a]" />
        </motion.div>

        {/* CTA Card Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 rounded-3xl p-10 lg:p-14 bg-gradient-to-b from-[#1b250e]/80 via-slate-950/85 to-[#06090a]/90 border border-[#708238]/50 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
        >
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#708238]/20 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Ready to Audit Live Carbon Removal?
          </h2>
          <p className="text-slate-200/90 text-base max-w-2xl mx-auto mb-10 font-light drop-shadow">
            Access the live digital twin ponds, inspect sensor-to-satellite cross-verification scores, and issue verifiable carbon passports.
          </p>

          <button
            onClick={onEnterPlatform}
            className="px-10 py-4 bg-[#84a948] hover:bg-[#99b83c] text-slate-950 font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-[#6b8e23]/30 inline-flex items-center space-x-3 group cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Launch Live MRV Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono relative z-20">
        BioCarbonMRV Intelligence • Molecular Sequestration & Digital MRV Platform
      </footer>

    </div>
  );
};
