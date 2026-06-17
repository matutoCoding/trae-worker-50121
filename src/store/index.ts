import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

  addCage: (cage: Cage) => void;
  updateCage: (id: string, data: Partial<Cage>) => void;
  deleteCage: (id: string) => void;

  addFryRelease: (record: FryRelease) => void;
  updateFryRelease: (id: string, data: Partial<FryRelease>) => void;
  deleteFryRelease: (id: string) => void;

  addFeedingSchedule: (schedule: FeedingSchedule) => void;
  updateFeedingSchedule: (id: string, data: Partial<FeedingSchedule>) => void;

  addDiseaseRecord: (record: DiseaseRecord) => void;
  updateDiseaseRecord: (id: string, data: Partial<DiseaseRecord>) => void;

  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;

  addHarvest: (harvest: Harvest) => void;

  addTransport: (transport: Transport) => void;
  updateTransport: (id: string, data: Partial<Transport>) => void;

  addFinanceRecord: (record: FinanceRecord) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      addCage: (cage) => set((state) => ({ cages: [...state.cages, cage] })),

      updateCage: (id, data) => set((state) => ({
        cages: state.cages.map((c) => c.id === id ? { ...c, ...data } : c),
      })),

      deleteCage: (id) => set((state) => ({
        cages: state.cages.filter((c) => c.id !== id),
      })),

      addFryRelease: (record) => set((state) => ({ fryReleases: [...state.fryReleases, record] })),

      updateFryRelease: (id, data) => set((state) => ({
        fryReleases: state.fryReleases.map((f) => f.id === id ? { ...f, ...data } : f),
      })),

      deleteFryRelease: (id) => set((state) => ({
        fryReleases: state.fryReleases.filter((f) => f.id !== id),
      })),

      addFeedingSchedule: (schedule) => set((state) => ({
        feedingSchedules: [...state.feedingSchedules, schedule],
      })),

      updateFeedingSchedule: (id, data) => set((state) => ({
        feedingSchedules: state.feedingSchedules.map((s) => s.id === id ? { ...s, ...data } : s),
      })),

      addDiseaseRecord: (record) => set((state) => ({
        diseaseRecords: [...state.diseaseRecords, record],
      })),

      updateDiseaseRecord: (id, data) => set((state) => ({
        diseaseRecords: state.diseaseRecords.map((d) => d.id === id ? { ...d, ...data } : d),
      })),

      addInspection: (inspection) => set((state) => ({
        inspections: [...state.inspections, inspection],
      })),

      updateInspection: (id, data) => set((state) => ({
        inspections: state.inspections.map((i) => i.id === id ? { ...i, ...data } : i),
      })),

      addHarvest: (harvest) => set((state) => ({
        harvests: [...state.harvests, harvest],
      })),

      addTransport: (transport) => set((state) => ({
        transports: [...state.transports, transport],
      })),

      updateTransport: (id, data) => set((state) => ({
        transports: state.transports.map((t) => t.id === id ? { ...t, ...data } : t),
      })),

      addFinanceRecord: (record) => set((state) => ({
        financeRecords: [...state.financeRecords, record],
      })),
    }),
    {
      name: 'ocean-ranch-storage',
    }
  )
);
