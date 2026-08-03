import React, { useState } from 'react';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import './EditEmployeeModal.css';

function EditEmployeeModal({ employee, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    contactNumber: employee.contactNumber || '',
    email: employee.email || '',
  });
  const [promote, setPromote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isHrOrAdmin = employee.portalRole === 'HR' || employee.portalRole === 'Superadmin';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(employee.employeeNumber, { ...form, promoteToHr: promote });
    } catch (err) {
      setError(err.data || 'Failed to update employee.');
      setSaving(false);
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="edit-modal-title">Edit Employee</h2>
        <p className="edit-modal-subtitle">Employee Number: {employee.employeeNumber}</p>

        <form className="edit-modal-form" onSubmit={handleSubmit}>
          <div className="edit-modal-row">
            <FormField label="Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <FormField label="Surname" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="edit-modal-row">
            <FormField label="Phone Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          {!isHrOrAdmin && (
            <label className="edit-modal-checkbox">
              <input type="checkbox" checked={promote} onChange={(e) => setPromote(e.target.checked)} />
              Promote to HR
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="edit-modal-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeeModal;
