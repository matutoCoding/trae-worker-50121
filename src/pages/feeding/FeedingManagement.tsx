import { useMemo, useState } from 'react';
import { Card, Table, Statistic, Tag, Button, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Utensils, Calendar, Activity, Clock, ChevronRight, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { FeedingRecord, FeedingSchedule } from '@/types';

const PRIMARY_COLOR = '#0E4D7A';
const ACCENT_COLOR = '#20B2AA';
const DEEP_BLUE = '#0A3D62';
const OCEAN_CYAN = '#1ABC9C';

const deviceStatusMap = { online: { text: '在线', color: 'success' }, offline: { text: '离线', color: 'default' }, fault: { text: '故障', color: 'error' } };
const recordStatusMap = { completed: { text: '已完成', color: 'success' }, scheduled: { text: '待执行', color: 'processing' }, in_progress: { text: '进行中', color: 'warning' } };

interface Device {
  id: string;
  cageName: string;
  status: 'online' | 'offline' | 'fault';
  todayAmount: number;
}

export default function FeedingManagement() {
  const { feedingRecords, feedingSchedules, cages, getCageById } = useAppStore();
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  const today = dayjs().format('YYYY-MM-DD');
  const thisMonth = dayjs().format('YYYY-MM');

  const stats = useMemo(() => {
    const todayRecords = feedingRecords.filter(r => r.feedingDate === today);
    const monthRecords = feedingRecords.filter(r => r.feedingDate.startsWith(thisMonth));
    const pendingSchedules = feedingSchedules.filter(s => s.status === 'active');
    const devices = generateDevices(feedingRecords, cages, today);
    const onlineDevices = devices.filter(d => d.status === 'online').length;

    return {
      todayAmount: todayRecords.reduce((sum, r) => sum + r.feedAmount, 0),
      monthAmount: monthRecords.reduce((sum, r) => sum + r.feedAmount, 0),
      onlineDevices,
      pendingSchedules: pendingSchedules.length,
    };
  }, [feedingRecords, feedingSchedules, cages, today, thisMonth]);

  const devices = useMemo(() => generateDevices(feedingRecords, cages, today), [feedingRecords, cages, today]);

  const trendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const dayLabel = dayjs().subtract(i, 'day').format('MM-DD');
      const dayAmount = feedingRecords.filter(r => r.feedingDate === date).reduce((sum, r) => sum + r.feedAmount, 0);
      data.push({ date: dayLabel, 投喂量: Number(dayAmount.toFixed(1)) });
    }
    return data;
  }, [feedingRecords]);

  const recentRecords = useMemo(() => {
    return [...feedingRecords]
      .sort((a, b) => new Date(`${b.feedingDate} ${b.feedingTime}`).getTime() - new Date(`${a.feedingDate} ${a.feedingTime}`).getTime())
      .slice(0, 10);
  }, [feedingRecords]);

  const statCards = [
    { title: '今日投喂量', value: stats.todayAmount, unit: 'kg', icon: Utensils, gradient: 'from-blue-600 to-cyan-500' },
    { title: '本月投喂量', value: stats.monthAmount, unit: 'kg', icon: Calendar, gradient: 'from-cyan-600 to-teal-500' },
    { title: '设备在线数', value: stats.onlineDevices, unit: '台', icon: Activity, gradient: 'from-green-600 to-emerald-500' },
    { title: '待执行计划', value: stats.pendingSchedules, unit: '个', icon: Clock, gradient: 'from-orange-500 to-amber-400' },
  ];

  const deviceColumns = [
    { title: '设备ID', dataIndex: 'id', key: 'id', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { title: '所属网箱', dataIndex: 'cageName', key: 'cageName' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: keyof typeof deviceStatusMap) => <Tag color={deviceStatusMap[s].color}>{deviceStatusMap[s].text}</Tag> },
    { title: '今日投喂量', dataIndex: 'todayAmount', key: 'todayAmount', render: (v: number) => <span style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{v.toFixed(1)} kg</span> },
  ];

  const recordColumns = [
    { title: '日期', dataIndex: 'feedingDate', key: 'feedingDate', width: 110 },
    { title: '时间', dataIndex: 'feedingTime', key: 'feedingTime', width: 80 },
    { title: '网箱', dataIndex: 'cageId', key: 'cageId', render: (id: string) => getCageById(id)?.name || id, width: 120 },
    { title: '饲料类型', dataIndex: 'feedType', key: 'feedType', width: 120 },
    { title: '投喂量', dataIndex: 'feedAmount', key: 'feedAmount', render: (v: number) => `${v} kg`, width: 90 },
    { title: '投喂人员', dataIndex: 'feeder', key: 'feeder', width: 90 },
    { title: '设备', dataIndex: 'deviceId', key: 'deviceId', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: keyof typeof recordStatusMap) => <Tag color={recordStatusMap[s].color}>{recordStatusMap[s].text}</Tag>, width: 90 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>投喂管理</h1>
        <Link to="/feeding/schedule">
          <Button type="primary" icon={<Calendar size={16} />}>
            查看投喂排期 <ChevronRight size={14} />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0" styles={{ body: { padding: '16px' } }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                  <p className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    {card.value.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">{card.unit}</span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={<span className="flex items-center gap-2"><Cpu size={18} style={{ color: ACCENT_COLOR }} />投喂设备状态</span>} className="rounded-xl shadow-sm border-0 lg:col-span-1">
          <div className="flex gap-2 mb-4">
            {['all', 'online', 'offline', 'fault'].map(f => (
              <Button key={f} type={deviceFilter === f ? 'primary' : 'default'} size="small" onClick={() => setDeviceFilter(f)}>
                {f === 'all' ? '全部' : deviceStatusMap[f as keyof typeof deviceStatusMap].text}
              </Button>
            ))}
          </div>
          <Table
            rowKey="id"
            columns={deviceColumns}
            dataSource={deviceFilter === 'all' ? devices : devices.filter(d => d.status === deviceFilter)}
            pagination={false}
            size="small"
            scroll={{ y: 380 }}
          />
        </Card>

        <Card title={<span className="flex items-center gap-2"><Utensils size={18} style={{ color: ACCENT_COLOR }} />最近投喂记录</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2">
          <Table
            rowKey="id"
            columns={recordColumns}
            dataSource={recentRecords}
            pagination={false}
            size="small"
            scroll={{ y: 380 }}
          />
        </Card>
      </div>

      <Card title={<span className="flex items-center gap-2"><Activity size={18} style={{ color: ACCENT_COLOR }} />投喂量趋势（近7天）</span>} className="rounded-xl shadow-sm border-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trendData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={OCEAN_CYAN} stopOpacity={0.9} />
                <stop offset="100%" stopColor={DEEP_BLUE} stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis tick={{ fontSize: 12 }} stroke="#999" unit=" kg" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="投喂量" radius={[6, 6, 0, 0]}>
              {trendData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function generateDevices(records: FeedingRecord[], cages: any[], today: string): Device[] {
  const deviceMap = new Map<string, Device>();
  const todayRecords = records.filter(r => r.feedingDate === today);

  cages.forEach((cage, idx) => {
    const deviceId = `DEV-${String(idx + 1).padStart(3, '0')}`;
    const todayAmount = todayRecords.filter(r => r.deviceId === deviceId).reduce((sum, r) => sum + r.feedAmount, 0);
    const status = cage.status === 'normal' ? (Math.random() > 0.1 ? 'online' : (Math.random() > 0.5 ? 'offline' : 'fault')) : 'offline';
    deviceMap.set(deviceId, { id: deviceId, cageName: cage.name, status, todayAmount: Number(todayAmount.toFixed(1)) });
  });

  return Array.from(deviceMap.values()).filter(d => d.status !== 'offline' || Math.random() > 0.5);
}
