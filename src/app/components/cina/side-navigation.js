import React, { useEffect, useRef } from 'react';
import FileActionButton from '../ui/file-action-button';

export default function SideNavigation({
  isSideMenuOpen,
  setIsSideMenuOpen,
  clearBanks,
  handleBankChange,
  setAmosCode,
  setTranspilerVersion,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('#code-editor-container') && setIsSideMenuOpen) {
        setIsSideMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSideMenuOpen]);

  const loadExample = async (ascPath, bankPaths = [], transpilerConfigsPath = '') => {
    try {
      clearBanks();
      for (let i = 0; i < bankPaths.length; i++) {
        const resBank = await fetch(bankPaths[i].path);
        const blob = await resBank.blob();
        const file = new File([blob], bankPaths[i].name);
        handleBankChange(i, file);
      }

      if (transpilerConfigsPath) {
        const resTranspilerVersions = await fetch(transpilerConfigsPath);
        const transpilerVersionText = await resTranspilerVersions.text();
        setTranspilerVersion(transpilerVersionText);
      }

      const resAsc = await fetch(ascPath);
      const text = await resAsc.text();
      setAmosCode(text);

      // Do not close the side menu after loading, according to the "if, and only if" requirements.
    } catch (err) {
      console.error('Failed to load example:', err);
    }
  };

  const examples = [
    {
      label: 'Pac-Man',
      description: 'Classic arcade game',
      image: '/examples/Example1_Pac-Man/Example1_Pac-Man.png',
      action: () =>
        loadExample(
          '/examples/Example1_Pac-Man/Example1_Pac-Man.asc',
          [
            {
              path: '/examples/Example1_Pac-Man/Example1_Pac-Man.abk',
              name: 'Example1_Pac-Man.abk',
            },
          ],
          '/examples/Example1_Pac-Man/crvja.txt',
        ),
    },
    {
      label: 'Piano',
      description: 'Play music',
      image: '/examples/Example2_Piano/Example2_Piano.png',
      action: () =>
        loadExample(
          '/examples/Example2_Piano/Example2_Piano.asc',
          [],
          '/examples/Example2_Piano/crvja.txt',
        ),
    },
    {
      label: 'Rotating Triangle',
      description: 'Graphics demo',
      image: '/examples/Example3_Rotating_Triangle/Example3_Rotating_Triangle.png',
      action: () =>
        loadExample(
          '/examples/Example3_Rotating_Triangle/Example3_Rotating_Triangle.asc',
          [],
          '/examples/Example3_Rotating_Triangle/crvja.txt',
        ),
    },
    {
      label: 'Colourful Text',
      description: 'Text & colours',
      image: '/examples/Example4_Colourful_Text/Example4_Colourful_Text.png',
      action: () =>
        loadExample(
          '/examples/Example4_Colourful_Text/Example4_Colourful_Text.asc',
          [],
          '/examples/Example4_Colourful_Text/crvja.txt',
        ),
    },
  ];

  const reanimate26Examples = [
    {
      label: 'Escape From ReAnimate 🥇',
      description: 'Escape room',
      image:
        '/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/Escape_from_ReAnimate.png',
      action: () =>
        loadExample(
          '/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/Game.asc',
          // "/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/Game (Adapted to v2.0.0).asc",
          [
            {
              path: '/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/AmosBank_Escape1.abk',
              name: 'AmosBank_Escape1.abk',
            },
            {
              path: '/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/AmosBank_Escape2.abk',
              name: 'AmosBank_Escape2.abk',
            },
          ],
          '/reanimate26/EscapeFromReanimate_Kotowicz_Maher_Abdalla_Ullmann/crvja.txt',
        ),
    },
    {
      label: 'Park Bedlam 🥇',
      description: 'Turn-based war',
      image: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/Park_Bedlam.png',
      action: () =>
        loadExample(
          '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/park_bedlam_v20.asc',
          // "/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/park_bedlam_v20 (Adapted to v2.0.0).asc",
          [
            {
              path: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/AleksBank.abk',
              name: 'AleksBank.abk',
            },
            {
              path: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/Cat.abk',
              name: 'Cat.abk',
            },
            {
              path: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/DuckSquirrel.abk',
              name: 'DuckSquirrel.abk',
            },
            {
              path: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/Pigeon.abk',
              name: 'Pigeon.abk',
            },
            {
              path: '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/Raccoon.abk',
              name: 'Raccoon.abk',
            },
          ],
          '/reanimate26/ParkBedlam_Shifan_Franiczek_Ejaz_Scistri/crvja.txt',
        ),
    },
    {
      label: 'Welcome to the Backrooms 🥈',
      description: ' Survival horror',
      image:
        '/reanimate26/Welcome_to_the_Backrooms_Politowski_Bigot_Serra_Lopez/Welcome_to_the_Backrooms.png',
      action: () =>
        loadExample(
          '/reanimate26/Welcome_to_the_Backrooms_Politowski_Bigot_Serra_Lopez/Welcome_to_the_Backrooms_legacy.asc',
          // "/reanimate26/Welcome_to_the_Backrooms_Politowski_Bigot_Serra_Lopez/Welcome_to_the_Backrooms.asc",
          [
            {
              path: '/reanimate26/Welcome_to_the_Backrooms_Politowski_Bigot_Serra_Lopez/Sprite.abk',
              name: 'Sprite.abk',
            },
          ],
          '/reanimate26/Welcome_to_the_Backrooms_Politowski_Bigot_Serra_Lopez/crvja.txt',
        ),
    },
    {
      label: 'Galaxy Patrol 🥉',
      description: 'Space shooter',
      image: '/reanimate26/GalaxyPatrol_Tondorf_Chua_Zongo_Bijani/GalaxyPatrol.png',
      action: () =>
        loadExample(
          '/reanimate26/GalaxyPatrol_Tondorf_Chua_Zongo_Bijani/GalaxyPatrol_TCZB.asc',
          // "/reanimate26/GalaxyPatrol_Tondorf_Chua_Zongo_Bijani/GalaxyPatrol_TCZB (Adapted to v2.0.0).asc",
          [
            {
              path: '/reanimate26/GalaxyPatrol_Tondorf_Chua_Zongo_Bijani/gjs.abk',
              name: 'gjs.abk',
            },
          ],
          '/reanimate26/GalaxyPatrol_Tondorf_Chua_Zongo_Bijani/crvja.txt',
        ),
    },
    {
      label: 'World of Iris 🥉',
      description: 'Fantasy adventure',
      image: '/reanimate26/WorldOfIris_Mioto_Petrillo_Yefi_Guéhéneuc/World_of_Iris.png',
      action: () =>
        loadExample(
          '/reanimate26/WorldOfIris_Mioto_Petrillo_Yefi_Guéhéneuc/WoI.asc',
          [
            {
              path: '/reanimate26/WorldOfIris_Mioto_Petrillo_Yefi_Guéhéneuc/WoI.abk',
              name: 'WoI.abk',
            },
          ],
          '/reanimate26/WorldOfIris_Mioto_Petrillo_Yefi_Guéhéneuc/crvja.txt',
        ),
    },
  ];

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid black',
        paddingRight: '10px',
        marginRight: '10px',
        minWidth: '520px',
        maxWidth: '520px',
        paddingTop: '10px',
        alignItems: 'flex-start',
        overflowY: 'auto',
        height: '100%',
        maxHeight: '100%',
        flexShrink: 0,
        alignSelf: 'stretch',
      }}
    >
      <div style={{ width: '100%', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h4
            style={{
              borderBottom: '2px solid #ccc',
              paddingBottom: '4px',
              marginBottom: '10px',
              marginTop: '0',
            }}
          >
            Examples
          </h4>
          <ul
            style={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
            }}
          >
            {examples.map((ex, index) => (
              <li key={index}>
                <FileActionButton
                  image={ex.image}
                  title={ex.label}
                  description={ex.description}
                  onClick={ex.action}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4
            style={{
              borderBottom: '2px solid #ccc',
              paddingBottom: '4px',
              marginBottom: '10px',
            }}
          >
            ReAnimate'26 Games
          </h4>
          <ul
            style={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
            }}
          >
            {reanimate26Examples.map((ex, index) => (
              <li key={index}>
                <FileActionButton
                  image={ex.image}
                  title={ex.label}
                  description={ex.description}
                  onClick={ex.action}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
