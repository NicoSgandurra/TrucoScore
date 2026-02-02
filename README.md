# Truco Score App

A minimalist, mobile-first web application for scoring Truco matches.

## Features
- **Split Screen Layout**: Designed for mobile playing.
- **Customizable**: Edit team names by tapping them.
- **Game Modes**: Support for 15 and 30 point matches.
- **Smart Scoring**: 
  - Tap to add points.
  - Long-press to subtract (Continuous undo supported).
  - Visualization using traditional "dice-5" dot patterns.
  - "Malas" and "Buenas" indicators for 30-point games.
- **Feedback**: 
  - Pop animations.
  - Haptic feedback (Vibration).
  - Subtle audio cues ("Tac" sound).
- **Persistence**: Auto-saves game state to local storage.

## Project Structure
- `index.html`: Main HTML structure (Tailwind CSS via CDN).
- `style.css`: Custom styles, animations, and grid layouts.
- `main.js`: Game logic, state management, audio/haptics, and interaction handlers.

## Setup
No build step required. Simply open `index.html` in a modern web browser.
For development, you can serve the directory using a local server (e.g., `npx serve .` or Live Server VS Code extension).

## Usage
1. **Start**: Select 15 or 30 points.
2. **Score**: Tap the team color to add point.
3. **Undo**: Hold down on the team color.
4. **Edit Names**: Tap the "NOSOTROS" or "ELLOS" text.
5. **Reset**: Use the "Reiniciar" button at the bottom.

## Technologies
- **HTML5**
- **Tailwind CSS** (CDN)
- **Vanilla JavaScript** (ES6+)
- **LocalStorage API**
- **Vibration API**
- **Web Audio API**
