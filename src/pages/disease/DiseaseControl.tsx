import { useMemo } from 'react';
import { Card, Table, Tag, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Bug, Activity, Stethoscope, Search, Waves, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { DiseaseRecord } from '@/types';

const statusMap: Record<string, { text: string; color: string }> = {
  diagnosed: { text: '已确诊', color: 'blue' },
  treating: { text: '治疗中', color: 'orange' },
  recovered: { text: '已治愈', color: 'green' },
  dead: { text: '死亡', color: 'red' },
};

export default function DiseaseControl() {
  const { diseaseRecords, cages } = useAppStore();

  const stats = useMemo(() => {
    const total = diseaseRecords.length;
    const treating = diseaseRecords.filter(d => d.status === 'treating').length;
    const recovered = diseaseRecords.filter(d => d.status === 'recovered').length;
    const thisMonth = diseaseRecords.filter(d => dayjs(d.foundDate).isSame(dayjs(), 'month')).length;
    const activeCages = cages.filter(c => c.status === 'normal').length;
    const incidenceRate = activeCages > 0 ? ((thisMonth / activeCages) * 100).toFixed(1) : '0';
    return { total, treating, recovered, incidenceRate };
  }, [diseaseRecords, cages]);

  const trendData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const count = diseaseRecords.filter(d => dayjs(d.foundDate).isSame(date, 'day')).length;
      data.push({ date: date.format('MM-DD'), 发病数: count });
    }
    return data;
  }, [diseaseRecords]);

  const medicineData = useMemo(() => {
    const map: Record<string, number> = {};
    diseaseRecords.forEach(d => { map[d.medicine] = (map[d.medicine] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, 使用次数: count }));
  }, [diseaseRecords]);

  const quickEntries = [
    { title: '鱼病诊断', icon: Stethoscope, path: '/disease/diagnosis', color: 'from-blue-500 to-cyan-400' },
    { title: '潜水巡查', icon: Waves, path: '/disease/diving', color: 'from-teal-500 to-green-400' },
    { title: '网衣破损检查', icon: Search, path: '/disease/net-check', color: 'from-orange-500 to-amber-400' },
  ];

  const columns = [
    { title: '日期', dataIndex: 'foundDate', width: 100 },
    { title: '网箱', dataIndex: 'cageId', render: (id: string) => cages.find(c => c.id === id)?.name || id },
    { title: '诊断', dataIndex: 'diagnosis' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '兽医', dataIndex: 'veterinarian' },
  ];

  const statCards = [
    { title: '当前病害数', value: stats.total, icon: Bug, color: '#EF4444', gradient: 'from-red-500 to-rose-400' },
    { title: '治疗中', value: stats.treating, icon: Activity, color: '#F59E0B', gradient: 'from-orange-500 to-amber-400' },
    { title: '已治愈', value: stats.recovered, icon: CheckCircle, color: '#10B981', gradient: 'from-green-500 to-emerald-400' },
    { title: '本月发生率', value: `${stats.incidenceRate}%`, icon: AlertCircle, color: '#6366F1', gradient: 'from-indigo-500 to-purple-400' },
  ];

  const cardStyle = { header: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }, body: { padding: '16px 20px' } };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <div className="relative p-4">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center opacity-90`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickEntries.map((entry, idx) => {
          const Icon = entry.icon;
          return (
            <Link key={idx} to={entry.path}>
              <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-0 cursor-pointer h-full">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{entry.title}</h3>
                    <p className="text-sm text-gray-500">点击进入</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="病害趋势图（最近30天）" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div className="bg-gray-900 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 11 }} stroke="#555" />
                  <YAxis tick={{ fill: '#999', fontSize: 11 }} stroke="#555" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="发病数" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="用药统计" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div className="bg-gray-900 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={medicineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 10 }} stroke="#555" />
                  <YAxis tick={{ fill: '#999', fontSize: 11 }} stroke="#555" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="使用次数" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="最近病害记录" className="rounded-xl shadow-sm border-0" styles={cardStyle} extra={<Link to="/disease/diagnosis" className="text-blue-500 hover:text-blue-600 text-sm">查看全部</Link>}>
        <Table<DiseaseRecord>
          dataSource={diseaseRecords.slice(0, 5)}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
