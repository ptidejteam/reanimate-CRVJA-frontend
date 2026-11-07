import React, { forwardRef } from 'react';

export default forwardRef(function ActionButton({ children, onClick, style, icon, ...props }, ref) {
  return (
    <button ref={ref} className="action-button" onClick={onClick} style={style} {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
      >
        {icon && (
          <img src={icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
});
