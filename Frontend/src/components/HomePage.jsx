import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ComingSoonModal from './ComingSoonModal';

const HomePage = ({ isDark, onLeagueSelect, onStatSelect }) => {
  const chartRef = useRef(null);
  const leagueBubblesRef = useRef(null);
  const backgroundSimulationRef = useRef(null);
  const leagueSimulationRef = useRef(null);
  const [hoveredLeague, setHoveredLeague] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonLeague, setComingSoonLeague] = useState('');

  // League data with colors and stat info
  const leagueData = [
    { 
      name: 'NBA', 
      color: '#991B1B', // darker red
      value: 100,
      description: 'Basketball player and team statistics',
      defaultStat: 'avgPoints', // Most important player stat for NBA
      stats: [
        // Player stats
        'avgPoints', 'points', 'avgRebounds', 'rebounds', 'offensiveRebounds', 'defensiveRebounds',
        'avgAssists', 'assists', 'avgBlocks', 'blocks', 'avgSteals', 'steals',
        'avgTurnovers', 'turnovers', 'avgFouls', 'fouls', 'fieldGoalsAttempted', 'fieldGoalsMade', 'fieldGoalPct',
        'threePointFieldGoalsAttempted', 'threePointFieldGoalsMade', 'threePointFieldGoalPct',
        'freeThrowsAttempted', 'freeThrowsMade', 'freeThrowPct', 'minutes', 'avgMinutes',
        'gamesPlayed', 'gamesStarted', 'doubleDouble', 'tripleDouble',
        // Team stats
        'wins', 'losses', 'winPercentage', 'gamesBehind', 'homeRecord', 'awayRecord',
        'conferenceRecord', 'pointsPerGame', 'opponentPointsPerGame', 'pointDifferential', 'streak', 'lastTenGames'
      ]
    },
    { 
      name: 'WNBA', 
      color: '#BE185D', // darker pink
      value: 100,
      description: 'Women\'s basketball player and team statistics',
      defaultStat: 'avgPoints', // Most important player stat for WNBA
      stats: [
        // Player stats
        'avgPoints', 'points', 'avgRebounds', 'rebounds', 'offensiveRebounds', 'defensiveRebounds',
        'avgAssists', 'assists', 'avgBlocks', 'blocks', 'avgSteals', 'steals',
        'avgTurnovers', 'turnovers', 'avgFouls', 'fouls', 'fieldGoalsAttempted', 'fieldGoalsMade', 'fieldGoalPct',
        'threePointFieldGoalsAttempted', 'threePointFieldGoalsMade', 'threePointFieldGoalPct',
        'freeThrowsAttempted', 'freeThrowsMade', 'freeThrowPct', 'minutes', 'avgMinutes',
        'gamesPlayed', 'gamesStarted', 'doubleDouble', 'tripleDouble',
        // Team stats
        'wins', 'losses', 'winPercentage', 'gamesBehind', 'homeRecord', 'awayRecord',
        'conferenceRecord', 'pointsPerGame', 'opponentPointsPerGame', 'pointDifferential', 'streak', 'lastTenGames'
      ]
    },
    { 
      name: 'NFL', 
      color: '#1E40AF', // darker blue
      value: 100,
      description: 'Football player and team statistics',
      defaultStat: 'passYards', // Most important player stat (starts in Players view)
      stats: [
        // General Stats
        'gamesPlayed', 'fumbles', 'fumblesLost', 'fumblesTouchdowns', 'offensiveTwoPtReturns', 'offensiveFumblesTouchdowns', 'defensiveFumblesTouchdowns',
        
        // Player stats - Passing
        'passCompletions', 'passAttempts', 'completionPercentage', 'passYards', 'yardsPerPassAttempt',
        'passTouchdowns', 'interceptions', 'longestPass', 'sacksTaken', 'sackYards', 'passerRating', 'qbr',
        'espnQBRating', 'interceptionPct', 'netPassingYards', 'netPassingYardsPerGame', 'netTotalYards', 'netYardsPerGame',
        'passingBigPlays', 'passingFirstDowns', 'passingFumbles', 'passingFumblesLost', 'passingTouchdownPct',
        'passingYardsAfterCatch', 'passingYardsAtCatch', 'passingYardsPerGame', 'netPassingAttempts', 'teamGamesPlayed',
        'totalOffensivePlays', 'totalPointsPerGame', 'totalYards', 'totalYardsFromScrimmage', 'twoPointPassConvs',
        'twoPtPass', 'twoPtPassAttempts', 'yardsFromScrimmagePerGame', 'yardsPerCompletion', 'yardsPerGame',
        'netYardsPerPassAttempt', 'adjQBR', 'quarterbackRating',
        
        // Player stats - Rushing
        'rushingAttempts', 'rushingYards', 'yardsPerRushAttempt', 'longestRush', 'rushTouchdowns',
        'rushingFumbles', 'rushingFumblesLost', 'espnRBRating', 'rushingBigPlays', 'rushingFirstDowns',
        'rushingYardsPerGame', 'twoPointRushConvs', 'twoPtRush', 'twoPtRushAttempts',
        
        // Player stats - Receiving
        'receivingTargets', 'receptions', 'catchPercentage', 'receivingYards', 'yardsPerReception', 'receivingYardsPerGame',
        'longestReception', 'receivingTouchdowns', 'receivingFumbles', 'receivingFumblesLost', 'espnWRRating',
        'receivingBigPlays', 'receivingFirstDowns', 'receivingYardsAfterCatch', 'receivingYardsAtCatch',
        'twoPointRecConvs', 'twoPtReception', 'twoPtReceptionAttempts',
        
        // Player stats - Defense
        'totalTackles', 'soloTackles', 'assistedTackles', 'sacks', 'defensiveInterceptions', 'passesDefended',
        'forcedFumbles', 'fumbleRecoveries', 'interceptionTouchdowns', 'safeties', 'kicksBlocked',
        'fumbleRecoveryYards', 'interceptionYards', 'avgInterceptionYards', 'longestInterception',
        'stuffs', 'stuffYards',
        
        // Player stats - Scoring
        'passingTouchdowns', 'rushingTouchdowns', 'receivingTouchdowns', 'returnTouchdowns', 'totalTouchdowns',
        'totalTwoPointConvs', 'kickExtraPoints', 'fieldGoals', 'totalPoints', 'defensivePoints',
        'kickExtraPointsMade', 'miscPoints', 'twoPointPassConvs', 'twoPointRecConvs', 'twoPointRushConvs',
        'onePtSafetiesMade',
        
        // Special Teams - Kicking
        'fieldGoalsMade', 'fieldGoalAttempts', 'fieldGoalPercentage', 'longFieldGoalMade', 'extraPointsMade',
        'extraPointAttempts', 'extraPointPercentage', 'totalKickingPoints', 'fieldGoalsMade1_19',
        'fieldGoalsMade20_29', 'fieldGoalsMade30_39', 'fieldGoalsMade40_49', 'fieldGoalsMade50',
        
        // Special Teams - Punting
        'punts', 'puntYards', 'grossAvgPuntYards', 'netAvgPuntYards', 'puntsInside20', 'puntTouchbacks',
        'longestPunt', 'blockedPunts',
        
        // Special Teams - Returns
        'kickReturnAttempts', 'kickReturnYards', 'kickReturnAverage', 'kickReturnTouchdowns', 'longestKickReturn',
        'puntReturnAttempts', 'puntReturnYards', 'puntReturnAverage', 'puntReturnTouchdowns', 'longestPuntReturn',
        'kickReturnFairCatches', 'puntReturnFairCatches',
        
        // Team stats (expanded to align with dropdown categories)
        'netPassingYards', 'rushingYards', 'totalYards', 'yardsPerPlay', 'totalPointsPerGame',
        'totalFirstDowns', 'thirdDownConversionPct', 'fourthDownConversionPct', 'redzoneScoringPct',
        'totalGiveaways', 'possessionTimeSeconds',
        // Defense aliases/opponent
        'pointsAllowed', 'totalYardsAllowed', 'passingYardsAllowed', 'rushingYardsAllowed',
        'totalTakeaways', 'redZoneAllowedPct', 'thirdDownAllowedPct', 'fourthDownAllowedPct',
        // Special teams
        'fieldGoalPct', 'extraPointPct', 'grossAvgPuntYards', 'netAvgPuntYards', 'puntsInside20',
        'avgKickoffReturnYards', 'avgPuntReturnYards', 'specialTeamsTDs', 'blockedKicks',
        // Penalties
        'totalPenalties', 'totalPenaltyYards', 'penaltiesPerGame'
      ]
    },
    { 
      name: 'MLB', 
      color: '#C2410C', // darker orange
      value: 100,
      description: 'Baseball player and team statistics',
      defaultStat: 'batting_gamesPlayed', // Most common player stat for MLB
      stats: [
        // Player stats - Batting
        'batting_gamesPlayed', 'batting_atBats', 'batting_runs', 'batting_hits',
        'batting_doubles', 'batting_triples', 'batting_homeRuns', 'batting_RBIs',
        'batting_stolenBases', 'batting_caughtStealing', 'batting_walks', 'batting_strikeouts',
        'batting_avg', 'batting_onBasePct', 'batting_slugAvg', 'batting_OPS',
        
        // Player stats - Fielding
        'fielding_gamesPlayed', 'fielding_fullInningsPlayed', 'fielding_totalChances',
        'fielding_putouts', 'fielding_assists', 'fielding_errors', 'fielding_fieldingPct',
        'fielding_doublePlays', 'fielding_triplePlays',
        
        // Player stats - Pitching
        'pitching_gamesPlayed', 'pitching_gamesStarted', 'pitching_completeGames', 'pitching_shutouts',
        'pitching_innings', 'pitching_hits', 'pitching_runs', 'pitching_earnedRuns',
        'pitching_homeRuns', 'pitching_walks', 'pitching_strikeouts', 'pitching_wins',
        'pitching_losses', 'pitching_saves', 'pitching_holds', 'pitching_blownSaves',
        'pitching_ERA', 'pitching_WHIP',
        
        // Team stats
        'wins', 'losses', 'winpercent', 'gamesbehind', 'home', 'road', 'vsconf',
        'avgpointsfor', 'avgpointsagainst', 'differential', 'streak', 'lasttengames'
      ]
    },
    { 
      name: 'NHL', 
      color: '#6D28D9', // darker purple
      value: 100,
      description: 'Hockey player and team statistics',
      defaultStat: 'goals', // Most important scoring stat for NHL
      stats: [
        // Player stats - General
        'games', 'gameStarted', 'teamGamesPlayed', 'timeOnIce', 'timeOnIcePerGame', 'shifts', 
        'shiftsPerGame', 'production', 'plusMinus',
        // Player stats - Offensive
        'goals', 'avgGoals', 'assists', 'points', 'pointsPerGame', 'shotsTotal', 'avgShots',
        'shootingPct', 'powerPlayGoals', 'powerPlayAssists', 'shortHandedGoals', 'shortHandedAssists',
        'gameWinningGoals', 'gameTyingGoals', 'totalFaceOffs', 'faceoffsWon', 'faceoffsLost', 
        'faceoffPercent', 'shootoutAttempts', 'shootoutGoals', 'shootoutShotPct',
        // Player stats - Defensive (Goalie)
        'wins', 'losses', 'ties', 'goalsAgainst', 'avgGoalsAgainst', 'saves', 'savePct', 
        'shotsAgainst', 'avgShotsAgainst', 'shutouts', 'overtimeLosses', 'blockedShots', 'hits',
        'shootoutSaves', 'shootoutShotsAgainst', 'shootoutSavePct', 'emptyNetGoalsAgainst',
        'evenStrengthSaves', 'powerPlaySaves', 'shortHandedSaves',
        // Player stats - Penalties
        'penaltyMinutes', 'majorPenalties', 'minorPenalties', 'matchPenalties', 'misconducts',
        'gameMisconducts', 'fightingPenalties', 'avgFights', 'boardingPenalties', 'chargingPenalties',
        'hookingPenalties', 'trippingPenalties', 'slashingPenalties', 'highStickingPenalties',
        'crossCheckingPenalties', 'holdingPenalties', 'interferencePenalties', 'roughingPenalties',
        'unsportsmanlikePenalties', 'instigatorPenalties', 'stickHoldingPenalties',
        'goalieInterferencePenalties', 'elbowingPenalties', 'divingPenalties',
        // Team stats - Standings
        'gamesplayed', 'gamesbehind', 'pointsfor', 'pointsagainst',
        'pointdifferential', 'pointsdiff', 'differential', 'home', 'road', 'vsdiv', 'total',
        'lasttengames', 'streak', 'otlosses', 'overtimewins', 'shootoutlosses', 'shootoutwins',
        'reglosses', 'regwins', 'rotlosses', 'rotwins', 'playoffseed'
      ]
    },
    { 
      name: 'V League', 
      color: '#059669', // darker green
      value: 100,
      description: 'V League basketball player and team statistics',
      defaultStat: 'PTS', // Most important player stat for V League
      stats: [
        // Player stats
        'PTS', 'FGM', 'FGA', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%',
        'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK', 'TOV',
        // Team stats
        'W', 'L', 'WIN%'
      ]
    }
  ];

  // Function to create random sample data for the background bubbles
  const createSampleData = () => {
    const leagues = ['NBA', 'WNBA', 'NFL', 'MLB', 'NHL', 'V League'];
    const teamColors = [
      '#991B1B', // darker red
      '#BE185D', // darker pink
      '#1E40AF', // darker blue
      '#C2410C', // darker orange
      '#6D28D9', // darker purple
      '#059669', // darker green (V League)
      '#B45309', // darker amber
      '#4338CA', // darker indigo
      '#0F766E', // darker teal
    ];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      league: leagues[Math.floor(Math.random() * leagues.length)],
      value: Math.random() * 100,
      teamColor: teamColors[Math.floor(Math.random() * teamColors.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    }));
  };

  // Render the background bubbles
  useEffect(() => {
    const renderBackgroundBubbles = () => {
      if (!chartRef.current) return;
      
      d3.select(chartRef.current).selectAll('*').remove();

      if (backgroundSimulationRef.current) {
        backgroundSimulationRef.current.stop();
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const data = createSampleData();
      
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'transparent');
        
      const defs = svg.append('defs');
      
      // Create enhanced bubble gradients for background
      data.forEach((d, i) => {
        const baseColor = d.teamColor;
        
        // Main gradient
        const gradientId = `home-bubble-gradient-${i}`;
        const gradient = defs.append('radialGradient')
          .attr('id', gradientId)
          .attr('cx', '30%')
          .attr('cy', '30%')
          .attr('r', '70%')
          .attr('fx', '25%')
          .attr('fy', '25%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', 'rgba(255, 255, 255, 0.95)');
        
        gradient.append('stop')
          .attr('offset', '35%')
          .attr('stop-color', `${baseColor}88`);
        
        gradient.append('stop')
          .attr('offset', '80%')
          .attr('stop-color', `${baseColor}bb`);
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', `${baseColor}`);
          
        // Highlight gradient for glass effect
        const highlightId = `home-bubble-highlight-${i}`;
        const highlight = defs.append('radialGradient')
          .attr('id', highlightId)
          .attr('cx', '25%')
          .attr('cy', '25%')
          .attr('r', '50%')
          .attr('fx', '25%')
          .attr('fy', '25%');
        
        highlight.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', 'rgba(255, 255, 255, 0.8)');
        
        highlight.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', 'rgba(255, 255, 255, 0)');
          
        // Add simple filter
        const filterId = `home-bubble-filter-${i}`;
        const filter = defs.append('filter')
          .attr('id', filterId)
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%');
          
        filter.append('feGaussianBlur')
          .attr('in', 'SourceGraphic')
          .attr('stdDeviation', '1')
          .attr('result', 'blur');
          
        filter.append('feDropShadow')
          .attr('dx', '0')
          .attr('dy', '2')
          .attr('stdDeviation', '2')
          .attr('flood-color', '#000000')
          .attr('flood-opacity', '0.2');
      });
      
      // Create nodes with glass effect
      const bubbleSizes = d3.scaleSqrt()
        .domain([0, 100])
        .range([15, 50]); // Adjusted size range for better visual
      
      const node = svg.selectAll('.node')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'node');
      
      // Add main bubble
      node.append('circle')
        .attr('class', 'bubble-main')
        .attr('r', d => bubbleSizes(d.value) * 0.95)
        .attr('fill', (d, i) => `url(#home-bubble-gradient-${i})`)
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 1)
        .style('filter', (d, i) => `url(#home-bubble-filter-${i})`)
        .style('opacity', '0.75'); // Slightly more transparent for background
      
      // Add highlight for glass effect
      node.append('circle')
        .attr('class', 'bubble-highlight')
        .attr('r', d => bubbleSizes(d.value) * 0.7)
        .attr('fill', (d, i) => `url(#home-bubble-highlight-${i})`)
        .style('pointer-events', 'none')
        .style('opacity', 0.5);
      
      // Set up forces with slight tweaks for more natural movement
      backgroundSimulationRef.current = d3.forceSimulation(data)
        .force('charge', d3.forceManyBody().strength(10)) // Slightly attractive instead of repulsive
        .force('collide', d3.forceCollide().radius(d => bubbleSizes(d.value) + 2).iterations(3))
        .force('x', d3.forceX(width / 2).strength(0.008)) // Weaker center force
        .force('y', d3.forceY(height / 2).strength(0.008))
        .alphaDecay(0.0015) // Slower decay for longer movement
        .velocityDecay(0.2); // Less friction for more movement
      
      // Add some random initial velocities for more interesting motion
      data.forEach(d => {
        d.vx = (Math.random() - 0.5) * 1.5;
        d.vy = (Math.random() - 0.5) * 1.5;
      });
      
      // Update positions with boundary physics
      backgroundSimulationRef.current.on('tick', () => {
        node.attr('transform', d => {
          const r = bubbleSizes(d.value);
          
          // Soft boundary conditions with bounce
          if (d.x < r) {
            d.x = r;
            if (d.vx < 0) d.vx = -d.vx * 0.6;
          }
          if (d.x > width - r) {
            d.x = width - r;
            if (d.vx > 0) d.vx = -d.vx * 0.6;
          }
          if (d.y < r) {
            d.y = r;
            if (d.vy < 0) d.vy = -d.vy * 0.6;
          }
          if (d.y > height - r) {
            d.y = height - r;
            if (d.vy > 0) d.vy = -d.vy * 0.6;
          }
          
          return `translate(${d.x}, ${d.y})`;
        });
      });
    };

    renderBackgroundBubbles();

    const handleResize = () => {
      renderBackgroundBubbles();
      renderLeagueBubbles();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (backgroundSimulationRef.current) {
        backgroundSimulationRef.current.stop();
      }
    };
  }, [isDark]);

  // Render league bubbles
  const renderLeagueBubbles = () => {
    if (!leagueBubblesRef.current) return;
    
    d3.select(leagueBubblesRef.current).selectAll('*').remove();

    if (leagueSimulationRef.current) {
      leagueSimulationRef.current.stop();
    }

    const containerWidth = leagueBubblesRef.current.clientWidth;
    const containerHeight = 400; // Increased height for better spacing
    
    const svg = d3
      .select(leagueBubblesRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background', 'transparent');
      
    const defs = svg.append('defs');
    
    // Create league bubble gradients with enhanced glass effect
    leagueData.forEach((league, i) => {
      const gradientId = `league-bubble-gradient-${i}`;
      const baseColor = league.color;
      
      // Main radial gradient for bubble base
      const gradient = defs.append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '30%')
        .attr('cy', '30%')
        .attr('r', '70%')
        .attr('fx', '25%')
        .attr('fy', '25%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.95)');
      
      gradient.append('stop')
        .attr('offset', '35%')
        .attr('stop-color', `${baseColor}aa`);
      
      gradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', `${baseColor}dd`);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', `${baseColor}`);
      
      // Highlight gradient for glossy effect (top-left to bottom-right)
      const highlightId = `league-bubble-highlight-${i}`;
      const highlight = defs.append('radialGradient')
        .attr('id', highlightId)
        .attr('cx', '20%')
        .attr('cy', '20%')
        .attr('r', '60%')
        .attr('fx', '15%')
        .attr('fy', '15%');
      
      highlight.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 1)');
      
      highlight.append('stop')
        .attr('offset', '40%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.5)');
        
      highlight.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255, 255, 255, 0)');
      
      // Create another highlight for bottom-right (specular highlight)
      const highlightBottomId = `league-bubble-highlight-bottom-${i}`;
      const highlightBottom = defs.append('radialGradient')
        .attr('id', highlightBottomId)
        .attr('cx', '85%')
        .attr('cy', '85%')
        .attr('r', '40%')
        .attr('fx', '85%')
        .attr('fy', '85%');
        
      highlightBottom.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.6)');
        
      highlightBottom.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.2)');
        
      highlightBottom.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255, 255, 255, 0)');
        
      // Create a third smaller highlight for extra realism
      const highlightSpecId = `league-bubble-highlight-spec-${i}`;
      const highlightSpec = defs.append('radialGradient')
        .attr('id', highlightSpecId)
        .attr('cx', '40%')
        .attr('cy', '30%')
        .attr('r', '15%')
        .attr('fx', '40%')
        .attr('fy', '30%');
        
      highlightSpec.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.9)');
        
      highlightSpec.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255, 255, 255, 0)');
        
      // Add filter for enhanced glass effect
      const filterId = `league-bubble-filter-${i}`;
      const filter = defs.append('filter')
        .attr('id', filterId)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('filterUnits', 'objectBoundingBox')
        .attr('primitiveUnits', 'userSpaceOnUse')
        .attr('color-interpolation-filters', 'sRGB');
      
      // Create glass-like refraction effect
      filter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '1.5')
        .attr('result', 'blur');
        
      // Add slight chromatic aberration for realistic glass effect
      const colorMatrix = filter.append('feColorMatrix')
        .attr('in', 'blur')
        .attr('type', 'matrix')
        .attr('values', `
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 18 -7
        `)
        .attr('result', 'colorMatrix');
      
      // Create shadow
      const dropShadow = filter.append('feDropShadow')
        .attr('dx', '0')
        .attr('dy', '6')
        .attr('stdDeviation', '5')
        .attr('flood-color', '#000000')
        .attr('flood-opacity', '0.3')
        .attr('result', 'shadow');
      
      // Create a subtle inner glow
      const innerGlow = filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', '1.2')
        .attr('result', 'alpha_blur');
      
      const compInner = filter.append('feComposite')
        .attr('in', 'alpha_blur')
        .attr('in2', 'SourceAlpha')
        .attr('operator', 'in')
        .attr('result', 'inner_glow');
      
      const innerColorMatrix = filter.append('feColorMatrix')
        .attr('in', 'inner_glow')
        .attr('type', 'matrix')
        .attr('values', '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0')
        .attr('result', 'inner_glow_colored');
        
      // Combine all effects
      const mergeAll = filter.append('feMerge')
        .attr('result', 'final_image');
      
      mergeAll.append('feMergeNode')
        .attr('in', 'shadow');
        
      mergeAll.append('feMergeNode')
        .attr('in', 'SourceGraphic');
        
      mergeAll.append('feMergeNode')
        .attr('in', 'inner_glow_colored');
    });
    
    // Fixed bubble size for leagues
    const bubbleSize = 70; // Slightly smaller bubbles for better fit
    
    // Drag behavior for bubbles
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) leagueSimulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) leagueSimulationRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    
    // Create league nodes with drag functionality
    const leagueNodes = svg.selectAll('.league-node')
      .data(leagueData)
      .enter()
      .append('g')
      .attr('class', 'league-node')
      .style('cursor', 'grab')
      .call(drag)
      .on('click', (event, d) => {
        // Only navigate if it's a click, not a drag
        if (!event.defaultPrevented) {
          handleLeagueSelect(d.name);
        }
      })
      .on('mouseover', function(event, d) {
        // Prevent event propagation to stop flickering
        event.stopPropagation();
        
        // Set hovered league only if it's different to avoid re-renders
        if (!hoveredLeague || hoveredLeague.name !== d.name) {
          setHoveredLeague(d);
        }
        
        // Apply visual changes directly with D3 without re-renders
        d3.select(this).select('.bubble-main')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 1.1);
          
        d3.select(this).select('.bubble-highlight')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 1.1 * 0.9);
          
        d3.select(this).select('.bubble-highlight-bottom')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 1.1 * 0.5);
          
        d3.select(this).select('.bubble-highlight-spec')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 1.1 * 0.25)
          .style('opacity', 1);
          
        d3.select(this).select('.bubble-stroke')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 1.1)
          .attr('stroke', 'rgba(255, 255, 255, 0.8)')
          .attr('stroke-width', 2);
          
        // Bring this bubble to front
        this.parentNode.appendChild(this);
      })
      .on('mouseout', function(event, d) {
        // Prevent event propagation
        event.stopPropagation();
        
        // Clear hovered league with a small delay to prevent flickering
        setTimeout(() => {
          // Only clear if we're not hovering over the tooltip
          const tooltipEl = document.querySelector('.league-tooltip');
          if (tooltipEl && !tooltipEl.matches(':hover')) {
            setHoveredLeague(null);
          }
        }, 50);
        
        d3.select(this).select('.bubble-main')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize);
          
        d3.select(this).select('.bubble-highlight')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 0.9);
          
        d3.select(this).select('.bubble-highlight-bottom')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 0.5);
          
        d3.select(this).select('.bubble-highlight-spec')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize * 0.25)
          .style('opacity', 0.9);
          
        d3.select(this).select('.bubble-stroke')
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr('r', bubbleSize)
          .attr('stroke', 'rgba(255, 255, 255, 0.5)')
          .attr('stroke-width', 1.5);
      });
    
    // Add bubble circles with multiple layers for realistic glass effect
    leagueNodes.each(function(d, i) {
      const g = d3.select(this);
      
      // Main bubble fill
      g.append('circle')
        .attr('class', 'bubble-main')
        .attr('r', bubbleSize)
        .attr('fill', `url(#league-bubble-gradient-${i})`)
        .style('filter', `url(#league-bubble-filter-${i})`);
      
      // Top-left highlight (primary light reflection)
      g.append('circle')
        .attr('class', 'bubble-highlight')
        .attr('r', bubbleSize * 0.9)
        .attr('fill', `url(#league-bubble-highlight-${i})`)
        .style('pointer-events', 'none')
        .style('opacity', 0.8);
      
      // Bottom-right subtle highlight (secondary light reflection)
      g.append('circle')
        .attr('class', 'bubble-highlight-bottom')
        .attr('r', bubbleSize * 0.5)
        .attr('fill', `url(#league-bubble-highlight-bottom-${i})`)
        .style('pointer-events', 'none')
        .style('opacity', 0.6);
        
      // Small specular highlight for extra realism
      g.append('circle')
        .attr('class', 'bubble-highlight-spec')
        .attr('r', bubbleSize * 0.25)
        .attr('fill', `url(#league-bubble-highlight-spec-${i})`)
        .style('pointer-events', 'none')
        .style('opacity', 0.9);
      
      // Stroke layer (on top) for edge definition
      g.append('circle')
        .attr('class', 'bubble-stroke')
        .attr('r', bubbleSize)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.5)')
        .attr('stroke-width', 1.5);
    });
    
    // Add league name text
    leagueNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('fill', '#ffffff')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 5px rgba(0,0,0,0.7)')
      .text(d => d.name);
      
    // Add stat count text  
    leagueNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.4em')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 5px rgba(0,0,0,0.7)')
      .text(d => `${d.stats.length} stats`);
    
    // Position league bubbles evenly
    const spacing = Math.min(containerWidth / (leagueData.length + 1), 200); // Adjusted spacing calculation
    const startX = (containerWidth - (spacing * (leagueData.length - 1))) / 2;
    
    // Set up initial positions with WNBA closer to NBA
    leagueData.forEach((d, i) => {
      d.x = startX + (i * spacing);
      d.y = containerHeight / 2;
      // Add initial velocity to help prevent sticking
      d.vx = (Math.random() - 0.5) * 2;
      d.vy = (Math.random() - 0.5) * 2;
    });
    
    // Set up forces for more realistic physics with adjusted strengths
    leagueSimulationRef.current = d3.forceSimulation(leagueData)
      .force('charge', d3.forceManyBody().strength(-200)) // Increased repulsion
      .force('collide', d3.forceCollide().radius(bubbleSize + 5).strength(1).iterations(10))
      .force('x', d3.forceX().x(d => d.x).strength(0.5)) // Reduced x-positioning strength
      .force('y', d3.forceY().y(d => d.y).strength(0.5)) // Reduced y-positioning strength
      .velocityDecay(0.4) // Less damping
      .alphaDecay(0.02) // Slightly faster settling
      .alpha(0.8) // Higher initial energy
      .alphaTarget(0); // Let it settle completely
    
    // Update positions on tick
    leagueSimulationRef.current.on('tick', () => {
      leagueNodes.attr('transform', d => {
        // Keep bubbles within container bounds with bouncing effect
        if (d.x < bubbleSize) {
          d.x = bubbleSize;
          if (d.vx < 0) d.vx = -d.vx * 0.5; // Bounce with damping
        }
        if (d.x > containerWidth - bubbleSize) {
          d.x = containerWidth - bubbleSize;
          if (d.vx > 0) d.vx = -d.vx * 0.5; // Bounce with damping
        }
        if (d.y < bubbleSize) {
          d.y = bubbleSize;
          if (d.vy < 0) d.vy = -d.vy * 0.5; // Bounce with damping
        }
        if (d.y > containerHeight - bubbleSize) {
          d.y = containerHeight - bubbleSize;
          if (d.vy > 0) d.vy = -d.vy * 0.5; // Bounce with damping
        }
        
        return `translate(${d.x}, ${d.y})`;
      });
    });
  };
  
  // Initialize league bubbles with window resize handler
  useEffect(() => {
    const handleResize = () => {
      renderLeagueBubbles();
    };

    renderLeagueBubbles(); // Initial render
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (leagueSimulationRef.current) {
        leagueSimulationRef.current.stop();
      }
    };
  }, [leagueData]); // Add full leagueData dependency

  const handleLeagueSelect = (leagueName) => {
    // Show coming soon modal for NBA and NHL
    if (['NBA', 'NHL'].includes(leagueName)) {
      setComingSoonLeague(leagueName);
      setShowComingSoon(true);
      return;
    }
    
    // Find the league data and get its default stat
    const league = leagueData.find(l => l.name === leagueName);
    const defaultStat = league?.defaultStat || 'points';
    
    // Call the parent handlers with both league and stat
    if (onLeagueSelect) {
      onLeagueSelect(leagueName);
      // Small delay to ensure league is set before setting stat
      setTimeout(() => {
        onStatSelect(defaultStat);
      }, 0);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Background with bubbles */}
      <div 
        ref={chartRef} 
        className="absolute inset-0 overflow-hidden -z-10"
      />
      
      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        <div className="text-center w-full">
          <h1 className="text-4xl font-bold mb-4 text-shadow-lg">
            <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>Welcome to </span>
            <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>Stat </span>
            <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Bubbles</span>
          </h1>
          <p className={`text-xl mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} text-shadow-md`}>
            Select a league to view player statistics
          </p>
          
          {/* League bubbles container */}
          <div className="mb-6 h-[400px]" ref={leagueBubblesRef}></div>
          
          {/* League info tooltip - shown when hovering over a league bubble */}
          <div 
            className={`league-tooltip fixed left-1/2 transform -translate-x-1/2 max-w-md transition-all duration-300 ease-in-out ${hoveredLeague ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            style={{
              top: hoveredLeague ? '65%' : '63%',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              border: isDark ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
              zIndex: 50,
            }}
            onMouseEnter={() => {
              if (hoveredLeague) {
                // Keep the same state to prevent re-renders
              }
            }}
            onMouseLeave={() => {
              setHoveredLeague(null);
            }}
          >
            {hoveredLeague && (
              <>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {hoveredLeague.name}
                </h3>
                <p className={`text-sm my-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {hoveredLeague.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {hoveredLeague.stats.map((stat, index) => (
                    <span 
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-700/80'} text-shadow-sm mt-4`}>
            Click on a league bubble to explore player statistics
          </p>
        </div>
      </div>

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

export default HomePage; 