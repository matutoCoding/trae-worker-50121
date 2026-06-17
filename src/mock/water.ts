import type { WaterQuality, RedTideAlert } from '@/types';
import dayjs from 'dayjs';

const generateMockWaterQuality = (): WaterQuality[] => {
  const records: WaterQuality[] = [];
  const activeCages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-006', 'cage-007', 'cage-009', 'cage-011', 'cage-012', 'cage-013', 'cage-014', 'cage-016', 'cage-017', 'cage-018', 'cage-019'];
  
  for (let hour = 0; hour < 720; hour++) {
    const time = dayjs().subtract(hour, 'hour');
    
    activeCages.forEach((cageId, cageIndex) => {
      if (Math.random() > 0.3) {
        const baseDO = 6.5 + (cageIndex % 3) * 0.5;
        const baseSalinity = 28 + (cageIndex % 5) * 0.8;
        const baseTemp = 22 + (cageIndex % 4) * 1.5;
        
        const doValue = Number((baseDO + (Math.random() - 0.5) * 2).toFixed(2));
        const salinity = Number((baseSalinity + (Math.random() - 0.5) * 3).toFixed(2));
        const temperature = Number((baseTemp + (Math.random() - 0.5) * 4).toFixed(1));
        const phValue = Number((7.8 + (Math.random() - 0.5) * 0.6).toFixed(2));
        const ammoniaNitrogen = Number((0.02 + Math.random() * 0.08).toFixed(3));
        const turbidity = Number((5 + Math.random() * 15).toFixed(1));
        
        let warningLevel: 'normal' | 'warning' | 'danger' = 'normal';
        if (doValue < 5 || phValue < 7 || phValue > 8.5 || ammoniaNitrogen > 0.08) {
          warningLevel = Math.random() > 0.5 ? 'warning' : 'danger';
        } else if (doValue < 6 || salinity < 25 || salinity > 35 || temperature < 18 || temperature > 30) {
          warningLevel = 'warning';
        }
        
        records.push({
          id: `water-${String(records.length + 1).padStart(6, '0')}`,
          cageId,
          measureTime: time.format('YYYY-MM-DD HH:mm:ss'),
          dissolvedOxygen: doValue,
          salinity,
          temperature,
          phValue,
          ammoniaNitrogen,
          turbidity,
          warningLevel,
        });
      }
    });
  }
  
  return records;
};

const generateMockRedTideAlerts = (): RedTideAlert[] => {
  return [
    {
      id: 'alert-001',
      cageId: 'cage-002',
      alertTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      severity: 'warning',
      description: '监测到叶绿素a浓度异常升高，可能存在赤潮风险',
      measures: ['增加监测频率', '减少投喂量', '准备应急增氧设备'],
      status: 'active',
    },
    {
      id: 'alert-002',
      cageId: 'cage-007',
      alertTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
      severity: 'warning',
      description: '水域浊度持续偏高，需密切关注',
      measures: ['增加水体交换', '监测浮游生物密度'],
      status: 'resolved',
    },
    {
      id: 'alert-003',
      cageId: 'cage-013',
      alertTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      severity: 'danger',
      description: '溶解氧急剧下降至4.2mg/L，存在严重缺氧风险',
      measures: ['立即开启增氧设备', '转移部分鱼苗', '减少投喂量50%', '24小时不间断监测'],
      status: 'active',
    },
  ];
};

export const mockWaterQuality: WaterQuality[] = generateMockWaterQuality();
export const mockRedTideAlerts: RedTideAlert[] = generateMockRedTideAlerts();
