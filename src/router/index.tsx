import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import CageList from '@/pages/cage/CageList';
import CageDetail from '@/pages/cage/CageDetail';
import FryReleaseList from '@/pages/fry/FryReleaseList';
import FeedingManagement from '@/pages/feeding/FeedingManagement';
import FeedingSchedule from '@/pages/feeding/FeedingSchedule';
import WaterMonitoring from '@/pages/water/WaterMonitoring';
import RedTideAlerts from '@/pages/water/RedTideAlerts';
import DiseaseControl from '@/pages/disease/DiseaseControl';
import DiseaseDiagnosis from '@/pages/disease/DiseaseDiagnosis';
import DivingInspection from '@/pages/disease/DivingInspection';
import NetCheck from '@/pages/disease/NetCheck';
import TyphoonDefense from '@/pages/typhoon/TyphoonDefense';
import EmergencyPlan from '@/pages/typhoon/EmergencyPlan';
import HarvestManagement from '@/pages/harvest/HarvestManagement';
import LiveTransport from '@/pages/harvest/LiveTransport';
import FinanceManagement from '@/pages/finance/FinanceManagement';
import SystemSettings from '@/pages/settings/SystemSettings';
import UserManagement from '@/pages/settings/UserManagement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'cage', element: <CageList /> },
      { path: 'cage/:id', element: <CageDetail /> },
      { path: 'fry', element: <FryReleaseList /> },
      { path: 'feeding', element: <FeedingManagement /> },
      { path: 'feeding/schedule', element: <FeedingSchedule /> },
      { path: 'water', element: <WaterMonitoring /> },
      { path: 'water/alerts', element: <RedTideAlerts /> },
      { path: 'disease', element: <DiseaseControl /> },
      { path: 'disease/diagnosis', element: <DiseaseDiagnosis /> },
      { path: 'disease/inspection', element: <DivingInspection /> },
      { path: 'disease/net-check', element: <NetCheck /> },
      { path: 'typhoon', element: <TyphoonDefense /> },
      { path: 'typhoon/plan', element: <EmergencyPlan /> },
      { path: 'harvest', element: <HarvestManagement /> },
      { path: 'harvest/transport', element: <LiveTransport /> },
      { path: 'finance', element: <FinanceManagement /> },
      { path: 'settings', element: <SystemSettings /> },
      { path: 'settings/users', element: <UserManagement /> },
    ],
  },
]);

export default router;
