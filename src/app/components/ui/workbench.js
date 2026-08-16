'use client';
import React, { useState, useRef } from 'react';

//scrollbar
const arrowUpStyle = {
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderBottom: '8px solid black',
  margin: '6px auto',
};

const arrowDownStyle = {
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderTop: '8px solid black',
  margin: '6px auto',
};

const arrowLeftStyle = {
  width: 0,
  height: 0,
  borderTop: '6px solid transparent',
  borderBottom: '6px solid transparent',
  borderRight: '8px solid black',
  marginLeft: '6px',
};

const arrowRightStyle = {
  width: 0,
  height: 0,
  borderTop: '6px solid transparent',
  borderBottom: '6px solid transparent',
  borderLeft: '8px solid black',
  marginRight: '6px',
};

function AmigaScrollArea({ children }) {
  const containerRef = React.useRef(null);
  const [scroll, setScroll] = React.useState({ top: 0, left: 0 });

  const updateScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setScroll({
      top: el.scrollTop / (el.scrollHeight - el.clientHeight || 1),
      left: el.scrollLeft / (el.scrollWidth - el.clientWidth || 1),
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        background: '#C0C0C0',
        padding: 0,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* HORIZONTAL SCROLLBAR */}
      <AmigaHorizontalScroll scrollRef={containerRef} scroll={scroll.left} />
      {/* CONTENT AREA */}
      <div
        ref={containerRef}
        onScroll={updateScroll}
        style={{
          flex: 1,
          padding: '8px',
          overflow: 'scroll',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // Edge
        }}
      >
        {/* Hide scrollbars (Chrome) */}
        <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>

        {children}
      </div>

      {/* VERTICAL SCROLLBAR */}
      <AmigaVerticalScroll scrollRef={containerRef} scroll={scroll.top} />
    </div>
  );
}

function AmigaVerticalScroll({ scroll, scrollRef }) {
  const scrollStep = 100;

  const scrollUp = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop -= scrollStep;
  };

  const scrollDown = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop += scrollStep;
  };
  return (
    <div
      style={{
        width: '20px',
        background: '#C0C0C0',
        borderLeft: '2px solid black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        justifyItems: 'center',
        alignItems: 'center',
      }}
    >
      {/* TRACK */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '12px',
            height: `calc(30+${scroll * 100}% )`,
            background: '#A8A8A8',
            borderTop: '2px solid white',
            borderLeft: '2px solid white',
            borderBottom: '2px solid black',
            borderRight: '2px solid black',
          }}
        />
      </div>
      <div
        style={{
          height: `calc(${(1 - scroll) * 100}% )`,
          width: `12px`,
          background: `
                    linear-gradient(45deg, #000 25%, transparent 25%) -2px 0,
                    linear-gradient(45deg, #000 25%, transparent 25%) 0 -2px,
                    linear-gradient(45deg, transparent 75%, #000 75%) -2px 0,
                    linear-gradient(45deg, transparent 75%, #000 75%) 0 -2px
                    `,
          backgroundSize: '4px 4px',
          backgroundColor: '#C0C0C0',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ border: '1px solid white' }} />
      </div>
      {/* ↑ CLICK */}
      <div onClick={scrollUp} style={{ cursor: 'pointer' }}>
        <div style={arrowUpStyle}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ border: '1px solid black' }} />
        <div style={{ border: '1px solid white' }} />
      </div>
      {/* ↓ CLICK */}
      <div onClick={scrollDown} style={{ cursor: 'pointer' }}>
        <div style={arrowDownStyle}></div>
      </div>

      <div style={arrowDownStyle}></div>
    </div>
  );
}

