'use client';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TutorialPage() {
  const [tutorialContent, setTutorialContent] = useState('');

  useEffect(() => {
    if (!tutorialContent) {
      fetch('/docs/tutorial.md')
        .then((res) => res.text())
        .then((text) => setTutorialContent(text))
        .catch((err) => console.error('Failed to load tutorial', err));
    }
  }, [tutorialContent]);

  return (
    <div
      style={{
        padding: '20px',
        background: '#fff',
        color: '#000',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        userSelect: 'text',
      }}
    >
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div
                style={{
                  position: 'relative',
                  marginTop: '10px',
                  marginBottom: '10px',
                }}
              >
                <button
                  onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    padding: '6px 12px',
                    backgroundColor: '#00aaaa',
                    color: 'white',
                    border: '2px solid #006666',
                    boxShadow: '2px 2px 0 #004444',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = 'translate(2px, 2px)';
                    e.target.style.boxShadow = '0 0 0 #004444';
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = 'translate(0, 0)';
                    e.target.style.boxShadow = '2px 2px 0 #004444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translate(0, 0)';
                    e.target.style.boxShadow = '2px 2px 0 #004444';
                  }}
                >
                  Copy{' '}
                </button>{' '}
                <pre
                  style={{
                    backgroundColor: '#222',
                    color: '#0f0',
                    padding: '16px',
                    paddingTop: '36px',
                    border: '4px solid #444',
                    overflowX: 'auto',
                    fontFamily: '"Amiga4Ever", monospace',
                    userSelect: 'text',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <code
                    className={className}
                    {...props}
                    style={{
                      userSelect: 'text',
                    }}
                  >
                    {' '}
                    {children}{' '}
                  </code>{' '}
                </pre>{' '}
              </div>
            ) : (
              <code
                className={className}
                {...props}
                style={{
                  backgroundColor: '#eee',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  userSelect: 'text',
                }}
              >
                {' '}
                {children}{' '}
              </code>
            );
          },
          img({ node, ...props }) {
            return (
              <img
                {...props}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  marginTop: '15px',
                  marginBottom: '15px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1px solid #ccc',
                }}
              />
            );
          },
        }}
      >
        {tutorialContent}
      </ReactMarkdown>
    </div>
  );
}
