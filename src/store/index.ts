import { create } from 'zustand';
import type {
  Cage,
  FryRelease,
  FeedingRecord,
  FeedingSchedule,
  WaterQuality,
  RedTideAlert,
  DiseaseRecord,
  Inspection,
  Typhoon,
  Reinforcement,
  CageTransfer,
  Harvest,
  Transport,
  FinanceRecord,
  DashboardStats,
  TodoItem,
  User,
} from '@/types';
import {
  mockCages,
  mockFryReleases,
  mockFeedingRecords,
  mockFeedingSchedules,
  mockWaterQuality,
  mockRedTideAlerts,
  mockDiseaseRecords,
  mockInspections,
  mockTyphoons,
  mockReinforcements,
  mockTransfers,
  mockHarvests,
  mockTransports,
  mockFinanceRecords,
  mockDashboardStats,
  mockTodos,
  mockUsers,
} from '@/mock';

interface AppState {
  cages: Cage[];
  fryReleases: FryRelease[];
  feedingRecords: FeedingRecord[];
  feedingSchedules: FeedingSchedule[];
  waterQuality: WaterQuality[];
  redTideAlerts: RedTideAlert[];
  diseaseRecords: DiseaseRecord[];
  inspections: Inspection[];
  typhoons: Typhoon[];
  reinforcements: Reinforcement[];
  cageTransfers: CageTransfer[];
  harvests: Harvest[];
  transports: Transport[];
  financeRecords: FinanceRecord[];
  dashboardStats: DashboardStats;
  todos: TodoItem[];
  users: User[];
  currentUser: User;
  sidebarCollapsed: boolean;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTodo: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  getCageById: (id: string) => Cage | undefined;
  getWaterQualityByCage: (cageId: string) => WaterQuality[];
  getLatestWaterQuality: (cageId: string) => WaterQuality | undefined;
  getFeedingRecordsByCage: (cageId: string) => FeedingRecord[];
  getDiseaseRecordsByCage: (cageId: string) => DiseaseRecord[];
  getInspectionsByCage: (cageId: string) => Inspection[];
  getFryReleaseByCage: (cageId: string) => FryRelease | undefined;
  getHarvestsByCage: (cageId: string) => Harvest[];
  getTotalIncome: () => number;
  getTotalExpense: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  cages: mockCages,
  fryReleases: mockFryReleases,
  feedingRecords: mockFeedingRecords,
  feedingSchedules: mockFeedingSchedules,
  waterQuality: mockWaterQuality,
  redTideAlerts: mockRedTideAlerts,
  diseaseRecords: mockDiseaseRecords,
  inspections: mockInspections,
  typhoons: mockTyphoons,
  reinforcements: mockReinforcements,
  cageTransfers: mockTransfers,
  harvests: mockHarvests,
  transports: mockTransports,
  financeRecords: mockFinanceRecords,
  dashboardStats: mockDashboardStats,
  todos: mockTodos,
  users: mockUsers,
  currentUser: mockUsers[0],
  sidebarCollapsed: false,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, status: todo.status === 'pending' ? 'completed' : 'pending' } : todo
      ),
    })),
  
  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, { ...todo, id: `todo-${Date.now()}` }],
    })),
  
  getCageById: (id) => get().cages.find((c) => c.id === id),
  
  getWaterQualityByCage: (cageId) =>
    get().waterQuality.filter((w) => w.cageId === cageId).sort((a, b) => 
      new Date(b.measureTime).getTime() - new Date(a.measureTime).getTime()
    ),
  
  getLatestWaterQuality: (cageId) => {
    const data = get().getWaterQualityByCage(cageId);
    return data[0];
  },
  
  getFeedingRecordsByCage: (cageId) =>
    get().feedingRecords.filter((f) => f.cageId === cageId).sort((a, b) => 
      new Date(`${b.feedingDate} ${b.feedingTime}`).getTime() - 
      new Date(`${a.feedingDate} ${a.feedingTime}`).getTime()
    ),
  
  getDiseaseRecordsByCage: (cageId) =>
    get().diseaseRecords.filter((d) => d.cageId === cageId).sort((a, b) =>
      new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime()
    ),
  
  getInspectionsByCage: (cageId) =>
    get().inspections.filter((i) => i.cageId === cageId).sort((a, b) =>
      new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
    ),
  
  getFryReleaseByCage: (cageId) =>
    get().fryReleases.find((f) => f.cageId === cageId),
  
  getHarvestsByCage: (cageId) =>
    get().harvests.filter((h) => h.cageId === cageId).sort((a, b) =>
      new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()
    ),
  
  getTotalIncome: () =>
    get().financeRecords
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0),
  
  getTotalExpense: () =>
    get().financeRecords
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0),
}));
