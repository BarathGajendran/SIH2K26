import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  Satellite,
  Radio,
  Play,
  RotateCcw,
  CheckCircle2,
  X,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoSurveyModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const { parcels, showNotification, refreshData } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const demoSteps = [
    {
      title: 'Connecting to CORS Base Station (TN-CORS-CBTR)',
      desc: 'NTRIP handshake verified on Port 2101. RTCM 3.2 MSM4 differential correction packet stream active.',
      accuracy: '±1.2 m (Autonomous GPS)',
      fix: 'SINGLE',
      progress: 20,
    },
    {
      title: 'Carrier-Phase Ambiguity Resolution',
      desc: 'NavIC (7 sats) + GPS L1/L2 (12 sats) locked. Integer ambiguity resolved.',
      accuracy: '±0.08 m (Float RTK)',
      fix: 'FLOAT',
      progress: 45,
    },
    {
      title: 'RTK FIXED Carrier Lock Established',
      desc: 'Survey-grade precision achieved. HDOP: 0.68, VDOP: 0.88, Base Baseline: 6.4 km.',
      accuracy: '±0.014 m (1.4 cm Fixed)',
      fix: 'FIXED',
      progress: 70,
    },
    {
      title: 'Automated 4-Corner Cadastral Capture',
      desc: 'Captured Boundary Vertices P1 -> P2 -> P3 -> P4 around SF 142/3A.',
      accuracy: '±0.012 m (Fixed)',
      fix: 'FIXED',
      progress: 90,
    },
    {
      title: 'PostGIS ST_Area & ST_Intersection Scan',
      desc: 'Calculated 4.25 Acres (17,199.1 m²). Zero boundary encroachment detected against adjoining parcels.',
      accuracy: '±0.012 m (Certified)',
      fix: 'FIXED',
      progress: 100,
    },
  ];

  const handleStartSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning && currentStep < demoSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 2000);
    } else if (isRunning && currentStep === demoSteps.length - 1) {
      setIsRunning(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showNotification('Automated Field RTK Survey Simulation Completed!', 'success');
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep, showNotification]);

  if (!isOpen) return null;

  const step = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
              INTERACTIVE FIELD SIMULATOR
            </span>
            <span className="text-xs text-slate-400">| 60-Second RTK Field Walkthrough</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">Autonomous GNSS Survey & Verification Demo</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Experience the automated carrier-phase positioning, CORS corrections, and PostGIS verification pipeline.
          </p>
        </div>

        {/* Live Simulation Visual Stage */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-4 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isRunning ? 'bg-emerald-400' : 'bg-slate-500'
                  } opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isRunning ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                ></span>
              </span>
              <span className="font-bold text-emerald-400 text-xs">STAGE {currentStep + 1} OF 5</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              {step.fix} ({step.accuracy})
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-100">{step.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>SIMULATION PIPELINE</span>
              <span>{step.progress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${step.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setCurrentStep(0);
              setIsRunning(false);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleStartSimulation}
            disabled={isRunning}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Simulation Running...' : 'Launch Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};
