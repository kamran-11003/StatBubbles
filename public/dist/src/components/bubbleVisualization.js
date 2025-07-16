import * as d3 from 'd3';
export const createBubbleVisualization = ({
  chartRef,
  players,
  selectedStat,
  isDark,
  simulationRef,
  setSelectedPlayer
}) => {
  if (!players.length || !selectedStat) return;
  d3.select(chartRef.current).selectAll('*').remove();

  if (simulationRef.current) {
    simulationRef.current.stop();
  }

  const width = chartRef.current.clientWidth;
  const height = chartRef.current.clientHeight - 25;
  
  const isMobile = width < 768;
  
  const getStatValue = (item, statKey) => {
    // Check if this is a team or player
    const isTeam = item.displayName && item.abbreviation;
    
    if (isTeam) {
      // For teams, stats are directly on the object
      const value = item[statKey];
      // Handle different data types and ensure we return a valid number
      if (typeof value === 'number') {
        return value;
      } else if (typeof value === 'string') {
        // Handle string values like "28-13" for records
        if (value.includes('-')) {
          const parts = value.split('-');
          if (parts.length === 2) {
            const wins = parseInt(parts[0]);
            const losses = parseInt(parts[1]);
            if (!isNaN(wins) && !isNaN(losses)) {
              // For ranking purposes, use wins (first number) instead of total games
              // This allows proper ranking by wins for records like "10-10"
              return wins;
            }
          }
        }
        // Try to parse as number
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    } else {
      // For players, check both direct properties and nested stats object
      let value = item[statKey]; // Check direct property first (for NFL players)
      if (value === undefined || value === null) {
        value = item.stats?.[statKey]; // Check nested stats object (for NBA/WNBA/MLB players)
      }
      
      if (typeof value === 'number') {
        return value;
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
  };

  const displayedPlayers = players;
  const values = players.map(p => getStatValue(p, selectedStat)).filter(v => !isNaN(v) && v !== null && v !== undefined);
  
  // Ensure we have valid values
  if (values.length === 0) {
    console.warn('No valid stat values found for:', selectedStat);
    return;
  }
  
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Ensure min and max are valid numbers
  if (isNaN(minVal) || isNaN(maxVal)) {
    console.warn('Invalid stat range:', { minVal, maxVal, selectedStat });
    return;
  }
  
  // Handle case where all values are the same
  let adjustedMinVal = minVal;
  let adjustedMaxVal = maxVal;
  if (minVal === maxVal) {
    // Create a small range to allow visualization
    if (minVal === 0) {
      // If all values are 0, create a small positive range
      adjustedMinVal = 0;
      adjustedMaxVal = 1;
    } else {
      // Create a range around the value
      adjustedMinVal = minVal * 0.95;
      adjustedMaxVal = maxVal * 1.05;
      // Ensure we don't go below 0 for positive values
      if (minVal >= 0) {
        adjustedMinVal = Math.max(0, adjustedMinVal);
      }
    }
    console.warn('All values are the same, creating range:', { 
      original: minVal, 
      adjusted: [adjustedMinVal, adjustedMaxVal], 
      selectedStat 
    });
  }
  
  const playerCount = players.length;
  const availableArea = width * height;
  
  const targetCoverage = isMobile
    ? (playerCount <= 10 ? 0.5 :
       playerCount <= 30 ? 0.4 :
       playerCount <= 100 ? 0.3 : 0.2)
    : (playerCount <= 10 ? 0.6 :
       playerCount <= 30 ? 0.5 :
       playerCount <= 100 ? 0.4 : 0.3);
  
  const idealArea = (availableArea * targetCoverage) / playerCount;
  const idealRadius = Math.sqrt(idealArea / Math.PI);
  const maxAllowedSize = Math.min(width, height) * (isMobile ? 0.15 : 0.25);
  
  let minSize, maxSize;
  if (isMobile) {
    if (playerCount <= 10) {
      minSize = Math.min(Math.max(30, idealRadius * 0.4), maxAllowedSize * 0.6);
      maxSize = Math.min(Math.max(100, idealRadius * 0.8), maxAllowedSize);
    } else if (playerCount <= 50) {
      minSize = Math.min(Math.max(25, idealRadius * 0.35), maxAllowedSize * 0.4);
      maxSize = Math.min(Math.max(80, idealRadius * 0.65), maxAllowedSize * 0.8);
    } else if (playerCount <= 100) {
      minSize = Math.min(Math.max(20, idealRadius * 0.25), maxAllowedSize * 0.3);
      maxSize = Math.min(Math.max(60, idealRadius * 0.5), maxAllowedSize * 0.6);
    } else {
      minSize = Math.min(Math.max(15, idealRadius * 0.2), maxAllowedSize * 0.2);
      maxSize = Math.min(Math.max(40, idealRadius * 0.4), maxAllowedSize * 0.4);
    }
  } else {
    if (playerCount <= 10) {
      minSize = Math.min(Math.max(60, idealRadius * 0.6), maxAllowedSize * 0.6);
      maxSize = Math.min(Math.max(200, idealRadius * 1.2), maxAllowedSize);
    } else if (playerCount <= 30) {
      minSize = Math.min(Math.max(45, idealRadius * 0.5), maxAllowedSize * 0.4);
      maxSize = Math.min(Math.max(160, idealRadius), maxAllowedSize * 0.8);
    } else if (playerCount <= 100) {
      minSize = Math.min(Math.max(35, idealRadius * 0.4), maxAllowedSize * 0.3);
      maxSize = Math.min(Math.max(120, idealRadius * 0.8), maxAllowedSize * 0.6);
    } else {
      minSize = Math.min(Math.max(30, idealRadius * 0.3), maxAllowedSize * 0.2);
      maxSize = Math.min(Math.max(80, idealRadius * 0.6), maxAllowedSize * 0.4);
    }
  }
  
  // Create a safe size scale function that handles edge cases
  const getBubbleSize = (value) => {
    try {
      const statValue = getStatValue(value, selectedStat);
      if (isNaN(statValue) || statValue === null || statValue === undefined) {
        return minSize; // Return minimum size for invalid values
      }
      
      // If all values are the same, return a size in the middle of the range
      if (adjustedMinVal === adjustedMaxVal) {
        return (minSize + maxSize) / 2;
      }
      
      const sizeScale = d3.scalePow()
        .exponent(0.7)
        .domain([adjustedMinVal, adjustedMaxVal])
        .range([minSize, maxSize])
        .clamp(true);
      
      return sizeScale(statValue);
    } catch (error) {
      console.error('Error calculating bubble size:', error, { value, selectedStat });
      return minSize; // Return minimum size on error
    }
  };

  const getColor = (player) => {
    // Check if this is a team or player
    const isTeam = player.displayName && player.abbreviation;
    
    if (isTeam) {
      // Handle team colors
      if (player.color) {
        return player.color.startsWith('#') ? player.color : `#${player.color}`;
      }
      return '#3b82f6'; // Default fallback
    } else {
      // Handle player team colors
      if (player.teamColor) {
        // Add # prefix if it's missing
        return player.teamColor.startsWith('#') ? player.teamColor : `#${player.teamColor}`;
      }
      return '#3b82f6'; // Default fallback
    }
  };
  
  const getGlowColor = (player) => {
    // Check if this is a team or player
    const isTeam = player.displayName && player.abbreviation;
    
    if (isTeam) {
      // Handle team colors
      if (player.color) {
        return player.color.startsWith('#') ? player.color : `#${player.color}`;
      }
      return '#3b82f6'; // Default fallback
    } else {
      // Handle player team colors
      if (player.teamColor) {
        // Add # prefix if it's missing
        return player.teamColor.startsWith('#') ? player.teamColor : `#${player.teamColor}`;
      }
      return '#3b82f6'; // Default fallback
    }
  };

  const svg = d3.select(chartRef.current)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', isDark ? '#111827' : '#f0ece3');
    
  const defs = svg.append('defs');
  const bgGradientId = 'background-gradient';
  const bgGradient = defs.append('linearGradient')
    .attr('id', bgGradientId)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '100%');
    
  bgGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', isDark ? '#111827' : '#f0ece3');
    
  bgGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', isDark ? '#111827' : '#e8e2d6');
    
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', `url(#${bgGradientId})`)
    .attr('opacity', 0.6)
    .attr('rx', 20)
    .attr('ry', 20);

  const bringToFront = (element) => element.raise();

  const drag = d3.drag()
    .on('start', (event, d) => {
      const element = d3.select(event.sourceEvent.target.parentNode);
      bringToFront(element);
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  const chargeStrength = isMobile
    ? (playerCount <= 10 ? -400 : 
       playerCount <= 50 ? -200 : 
       Math.min(-100, -150 / Math.sqrt(playerCount)))
    : (playerCount <= 10 ? -800 : 
       playerCount <= 50 ? -400 : 
       Math.min(-200, -300 / Math.sqrt(playerCount)));

  const collisionStrength = isMobile
    ? (playerCount <= 10 ? 0.8 : 
       playerCount <= 50 ? 0.85 : 
       0.95)
    : (playerCount <= 10 ? 0.7 : 
       playerCount <= 50 ? 0.8 : 
       0.9);

  const maxBubbleSize = maxSize;
  const effectiveWidth = width - (maxBubbleSize * 2);
  const effectiveHeight = height - (maxBubbleSize * 2);
  
  const gridSize = Math.ceil(Math.sqrt(playerCount));
  const cellWidth = effectiveWidth / gridSize;
  const cellHeight = effectiveHeight / gridSize;
  
  displayedPlayers.forEach((player, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    player.x = maxBubbleSize + col * cellWidth + (Math.random() * 20 - 10);
    player.y = maxBubbleSize + row * cellHeight + (Math.random() * 20 - 10);
  });
  
  let tickCounter = 0;
  function ticked() {
    tickCounter++;
    if (tickCounter % 2 !== 0) return;

    node.attr('transform', d => {
      const bubbleRadius = getBubbleSize(d);
      const padding = playerCount > 50 ? 2 : 5; // Smaller padding for larger datasets
      
      // Enhanced boundary containment with stricter bottom boundary
      if (d.y > height - bubbleRadius - padding) {
        d.y = height - bubbleRadius - padding;
        d.vy = Math.min(0, (d.vy || 0) * -0.9); // Stronger bounce with more damping
        // Add extra downward force to keep bubbles from sticking to bottom
        d.vy -= 0.1;
      }
      if (d.y < bubbleRadius + padding) {
        d.y = bubbleRadius + padding;
        d.vy = Math.max(0, (d.vy || 0) * -0.8); // Stronger bounce with more damping
      }
      if (d.x > width - bubbleRadius - padding) {
        d.x = width - bubbleRadius - padding;
        d.vx = Math.min(0, (d.vx || 0) * -0.8); // Stronger bounce with more damping
      }
      if (d.x < bubbleRadius + padding) {
        d.x = bubbleRadius + padding;
        d.vx = Math.max(0, (d.vx || 0) * -0.8); // Stronger bounce with more damping
      }

      // Add velocity damping to prevent excessive bouncing
      d.vx *= 0.95;
      d.vy *= 0.95;

      // Add a slight upward force near the bottom to prevent sticking
      if (d.y > height - bubbleRadius * 2) {
        d.vy -= 0.05;
      }

      return `translate(${Math.round(d.x)},${Math.round(d.y)})`;
    });
  }

  simulationRef.current = d3.forceSimulation(displayedPlayers)
    .force('charge', d3.forceManyBody().strength(chargeStrength).distanceMax(200))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(playerCount > 50 ? 0.05 : 0.02))
    .force('collision', d3.forceCollide()
      .radius(d => getBubbleSize(d))
      .strength(collisionStrength)
      .iterations(playerCount > 50 ? 4 : 2))
    .force('x', d3.forceX().x(d => {
      const bubbleRadius = getBubbleSize(d);
      const spreadFactor = playerCount <= 10 ? 0.8 : 
                          playerCount <= 50 ? 0.85 : 0.9;
      const xRange = (width - bubbleRadius * 2) * spreadFactor;
      return (width - xRange) / 2 + Math.random() * xRange;
    }).strength(playerCount > 50 ? 0.15 : 0.1))
    .force('y', d3.forceY().y(d => {
      const bubbleRadius = getBubbleSize(d);
      const spreadFactor = playerCount <= 10 ? 0.8 : 
                          playerCount <= 50 ? 0.85 : 0.9;
      const yRange = (height - bubbleRadius * 2) * spreadFactor;
      return Math.min((height - yRange) / 2 + Math.random() * yRange, height - bubbleRadius);
    }).strength(playerCount > 50 ? 0.25 : 0.2))
    .alphaDecay(playerCount > 50 ? 0.008 : 0.01)
    .velocityDecay(playerCount > 50 ? 0.45 : 0.4)
    .alpha(0.5)
    .on('tick', ticked);

  const node = svg.selectAll('g')
    .data(displayedPlayers)
    .enter()
    .append('g')
    .call(drag)
    .on('click', (event, d) => {
      if (!event.defaultPrevented) {
        setSelectedPlayer(d);
      }
    });

  const tooltip = d3.select(chartRef.current)
    .append('div')
    .attr('class', `absolute hidden ${isDark ? 'bg-gray-700/70' : 'bg-gray-200/70'} p-2 rounded-lg shadow-lg z-10 pointer-events-none border ${isDark ? 'border-gray-600/40' : 'border-gray-300/40'} backdrop-blur-md`)
    .style('max-width', '200px')
    .style('backdrop-filter', 'blur(8px)')
    .style('-webkit-backdrop-filter', 'blur(8px)')
    .style('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)')
    .style('border', '1px solid rgba(255, 255, 255, 0.1)')
    .style('background', isDark 
      ? 'linear-gradient(to bottom right, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.85))' 
      : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.85))');

  displayedPlayers.forEach((player, i) => {
    const gradientId = `bubble-gradient-${i}`;
    const baseColor = getColor(player);
    
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
    
    const filterId = `bubble-filter-${i}`;
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
  
  displayedPlayers.forEach((player, i) => {
    const clipId = `bubble-clip-${i}`;
    defs.append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('r', getBubbleSize(player));
      
    const maskId = `bubble-mask-${i}`;
    defs.append('mask')
      .attr('id', maskId)
      .append('circle')
      .attr('r', getBubbleSize(player))
      .attr('fill', 'white');
  });
  
  node.append('circle')
    .attr('r', d => getBubbleSize(d))
    .attr('fill', (d, i) => `url(#bubble-gradient-${i})`)
    .attr('stroke', 'rgba(255, 255, 255, 0.5)')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .style('filter', (d, i) => `url(#bubble-filter-${i})`)
    .style('opacity', '1')
    .attr('clip-path', (d, i) => `url(#bubble-clip-${i})`)
    .attr('mask', (d, i) => `url(#bubble-mask-${i})`)
    .on('mouseover', function(event, d) {
      const element = d3.select(this.parentNode);
      bringToFront(element);
      
      d3.select(this)
        .attr('stroke', 'rgba(255, 255, 255, 0.8)')
        .attr('stroke-width', 2)
        .style('filter', (d, i) => `url(#bubble-filter-${i})`)
        .style('opacity', '1')
        .transition()
        .duration(300)
        .attr('r', d => getBubbleSize(d) * 1.05);
      
      const nameParts = getPlayerName(d).split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Check if this is a team and if the stat is a record format
      const isTeam = d.displayName && d.abbreviation;
      const isRecordStat = ['homeRecord', 'awayRecord', 'conferenceRecord', 'lastTenGames', 'wins', 'losses'].includes(selectedStat);
      let recordValue = isTeam && isRecordStat ? d[selectedStat] : null;
      // Special formatting for wins and losses
      if (isTeam && selectedStat === 'wins' && d.wins !== undefined && d.losses !== undefined) {
        recordValue = `${d.wins}-${d.losses}`;
      } else if (isTeam && selectedStat === 'losses' && d.wins !== undefined && d.losses !== undefined) {
        recordValue = `${d.losses}-${d.wins}`;
      }
      
      let tooltipContent = `
        <div class="${isDark ? 'text-gray-100' : 'text-gray-800'}">
          <div class="font-bold mb-1">
            <div>${firstName}</div>
            ${lastName ? `<div>${lastName}</div>` : ''}
          </div>
          <div class="text-sm">
            <div class="flex justify-between">
              <span class="${isDark ? 'text-gray-300' : 'text-gray-600'}">${selectedStat}:</span>
              <span>${recordValue && typeof recordValue === 'string' && recordValue.includes('-') 
                ? recordValue 
                : selectedStat.toLowerCase() === 'points' 
                  ? Number(getStatValue(d, selectedStat)).toFixed(1)
                  : Number(getStatValue(d, selectedStat)).toFixed(2)}${!recordValue && (selectedStat.toLowerCase().includes('percentage') || selectedStat.toLowerCase().includes('percent')) ? '%' : ''}</span>
            </div>
          </div>
        </div>
      `;
      
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .html(tooltipContent)
        .classed('hidden', false);
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .attr('stroke', 'rgba(255, 255, 255, 0.5)')
        .attr('stroke-width', 1.5)
        .style('filter', (d, i) => `url(#bubble-filter-${i})`)
        .style('opacity', '1')
        .transition()
        .duration(300)
        .attr('r', d => getBubbleSize(d));
      
      tooltip.classed('hidden', true);
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    });

  const texts = node.append('g').attr('class', 'texts');

  texts.append('circle')
    .attr('r', d => getBubbleSize(d) * 0.7)
    .attr('fill', 'rgba(0, 0, 0, 0.3)')
    .style('pointer-events', 'none');

  const truncateText = (text, radius) => {
    const maxChars = Math.max(4, Math.floor(radius / 4));
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 2) + '..';
  };

  const formatPlayerName = (player, radius) => {
    // Check if this is a team or player
    const isTeam = player.displayName && player.abbreviation;
    
    if (isTeam) {
      // Handle team names
      const teamName = player.displayName || player.name || player.shortDisplayName || 'Unknown Team';
      const words = teamName.split(' ');
      if (words.length <= 1) return [teamName];
      
      const maxCharsPerLine = Math.max(4, Math.floor(radius / (isMobile ? 5 : 4)));
      
      if (words.length === 2) {
        const firstWord = words[0];
        const secondWord = words[1];
        const truncatedFirst = firstWord.length > maxCharsPerLine 
          ? firstWord.substring(0, maxCharsPerLine - 2) + '..' 
          : firstWord;
        const truncatedSecond = secondWord.length > maxCharsPerLine 
          ? secondWord.substring(0, maxCharsPerLine - 2) + '..' 
          : secondWord;
        return [truncatedFirst, truncatedSecond];
      } else {
        const truncatedName = teamName.length > maxCharsPerLine 
          ? teamName.substring(0, maxCharsPerLine - 2) + '..' 
          : teamName;
        return [truncatedName];
      }
    } else {
      // Handle player names (existing logic)
      const name = player.fullName || player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim();
      if (!name) return ['Unknown'];
      
      const words = name.split(' ');
      if (words.length <= 1) return [name];
      
      const firstName = words[0];
      const lastName = words.slice(1).join(' ');
      const maxCharsPerLine = Math.max(4, Math.floor(radius / (isMobile ? 5 : 4)));
      
      const truncatedFirstName = firstName.length > maxCharsPerLine 
        ? firstName.substring(0, maxCharsPerLine - 2) + '..' 
        : firstName;
        
      const truncatedLastName = lastName.length > maxCharsPerLine 
        ? lastName.substring(0, maxCharsPerLine - 2) + '..' 
        : lastName;
      
      return [truncatedFirstName, truncatedLastName];
    }
  };

  const getPlayerName = (player) => {
    // Check if this is a team or player
    const isTeam = player.displayName && player.abbreviation;
    
    if (isTeam) {
      return player.displayName || player.name || player.shortDisplayName || 'Unknown Team';
    } else {
      return player.fullName || player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown';
    }
  };

  const getTextSize = (radius, isName = true) => {
    if (isMobile) {
      if (isName) {
        return playerCount <= 10
          ? Math.max(8, Math.min(14, radius / 6))
          : Math.max(7, Math.min(12, radius / 6.5));
      } else {
        return playerCount <= 10
          ? Math.max(10, Math.min(16, radius / 5))
          : Math.max(8, Math.min(14, radius / 5.5));
      }
    } else {
      if (isName) {
        return playerCount <= 10
          ? Math.max(16, Math.min(28, radius / 4))
          : Math.max(12, Math.min(20, radius / 4.5));
      } else {
        return playerCount <= 10
          ? Math.max(20, Math.min(36, radius / 3))
          : Math.max(14, Math.min(28, radius / 3.5));
      }
    }
  };

  texts.append('g')
    .attr('class', 'player-name')
    .each(function(d) {
      const radius = getBubbleSize(d);
      const fontSize = getTextSize(radius, true);
      
      const nameLines = formatPlayerName(d, radius * (isMobile ? 1.2 : 1.4));
      const g = d3.select(this);
      
      const nameYOffset = nameLines.length > 1 ? '-0.8em' : '-0.3em';
      
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', nameYOffset)
        .style('fill', '#ffffff')
        .style('font-size', `${fontSize}px`)
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
        .text(nameLines[0]);
      
      if (nameLines.length > 1) {
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.7em')
          .style('fill', '#ffffff')
          .style('font-size', `${fontSize}px`)
          .style('font-weight', 'bold')
          .style('pointer-events', 'none')
          .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
          .text(nameLines[1]);
      }
    });

  texts.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', d => {
      const nameLines = getPlayerName(d).split(' ').length;
      return nameLines > 1 ? '2.2em' : '1.4em';
    })
    .style('fill', '#ffffff')
    .style('pointer-events', 'none')
    .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
    .each(function(d) {
      const radius = getBubbleSize(d);
      const fontSize = getTextSize(radius, false);
      
      // Check if this is a team and if the stat is a record format
      const isTeam = d.displayName && d.abbreviation;
      const isRecordStat = ['homeRecord', 'awayRecord', 'conferenceRecord', 'lastTenGames', 'wins', 'losses'].includes(selectedStat);
      let recordValue = isTeam && isRecordStat ? d[selectedStat] : null;
      // Special formatting for wins and losses
      if (isTeam && selectedStat === 'wins' && d.wins !== undefined && d.losses !== undefined) {
        recordValue = `${d.wins}-${d.losses}`;
      } else if (isTeam && selectedStat === 'losses' && d.wins !== undefined && d.losses !== undefined) {
        recordValue = `${d.losses}-${d.wins}`;
      }
      
      let statValue;
      if (recordValue && typeof recordValue === 'string' && recordValue.includes('-')) {
        // For record stats, show the full record (e.g., "10-10")
        statValue = recordValue;
      } else if (isTeam && selectedStat === 'lastTenGames' && d.lastTenGames) {
        // Special handling for lastTenGames to ensure it displays as a record
        statValue = d.lastTenGames;
      } else {
        // MLB formatting: whole numbers and percentages
        if (d.league === 'MLB' && typeof getStatValue(d, selectedStat) === 'number') {
          const val = getStatValue(d, selectedStat);
          if (selectedStat.toLowerCase().includes('pct') || selectedStat.toLowerCase().includes('percentage')) {
            statValue = `${(val * 100).toFixed(0)}%`;
          } else if (
            selectedStat.toLowerCase().includes('avg') ||
            selectedStat.toLowerCase().includes('era') ||
            selectedStat.toLowerCase().includes('whip') ||
            selectedStat.toLowerCase().includes('ops')
          ) {
            statValue = val.toFixed(3);
          } else {
            statValue = Math.round(val);
          }
        } else if (d.league === 'WNBA' && typeof getStatValue(d, selectedStat) === 'number') {
          const val = getStatValue(d, selectedStat);
          if (selectedStat.toLowerCase().includes('pct') || selectedStat.toLowerCase().includes('percentage')) {
            statValue = `${val.toFixed(2)}%`;
          } else {
            statValue = val.toFixed(2);
          }
        } else {
          statValue = `${selectedStat.toLowerCase() === 'points' 
            ? Number(getStatValue(d, selectedStat)).toFixed(1)
            : Number(getStatValue(d, selectedStat)).toFixed(2)}${selectedStat.toLowerCase().includes('percentage') || selectedStat.toLowerCase().includes('percent') ? '%' : ''}`;
        }
      }
      
      d3.select(this)
        .style('font-size', `${fontSize}px`)
        .style('font-weight', 'bold')
        .text(statValue);
    });
};