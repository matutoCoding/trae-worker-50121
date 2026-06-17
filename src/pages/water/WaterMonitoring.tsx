import { useState, useMemo } from 'react';
import { Card, Select, Button, Tag, Modal, Form, Slider, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, Thermometer, AlertTriangle, Activity, Waves, Settings } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { WaterQuality, WarningLevel } from '@/types';

const { Option } = Select;

const statusColors: Record<WarningLevel, { border: string; bg: string; text: string }> = {
  normal: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600' },
  warning: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  danger: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600' },
};

const statusText: Record<WarningLevel, string> = { normal: '正常', warning: '警告', danger: '危险' };

const paramConfig = {
  dissolvedOxygen: { name: '溶氧', unit: 'mg/L', min: 0, max: 15, color: '#20B2AA' },
  salinity: { name: '盐度', unit: '‰', min: 0, max: 40, color: '#1890FF' },
  temperature: { name: '水温', unit: '°C', min: 0, max: 35, color: '#FA8C16' },
  phValue: { name: 'pH值', unit: '', min: 0, max: 14, color: '#722ED1' },
  ammoniaNitrogen: { name: '氨氮', unit: 'mg/L', min: 0, max: 0.2, color: '#EB2F96' },
};

export default function WaterMonitoring() {
  const { waterQuality, cages, getLatestWaterQuality } = useAppStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedParam, setSelectedParam] = useState<keyof typeof paramConfig>('dissolvedOxygen');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const activeCages = useMemo(() => cages.filter(c => c.status === 'normal'), [cages]);

  const avgStats = useMemo(() => {
    const latestData = activeCages.map(c => getLatestWaterQuality(c.id)).filter(Boolean) as WaterQuality[];
    if (latestData.length === 0) return { dissolvedOxygen: 0, salinity: 0, temperature: 0, phValue: 0 };
    return {
      dissolvedOxygen: Number((latestData.reduce((s, d) => s + d.dissolvedOxygen, 0) / latestData.length).toFixed(2)),
      salinity: Number((latestData.reduce((s, d) => s + d.salinity, 0) / latestData.length).toFixed(2)),
      temperature: Number((latestData.reduce((s, d) => s + d.temperature, 0) / latestData.length).toFixed(1)),
      phValue: Number((latestData.reduce((s, d) => s + d.phValue, 0) / latestData.length).toFixed(2)),
    };
  }, [activeCages, getLatestWaterQuality]);

  const trendData = useMemo(() => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const step = timeRange === '24h' ? 1 : timeRange === '7d' ? 4 : 24;
    const data: { time: string; [key: string]: string | number }[] = [];
    for (let i = hours; i >= 0; i -= step) {
      const time = dayjs().subtract(i, 'hour');
      const startTime = time.subtract(step / 2, 'hour');
      const endTime = time.add(step / 2, 'hour');
      const periodData = waterQuality.filter(w => {
        const t = dayjs(w.measureTime);
        return t.isAfter(startTime) && t.isBefore(endTime);
      });
      if (periodData.length > 0) {
        const timeLabel = timeRange === '24h' ? time.format('HH:mm') : time.format('MM-DD');
        const record: { time: string; [key: string]: string | number } = { time: timeLabel };
        Object.keys(paramConfig).forEach(key => {
          const k = key as keyof typeof paramConfig;
          const avg = periodData.reduce((s, d) => s + (d[k] as number), 0) / periodData.length;
          record[paramConfig[k].name] = Number(avg.toFixed(2));
        });
        data.push(record);
      }
    }
    return data;
  }, [waterQuality, timeRange]);

  const activeAlerts = useMemo(() => {
    return activeCages
      .map(c => ({ cage: c, water: getLatestWaterQuality(c.id) }))
      .filter(({ water }) => water && water.warningLevel !== 'normal')
      .map(({ cage, water }) => ({ ...water!, cageName: cage.name }))
      .sort((a, b) => {
        const order = { danger: 0, warning: 1 };
        return order[a.warningLevel] - order[b.warningLevel];
      });
  }, [activeCages, getLatestWaterQuality]);

  const statCards = [
    { title: '平均溶氧', value: avgStats.dissolvedOxygen, unit: 'mg/L', icon: Droplets, gradient: 'from-teal-500 to-cyan-400', color: '#20B2AA' },
    { title: '平均盐度', value: avgStats.salinity, unit: '‰', icon: Waves, gradient: 'from-blue-500 to-indigo-400', color: '#1890FF' },
    { title: '平均水温', value: avgStats.temperature, unit: '°C', icon: Thermometer, gradient: 'from-orange-500 to-amber-400', color: '#FA8C16' },
    { title: '平均pH值', value: avgStats.phValue, unit: '', icon: Activity, gradient: 'from-purple-500 to-pink-400', color: '#722ED1' },
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
                    <p className="text-3xl font-bold" style={{ color: card.color }}>
                      {card.value}<span className="text-lg font-normal text-gray-400 ml-1">{card.unit}</span>
                    </p>
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

      <Card
        title="网箱水质状态总览"
        className="rounded-xl shadow-sm border-0"
        styles={cardStyle}
        extra={<Button type="primary" icon={<Settings size={16} />} onClick={() => setModalVisible(true)} size="small">阈值配置</Button>}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {activeCages.map(cage => {
            const water = getLatestWaterQuality(cage.id);
            if (!water) return null;
            const colors = statusColors[water.warningLevel];
            const isDanger = water.warningLevel === 'danger';
            return (
              <div
                key={cage.id}
                className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all duration-300 hover:shadow-md ${isDanger ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 truncate">{cage.name}</span>
                  <Tag color={water.warningLevel === 'normal' ? 'success' : water.warningLevel === 'warning' ? 'warning' : 'error'}>
                    {statusText[water.warningLevel]}
                  </Tag>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">溶氧</span>
                    <span className="font-medium">{water.dissolvedOxygen} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">水温</span>
                    <span className="font-medium">{water.temperature}°C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="多维度趋势图表"
        className="rounded-xl shadow-sm border-0"
        styles={cardStyle}
        extra={
          <div className="flex gap-2">
            <Select value={selectedParam} onChange={setSelectedParam} size="small" style={{ width: 120 }}>
              {Object.entries(paramConfig).map(([key, cfg]) => (<Option key={key} value={key}>{cfg.name}</Option>))}
            </Select>
            <Select value={timeRange} onChange={setTimeRange} size="small" style={{ width: 120 }}>
              <Option value="24h">24小时</Option>
              <Option value="7d">7天</Option>
              <Option value="30d">30天</Option>
            </Select>
          </div>
        }
      >
        <div className="bg-gray-900 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={paramConfig[selectedParam].color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={paramConfig[selectedParam].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" tick={{ fill: '#999', fontSize: 12 }} stroke="#555" />
              <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#555" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Area
                type="monotone"
                dataKey={paramConfig[selectedParam].name}
                stroke={paramConfig[selectedParam].color}
                strokeWidth={2}
                fill="url(#colorGrad)"
                dot={{ r: 3, fill: paramConfig[selectedParam].color }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="多参数对比趋势" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div className="bg-gray-900 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" tick={{ fill: '#999', fontSize: 12 }} stroke="#555" />
                  <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#555" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  {Object.entries(paramConfig).map(([key, cfg]) => (
                    <Line key={key} type="monotone" dataKey={cfg.name} stroke={cfg.color} strokeWidth={1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="当前活跃警报" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mb-2 opacity-50" />
                <p>暂无活跃警报</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${statusColors[alert.warningLevel].border} ${statusColors[alert.warningLevel].bg} ${alert.warningLevel === 'danger' ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${statusColors[alert.warningLevel].text}`} />
                      <span className="font-medium text-gray-800">{alert.cageName}</span>
                      <Tag color={alert.warningLevel === 'warning' ? 'warning' : 'error'}>
                        {statusText[alert.warningLevel]}
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-600">
                      溶氧 {alert.dissolvedOxygen}mg/L · 盐度 {alert.salinity}‰ · 水温 {alert.temperature}°C
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{dayjs(alert.measureTime).format('MM-DD HH:mm')}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="水质参数阈值配置"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => { form.submit(); setModalVisible(false); }}
        okText="保存配置"
      >
        <Form form={form} layout="vertical">
          {Object.entries(paramConfig).map(([key, cfg]) => (
            <div key={key} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="font-medium" style={{ color: cfg.color }}>{cfg.name}</span>
                <span className="text-sm text-gray-500">正常范围: 5-10{cfg.unit}</span>
              </div>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="下限" name={`${key}Min`} initialValue={5}>
                    <Slider min={cfg.min} max={cfg.max} step={0.1} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="上限" name={`${key}Max`} initialValue={10}>
                    <Slider min={cfg.min} max={cfg.max} step={0.1} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
