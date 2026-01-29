import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      {label && (
        <label 
          className="form-label" 
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#1f2937'
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '8px',
          fontSize: '1rem',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#2563eb';
          e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
        className={className}
        {...props}
      />
      {error && (
        <div style={{ 
          color: '#ef4444', 
          fontSize: '0.875rem', 
          marginTop: '0.5rem' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;