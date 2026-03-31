import React from 'react';

export function PrimaryButton({
    text = '',
    onClick,
    disabled = false,
    color = 'blue',
    fullWidth = true,
    type = 'button'
  }) {
  
    const baseStyle = {
      width: fullWidth ? '100%' : 'auto',
      padding: '1rem',
      borderRadius: '14px',
      border: '1.5px solid #e2e8f0',
      background: '#f1f5f9',
      color: '#94a3b8',
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.9rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      transition: 'all 0.3s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
    };
  
    const activeStyles = {
      blue: {
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 20px rgba(29, 78, 216, 0.3)',
        cursor: 'pointer',
      },
      white: {
        background: "white",
        color: "#2563eb",
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
      },
      red: {
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
        cursor: 'pointer',
      }
    };
  
    const hoverShadow = {
      blue: '0 8px 28px rgba(29, 78, 216, 0.4)',
      white: "0 6px 18px rgba(0,0,0,0.08)",
      red: '0 8px 28px rgba(239, 68, 68, 0.4)',
    };
  
    const [isHover, setIsHover] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);
  
    let style = { ...baseStyle };
  
    if (!disabled) {
      style = {
        ...style,
        ...activeStyles[color],
        transform: isActive ? 'translateY(0)' : isHover ? 'translateY(-2px)' : 'none',
        boxShadow: isHover
          ? hoverShadow[color] || activeStyles[color].boxShadow
          : activeStyles[color].boxShadow,
      };
    }
  
    return (
      <button
        type={type}
        style={style}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
      >
        {text}
      </button>
    );
  }