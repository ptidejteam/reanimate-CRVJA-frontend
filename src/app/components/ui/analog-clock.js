"use client";
import React, { useEffect, useRef } from "react";

export default function AnalogClock() {
  const canvasRef = useRef(null);

  useEffect(() => {
    function drawClock() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const w = 200;
      const h = 200;
      const r = 90;
      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.stroke();

      const now = new Date();
      const sec = now.getSeconds();
      const min = now.getMinutes();
      const hr = now.getHours();

      const secAngle = (sec / 60) * Math.PI * 2;
      const minAngle = (min / 60) * Math.PI * 2;
      const hrAngle = ((hr % 12) / 12) * Math.PI * 2;

      // hour hand
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(hrAngle);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(0, -40);
      ctx.stroke();
      ctx.restore();

      // minute hand
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(minAngle);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(0, -60);
      ctx.stroke();
      ctx.restore();

      // second hand
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(secAngle);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(0, -70);
      ctx.stroke();
      ctx.restore();
    }

    const timer = setInterval(drawClock, 1000);
    drawClock();
    return () => clearInterval(timer);
  }, []);

  return <canvas ref={canvasRef} width={200} height={200} />;
}
