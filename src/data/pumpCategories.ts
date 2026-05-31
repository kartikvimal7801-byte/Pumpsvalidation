// Pump category definitions
// Each category maps to its own IS standards, document templates, and validation rules.
// Standards and validation rules are stubs — attach real content per category as needed.

import { ModuleType } from '@/types';

export type PumpCategoryId =
  | 'centrifugal-pump'
  | 'single-stage-pressure-pump'
  | 'multi-stage-booster-pump'
  | 'open-well-submersible-pump'
  | 'borewell-3-4-inch'
  | 'shallow-well-jet-pump'
  | 'deep-well-jet-pump'
  | 'sewage-submersible-pump'
  | 'inline-circulating-pump'
  | 'dewatering-submersible-pump';

export interface ISStandard {
  code: string;
  title: string;
  description: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

export interface ValidationRule {
  id: string;
  criterion: string;
  required: boolean;
  stage: string; // which workflow stage this applies to
}

export interface PumpCategory {
  id: PumpCategoryId;
  name: string;
  shortName: string;
  description: string;
  image: string; // path relative to /public
  isStandards: ISStandard[];
  documentTemplates: DocumentTemplate[];
  validationRules: ValidationRule[];
  applicableModules: ModuleType[];
}

export const PUMP_CATEGORIES: PumpCategory[] = [
  {
    id: 'centrifugal-pump',
    name: 'Centrifugal Monoset Pumps (IS 9079)',
    shortName: 'Centrifugal',
    description: 'Standard centrifugal pumps for industrial and agricultural water transfer.',
    image: '/pumpimages/Centrifigle-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 1520', title: 'Horizontal Centrifugal Pumps', description: 'Specification for horizontal centrifugal pumps' },
      { code: 'IS 5120', title: 'Technical Requirements for Rotodynamic Pumps', description: 'Technical requirements for rotodynamic pumps' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'hydraulic-report', name: 'Hydraulic Performance Report', required: true, description: 'Head-flow curve and efficiency data' },
    ],
    validationRules: [
      { id: 'cp-1', criterion: 'Hydraulic efficiency ≥ 70%', required: true, stage: 'proto-reports' },
      { id: 'cp-2', criterion: 'IS 1520 dimensional compliance', required: true, stage: 'acceptance' },
    ],
  },
  {
    id: 'single-stage-pressure-pump',
    name: 'Single Stage Pressure Pump (IS 8472)',
    shortName: 'Pressure Pump',
    description: 'Single-stage pressure pumps for boosting water pressure in buildings.',
    image: '/pumpimages/Pressure-Pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 9079', title: 'Self-Priming Pumps', description: 'Applicable for pressure pump variants' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'pressure-test', name: 'Pressure Test Report', required: true, description: 'Pressure performance validation' },
    ],
    validationRules: [
      { id: 'pp-1', criterion: 'Max pressure ≥ 3.5 bar', required: true, stage: 'proto-reports' },
      { id: 'pp-2', criterion: 'Noise level ≤ 65 dB(A)', required: false, stage: 'n10-reports' },
    ],
  },
  {
    id: 'multi-stage-booster-pump',
    name: 'Multi-stage Booster Pump (IS 9079)',
    shortName: 'Booster Pump',
    description: 'Multi-stage pumps for high-pressure water supply in tall buildings.',
    image: '/pumpimages/Multistage-booster.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 5120', title: 'Technical Requirements for Rotodynamic Pumps', description: 'Multi-stage pump requirements' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'stage-test', name: 'Stage Performance Report', required: true, description: 'Per-stage performance data' },
    ],
    validationRules: [
      { id: 'mb-1', criterion: 'Each stage head within ±5% of design', required: true, stage: 'proto-reports' },
    ],
  },
  {
    id: 'open-well-submersible-pump',
    name: 'Open Well Submersible Pump (IS 14220)',
    shortName: 'Open Well',
    description: 'Submersible pumps designed for open wells and shallow water sources.',
    image: '/pumpimages/openwell-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 8034', title: 'Submersible Pump Sets for Clear Cold Water', description: 'Requirements for submersible pump sets' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'submersion-test', name: 'Submersion Test Report', required: true, description: 'IP rating and submersion validation' },
    ],
    validationRules: [
      { id: 'ow-1', criterion: 'IP68 rating verified', required: true, stage: 'proto-reports' },
      { id: 'ow-2', criterion: 'IS 8034 compliance', required: true, stage: 'acceptance' },
    ],
  },
  {
    id: 'borewell-3-4-inch',
    name: '3-4 inch Borewell Submersible Pump (IS 8034)',
    shortName: '3-4" Borewell',
    description: 'Slim submersible pumps for 3 and 4 inch diameter borewells.',
    image: '/pumpimages/Borewell-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 8034', title: 'Submersible Pump Sets for Clear Cold Water', description: 'Requirements for borewell submersible pumps' },
      { code: 'IS 14220', title: 'Submersible Pump Sets for Borewells', description: 'Specific requirements for borewell pumps' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'borewell-test', name: 'Borewell Performance Report', required: true, description: 'Performance at rated depth' },
    ],
    validationRules: [
      { id: 'bw34-1', criterion: 'OD ≤ 3.5 inches for 3" pump', required: true, stage: 'proto-reports' },
      { id: 'bw34-2', criterion: 'IS 14220 compliance', required: true, stage: 'acceptance' },
    ],
  },
  {
    id: 'shallow-well-jet-pump',
    name: 'Shallow Well Jet Pump (IS 12225)',
    shortName: 'Shallow Jet',
    description: 'Jet pumps for drawing water from shallow wells up to 8m depth.',
    image: '/pumpimages/shallow-well-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 9079', title: 'Self-Priming Pumps', description: 'Applicable for jet pump variants' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'suction-test', name: 'Suction Lift Test Report', required: true, description: 'Maximum suction lift validation' },
    ],
    validationRules: [
      { id: 'swj-1', criterion: 'Suction lift ≥ 7m', required: true, stage: 'proto-reports' },
    ],
  },
  {
    id: 'deep-well-jet-pump',
    name: 'Deep Well Jet Pump (IS 12225)',
    shortName: 'Deep Jet',
    description: 'Jet pumps for deep well applications with ejector assembly.',
    image: '/pumpimages/Deepwell-jet-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 9079', title: 'Self-Priming Pumps', description: 'Deep well jet pump requirements' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'ejector-test', name: 'Ejector Performance Report', required: true, description: 'Ejector assembly performance data' },
    ],
    validationRules: [
      { id: 'dwj-1', criterion: 'Operating depth ≥ 25m', required: true, stage: 'proto-reports' },
    ],
  },
  {
    id: 'sewage-submersible-pump',
    name: 'Sewage Submersible Pump (IS 8034)',
    shortName: 'Sewage Pump',
    description: 'Heavy-duty submersible pumps for sewage and wastewater handling.',
    image: '/pumpimages/Sewage-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 14220', title: 'Submersible Pump Sets for Borewells', description: 'Adapted for sewage pump requirements' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'solids-test', name: 'Solids Handling Test Report', required: true, description: 'Maximum solids size handling validation' },
    ],
    validationRules: [
      { id: 'sw-1', criterion: 'Solids handling ≥ 50mm diameter', required: true, stage: 'proto-reports' },
      { id: 'sw-2', criterion: 'IP68 rating verified', required: true, stage: 'proto-reports' },
    ],
  },
  {
    id: 'inline-circulating-pump',
    name: 'In Line Circulating Pump (IS 6595)',
    shortName: 'Inline Pump',
    description: 'Inline pumps for HVAC and hot water circulation systems.',
    image: '/pumpimages/inline-circulating-pump.jpg',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 1520', title: 'Horizontal Centrifugal Pumps', description: 'Inline pump dimensional requirements' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'circulation-test', name: 'Circulation Performance Report', required: true, description: 'Flow and head at rated conditions' },
    ],
    validationRules: [
      { id: 'il-1', criterion: 'Flange dimensions per PN16 standard', required: true, stage: 'proto-reports' },
    ],
  },
  {
    id: 'dewatering-submersible-pump',
    name: 'Dewatering Submersible Pump (IS 8034)',
    shortName: 'Dewatering',
    description: 'Portable submersible pumps for construction site dewatering.',
    image: '/pumpimages/DeWatering-pump.png',
    applicableModules: ['npd', 'vave', 'standardization'],
    isStandards: [
      { code: 'IS 8034', title: 'Submersible Pump Sets for Clear Cold Water', description: 'Dewatering pump requirements' },
    ],
    documentTemplates: [
      { id: 'rfq', name: 'RFQ Document', required: true, description: 'Request for Quotation' },
      { id: 'dewater-test', name: 'Dewatering Performance Report', required: true, description: 'Flow rate at low head conditions' },
    ],
    validationRules: [
      { id: 'dw-1', criterion: 'Can handle 10mm solids', required: true, stage: 'proto-reports' },
      { id: 'dw-2', criterion: 'Portable design ≤ 15kg', required: false, stage: 'acceptance' },
    ],
  },
];

export const getPumpCategoryById = (id: PumpCategoryId): PumpCategory | undefined =>
  PUMP_CATEGORIES.find((c) => c.id === id);

export const getPumpCategoriesForModule = (moduleType: ModuleType): PumpCategory[] =>
  PUMP_CATEGORIES.filter((c) => c.applicableModules.includes(moduleType));