function AmigaHorizontalScroll({ scroll, scrollRef }) {
  const scrollStep = 100;

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft -= scrollStep;
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft += scrollStep;
  };
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: '20px', // <-- leaves room for vertical scrollbar
        height: '20px',
        background: '#C0C0C0',
        borderTop: '2px solid white',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 3,
      }}
    >
      {/* TRACK */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            height: '12px',
            width: `calc(${scroll * 100}% )`,

            background: '#A8A8A8',
            borderTop: '2px solid white',
            borderLeft: '2px solid white',
            borderBottom: '2px solid black',
            borderRight: '2px solid black',
          }}
        />
        <div
          style={{
            height: '12px',
            width: `calc(${(1 - scroll) * 100}% )`,
            background: `
                    linear-gradient(45deg, #000 25%, transparent 25%) -2px 0,
                    linear-gradient(45deg, #000 25%, transparent 25%) 0 -2px,
                    linear-gradient(45deg, transparent 75%, #000 75%) -2px 0,
                    linear-gradient(45deg, transparent 75%, #000 75%) 0 -2px
                    `,
            backgroundSize: '4px 4px',
            backgroundColor: '#C0C0C0',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ borderLeft: '2px solid white' }} />
        </div>
        {/* ← CLICK */}
        <div onClick={scrollLeft} style={{ cursor: 'pointer', height: '12px', width: '26px' }}>
          <div style={arrowLeftStyle}></div>
        </div>

        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ borderLeft: '2px solid black' }} />
          <div style={{ borderLeft: '2px solid white' }} />
        </div>

        {/* → CLICK */}
        <div
          onClick={scrollRight}
          style={{
            cursor: 'pointer',
            height: '12px',
            width: '26px',
            justifyContent: 'center',
            justifyItems: 'center',
          }}
        >
          <div style={arrowRightStyle}></div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
//  WORKBENCH COLORS
// -----------------------------
export const WB_COLORS = {
  screenBlue: '#003C98',
  borderDark: '#00245F',
  borderLight: '#FFFFFF',
  titleBar: '#955D29',
  titleText: '#FFFFFF',
  windowBG: '#D6D6D6',
};

// -----------------------------
//  WINDOW COMPONENT
// -----------------------------
export function WorkbenchWindow({
  title,
  children,
  requestfront,
  globalz,
  defaultPos = { x: 120, y: 90 },
  onClose,
}) {
  const [pos, setPos] = useState(defaultPos);
  const [isDragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(true);
  const [zIndex, setZIndex] = useState(1);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const [isHovered, setIsHovered] = useState(false);
  const [myZ, setMyZ] = useState(globalz);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const startResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);

    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
    };
  };

  const bringToFront = () => {
    requestfront(); // ask shell to raise global Z
    setMyZ(globalz + 1); // assign the new top value to this window
  };
  const sendToBack = () => setZIndex(1);

  const windowRef = useRef(null);

  const startDrag = (e) => {
    bringToFront(); // <-- MAKE DRAGGED WINDOW GO TO TOP

    const rect = windowRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
  };

  const drag = (e) => {
    if (!isDragging || fullscreen) return;
    setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const stopDrag = () => setDragging(false);

  React.useEffect(() => {
    const onMove = (e) => {
      if (!isResizing) return;

      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;

      setSize({
        width: Math.max(200, resizeStart.current.w + dx),
        height: Math.max(150, resizeStart.current.h + dy),
      });
    };

    const onUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);
  return (
    <div
      ref={windowRef}
      onMouseDown={bringToFront}
      onMouseMove={drag}
      onMouseUp={stopDrag}
      style={{
        position: 'absolute',
        top: fullscreen ? 0 : pos.y,
        left: fullscreen ? 0 : pos.x,
        width: fullscreen ? '100%' : size.width,
        height: fullscreen ? '100%' : size.height,
        background: WB_COLORS.windowBG,
        borderBottom: `2px solid black`,
        borderRight: `2px solid black`,
        borderTop: `2px solid white`,
        borderLeft: '2px solid white',
        userSelect: 'none',
        zIndex: myZ,
        overflow: 'hidden', // IMPORTANT!!
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TITLE BAR */}
      <div
        onMouseDown={startDrag}
        style={{
          background: '#C0C0C0',
          color: 'black',
          paddingInline: '8px',
          fontFamily: 'Amiga4Ever, monospace',
          display: 'flex',
          alignItems: 'center',

          cursor: 'move',
          borderBottom: '2px solid black',
        }}
      >
        {/* CLOSE */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            width: 6,
            height: 10,
            background: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#C0C0C0',
            border: `2px solid black`,
            cursor: 'pointer',
            marginRight: '1%',
          }}
        ></div>
        <div style={{ height: '100%', borderLeft: '2px solid black' }} />
        <div style={{ height: '100%', borderLeft: '2px solid white' }} />
        <span>{title}</span>

        <div style={{ margin: 'auto' }} />
        <div style={{ display: 'flex', gap: '6px', height: '100%' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ height: '100%', borderLeft: '2px solid black' }} />
            <div style={{ height: '100%', borderLeft: '2px solid white' }} />
          </div>
          {/* DEPTH */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              sendToBack();
              setFullscreen(false);
            }}
            style={{
              height: '26px',
              paddingInline: '4px',
              cursor: 'pointer',

              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                border: '2px solid black',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 2,
                  height: 4,
                  border: `2px solid black`,
                  position: 'relative',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ height: '100%', borderLeft: '2px solid black' }} />
            <div style={{ height: '100%', borderLeft: '2px solid white' }} />
          </div>
          {/* ZOOM */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(!fullscreen);
            }}
          >
            <div
              style={{
                width: 14,
                height: 8,
                border: '1px solid black',
                right: 2,
                position: 'relative',
                top: 6,
                backgroundColor: '#C0C0C0',
              }}
            />
            <div
              style={{
                width: 14,
                height: 8,
                left: 2,
                backgroundColor: '#C0C0C0',
                border: `1px solid black`,
                position: 'relative',
              }}
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <AmigaScrollArea>{children}</AmigaScrollArea>
      {/* AMIGA-STYLE RESIZE ARROW */}
      {/* Resize arrow pinned to window frame */}
      <div
        onMouseDown={startResize}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          cursor: 'se-resize',
          background: '#C0C0C0',
          borderTop: '2px solid black',
          borderLeft: '2px solid black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 5, // stays above content
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderTop: '8px solid black',
            borderLeft: '8px solid transparent',
            transform: 'rotate(90deg)',
            right: 4,
            bottom: 4,
          }}
        />
      </div>
    </div>
  );
}

