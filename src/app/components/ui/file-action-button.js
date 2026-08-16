import React, { useState } from 'react';

export default function FileActionButton({ image, title, label, description, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayTitle = title || label || '';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '2px',
        marginBottom: '8px',
        backgroundColor: isHovered ? '#e0f7f7' : '#f5f5f5',
        border: isHovered ? '4px solid #00aaaa' : '4px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        color: '#333',
        boxShadow: isHovered ? '2px 2px 5px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {image && !imgError ? (
        <img
          src={image}
          alt={displayTitle}
          onError={() => setImgError(true)}
          style={{
            width: '90px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '3px',
            border: '1px solid #ccc',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: '56px',
            height: '42px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            backgroundColor: '#ddd',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '6px',
          }}
        >
          {displayTitle}
        </span>
        {description && (
          <span
            style={{
              fontWeight: 'normal',
              fontSize: '11px',
              color: '#666',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
