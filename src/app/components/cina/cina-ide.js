import React, { useEffect, useRef, useState } from "react";
import AMOSDecoder from "@/src/utils/amos-decoder";
import CodeEditor from "@/src/app/components/cina/code-editor";
import ActionButton from "@/src/app/components/ui/action-button";
import SideNavigation from "@/src/app/components/cina/side-navigation";
import { downloadASCFile } from "@/src/utils/file-handler";
import AmosRunner from "@/src/app/components/cina/amos-runner";
import BankSlotManager from "@/src/app/components/bank/bank-slot-manager";
import { transpile } from "@/src/services/transpile";
import VersionSelector from "@/src/app/components/cina/version-selector";

export default function CinaIDE(availableTranspilerVersions) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  const [numBanks, setNumBanks] = useState(6);
  const [bankFiles, setBankFiles] = useState([]);
  const [AmosCode, setAmosCode] = useState("");
  const [transpilerVersion, setTranspilerVersion] = useState(
    availableTranspilerVersions.availableTranspilerVersions[0],
  );
  const fileInputRef = useRef();
  const amosFileInputRef = useRef();
  const amosDecoderRef = useRef();
  const [decodedText, setDecodedText] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");
  const [runNonce, setRunNonce] = useState(0);

  useEffect(() => {
    setAmosCode(decodedText);
  }, [decodedText]);

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

      const {
        lexicalErrors,
        syntaxErrors,
        translatedCode: resTranslatedCode,
      } = response.data;

      setTranslatedCode(resTranslatedCode);
      console.log("translatedCode: ", resTranslatedCode);
    } catch (error) {
      console.error("Failed to fetch API: ", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
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
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            marginTop: "0px",
            padding: "0px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: "10px",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
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
                  style={{ display: "none" }}
                  accept=".asc, .txt, .amo"
                />

                <ActionButton
                  icon="/icons/upload-button.png"
                  onClick={() => amosFileInputRef.current?.click()}
                >
                  Load .AMOS
                </ActionButton>
                <input
                  type="file"
                  ref={amosFileInputRef}
                  onChange={(e) =>
                    amosDecoderRef.current?.handleFile(e.target.files[0])
                  }
                  style={{ display: "none" }}
                  accept=".amos,.AMOS"
                />

                <AMOSDecoder
                  ref={amosDecoderRef}
                  onDecoded={(text) => setDecodedText(text)}
                />

                <ActionButton
                  icon="/icons/download-button.png"
                  onClick={() => {
                    const filename = "my_amos_code.asc";
                    downloadASCFile(filename, AmosCode);
                  }}
                >
                  Save .ASC
                </ActionButton>

                <ActionButton
                  icon="/icons/play-button.png"
                  onClick={handleTranspile}
                >
                  Run Code
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
                width: "100%",
                display: "flex",
                flexDirection: "row",
                height: "fit-content",
                border: "1px solid black",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "80vh",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "10px",
                  }}
                >
                  <label htmlFor="amos-code"> Code Editor </label>
                </div>
                <CodeEditor
                  value={AmosCode}
                  onChange={setAmosCode}
                  style={{
                    width: "44vw",
                    height: "100%",
                    margin: "0px",
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "fit-content",
                  alignItems: "center",
                  marginBottom: "100px",
                }}
              >
                <label htmlFor="amos-code"> Program Screen </label>
                <AmosRunner
                  jsCode={translatedCode}
                  runNonce={runNonce}
                  bankFiles={bankFiles}
                />
              </div>
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
