import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function SalarySetup() {
    const navigate = useNavigate();
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', isError: false });

    // For the inline edit form
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ basic_salary: 0, allowance: 0, deduction_per_absence: 0 });
    const [saveLoading, setSaveLoading] = useState(false);

    const toast = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback({ msg: '', isError: false }), 4000);
    };

    const fetchSalaries = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get('/salary');
            setSalaries(res.data.data);
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load salary structures.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, []);

    const handleEditClick = (emp) => {
        setEditingId(emp.employee_id);
        setEditForm({
            basic_salary: emp.basic_salary || 0,
            allowance: emp.allowance || 0,
            deduction_per_absence: emp.deduction_per_absence || 0,
        });
    };

    const handleFormChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSave = async (employee_id) => {
        setSaveLoading(true);
        try {
            if (editForm.basic_salary < 0 || editForm.allowance < 0 || editForm.deduction_per_absence < 0) {
                toast('Values cannot be negative.', true);
                return;
            }
            const payload = {
                employee_id,
                basic_salary: parseFloat(editForm.basic_salary) || 0,
                allowance: parseFloat(editForm.allowance) || 0,
                deduction_per_absence: parseFloat(editForm.deduction_per_absence) || 0
            };

            await API.post('/salary', payload);
            toast('Salary structure updated successfully.');
            setEditingId(null);
            fetchSalaries();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update salary.', true);
        } finally {
            setSaveLoading(false);
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
                    <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.header}>
                    <div>
                        <h1 style={s.heading}>Salary Setup</h1>
                        <p style={s.subhead}>HR4 — Configure Base Compensation per Employee</p>
                    </div>
                    <Link to="/payroll" style={s.payrollBtn}>Go to Payroll →</Link>
                </div>

                {feedback.msg && (
                    <div style={{ ...s.feedback, background: feedback.isError ? '#fee2e2' : '#dcfce7', color: feedback.isError ? '#dc2626' : '#16a34a' }}>
                        {feedback.msg}
                    </div>
                )}

                {loading ? (
                    <p style={s.loading}>Loading compensation structures...</p>
                ) : error ? (
                    <div style={s.errorBox}>{error}</div>
                ) : (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>Emp ID</th>
                                    <th style={s.th}>Name</th>
                                    <th style={s.th}>Department / Pos</th>
                                    <th style={s.th}>Basic Salary (Monthly)</th>
                                    <th style={s.th}>Allowance</th>
                                    <th style={s.th}>Deduction per Absence</th>
                                    <th style={s.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaries.map((emp, i) => {
                                    const isEditing = editingId === emp.employee_id;

                                    return (
                                        <tr key={emp.employee_id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td style={s.td}>{emp.employee_id}</td>
                                            <td style={s.td}>{emp.first_name} {emp.last_name}</td>
                                            <td style={s.td}>{emp.department || '—'} / {emp.position || '—'}</td>

                                            {isEditing ? (
                                                <>
                                                    <td style={s.td}>
                                                        <input type="number" name="basic_salary" value={editForm.basic_salary} onChange={handleFormChange} style={s.inlineInput} />
                                                    </td>
                                                    <td style={s.td}>
                                                        <input type="number" name="allowance" value={editForm.allowance} onChange={handleFormChange} style={s.inlineInput} />
                                                    </td>
                                                    <td style={s.td}>
                                                        <input type="number" name="deduction_per_absence" value={editForm.deduction_per_absence} onChange={handleFormChange} style={s.inlineInput} />
                                                    </td>
                                                    <td style={s.td}>
                                                        <div style={s.actionGroup}>
                                                            <button onClick={() => setEditingId(null)} style={s.cancelBtn} disabled={saveLoading}>Cancel</button>
                                                            <button onClick={() => handleSave(emp.employee_id)} style={s.saveBtn} disabled={saveLoading}>
                                                                {saveLoading ? '...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={s.td}>${emp.basic_salary.toFixed(2)}</td>
                                                    <td style={s.td}>${emp.allowance.toFixed(2)}</td>
                                                    <td style={s.td}>${emp.deduction_per_absence.toFixed(2)}</td>
                                                    <td style={s.td}>
                                                        <button onClick={() => handleEditClick(emp)} style={s.editBtn}>Edit Config</button>
                                                    </td>
                                                </>
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
    payrollBtn: {
        padding: '9px 18px', background: '#10b981', color: '#fff', textDecoration: 'none',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    feedback: { padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
    tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse', overflow: 'hidden' },
    thead: { background: '#1a1a2e' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#f1f5f9', fontSize: '13px', fontWeight: '600' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f8fafc' },
    td: { padding: '11px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    inlineInput: {
        width: '100px', padding: '5px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px'
    },
    actionGroup: { display: 'flex', gap: '6px' },
    editBtn: {
        padding: '5px 12px', background: '#f0fdf4', border: '1px solid #86efac',
        color: '#16a34a', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
    },
    saveBtn: {
        padding: '5px 12px', background: '#2563eb', border: 'none',
        color: '#fff', borderRadius: '5px', cursor: 'pointer', fontSize: '12px',
    },
    cancelBtn: {
        padding: '5px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1',
        color: '#333', borderRadius: '5px', cursor: 'pointer', fontSize: '12px'
    },
    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
};
