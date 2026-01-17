import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '24px',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '8px',
};

export const toggleStyle = (active: boolean): CSSProperties => ({
  width: '51px',
  height: '31px',
  borderRadius: '16px',
  background: active ? '#30D158' : 'rgba(255,255,255,0.1)',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background 0.2s',
  border: 'none',
  flexShrink: 0,
});

export const toggleKnobStyle = (active: boolean): CSSProperties => ({
  width: '27px',
  height: '27px',
  borderRadius: '14px',
  background: '#fff',
  position: 'absolute',
  top: '2px',
  left: active ? '22px' : '2px',
  transition: 'left 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
});

export const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(20px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export const modalContentStyle: CSSProperties = {
  width: '400px',
  background: 'rgba(30,30,30,0.95)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '32px',
};

export const primaryButtonStyle: CSSProperties = {
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
};

export const secondaryButtonStyle: CSSProperties = {
  padding: '14px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
};
