import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = true,
  ...props 
}) => {
  const paddingStyles = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: paddingStyles[padding],
    transition: hover ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none',
    ...props.style
  };

  return (
    <div 
      style={cardStyle}
      className={className}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;