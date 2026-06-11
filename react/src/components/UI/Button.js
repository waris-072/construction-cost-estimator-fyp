import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    gap: '0.5rem',
    fontFamily: 'inherit'
  };

  const variants = {
    primary: {
      background: '#2563eb',
      color: 'white',
      border: '2px solid #2563eb',
    },
    secondary: {
      background: 'transparent',
      color: '#2563eb',
      border: '2px solid #2563eb',
    },
    outline: {
      background: 'transparent',
      color: '#6b7280',
      border: '1px solid #d1d5db',
    },
    white: {
      background: 'white',
      color: '#2563eb',
      border: '2px solid white',
    }
  };

  const sizes = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem'
    },
    medium: {
      padding: '0.75rem 2rem',
      fontSize: '1rem'
    },
    large: {
      padding: '1rem 2.5rem',
      fontSize: '1.125rem'
    }
  };

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed'
    })
  };

  return (
    <button
      type={type}
      style={styles}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;