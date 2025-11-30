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
    const containerHeight = window.innerHeight * 0.85; // Use 85% of viewport height
    
    const svg = d3
      .select(leagueBubblesRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background', 'transparent');
      
    const defs = svg.append('defs');
    
    // EXACT copy from bubbleVisualization.js lines 400-422
    leagueData.forEach((league, i) => {
      const gradientId = `league-bubble-gradient-${i}`;
      const baseColor = league.color;
      
      const gradient = defs.append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '35%')
        .attr('cy', '35%')
        .attr('r', '60%')
        .attr('fx', '35%')
        .attr('fy', '35%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.95)');
      
      gradient.append('stop')
        .attr('offset', '40%')
        .attr('stop-color', `${baseColor}cc`);
      
      gradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', `${baseColor}ee`);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', `${baseColor}`);
      
      // Filter EXACTLY matching stat bubbles from bubbleVisualization.js
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
      
      filter.append('feComposite')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'SourceAlpha')
        .attr('operator', 'in')
        .attr('result', 'composite1');
      
      filter.append('feGaussianBlur')
        .attr('in', 'composite1')
        .attr('stdDeviation', '1')
        .attr('result', 'blur');
      
      filter.append('feDropShadow')
        .attr('dx', '0')
        .attr('dy', '4')
        .attr('stdDeviation', '4')
        .attr('flood-color', '#000000')
        .attr('flood-opacity', '0.3')
        .attr('result', 'dropShadow');
        
      filter.append('feComposite')
        .attr('in', 'blur')
        .attr('in2', 'dropShadow')
        .attr('operator', 'over')
        .attr('result', 'finalImage');
    });
    
    // Fixed bubble size for leagues - larger for better visibility
    const bubbleSize = 90; // Larger bubbles for better presence
    
    // Drag behavior for bubbles
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) leagueSimulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.parentNode).style('cursor', 'grabbing');
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) leagueSimulationRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(event.sourceEvent.target.parentNode).style('cursor', 'grab');
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
        // Hover effect EXACTLY like stat bubbles
        const bubble = d3.select(this).select('.bubble-main');
        
        bubble
          .attr('stroke', 'rgba(255, 255, 255, 0.8)')
          .attr('stroke-width', 2)
          .style('opacity', '1')
          .transition()
          .duration(300)
          .attr('r', bubbleSize * 1.05);
          
        // Bring this bubble to front
        this.parentNode.appendChild(this);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('.bubble-main')
          .attr('stroke', 'rgba(255, 255, 255, 0.5)')
          .attr('stroke-width', 1.5)
          .style('opacity', '1')
          .transition()
          .duration(300)
          .attr('r', bubbleSize);
      });
    
    // Add bubble circles - EXACTLY like stat bubbles with dark background for text
    leagueNodes.each(function(d, i) {
      const g = d3.select(this);
      
      // Main bubble fill - matching stat bubbles exactly
      g.append('circle')
        .attr('class', 'bubble-main')
        .attr('r', bubbleSize)
        .attr('fill', `url(#league-bubble-gradient-${i})`)
        .attr('stroke', 'rgba(255, 255, 255, 0.5)')
        .attr('stroke-width', 1.5)
        .style('filter', `url(#league-bubble-filter-${i})`)
        .style('cursor', 'pointer')
        .style('opacity', '1');
      
      // Dark background circle for text - EXACTLY like stat bubbles (line 559-562)
      g.append('circle')
        .attr('class', 'text-background')
        .attr('r', bubbleSize * 0.7)
        .attr('fill', 'rgba(0, 0, 0, 0.3)')
        .style('pointer-events', 'none');
    });
    
    // Add league name text only
    leagueNodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('fill', '#ffffff')
      .style('font-size', '20px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
      .text(d => d.name);
    
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
    
    // Set up forces for continuous, dynamic floating motion
    leagueSimulationRef.current = d3.forceSimulation(leagueData)
      .force('charge', d3.forceManyBody().strength(-500)) // Stronger repulsion for more movement
      .force('collide', d3.forceCollide().radius(bubbleSize + 15).strength(1).iterations(2))
      .force('x', d3.forceX(containerWidth / 2).strength(0.02)) // Very weak center force
      .force('y', d3.forceY(containerHeight / 2).strength(0.02)) // Very weak center force
      .velocityDecay(0.1) // Much less friction for continuous movement
      .alphaDecay(0.0005) // Almost no decay to maintain energy
      .alpha(1) // Start with full energy
      .alphaTarget(0.5); // Higher target to keep it very active
    
    // Add continuous random velocity kicks to keep bubbles moving dynamically
    let tickCount = 0;
    leagueSimulationRef.current.on('tick', () => {
      // Add random velocity MORE frequently for constant motion
      tickCount++;
      if (tickCount % 50 === 0) { // Every 50 ticks instead of 100
        leagueData.forEach(d => {
          // Larger random kicks for more dramatic movement
          d.vx += (Math.random() - 0.5) * 3;
          d.vy += (Math.random() - 0.5) * 3;
        });
      }
      
      // Add gentle swirling motion
      if (tickCount % 20 === 0) {
        leagueData.forEach((d, i) => {
          const angle = (Date.now() / 5000) + (i * Math.PI / 3); // Rotating angle
          d.vx += Math.cos(angle) * 0.5;
          d.vy += Math.sin(angle) * 0.5;
        });
      }
      
      leagueNodes.attr('transform', d => {
        // Keep bubbles within container bounds with energetic bouncing
        const bounceDamping = 0.8; // Higher value = more bouncy
        
        if (d.x < bubbleSize) {
          d.x = bubbleSize;
          if (d.vx < 0) d.vx = -d.vx * bounceDamping;
        }
        if (d.x > containerWidth - bubbleSize) {
          d.x = containerWidth - bubbleSize;
          if (d.vx > 0) d.vx = -d.vx * bounceDamping;
        }
        if (d.y < bubbleSize) {
          d.y = bubbleSize;
          if (d.vy < 0) d.vy = -d.vy * bounceDamping;
        }
        if (d.y > containerHeight - bubbleSize) {
          d.y = containerHeight - bubbleSize;
          if (d.vy > 0) d.vy = -d.vy * bounceDamping;
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
          {/* League bubbles container */}
          <div className="h-full" ref={leagueBubblesRef}></div>
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