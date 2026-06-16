import React, { useRef, useState, useEffect } from 'react';
import BubbleChart from './BubbleChart';
import PlayerModal from './PlayerModel';
import EmptyState from './EmptyState';
import LeagueStats from './LeagueStats';
import TeamPlayersView from './TeamPlayersView';
import '../styles/marquee.css';

const PlayerList = ({ players, selectedStat, isDark, activeLeague, playerCount, showTeamPlayersView, isLoading = false, hasLiveGames = false, showLiveInNav = false }) => {
  const chartRef = useRef(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.rss.app/v1/ticker.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleShowTeamPlayers = (team) => {
    if (showTeamPlayersView) showTeamPlayersView(team);
    setSelectedPlayer(null); // Close player modal
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (players.length === 0 || !selectedStat) {
    return (
      <EmptyState 
        hasPlayers={selectedStat !== null}
        isDark={isDark}
      />
    );
  }

  // Ensure all players have the correct league property for formatting
  const playersWithLeague = players.map(p => ({ ...p, league: p.league || activeLeague }));

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 min-h-0 bg-transparent overflow-hidden">
        <BubbleChart
          chartRef={chartRef}
          players={playersWithLeague}
          selectedStat={selectedStat}
          isDark={isDark}
          setSelectedPlayer={setSelectedPlayer}
        />
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            isDark={isDark}
            onClose={() => setSelectedPlayer(null)}
            leagueStats={LeagueStats}
            onShowTeamPlayers={handleShowTeamPlayers}
          />
        )}
      </div>
      
      {/* RSS Ticker Section */}
      <div className="w-full h-10 flex-shrink-0 z-10 bg-transparent overflow-hidden">
        <div className="flex items-center h-full bg-transparent">
          <rssapp-ticker id="_2vryjAEB5aMg4ix6"></rssapp-ticker>
        </div>
      </div>
    </div>
  );
};

export default PlayerList;