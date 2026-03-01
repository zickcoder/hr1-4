import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Competencies() {
    const navigate = useNavigate();
    const [competencies, setCompetencies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', isError: false });

    // Add Competency Form
    const [showAddComp, setShowAddComp] = useState(false);
    const [compForm, setCompForm] = useState({ name: '', description: '' });
    const [savingComp, setSavingComp] = useState(false);

    // Assign Competency Form
    const [showAssign, setShowAssign] = useState(false);
    const [assignForm, setAssignForm] = useState({ employee_id: '', competency_id: '', level: 'Beginner' });
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
            const cRes = await API.get('/competencies');
            setCompetencies(cRes.data.data);
            if (isHRAdmin) {
                const eRes = await API.get('/employees');
                setEmployees(eRes.data.data);
            }
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load competencies.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate, isHRAdmin]);

    const handleCreateCompetency = async (e) => {
        e.preventDefault();
        setSavingComp(true);
        try {
            await API.post('/competencies', compForm);
            toast('Competency created.');
            setShowAddComp(false);
            setCompForm({ name: '', description: '' });
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to create competency.', true);
        } finally {
            setSavingComp(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setAssigning(true);
        try {
            await API.post('/competencies/assign', assignForm);
            toast('Competency level assigned successfully.');
            setShowAssign(false);
            setAssignForm({ employee_id: '', competency_id: '', level: 'Beginner' });
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to assign competency.', true);
        } finally {
            setAssigning(false);
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
                        <h1 style={s.heading}>Competency Framework</h1>
                        <p style={s.subhead}>HR2 — Skill Tracking & Employee Capabilities</p>
                    </div>
                    <div style={s.headerActions}>
                        <Link to="/training" style={s.backBtn}>← Back to Training</Link>
                        {isHRAdmin && (
                            <>
                                <button onClick={() => { setShowAddComp(false); setShowAssign(!showAssign); }} style={s.assignBtn}>Rate Employee</button>
                                <button onClick={() => { setShowAssign(false); setShowAddComp(!showAddComp); }} style={s.compBtn}>+ New Skill Model</button>
                            </>
                        )}
                    </div>
                </div>

                {feedback.msg && (
                    <div style={{ ...s.feedback, background: feedback.isError ? '#fee2e2' : '#dcfce7', color: feedback.isError ? '#dc2626' : '#16a34a' }}>
                        {feedback.msg}
                    </div>
                )}

                {/* Add Skill Form */}
                {showAddComp && isHRAdmin && (
                    <form style={s.formBox} onSubmit={handleCreateCompetency}>
                        <h3 style={{ margin: '0 0 16px', color: '#1a1a2e' }}>Define New Competency</h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <input
                                placeholder="Competency Name (e.g. Leadership, ReactJS)"
                                value={compForm.name}
                                onChange={e => setCompForm({ ...compForm, name: e.target.value })}
                                style={{ ...s.input, flex: 1 }} required
                            />
                        </div>
                        <textarea
                            placeholder="Description (Optional)"
                            value={compForm.description}
                            onChange={e => setCompForm({ ...compForm, description: e.target.value })}
                            style={{ ...s.input, height: '60px', marginBottom: '16px', resize: 'none', width: '100%', boxSizing: 'border-box' }}
                        />
                        <button type="submit" style={s.submitBtn} disabled={savingComp}>
                            {savingComp ? 'Saving...' : 'Save Competency'}
                        </button>
                    </form>
                )}

                {/* Assign Form */}
                {showAssign && isHRAdmin && (
                    <form style={s.assignBox} onSubmit={handleAssign}>
                        <h3 style={{ margin: '0 0 16px', color: '#1a1a2e', fontSize: '16px' }}>Rate Employee Skill</h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <select
                                value={assignForm.employee_id}
                                onChange={e => setAssignForm({ ...assignForm, employee_id: e.target.value })}
                                style={s.select} required
                            >
                                <option value="">Select Employee...</option>
                                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</option>)}
                            </select>

                            <select
                                value={assignForm.competency_id}
                                onChange={e => setAssignForm({ ...assignForm, competency_id: e.target.value })}
                                style={s.select} required
                            >
                                <option value="">Select Competency...</option>
                                {competencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <select
                                value={assignForm.level}
                                onChange={e => setAssignForm({ ...assignForm, level: e.target.value })}
                                style={s.select}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <button type="submit" style={s.submitBtn} disabled={assigning}>
                            {assigning ? 'assigning...' : 'Assign/Update Level'}
                        </button>
                    </form>
                )}

                {loading ? (
                    <p style={s.loading}>Loading competencies...</p>
                ) : error ? (
                    <div style={s.errorBox}>{error}</div>
                ) : competencies.length === 0 ? (
                    <p style={s.emptyBox}>No competencies defined yet.</p>
                ) : (
                    <div style={s.compList}>
                        {competencies.map(c => (
                            <div key={c.id} style={s.compCard}>
                                <div style={s.compHeader}>
                                    <h3 style={s.compName}>{c.name}</h3>
                                    <span style={s.empCount}>{c.employees?.length || 0} Assessed</span>
                                </div>
                                {c.description && <p style={s.compDesc}>{c.description}</p>}

                                {c.employees?.length > 0 && (
                                    <table style={s.innerTable}>
                                        <thead>
                                            <tr>
                                                <th style={s.thSmall}>Employee</th>
                                                <th style={s.thSmall}>Department</th>
                                                <th style={s.thSmall}>Proficiency</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {c.employees.map(emp => (
                                                <tr key={emp.id}>
                                                    <td style={s.tdSmall}>{emp.first_name} {emp.last_name}</td>
                                                    <td style={s.tdSmall}>{emp.department || '—'}</td>
                                                    <td style={s.tdSmall}>
                                                        <span style={
                                                            emp.level === 'Advanced' ? s.lvlAdv :
                                                                emp.level === 'Intermediate' ? s.lvlInt :
                                                                    s.lvlBeg
                                                        }>
                                                            {emp.level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
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
    main: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
    heading: { margin: '0 0 4px', fontSize: '24px', color: '#1a1a2e' },
    subhead: { margin: 0, color: '#64748b', fontSize: '13px' },
    headerActions: { display: 'flex', gap: '8px' },
    backBtn: {
        padding: '9px 16px', background: '#fff', border: '1px solid #cbd5e1', color: '#333',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
    },
    assignBtn: {
        padding: '9px 16px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    compBtn: {
        padding: '9px 16px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    feedback: { padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },

    // Forms
    formBox: { background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' },
    assignBox: { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' },
    input: { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '5px' },
    select: { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '5px', flex: 1 },
    submitBtn: { padding: '9px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' },

    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
    emptyBox: { padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' },

    compList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    compCard: { background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' },
    compHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    compName: { margin: 0, fontSize: '18px', color: '#1a1a2e' },
    empCount: { fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px', fontWeight: '600' },
    compDesc: { margin: '0 0 16px', fontSize: '14px', color: '#475569' },

    innerTable: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
    thSmall: { textAlign: 'left', padding: '8px', fontSize: '12px', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
    tdSmall: { padding: '8px', fontSize: '13px', color: '#334155', borderBottom: '1px solid #f1f5f9' },

    lvlBeg: { background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
    lvlInt: { background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
    lvlAdv: { background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
};
