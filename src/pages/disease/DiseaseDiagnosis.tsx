import { useState, useMemo } from 'react';
import { Card, Tag, Button, Checkbox, List, Progress, Form, Select, Modal, message } from 'antd';
import { Stethoscope, AlertCircle, CheckCircle, Pill, Save, History } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { DiseaseRecord } from '@/types';

const { Option } = Select;

const symptomsList = [
  '食欲下降', '体表出血', '呼吸困难', '游动异常', '鳃丝发白',
  '体表溃疡', '鳞片脱落', '眼球突出', '腹部膨胀', '肛门红肿',
  '水霉滋生', '肠道发炎', '拖便', '浮头', '鳃盖张开'
];

const diseaseKnowledge: Record<string, { diseases: { name: string; confidence: number; treatment: string; medicine: string }[] }> = {
  '食欲下降,体表出血,游动异常': { diseases: [{ name: '细菌性败血症', confidence: 92, treatment: '水体消毒+内服抗生素', medicine: '氟苯尼考粉' }] },
  '鳃丝发白,呼吸困难,浮头': { diseases: [{ name: '鳃霉病', confidence: 88, treatment: '改善水质+抗真菌治疗', medicine: '霉菌净' }] },
  '体表溃疡,鳞片脱落,水霉滋生': { diseases: [{ name: '水霉病', confidence: 95, treatment: '水体消毒+促进伤口愈合', medicine: '聚维酮碘溶液' }] },
  '肠道发炎,肛门红肿,拖便': { diseases: [{ name: '肠炎病', confidence: 90, treatment: '停食2天+内服益生菌', medicine: '肠道益生菌' }] },
  '眼球突出,腹部膨胀,鳞片竖起': { diseases: [{ name: '爱德华氏菌病', confidence: 87, treatment: '内服抗生素+水质改良', medicine: '恩诺沙星粉' }] },
  '食欲下降,呼吸困难': { diseases: [{ name: '缺氧综合症', confidence: 75, treatment: '增氧+改善水质', medicine: '增氧剂' }] },
  '体表出血,鳃盖张开': { diseases: [{ name: '病毒性出血病', confidence: 85, treatment: '隔离+抗病毒治疗', medicine: '病毒灵' }] },
};

const confidenceColors: Record<number, string> = { 90: '#52C41A', 80: '#FAAD14', 70: '#F5222D', 0: '#8C8C8C' };

const getConfidenceColor = (c: number) => {
  if (c >= 90) return confidenceColors[90];
  if (c >= 80) return confidenceColors[80];
  if (c >= 70) return confidenceColors[70];
  return confidenceColors[0];
};

const statusMap: Record<string, { text: string; color: string }> = {
  diagnosed: { text: '已确诊', color: 'blue' },
  treating: { text: '治疗中', color: 'orange' },
  recovered: { text: '已治愈', color: 'green' },
  dead: { text: '死亡', color: 'red' },
};

