import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import ApplicantForm from '../components/ApplicantForm';

const STATUS_COLORS = {
    Applied: { bg: '#dbeafe', color: '#1d4ed8' },
    Interview: { bg: '#fef9c3', color: '#854d0e' },
    Passed: { bg: '#dcfce7', color: '#15803d' },
    Rejected: { bg: '#fee2e2', color: '#b91c1c' },
    Hired: { bg: '#f3e8ff', color: '#7e22ce' },
};

export default function Applicants() {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', isError: false });
    const [hiringId, setHiringId] = useState(null);

    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');
    const isEditor = user.role === 'SuperAdmin' || user.role === 'HRAdmin';

    const toast = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback({ msg: '', isError: false }), 4000);
    };

    const fetchApplicants = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get('/applicants');
            setApplicants(res.data.data);
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || 'Failed to load applicants.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('hr_token');
        if (!token) { navigate('/login'); return; }
        fetchApplicants();
    }, [navigate]);

    const handleCreate = async (form) => {
        setFormLoading(true);
        try {
            await API.post('/applicants', form);
            toast('Applicant added successfully.');
            setShowForm(false);
            fetchApplicants();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to create applicant.', true);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (form) => {
        setFormLoading(true);
        try {
            await API.put(`/applicants/${editTarget.applicant_id}`, form);
            toast('Applicant updated successfully.');
            setEditTarget(null);
            fetchApplicants();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update.', true);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete applicant "${name}"?`)) return;
        try {
            await API.delete(`/applicants/${id}`);
            toast('Applicant deleted.');
            fetchApplicants();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to delete.', true);
        }
    };

    const handleHire = async (applicant) => {
        if (!window.confirm(`Hire ${applicant.first_name} ${applicant.last_name} as a Probationary employee?`)) return;
        setHiringId(applicant.applicant_id);
        try {
            const res = await API.post(`/applicants/${applicant.applicant_id}/hire`);
            toast(`✅ ${res.data.message}`);
            fetchApplicants();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to hire applicant.', true);
        } finally {
            setHiringId(null);
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
                    <Link to="/applicants" style={{ ...s.navLink, color: '#fff', fontWeight: '600' }}>Applicants</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.header}>
                    <div>
                        <h1 style={s.heading}>Applicants</h1>
                        <p style={s.subhead}>HR1 — Talent Acquisition</p>
                    </div>
                    {isEditor && !showForm && !editTarget && (
                        <button onClick={() => setShowForm(true)} style={s.addBtn}>+ Add Applicant</button>
                    )}
                </div>

                {feedback.msg && (
                    <div style={{ ...s.feedback, background: feedback.isError ? '#fee2e2' : '#dcfce7', color: feedback.isError ? '#dc2626' : '#16a34a' }}>
                        {feedback.msg}
                    </div>
                )}

                {showForm && (
                    <div style={s.formBox}>
                        <h2 style={s.formTitle}>New Applicant</h2>
                        <ApplicantForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={formLoading} />
                    </div>
                )}

                {editTarget && (
                    <div style={s.formBox}>
                        <h2 style={s.formTitle}>Edit Applicant</h2>
                        <ApplicantForm
                            initial={editTarget}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditTarget(null)}
                            loading={formLoading}
                        />
                    </div>
                )}

                {loading ? (
                    <p style={s.loading}>Loading applicants...</p>
                ) : error ? (
                    <div style={s.errorBox}>{error}</div>
                ) : applicants.length === 0 ? (
                    <p style={s.empty}>No applicants found. Add one to get started.</p>
                ) : (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>ID</th>
                                    <th style={s.th}>Name</th>
                                    <th style={s.th}>Email</th>
                                    <th style={s.th}>Position Applied</th>
                                    <th style={s.th}>Branch</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Score</th>
                                    <th style={s.th}>Notes</th>
                                    {isEditor && <th style={s.th}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.map((ap, i) => {
                                    const statusStyle = STATUS_COLORS[ap.application_status] || STATUS_COLORS.Applied;
                                    const isHiring = hiringId === ap.applicant_id;
                                    return (
                                        <tr key={ap.applicant_id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td style={s.td}>{ap.applicant_id}</td>
                                            <td style={s.td}>{ap.first_name} {ap.last_name}</td>
                                            <td style={s.td}>{ap.email}</td>
                                            <td style={s.td}>{ap.position_applied || '—'}</td>
                                            <td style={s.td}>{ap.branch_location || '—'}</td>
                                            <td style={s.td}>
                                                <span style={{ ...s.badge, background: statusStyle.bg, color: statusStyle.color }}>
                                                    {ap.application_status}
                                                </span>
                                                {ap.application_status === 'Hired' && ap.hired_as_employee_id && (
                                                    <span style={s.empIdTag}>EMP#{ap.hired_as_employee_id}</span>
                                                )}
                                            </td>
                                            <td style={s.td}>{ap.interview_score != null ? ap.interview_score : '—'}</td>
                                            <td style={{ ...s.td, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ap.notes || '—'}
                                            </td>
                                            {isEditor && (
                                                <td style={s.td}>
                                                    <div style={s.actionGroup}>
                                                        {ap.application_status !== 'Hired' && (
                                                            <button onClick={() => setEditTarget(ap)} style={s.editBtn}>Edit</button>
                                                        )}
                                                        {ap.application_status === 'Passed' && (
                                                            <button
                                                                onClick={() => handleHire(ap)}
                                                                disabled={isHiring}
                                                                style={s.hireBtn}
                                                            >
                                                                {isHiring ? 'Hiring...' : '✓ Hire'}
                                                            </button>
                                                        )}
                                                        {ap.application_status !== 'Hired' && (
                                                            <button
                                                                onClick={() => handleDelete(ap.applicant_id, `${ap.first_name} ${ap.last_name}`)}
                                                                style={s.deleteBtn}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <p style={s.count}>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''} total</p>
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
    addBtn: {
        padding: '9px 18px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
    feedback: { padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
    formBox: {
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '10px', padding: '28px', marginBottom: '24px',
    },
    formTitle: { margin: '0 0 20px', fontSize: '18px', color: '#1a1a2e' },
    tableWrap: { overflowX: 'auto' },
    table: {
        width: '100%', borderCollapse: 'collapse', background: '#fff',
        borderRadius: '8px', overflow: 'hidden',
    },
    thead: { background: '#1a1a2e' },
    th: { padding: '12px 14px', textAlign: 'left', color: '#f1f5f9', fontSize: '13px', fontWeight: '600' },
    trEven: { background: '#fff' },
    trOdd: { background: '#f8fafc' },
    td: { padding: '11px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
    empIdTag: {
        marginLeft: '6px', fontSize: '11px', color: '#7e22ce',
        background: '#f3e8ff', padding: '2px 7px', borderRadius: '10px', fontWeight: '600',
    },
    actionGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    editBtn: {
        padding: '5px 10px', background: '#f0fdf4', border: '1px solid #86efac',
        color: '#16a34a', borderRadius: '5px', cursor: 'pointer', fontSize: '12px',
    },
    hireBtn: {
        padding: '5px 10px', background: '#f3e8ff', border: '1px solid #d8b4fe',
        color: '#7e22ce', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    },
    deleteBtn: {
        padding: '5px 10px', background: '#fff1f2', border: '1px solid #fca5a5',
        color: '#dc2626', borderRadius: '5px', cursor: 'pointer', fontSize: '12px',
    },
    loading: { color: '#64748b', fontSize: '15px' },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px' },
    empty: { color: '#64748b', fontSize: '15px', marginTop: '20px' },
    count: { color: '#94a3b8', fontSize: '13px', marginTop: '12px' },
};
