'use client';
import React, { useEffect, useRef, useState } from 'react';
import AnalogClock from '@/src/app/components/ui/analog-clock';
import { WorkbenchIcon, WorkbenchShell, WorkbenchWindow } from '@/src/app/components/ui/workbench';
import TutorialPage from '@/src/app/components/tutorial/tutorial-page';
import { useBankCreator } from '@/src/app/hooks/use-bank-creator';
import BankEditor from '@/src/app/components/bank/bank-editor';
import CinaIDE from '@/src/app/components/cina/cina-ide';
import { fetchTranspilerVersions } from '@/src/services/fetch-transpiler-versions';

function App() {
  const [showCode, setShowCode] = useState(false);
  const { bankCreator, setBankCreator, clearBank } = useBankCreator();
  const [showSpriteEditor, setShowSpriteEditor] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [availableTranspilerVersions, setAvailableTranspilerVersions] = useState([]);

  useEffect(() => {
    handleFetchVersions();
  }, []);

  const handleFetchVersions = async () => {
    try {
      const response = await fetchTranspilerVersions();

      setAvailableTranspilerVersions(response.versions);
    } catch (error) {
      console.error('Failed to fetch API: ', error);
    }
  };

  return (
    <WorkbenchShell>
      {/* Icons Row */}
      <div
        onClick={() => setSelectedIcon(null)}
        style={{
          position: 'absolute',

          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '60px',
          margin: '20px',
        }}
      >
        <WorkbenchIcon
          id="cina"
          label="CINA"
          icon="/icons/cina.png"
          onOpen={() => {
            handleFetchVersions();
            setShowCode(true);
          }}
          selected={selectedIcon === 'cina'}
          setSelectedIcon={setSelectedIcon}
        />{' '}
        <WorkbenchIcon
          id="sprites"
          label="Sprites"
          icon="/icons/sprite.png"
          onOpen={() => setShowSpriteEditor(true)}
          selected={selectedIcon === 'sprites'}
          setSelectedIcon={setSelectedIcon}
        />
        <WorkbenchIcon
          id="clock"
          label="Clock"
          icon="/icons/clock.png"
          onOpen={() => setShowClock(true)}
          selected={selectedIcon === 'clock'}
          setSelectedIcon={setSelectedIcon}
        />{' '}
        <WorkbenchIcon
          id="tutorial"
          label="Tutorial"
          icon="/icons/book.png"
          onOpen={() => setShowTutorial(true)}
          selected={selectedIcon === 'tutorial'}
          setSelectedIcon={setSelectedIcon}
        />{' '}
        <WorkbenchIcon
          id="manual"
          label="Manual"
          icon="/icons/manual.png"
          onOpen={() => window.open('https://amospromanual.dev/', '_blank')}
          selected={selectedIcon === 'manual'}
          setSelectedIcon={setSelectedIcon}
        />
      </div>
      {/* Windows */}
      {showCode && (
        <WorkbenchWindow title="CINA IDE" onClose={() => setShowCode(false)}>
          <CinaIDE availableTranspilerVersions={availableTranspilerVersions} />
        </WorkbenchWindow>
      )}

      {showSpriteEditor && (
        <WorkbenchWindow title="Sprite Editor" onClose={() => setShowSpriteEditor(false)}>
          <BankEditor bankCreator={bankCreator} setBankCreator={setBankCreator} />{' '}
        </WorkbenchWindow>
      )}

      {showClock && (
        <WorkbenchWindow title="Clock" onClose={() => setShowClock(false)}>
          <AnalogClock />
        </WorkbenchWindow>
      )}

      {showTutorial && (
        <WorkbenchWindow title="Tutorial" onClose={() => setShowTutorial(false)}>
          <TutorialPage />
        </WorkbenchWindow>
      )}
    </WorkbenchShell>
  );
}

export default App;
