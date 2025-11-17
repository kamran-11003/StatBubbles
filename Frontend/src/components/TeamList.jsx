import React, { useState, useRef, useEffect } from 'react';
import { createBubbleVisualization } from './bubbleVisualization';
import TeamModal from './TeamModal';
import EmptyState from './EmptyState';
import '../styles/marquee.css';

const TeamList = ({ teams, selectedStat, isDark, activeLeague, playerCount, showTeamPlayersView, hasLiveGames = false, showLiveInNav = false }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const chartRef = useRef(null);
  const simulationRef = useRef(null);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  // Ensure all teams have the correct league property for formatting
  const teamsWithLeague = teams.map(t => ({ ...t, league: t.league || activeLeague }));

  useEffect(() => {
    if (teamsWithLeague && teamsWithLeague.length > 0 && chartRef.current) {
      console.log('Creating team visualization with:', teamsWithLeague.length, 'teams, stat:', selectedStat);
      createBubbleVisualization({
        chartRef,
        players: teamsWithLeague, // We'll reuse the bubble visualization for teams
        selectedStat: selectedStat || 'wins', // Default to wins if no stat selected
        isDark,
        simulationRef,
        setSelectedPlayer: handleTeamSelect // This will be called when a team bubble is clicked
      });
    }
  }, [teamsWithLeague, selectedStat, isDark]);

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
      <div className={`absolute ${
        hasLiveGames && showLiveInNav 
          ? 'bottom-48 md:bottom-16'  // Live dropdown open - move way up
          : hasLiveGames 
            ? 'bottom-32 md:bottom-16'  // Live button visible - move up a bit
            : 'bottom-24 md:bottom-16'  // No live games - normal position
      } left-0 w-full overflow-hidden bg-transparent transition-all duration-300`}>
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