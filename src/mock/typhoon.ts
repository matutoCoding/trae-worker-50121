import type { Typhoon, Reinforcement, CageTransfer } from '@/types';
import dayjs from 'dayjs';

const generateMockTyphoons = (): Typhoon[] => {
  return [
    {
      id: 'typhoon-001',
      name: '台风"海神"',
      level: 'typhoon',
      landfallTime: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      path: '西北太平洋→东海→浙江沿海',
      warningLevel: 'warning',
      expectedWindSpeed: 120,
      expectedRainfall: 200,
    },
    {
      id: 'typhoon-002',
      name: '台风"风神"',
      level: 'severe_tropical_storm',
      landfallTime: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm:ss'),
      path: '菲律宾以东→南海→广东沿海',
      warningLevel: 'normal',
      expectedWindSpeed: 90,
      expectedRainfall: 150,
    },
    {
      id: 'typhoon-003',
      name: '超级台风"龙王"',
      level: 'super_typhoon',
      landfallTime: dayjs().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
      path: '马里亚纳群岛以东→台湾以东→福建沿海',
      warningLevel: 'danger',
      expectedWindSpeed: 180,
      expectedRainfall: 350,
    },
  ];
};

const generateMockReinforcements = (): Reinforcement[] => {
  const measures = [
    ['加固锚链', '检查固定绳索', '增设浮球'],
    ['收紧网箱', '固定附属设施', '检查供电系统'],
    ['加固网箱框架', '检查连接件', '备足应急物资'],
    ['双保险加固锚点', '拆除易损设备', '设置警示标志'],
  ];
  const operators = ['加固队A组', '加固队B组', '应急一队', '应急二队'];
  const cages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-006', 'cage-007', 'cage-009', 'cage-011', 'cage-013', 'cage-016'];
  
  return cages.map((cageId, index) => ({
    id: `reinforce-${String(index + 1).padStart(3, '0')}`,
    typhoonId: 'typhoon-001',
    cageId,
    reinforcementDate: dayjs().subtract(index % 3, 'day').format('YYYY-MM-DD'),
    measures: measures[index % measures.length],
    operator: operators[index % operators.length],
    status: index < 6 ? 'completed' : index < 8 ? 'in_progress' : 'pending',
    notes: index % 2 === 0 ? '已完成加固，经检查符合安全标准' : undefined,
  }));
};

const generateMockTransfers = (): CageTransfer[] => {
  const locations = [
    { source: 'A养殖区-外海', target: '避风锚地-1号泊位' },
    { source: 'B养殖区-开阔水域', target: '避风锚地-2号泊位' },
    { source: 'C养殖区-深水区', target: '内湾养殖区-安全区域' },
    { source: 'E养殖区-航道附近', target: '避风锚地-3号泊位' },
  ];
  const operators = ['转移队1组', '转移队2组', '转移队3组'];
  const cages = ['cage-008', 'cage-010', 'cage-015', 'cage-020'];
  
  return cages.map((cageId, index) => ({
    id: `transfer-${String(index + 1).padStart(3, '0')}`,
    typhoonId: 'typhoon-001',
    cageId,
    sourceLocation: locations[index].source,
    targetLocation: locations[index].target,
    transferDate: dayjs().add(index % 2, 'day').format('YYYY-MM-DD'),
    operator: operators[index % operators.length],
    status: index < 2 ? 'completed' : index === 2 ? 'in_progress' : 'pending',
  }));
};

export const mockTyphoons: Typhoon[] = generateMockTyphoons();
export const mockReinforcements: Reinforcement[] = generateMockReinforcements();
export const mockTransfers: CageTransfer[] = generateMockTransfers();
