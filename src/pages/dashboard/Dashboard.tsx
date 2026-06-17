import { useMemo } from 'react';
import { Card, Tag, Checkbox } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Fish, Activity, Droplets, Utensils, Waves, AlertTriangle, Package, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { CageStatus, TodoItem, RedTideAlert } from '@/types';

const COLORS = ['#20B2AA', '#1890FF', '#FAAD14', '#8C8C8C'];
const PRIMARY_COLOR = '#0E4D7A';
const ACCENT_COLOR = '#20B2AA';
const statusMap: Record<CageStatus, string> = { normal: '正常', maintenance: '维护', damaged: '损坏', idle: '闲置' };
const priorityColors = { high: 'error', medium: 'warning', low: 'default' } as const;
const severityColors = { danger: 'error', warning: 'warning', normal: 'success' } as const;

export default function Dashboard() {
  const { dashboardStats, cages, waterQuality, todos, redTideAlerts, toggleTodo } = useAppStore();

  const statCards = [
    { title: '总网箱数', value: dashboardStats.totalCages, icon: Fish, gradient: 'from-blue-500 to-cyan-400', unit: '个' },
    { title: '活跃网箱数', value: dashboardStats.activeCages, icon: Activity, gradient: 'from-green-500 to-emerald-400', unit: '个' },
    { title: '总存鱼量', value: dashboardStats.totalStock, icon: Droplets, gradient: 'from-indigo-500 to-blue-400', unit: '尾' },
    { title: '月投喂量', value: dashboardStats.monthlyFeedAmount, icon: Utensils, gradient: 'from-orange-500 to-amber-400', unit: 'kg' },
    { title: '平均溶氧', value: dashboardStats.averageDO, icon: Waves, gradient: 'from-teal-500 to-cyan-400', unit: 'mg/L' },
    { title: '警报数量', value: dashboardStats.warningCount, icon: AlertTriangle, gradient: 'from-red-500 to-orange-400', unit: '条' },
    { title: '月收获量', value: dashboardStats.monthlyHarvest, icon: Package, gradient: 'from-purple-500 to-pink-400', unit: 'kg' },
    { title: '月营收', value: dashboardStats.monthlyRevenue, icon: DollarSign, gradient: 'from-yellow-500 to-orange-400', unit: '元' },
  ];

  const waterTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('MM-DD');
      const dayStart = dayjs().subtract(i, 'day').startOf('day');
      const dayEnd = dayjs().subtract(i, 'day').endOf('day');
      const dayData = waterQuality.filter(w => {
        const t = dayjs(w.measureTime);
        return t.isAfter(dayStart) && t.isBefore(dayEnd);
      });
      if (dayData.length > 0) {
        const avgDO = dayData.reduce((s, d) => s + d.dissolvedOxygen, 0) / dayData.length;
        const avgSalinity = dayData.reduce((s, d) => s + d.salinity, 0) / dayData.length;
        const avgTemp = dayData.reduce((s, d) => s + d.temperature, 0) / dayData.length;
        data.push({ date, 溶氧: Number(avgDO.toFixed(1)), 盐度: Number(avgSalinity.toFixed(1)), 水温: Number(avgTemp.toFixed(1)) });
      } else {
        data.push({ date, 溶氧: 0, 盐度: 0, 水温: 0 });
      }
    }
    return data;
  }, [waterQuality]);

  const cageStatusData = useMemo(() => {
    const statusCount = cages.reduce((acc, cage) => {
      acc[cage.status] = (acc[cage.status] || 0) + 1;
      return acc;
    }, {} as Record<CageStatus, number>);
    return Object.entries(statusCount).map(([status, value]) => ({ name: statusMap[status as CageStatus], value }));
  }, [cages]);

  const activeTodos = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return todos.slice().sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 6);
  }, [todos]);

  const recentAlerts = useMemo(() => {
    const waterAlerts = waterQuality.filter(w => w.warningLevel !== 'normal').map(w => ({
      id: w.id, type: '水质异常', cageId: w.cageId, time: w.measureTime,
      severity: w.warningLevel, description: `溶解氧${w.dissolvedOxygen}mg/L, 盐度${w.salinity}‰`,
    }));
    const tideAlerts = redTideAlerts.map(a => ({
      id: a.id, type: '赤潮预警', cageId: a.cageId, time: a.alertTime,
      severity: a.severity, description: a.description,
    }));
    return [...tideAlerts, ...waterAlerts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  }, [waterQuality, redTideAlerts]);

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };
  const cardBodyStyle = { padding: '16px 20px' };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0" styles={{ body: { padding: '16px' } }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="水质趋势" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={waterTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="溶氧" stroke={ACCENT_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="盐度" stroke="#1890FF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="水温" stroke="#FA8C16" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="网箱状态分布" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={280}>
              <PieChart>
                <Pie data={cageStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#999' }}>
                  {cageStatusData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {cageStatusData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="待办事项" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '12px 20px' } }}>
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-lg ${todo.status === 'completed' ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}>
                <Checkbox checked={todo.status === 'completed'} onChange={() => toggleTodo(todo.id)} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${todo.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.title}</span>
                    <Tag color={priorityColors[todo.priority]} className="flex-shrink-0">{todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}</Tag>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dayjs(todo.dueDate).format('MM-DD')}</span>
                    <span>{todo.module}</span>
                  </div>
                </div>
                {todo.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </Card>

        <Card title="最近警报" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '12px 20px' } }}>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.severity === 'danger' ? 'text-red-500' : 'text-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag color={severityColors[alert.severity]} className="flex-shrink-0">{alert.type}</Tag>
                    <span className="text-xs text-gray-400">{alert.cageId}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 truncate">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{dayjs(alert.time).format('MM-DD HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