// -----------------------------
//  WORKBENCH ICON
// -----------------------------
export function WorkbenchIcon({ id, label, icon, onOpen, selected, setSelectedIcon }) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = (e) => {
    e.stopPropagation(); // prevent desktop from clearing

    // select this icon
    setSelectedIcon(id);

    setClickCount((c) => c + 1);
    setTimeout(() => setClickCount(0), 250);

    if (clickCount === 1) onOpen(); // double click open
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: 80,
        textAlign: 'center',
        cursor: 'pointer',
        fontFamily: 'Amiga4Ever, monospace',
        color: 'white',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
        padding: '4px',
      }}
    >
      {/* ICON IMAGE */}
      <div
        style={{
          width: 48,
          height: 48,
          backgroundImage: `url(${icon})`,
          backgroundSize: 'cover',
          pointerEvents: 'none',
        }}
      />

      {/* BLUE SELECTION OVERLAY */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(30,144,255,0.25)',
            border: '1px solid rgba(30,144,255,0.8)',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ICON LABEL */}
      <span>{label}</span>
    </div>
  );
}

// -----------------------------
//  WORKBENCH DESKTOP SHELL
// -----------------------------
export function WorkbenchShell({ children }) {
  const [globalz, setglobalz] = useState(10);
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: "url('/wallpaper/crvja_wallpaper.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: WB_COLORS.screenBlue,

        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Amiga4Ever, monospace',
      }}
    >
      {/* TOP WORKBENCH BAR */}
      <div
        style={{
          width: '100%',
          padding: '4px 10px',
          background: WB_COLORS.windowBG,
          borderBottom: `3px solid ${WB_COLORS.borderDark}`,
          fontWeight: 'bold',
        }}
      >
        CRVJA Tool Suite
      </div>

      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Only pass custom props if it's a WorkbenchWindow component
        if (child.type === WorkbenchWindow) {
          return React.cloneElement(child, {
            requestfront: () => setglobalz((z) => z + 1),
            globalz,
          });
        }

        return child;
      })}
    </div>
  );
}
