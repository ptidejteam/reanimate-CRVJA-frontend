"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sketch } from "@uiw/react-color";
import AnalogClock from "@/src/app/components/ui/analogClock";
import {
  WorkbenchIcon,
  WorkbenchShell,
  WorkbenchWindow,
} from "@/src/app/components/ui/workbench";
import TutorialPage from "@/src/app/components/tutorial/TutorialPage";
import { useAMOSParser } from "@/src/app/hooks/useAmosParser";
import { parseBankFile } from "@/src/utils/parseAmosBank";
import { generateAmosBankFile } from "@/src/utils/generateAmosBank";
import { renderSpritePixels } from "@/src/utils/spriteRenderer";
import { useBankCreator } from "@/src/app/hooks/useBankCreator";
import BankEditor from "@/src/app/components/bank/BankEditor";
import { checkApiStatus } from "@/src/services/checkApiStatus";
import CinaIDE from "@/src/app/components/cina/CinaIDE";

function App() {
  const [showCode, setShowCode] = useState(false);
  const [option, setOption] = useState("file");
  const [createBank, setCreateBank] = useState(false);
  const { bankCreator, setBankCreator, clearBank } = useBankCreator();
  const [showRender, setShowRender] = useState(false);
  const [showSpriteEditor, setShowSpriteEditor] = useState(false);
  const [showExamples, setShowExamples] = useState(false); // TODO: To remove?
  const [showClock, setShowClock] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);

  return (
    <WorkbenchShell>
      {/* Icons Row */}
      <div
        onClick={() => setSelectedIcon(null)}
        style={{
          position: "absolute",

          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "60px",
          margin: "20px",
        }}
      >
        <WorkbenchIcon
          id="cina"
          label="CINA"
          icon="/icons/cina.png"
          onOpen={() => setShowCode(true)}
          selected={selectedIcon === "cina"}
          setSelectedIcon={setSelectedIcon}
        />{" "}
        <WorkbenchIcon
          id="sprites"
          label="Sprites"
          icon="/icons/sprite.png"
          onOpen={() => setShowSpriteEditor(true)}
          selected={selectedIcon === "sprites"}
          setSelectedIcon={setSelectedIcon}
        />
        <WorkbenchIcon
          id="clock"
          label="Clock"
          icon="/icons/clock.png"
          onOpen={() => setShowClock(true)}
          selected={selectedIcon === "clock"}
          setSelectedIcon={setSelectedIcon}
        />{" "}
        <WorkbenchIcon
          id="tutorial"
          label="Tutorial"
          icon="/icons/book.png"
          onOpen={() => setShowTutorial(true)}
          selected={selectedIcon === "tutorial"}
          setSelectedIcon={setSelectedIcon}
        />{" "}
        <WorkbenchIcon
          id="manual"
          label="Manual"
          icon="/icons/manual.png"
          onOpen={() => window.open("https://amospromanual.dev/", "_blank")}
          selected={selectedIcon === "manual"}
          setSelectedIcon={setSelectedIcon}
        />
      </div>
      {/* Windows */}
      {showCode && (
        <WorkbenchWindow title="CINA IDE" onClose={() => setShowCode(false)}>
          <CinaIDE />
        </WorkbenchWindow>
      )}

      {showSpriteEditor && (
        <WorkbenchWindow
          title="Sprite Editor"
          onClose={() => setShowSpriteEditor(false)}
        >
          <BankEditor
            bankCreator={bankCreator}
            setBankCreator={setBankCreator}
          />{" "}
        </WorkbenchWindow>
      )}

      {showClock && (
        <WorkbenchWindow title="Clock" onClose={() => setShowClock(false)}>
          <AnalogClock />
        </WorkbenchWindow>
      )}

      {showTutorial && (
        <WorkbenchWindow
          title="Tutorial"
          onClose={() => setShowTutorial(false)}
        >
          <TutorialPage />
        </WorkbenchWindow>
      )}
    </WorkbenchShell>
  );
}

export default App;
