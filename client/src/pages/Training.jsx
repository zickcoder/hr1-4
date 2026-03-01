import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Training() {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', isError: false });

    // Creation form
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', description: '', type: 'Optional' });
    const [creating, setCreating] = useState(false);

    // Assign form
    const [assignTarget, setAssignTarget] = useState(null); // program id
    const [assignEmpId, setAssignEmpId] = useState('');
    const [assigning, setAssigning] = useState(false);

    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');
    const isHRAdmin = user.role === 'SuperAdmin' || user.role === 'HRAdmin';

    const toast = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback({ msg: '', isError: false }), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const pRes = await API.get('/training');
            setPrograms(pRes.data.data);
            if (isHRAdmin) {
                const eRes = await API.get('/employees');
                setEmployees(eRes.data.data);
            }
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load trainings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate, isHRAdmin]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await API.post('/training', createForm);
            toast('Training program created.');
            setShowCreate(false);
            setCreateForm({ title: '', description: '', type: 'Optional' });
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to create program.', true);
        } finally {
            setCreating(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignEmpId) return toast('Please select an employee', true);

        setAssigning(true);
        try {
            await API.post('/training/assign', { employee_id: assignEmpId, training_id: assignTarget });
            toast('Employee enrolled assigned successfully.');
            setAssignTarget(null);
            setAssignEmpId('');
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to assign.', true);
        } finally {
            setAssigning(false);
        }
    };

    const markComplete = async (enrollmentId) => {
        if (!window.confirm("Mark as completed?")) return;
        try {
            await API.put(`/training/${enrollmentId}/complete`, { certificate_link: '' });
            toast('Training marked as complete.');
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update.', true);
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
                        <h1 style={s.heading}>Training Programs</h1>
                        <p style={s.subhead}>HR2 — Talent Development & Learning</p>
                    </div>
                    <div style={s.headerActions}>
                        <Link to="/competencies" style={s.compBtn}>Go to Competencies →</Link>
                        {isHRAdmin && (
                            <button onClick={() => setShowCreate(!showCreate)} style={s.createBtn}>
                                {showCreate ? 'Cancel' : '+ New Program'}
                            </button>
                        )}
                    </div>
                </div>

                {feedback.msg && (
                    <div style={{ ...s.feedback, background: feedback.isError ? '#fee2e2' : '#dcfce7', color: feedback.isError ? '#dc2626' : '#16a34a' }}>
                        {feedback.msg}
                    </div>
                )}

                {/* Create Modal Area */}
                {showCreate && isHRAdmin && (
                    <form style={s.formBox} onSubmit={handleCreate}>
                        <h3 style={{ margin: '0 0 16px', color: '#1a1a2e' }}>Create Training Program</h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <input
                                placeholder="Title"
                                value={createForm.title}
                                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                                style={s.input}
                                required
                            />
                            <select
                                value={createForm.type}
                                onChange={e => setCreateForm({ ...createForm, type: e.target.value })}
                                style={{ ...s.input, width: '150px' }}
                            >
                                <option value="Optional">Optional</option>
                                <option value="Mandatory">Mandatory</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Description (Optional)"
                            value={createForm.description}
                            onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                            style={{ ...s.input, height: '60px', marginBottom: '16px', resize: 'none' }}
                        />
                        <button type="submit" style={s.submitBtn} disabled={creating}>
                            {creating ? 'Saving...' : 'Save Program'}
                        </button>
                    </form>
                )}

                {loading ? (
                    <p style={s.loading}>Loading training programs...</p>
                ) : error ? (
                    <div style={s.errorBox}>{error}</div>
                ) : programs.length === 0 ? (
                    <p style={s.emptyBox}>No training programs currently active.</p>
                ) : (
                    <div style={s.grid}>
                        {programs.map(prog => (
                            <div key={prog.id} style={s.card}>
                                <div style={s.cardHeader}>
                                    <h3 style={s.cardTitle}>{prog.title}</h3>
                                    <span style={prog.type === 'Mandatory' ? s.tagReq : s.tagOpt}>{prog.type}</span>
                                </div>
                                <p style={s.cardDesc}>{prog.description || 'No description provided.'}</p>

                                <div style={s.enrollSection}>
                                    <h4 style={s.enrollTitle}>Enrollments ({prog.enrollments?.length || 0})</h4>

                                    {prog.enrollments?.length > 0 ? (
                                        <ul style={s.empList}>
                                            {prog.enrollments.map(e => (
                                                <li key={e.id} style={s.empItem}>
                                                    <span>{e.first_name} {e.last_name}</span>
                                                    <span style={s.statusPack}>
                                                        <span style={e.status === 'Completed' ? s.statComp : s.statEnr}>{e.status}</span>
                                                        {isHRAdmin && e.status === 'Enrolled' && (
                                                            <button onClick={() => markComplete(e.id)} style={s.compBtnSm}>✓</button>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>No employees assigned yet.</p>
                                    )}

                                    {/* Inline Assign Block */}
                                    {isHRAdmin && (
                                        assignTarget === prog.id ? (
                                            <form onSubmit={handleAssign} style={s.assignForm}>
                                                <select
                                                    value={assignEmpId}
                                                    onChange={(e) => setAssignEmpId(e.target.value)}
                                                    style={s.selectList}
                                                >
                                                    <option value="">Select Employee...</option>
                                                    {employees.map(e => (
                                                        <option key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</option>
                                                    ))}
                                                </select>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button type="button" onClick={() => setAssignTarget(null)} style={s.cancelSm} disabled={assigning}>✕</button>
                                                    <button type="submit" style={s.saveSm} disabled={assigning}>Add</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button onClick={() => setAssignTarget(prog.id)} style={s.startAssignBtn}>+ Assign Employee</button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
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
    main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
    heading: { margin: '0 0 4px', fontSize: '24px', color: '#1a1a2e' },
    subhead: { margin: 0, color: '#64748b', fontSize: '13px' },
    headerActions: { display: 'flex', gap: '12px' },
    compBtn: {
        padding: '9px 16px', background: '#fff', border: '1px solid #cbd5e1', color: '#333',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
    },
    createBtn: {
        padding: '9px 16px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    feedback: { padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },

    // Forms
    formBox: { background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' },
    input: { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '5px', width: '100%', boxSizing: 'border-box' },
    submitBtn: { padding: '9px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' },

    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
    emptyBox: { padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' },

    // Grid
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    card: { background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    cardTitle: { margin: 0, fontSize: '17px', color: '#1a1a2e' },
    tagReq: { fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' },
    tagOpt: { fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' },
    cardDesc: { margin: '0 0 16px', fontSize: '13px', color: '#475569', lineHeight: '1.5' },

    enrollSection: { marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' },
    enrollTitle: { margin: '0 0 8px', fontSize: '13px', color: '#334155' },
    empList: { listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: '6px' },
    empItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px' },
    statusPack: { display: 'flex', alignItems: 'center', gap: '4px' },
    statComp: { fontSize: '10px', color: '#16a34a', fontWeight: '700' },
    statEnr: { fontSize: '10px', color: '#d97706', fontWeight: '700' },
    compBtnSm: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '3px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' },

    startAssignBtn: { background: 'transparent', border: '1px dashed #cbd5e1', color: '#64748b', padding: '6px', width: '100%', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    assignForm: { display: 'flex', gap: '6px' },
    selectList: { flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' },
    cancelSm: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#333', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' },
    saveSm: { background: '#2563eb', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};
