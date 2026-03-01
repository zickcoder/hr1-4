import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import EmployeeForm from '../components/EmployeeForm';

export default function Employees() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Account Creation State
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountTarget, setAccountTarget] = useState(null);
    const [accountEmail, setAccountEmail] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get('/employees');
            setEmployees(res.data.data);
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('hr_token');
        if (!token) { navigate('/login'); return; }
        fetchEmployees();
    }, [navigate]);

    const handleCreate = async (form) => {
        setFormLoading(true);
        try {
            await API.post('/employees', form);
            setFeedback('Employee created successfully.');
            setShowForm(false);
            fetchEmployees();
        } catch (err) {
            setFeedback('Error: ' + (err.response?.data?.message || 'Failed to create.'));
        } finally {
            setFormLoading(false);
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    const handleUpdate = async (form) => {
        setFormLoading(true);
        try {
            await API.put(`/employees/${editTarget.employee_id}`, form);
            setFeedback('Employee updated successfully.');
            setEditTarget(null);
            fetchEmployees();
        } catch (err) {
            setFeedback('Error: ' + (err.response?.data?.message || 'Failed to update.'));
        } finally {
            setFormLoading(false);
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Deactivate employee "${name}"?`)) return;
        try {
            await API.delete(`/employees/${id}`);
            setFeedback('Employee deactivated.');
            fetchEmployees();
        } catch (err) {
            setFeedback('Error: ' + (err.response?.data?.message || 'Failed to deactivate.'));
        } finally {
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hr_token');
        localStorage.removeItem('hr_user');
        navigate('/login');
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await API.post('/users/create-employee-account', {
                employee_id: accountTarget.employee_id,
                email: accountEmail
            });
            setFeedback('Employee account created successfully.');
            setShowAccountModal(false);
            setAccountTarget(null);
            setAccountEmail('');
            fetchEmployees();
        } catch (err) {
            setFeedback('Error: ' + (err.response?.data?.message || 'Failed to create account.'));
        } finally {
            setFormLoading(false);
            setTimeout(() => setFeedback(''), 5000);
        }
    };

    const isEditor = user.role === 'SuperAdmin' || user.role === 'HRAdmin';

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <span style={styles.navBrand}>HR Management System</span>
                <div style={styles.navLinks}>
                    <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
                    <Link to="/employees" style={styles.navLink}>Employees</Link>
                    <Link to="/applicants" style={styles.navLink}>Applicants</Link>
                    <Link to="/training" style={styles.navLink}>Training</Link>
                    <Link to="/payroll" style={styles.navLink}>Payroll</Link>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.heading}>Employees</h1>
                    {isEditor && !showForm && !editTarget && (
                        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
                            + Add Employee
                        </button>
                    )}
                </div>

                {feedback && (
                    <div style={{
                        ...styles.feedback,
                        background: feedback.startsWith('Error') ? '#fee2e2' : '#dcfce7',
                        color: feedback.startsWith('Error') ? '#dc2626' : '#16a34a',
                    }}>
                        {feedback}
                    </div>
                )}

                {/* Add Form */}
                {showForm && (
                    <div style={styles.formBox}>
                        <h2 style={styles.formTitle}>Add New Employee</h2>
                        <EmployeeForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowForm(false)}
                            loading={formLoading}
                        />
                    </div>
                )}

                {/* Edit Form */}
                {editTarget && (
                    <div style={styles.formBox}>
                        <h2 style={styles.formTitle}>Edit Employee</h2>
                        <EmployeeForm
                            initial={editTarget}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditTarget(null)}
                            loading={formLoading}
                        />
                    </div>
                )}

                {/* Account Creation Modal */}
                {showAccountModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3>Create Account for {accountTarget.first_name} {accountTarget.last_name}</h3>
                            <form onSubmit={handleCreateAccount}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Login Email</label>
                                    <input
                                        type="email"
                                        value={accountEmail}
                                        onChange={(e) => setAccountEmail(e.target.value)}
                                        style={styles.input}
                                        required
                                        placeholder="employee@test.com"
                                    />
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                                    A secure temporary password will be generated automatically.
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" disabled={formLoading} style={styles.addBtn}>
                                        {formLoading ? 'Generating...' : 'Create Account'}
                                    </button>
                                    <button type="button" onClick={() => { setShowAccountModal(false); setAccountTarget(null); }} style={styles.cancelBtn}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <p style={styles.loading}>Loading employees...</p>
                ) : error ? (
                    <div style={styles.errorBox}>{error}</div>
                ) : employees.length === 0 ? (
                    <p style={styles.empty}>No active employees found. Add one to get started.</p>
                ) : (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Department</th>
                                    <th style={styles.th}>Position</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Branch</th>
                                    <th style={styles.th}>Date Hired</th>
                                    {isEditor && <th style={styles.th}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={emp.employee_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        <td style={styles.td}>{emp.employee_id}</td>
                                        <td style={styles.td}>
                                            <Link to={`/employees/${emp.employee_id}`} style={styles.profileLink}>
                                                {emp.first_name} {emp.last_name}
                                            </Link>
                                        </td>
                                        <td style={styles.td}>{emp.email}</td>
                                        <td style={styles.td}>{emp.department || '—'}</td>
                                        <td style={styles.td}>{emp.position || '—'}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                background: emp.employment_status === 'Regular' ? '#dbeafe' : '#fef9c3',
                                                color: emp.employment_status === 'Regular' ? '#1d4ed8' : '#854d0e',
                                            }}>
                                                {emp.employment_status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{emp.branch_location || '—'}</td>
                                        <td style={styles.td}>{emp.date_hired ? emp.date_hired.split('T')[0] : '—'}</td>
                                        {isEditor && (
                                            <td style={styles.td}>
                                                <button onClick={() => setEditTarget(emp)} style={styles.editBtn}>Edit</button>

                                                {!emp.has_account ? (
                                                    <button
                                                        onClick={() => {
                                                            setAccountTarget(emp);
                                                            setAccountEmail(emp.email);
                                                            setShowAccountModal(true);
                                                        }}
                                                        style={styles.accountBtn}
                                                    >
                                                        Create Account
                                                    </button>
                                                ) : (
                                                    <div style={styles.accountInfo}>
                                                        <div style={styles.accountEmail}>{emp.user_email}</div>
                                                        <div style={styles.passwordRow}>
                                                            <span style={styles.passwordText}>
                                                                {showPasswords[emp.employee_id] ? emp.temporary_password : '••••••••••••'}
                                                            </span>
                                                            <button
                                                                style={styles.eyeBtn}
                                                                onClick={() => setShowPasswords(prev => ({
                                                                    ...prev, [emp.employee_id]: !prev[emp.employee_id]
                                                                }))}
                                                                title={showPasswords[emp.employee_id] ? "Hide Password" : "Show Password"}
                                                            >
                                                                {showPasswords[emp.employee_id] ? '👁️' : '🙈'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(emp.employee_id, `${emp.first_name} ${emp.last_name}`)}
                                                    style={styles.deleteBtn}
                                                >
                                                    Deactivate
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p style={styles.count}>{employees.length} active employee{employees.length !== 1 ? 's' : ''}</p>
            </main>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#f0f2f5' },
    nav: {
        background: '#1a1a2e',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
    },
    navBrand: { color: '#fff', fontWeight: '700', fontSize: '18px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    navLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid #64748b',
        color: '#cbd5e1',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    main: { padding: '32px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    heading: { margin: 0, fontSize: '24px', color: '#1a1a2e' },
    addBtn: {
        padding: '9px 18px',
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    feedback: {
        padding: '10px 16px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
    },
    formBox: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '28px',
        marginBottom: '24px',
    },
    formTitle: { margin: '0 0 20px', fontSize: '18px', color: '#1a1a2e' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' },
    thead: { background: '#1a1a2e' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#f1f5f9', fontSize: '13px', fontWeight: '600' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f8fafc' },
    td: { padding: '11px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    badge: {
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    editBtn: {
        padding: '5px 12px',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        color: '#16a34a',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '6px',
    },
    deleteBtn: {
        padding: '5px 12px',
        background: '#fff1f2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
    empty: { color: '#64748b', fontSize: '15px', marginTop: '20px' },
    count: { color: '#94a3b8', fontSize: '13px', marginTop: '12px' },
    profileLink: { color: '#2563eb', textDecoration: 'none', fontWeight: '500' },

    // Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: {
        background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' },
    input: {
        width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box'
    },
    formActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    cancelBtn: {
        padding: '9px 18px', background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
    },
    accountBtn: {
        padding: '5px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb',
        borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginRight: '6px'
    },
    accountInfo: { display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', marginRight: '10px', minWidth: '150px' },
    accountEmail: { fontSize: '11px', color: '#64748b', fontWeight: '500' },
    passwordRow: { display: 'flex', alignItems: 'center', gap: '5px' },
    passwordText: { fontSize: '12px', fontFamily: 'monospace', color: '#1a1a2e' },
    eyeBtn: {
        padding: '0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
};
