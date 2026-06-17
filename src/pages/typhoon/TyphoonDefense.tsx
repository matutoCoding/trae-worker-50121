import { useMemo } from 'react';
import { Card, Table, Progress, Tag, Button, Alert, Space, Statistic, Row, Col } from 'antd';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudLightning, AlertTriangle, Shield, MapPin, Navigation, Wind, Waves, Package, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { Typhoon, Reinforcement, CageTransfer, TyphoonLevel, WarningLevel } from '@/types';
import 'leaflet/dist/leaflet.css';

const typhoonLevelText: Record<TyphoonLevel, string> = {
  tropical_depression: '热带低压',
  tropical_storm: '热带风暴',
  severe_tropical_storm: '强热带风暴',
  typhoon: '台风',
  severe_typhoon: '强台风',
  super_typhoon: '超强台风',
};

const typhoonLevelColor: Record<TyphoonLevel, string> = {
  tropical_depression: 'blue',
  tropical_storm: 'blue',
  severe_tropical_storm: 'yellow',
  typhoon: 'orange',
  severe_typhoon: 'orange',
  super_typhoon: 'red',
};

const warningLevelConfig: Record<WarningLevel, { bg: string; text: string; tag: string }> = {
  normal: { bg: 'bg-blue-50', text: 'text-blue-600', tag: 'blue' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-600', tag: 'warning' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', tag: 'error' },
};

const warningLevelText: Record<WarningLevel, string> = {
  normal: '蓝色预警',
  warning: '橙色预警',
  danger: '红色预警',
};

const statusColors: Record<string, string> = {
  completed: 'success',
  in_progress: 'processing',
  pending: 'default',
};

const statusText: Record<string, string> = {
  completed: '已完成',
  in_progress: '进行中',
  pending: '待处理',
};

const pathPoints: [number, number][] = [
  [15.0, 132.0],
  [20.0, 128.0],
  [25.0, 124.0],
  [28.0, 121.0],
  [30.0, 118.0],
  [31.0, 121.0],
  [30.5, 122.5],
];

