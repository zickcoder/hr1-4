import { useState } from 'react';

const STATUSES = ['Applied', 'Interview', 'Passed', 'Rejected'];

const Field = ({ label, name, type = 'text', placeholder, value, onChange, error }) => (
    <div style={s.field}>
        <label style={s.label}>{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || ''}
            style={{ ...s.input, ...(error ? s.inputErr : {}) }}
        />
        {error && <span style={s.err}>{error}</span>}
    </div>
);

export default function ApplicantForm({ initial = {}, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState({
        first_name: initial.first_name || '',
        last_name: initial.last_name || '',
        email: initial.email || '',
        contact_number: initial.contact_number || '',
        position_applied: initial.position_applied || '',
        branch_location: initial.branch_location || '',
        resume_link: initial.resume_link || '',
        application_status: initial.application_status || 'Applied',
        interview_score: initial.interview_score ?? '',
        notes: initial.notes || '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = 'Required.';
        if (!form.last_name.trim()) errs.last_name = 'Required.';
        if (!form.email.trim()) errs.email = 'Required.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const payload = {
            ...form,
            interview_score: form.interview_score !== '' ? parseFloat(form.interview_score) : null,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
                <Field label="First Name *" name="first_name" placeholder="Maria" value={form.first_name} onChange={handleChange} error={errors.first_name} />
                <Field label="Last Name *" name="last_name" placeholder="Santos" value={form.last_name} onChange={handleChange} error={errors.last_name} />
            </div>
            <div style={s.row}>
                <Field label="Email *" name="email" type="email" placeholder="maria@email.com" value={form.email} onChange={handleChange} error={errors.email} />
                <Field label="Contact Number" name="contact_number" placeholder="+63 912 345 6789" value={form.contact_number} onChange={handleChange} error={errors.contact_number} />
            </div>
            <div style={s.row}>
                <Field label="Position Applied" name="position_applied" placeholder="Driver" value={form.position_applied} onChange={handleChange} error={errors.position_applied} />
                <Field label="Branch Location" name="branch_location" placeholder="Manila Hub" value={form.branch_location} onChange={handleChange} error={errors.branch_location} />
            </div>
            <Field label="Resume Link" name="resume_link" placeholder="https://drive.google.com/..." value={form.resume_link} onChange={handleChange} error={errors.resume_link} />
            <div style={s.row}>
                <div style={s.field}>
                    <label style={s.label}>Application Status</label>
                    <select name="application_status" value={form.application_status} onChange={handleChange} style={s.input}>
                        {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                </div>
                <Field label="Interview Score (0–100)" name="interview_score" type="number" placeholder="85" value={form.interview_score} onChange={handleChange} error={errors.interview_score} />
            </div>
            <div style={s.field}>
                <label style={s.label}>Notes</label>
                <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes..."
                    style={{ ...s.input, resize: 'vertical' }}
                />
            </div>
            <div style={s.actions}>
                <button type="button" onClick={onCancel} style={s.cancelBtn} disabled={loading}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Applicant'}
                </button>
            </div>
        </form>
    );
}

const s = {
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    row: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: {
        padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
        fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    inputErr: { borderColor: '#ef4444' },
    err: { color: '#ef4444', fontSize: '12px' },
    actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' },
    cancelBtn: {
        padding: '9px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    },
    submitBtn: {
        padding: '9px 20px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    },
};
