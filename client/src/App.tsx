import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import MemberDashboard from './pages/MemberDashboard';

import AdminMembers from './pages/AdminMembers';
import AdminTrainers from './pages/AdminTrainers';
import AdminMemberships from './pages/AdminMemberships';
import AdminAttendance from './pages/AdminAttendance';
import AdminCalendar from './pages/AdminCalendar';
import AdminSettings from './pages/AdminSettings';
import AdminAudit from './pages/AdminAudit';
import Profile from './pages/Profile';
import AdminReports from './pages/AdminReports';
import TrainerClasses from './pages/TrainerClasses';
import TrainerWorkouts from './pages/TrainerWorkouts';
import TrainerCalendar from './pages/TrainerCalendar';
import MemberClasses from './pages/MemberClasses';
import MemberWorkouts from './pages/MemberWorkouts';
import MemberPayments from './pages/MemberPayments';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/trainers" element={<AdminTrainers />} />
          <Route path="/admin/memberships" element={<AdminMemberships />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/trainer/classes" element={<TrainerClasses />} />
          <Route path="/trainer/workouts" element={<TrainerWorkouts />} />
          <Route path="/trainer/calendar" element={<TrainerCalendar />} />
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/classes" element={<MemberClasses />} />
          <Route path="/member/workouts" element={<MemberWorkouts />} />
          <Route path="/member/payments" element={<MemberPayments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
