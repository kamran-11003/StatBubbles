import React, { useState, useEffect, useMemo } from 'react';
import LiveView from './LiveView';
import ComingSoonModal from './ComingSoonModal';
import DesktopNavigation from './Navbar/DesktopNavigation';
import MobileNavigation from './Navbar/MobileNavigation';
import { leagueStatsData, teamStatsByLeagueData } from './Navbar/constants';

const Navbar = ({ 
  selectedStat,
  onStatSelect, 
  isDark, 
  toggleTheme, 
  onLogoClick, 
  selectedLeague,
  onLeagueSelect,
  playerCount,
  onPlayerCountSelect,
  searchQuery,
  onSearchQueryChange,
  liveGames,
  viewMode,
  onViewModeChange,
  navContext,
  showLiveInNav,
  setShowLiveInNav
}) => {
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);
  const [playerCountDropdownOpen, setPlayerCountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonLeague, setComingSoonLeague] = useState('');

  const leagues = [
    { name: 'NBA' },
    { name: 'WNBA' },
    { name: 'NFL' },
    { name: 'MLB' },
    { name: 'NHL' }
  ];
  
  const playerCounts = [
    { label: 'Top 10', value: '10' },
    { label: 'Top 50', value: '50' }
  ];

  // Determine which stat list to show
  let statList = [];
  if (navContext === 'players' || navContext === 'teamPlayers') {
    statList = leagueStatsData[selectedLeague] || [];
  } else if (navContext === 'teams') {
    statList = teamStatsByLeagueData[selectedLeague] || [];
  }

  // Determine if player count dropdown should be shown
  const showPlayerCountDropdown = navContext === 'players';

  const handlePlayerCountSelect = (count) => {
    onPlayerCountSelect(count);
    setPlayerCountDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchQueryChange(value);
  };

  const handleStatSelect = (statKey) => {
    onStatSelect(statKey);
    setStatsDropdownOpen(false);
  };

  const handleLogoClick = () => {
    onLogoClick();
  };

  const handleLeagueClick = (leagueName) => {
    // Show coming soon modal - currently none
    if ([].includes(leagueName)) {
      setComingSoonLeague(leagueName);
      setShowComingSoon(true);
      return;
    }
    
    if (leagueName !== selectedLeague) {
      onLeagueSelect(leagueName);
      const defaultStat = leagueStatsData[leagueName]?.[0]?.key;
      if (defaultStat) {
        handleStatSelect(defaultStat);
      }
    }
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setStatsDropdownOpen(false);
    setPlayerCountDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setStatsDropdownOpen(false);
        setPlayerCountDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-transparent sticky top-0 z-50">
      <nav className={`w-full ${isDark ? 'bg-gray-900' : 'bg-[#f0ece3]'} py-4 px-4 relative`}>
        <div className="max-w-7xl mx-auto px-0 sm:px-4">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between flex-nowrap">
            {/* Logo */}
            <div className="flex-shrink-0" style={{ marginLeft: 0, minWidth: 60 }}>
              <img
                src="/S-4.png"
                alt="Logo"
                className="h-8 w-auto cursor-pointer transform scale-[3.5]"
                onClick={handleLogoClick}
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="flex-1 flex items-center justify-between gap-5 ml-16 min-w-0">
              <DesktopNavigation
                leagues={leagues}
                selectedLeague={selectedLeague}
                handleLeagueClick={handleLeagueClick}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                navContext={navContext}
                leagueStats={leagueStatsData}
                selectedStat={selectedStat}
                handleStatSelect={handleStatSelect}
                statsDropdownOpen={statsDropdownOpen}
                setStatsDropdownOpen={setStatsDropdownOpen}
                playerCountDropdownOpen={playerCountDropdownOpen}
                setPlayerCountDropdownOpen={setPlayerCountDropdownOpen}
                setShowLiveInNav={setShowLiveInNav}
                teamStatsByLeague={teamStatsByLeagueData}
                showPlayerCountDropdown={showPlayerCountDropdown}
                playerCounts={playerCounts}
                playerCount={playerCount}
                handlePlayerCountSelect={handlePlayerCountSelect}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                toggleTheme={toggleTheme}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Mobile Layout - 3 Rows */}
          <div className="lg:hidden">
            <MobileNavigation
              handleLogoClick={handleLogoClick}
              selectedLeague={selectedLeague}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              leagues={leagues}
              handleLeagueClick={handleLeagueClick}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              selectedStat={selectedStat}
              handleStatSelect={handleStatSelect}
              showPlayerCountDropdown={showPlayerCountDropdown}
              playerCounts={playerCounts}
              playerCount={playerCount}
              handlePlayerCountSelect={handlePlayerCountSelect}
              toggleTheme={toggleTheme}
              isDark={isDark}
              navContext={navContext}
              statsDropdownOpen={statsDropdownOpen}
              setStatsDropdownOpen={setStatsDropdownOpen}
              playerCountDropdownOpen={playerCountDropdownOpen}
              setPlayerCountDropdownOpen={setPlayerCountDropdownOpen}
              setShowLiveInNav={setShowLiveInNav}
              leagueStats={leagueStatsData}
              teamStatsByLeague={teamStatsByLeagueData}
            />
          </div>
        </div>
      </nav>

      {/* Live View Component */}
      <LiveView 
        isDark={isDark}
        selectedLeague={selectedLeague}
        showLiveInNav={showLiveInNav}
        onToggleLiveInNav={(isOpen) => {
          setShowLiveInNav(isOpen);
          if (isOpen) {
            setStatsDropdownOpen(false);
            setPlayerCountDropdownOpen(false);
          }
        }}
        liveGames={liveGames}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        leagueName={comingSoonLeague}
        isDark={isDark}
      />
    </div>
  );
};

export default Navbar;
