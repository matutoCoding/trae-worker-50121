import { useMemo } from 'react';
import { Card, Steps, Tag, Button, Alert, List, Avatar, Timeline, Statistic, Row, Col, Progress, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudLightning, AlertTriangle, Shield, MapPin, Users, Phone, Package, Clock, Navigation, Wind, Waves, CheckCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { WarningLevel } from '@/types';

const { Step } = Steps;

const warningLevelConfig: Record<WarningLevel, { bg: string; border: string; text: string; tag: string; icon: string }> = {
  normal: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', tag: 'blue', icon: '🔵' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', tag: 'orange', icon: '🟠' },
  danger: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', tag: 'error', icon: '🔴' },
};

const emergencyPlans = [
  {
    level: 'normal' as WarningLevel,
    title: '蓝色预警响应',
    windSpeed: '6-7级',
    measures: ['密切关注台风动态', '检查通讯设备', '通知养殖人员做好准备', '清点应急物资'],
    color: 'blue',
  },
  {
    level: 'warning' as WarningLevel,
    title: '橙色预警响应',
    windSpeed: '8-10级',
    measures: ['停止海上作业', '人员撤离至安全区域', '加固养殖设施', '网箱转移至避风港', '启动24小时值班'],
    color: 'orange',
  },
  {
    level: 'danger' as WarningLevel,
    title: '红色预警响应',
    windSpeed: '11级以上',
    measures: ['所有人员立即撤离', '切断非必要电源', '关闭所有作业设备', '启动应急避难场所', '联系海事部门待命'],
    color: 'red',
  },
];

const emergencyMaterials = [
  { name: '浮球', spec: 'φ30cm', total: 500, used: 120, unit: '个', icon: Waves },
  { name: '绳索', spec: 'φ16mm', total: 2000, used: 800, unit: '米', icon: Navigation },
  { name: '锚链', spec: 'φ12mm', total: 1000, used: 300, unit: '米', icon: Shield },
  { name: '救生设备', spec: '救生衣/救生圈', total: 100, used: 0, unit: '套', icon: Users },
  { name: '通讯设备', spec: '对讲机/卫星电话', total: 20, used: 5, unit: '台', icon: Phone },
  { name: '应急照明', spec: '手电筒/头灯', total: 50, used: 10, unit: '个', icon: CloudLightning },
];

const emergencyContacts = [
  { name: '张主管', role: '养殖主管', phone: '138****1234', avatar: '张' },
  { name: '李安全员', role: '安全员', phone: '139****5678', avatar: '李' },
  { name: '王气象员', role: '气象联络员', phone: '137****9012', avatar: '王' },
  { name: '海事部门', role: '海事救援', phone: '12395', avatar: '海' },
  { name: '医疗急救', role: '急救中心', phone: '120', avatar: '医' },
  { name: '边防派出所', role: '边防报警', phone: '110', avatar: '警' },
];

const responseSteps = [
  { title: '预警接收', desc: '接收到气象部门台风预警信息', icon: AlertCircle },
  { title: '研判分析', desc: '分析台风路径、强度和影响范围', icon: Wind },
  { title: '预案启动', desc: '根据预警等级启动相应应急预案', icon: AlertTriangle },
  { title: '任务部署', desc: '分配加固、转移、人员撤离任务', icon: Users },
  { title: '执行实施', desc: '现场执行各项防御措施', icon: Shield },
  { title: '应急响应', desc: '台风期间24小时监控和应急处置', icon: Clock },
  { title: '灾后评估', desc: '台风过后损失评估和恢复生产', icon: CheckCircle },
];

const historyData = [
  { year: '2023', name: '台风"杜苏芮"', damage: 85, loss: 120, cagesAffected: 15 },
  { year: '2022', name: '台风"梅花"', damage: 45, loss: 65, cagesAffected: 8 },
  { year: '2021', name: '台风"烟花"', damage: 60, loss: 80, cagesAffected: 12 },
  { year: '2020', name: '台风"黑格比"', damage: 30, loss: 40, cagesAffected: 5 },
  { year: '2019', name: '台风"利奇马"', damage: 90, loss: 150, cagesAffected: 20 },
];

