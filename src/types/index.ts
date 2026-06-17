export type CageStatus = 'normal' | 'maintenance' | 'damaged' | 'idle';
export type WarningLevel = 'normal' | 'warning' | 'danger';
export type DiseaseStatus = 'diagnosed' | 'treating' | 'recovered' | 'dead';
export type InspectionStatus = 'normal' | 'issue_found' | 'resolved';
export type InspectionType = 'diving' | 'net_check' | 'routine';
export type TransportStatus = 'pending' | 'transporting' | 'arrived' | 'delayed';
export type FinanceType = 'income' | 'expense';
export type TyphoonLevel = 'tropical_depression' | 'tropical_storm' | 'severe_tropical_storm' | 'typhoon' | 'severe_typhoon' | 'super_typhoon';

export interface Cage {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  specification: string;
  material: string;
  installDate: string;
  status: CageStatus;
  equipment: string[];
  capacity: number;
  currentStock?: number;
}

export interface FryRelease {
  id: string;
  cageId: string;
  frySpecies: string;
  quantity: number;
  weight: number;
  releaseDate: string;
  batchNo: string;
  supplier: string;
  expectedHarvestDate?: string;
  survivalRate?: number;
}

export interface FeedingRecord {
  id: string;
  cageId: string;
  fryReleaseId: string;
  feedingDate: string;
  feedingTime: string;
  feedType: string;
  feedAmount: number;
  feeder: string;
  deviceId: string;
  status: 'completed' | 'scheduled' | 'in_progress';
}

export interface FeedingSchedule {
  id: string;
  cageId: string;
  feedType: string;
  dailyAmount: number;
  feedingTimes: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
}

export interface WaterQuality {
  id: string;
  cageId: string;
  measureTime: string;
  dissolvedOxygen: number;
  salinity: number;
  temperature: number;
  phValue: number;
  ammoniaNitrogen: number;
  turbidity: number;
  warningLevel: WarningLevel;
}

export interface RedTideAlert {
  id: string;
  cageId: string;
  alertTime: string;
  severity: WarningLevel;
  description: string;
  measures: string[];
  status: 'active' | 'resolved';
}

export interface DiseaseRecord {
  id: string;
  cageId: string;
  foundDate: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medicine: string;
  dosage: string;
  recoveryDate?: string;
  status: DiseaseStatus;
  veterinarian: string;
}

export interface Inspection {
  id: string;
  cageId: string;
  type: InspectionType;
  inspectionDate: string;
  inspector: string;
  findings: string;
  photos: string[];
  status: InspectionStatus;
  damageLevel?: 'minor' | 'moderate' | 'severe';
  repairMeasures?: string;
}

export interface Typhoon {
  id: string;
  name: string;
  level: TyphoonLevel;
  landfallTime: string;
  path: string;
  warningLevel: WarningLevel;
  expectedWindSpeed: number;
  expectedRainfall: number;
}

export interface Reinforcement {
  id: string;
  typhoonId: string;
  cageId: string;
  reinforcementDate: string;
  measures: string[];
  operator: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface CageTransfer {
  id: string;
  typhoonId: string;
  cageId: string;
  sourceLocation: string;
  targetLocation: string;
  transferDate: string;
  operator: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Harvest {
  id: string;
  cageId: string;
  fryReleaseId: string;
  harvestDate: string;
  quantity: number;
  weight: number;
  qualityGrade: 'A' | 'B' | 'C';
  buyer: string;
  unitPrice: number;
  totalAmount: number;
  inspector: string;
}

export interface Transport {
  id: string;
  harvestId: string;
  departureDate: string;
  destination: string;
  vehicle: string;
  driver: string;
  temperature: number;
  oxygenLevel: number;
  arrivalTime?: string;
  status: TransportStatus;
  cargoWeight: number;
  route: string;
}

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  relatedId: string;
  transactionDate: string;
  amount: number;
  category: string;
  description: string;
  operator: string;
}

export interface DashboardStats {
  totalCages: number;
  activeCages: number;
  totalStock: number;
  monthlyFeedAmount: number;
  averageDO: number;
  warningCount: number;
  monthlyHarvest: number;
  monthlyRevenue: number;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  dueDate: string;
  module: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'worker' | 'finance';
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
}
