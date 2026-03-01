import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [leave, setLeave] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const stored = localStorage.getItem('hr_user');
        if (!stored) { navigate('/login'); return; }
        const parsedUser = JSON.parse(stored);
        if (parsedUser.role !== 'Employee') {
            navigate('/dashboard'); // Redirect non-employees
            return;
        }
        setUser(parsedUser);

        const fetchMyData = async () => {
            try {
                const [profRes, attRes, leaveRes, payRes] = await Promise.all([
                    API.get('/me'),
                    API.get('/me/attendance'),
                    API.get('/me/leave'),
                    API.get('/me/payroll')
                ]);
                setProfile(profRes.data.data);
                setAttendance(attRes.data.data);
                setLeave(leaveRes.data.data);
                setPayroll(payRes.data.data);
            } catch (err) {
                if (err.response?.status === 401) { navigate('/login'); return; }
                console.error('Error fetching employee data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('hr_token');
        localStorage.removeItem('hr_user');
        navigate('/login');
    };

    if (!user || loading) return <div style={s.container}><p style={{ padding: '40px' }}>Loading Employee Dashboard...</p></div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div style={s.tabContent}>
                        {profile ? (
                            <div style={s.profileCard}>
                                <h2>{profile.first_name} {profile.last_name}</h2>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Contact:</strong> {profile.contact_number}</p>
                                <p><strong>Department:</strong> {profile.department}</p>
                                <p><strong>Position:</strong> {profile.position}</p>
                                <p><strong>Employment Status:</strong> {profile.employment_status}</p>
                                <p><strong>Date Hired:</strong> {profile.date_hired}</p>
                            </div>
                        ) : <p>Profile data not found.</p>}
                    </div>
                );
            case 'attendance':
                return (
                    <div style={s.tabContent}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time In</th>
                                    <th>Time Out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>No attendance records.</td></tr> :
                                    attendance.map((rec) => (
                                        <tr key={rec.id}>
                                            <td>{rec.date}</td>
                                            <td>{rec.time_in || '-'}</td>
                                            <td>{rec.time_out || '-'}</td>
                                            <td>{rec.status}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'leave':
                return (
                    <div style={s.tabContent}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leave.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No leave records.</td></tr> :
                                    leave.map((rec) => (
                                        <tr key={rec.id}>
                                            <td>{rec.type}</td>
                                            <td>{rec.start_date}</td>
                                            <td>{rec.end_date}</td>
                                            <td>{rec.reason}</td>
                                            <td>{rec.status}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'payroll':
                return (
                    <div style={s.tabContent}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Days Worked</th>
                                    <th>Absences</th>
                                    <th>Gross Salary</th>
                                    <th>Deductions</th>
                                    <th>Net Salary</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center' }}>No payroll records.</td></tr> :
                                    payroll.map((rec) => (
                                        <tr key={rec.id}>
                                            <td>{rec.year}-{String(rec.month).padStart(2, '0')}</td>
                                            <td>{rec.days_worked}</td>
                                            <td>{rec.absences}</td>
                                            <td>${rec.gross_salary?.toFixed(2)}</td>
                                            <td>${rec.total_deductions?.toFixed(2)}</td>
                                            <td>${rec.net_salary?.toFixed(2)}</td>
                                            <td>{rec.status}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={s.container}>
            <nav style={s.nav}>
                <span style={s.navBrand}>HR System - Employee Portal</span>
                <div style={s.navLinks}>
                    <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.headerGroup}>
                    <h1 style={s.heading}>Welcome, {user.name}</h1>
                    <p style={s.sub}>Employee Self-Service Dashboard</p>
                </div>

                <div style={s.tabsContainer}>
                    <button style={activeTab === 'profile' ? s.activeTab : s.tab} onClick={() => setActiveTab('profile')}>My Profile</button>
                    <button style={activeTab === 'attendance' ? s.activeTab : s.tab} onClick={() => setActiveTab('attendance')}>My Attendance</button>
                    <button style={activeTab === 'leave' ? s.activeTab : s.tab} onClick={() => setActiveTab('leave')}>My Leave</button>
                    <button style={activeTab === 'payroll' ? s.activeTab : s.tab} onClick={() => setActiveTab('payroll')}>My Payroll</button>
                </div>

                {renderTabContent()}
            </main>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: '#f8fafc' },
    nav: {
        background: '#1e293b', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px',
    },
    navBrand: { color: '#fff', fontWeight: '700', fontSize: '18px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    logoutBtn: {
        background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    },
    main: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
    headerGroup: { marginBottom: '24px' },
    heading: { margin: '0 0 4px', fontSize: '26px', color: '#0f172a' },
    sub: { margin: '0 0 24px', color: '#64748b', fontSize: '15px' },

    tabsContainer: { display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' },
    tab: {
        padding: '10px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent',
        color: '#64748b', cursor: 'pointer', fontSize: '15px', fontWeight: '500'
    },
    activeTab: {
        padding: '10px 20px', background: 'none', border: 'none', borderBottom: '2px solid #3b82f6',
        color: '#3b82f6', cursor: 'pointer', fontSize: '15px', fontWeight: '600'
    },

    tabContent: { background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '300px' },
    profileCard: { display: 'grid', gap: '12px' },

    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { background: '#f1f5f9', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', borderBottom: '1px solid #e2e8f0' },
};
