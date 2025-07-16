import React, { useRef, useState, useEffect } from 'react';
import BubbleChart from './BubbleChart';
import PlayerModal from './PlayerModel';
import EmptyState from './EmptyState';

const TeamPlayersView = ({ team, selectedStat, isDark, onBack, activeLeague, playerCount }) => {
  const chartRef = useRef(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add RSS ticker script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.rss.app/v1/ticker.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://widget.rss.app/v1/ticker.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Fetch team players from backend
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!team || !selectedStat || !activeLeague) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const teamId = team.teamId || team.teamAbbreviation || team.teamDisplayName;
        let url = `/api/stats/${activeLeague}/team/${teamId}/${selectedStat}`;
        if (playerCount) {
          url += `?limit=${playerCount}`;
        }
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTeamPlayers(data);
      } catch (error) {
        console.error('Error fetching team players:', error);
        setTeamPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamPlayers();
  }, [team, selectedStat, activeLeague, playerCount]);

  if (loading) {
    return (
      <div className="w-full h-full relative">
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={onBack}
            className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700/80 hover:bg-gray-600/80 text-white hover:text-blue-300' 
                : 'bg-white/80 hover:bg-blue-50/80 text-gray-800 hover:text-blue-600'
            } backdrop-blur-md shadow-lg hover:shadow-xl transform hover:scale-105`}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: isDark 
                ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              border: isDark 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-sm">Back</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className={`text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading team players...</p>
          </div>
        </div>
      </div>
    );
  }

  if (teamPlayers.length === 0) {
    return (
      <div className="w-full h-full relative">
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={onBack}
            className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700/80 hover:bg-gray-600/80 text-white hover:text-blue-300' 
                : 'bg-white/80 hover:bg-blue-50/80 text-gray-800 hover:text-blue-600'
            } backdrop-blur-md shadow-lg hover:shadow-xl transform hover:scale-105`}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: isDark 
                ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              border: isDark 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-sm">Back</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <EmptyState 
            isDark={isDark}
            message={`No players found for ${team.teamDisplayName || team.teamName || team.displayName}`}
            subMessage="Try selecting a different team"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBack}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/90 hover:bg-gray-700/90 text-white hover:text-blue-300' 
              : 'bg-white/90 hover:bg-blue-50/90 text-gray-800 hover:text-blue-600'
          } backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:scale-105`}
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-sm">Back</span>
        </button>
      </div>

      {/* Team Name Display */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/90 text-white' 
              : 'bg-white/90 text-gray-800'
          } backdrop-blur-md shadow-xl`}
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <h2 className="font-bold text-lg text-center">
            {team.teamDisplayName || team.teamName || team.displayName || 'Team'}
          </h2>
        </div>
      </div>

      {/* Bubble Chart */}
      <div className="w-full h-full bg-transparent overflow-hidden">
        <BubbleChart
          chartRef={chartRef}
          players={teamPlayers}
          selectedStat={selectedStat}
          isDark={isDark}
          setSelectedPlayer={setSelectedPlayer}
        />
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            isDark={isDark}
            onClose={() => setSelectedPlayer(null)}
            leagueStats={null}
            onShowTeamPlayers={null} // Disable team navigation in team view to prevent loops
          />
        )}
      </div>
      
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

export default TeamPlayersView; 