import React, { useEffect, useRef } from 'react';
import { createBubbleVisualization } from './bubbleVisualization';

const BubbleChart = ({ chartRef, players, selectedStat, isDark, setSelectedPlayer }) => {
  const simulationRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (players.length > 0 && selectedStat) {
        createBubbleVisualization({
          chartRef,
          players,
          selectedStat,
          isDark,
          simulationRef,
          setSelectedPlayer
        });
      }
    };

    window.addEventListener('resize', handleResize);
    if (players.length > 0 && selectedStat) {
      handleResize();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [players, selectedStat, isDark]);

  return (
    <div ref={chartRef} className="w-full h-full bg-transparent mb-[-25px]" />
  );
};

export default BubbleChart;