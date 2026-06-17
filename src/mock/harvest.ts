import type { Harvest, Transport, FinanceRecord, DashboardStats, TodoItem, User } from '@/types';
import dayjs from 'dayjs';

const generateMockHarvests = (): Harvest[] => {
  const harvests: Harvest[] = [];
  const buyers = ['上海水产批发市场', '广州黄沙水产市场', '北京京深海鲜市场', '杭州新农都', '深圳布吉农批'];
  const cages = ['cage-001', 'cage-003', 'cage-006', 'cage-009', 'cage-011', 'cage-013', 'cage-016', 'cage-019'];
  const inspectors = ['质检员A', '质检员B', '质检员C'];
  const grades: Array<'A' | 'B' | 'C'> = ['A', 'A', 'A', 'B', 'B', 'C'];
  
  for (let i = 0; i < 25; i++) {
    const date = dayjs().subtract(i * 3, 'day');
    const weight = 500 + Math.random() * 1500;
    const unitPrice = 35 + Math.random() * 25;
    
    harvests.push({
      id: `harvest-${String(i + 1).padStart(3, '0')}`,
      cageId: cages[i % cages.length],
      fryReleaseId: `fry-${String((i % 15) + 1).padStart(3, '0')}`,
      harvestDate: date.format('YYYY-MM-DD'),
      quantity: Math.floor(weight / 0.35),
      weight: Number(weight.toFixed(2)),
      qualityGrade: grades[i % grades.length],
      buyer: buyers[i % buyers.length],
      unitPrice: Number(unitPrice.toFixed(2)),
      totalAmount: Number((weight * unitPrice).toFixed(2)),
      inspector: inspectors[i % inspectors.length],
    });
  }
  
  return harvests;
};

const generateMockTransports = (): Transport[] => {
  const destinations = ['上海', '广州', '北京', '杭州', '深圳', '南京', '武汉', '成都'];
  const vehicles = ['沪A·12345冷藏车', '粤B·67890冷藏车', '京C·11111冷藏车', '浙D·22222冷藏车'];
  const drivers = ['张师傅', '李师傅', '王师傅', '陈师傅'];
  const routes = ['沿海高速', '沈海高速', '京沪高速', '沪昆高速'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const departure = dayjs().subtract(i * 3, 'day');
    const isArrived = i > 2;
    
    return {
      id: `transport-${String(i + 1).padStart(3, '0')}`,
      harvestId: `harvest-${String(i + 1).padStart(3, '0')}`,
      departureDate: departure.format('YYYY-MM-DD HH:mm'),
      destination: destinations[i % destinations.length],
      vehicle: vehicles[i % vehicles.length],
      driver: drivers[i % drivers.length],
      temperature: Number((2 + Math.random() * 3).toFixed(1)),
      oxygenLevel: Number((85 + Math.random() * 10).toFixed(1)),
      arrivalTime: isArrived ? departure.add(8 + Math.random() * 6, 'hour').format('YYYY-MM-DD HH:mm') : undefined,
      status: i === 0 ? 'transporting' : i === 1 ? 'pending' : isArrived ? 'arrived' : 'delayed',
      cargoWeight: Number((500 + Math.random() * 1500).toFixed(2)),
      route: routes[i % routes.length],
    };
  });
};

