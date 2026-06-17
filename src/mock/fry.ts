import type { FryRelease } from '@/types';
import dayjs from 'dayjs';

const generateMockFryReleases = (): FryRelease[] => {
  const species = ['大黄鱼', '鲈鱼', '石斑鱼', '真鲷', '黑鲷', '美国红鱼', '卵形鲳鲹'];
  const suppliers = ['福建省水产种苗场', '广东省海洋渔业公司', '浙江省水产研究所', '山东省海水养殖研究所'];
  const releases: FryRelease[] = [];
  
  const activeCages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-006', 'cage-007', 'cage-009', 'cage-011', 'cage-012', 'cage-013', 'cage-014', 'cage-016', 'cage-017', 'cage-018', 'cage-019'];
  
  activeCages.forEach((cageId, index) => {
    const baseDate = dayjs().subtract(2 + Math.floor(Math.random() * 4), 'month');
    const quantity = 3000 + Math.floor(Math.random() * 4000);
    
    releases.push({
      id: `fry-${String(index + 1).padStart(3, '0')}`,
      cageId,
      frySpecies: species[index % species.length],
      quantity,
      weight: (quantity * 0.05 + Math.random() * 100).toFixed(2) as unknown as number,
      releaseDate: baseDate.format('YYYY-MM-DD'),
      batchNo: `BATCH-${baseDate.format('YYYYMM')}-${String(index + 1).padStart(4, '0')}`,
      supplier: suppliers[index % suppliers.length],
      expectedHarvestDate: baseDate.add(8, 'month').format('YYYY-MM-DD'),
      survivalRate: 85 + Math.random() * 10,
    });
  });
  
  return releases;
};

export const mockFryReleases: FryRelease[] = generateMockFryReleases();
