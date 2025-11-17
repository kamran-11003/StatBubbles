import React, { useEffect, useRef, useState } from 'react';
import { Search, Moon, Sun, ChevronDown, Users } from 'lucide-react';

const MobileNavigation = ({
  handleLogoClick,
  selectedLeague,
  searchQuery,
  handleSearchChange,
  leagues,
  handleLeagueClick,
  viewMode,
  onViewModeChange,
  selectedStat,
  handleStatSelect,
  showPlayerCountDropdown,
  playerCounts,
  playerCount,
  handlePlayerCountSelect,
  toggleTheme,
  isDark,
  navContext,
  statsDropdownOpen,
  setStatsDropdownOpen,
  playerCountDropdownOpen,
  setPlayerCountDropdownOpen,
  setShowLiveInNav,
  leagueStats,
  teamStatsByLeague
}) => {
  const leagueDropdownRef = useRef(null);
  const statsDropdownRef = useRef(null);
  const playerCountDropdownRef = useRef(null);
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leagueDropdownOpen && leagueDropdownRef.current && !leagueDropdownRef.current.contains(event.target)) {
        setLeagueDropdownOpen(false);
      }
      if (statsDropdownOpen && statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
        setStatsDropdownOpen(false);
      }
      if (playerCountDropdownOpen && playerCountDropdownRef.current && !playerCountDropdownRef.current.contains(event.target)) {
        setPlayerCountDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [leagueDropdownOpen, statsDropdownOpen, playerCountDropdownOpen, setStatsDropdownOpen, setPlayerCountDropdownOpen]);

  return (
    <div className="lg:hidden w-full">
      {/* Row 1: Logo + Search Bar + Theme Toggle */}
      <div className="flex items-center gap-2 w-full mb-3">
        {/* Logo */}
        <div className="flex-shrink-0" style={{ marginLeft: 0, minWidth: 60 }}>
          <img
            src="/S-4.png"
            alt="Logo"
            className="h-6 w-auto cursor-pointer transform scale-[2.5]"
            onClick={handleLogoClick}
          />
        </div>
        
        {/* Search Bar */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full pl-10 pr-3 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-700 text-white placeholder-gray-400' 
                : 'bg-white text-gray-800 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg flex-shrink-0 ${
            isDark 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Row 2: League Dropdown + Player/Team Toggle + Stats + Count (only when league is selected) */}
      {selectedLeague && (
        <div className="flex items-center gap-2 w-full mb-3 flex-wrap">
          {/* League Dropdown */}
          <div ref={leagueDropdownRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLeagueDropdownOpen(!leagueDropdownOpen);
                setStatsDropdownOpen(false);
                setPlayerCountDropdownOpen(false);
              }}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <span className="mr-1">{selectedLeague}</span>
              <ChevronDown size={12} />
            </button>
            {leagueDropdownOpen && (
              <div className={`absolute left-0 top-full mt-1 py-2 w-32 rounded-md shadow-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } ring-1 ring-black ring-opacity-5 z-[100]`}>
                {leagues.map((league) => (
                  <button
                    key={league.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeagueClick(league.name);
                      setLeagueDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs ${
                      selectedLeague === league.name
                        ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                        : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {league.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Player/Team Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => onViewModeChange('Players')}
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                viewMode === 'Players'
                  ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                  : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => onViewModeChange('Teams')}
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                viewMode === 'Teams'
                  ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                  : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              Teams
            </button>
          </div>

          {/* Stats Dropdown */}
          <div ref={statsDropdownRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatsDropdownOpen(!statsDropdownOpen);
                setPlayerCountDropdownOpen(false);
                setLeagueDropdownOpen(false);
                setShowLiveInNav(false);
              }}
              className={`flex items-center px-2 py-1 rounded text-xs ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              } focus:outline-none whitespace-nowrap`}
            >
              <span className="font-medium mr-1 truncate max-w-[80px]">
                {navContext === 'teams' 
                  ? teamStatsByLeague[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Stat'
                  : leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Stat'
                }
              </span>
              <ChevronDown size={12} />
            </button>
            {statsDropdownOpen && (
              <div className={`absolute left-0 top-full mt-1 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } ring-1 ring-black ring-opacity-5 z-[100]`}>
                {(navContext === 'teams' ? teamStatsByLeague[selectedLeague] : leagueStats[selectedLeague])?.map(stat => (
                  <button
                    key={stat.key}
                    className={`block w-full text-left px-4 py-2 text-xs ${
                      selectedStat === stat.key 
                        ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                        : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatSelect(stat.key);
                    }}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Player Count Dropdown (only for players view) */}
          {showPlayerCountDropdown && (
            <div ref={playerCountDropdownRef} className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayerCountDropdownOpen(!playerCountDropdownOpen);
                  setStatsDropdownOpen(false);
                  setLeagueDropdownOpen(false);
                  setShowLiveInNav(false);
                }}
                className={`flex items-center px-2 py-1 rounded text-xs ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                } focus:outline-none whitespace-nowrap`}
              >
                <Users className="mr-1" size={12} />
                <span className="font-medium mr-1 truncate max-w-[60px]">
                  {playerCounts.find(p => p.value === playerCount)?.label || 'All'}
                </span>
                <ChevronDown size={12} />
              </button>
              {playerCountDropdownOpen && (
                <div className={`absolute left-0 top-full mt-1 py-2 w-32 rounded-md shadow-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 z-[100]`}>
                  {playerCounts.map(option => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 text-xs ${
                        playerCount === option.value 
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                          : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayerCountSelect(option.value);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show league selection when no league is selected */}
      {!selectedLeague && (
        <div className="flex flex-wrap gap-2 w-full mb-3">
          {leagues.map((league) => (
            <button
              key={league.name}
              onClick={() => handleLeagueClick(league.name)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
