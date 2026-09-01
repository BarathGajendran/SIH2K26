import React, { useState } from 'react';
import { GLOSSARY_TERMS, UNIT_CONVERSIONS, GlossaryTerm } from '../../data/plainTerms';
import {
  HelpCircle,
  X,
  Search,
  Calculator,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Satellite,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface PlainLanguageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'glossary' | 'calculator' | 'how-it-works' | 'faq';
}

export const PlainLanguageGuideModal: React.FC<PlainLanguageGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'glossary',
}) => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'calculator' | 'how-it-works' | 'faq'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Calculator states
  const [calcValue, setCalcValue] = useState<number>(1);
  const [calcUnit, setCalcUnit] = useState<'acres' | 'hectares' | 'sqM' | 'guntas' | 'cents'>('acres');

  if (!isOpen) return null;

  // Convert input value into all units
  const getConversions = () => {
    let sqM = 0;
    if (calcUnit === 'acres') sqM = calcValue * 4046.8564224;
    else if (calcUnit === 'hectares') sqM = calcValue * 10000;
    else if (calcUnit === 'sqM') sqM = calcValue;
    else if (calcUnit === 'guntas') sqM = calcValue * 101.17141;
    else if (calcUnit === 'cents') sqM = calcValue * 40.46856;

    const acres = sqM / 4046.8564224;
    const hectares = sqM / 10000;
    const guntas = sqM / 101.17141;
    const cents = sqM / 40.46856;
    const sqFt = sqM * 10.7639;

    return {
      sqM: sqM.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      acres: acres.toFixed(3),
      hectares: hectares.toFixed(3),
      guntas: guntas.toFixed(2),
      cents: cents.toFixed(2),
      sqFt: sqFt.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    };
  };

  const conversions = getConversions();

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.hindiName && t.hindiName.includes(searchQuery)) ||
      (t.tamilName && t.tamilName.includes(searchQuery));
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Plain-Language Land & Survey Guide</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700">
                  Easy to Understand
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Understand land surveying, RTK satellite accuracy, Patta records & area calculations in simple terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'glossary'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Survey & Revenue Glossary</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Land Area Unit Converter</span>
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'how-it-works'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>How Resurvey Works</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search terms (e.g. Patta, RTK, Encroachment)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'ALL', label: 'All Terms' },
                    { id: 'SURVEY_TECH', label: 'Satellite & GPS Tech' },
                    { id: 'LAND_REVENUE', label: 'Land Revenue & Patta' },
                    { id: 'LEGAL_DISPUTE', label: 'Disputes & Overlaps' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        selectedCategory === c.id
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTerms.map((term, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{term.term}</h3>
                          {(term.hindiName || term.tamilName) && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {term.tamilName} • {term.hindiName}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {term.category === 'SURVEY_TECH'
                            ? 'GPS Tech'
                            : term.category === 'LAND_REVENUE'
                            ? 'Patta / Land'
                            : 'Dispute'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                        {term.simpleDefinition}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Why it matters: </span>
                        {term.whyItMatters}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg text-slate-600 dark:text-slate-300 italic">
                        💡 <span className="font-medium not-italic">Example: </span>
                        {term.example}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LAND AREA UNIT CONVERTER */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Instant Indian Agricultural Land Area Converter
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Enter any agricultural land size below to automatically convert between Acres, Guntas, Cents, Hectares, and Square Meters.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={calcValue}
                      onChange={(e) => setCalcValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="w-full sm:w-60">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Unit
                    </label>
                    <select
                      value={calcUnit}
                      onChange={(e) => setCalcUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="acres">Acres (ஏக்கர்)</option>
                      <option value="cents">Cents (சென்ட் - 100 per Acre)</option>
                      <option value="guntas">Guntas / Gunthas (குந்தா - 40 per Acre)</option>
                      <option value="hectares">Hectares (ஹெக்டேர் - 2.47 Acres)</option>
                      <option value="sqM">Square Meters (m²)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conversion Result Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Acres</span>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {conversions.acres} <span className="text-xs font-normal text-slate-500">Ac</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Standard agricultural measurement</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Cents (Tamil Nadu / South)</span>
                  <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
                    {conversions.cents} <span className="text-xs font-normal text-slate-500">Cents</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">100 Cents = 1 Full Acre</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Guntas (Karnataka / Maharashtra)</span>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {conversions.guntas} <span className="text-xs font-normal text-slate-500">Guntas</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">40 Guntas = 1 Full Acre</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Square Meters (m²)</span>
                  <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {conversions.sqM} <span className="text-xs font-normal text-slate-500">m²</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Official metric GIS standard</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Hectares (ha)</span>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {conversions.hectares} <span className="text-xs font-normal text-slate-500">ha</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">10,000 Square Meters</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Square Feet (sq ft)</span>
                  <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                    {conversions.sqFt} <span className="text-xs font-normal text-slate-500">sq ft</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">43,560 sq ft in 1 Acre</p>
                </div>
              </div>

              {/* Standard Reference Table */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Quick Reference Standard Equivalents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {UNIT_CONVERSIONS.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.unit}: </span>
                      <span>{item.equals}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW RESURVEY WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  How Satellite Resurvey Solves Boundary Disputes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  From traditional measuring chains to 1.4cm satellite accuracy in 4 transparent government steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Step 1: Request & Patta Record Linking
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    The landowner or Revenue Department enters the Survey Number (e.g. 142/3A). The system pulls existing cadastral maps, FMB sketches, and registered owner records from the Patta database.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 relative">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Step 2: CORS Tower RTK Calibration
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    The certified surveyor turns on the field GNSS rover. The rover locks onto 28+ satellites (Indian NavIC, GPS, GLONASS) and receives real-time correction data from Survey of India CORS towers in 24 milliseconds.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Step 3: Boundary Peg Point Collection
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    The surveyor places the rover pole directly on each physical boundary stone (P1, P2, P3, P4). When RTK status turns green (Fixed, ±1.4cm accuracy), coordinates are permanently locked.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 relative">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Step 4: Spatial Verification & Form IV Seal
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    PostGIS checks for any overlap with neighbors. If clear, the Revenue Officer (RDO) digitally approves the survey, issues Form IV Certificate, and updates the official government land register.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMMON QUESTIONS (FAQ) */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {[
                {
                  q: 'Why is RTK satellite survey better than traditional measuring tape or chain?',
                  a: 'Traditional chains stretch with heat, sag over bushes, and rely on human eye estimates, resulting in 2 to 5 meter errors. RTK satellite surveying uses atomic clocks and satellite triangulation to measure exact boundaries down to 1.4 centimeters.',
                },
                {
                  q: 'What happens if my neighbor’s fence is inside my surveyed boundary?',
                  a: 'The system automatically highlights the overlap in red on the map (ST_Intersection) and calculates the exact area (e.g. 0.12 Acres). The Revenue Officer is notified to review both Patta documents and issue a formal boundary demarcation notice.',
                },
                {
                  q: 'What is a Form IV Resurvey Certificate?',
                  a: 'Form IV is the official government legal certificate issued after a verified satellite resurvey. It contains digital coordinates, total verified acreage, QR verification code, and the digital seal of the Revenue Department.',
                },
                {
                  q: 'Can weather or clouds affect the GNSS survey?',
                  a: 'Satellite radio waves pass through clouds, fog, and light rain. However, the surveyor ensures a minimum of 18 satellites and "RTK FIXED" status before capturing any legal boundary coordinate.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 pl-6 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>GeoNexa Digital Cadastral, Drone & Survey Standards</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
