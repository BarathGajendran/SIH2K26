export interface GlossaryTerm {
  term: string;
  hindiName?: string;
  tamilName?: string;
  simpleDefinition: string;
  whyItMatters: string;
  example: string;
  category: 'SURVEY_TECH' | 'LAND_REVENUE' | 'LEGAL_DISPUTE' | 'UNITS';
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'GNSS / RTK (Real-Time Kinematic)',
    hindiName: 'आर.टी.के. उपग्रह भू-मापन',
    tamilName: 'துல்லிய செயற்கைக்கோள் நில அளவீடு',
    simpleDefinition:
      'High-precision satellite surveying that combines Indian NavIC and GPS satellites with ground correction stations to measure land down to 1.4 centimeters (less than an inch).',
    whyItMatters:
      'Old manual measuring chains have 2 to 5 meter errors, causing disputes. RTK GPS fixes the exact legal peg location unmistakably.',
    example: 'When the surveyor places the rover pole on your boundary peg, RTK verifies the coordinate within 14 millimeters.',
    category: 'SURVEY_TECH',
  },
  {
    term: 'CORS Base Station',
    hindiName: 'सी.ओ.आर.एस. संदर्भ स्टेशन',
    tamilName: 'தொடர் இயக்க குறிப்பு நிலையம்',
    simpleDefinition:
      'A permanent government satellite receiver tower installed by Survey of India that continuously measures atmospheric delays and sends live corrections to field rovers over mobile 4G/5G.',
    whyItMatters: 'Without CORS corrections, regular GPS is off by 3-5 meters. CORS provides the centimeter-level lock in real time.',
    example: 'The Coimbatore Agricultural University CORS tower corrects your field surveyor’s rover in 24 milliseconds.',
    category: 'SURVEY_TECH',
  },
  {
    term: 'Patta / Chitta / 7/12 Extract',
    hindiName: 'पट्टा / खतौनी / सात-बारा',
    tamilName: 'பட்டா / சிட்டா',
    simpleDefinition:
      'The primary government revenue document that legally certifies who owns a plot of agricultural land, its exact survey number, total area in acres, and land classification.',
    whyItMatters: 'It is the ultimate legal proof of agricultural ownership required for bank loans, subsidies, and land sales.',
    example: 'Patta No. 142 lists K. S. Ramasamy Gounder as the registered owner of 1.45 acres in Thondamuthur.',
    category: 'LAND_REVENUE',
  },
  {
    term: 'Survey Number / Khasra No.',
    hindiName: 'खसरा / सर्वे नंबर',
    tamilName: 'புல எண் (சர்வே எண்)',
    simpleDefinition:
      'The unique identification number assigned by the Revenue Department to an individual piece of land in a village, similar to a plot serial number.',
    whyItMatters: 'Every legal boundary, tax assessment, and digital land map is mapped directly to this number.',
    example: 'Survey No. "142/3A" represents Sub-division 3A of main field 142.',
    category: 'LAND_REVENUE',
  },
  {
    term: 'Encroachment (Boundary Overlap)',
    hindiName: 'अतिक्रमण / सीमा विवाद',
    tamilName: 'எல்லை ஆக்கிரமிப்பு',
    simpleDefinition:
      'When an adjacent neighbor, road project, or builder places a fence, wall, tree line, or crop row past their legal boundary onto your property.',
    whyItMatters: 'Our automated PostGIS spatial engine detects even a 10-centimeter encroachment instantly upon resurvey.',
    example: 'SF 142/3B neighbor’s fencing extends 0.12 acres into the northern boundary of SF 142/3A.',
    category: 'LEGAL_DISPUTE',
  },
  {
    term: 'PostGIS ST_Intersection',
    hindiName: 'डिजिटल भू-ज्यामिति गणना',
    tamilName: 'எல்லை அடுக்கு குறுக்கீட்டு கணக்கீடு',
    simpleDefinition:
      'A spatial mathematical algorithm in the digital database that compares the newly surveyed boundaries with old legacy revenue maps to calculate overlapping land area down to the square centimeter.',
    whyItMatters: 'Provides 100% objective, tamper-proof proof of boundary changes for court and revenue officers.',
    example: 'The system computes an overlap polygon of 485.62 square meters between two adjacent survey records.',
    category: 'SURVEY_TECH',
  },
  {
    term: 'Form IV Resurvey Certificate',
    hindiName: 'प्रपत्र-4 पुनर्सर्वेक्षण प्रमाण पत्र',
    tamilName: 'படிவம் IV நில அளவை சான்றிதழ்',
    simpleDefinition:
      'The final legally binding revenue certificate signed by the Revenue Divisional Officer (RDO) after a successful RTK survey, officially updating the government land register.',
    whyItMatters: 'Once issued, this certificate replaces old disputed paper maps and serves as permanent legal proof.',
    example: 'Certificate No. RESURV-2024-0012 with QR verification code and RDO digital seal.',
    category: 'LAND_REVENUE',
  },
  {
    term: 'RTK Fix Quality: FIXED vs FLOAT',
    hindiName: 'सटीकता स्तर (फिक्स्ड बनाम फ्लोट)',
    tamilName: 'துல்லிய நிலை (பிக்ஸ்டு)',
    simpleDefinition:
      '"FIXED" means the receiver has locked phase ambiguities across 20+ satellites with CORS corrections (error < 2 cm). "FLOAT" means it is still calculating and error is 10-50 cm.',
    whyItMatters: 'Government survey rules require "FIXED" status before any boundary peg coordinate can be legally captured.',
    example: 'The console displays green "RTK FIXED (±1.4 cm)" before allowing the surveyor to save Point P1.',
    category: 'SURVEY_TECH',
  },
];

export const UNIT_CONVERSIONS = [
  { unit: '1 Acre', equals: '40 Guntas = 100 Cents = 4,046.86 m² = 43,560 sq ft' },
  { unit: '1 Hectare', equals: '2.471 Acres = 10,000 m² = 107,639 sq ft' },
  { unit: '1 Guntha', equals: '101.17 m² = 1,089 sq ft = 0.025 Acre' },
  { unit: '1 Cent', equals: '40.47 m² = 435.6 sq ft = 0.010 Acre' },
  { unit: '1 Ground (Urban)', equals: '222.96 m² = 2,400 sq ft' },
  { unit: '1 Bigha (Standard)', equals: '1,618.7 m² = 0.40 to 0.62 Acres (varies by State)' },
];
