# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-03-21

### Performance Optimizations
- **Bubble Animation Performance**
  - Reduced initial animation lag by optimizing force simulation parameters
  - Implemented frame skipping (updates every other frame) for smoother performance
  - Added distance cutoff (200px) to limit long-range force calculations
  - Reduced collision detection iterations from 4 to 2
  - Implemented position rounding for better rendering performance

### Changed
- **Force Simulation Parameters**
  - Reduced charge strength from -1000 to -800 for better performance
  - Adjusted force strengths for smoother movement (0.04 instead of 0.05)
  - Increased alphaDecay from 0.01 to 0.02 for faster stabilization
  - Increased velocityDecay from 0.3 to 0.35
  - Reduced initial alpha value from 0.7 to 0.5 for smoother start

### Added
- **Grid-based Initial Layout**
  - Implemented efficient grid-based initial positioning
  - Pre-calculated cell sizes based on available space
  - Added small random offset to prevent exact grid alignment

### Technical Improvements
- **Memory Optimization**
  - Reduced DOM updates frequency with frame counter
  - Implemented more efficient position calculations
  - Added distance cutoff for force calculations
  - Optimized bubble size calculations based on player count

## [1.0.0] - 2024-03-20

### Added
- Initial release of the PlayerList component
- D3.js force simulation for bubble layout
- Interactive player bubbles with tooltips
- Dynamic sizing based on player statistics
- Dark/Light mode support
- Responsive design
- Player detail modal
- League-specific stat display 