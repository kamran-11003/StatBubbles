import React, { useState } from 'react';
import { Search, Moon, Sun, ChevronDown, Users, X } from 'lucide-react';
import ViewModeToggle from './ViewModeToggle';

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
  showPlayerCountDropdown,
  playerCounts,
  playerCount,
  handlePlayerCountSelect,
  searchQuery,
  handleSearchChange,
  toggleTheme,
  isDark
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(!!searchQuery);

  return (
    <div className="hidden lg:flex flex-1 items-center justify-end gap-5">
      {/* League selection with dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {leagues.map((league) => (
          <div key={league.name} className="flex items-center gap-2">
            <button
              onClick={() => handleLeagueClick(league.name)}
              className={`px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-350 ${
                selectedLeague === league.name 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : `${isDark ? 'bg-[#121214] text-[#ececed] border border-neutral-850 hover:bg-[#1a1a1f] hover:text-white' : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'}`
              } focus:outline-none`}
            >
              <span>
                {league.name}
              </span>
            </button>
            
            {/* Show dropdowns only for selected league */}
            {selectedLeague === league.name && (
              <div className="flex items-center gap-2">
                {/* Players/Teams toggle for all leagues */}
                {['NBA', 'WNBA', 'MLB', 'NFL', 'NHL', 'V League'].includes(selectedLeague) && (
                  <ViewModeToggle 
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                    isDark={isDark}
                  />
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
                      className={`flex items-center px-4 py-1.5 rounded-xl border transition-all duration-300 ${
                        isDark 
                          ? 'bg-[#121214] border-neutral-850 text-[#ececed] hover:bg-[#1a1a1f]' 
                          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                      } focus:outline-none`}
                    >
                      <span className="font-semibold mr-1.5 truncate max-w-[120px] text-sm">
                        {navContext === 'teams' 
                          ? teamStatsByLeague[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'
                          : leagueStats[selectedLeague]?.find(stat => stat.key === selectedStat)?.label || 'Select Stat'
                        }
                      </span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {statsDropdownOpen && (
                      <div className={`absolute left-0 mt-2 py-2 w-48 rounded-xl shadow-lg max-h-60 overflow-y-auto ${
                        isDark ? 'bg-[#121214] border border-neutral-800' : 'bg-white border border-gray-100'
                      } ring-1 ring-black ring-opacity-5 z-10`}>
                        {(navContext === 'teams' ? teamStatsByLeague[selectedLeague] : leagueStats[selectedLeague])?.map((stat) => (
                          <button
                            key={stat.key}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedStat === stat.key
                                ? isDark ? 'bg-zinc-800 text-white font-semibold' : 'bg-gray-100 text-blue-600'
                                : isDark ? 'text-gray-300 hover:bg-zinc-800' : 'text-gray-750 hover:bg-gray-100'
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
                      className={`flex items-center px-4 py-1.5 rounded-xl border transition-all duration-300 ${
                        isDark 
                          ? 'bg-[#121214] border-neutral-850 text-[#ececed] hover:bg-[#1a1a1f]' 
                          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                      } focus:outline-none`}
                    >
                      <Users className="mr-1.5 text-gray-400" size={14} />
                      <span className="font-semibold mr-1.5 truncate text-sm">
                        {playerCounts.find(p => p.value === playerCount)?.label || 'All Players'}
                      </span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {playerCountDropdownOpen && (
                      <div className={`absolute left-0 mt-2 py-2 w-40 rounded-xl shadow-lg ${
                        isDark ? 'bg-[#121214] border border-neutral-800' : 'bg-white border border-gray-100'
                      } ring-1 ring-black ring-opacity-5 z-10`}>
                        {playerCounts.map((option) => (
                          <button
                            key={option.value}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              playerCount === option.value
                                ? isDark ? 'bg-zinc-800 text-white font-semibold' : 'bg-gray-100 text-blue-600'
                                : isDark ? 'text-gray-300 hover:bg-zinc-800' : 'text-gray-700 hover:bg-gray-100'
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
        ))}
      </div>

      {/* Search and theme toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 pointer-events-none" size={15} />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className={`pl-9 pr-8 py-1.5 w-48 rounded-xl border transition-all duration-300 text-sm ${
                  isDark 
                    ? 'bg-[#121214] border-blue-500/35 text-white placeholder-gray-500' 
                    : 'bg-white border-blue-500/25 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
              />
              <button 
                onClick={() => {
                  handleSearchChange({ target: { value: '' } });
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-gray-400 hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-[#121214] border-neutral-850 text-gray-300 hover:text-white hover:border-blue-500/40' 
                  : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800 hover:border-blue-500/30'
              }`}
            >
              <Search size={15} />
            </button>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className={`p-2 transition-colors duration-200 rounded-xl ${
            isDark 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default DesktopNavigation;