export default function DiseaseDiagnosis() {
  const { diseaseRecords, cages, currentUser } = useAppStore();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [form] = Form.useForm();

  const diagnosisResult = useMemo(() => {
    if (selectedSymptoms.length === 0) return null;
    const key = selectedSymptoms.sort().join(',');
    for (const [symptoms, data] of Object.entries(diseaseKnowledge)) {
      const symptomArr = symptoms.split(',');
      const matchCount = selectedSymptoms.filter(s => symptomArr.includes(s)).length;
      if (matchCount >= Math.min(2, selectedSymptoms.length)) {
        const adjustedConfidence = Math.max(60, Math.min(98, data.diseases[0].confidence - (symptomArr.length - matchCount) * 5));
        return { ...data.diseases[0], confidence: adjustedConfidence };
      }
    }
    return { name: '待进一步诊断', confidence: 55, treatment: '建议请专业兽医现场检查', medicine: '暂不推荐' };
  }, [selectedSymptoms]);

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!diagnosisResult) return;
      const newRecord: DiseaseRecord = {
        id: `disease-${Date.now()}`,
        cageId: values.cageId,
        foundDate: dayjs().format('YYYY-MM-DD'),
        symptoms: selectedSymptoms,
        diagnosis: diagnosisResult.name,
        treatment: diagnosisResult.treatment,
        medicine: diagnosisResult.medicine,
        dosage: values.dosage || '按说明书使用',
        status: 'diagnosed',
        veterinarian: currentUser.name,
      };
      message.success('诊断结果已保存到病害记录');
      setSaveModalVisible(false);
      form.resetFields();
      setSelectedSymptoms([]);
      console.log('New disease record:', newRecord);
    });
  };

  const historyColumns = [
    { title: '日期', dataIndex: 'foundDate', width: 100 },
    { title: '网箱', dataIndex: 'cageId', render: (id: string) => cages.find(c => c.id === id)?.name || id },
    { title: '症状', dataIndex: 'symptoms', render: (s: string[]) => s.slice(0, 3).join('、') + (s.length > 3 ? '...' : '') },
    { title: '诊断结果', dataIndex: 'diagnosis' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
  ];

  const cardStyle = { header: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }, body: { padding: '16px 20px' } };

  return (
    <div className="p-6 space-y-6">
      <Card title="症状选择器" className="rounded-xl shadow-sm border-0" styles={cardStyle}
        extra={<Button type="text" onClick={() => setSelectedSymptoms([])}>清除选择</Button>}>
        <div className="flex flex-wrap gap-2">
          {symptomsList.map(symptom => (
            <Tag.CheckableTag
              key={symptom}
              checked={selectedSymptoms.includes(symptom)}
              onChange={checked => {
                setSelectedSymptoms(prev =>
                  checked ? [...prev, symptom] : prev.filter(s => s !== symptom)
                );
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                border: selectedSymptoms.includes(symptom) ? '2px solid #1890FF' : '1px solid #d9d9d9',
                background: selectedSymptoms.includes(symptom) ? '#E6F7FF' : '#fff',
              }}
            >
              {symptom}
            </Tag.CheckableTag>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          已选择 <span className="text-blue-500 font-semibold">{selectedSymptoms.length}</span> 个症状
        </p>
      </Card>

      <Card title="智能诊断结果" className="rounded-xl shadow-sm border-0" styles={cardStyle}
        extra={diagnosisResult && diagnosisResult.confidence >= 70 ? (
          <Button type="primary" icon={<Save size={16} />} onClick={() => setSaveModalVisible(true)}>保存记录</Button>
        ) : null}>
        {!diagnosisResult ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Stethoscope className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">请选择症状开始诊断</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Progress
                  type="circle"
                  percent={diagnosisResult.confidence}
                  strokeColor={getConfidenceColor(diagnosisResult.confidence)}
                  width={120}
                  format={p => <span className="text-2xl font-bold" style={{ color: getConfidenceColor(diagnosisResult.confidence) }}>{p}%</span>}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{diagnosisResult.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  {diagnosisResult.confidence >= 90 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
                  <span className="text-sm" style={{ color: getConfidenceColor(diagnosisResult.confidence) }}>
                    {diagnosisResult.confidence >= 90 ? '高置信度' : diagnosisResult.confidence >= 80 ? '中置信度' : '低置信度，建议进一步检查'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> 治疗建议
                </h4>
                <p className="text-gray-700">{diagnosisResult.treatment}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" /> 推荐用药
                </h4>
                <p className="text-gray-700">{diagnosisResult.medicine}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="历史诊断记录" className="rounded-xl shadow-sm border-0" styles={cardStyle}
        extra={<span className="text-gray-500 text-sm"><History className="w-4 h-4 inline mr-1" />共 {diseaseRecords.length} 条记录</span>}>
        <List
          dataSource={diseaseRecords.slice(0, 5)}
          renderItem={record => (
            <List.Item key={record.id} className="px-2">
              <List.Item.Meta
                title={<span className="font-medium">{record.diagnosis}</span>}
                description={
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">
                      {dayjs(record.foundDate).format('YYYY-MM-DD')} · {cages.find(c => c.id === record.cageId)?.name} · {record.veterinarian}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {record.symptoms.map((s, i) => (
                        <Tag key={i} color="blue" style={{ margin: 0, marginRight: 4 }}>{s}</Tag>
                      ))}
                    </div>
                  </div>
                }
              />
              <Tag color={statusMap[record.status]?.color}>{statusMap[record.status]?.text}</Tag>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="保存诊断记录"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        onOk={handleSave}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="cageId" label="选择网箱" rules={[{ required: true, message: '请选择网箱' }]}>
            <Select placeholder="请选择发生病害的网箱">
              {cages.filter(c => c.status === 'normal').map(cage => (
                <Option key={cage.id} value={cage.id}>{cage.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dosage" label="用量说明">
            <Select placeholder="选择用量（可选）">
              <Option value="每公斤体重20mg，连用5天">每公斤体重20mg，连用5天</Option>
              <Option value="全池泼洒，每立方米0.3g">全池泼洒，每立方米0.3g</Option>
              <Option value="每公斤饲料添加5g，连用7天">每公斤饲料添加5g，连用7天</Option>
              <Option value="按说明书使用">按说明书使用</Option>
            </Select>
          </Form.Item>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600"><strong>诊断：</strong>{diagnosisResult?.name}</p>
            <p className="text-sm text-gray-600"><strong>症状：</strong>{selectedSymptoms.join('、')}</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
