import type { DiseaseRecord, Inspection } from '@/types';
import dayjs from 'dayjs';

const generateMockDiseaseRecords = (): DiseaseRecord[] => {
  const diseaseData = [
    {
      symptoms: ['食欲下降', '体表出血', '游动异常'],
      diagnosis: '细菌性败血症',
      treatment: '水体消毒+内服抗生素',
      medicine: '氟苯尼考粉',
      dosage: '每公斤体重20mg，连用5天',
    },
    {
      symptoms: ['鳃丝发白', '呼吸困难', '浮头'],
      diagnosis: '鳃霉病',
      treatment: '改善水质+抗真菌治疗',
      medicine: '霉菌净',
      dosage: '全池泼洒，每立方米0.3g',
    },
    {
      symptoms: ['体表溃疡', '鳞片脱落', '水霉滋生'],
      diagnosis: '水霉病',
      treatment: '水体消毒+促进伤口愈合',
      medicine: '聚维酮碘溶液',
      dosage: '全池泼洒，每立方米0.15ml',
    },
    {
      symptoms: ['肠道发炎', '肛门红肿', '拖便'],
      diagnosis: '肠炎病',
      treatment: '停食2天+内服益生菌',
      medicine: '肠道益生菌+复合维生素',
      dosage: '每公斤饲料添加5g，连用7天',
    },
    {
      symptoms: ['眼球突出', '腹部膨胀', '鳞片竖起'],
      diagnosis: '爱德华氏菌病',
      treatment: '内服抗生素+水质改良',
      medicine: '恩诺沙星粉',
      dosage: '每公斤体重15mg，连用5天',
    },
  ];

  const veterinarians = ['李兽医', '王医师', '张水产师', '陈教授'];
  const cages = ['cage-002', 'cage-005', 'cage-008', 'cage-011', 'cage-014', 'cage-017'];

  return cages.map((cageId, index) => {
    const disease = diseaseData[index % diseaseData.length];
    const foundDate = dayjs().subtract(10 + index * 5, 'day');
    const isRecovered = index % 3 !== 0;
    
    return {
      id: `disease-${String(index + 1).padStart(3, '0')}`,
      cageId,
      foundDate: foundDate.format('YYYY-MM-DD'),
      symptoms: disease.symptoms,
      diagnosis: disease.diagnosis,
      treatment: disease.treatment,
      medicine: disease.medicine,
      dosage: disease.dosage,
      recoveryDate: isRecovered ? foundDate.add(7, 'day').format('YYYY-MM-DD') : undefined,
      status: isRecovered ? 'recovered' as const : 'treating' as const,
      veterinarian: veterinarians[index % veterinarians.length],
    };
  });
};

const generateMockInspections = (): Inspection[] => {
  const inspections: Inspection[] = [];
  const inspectors = ['潜水员甲', '潜水员乙', '安检员A', '安检员B', '养殖主管'];
  const allCages = ['cage-001', 'cage-002', 'cage-003', 'cage-004', 'cage-005', 'cage-006', 'cage-007', 'cage-008', 'cage-009', 'cage-010', 'cage-011', 'cage-012', 'cage-013', 'cage-014', 'cage-015', 'cage-016', 'cage-017', 'cage-018', 'cage-019', 'cage-020'];
  
  for (let i = 0; i < 30; i++) {
    const cageId = allCages[i % allCages.length];
    const types: Array<'diving' | 'net_check' | 'routine'> = ['diving', 'net_check', 'routine'];
    const type = types[i % 3];
    const hasIssue = Math.random() > 0.7;
    const date = dayjs().subtract(i, 'day');
    
    let findings = '检查正常，网箱结构完好，无明显异常';
    let status: 'normal' | 'issue_found' | 'resolved' = 'normal';
    let damageLevel: 'minor' | 'moderate' | 'severe' | undefined;
    let repairMeasures: string | undefined;
    
    if (hasIssue) {
      status = i % 2 === 0 ? 'issue_found' : 'resolved';
      if (type === 'net_check') {
        findings = '发现网箱东北角网衣有轻微破损，约10cm×15cm，需及时修补';
        damageLevel = 'minor';
        repairMeasures = status === 'resolved' ? '已使用专用修补网片进行缝合修复' : '计划3日内安排修补';
      } else if (type === 'diving') {
        findings = '水下检查发现网箱底部附着物较多，影响水体交换';
        damageLevel = 'moderate';
        repairMeasures = status === 'resolved' ? '已安排潜水员进行网衣清洗' : '建议近期安排清洗作业';
      } else {
        findings = '检查发现固定锚链有轻微锈蚀，需进行防腐处理';
        damageLevel = 'minor';
        repairMeasures = status === 'resolved' ? '已涂刷防锈漆进行处理' : '计划下周进行防腐处理';
      }
    }
    
    inspections.push({
      id: `inspect-${String(i + 1).padStart(3, '0')}`,
      cageId,
      type,
      inspectionDate: date.format('YYYY-MM-DD'),
      inspector: inspectors[i % inspectors.length],
      findings,
      photos: [],
      status,
      damageLevel,
      repairMeasures,
    });
  }
  
  return inspections;
};

export const mockDiseaseRecords: DiseaseRecord[] = generateMockDiseaseRecords();
export const mockInspections: Inspection[] = generateMockInspections();
