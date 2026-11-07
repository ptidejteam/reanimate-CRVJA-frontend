import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CodeEditor from '@/src/app/components/cina/code-editor';
import ActionButton from '@/src/app/components/ui/action-button';
import SideNavigation from '@/src/app/components/cina/side-navigation';
import { downloadASCFile } from '@/src/utils/file-handler';
import AmosRunner from '@/src/app/components/cina/amos-runner';
import BankSlotManager from '@/src/app/components/bank/bank-slot-manager';
import { transpile } from '@/src/services/transpile';
import VersionSelector from '@/src/app/components/cina/version-selector';
import { decodeAmosFile } from '@/src/services/decode-amos-file';
import styles from './cina-ide.module.css';

export default function CinaIDE(availableTranspilerVersions) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  const [numBanks, setNumBanks] = useState(6);
  const [bankFiles, setBankFiles] = useState([]);
  const [AmosCode, setAmosCode] = useState('');
  const [transpilerVersion, setTranspilerVersion] = useState(
    availableTranspilerVersions.availableTranspilerVersions[0],
  );
  const fileInputRef = useRef();
  const amosFileInputRef = useRef();
  const [isDecodingAmos, setIsDecodingAmos] = useState(false);
  const [amosDecodeError, setAmosDecodeError] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [parseErrors, setParseErrors] = useState([]);
  const [runNonce, setRunNonce] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenButtonRef = useRef(null);
  const exitFullscreenRef = useRef(null);
  const programScreenRef = useRef(null);
  const programStageRef = useRef(null);
  const restoreFocusRef = useRef(false);

  const handleFullscreenKey = useCallback(
    (event) => {
      const isToggle = event.shiftKey && event.key === 'F1';
      const isExit = event.key === 'Escape' && isFullscreen;
      if (!isToggle && !isExit) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;

      setIsFullscreen((open) => isToggle && !open);
    },
    [isFullscreen],
  );

  useLayoutEffect(() => {
    window.addEventListener('keydown', handleFullscreenKey, true);
    return () => window.removeEventListener('keydown', handleFullscreenKey, true);
  }, [handleFullscreenKey]);

  useLayoutEffect(() => {
    if (!isFullscreen) {
      if (restoreFocusRef.current) {
        fullscreenButtonRef.current?.focus({ preventScroll: true });
        restoreFocusRef.current = false;
      }
      return;
    }

    const panel = programScreenRef.current;
    const stage = programStageRef.current;
    const output = stage.firstElementChild;

    if (panel.showPopover) {
      panel.setAttribute('popover', 'manual');
      panel.showPopover();
    }

    const fitOutput = () => {
      const width = output.offsetWidth;
      const height = output.offsetHeight;
      const scale =
        width && height ? Math.min(stage.clientWidth / width, stage.clientHeight / height) : 1;
      stage.style.setProperty('--program-scale', scale);
    };
    const resizeObserver = new ResizeObserver(fitOutput);
    resizeObserver.observe(stage);
    resizeObserver.observe(output);
    fitOutput();

    const keepFocusInPanel = (event) => {
      if (!panel.contains(event.target)) exitFullscreenRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', keepFocusInPanel);
    exitFullscreenRef.current.focus({ preventScroll: true });
    restoreFocusRef.current = true;

    return () => {
      resizeObserver.disconnect();
      stage.style.removeProperty('--program-scale');
      document.removeEventListener('focusin', keepFocusInPanel);
      panel.removeAttribute('popover');
    };
  }, [isFullscreen]);

  useEffect(() => {
    setTranslatedCode(translatedCode);
  }, [translatedCode]);

  useEffect(() => {
    if (!transpilerVersion) {
      setTranspilerVersion(availableTranspilerVersions.availableTranspilerVersions[0]);
    }
  }, [availableTranspilerVersions, transpilerVersion]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const amosBasicCode = event.target.result;
      setAmosCode(amosBasicCode);
    };

    reader.readAsText(file);
  };

  const handleAmosFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDecodingAmos(true);
    setAmosDecodeError('');
    try {
      setAmosCode(await decodeAmosFile(file));
    } catch (error) {
      console.error('Failed to decode AMOS file:', error);
      setAmosDecodeError(error.message || 'Unable to decode the selected AMOS file.');
    } finally {
      setIsDecodingAmos(false);
      event.target.value = '';
    }
  };

  const clearBanks = () => {
    setBankFiles([]);
  };

  const handleBankChange = (index, file) => {
    setBankFiles((prevBankFiles) => {
      const newBankFiles = [...prevBankFiles];
      newBankFiles[index] = file;
      return newBankFiles;
    });
  };

  const onRunClick = () => {
    setRunNonce((n) => n + 1);
  };

  const handleTranspile = async () => {
    try {
      const body = {
        code: AmosCode,
        version: transpilerVersion,
      };

      const response = await transpile(body);
      const { lexicalErrors, syntaxErrors, translatedCode: resTranslatedCode } = response.data;
    
      setTranslatedCode(resTranslatedCode);
      setParseErrors([...lexicalErrors.errors, ...syntaxErrors.errors]);

      console.log(lexicalErrors);
      console.log(syntaxErrors);
      console.log(parseErrors);
      console.log(resTranslatedCode);
    } catch (error) {
      console.error('Failed to fetch API: ', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {isSideMenuOpen && (
        <SideNavigation
          clearBanks={clearBanks}
          handleBankChange={handleBankChange}
          setAmosCode={setAmosCode}
          setIsSideMenuOpen={setIsSideMenuOpen}
          setTranspilerVersion={setTranspilerVersion}
        />
      )}
      <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            marginTop: '0px',
            padding: '0px',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                height: 'fit-content',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: '10px',
                  gap: '10px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <ActionButton
                  id="menu-toggle-btn"
                  icon="/icons/menu-button.png"
                  onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
                >
                  Menu
                </ActionButton>

                <ActionButton
                  icon="/icons/upload-button.png"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Load .ASC
                </ActionButton>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".asc,.txt"
                />

                <ActionButton
                  icon="/icons/upload-button.png"
                  disabled={isDecodingAmos}
                  onClick={() => amosFileInputRef.current?.click()}
                >
                  {isDecodingAmos ? 'Decoding…' : 'Load .AMOS'}
                </ActionButton>
                <input
                  type="file"
                  ref={amosFileInputRef}
                  onChange={handleAmosFileUpload}
                  style={{ display: 'none' }}
                  accept=".amos,.AMOS,.amo,.AMO"
                />
                {amosDecodeError && (
                  <span role="alert" style={{ color: '#8B0000' }}>
                    {amosDecodeError}
                  </span>
                )}

                <ActionButton
                  icon="/icons/download-button.png"
                  onClick={() => {
                    const filename = 'my_amos_code.asc';
                    downloadASCFile(filename, AmosCode);
                  }}
                >
                  Save .ASC
                </ActionButton>

                <ActionButton icon="/icons/play-button.png" onClick={handleTranspile}>
                  Run Code
                </ActionButton>

                <ActionButton
                  ref={fullscreenButtonRef}
                  type="button"
                  icon="/icons/full-screen.png"
                  aria-haspopup="dialog"
                  aria-keyshortcuts="Shift+F1"
                  onClick={() => setIsFullscreen(true)}
                >
                  Full Screen
                </ActionButton>

                <VersionSelector
                  value={transpilerVersion}
                  availableVersions={availableTranspilerVersions}
                  onChange={setTranspilerVersion}
                >
                  Version
                </VersionSelector>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                height: 'fit-content',
                border: '1px solid black',
                justifyContent: 'space-between',
                padding: '10px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '80vh',
                  alignItems: 'center',
                  visibility: isFullscreen ? 'hidden' : undefined,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom: '10px',
                  }}
                >
                  <label htmlFor="amos-code"> Code Editor </label>
                </div>
                <CodeEditor
                  value={AmosCode}
                  errors={parseErrors}
                  onChange={setAmosCode}
                  style={{
                    width: '44vw',
                    height: '100%',
                    margin: '0px',
                  }}
                />
              </div>
              <section
                ref={programScreenRef}
                className={
                  isFullscreen ? `${styles.programScreen} ${styles.fullscreen}` : styles.programScreen
                }
                role={isFullscreen ? 'dialog' : undefined}
                aria-modal={isFullscreen ? true : undefined}
                aria-label="Program Screen"
              >
                {isFullscreen ? (
                  <header className={styles.fullscreenBar}>
                    <button
                      ref={exitFullscreenRef}
                      type="button"
                      className={styles.exitFullscreen}
                      aria-label="Exit fullscreen"
                      onClick={() => setIsFullscreen(false)}
                    >
                      <img src="/icons/close-button.png" alt="" width="20" height="20" />
                    </button>
                    <span>Program Screen</span>
                  </header>
                ) : (
                  <span>Program Screen</span>
                )}
                <div ref={programStageRef} className={styles.programStage}>
                  <AmosRunner
                    jsCode={translatedCode}
                    runNonce={runNonce}
                    bankFiles={bankFiles}
                    onKeyDown={handleFullscreenKey}
                  />
                </div>
              </section>
            </div>
            &nbsp;
            <BankSlotManager
              numBanks={numBanks}
              bankFiles={bankFiles}
              onFileChange={handleBankChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