export default function TyphoonDefense() {
  const { typhoons, reinforcements, cageTransfers, cages, getCageById } = useAppStore();

  const activeTyphoons = useMemo(() => {
    return typhoons
      .filter(t => dayjs(t.landfallTime).isAfter(dayjs()))
      .sort((a, b) => {
        const order = { danger: 0, warning: 1, normal: 2 };
        return order[a.warningLevel] - order[b.warningLevel];
      });
  }, [typhoons]);

  const reinforcementStats = useMemo(() => {
    const total = cages.length;
    const completed = reinforcements.filter(r => r.status === 'completed').length;
    const inProgress = reinforcements.filter(r => r.status === 'in_progress').length;
    const pending = total - completed - inProgress;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, progress };
  }, [cages, reinforcements]);

  const transferStats = useMemo(() => {
    const total = cageTransfers.length;
    const completed = cageTransfers.filter(t => t.status === 'completed').length;
    const inProgress = cageTransfers.filter(t => t.status === 'in_progress').length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, pending };
  }, [cageTransfers]);

  const pathTrendData = useMemo(() => {
    return pathPoints.map((p, i) => ({
      time: dayjs().add(i * 6, 'hour').format('MM-DD HH:mm'),
      wind: 80 + i * 15,
      lat: p[0],
      lon: p[1],
    }));
  }, []);

  const reinforcementColumns = [
    { title: '网箱', dataIndex: 'cageId', key: 'cageId', render: (id: string) => getCageById(id)?.name || '-' },
    { title: '加固日期', dataIndex: 'reinforcementDate', key: 'reinforcementDate' },
    { title: '措施', dataIndex: 'measures', key: 'measures', render: (m: string[]) => m.slice(0, 2).join('、') + (m.length > 2 ? '...' : '') },
    { title: '操作人员', dataIndex: 'operator', key: 'operator' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusText[s]}</Tag> },
  ];

  const transferColumns = [
    { title: '网箱', dataIndex: 'cageId', key: 'cageId', render: (id: string) => getCageById(id)?.name || '-' },
    { title: '源位置', dataIndex: 'sourceLocation', key: 'sourceLocation' },
    { title: '目标位置', dataIndex: 'targetLocation', key: 'targetLocation' },
    { title: '转移日期', dataIndex: 'transferDate', key: 'transferDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusText[s]}</Tag> },
  ];

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };
  const cardBodyStyle = { padding: '16px 20px' };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm border-0 col-span-2" styles={{ body: { padding: 0 } }}>
          {activeTyphoons.length > 0 && (
            <>
              {(() => {
                const borderColor = activeTyphoons[0].warningLevel === 'danger'
                  ? 'border-red-500'
                  : activeTyphoons[0].warningLevel === 'warning'
                    ? 'border-yellow-500'
                    : 'border-blue-500';
                return (
                  <div className={`p-6 rounded-t-xl ${warningLevelConfig[activeTyphoons[0].warningLevel].bg} border-l-4 ${borderColor}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
                          <CloudLightning className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">当前台风预警</p>
                          <p className="text-3xl font-bold text-red-600">{activeTyphoons[0].name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            <Tag color={typhoonLevelColor[activeTyphoons[0].level]}>{typhoonLevelText[activeTyphoons[0].level]}</Tag>
                            <Tag color={warningLevelConfig[activeTyphoons[0].warningLevel].tag} className="ml-2">{warningLevelText[activeTyphoons[0].warningLevel]}</Tag>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">预计登陆时间</p>
                        <p className="text-xl font-bold text-gray-800">{dayjs(activeTyphoons[0].landfallTime).format('YYYY-MM-DD HH:mm')}</p>
                        <p className="text-sm text-gray-500 mt-1">距现在 {dayjs(activeTyphoons[0].landfallTime).diff(dayjs(), 'day')} 天后</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{activeTyphoons[0]?.expectedWindSpeed || 0} km/h</p>
              <p className="text-sm text-gray-500">预计风速</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{activeTyphoons[0]?.expectedRainfall || 0} mm</p>
              <p className="text-sm text-gray-500">预计降雨量</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{activeTyphoons.length}</p>
              <p className="text-sm text-gray-500">活跃台风</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl shadow-sm border-0" styles={{ body: cardBodyStyle }}>
          <h3 className="font-semibold text-gray-800 mb-3">快捷操作</h3>
          <div className="space-y-2">
            <Button type="primary" block icon={<AlertTriangle size={16} />} danger>一键发布预警</Button>
            <Button block icon={<Shield size={16} />}>生成加固任务</Button>
            <Link to="/typhoon/emergency">
              <Button block icon={<Navigation size={16} />}>查看应急预案</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="台风路径示意图" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <MapContainer center={[25, 125]} zoom={4} style={{ height: 300, borderRadius: '12px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={pathPoints} color="#ef4444" weight={4} opacity={0.8} dashArray="10,10">
              <Popup>台风移动路径</Popup>
            </Polyline>
            {pathPoints.map((p, i) => (
              <Marker key={i} position={p}>
                <Popup>
                  <p className="font-semibold">预测位置 {i + 1}</p>
                  <p>时间: {dayjs().add(i * 6, 'hour').format('MM-DD HH:mm')}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>
        <Card title="风力趋势预测" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pathTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="wind" name="风速(km/h)" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="rounded-xl shadow-sm border-0" styles={{ body: cardBodyStyle }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-800">加固进度统计</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Statistic title="总需加固" value={reinforcementStats.total} />
              <Statistic title="已完成" value={reinforcementStats.completed} valueStyle={{ color: '#52c41a' }} />
              <Statistic title="进行中" value={reinforcementStats.inProgress} valueStyle={{ color: '#1890ff' }} />
              <Statistic title="待处理" value={reinforcementStats.pending} valueStyle={{ color: '#faad14' }} />
            </div>
            <Progress percent={reinforcementStats.progress} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} size="small" />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="rounded-xl shadow-sm border-0" styles={{ body: cardBodyStyle }}>
            <div className="flex items-center gap-3 mb-4">
              <Navigation className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-gray-800">转移调度统计</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Statistic title="需转移网箱" value={transferStats.total} />
              <Statistic title="已转移" value={transferStats.completed} valueStyle={{ color: '#52c41a' }} />
              <Statistic title="转移中" value={transferStats.inProgress} valueStyle={{ color: '#1890ff' }} />
              <Statistic title="待转移" value={transferStats.pending} valueStyle={{ color: '#faad14' }} />
            </div>
            <Progress percent={transferStats.total > 0 ? Math.round((transferStats.completed / transferStats.total) * 100) : 0} strokeColor={{ '0%': '#fa8c16', '100%': '#52c41a' }} size="small" />
          </Card>
        </Col>
      </Row>

      {activeTyphoons.length > 1 && (
        <Alert
          message={`还有 ${activeTyphoons.length - 1} 个台风正在监测中`}
          description={activeTyphoons.slice(1).map((t: Typhoon) => `${t.name} - ${typhoonLevelText[t.level]}`).join('、')}
          type="warning"
          showIcon
          className="rounded-xl"
        />
      )}

      <Card title="加固记录" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
        <Table dataSource={reinforcements} columns={reinforcementColumns} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
      </Card>

      <Card title="转移记录" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
        <Table dataSource={cageTransfers} columns={transferColumns} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
}
