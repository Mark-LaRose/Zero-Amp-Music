import React, { useEffect, useRef } from 'react';
import '../styles/visual.css';

const Visualizer = ({ audioContext }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioContext) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  }, [audioContext]);

  return <canvas ref={canvasRef} className="visualizer-canvas"></canvas>;
};

export default Visualizer;