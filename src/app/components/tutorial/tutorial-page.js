'use client';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './tutorial-page.module.css';

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const code = React.Children.toArray(children).find(React.isValidElement);
  const text = String(code?.props.children ?? '').replace(/\n$/, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeToolbar}>
        <span>AMOS BASIC</span>
        <button type="button" onClick={copy} aria-label="Copy AMOS code">
          {copyError ? 'Try copying again' : copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre tabIndex={0} aria-label="AMOS code example">
        {children}
      </pre>
    </div>
  );
}

export default function TutorialPage() {
  const [tutorialContent, setTutorialContent] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/docs/tutorial.md', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load tutorial');
        return response.text();
      })
      .then(setTutorialContent)
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className={styles.viewport}>
      <article className={styles.content} aria-label="Coffee and Beer game tutorial">
        {loadError ? (
          <p role="alert">The tutorial could not load. Reopen this window to try again.</p>
        ) : !tutorialContent ? (
          <p role="status">Loading the tutorial…</p>
        ) : (
          <ReactMarkdown
            components={{
              a({ node, href, ...props }) {
                const isCheckpoint = href?.startsWith('/examples/') && /\.(asc|abk)$/.test(href);
                return <a {...props} href={href} download={isCheckpoint || undefined} />;
              },
              pre({ children }) {
                return <CodeBlock>{children}</CodeBlock>;
              },
              code({ node, ...props }) {
                return <code {...props} />;
              },
              img({ node, alt, ...props }) {
                return (
                  <a
                    href={props.src}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.screenshotLink}
                    aria-label={`Open screenshot: ${alt}`}
                    title="Open screenshot at full size"
                  >
                    <img {...props} alt={alt} loading="lazy" decoding="async" />
                  </a>
                );
              },
            }}
          >
            {tutorialContent}
          </ReactMarkdown>
        )}
      </article>
    </div>
  );
}
