import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [leave, setLeave] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [training, setTraining] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                // Fetch basic info
                const empRes = await API.get('/employees');
                const empInfo = empRes.data.data.find(e => e.employee_id.toString() === id);
                if (!empInfo) throw new Error('Employee not found');
                setEmployee(empInfo);

                // Fetch related info, catch errors individually if endpoints fail
                const fetchSafe = async (url) => {
                    try { const res = await API.get(url); return res.data.data || []; } catch { return []; }
                }

                // API calls for full profile
                // NOTE: Using general endpoints or dedicated endpoints if they existed, fallback to filtering client-side if needed MVP since backend doesn't have employee_id specific routes for everything yet.
                // We'll use the existing /api/employees list and others

                // Attendance
                const attData = await fetchSafe('/attendance');
                setAttendance(attData.filter(a => a.employee_id.toString() === id));

                // Leave
                const leaveData = await fetchSafe('/leave');
                setLeave(leaveData.filter(l => l.employee_id.toString() === id));

                // Payroll
                const payData = await fetchSafe('/payroll');
                setPayroll(payData.filter(p => p.employee_id.toString() === id));

                // Training
                const trainData = await fetchSafe('/training/enrollments');
                setTraining(trainData.filter(t => t.employee_id.toString() === id));

            } catch (err) {
                console.error('Error fetching employee full profile:', err);
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [id, navigate]);

    if (loading) return <div style={s.container}><p style={{ padding: '40px' }}>Loading Employee Profile...</p></div>;
    if (!employee) return <div style={s.container}><p style={{ padding: '40px' }}>Employee not found.</p></div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div style={s.tabContent}>
                        <div style={s.profileCard}>
                            <p><strong>Email:</strong> {employee.email}</p>
                            <p><strong>Contact:</strong> {employee.contact_number || '-'}</p>
                            <p><strong>Department:</strong> {employee.department || '-'}</p>
                            <p><strong>Position:</strong> {employee.position || '-'}</p>
                            <p><strong>Employment Status:</strong> {employee.employment_status}</p>
                            <p><strong>Date Hired:</strong> {employee.date_hired || '-'}</p>
                            <p><strong>Branch Location:</strong> {employee.branch_location || '-'}</p>
                            <p><strong>Status:</strong> {employee.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                );
            case 'attendance':
                return (
                    <div style={s.tabContent}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Date</th>
                                    <th style={s.th}>Time In</th>
                                    <th style={s.th}>Time Out</th>
                                    <th style={s.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length === 0 ? <tr><td colSpan="4" style={s.tdCenter}>No attendance records.</td></tr> :
                                    attendance.map((rec) => (
                                        <tr key={rec.id}>
                                            <td style={s.td}>{rec.date}</td>
                                            <td style={s.td}>{rec.time_in || '-'}</td>
                                            <td style={s.td}>{rec.time_out || '-'}</td>
                                            <td style={s.td}>{rec.status}</td>
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
                                    <th style={s.th}>Type</th>
                                    <th style={s.th}>Start Date</th>
                                    <th style={s.th}>End Date</th>
                                    <th style={s.th}>Reason</th>
                                    <th style={s.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leave.length === 0 ? <tr><td colSpan="5" style={s.tdCenter}>No leave records.</td></tr> :
                                    leave.map((rec) => (
                                        <tr key={rec.id}>
                                            <td style={s.td}>{rec.type}</td>
                                            <td style={s.td}>{rec.start_date}</td>
                                            <td style={s.td}>{rec.end_date}</td>
                                            <td style={s.td}>{rec.reason}</td>
                                            <td style={s.td}>{rec.status}</td>
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
                                    <th style={s.th}>Period</th>
                                    <th style={s.th}>Days Worked</th>
                                    <th style={s.th}>Absences</th>
                                    <th style={s.th}>Gross Salary</th>
                                    <th style={s.th}>Deductions</th>
                                    <th style={s.th}>Net Salary</th>
                                    <th style={s.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll.length === 0 ? <tr><td colSpan="7" style={s.tdCenter}>No payroll records.</td></tr> :
                                    payroll.map((rec) => (
                                        <tr key={rec.id}>
                                            <td style={s.td}>{rec.year}-{String(rec.month).padStart(2, '0')}</td>
                                            <td style={s.td}>{rec.days_worked}</td>
                                            <td style={s.td}>{rec.absences}</td>
                                            <td style={s.td}>${rec.gross_salary?.toFixed(2)}</td>
                                            <td style={s.td}>${rec.total_deductions?.toFixed(2)}</td>
                                            <td style={s.td}>${rec.net_salary?.toFixed(2)}</td>
                                            <td style={s.td}>{rec.status}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'training':
                return (
                    <div style={s.tabContent}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Training Title</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Completion Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {training.length === 0 ? <tr><td colSpan="3" style={s.tdCenter}>No training records.</td></tr> :
                                    training.map((rec) => (
                                        <tr key={rec.id}>
                                            <td style={s.td}>{rec.title}</td>
                                            <td style={s.td}>{rec.status}</td>
                                            <td style={s.td}>{rec.completion_date || '-'}</td>
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
                <span style={s.navBrand}>HR Management System</span>
                <div style={s.navLinks}>
                    <Link to="/employees" style={s.navLink}>Back to Employees</Link>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.headerGroup}>
                    <h1 style={s.heading}>{employee.first_name} {employee.last_name}</h1>
                    <p style={s.sub}>{employee.position} • {employee.department}</p>
                </div>

                <div style={s.tabsContainer}>
                    <button style={activeTab === 'profile' ? s.activeTab : s.tab} onClick={() => setActiveTab('profile')}>Profile</button>
                    <button style={activeTab === 'attendance' ? s.activeTab : s.tab} onClick={() => setActiveTab('attendance')}>Attendance</button>
                    <button style={activeTab === 'leave' ? s.activeTab : s.tab} onClick={() => setActiveTab('leave')}>Leave</button>
                    <button style={activeTab === 'payroll' ? s.activeTab : s.tab} onClick={() => setActiveTab('payroll')}>Payroll</button>
                    <button style={activeTab === 'training' ? s.activeTab : s.tab} onClick={() => setActiveTab('training')}>Training</button>
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
    navLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' },
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
    th: { background: '#f1f5f9', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '500', color: '#475569', fontSize: '14px' },
    td: { padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontSize: '14px' },
    tdCenter: { padding: '24px', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '14px', textAlign: 'center' },
};
