import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Tabs, Progress, Space, Alert, List } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldAlert, AlertTriangle, Waves, Activity, Clock, MapPin, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { RedTideAlert, WarningLevel } from '@/types';

const { TabPane } = Tabs;

const severityColors: Record<WarningLevel, { bg: string; border: string; text: string; tag: string }> = {
  normal: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', tag: 'success' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-600', tag: 'warning' },
  danger: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', tag: 'error' },
};

const severityText: Record<WarningLevel, string> = {
  normal: '低风险',
  warning: '中等风险',
  danger: '高风险',
};

const emergencySteps = [
  { step: 1, title: '启动应急预案', desc: '通知相关人员，启动应急响应', icon: AlertTriangle },
  { step: 2, title: '加强监测频率', desc: '提升至每1小时监测一次', icon: Activity },
  { step: 3, title: '水质调控措施', desc: '开启增氧设备，投放改良剂', icon: Waves },
  { step: 4, title: '减少投喂量', desc: '减少或暂停投喂', icon: Activity },
  { step: 5, title: '鱼苗转移准备', desc: '评估可行性，准备运输设备', icon: MapPin },
  { step: 6, title: '持续跟踪评估', desc: '关注趋势，调整策略', icon: CheckCircle },
];

export default function RedTideAlerts() {
  const { redTideAlerts, getCageById, waterQuality } = useAppStore();
  const [activeTab, setActiveTab] = useState('active');

  const activeAlerts = useMemo(() => {
    return redTideAlerts
      .filter(a => a.status === 'active')
      .map(a => ({ ...a, cage: getCageById(a.cageId) }))
      .sort((a, b) => {
        const order = { danger: 0, warning: 1, normal: 2 };
        return order[a.severity] - order[b.severity];
      });
  }, [redTideAlerts, getCageById]);

  const historicalAlerts = useMemo(() => {
    return redTideAlerts
      .filter(a => a.status === 'resolved')
      .map(a => ({ ...a, cage: getCageById(a.cageId) }))
      .sort((a, b) => new Date(b.alertTime).getTime() - new Date(a.alertTime).getTime());
  }, [redTideAlerts, getCageById]);

  const riskTrendData = useMemo(() => {
    const data: { date: string; riskIndex: number; alertCount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayStart = date.startOf('day');
      const dayEnd = date.endOf('day');
      
      const dayWater = waterQuality.filter(w => {
        const t = dayjs(w.measureTime);
        return t.isAfter(dayStart) && t.isBefore(dayEnd);
      });
      
      let riskIndex = 30;
      if (dayWater.length > 0) {
        const dangerCount = dayWater.filter(w => w.warningLevel === 'danger').length;
        const warningCount = dayWater.filter(w => w.warningLevel === 'warning').length;
        riskIndex = Math.min(100, 30 + dangerCount * 15 + warningCount * 5);
      }
      
      const dayAlerts = redTideAlerts.filter(a => {
        const t = dayjs(a.alertTime);
        return t.isAfter(dayStart) && t.isBefore(dayEnd);
      }).length;
      
      data.push({
        date: date.format('MM-DD'),
        riskIndex: Number(riskIndex.toFixed(0)),
        alertCount: dayAlerts,
      });
    }
    return data;
  }, [waterQuality, redTideAlerts]);

  const overallRisk = useMemo(() => {
    if (activeAlerts.some(a => a.severity === 'danger')) return { level: 'danger' as WarningLevel, score: 85 };
    if (activeAlerts.some(a => a.severity === 'warning')) return { level: 'warning' as WarningLevel, score: 55 };
    return { level: 'normal' as WarningLevel, score: 25 };
  }, [activeAlerts]);

  const tableColumns = [
    { title: '预警时间', dataIndex: 'alertTime', key: 'alertTime', render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    { title: '严重程度', dataIndex: 'severity', key: 'severity', render: (s: WarningLevel) => <Tag color={severityColors[s].tag}>{severityText[s]}</Tag> },
    { title: '影响范围', dataIndex: 'cage', key: 'cage', render: (c: ReturnType<typeof getCageById>) => c?.name || '-' },
    { title: '持续时间', key: 'duration', render: (_: unknown, r: RedTideAlert) => {
      const h = dayjs().diff(dayjs(r.alertTime), 'hour');
      return h < 24 ? `${h}小时` : `${Math.floor(h / 24)}天${h % 24}小时`;
    }},
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'processing' : 'success'}>{s === 'active' ? '处理中' : '已解除'}</Tag> },
    { title: '处理措施', dataIndex: 'measures', key: 'measures', render: (m: string[]) => <span className="text-gray-600">{m.slice(0, 2).join('、')}{m.length > 2 ? '...' : ''}</span> },
  ];

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };
  const cardBodyStyle = { padding: '16px 20px' };
  const getRiskColor = (s: number) => s >= 70 ? '#FF4D4F' : s >= 40 ? '#FAAD14' : '#52C41A';

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm border-0 col-span-2" styles={{ body: { padding: 0 } }}>
          <div className={`p-6 rounded-t-xl ${severityColors[overallRisk.level].bg} border-l-4 ${severityColors[overallRisk.level].border} ${overallRisk.level === 'danger' ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${overallRisk.level === 'danger' ? 'from-red-500 to-orange-500' : overallRisk.level === 'warning' ? 'from-yellow-500 to-orange-400' : 'from-green-500 to-emerald-400'} flex items-center justify-center`}>
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">当前赤潮风险等级</p>
                  <p className={`text-3xl font-bold ${severityColors[overallRisk.level].text}`}>{severityText[overallRisk.level]}</p>
                  <p className="text-sm text-gray-500 mt-1">活跃预警 {activeAlerts.length} 条 · 影响 {new Set(activeAlerts.map(a => a.cageId)).size} 个网箱</p>
                </div>
              </div>
              <div className="w-24 h-24">
                <Progress type="dashboard" percent={overallRisk.score} strokeColor={getRiskColor(overallRisk.score)} format={(p) => <span className="text-xl font-bold">{p}</span>} />
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="text-center"><p className="text-2xl font-bold text-red-500">{activeAlerts.filter(a => a.severity === 'danger').length}</p><p className="text-sm text-gray-500">高风险</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-yellow-500">{activeAlerts.filter(a => a.severity === 'warning').length}</p><p className="text-sm text-gray-500">中风险</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-500">{historicalAlerts.length}</p><p className="text-sm text-gray-500">已处理</p></div>
          </div>
        </Card>
        <Card className="rounded-xl shadow-sm border-0" styles={{ body: cardBodyStyle }}>
          <h3 className="font-semibold text-gray-800 mb-3">快速操作</h3>
          <div className="space-y-2">
            <Button type="primary" block icon={<AlertTriangle size={16} />} danger>发布紧急预警</Button>
            <Button block icon={<Activity size={16} />}>查看监测报告</Button>
            <Button block icon={<Waves size={16} />}>水质应急调控</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeAlerts.length > 0 && (
            <Card title="活跃预警信息" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
              <div className="space-y-4">
                {activeAlerts.map(alert => {
                  const colors = severityColors[alert.severity];
                  const isDanger = alert.severity === 'danger';
                  return (
                    <div key={alert.id} className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} ${isDanger ? 'animate-pulse' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-6 h-6 ${colors.text}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{alert.cage?.name}</span>
                              <Tag color={colors.tag}>{severityText[alert.severity]}</Tag>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Clock size={12} />{dayjs(alert.alertTime).format('YYYY-MM-DD HH:mm')} 发布</p>
                          </div>
                        </div>
                        <Button size="small" type="primary">处理</Button>
                      </div>
                      <Alert message={alert.description} type={alert.severity === 'danger' ? 'error' : 'warning'} showIcon className="mb-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">应对措施：</p>
                        <Space wrap>{alert.measures.map((m, idx) => <Tag key={idx} color="blue">{m}</Tag>)}</Space>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card title="赤潮风险趋势" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
            <div className="bg-gray-900 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D4F" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF4D4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 12 }} stroke="#555" />
                  <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#555" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="riskIndex" name="风险指数" stroke="#FF4D4F" strokeWidth={2} fill="url(#riskGrad)" dot={{ r: 2, fill: '#FF4D4F' }} />
                  <Line type="monotone" dataKey="alertCount" name="预警次数" stroke="#1890FF" strokeWidth={2} dot={{ r: 3, fill: '#1890FF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="预警历史记录" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
              <TabPane tab="全部记录" key="all"><Table dataSource={[...activeAlerts, ...historicalAlerts]} columns={tableColumns} rowKey="id" size="small" pagination={{ pageSize: 5 }} /></TabPane>
              <TabPane tab="活跃预警" key="active"><Table dataSource={activeAlerts} columns={tableColumns} rowKey="id" size="small" pagination={{ pageSize: 5 }} /></TabPane>
              <TabPane tab="历史记录" key="history"><Table dataSource={historicalAlerts} columns={tableColumns} rowKey="id" size="small" pagination={{ pageSize: 5 }} /></TabPane>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="应急预案指南" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
            <Alert message="标准操作流程（SOP）" description="发现赤潮风险时请按以下步骤执行" type="info" showIcon className="mb-4" />
            <List
              dataSource={emergencySteps}
              renderItem={(item) => {
                const Icon = item.icon;
                return (
                  <List.Item className="p-0 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><Icon size={16} className="text-blue-500" /><span className="font-medium text-gray-800">{item.title}</span></div>
                        <p className="text-sm text-gray-500 mt-1 ml-6">{item.desc}</p>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>

          <Card title="预防措施" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
            <div className="space-y-2">
              {['定期监测水质参数，建立预警机制', '控制投喂量，避免残饵污染', '保持合理养殖密度', '定期使用微生态制剂', '加强日常巡检，关注水色变化', '备足应急物资'].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
