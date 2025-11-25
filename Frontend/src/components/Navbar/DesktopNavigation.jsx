import React from 'react';
import { Search, Moon, Sun, ChevronDown, Users } from 'lucide-react';

const DesktopNavigation = ({
  leagues,
  selectedLeague,
  handleLeagueClick,
  viewMode,
  onViewModeChange,
  navContext,
  leagueStats,
  selectedStat,
  handleStatSelect,
  statsDropdownOpen,
  setStatsDropdownOpen,
  playerCountDropdownOpen,
  setPlayerCountDropdownOpen,
  setShowLiveInNav,
  teamStatsByLeague,
  nbaTeamStats,
  wnbaTeamStats,
  mlbTeamStats,
  nflTeamStats,
  nhlTeamStats,
  showPlayerCountDropdown,
  playerCounts,
  playerCount,
  handlePlayerCountSelect,
  searchQuery,
  handleSearchChange,
  toggleTheme,
  isDark
}) => {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-end gap-5">
      {/* League selection with dropdowns */}
      <div className="flex items-center">
        {leagues.map((league) => (
          <div key={league.name} className="mr-5">
            <div className={`flex items-center ${
              selectedLeague === league.name 
                ? `p-2 bg-opacity-10 rounded-xl ${isDark ? 'bg-blue-400' : 'bg-blue-500'}` 
                : ''
            }`}>
              <div className="flex items-center">
                <button
                  onClick={() => handleLeagueClick(league.name)}
                  className={`px-4 py-1 rounded-lg transition-all duration-300 ${
                    selectedLeague === league.name 
                      ? 'bg-blue-500 text-white' 
                      : `${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'}`
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span className="font-medium">
                    {league.name}
                  </span>
                </button>
              </div>
              
              {/* Show dropdowns only for selected league */}
              {selectedLeague === league.name && (
                <div className="flex items-center ml-3 gap-3">
                  {/* Players/Teams toggle for all leagues */}
                  {['NBA', 'WNBA', 'MLB', 'NFL', 'NHL', 'V League'].includes(selectedLeague) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewModeChange('Players')}
                        className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                          viewMode === 'Players'
                            ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        Players
                      </button>
                      <button
                        onClick={() => onViewModeChange('Teams')}
                        className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                          viewMode === 'Teams'
                            ? isDark ? 'bg-blue-300 text-blue-900' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        Teams
                      </button>
                    </div>
                  )}

                  {/* Stats Dropdown */}
                  {(navContext === 'players' || navContext === 'teamPlayers' || navContext === 'teams') && (
                    <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setStatsDropdownOpen(!statsDropdownOpen);
                          setPlayerCountDropdownOpen(false);
                          setShowLiveInNav(false);
                        }}
                        className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                          isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <span className="font-medium mr-2 truncate max-w-[120px]">
                          {navContext === 'teams' 
                            ? teamStatsByLeague[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'
                            : leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'
                          }
                        </span>
                        <ChevronDown size={16} />
                      </button>
                      {statsDropdownOpen && (
                        <div className={`absolute left-0 mt-2 py-2 w-48 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        } ring-1 ring-black ring-opacity-5 z-10`}>
                          {(navContext === 'teams' ? teamStatsByLeague[selectedLeague] : leagueStats[selectedLeague])?.map((stat) => (
                            <button
                              key={stat.key}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                selectedStat === stat.key
                                  ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                  : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => handleStatSelect(stat.key)}
                            >
                              <span className="truncate whitespace-nowrap w-full max-w-[200px]">{stat.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Player count dropdown (only for Players view) */}
                  {showPlayerCountDropdown && (
                    <div className="relative dropdown-container" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setPlayerCountDropdownOpen(!playerCountDropdownOpen);
                          setStatsDropdownOpen(false);
                          setShowLiveInNav(false);
                        }}
                        className={`flex items-center px-4 py-1 rounded-lg transition-all duration-300 ${
                          isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <Users className="mr-1" size={16} />
                        <span className="font-medium mr-2 truncate">
                          {playerCounts.find(p => p.value === playerCount)?.label || 'All Players'}
                        </span>
                        <ChevronDown size={16} />
                      </button>
                      {playerCountDropdownOpen && (
                        <div className={`absolute left-0 mt-2 py-2 w-40 rounded-md shadow-lg ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        } ring-1 ring-black ring-opacity-5 z-10`}>
                          {playerCounts.map((option) => (
                            <button
                              key={option.value}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                playerCount === option.value
                                  ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                                  : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => handlePlayerCountSelect(option.value)}
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
            </div>
          </div>
        ))}
      </div>

      {/* Search and theme toggle */}
      <div className="flex items-center gap-4">
        <div className="relative w-48 flex items-center">
          <Search className="absolute left-2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full pl-8 pr-3 py-1 rounded-full ${
              isDark 
                ? 'bg-gray-700 text-white placeholder-gray-400' 
                : 'bg-white text-gray-800 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <button
          onClick={toggleTheme}
          className={`p-1 rounded-full ${
            isDark 
              ? 'text-gray-400 hover:bg-gray-700' 
              : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default DesktopNavigation;

