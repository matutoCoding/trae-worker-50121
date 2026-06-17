import { useState, useMemo } from 'react';
import { Card, Table, Select, Button, DatePicker, Form, Modal, Statistic, Tag, InputNumber, Input, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, BarChart3, Plus, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAppStore } from '@/store';
import type { FinanceRecord, FinanceType } from '@/types';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

const INCOME_COLOR = '#52C41A';
const EXPENSE_COLOR = '#F5222D';
const PROFIT_COLOR = '#1890FF';
const EXPENSE_CATEGORIES = ['饲料采购', '苗种采购', '人工成本', '设备维护', '药品采购', '运输费用', '水电费用', '其他支出'];
const INCOME_CATEGORIES = ['销售收入', '政府补贴', '其他收入'];
const PIE_COLORS = ['#52C41A', '#1890FF', '#FAAD14', '#722ED1', '#13C2C2', '#F5222D', '#FA8C16', '#A0D911'];

export default function FinanceManagement() {
  const { financeRecords, getTotalIncome, getTotalExpense, currentUser } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const filteredRecords = useMemo(() => {
    return financeRecords.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (dateRange) {
        const d = dayjs(r.transactionDate);
        if (d.isBefore(dateRange[0].startOf('day')) || d.isAfter(dateRange[1].endOf('day'))) return false;
      }
      return true;
    }).sort((a, b) => dayjs(b.transactionDate).valueOf() - dayjs(a.transactionDate).valueOf());
  }, [financeRecords, typeFilter, categoryFilter, dateRange]);

  const trendData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month');
      const monthStr = month.format('YYYY-MM');
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');
      const income = financeRecords.filter(r => r.type === 'income' && dayjs(r.transactionDate).isBetween(monthStart, monthEnd, 'day', '[]')).reduce((s, r) => s + r.amount, 0);
      const expense = financeRecords.filter(r => r.type === 'expense' && dayjs(r.transactionDate).isBetween(monthStart, monthEnd, 'day', '[]')).reduce((s, r) => s + r.amount, 0);
      data.push({ month: month.format('MM月'), 收入: income, 支出: expense, 净利润: income - expense });
    }
    return data;
  }, [financeRecords]);

  const expensePieData = useMemo(() => {
    const totals = financeRecords.filter(r => r.type === 'expense').reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);
    return EXPENSE_CATEGORIES.map(c => ({ name: c, value: totals[c] || 0 }));
  }, [financeRecords]);

  const incomePieData = useMemo(() => {
    const totals = financeRecords.filter(r => r.type === 'income').reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);
    return INCOME_CATEGORIES.map(c => ({ name: c, value: totals[c] || 0 }));
  }, [financeRecords]);

  const handleAddRecord = (values: any) => {
    message.success('记录添加成功');
    setModalVisible(false);
    form.resetFields();
  };

  const statCards = [
    { title: '总收入', value: totalIncome, icon: DollarSign, color: INCOME_COLOR, change: 12.5 },
    { title: '总支出', value: totalExpense, icon: TrendingDown, color: EXPENSE_COLOR, change: 8.3 },
    { title: '净利润', value: netProfit, icon: Wallet, color: PROFIT_COLOR, change: 15.2 },
    { title: '本月利润率', value: profitMargin, icon: TrendingUp, color: profitMargin >= 0 ? INCOME_COLOR : EXPENSE_COLOR, change: 5.8, isPercent: true },
  ];

  const columns = [
    { title: '日期', dataIndex: 'transactionDate', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (t: FinanceType) => <Tag color={t === 'income' ? 'success' : 'error'}>{t === 'income' ? '收入' : '支出'}</Tag> },
    { title: '类别', dataIndex: 'category', key: 'category', width: 120 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 120, render: (v: number, r: FinanceRecord) => <span style={{ color: r.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>{r.type === 'income' ? '+' : '-'}{v.toLocaleString()}</span> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#0E4D7A' }}>财务管理</h1>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalVisible(true)}>新增记录</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="rounded-xl shadow-sm border-0" styles={{ body: { padding: '16px' } }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>
                    {card.isPercent ? `${card.value.toFixed(1)}%` : `¥${card.value.toLocaleString()}`}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.change >= 0 ? <ArrowUpRight size={14} color={INCOME_COLOR} /> : <ArrowDownRight size={14} color={EXPENSE_COLOR} />}
                    <span className="text-xs" style={{ color: card.change >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}>
                      同比 {Math.abs(card.change)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon size={24} color={card.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title={<span className="flex items-center gap-2"><BarChart3 size={18} />收支趋势</span>} className="rounded-xl shadow-sm border-0">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend iconType="circle" />
            <Bar yAxisId="left" dataKey="收入" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="支出" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="净利润" stroke={PROFIT_COLOR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={<span className="flex items-center gap-2"><PieChartIcon size={18} />成本构成分析</span>} className="rounded-xl shadow-sm border-0">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#999' }}>
                {expensePieData.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {expensePieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">¥{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={<span className="flex items-center gap-2"><PieChartIcon size={18} />收入构成分析</span>} className="rounded-xl shadow-sm border-0">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={incomePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#999' }}>
                {incomePieData.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {incomePieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">¥{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="收支明细" className="rounded-xl shadow-sm border-0" extra={
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 100 }}>
            <Option value="all">全部</Option>
            <Option value="income">收入</Option>
            <Option value="expense">支出</Option>
          </Select>
          <Select value={categoryFilter} onChange={setCategoryFilter} allowClear style={{ width: 140 }} placeholder="选择类别">
            {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => (<Option key={c} value={c}>{c}</Option>))}
          </Select>
          <RangePicker value={dateRange} onChange={(v) => setDateRange(v as [Dayjs, Dayjs] | null)} />
          <Button icon={<Filter size={16} />}>筛选</Button>
          <Button icon={<Download size={16} />}>导出</Button>
        </div>
      }>
        <Table columns={columns} dataSource={filteredRecords} rowKey="id" pagination={{ ...pagination, total: filteredRecords.length, onChange: (current, pageSize) => setPagination({ current, pageSize }) }} />
      </Card>

      <Modal title="新增收支记录" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} okText="确认" cancelText="取消">
        <Form form={form} layout="vertical" onFinish={handleAddRecord}>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              <Option value="income">收入</Option>
              <Option value="expense">支出</Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} prefix="¥" placeholder="请输入金额" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const categories = type === 'income' ? INCOME_CATEGORIES : type === 'expense' ? EXPENSE_CATEGORIES : [];
              return (
                <Form.Item name="category" label="类别" rules={[{ required: true, message: '请选择类别' }]}>
                  <Select placeholder="请选择类别">
                    {categories.map(c => (<Option key={c} value={c}>{c}</Option>))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item name="transactionDate" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input style={{ width: '100%' }} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="relatedId" label="关联单据">
            <Input style={{ width: '100%' }} placeholder="请输入关联单据号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