const generateMockFinanceRecords = (): FinanceRecord[] => {
  const records: FinanceRecord[] = [];
  const incomeCategories = ['销售收入', '政府补贴', '其他收入'];
  const expenseCategories = ['饲料采购', '苗种采购', '人工成本', '设备维护', '药品采购', '运输费用', '水电费用', '其他支出'];
  const operators = ['财务-李会计', '财务-王出纳', '系统自动'];
  
  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.4;
    const date = dayjs().subtract(i, 'day');
    
    if (isIncome) {
      records.push({
        id: `finance-${String(records.length + 1).padStart(4, '0')}`,
        type: 'income',
        relatedId: `harvest-${String((i % 25) + 1).padStart(3, '0')}`,
        transactionDate: date.format('YYYY-MM-DD'),
        amount: Number((15000 + Math.random() * 50000).toFixed(2)),
        category: incomeCategories[Math.floor(Math.random() * incomeCategories.length)],
        description: '水产品销售收入',
        operator: operators[Math.floor(Math.random() * operators.length)],
      });
    } else {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amounts: Record<string, [number, number]> = {
        '饲料采购': [8000, 25000],
        '苗种采购': [5000, 20000],
        '人工成本': [10000, 30000],
        '设备维护': [1000, 8000],
        '药品采购': [500, 5000],
        '运输费用': [2000, 10000],
        '水电费用': [1000, 5000],
        '其他支出': [500, 3000],
      };
      const [min, max] = amounts[category] || [500, 5000];
      
      records.push({
        id: `finance-${String(records.length + 1).padStart(4, '0')}`,
        type: 'expense',
        relatedId: '',
        transactionDate: date.format('YYYY-MM-DD'),
        amount: Number((min + Math.random() * (max - min)).toFixed(2)),
        category,
        description: `${category}支出`,
        operator: operators[Math.floor(Math.random() * operators.length)],
      });
    }
  }
  
  return records;
};

const generateMockDashboardStats = (): DashboardStats => {
  return {
    totalCages: 20,
    activeCages: 15,
    totalStock: 96400,
    monthlyFeedAmount: 12580.5,
    averageDO: 6.8,
    warningCount: 3,
    monthlyHarvest: 18500,
    monthlyRevenue: 856420.00,
  };
};

const generateMockTodos = (): TodoItem[] => {
  return [
    { id: 'todo-001', title: '检查C区网箱加固情况', priority: 'high', status: 'pending', dueDate: dayjs().add(1, 'day').format('YYYY-MM-DD'), module: '台风防御' },
    { id: 'todo-002', title: '记录今日投喂数据', priority: 'medium', status: 'pending', dueDate: dayjs().format('YYYY-MM-DD'), module: '投喂管理' },
    { id: 'todo-003', title: '处理cage-013溶解氧警报', priority: 'high', status: 'pending', dueDate: dayjs().format('YYYY-MM-DD'), module: '水质监测' },
    { id: 'todo-004', title: '安排潜水员检查E区网箱', priority: 'medium', status: 'completed', dueDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), module: '病害防控' },
    { id: 'todo-005', title: '更新台风"海神"应急预案', priority: 'high', status: 'pending', dueDate: dayjs().add(2, 'day').format('YYYY-MM-DD'), module: '台风防御' },
    { id: 'todo-006', title: '核对本月饲料采购账单', priority: 'low', status: 'pending', dueDate: dayjs().add(5, 'day').format('YYYY-MM-DD'), module: '财务管理' },
    { id: 'todo-007', title: '安排cage-005维护保养', priority: 'medium', status: 'pending', dueDate: dayjs().add(3, 'day').format('YYYY-MM-DD'), module: '网箱台账' },
    { id: 'todo-008', title: '统计上月收获数据', priority: 'low', status: 'completed', dueDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), module: '收获销售' },
  ];
};

const generateMockUsers = (): User[] => {
  return [
    { id: 'user-001', username: 'admin', name: '系统管理员', role: 'admin', phone: '13800138000', status: 'active' },
    { id: 'user-002', username: 'manager', name: '养殖主管', role: 'manager', phone: '13800138001', status: 'active' },
    { id: 'user-003', username: 'worker1', name: '养殖员张三', role: 'worker', phone: '13800138002', status: 'active' },
    { id: 'user-004', username: 'worker2', name: '养殖员李四', role: 'worker', phone: '13800138003', status: 'active' },
    { id: 'user-005', username: 'finance', name: '财务会计', role: 'finance', phone: '13800138004', status: 'active' },
    { id: 'user-006', username: 'worker3', name: '养殖员王五', role: 'worker', phone: '13800138005', status: 'inactive' },
  ];
};

export const mockHarvests: Harvest[] = generateMockHarvests();
export const mockTransports: Transport[] = generateMockTransports();
export const mockFinanceRecords: FinanceRecord[] = generateMockFinanceRecords();
export const mockDashboardStats: DashboardStats = generateMockDashboardStats();
export const mockTodos: TodoItem[] = generateMockTodos();
export const mockUsers: User[] = generateMockUsers();
