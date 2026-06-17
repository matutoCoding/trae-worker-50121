import type { FeedingRecord, FeedingSchedule } from '@/types';
import dayjs from 'dayjs';

const generateMockFeedingRecords = (): FeedingRecord[] => {
  const records: FeedingRecord[] = [];
  const feedTypes = ['配合饲料', '鲜杂鱼', '专用配合饲料', '高蛋白饲料'];
  const feeders = ['张三', '李四', '王五', '赵六', '养殖员A', '养殖员B'];
  const activeCages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-006', 'cage-007', 'cage-009', 'cage-011', 'cage-012', 'cage-013', 'cage-014', 'cage-016', 'cage-017', 'cage-018', 'cage-019'];
  
  for (let day = 0; day < 90; day++) {
    const date = dayjs().subtract(day, 'day');
    
    activeCages.forEach((cageId, cageIndex) => {
      const feedingTimes = ['06:00', '12:00', '18:00'];
      
      feedingTimes.forEach((time, timeIndex) => {
        if (Math.random() > 0.1) {
          records.push({
            id: `feed-${String(day * 45 + cageIndex * 3 + timeIndex + 1).padStart(6, '0')}`,
            cageId,
            fryReleaseId: `fry-${String(cageIndex + 1).padStart(3, '0')}`,
            feedingDate: date.format('YYYY-MM-DD'),
            feedingTime: time,
            feedType: feedTypes[Math.floor(Math.random() * feedTypes.length)],
            feedAmount: Number((15 + Math.random() * 25).toFixed(2)),
            feeder: feeders[Math.floor(Math.random() * feeders.length)],
            deviceId: `DEV-${String(cageIndex + 1).padStart(3, '0')}`,
            status: 'completed',
          });
        }
      });
    });
  }
  
  return records;
};

const generateMockFeedingSchedules = (): FeedingSchedule[] => {
  const schedules: FeedingSchedule[] = [];
  const activeCages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-006', 'cage-007', 'cage-009', 'cage-011', 'cage-012', 'cage-013', 'cage-014', 'cage-016', 'cage-017', 'cage-018', 'cage-019'];
  const feedTypes = ['配合饲料', '高蛋白饲料', '专用配合饲料'];
  
  activeCages.forEach((cageId, index) => {
    schedules.push({
      id: `schedule-${String(index + 1).padStart(3, '0')}`,
      cageId,
      feedType: feedTypes[index % feedTypes.length],
      dailyAmount: Number((45 + Math.random() * 30).toFixed(2)),
      feedingTimes: ['06:00', '12:00', '18:00'],
      startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(60, 'day').format('YYYY-MM-DD'),
      status: Math.random() > 0.1 ? 'active' : 'paused',
    });
  });
  
  return schedules;
};

export const mockFeedingRecords: FeedingRecord[] = generateMockFeedingRecords();
export const mockFeedingSchedules: FeedingSchedule[] = generateMockFeedingSchedules();
