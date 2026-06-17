import { useMemo, useState } from 'react';
import { Card, Table, Button, Tag, Form, Modal, Select, Input, InputNumber, List, Statistic } from 'antd';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Fish, ShoppingCart, TrendingUp, Package, DollarSign, Plus, Truck, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { message } from 'antd';
import { useAppStore } from '@/store';
import type { Harvest } from '@/types';

const PRIMARY_COLOR = '#D4A017';
const ACCENT_COLOR = '#228B22';
const GOLD_GRADIENT = 'from-yellow-500 to-amber-500';
const GREEN_GRADIENT = 'from-green-500 to-emerald-500';

const qualityGradeMap = { A: { color: 'success', text: 'A级' }, B: { color: 'processing', text: 'B级' }, C: { color: 'warning', text: 'C级' } };
const PIE_COLORS = ['#52C41A', '#1890FF', '#FA8C16'];

export default function HarvestManagement() {
  const { harvests, cages, fryReleases, getCageById, getFryReleaseByCage, addHarvest } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const thisMonth = dayjs().format('YYYY-MM');

  const stats = useMemo(() => {
    const monthHarvests = harvests.filter(h => h.harvestDate.startsWith(thisMonth));
    const totalWeight = monthHarvests.reduce((s, h) => s + h.weight, 0);
    const totalAmount = monthHarvests.reduce((s, h) => s + h.totalAmount, 0);
    const avgPrice = totalWeight > 0 ? totalAmount / totalWeight : 0;
    const pendingCages = fryReleases.filter(f => f.expectedHarvestDate && dayjs(f.expectedHarvestDate).isAfter(dayjs())).length;

    return {
      monthHarvest: Number(totalWeight.toFixed(2)),
      monthRevenue: Number(totalAmount.toFixed(2)),
      avgPrice: Number(avgPrice.toFixed(2)),
      pendingCages,
    };
  }, [harvests, fryReleases, thisMonth]);

  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month').format('YYYY-MM');
      const monthLabel = dayjs().subtract(i, 'month').format('MM月');
      const monthHarvests = harvests.filter(h => h.harvestDate.startsWith(month));
      const weight = monthHarvests.reduce((s, h) => s + h.weight, 0);
      const amount = monthHarvests.reduce((s, h) => s + h.totalAmount, 0);
      data.push({ month: monthLabel, 产量: Number(weight.toFixed(0)), 收入: Number(amount.toFixed(0)) });
    }
    return data;
  }, [harvests]);

  const qualityData = useMemo(() => {
    const count = harvests.reduce((acc, h) => {
      acc[h.qualityGrade] = (acc[h.qualityGrade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: 'A级', value: count.A || 0 },
      { name: 'B级', value: count.B || 0 },
      { name: 'C级', value: count.C || 0 },
    ];
  }, [harvests]);

  const upcomingPlans = useMemo(() => {
    return fryReleases
      .filter(f => f.expectedHarvestDate && dayjs(f.expectedHarvestDate).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.expectedHarvestDate!).valueOf() - dayjs(b.expectedHarvestDate!).valueOf())
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        cageName: getCageById(f.cageId)?.name || f.cageId,
        species: f.frySpecies,
        expectedDate: f.expectedHarvestDate!,
        daysLeft: dayjs(f.expectedHarvestDate!).diff(dayjs(), 'day'),
      }));
  }, [fryReleases, getCageById]);

  const harvestRecords = useMemo(() => {
    return [...harvests]
      .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
      .slice(0, 10)
      .map(h => ({
        ...h,
        cageName: getCageById(h.cageId)?.name || h.cageId,
        frySpecies: getFryReleaseByCage(h.cageId)?.frySpecies || '-',
      }));
  }, [harvests, getCageById, getFryReleaseByCage]);

  const statCards = [
    { title: '本月收获量', value: stats.monthHarvest, unit: 'kg', icon: Package, gradient: GOLD_GRADIENT },
    { title: '本月销售额', value: stats.monthRevenue, unit: '元', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { title: '平均单价', value: stats.avgPrice, unit: '元/kg', icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-500' },
    { title: '待收获网箱', value: stats.pendingCages, unit: '个', icon: Fish, gradient: 'from-orange-500 to-amber-400' },
  ];

  const columns = [
    { title: '收获日期', dataIndex: 'harvestDate', key: 'harvestDate', width: 110 },
    { title: '网箱', dataIndex: 'cageName', key: 'cageName', width: 100 },
    { title: '鱼苗品种', dataIndex: 'frySpecies', key: 'frySpecies', width: 110 },
    { title: '数量(尾)', dataIndex: 'quantity', key: 'quantity', width: 90 },
    { title: '重量(kg)', dataIndex: 'weight', key: 'weight', width: 90 },
    { title: '质量等级', dataIndex: 'qualityGrade', key: 'qualityGrade', width: 90, render: (g: keyof typeof qualityGradeMap) => <Tag color={qualityGradeMap[g].color}>{qualityGradeMap[g].text}</Tag> },
    { title: '收购方', dataIndex: 'buyer', key: 'buyer', width: 130 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, render: (v: number) => `¥${v}/kg` },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100, render: (v: number) => <span style={{ color: ACCENT_COLOR, fontWeight: 600 }}>¥{v.toLocaleString()}</span> },
    { title: '检验员', dataIndex: 'inspector', key: 'inspector', width: 90 },
  ];

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const fryRelease = getFryReleaseByCage(values.cageId);
      const newHarvest: Harvest = {
        id: `harvest-${Date.now()}`,
        cageId: values.cageId,
        fryReleaseId: fryRelease?.id || '',
        harvestDate: values.harvestDate,
        quantity: values.quantity,
        weight: values.weight,
        qualityGrade: values.qualityGrade,
        buyer: values.buyer,
        unitPrice: values.unitPrice,
        totalAmount: values.weight * values.unitPrice,
        inspector: values.inspector,
      };
      addHarvest(newHarvest);
      setIsModalOpen(false);
      message.success('收获记录添加成功');
    });
  };

  const cardHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>收获管理</h1>
        <div className="flex gap-2">
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)} style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>新增收获记录</Button>
          <Link to="/harvest/transport">
            <Button icon={<Truck size={16} />}>活鱼运输</Button>
          </Link>
        </div>
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
        <Card title={<span className="flex items-center gap-2"><TrendingUp size={18} style={{ color: ACCENT_COLOR }} />收获趋势（近6个月）</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" unit=" kg" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" unit=" 元" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Bar yAxisId="left" dataKey="产量" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="收入" stroke={ACCENT_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card title={<span className="flex items-center gap-2"><CheckCircle size={18} style={{ color: ACCENT_COLOR }} />质量等级分布</span>} className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={qualityData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {qualityData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={<span className="flex items-center gap-2"><Calendar size={18} style={{ color: ACCENT_COLOR }} />收获计划</span>} className="rounded-xl shadow-sm border-0" styles={{ header: cardHeaderStyle, body: { padding: '12px 20px' } }}>
          <List
            dataSource={upcomingPlans}
            renderItem={item => (
              <List.Item key={item.id} className="px-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: PRIMARY_COLOR }}>{item.cageName}</span>
                    <span className="text-xs text-gray-500">{item.species}</span>
                    {item.daysLeft <= 3 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : null}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">预计收获: {item.expectedDate}</div>
                </div>
                <Tag color={item.daysLeft <= 3 ? 'error' : item.daysLeft <= 7 ? 'warning' : 'success'}>{item.daysLeft}天后</Tag>
              </List.Item>
            )}
          />
        </Card>

        <Card title={<span className="flex items-center gap-2"><Package size={18} style={{ color: ACCENT_COLOR }} />收获记录</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2" styles={{ header: cardHeaderStyle, body: { padding: '16px 20px' } }}>
          <Table rowKey="id" columns={columns} dataSource={harvestRecords} pagination={false} size="small" scroll={{ x: 1000, y: 280 }} />
        </Card>
      </div>

      <Modal title="新增收获记录" open={isModalOpen} onOk={handleSubmit} onCancel={() => setIsModalOpen(false)} okText="确认提交" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item label="选择网箱" name="cageId" rules={[{ required: true, message: '请选择网箱' }]}>
            <Select placeholder="请选择网箱">
              {cages.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="收获日期" name="harvestDate" rules={[{ required: true, message: '请选择日期' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item label="质量等级" name="qualityGrade" rules={[{ required: true, message: '请选择等级' }]}>
              <Select>
                <Select.Option value="A">A级</Select.Option>
                <Select.Option value="B">B级</Select.Option>
                <Select.Option value="C">C级</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="数量(尾)" name="quantity" rules={[{ required: true, message: '请输入数量' }]}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item label="重量(kg)" name="weight" rules={[{ required: true, message: '请输入重量' }]}>
              <InputNumber className="w-full" min={0} step={0.1} />
            </Form.Item>
            <Form.Item label="收购方" name="buyer" rules={[{ required: true, message: '请输入收购方' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="单价(元/kg)" name="unitPrice" rules={[{ required: true, message: '请输入单价' }]}>
              <InputNumber className="w-full" min={0} step={0.01} />
            </Form.Item>
          </div>
          <Form.Item label="检验员" name="inspector" rules={[{ required: true, message: '请输入检验员' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
