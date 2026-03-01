import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const STATUS_COLORS = {
    Pending: { bg: '#fef3c7', color: '#d97706' },
    Approved: { bg: '#dbeafe', color: '#1d4ed8' },
    Paid: { bg: '#dcfce7', color: '#15803d' },
};

export default function PayrollList() {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', isError: false });

    // Generation Modal
    const [showGenerate, setShowGenerate] = useState(false);
    const [genForm, setGenForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [generating, setGenerating] = useState(false);

    // Filters
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');
    const isHRAdmin = user.role === 'SuperAdmin' || user.role === 'HRAdmin';

    const toast = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback({ msg: '', isError: false }), 4000);
    };

    const fetchPayrolls = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get(`/payroll?month=${filterMonth}&year=${filterYear}`);
            setPayrolls(res.data.data);
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load payroll records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [filterMonth, filterYear]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await API.post('/payroll/generate', {
                month: parseInt(genForm.month),
                year: parseInt(genForm.year),
            });
            toast(`✅ ${res.data.message}`);
            setShowGenerate(false);

            // Auto-filter to the newly generated month
            setFilterMonth(parseInt(genForm.month));
            setFilterYear(parseInt(genForm.year));
            fetchPayrolls();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to generate payroll.', true);
        } finally {
            setGenerating(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await API.put(`/payroll/${id}`, { status: newStatus });
            toast(`Payroll marked as ${newStatus}.`);
            fetchPayrolls();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update status.', true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hr_token');
        localStorage.removeItem('hr_user');
        navigate('/login');
    };

    return (
        <div style={s.container}>
            <nav style={s.nav}>
                <span style={s.navBrand}>HR Management System</span>
                <div style={s.navLinks}>
                    <Link to="/dashboard" style={s.navLink}>Dashboard</Link>
                    <Link to="/employees" style={s.navLink}>Employees</Link>
                    <Link to="/applicants" style={s.navLink}>Applicants</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.header}>
                    <div>
                        <h1 style={s.heading}>Payroll Processing</h1>
                        <p style={s.subhead}>HR4 — Disburse Wages & Manage Approvals</p>
                    </div>
                    <div style={s.headerActions}>
                        <Link to="/salary-setup" style={s.setupBtn}>⚙️ Salary Setup</Link>
                        {isHRAdmin && (
                            <button onClick={() => setShowGenerate(true)} style={s.generateBtn}>⚡ Auto Generate</button>
                        )}
                    </div>
                </div>

                {feedback.msg && (
                    <div style={{ ...s.feedback, background: feedback.isError ? '#fee2e2' : '#dcfce7', color: feedback.isError ? '#dc2626' : '#16a34a' }}>
                        {feedback.msg}
                    </div>
                )}

                {/* Generate Modal */}
                {showGenerate && (
                    <div style={s.modalOverlay}>
                        <div style={s.modalBox}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Generate Payroll</h2>
                            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={s.label}>Month</label>
                                        <select value={genForm.month} onChange={e => setGenForm({ ...genForm, month: e.target.value })} style={s.input}>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={s.label}>Year</label>
                                        <input type="number" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: e.target.value })} style={s.input} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowGenerate(false)} style={s.cancelBtn} disabled={generating}>Cancel</button>
                                    <button type="submit" style={s.generateBtn} disabled={generating}>{generating ? 'Running...' : 'Generate'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div style={s.filterBar}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter by Period:</span>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={s.filterSelect}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={s.filterSelect} />
                </div>

                {loading ? (
                    <p style={s.loading}>Loading payroll records...</p>
                ) : error ? (
                    <div style={s.errorBox}>{error}</div>
                ) : payrolls.length === 0 ? (
                    <div style={s.emptyBox}>
                        <p style={{ margin: 0 }}>No payroll generated for this period.</p>
                        {isHRAdmin && <button onClick={() => setShowGenerate(true)} style={{ ...s.generateBtn, marginTop: '12px' }}>Generate Now</button>}
                    </div>
                ) : (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>Emp ID</th>
                                    <th style={s.th}>Name</th>
                                    <th style={s.th}>Period</th>
                                    <th style={s.th}>Work / Abs</th>
                                    <th style={s.th}>Gross Pay</th>
                                    <th style={s.th}>Deductions</th>
                                    <th style={s.th}>Net Salary</th>
                                    <th style={s.th}>Status</th>
                                    {isHRAdmin && <th style={s.th}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.map((pr, i) => {
                                    const tag = STATUS_COLORS[pr.status] || STATUS_COLORS.Pending;
                                    return (
                                        <tr key={pr.id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td style={s.td}>{pr.employee_id}</td>
                                            <td style={s.td}>{pr.first_name} {pr.last_name}</td>
                                            <td style={s.td}>{pr.month}/{pr.year}</td>
                                            <td style={s.td}>{pr.days_worked}d / <span style={{ color: '#dc2626' }}>{pr.absences}d</span></td>
                                            <td style={s.td}>${pr.gross_salary.toFixed(2)}</td>
                                            <td style={s.td}>-${pr.total_deductions.toFixed(2)}</td>
                                            <td style={{ ...s.td, fontWeight: '700', color: '#1a1a2e' }}>${pr.net_salary.toFixed(2)}</td>
                                            <td style={s.td}>
                                                <span style={{ ...s.badge, background: tag.bg, color: tag.color }}>{pr.status}</span>
                                            </td>
                                            {isHRAdmin && (
                                                <td style={s.td}>
                                                    {pr.status === 'Pending' && (
                                                        <button onClick={() => updateStatus(pr.id, 'Approved')} style={s.approveBtn}>Approve</button>
                                                    )}
                                                    {pr.status === 'Approved' && (
                                                        <button onClick={() => updateStatus(pr.id, 'Paid')} style={s.payBtn}>Mark Paid</button>
                                                    )}
                                                    {pr.status === 'Paid' && <span style={{ fontSize: '12px', color: '#64748b' }}>✔ Check disbursed</span>}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

const s = {
    container: { minHeight: '100vh', background: '#f0f2f5' },
    nav: {
        background: '#1a1a2e', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px',
    },
    navBrand: { color: '#fff', fontWeight: '700', fontSize: '18px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    navLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' },
    logoutBtn: {
        background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1',
        padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    },
    main: { padding: '32px' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' },
    heading: { margin: '0 0 4px', fontSize: '24px', color: '#1a1a2e' },
    subhead: { margin: 0, color: '#64748b', fontSize: '13px' },
    headerActions: { display: 'flex', gap: '12px' },
    setupBtn: {
        padding: '9px 16px', background: '#fff', border: '1px solid #cbd5e1', color: '#333',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
    },
    generateBtn: {
        padding: '9px 16px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    feedback: { padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },

    // Filters
    filterBar: {
        background: '#fff', padding: '12px 16px', borderRadius: '8px',
        border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px'
    },
    filterSelect: { padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' },

    // Modal
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    },
    modalBox: { background: '#fff', padding: '24px', borderRadius: '8px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    label: { fontSize: '12px', fontWeight: '600', color: '#333' },
    input: { padding: '8px 10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', width: '100%', boxSizing: 'border-box' },
    cancelBtn: { padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '5px', cursor: 'pointer' },

    // Table
    tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse', overflow: 'hidden' },
    thead: { background: '#1a1a2e' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#f1f5f9', fontSize: '13px', fontWeight: '600' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f8fafc' },
    td: { padding: '11px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'inline-block' },
    approveBtn: { padding: '5px 12px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#2563eb', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    payBtn: { padding: '5px 12px', background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
    emptyBox: { padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' },
};