export default function EmergencyPlan() {
  const { typhoons, cages } = useAppStore();

  const historicalTyphoons = useMemo(() => {
    return typhoons.filter(t => dayjs(t.landfallTime).isBefore(dayjs()));
  }, [typhoons]);

  const totalMaterials = useMemo(() => {
    return emergencyMaterials.reduce((acc, m) => ({
      total: acc.total + m.total,
      used: acc.used + m.used,
    }), { total: 0, used: 0 });
  }, []);

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };
  const cardBodyStyle = { padding: '16px 20px' };

  return (
    <div className="p-6 space-y-6">
      <Alert
        message="应急响应状态"
        description="当前处于蓝色预警状态，请密切关注台风动态，做好防御准备。"
        type="info"
        showIcon
        className="rounded-xl"
      />

      <Card title="应急预案等级" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
        <Row gutter={[16, 16]}>
          {emergencyPlans.map((plan, idx) => (
            <Col xs={24} md={8} key={idx}>
              <div className={`p-5 rounded-xl border-2 ${warningLevelConfig[plan.level].border} ${warningLevelConfig[plan.level].bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{warningLevelConfig[plan.level].icon}</span>
                  <div>
                    <h3 className={`font-bold text-lg ${warningLevelConfig[plan.level].text}`}>{plan.title}</h3>
                    <Tag color={plan.color}>{plan.windSpeed}</Tag>
                  </div>
                </div>
                <List
                  size="small"
                  dataSource={plan.measures}
                  renderItem={(item) => (
                    <List.Item className="border-0 px-0 py-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={14} className={`mt-0.5 flex-shrink-0 ${warningLevelConfig[plan.level].text}`} />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    </List.Item>
                  )}
                />
                <Button type="primary" block className={`mt-4 bg-${plan.color}-500`}>查看详情</Button>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="应急物资清单" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <Row gutter={[8, 8]} className="mb-4">
            <Col span={12}>
              <Statistic title="物资总数" value={totalMaterials.total} suffix="件" />
            </Col>
            <Col span={12}>
              <Statistic title="已使用" value={totalMaterials.used} suffix="件" valueStyle={{ color: '#faad14' }} />
            </Col>
          </Row>
          <Progress percent={Math.round((totalMaterials.used / totalMaterials.total) * 100)} strokeColor={{ '0%': '#52c41a', '50%': '#faad14', '100%': '#ff4d4f' }} className="mb-4" />
          <div className="space-y-3">
            {emergencyMaterials.map((m, idx) => {
              const Icon = m.icon;
              const percent = Math.round((m.used / m.total) * 100);
              return (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-blue-500" />
                      <span className="font-medium text-gray-800">{m.name}</span>
                      <Tag color="blue" className="text-xs">{m.spec}</Tag>
                    </div>
                    <span className="text-sm text-gray-500">{m.used}/{m.total} {m.unit}</span>
                  </div>
                  <Progress percent={percent} size="small" strokeColor={percent > 80 ? '#ff4d4f' : percent > 50 ? '#faad14' : '#52c41a'} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="应急通讯录" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
          <List
            dataSource={emergencyContacts}
            renderItem={(contact) => (
              <List.Item className="p-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-gradient-to-br from-blue-500 to-cyan-500">{contact.avatar}</Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.role}</p>
                    </div>
                  </div>
                  <Button type="primary" icon={<Phone size={14} />} size="small">
                    {contact.phone}
                  </Button>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <Card title="应急响应流程" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
        <Steps
          direction="horizontal"
          size="small"
          items={responseSteps.map((step, idx) => ({
            title: step.title,
            description: step.desc,
            icon: idx < 3 ? <CheckCircle className="text-green-500" size={20} /> : idx === 3 ? <Clock className="text-blue-500" size={20} /> : <AlertTriangle className="text-gray-400" size={20} />,
            status: idx < 3 ? 'finish' : idx === 3 ? 'process' : 'wait',
          }))}
        />
        <Timeline
          className="mt-6"
          items={responseSteps.map((step, idx) => {
            const Icon = step.icon;
            return {
              color: idx < 3 ? 'green' : idx === 3 ? 'blue' : 'gray',
              dot: <Icon size={16} />,
              children: (
                <div>
                  <p className="font-medium text-gray-800">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              ),
            };
          })}
        />
      </Card>

      <Card title="历史台风记录" className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: cardBodyStyle }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-3xl font-bold text-red-500">{historicalTyphoons.length}</p>
            <p className="text-sm text-gray-500">历史台风记录</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-3xl font-bold text-orange-500">{historyData.reduce((a, b) => a + b.cagesAffected, 0)}</p>
            <p className="text-sm text-gray-500">累计影响网箱</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-500">¥{historyData.reduce((a, b) => a + b.loss, 0)}万</p>
            <p className="text-sm text-gray-500">累计经济损失</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="damage" name="损失程度(%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cagesAffected" name="影响网箱数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loss" name="经济损失(万元)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {historyData.map((h, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CloudLightning className="text-red-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">{h.name}</p>
                  <p className="text-sm text-gray-500">{h.year}年</p>
                </div>
              </div>
              <Space>
                <Tag color="red">损失 {h.damage}%</Tag>
                <Tag color="orange">影响 {h.cagesAffected} 个网箱</Tag>
                <Tag color="blue">损失 ¥{h.loss}万</Tag>
              </Space>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
