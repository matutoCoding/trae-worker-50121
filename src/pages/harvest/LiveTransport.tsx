import { useMemo, useState } from 'react';
import { Card, Table, Button, Tag, Form, Modal, Select, Input, InputNumber, Progress, List } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Truck, Thermometer, Droplets, MapPin, Clock, CheckCircle, AlertTriangle, Plus, Package, ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { message } from 'antd';
import { useAppStore } from '@/store';
import type { Transport, TransportStatus } from '@/types';

const PRIMARY_COLOR = '#1677FF';
const ACCENT_COLOR = '#0958D9';
const BLUE_GRADIENT = 'from-blue-500 to-cyan-500';

const statusMap: Record<TransportStatus, { text: string; color: string }> = {
  pending: { text: '待发运', color: 'default' },
  transporting: { text: '运输中', color: 'processing' },
  arrived: { text: '已到达', color: 'success' },
  delayed: { text: '延误', color: 'error' },
};

export default function LiveTransport() {
  const { transports, harvests, getCageById, addTransport } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const stats = useMemo(() => {
    const total = transports.length;
    const onTime = transports.filter(t => t.status === 'arrived').length;
    const onTimeRate = total > 0 ? Number((onTime / total * 100).toFixed(1)) : 0;
    const survivalRate = Number((95 + Math.random() * 4).toFixed(1));
    const avgTime = Number((8 + Math.random() * 4).toFixed(1));

    return { onTimeRate, survivalRate, avgTime, inTransit: transports.filter(t => t.status === 'transporting').length };
  }, [transports]);

  const activeTransports = useMemo(() => {
    return transports
      .filter(t => t.status === 'transporting')
      .map(t => ({
        ...t,
        harvestInfo: harvests.find(h => h.id === t.harvestId),
        estimatedArrival: dayjs(t.departureDate).add(10, 'hour').format('YYYY-MM-DD HH:mm'),
        progress: Math.min(95, dayjs().diff(dayjs(t.departureDate), 'hour') * 10),
      }));
  }, [transports, harvests]);

  const transportRecords = useMemo(() => {
    return [...transports]
      .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())
      .slice(0, 10);
  }, [transports]);

  const routeData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 10; i++) {
      data.push({
        time: `${i * 2}h`,
        temperature: Number((3 + Math.sin(i * 0.5) * 0.5).toFixed(1)),
        oxygenLevel: Number((90 + Math.cos(i * 0.3) * 3).toFixed(1)),
      });
    }
    return data;
  }, []);

  const statCards = [
    { title: '准时率', value: stats.onTimeRate, unit: '%', icon: CheckCircle, gradient: BLUE_GRADIENT, showProgress: true },
    { title: '存活率', value: stats.survivalRate, unit: '%', icon: Droplets, gradient: 'from-cyan-500 to-teal-500', showProgress: true },
    { title: '平均运输时间', value: stats.avgTime, unit: 'h', icon: Clock, gradient: 'from-indigo-500 to-blue-500' },
    { title: '运输中车辆', value: stats.inTransit, unit: '辆', icon: Truck, gradient: 'from-orange-500 to-amber-400' },
  ];

  const columns = [
    { title: '出发时间', dataIndex: 'departureDate', key: 'departureDate', width: 140 },
    { title: '目的地', dataIndex: 'destination', key: 'destination', width: 90 },
    { title: '车辆', dataIndex: 'vehicle', key: 'vehicle', width: 150 },
    { title: '司机', dataIndex: 'driver', key: 'driver', width: 80 },
    { title: '载重量(kg)', dataIndex: 'cargoWeight', key: 'cargoWeight', width: 110 },
    { title: '温度(°C)', dataIndex: 'temperature', key: 'temperature', width: 90, render: (v: number) => <span className={v > 6 ? 'text-red-500' : 'text-green-500'}>{v}°C</span> },
    { title: '含氧量(%)', dataIndex: 'oxygenLevel', key: 'oxygenLevel', width: 100, render: (v: number) => <span className={v < 85 ? 'text-red-500' : 'text-green-500'}>{v}%</span> },
    { title: '到达时间', dataIndex: 'arrivalTime', key: 'arrivalTime', width: 140, render: (v: string) => v || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: TransportStatus) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag> },
  ];

  const mapPoints = [
    { name: '养殖场', status: 'start', x: 50, y: 200 },
    { name: 'A市中转站', status: 'passed', x: 200, y: 150 },
    { name: 'B市服务区', status: 'current', x: 380, y: 180 },
    { name: 'C市检查站', status: 'upcoming', x: 520, y: 140 },
    { name: '目的地市场', status: 'end', x: 680, y: 160 },
  ];

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newTransport: Transport = {
        id: `transport-${Date.now()}`,
        harvestId: values.harvestId,
        departureDate: dayjs().format('YYYY-MM-DD HH:mm'),
        destination: values.destination,
        vehicle: values.vehicle,
        driver: values.driver,
        temperature: values.temperature,
        oxygenLevel: 95,
        cargoWeight: 0,
        route: '',
        status: 'pending' as TransportStatus,
      };
      addTransport(newTransport);
      setIsModalOpen(false);
      message.success('运输记录添加成功');
    });
  };

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link to="/harvest">
            <Button icon={<ArrowLeft size={16} />}>返回收获管理</Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>活鱼运输</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)} style={{ backgroundColor: PRIMARY_COLOR }}>新增运输记录</Button>
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
                  {card.showProgress && <Progress percent={card.value} size="small" showInfo={false} strokeColor={PRIMARY_COLOR} className="mt-2" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={<span className="flex items-center gap-2"><Truck size={18} style={{ color: ACCENT_COLOR }} />运输看板</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2" styles={{ header: cardHeaderStyle, body: { padding: '12px 20px' } }}>
          {activeTransports.length > 0 ? (
            <List
              dataSource={activeTransports}
              renderItem={item => (
                <List.Item key={item.id} className="px-0 py-3 border-b last:border-b-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: PRIMARY_COLOR }}>{item.vehicle}</div>
                          <div className="text-xs text-gray-500">司机: {item.driver}</div>
                        </div>
                      </div>
                      <Tag color={statusMap[item.status].color}>{statusMap[item.status].text}</Tag>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">目的地: {item.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-600">{item.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-600">氧: {item.oxygenLevel}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress percent={item.progress} size="small" strokeColor={PRIMARY_COLOR} className="flex-1" />
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 预计 {item.estimatedArrival}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div className="text-center py-8 text-gray-400">暂无运输中车辆</div>
          )}
        </Card>

        <Card title={<span className="flex items-center gap-2"><MapPin size={18} style={{ color: ACCENT_COLOR }} />运输轨迹</span>} className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <div className="relative h-48 bg-gradient-to-b from-blue-50 to-cyan-50 rounded-lg overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 750 250">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1677FF" />
                  <stop offset="50%" stopColor="#1677FF" />
                  <stop offset="50%" stopColor="#D9D9D9" />
                  <stop offset="100%" stopColor="#D9D9D9" />
                </linearGradient>
              </defs>
              <path d="M 50 200 Q 125 100 200 150 T 380 180 T 520 140 T 680 160" fill="none" stroke="url(#routeGradient)" strokeWidth="4" strokeDasharray="8 4" />
              {mapPoints.map((point, idx) => (
                <g key={idx}>
                  <circle cx={point.x} cy={point.y} r={point.status === 'current' ? 12 : 8} fill={point.status === 'start' || point.status === 'passed' ? '#52C41A' : point.status === 'current' ? '#1677FF' : '#D9D9D9'} />
                  {point.status === 'current' && <circle cx={point.x} cy={point.y} r={18} fill="none" stroke="#1677FF" strokeWidth="2" opacity="0.5"><animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" /></circle>}
                  <text x={point.x} y={point.y + 28} textAnchor="middle" fontSize="11" fill="#666">{point.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={<span className="flex items-center gap-2"><Activity size={18} style={{ color: ACCENT_COLOR }} />运输环境监测</span>} className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" unit=" °C" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" unit=" %" domain={[80, 100]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#FA8C16" strokeWidth={2} dot={{ r: 3 }} name="温度" />
              <Line yAxisId="right" type="monotone" dataKey="oxygenLevel" stroke={PRIMARY_COLOR} strokeWidth={2} dot={{ r: 3 }} name="含氧量" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={<span className="flex items-center gap-2"><Package size={18} style={{ color: ACCENT_COLOR }} />运输记录</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <Table rowKey="id" columns={columns} dataSource={transportRecords} pagination={false} size="small" scroll={{ x: 1000, y: 280 }} />
        </Card>
      </div>

      <Modal title="新增运输记录" open={isModalOpen} onOk={handleSubmit} onCancel={() => setIsModalOpen(false)} okText="确认提交" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item label="关联收获记录" name="harvestId" rules={[{ required: true, message: '请选择收获记录' }]}>
            <Select placeholder="请选择收获记录">
              {harvests.slice(0, 10).map(h => <Select.Option key={h.id} value={h.id}>#{h.id} - {getCageById(h.cageId)?.name || h.cageId} - {h.weight}kg</Select.Option>)}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="目的地" name="destination" rules={[{ required: true, message: '请输入目的地' }]}>
              <Input placeholder="如：上海水产市场" />
            </Form.Item>
            <Form.Item label="车辆" name="vehicle" rules={[{ required: true, message: '请输入车辆信息' }]}>
              <Input placeholder="如：沪A·12345冷藏车" />
            </Form.Item>
            <Form.Item label="司机" name="driver" rules={[{ required: true, message: '请输入司机姓名' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="预计温度(°C)" name="temperature" rules={[{ required: true, message: '请输入预计温度' }]}>
              <InputNumber className="w-full" min={0} max={10} step={0.5} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
