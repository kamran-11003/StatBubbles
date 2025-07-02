import React, { useState, useRef, useEffect } from 'react';
import { createBubbleVisualization } from './bubbleVisualization';
import TeamModal from './TeamModal';
import EmptyState from './EmptyState';
import '../styles/marquee.css';

const TeamList = ({ teams, selectedStat, isDark, activeLeague, playerCount, showTeamPlayersView }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const chartRef = useRef(null);
  const simulationRef = useRef(null);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  useEffect(() => {
    if (teams && teams.length > 0 && chartRef.current) {
      console.log('Creating team visualization with:', teams.length, 'teams, stat:', selectedStat);
      createBubbleVisualization({
        chartRef,
        players: teams, // We'll reuse the bubble visualization for teams
        selectedStat: selectedStat || 'wins', // Default to wins if no stat selected
        isDark,
        simulationRef,
        setSelectedPlayer: handleTeamSelect // This will be called when a team bubble is clicked
      });
    }
  }, [teams, selectedStat, isDark]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.rss.app/v1/ticker.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  if (!teams || teams.length === 0) {
    return (
      <EmptyState 
        isDark={isDark}
        message="No teams found"
        subMessage="Try selecting a different stat or league"
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={chartRef}
        className="w-full h-full"
        style={{ background: isDark ? '#111827' : '#f0ece3' }}
      />
      
      {showModal && selectedTeam && (
        <TeamModal
          team={selectedTeam}
          isDark={isDark}
          onClose={closeModal}
          onShowTeamPlayers={showTeamPlayersView}
        />
      )}

      {/* RSS Ticker Section */}
      <div className="absolute bottom-16 left-0 w-full overflow-hidden bg-transparent">
        <div 
          className={`flex items-center h-10 ${isDark ? 'bg-gray-800/40' : 'bg-white/40'} backdrop-blur-sm`}
        >
          <rssapp-ticker id="_2vryjAEB5aMg4ix6"></rssapp-ticker>
        </div>
      </div>
    </div>
  );
};

export default TeamList; 