import { useState } from 'react';

const EMPLOYMENT_STATUSES = ['Regular', 'Probationary', 'Contractual', 'Part-time'];

const Field = ({ label, name, type = 'text', placeholder, value, onChange, error }) => (
    <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || ''}
            style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
        />
        {error && <span style={styles.fieldError}>{error}</span>}
    </div>
);

export default function EmployeeForm({ initial = {}, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState({
        first_name: initial.first_name || '',
        last_name: initial.last_name || '',
        email: initial.email || '',
        contact_number: initial.contact_number || '',
        department: initial.department || '',
        position: initial.position || '',
        employment_status: initial.employment_status || 'Regular',
        date_hired: initial.date_hired ? initial.date_hired.split('T')[0] : '',
        branch_location: initial.branch_location || '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = 'First name is required.';
        if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
        if (!form.email.trim()) errs.email = 'Email is required.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
                <Field label="First Name *" name="first_name" placeholder="Juan" value={form.first_name} onChange={handleChange} error={errors.first_name} />
                <Field label="Last Name *" name="last_name" placeholder="Dela Cruz" value={form.last_name} onChange={handleChange} error={errors.last_name} />
            </div>
            <div style={styles.row}>
                <Field label="Email *" name="email" type="email" placeholder="juan@company.com" value={form.email} onChange={handleChange} error={errors.email} />
                <Field label="Contact Number" name="contact_number" placeholder="+63 912 345 6789" value={form.contact_number} onChange={handleChange} error={errors.contact_number} />
            </div>
            <div style={styles.row}>
                <Field label="Department" name="department" placeholder="Operations" value={form.department} onChange={handleChange} error={errors.department} />
                <Field label="Position" name="position" placeholder="Driver" value={form.position} onChange={handleChange} error={errors.position} />
            </div>
            <div style={styles.row}>
                <div style={styles.field}>
                    <label style={styles.label}>Employment Status</label>
                    <select
                        name="employment_status"
                        value={form.employment_status}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        {EMPLOYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <Field label="Date Hired" name="date_hired" type="date" value={form.date_hired} onChange={handleChange} error={errors.date_hired} />
            </div>
            <Field label="Branch Location" name="branch_location" placeholder="Manila Hub" value={form.branch_location} onChange={handleChange} error={errors.branch_location} />
            <div style={styles.actions}>
                <button type="button" onClick={onCancel} style={styles.cancelBtn} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Employee'}
                </button>
            </div>
        </form>
    );
}

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: {
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    inputError: { borderColor: '#ef4444' },
    fieldError: { color: '#ef4444', fontSize: '12px' },
    actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: {
        padding: '9px 20px',
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    submitBtn: {
        padding: '9px 20px',
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
};
