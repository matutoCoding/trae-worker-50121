import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card, Tabs, Tag, Table, Statistic, Row, Col, Button, List } from 'antd';
import { ArrowLeft, MapPin, Thermometer, Droplets, Fish, Calendar, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { ColumnsType } from 'antd/es/table';
import type { FeedingRecord, DiseaseRecord, Inspection, Harvest } from '@/types';
import 'leaflet/dist/leaflet.css';

const statusMap: Record<string, { color: string; text: string }> = {
  normal: { color: 'success', text: '正常运行' },
  maintenance: { color: 'warning', text: '维护中' },
  damaged: { color: 'error', text: '已损坏' },
  idle: { color: 'default', text: '空闲' },
};

const diseaseStatusMap: Record<string, { color: string; text: string }> = {
  diagnosed: { color: 'red', text: '已确诊' },
  treating: { color: 'orange', text: '治疗中' },
  recovered: { color: 'green', text: '已治愈' },
  dead: { color: 'default', text: '死亡' },
};

const inspectionStatusMap: Record<string, { color: string; text: string }> = {
  normal: { color: 'green', text: '正常' },
  issue_found: { color: 'orange', text: '发现问题' },
  resolved: { color: 'blue', text: '已解决' },
};

const qualityGradeMap: Record<string, { color: string; text: string }> = {
  A: { color: 'green', text: 'A级' },
  B: { color: 'blue', text: 'B级' },
  C: { color: 'orange', text: 'C级' },
};

export default function CageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cage = useAppStore((s) => s.getCageById(id || ''));
  const waterQualityList = useAppStore((s) => s.getWaterQualityByCage(id || ''));
  const latestWater = useAppStore((s) => s.getLatestWaterQuality(id || ''));
  const feedingRecords = useAppStore((s) => s.getFeedingRecordsByCage(id || ''));
  const diseaseRecords = useAppStore((s) => s.getDiseaseRecordsByCage(id || ''));
  const inspections = useAppStore((s) => s.getInspectionsByCage(id || ''));
  const fryRelease = useAppStore((s) => s.getFryReleaseByCage(id || ''));
  const harvests = useAppStore((s) => s.getHarvestsByCage(id || ''));

  if (!cage) return <div className="p-8 text-center">网箱不存在</div>;

  const chartData = waterQualityList.slice(0, 7).reverse().map((item) => ({
    date: item.measureTime.slice(5, 10),
    溶解氧: item.dissolvedOxygen,
    水温: item.temperature,
    pH值: item.phValue,
    盐度: item.salinity,
  }));

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  };

  const monthlyFeedTotal = feedingRecords.filter((r) => isCurrentMonth(r.feedingDate)).reduce((sum, r) => sum + r.feedAmount, 0);
  const monthlyFeedCount = feedingRecords.filter((r) => isCurrentMonth(r.feedingDate)).length;

  const feedingColumns: ColumnsType<FeedingRecord> = [
    { title: '日期', dataIndex: 'feedingDate' },
    { title: '时间', dataIndex: 'feedingTime' },
    { title: '饲料类型', dataIndex: 'feedType' },
    { title: '投喂量(kg)', dataIndex: 'feedAmount', sorter: (a, b) => a.feedAmount - b.feedAmount },
    { title: '投喂人员', dataIndex: 'feeder' },
    { title: '状态', dataIndex: 'status', render: (s) => <Tag color={s === 'completed' ? 'green' : s === 'in_progress' ? 'blue' : 'orange'}>{s}</Tag> },
  ];

  const InfoItem = ({ icon: Icon, iconColor, label, value }: { icon: any; iconColor: string; label: string; value: string }) => (
    <Col xs={12} md={6}>
      <div className="flex items-center gap-2">
        <Icon size={18} className={iconColor} />
        <div>
          <div className="text-gray-500 text-sm">{label}</div>
          <div className="font-medium">{value}</div>
        </div>
      </div>
    </Col>
  );

  const StatCard = ({ title, value, suffix, precision, valueStyle }: any) => (
    <Col xs={12} md={6}>
      <Card size="small">
        <Statistic title={title} value={value} suffix={suffix} precision={precision} valueStyle={valueStyle} />
      </Card>
    </Col>
  );

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="位置信息" size="small">
              <div className="h-64 rounded overflow-hidden">
                <MapContainer center={[cage.latitude, cage.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[cage.latitude, cage.longitude]}>
                    <Popup>{cage.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="设备列表" size="small">
              <List dataSource={cage.equipment} renderItem={(item) => (
                <List.Item><Fish size={16} className="mr-2 text-ocean-500" />{item}</List.Item>
              )} />
            </Card>
          </Col>
          <StatCard title="设计容量" value={cage.capacity} suffix="尾" />
          <StatCard title="当前存量" value={cage.currentStock || 0} suffix="尾" />
          <StatCard title="使用率" value={cage.capacity > 0 ? ((cage.currentStock || 0) / cage.capacity) * 100 : 0} precision={1} suffix="%" />
          <StatCard title="存活率" value={fryRelease?.survivalRate || 0} precision={1} suffix="%" />
          {fryRelease && (
            <Col xs={24}>
              <Card title="当前养殖信息" size="small">
                <Row gutter={[16, 16]}>
                  <InfoItem icon={Fish} iconColor="text-ocean-500" label="鱼苗品种" value={fryRelease.frySpecies} />
                  <InfoItem icon={Calendar} iconColor="text-ocean-500" label="投放日期" value={fryRelease.releaseDate} />
                  <InfoItem icon={Calendar} iconColor="text-green-500" label="预计收获" value={fryRelease.expectedHarvestDate || '-'} />
                  <InfoItem icon={Activity} iconColor="text-blue-500" label="投放数量" value={`${fryRelease.quantity}尾`} />
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: 'water',
      label: '水质监测',
      children: (
        <Row gutter={[16, 16]}>
          {latestWater && (
            <>
              <StatCard
                title={<span className="flex items-center gap-1"><Droplets size={14} />溶解氧</span>}
                value={latestWater.dissolvedOxygen}
                suffix="mg/L"
                valueStyle={{ color: latestWater.dissolvedOxygen < 5 ? '#cf1322' : '#3f8600' }}
              />
              <StatCard
                title={<span className="flex items-center gap-1"><Thermometer size={14} />水温</span>}
                value={latestWater.temperature}
                suffix="°C"
              />
              <StatCard title="pH值" value={latestWater.phValue} />
              <StatCard title="盐度" value={latestWater.salinity} suffix="‰" />
            </>
          )}
          <Col span={24}>
            <Card title="最近7天水质趋势" size="small">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="溶解氧" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="水温" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pH值" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="盐度" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'feeding',
      label: '投喂记录',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card size="small"><Statistic title="本月投喂总量" value={monthlyFeedTotal} suffix="kg" /></Card></Col>
          <Col xs={24} md={8}><Card size="small"><Statistic title="本月投喂次数" value={monthlyFeedCount} suffix="次" /></Card></Col>
          <Col xs={24} md={8}><Card size="small"><Statistic title="累计投喂记录" value={feedingRecords.length} suffix="条" /></Card></Col>
          <Col span={24}>
            <Card title="投喂历史" size="small">
              <Table<FeedingRecord> columns={feedingColumns} dataSource={feedingRecords} rowKey="id" pagination={{ pageSize: 5 }} size="small" />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'disease',
      label: '病害记录',
      children: (
        <Card title="病害历史" size="small">
          <List dataSource={diseaseRecords} renderItem={(item: DiseaseRecord) => (
            <List.Item actions={[<Tag color={diseaseStatusMap[item.status].color}>{diseaseStatusMap[item.status].text}</Tag>]}>
              <List.Item.Meta
                avatar={<AlertTriangle size={24} className={item.status === 'diagnosed' || item.status === 'treating' ? 'text-red-500' : 'text-gray-400'} />}
                title={<div className="flex items-center gap-2"><span>{item.diagnosis}</span><span className="text-gray-400 text-sm">{item.foundDate}</span></div>}
                description={
                  <div>
                    <div className="mb-1">症状: {item.symptoms.join(', ')}</div>
                    <div>治疗: {item.treatment}</div>
                    <div>用药: {item.medicine} ({item.dosage})</div>
                    <div className="text-gray-500 text-sm mt-1">兽医: {item.veterinarian}</div>
                  </div>
                }
              />
            </List.Item>
          )} />
        </Card>
      ),
    },
    {
      key: 'inspection',
      label: '巡查记录',
      children: (
        <Card title="巡查历史" size="small">
          <List dataSource={inspections} renderItem={(item: Inspection) => (
            <List.Item actions={[<Tag color={inspectionStatusMap[item.status].color}>{inspectionStatusMap[item.status].text}</Tag>]}>
              <List.Item.Meta
                avatar={<MapPin size={24} className="text-ocean-500" />}
                title={<div className="flex items-center gap-2"><span>{item.type === 'diving' ? '潜水检查' : item.type === 'net_check' ? '网衣检查' : '例行巡查'}</span><span className="text-gray-400 text-sm">{item.inspectionDate}</span></div>}
                description={
                  <div>
                    <div>检查人员: {item.inspector}</div>
                    <div>检查结果: {item.findings}</div>
                    {item.damageLevel && <div className="text-orange-500">损坏程度: {item.damageLevel === 'minor' ? '轻微' : item.damageLevel === 'moderate' ? '中等' : '严重'}</div>}
                    {item.repairMeasures && <div className="text-blue-500">修复措施: {item.repairMeasures}</div>}
                  </div>
                }
              />
            </List.Item>
          )} />
        </Card>
      ),
    },
    {
      key: 'harvest',
      label: '收获记录',
      children: (
        <Card title="收获历史" size="small">
          <List dataSource={harvests} renderItem={(item: Harvest) => (
            <List.Item actions={[<Tag color={qualityGradeMap[item.qualityGrade].color}>{qualityGradeMap[item.qualityGrade].text}</Tag>]}>
              <List.Item.Meta
                avatar={<Fish size={24} className="text-green-500" />}
                title={<div className="flex items-center gap-2"><span>收获: {item.weight} kg</span><span className="text-gray-400 text-sm">{item.harvestDate}</span></div>}
                description={
                  <div>
                    <div>数量: {item.quantity} 尾</div>
                    <div>收购方: {item.buyer}</div>
                    <div>单价: ¥{item.unitPrice}/kg</div>
                    <div className="text-green-600 font-medium">总金额: ¥{item.totalAmount.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm mt-1">检验员: {item.inspector}</div>
                  </div>
                }
              />
            </List.Item>
          )} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/cage')}>返回</Button>
        <Card className="flex-1" size="small">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{cage.name}</h2>
              <div className="text-gray-500">编号: {cage.code}</div>
            </div>
            <Tag color={statusMap[cage.status].color} className="text-base px-4 py-1">{statusMap[cage.status].text}</Tag>
          </div>
          <Row gutter={[16, 8]} className="mt-4">
            <Col xs={12} md={6}><div className="text-gray-500 text-sm">规格</div><div className="font-medium">{cage.specification}</div></Col>
            <Col xs={12} md={6}><div className="text-gray-500 text-sm">材质</div><div className="font-medium">{cage.material}</div></Col>
            <Col xs={12} md={6}><div className="text-gray-500 text-sm">安装日期</div><div className="font-medium">{cage.installDate}</div></Col>
            <Col xs={12} md={6}><div className="text-gray-500 text-sm">设备数量</div><div className="font-medium">{cage.equipment.length} 台</div></Col>
          </Row>
        </Card>
      </div>
      <Card size="small">
        <Tabs defaultActiveKey="basic" items={items} />
      </Card>
    </div>
  );
}
