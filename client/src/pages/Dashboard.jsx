import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    PointElement, LineElement, ArcElement
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [hiringTrend, setHiringTrend] = useState([]);
    const [payrollTrend, setPayrollTrend] = useState([]);
    const [trainingData, setTrainingData] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('hr_user');
        if (!stored) { navigate('/login'); return; }
        setUser(JSON.parse(stored));

        const fetchDashData = async () => {
            try {
                const [sumRes, hireRes, payRes, trainRes] = await Promise.all([
                    API.get('/dashboard/summary'),
                    API.get('/dashboard/hiring-trend'),
                    API.get('/dashboard/payroll-trend'),
                    API.get('/dashboard/training-completion')
                ]);

                setSummary(sumRes.data.data);
                setHiringTrend(hireRes.data.data);
                setPayrollTrend(payRes.data.data);
                setTrainingData(trainRes.data.data);
            } catch (err) {
                if (err.response?.status === 401) { navigate('/login'); return; }
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('hr_token');
        localStorage.removeItem('hr_user');
        navigate('/login');
    };

    if (!user || loading) return <div style={s.container}><p style={{ padding: '40px' }}>Loading layout...</p></div>;

    // Chart Data Preparation
    const hiringChart = {
        labels: hiringTrend.map(row => row.month),
        datasets: [{
            label: 'Employees Hired',
            data: hiringTrend.map(row => row.count),
            backgroundColor: '#3b82f6',
            borderRadius: 4
        }]
    };

    const payrollChart = {
        labels: payrollTrend.map(row => `${row.year}-${row.month.toString().padStart(2, '0')}`),
        datasets: [{
            label: 'Total Net Salary Disbursed ($)',
            data: payrollTrend.map(row => row.total_net),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
        }]
    };

    const trainChart = {
        labels: trainingData.map(row => row.status),
        datasets: [{
            label: 'Training Status',
            data: trainingData.map(row => row.count),
            backgroundColor: ['#f59e0b', '#10b981'],
            borderWidth: 0
        }]
    };

    return (
        <div style={s.container}>
            <nav style={s.nav}>
                <span style={s.navBrand}>HR Management System</span>
                <div style={s.navLinks}>
                    <Link to="/dashboard" style={{ ...s.navLink, color: '#fff', fontWeight: '600' }}>Dashboard</Link>
                    <Link to="/employees" style={s.navLink}>Employees</Link>
                    <Link to="/applicants" style={s.navLink}>Applicants</Link>
                    <Link to="/training" style={s.navLink}>Training</Link>
                    <Link to="/payroll" style={s.navLink}>Payroll</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.headerGroup}>
                    <div>
                        <h1 style={s.heading}>Welcome back, {user.name}!</h1>
                        <p style={s.sub}>Dashboard Overview • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Top Summary Cards */}
                {summary && (
                    <div style={s.summaryGrid}>
                        <div style={s.sumCard}>
                            <div style={s.sumIcon}>👥</div>
                            <div>
                                <p style={s.sumLabel}>Active Employees</p>
                                <h3 style={s.sumValue}>{summary.active_employees} <span style={s.sumTotal}>/ {summary.total_employees} Total </span></h3>
                            </div>
                        </div>
                        <div style={s.sumCard}>
                            <div style={s.sumIcon}>📋</div>
                            <div>
                                <p style={s.sumLabel}>Total Applicants</p>
                                <h3 style={s.sumValue}>{summary.total_applicants}</h3>
                            </div>
                        </div>
                        <div style={s.sumCard}>
                            <div style={s.sumIcon}>✨</div>
                            <div>
                                <p style={s.sumLabel}>Hired This Month</p>
                                <h3 style={s.sumValue}>{summary.hired_this_month}</h3>
                            </div>
                        </div>
                        <div style={s.sumCard}>
                            <div style={s.sumIcon}>💰</div>
                            <div>
                                <p style={s.sumLabel}>Monthly Payroll</p>
                                <h3 style={s.sumValue}>${summary.monthly_payroll_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Row */}
                <div style={s.chartGrid}>
                    <div style={s.chartBox}>
                        <h3 style={s.chartTitle}>Hiring Trend (Last 6 Months)</h3>
                        <div style={s.chartWrapper}>
                            {hiringTrend.length > 0 ? <Bar data={hiringChart} options={{ responsive: true, maintainAspectRatio: false }} /> : <p style={s.emptyChart}>No data</p>}
                        </div>
                    </div>

                    <div style={s.chartBox}>
                        <h3 style={s.chartTitle}>Payroll Disbursed Trend</h3>
                        <div style={s.chartWrapper}>
                            {payrollTrend.length > 0 ? <Line data={payrollChart} options={{ responsive: true, maintainAspectRatio: false }} /> : <p style={s.emptyChart}>No data</p>}
                        </div>
                    </div>

                    <div style={{ ...s.chartBox, gridColumn: 'span 1' }}>
                        <h3 style={s.chartTitle}>Training Completion Rate</h3>
                        <div style={{ ...s.chartWrapper, display: 'flex', justifyContent: 'center' }}>
                            {trainingData.length > 0 ? <Doughnut data={trainChart} options={{ responsive: true, maintainAspectRatio: false }} /> : <p style={s.emptyChart}>No data</p>}
                        </div>
                    </div>
                </div>

                {/* Quick Nav Row (from previous dashboard) */}
                <h3 style={{ ...s.heading, fontSize: '18px', marginTop: '32px' }}>Quick Links</h3>
                <div style={s.cardRow}>
                    <Link to="/employees" style={s.card}>
                        <div style={s.cardIcon}>👥</div>
                        <div style={s.cardLabel}>Employees</div>
                    </Link>
                    <Link to="/applicants" style={s.card}>
                        <div style={s.cardIcon}>📋</div>
                        <div style={s.cardLabel}>Applicants</div>
                    </Link>
                    <Link to="/training" style={s.card}>
                        <div style={s.cardIcon}>🎓</div>
                        <div style={s.cardLabel}>Training</div>
                    </Link>
                    <Link to="/payroll" style={s.card}>
                        <div style={s.cardIcon}>💰</div>
                        <div style={s.cardLabel}>Payroll</div>
                    </Link>
                </div>
            </main>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: '#f0f2f5' },
    nav: {
        background: '#1a1a2e', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px',
    },
    navBrand: { color: '#fff', fontWeight: '700', fontSize: '18px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    navLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' },
    logoutBtn: {
        background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    },
    main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    headerGroup: { marginBottom: '24px' },
    heading: { margin: '0 0 4px', fontSize: '26px', color: '#1a1a2e' },
    sub: { margin: '0 0 6px', color: '#64748b', fontSize: '14px' },

    // Custom summary cards
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
    sumCard: { background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
    sumIcon: { fontSize: '32px', background: '#f8fafc', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' },
    sumLabel: { margin: '0 0 4px', fontSize: '13px', color: '#64748b', fontWeight: '500' },
    sumValue: { margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '700' },
    sumTotal: { fontSize: '13px', color: '#94a3b8', fontWeight: '500' },

    // Charts
    chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
    chartBox: { background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' },
    chartTitle: { margin: '0 0 16px', fontSize: '15px', color: '#1e293b' },
    chartWrapper: { height: '220px', width: '100%', position: 'relative' },
    emptyChart: { color: '#cbd5e1', fontStyle: 'italic', textAlign: 'center', paddingTop: '80px', fontSize: '14px' },

    // Quick nav row
    cardRow: { display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' },
    card: {
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textDecoration: 'none', color: '#1a1a2e',
        display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px'
    },
    cardIcon: { fontSize: '24px' },
    cardLabel: { fontWeight: '600', fontSize: '15px' },
};
