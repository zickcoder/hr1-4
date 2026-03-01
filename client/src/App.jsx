import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Applicants from './pages/Applicants';
import SalarySetup from './pages/SalarySetup';
import PayrollList from './pages/PayrollList';
import Training from './pages/Training';
import Competencies from './pages/Competencies';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('hr_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/employee-dashboard" element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>} />
        <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
        <Route path="/employees/:id" element={<PrivateRoute><EmployeeProfile /></PrivateRoute>} />
        <Route path="/applicants" element={<PrivateRoute><Applicants /></PrivateRoute>} />
        <Route path="/training" element={<PrivateRoute><Training /></PrivateRoute>} />
        <Route path="/competencies" element={<PrivateRoute><Competencies /></PrivateRoute>} />
        <Route path="/salary-setup" element={<PrivateRoute><SalarySetup /></PrivateRoute>} />
        <Route path="/payroll" element={<PrivateRoute><PayrollList /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

