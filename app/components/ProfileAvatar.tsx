// Google-style ring avatar component
'use client';
import React from 'react';

export default function ProfileAvatar({ src, alt, size = 40 }: { src?: string | null; alt?: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: 2,
        background: 'conic-gradient(red, orange, yellow, green, blue, indigo, violet, red)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: size - 6,
          height: size - 6,
          borderRadius: '50%',
          background: '#fff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {src ? (
          <img src={src} alt={alt || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: size / 2, color: '#888' }}>{alt?.[0] || 'U'}</span>
        )}
      </div>
    </div>
  );
}
