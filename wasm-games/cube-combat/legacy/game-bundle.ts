// Cube Combat Game Bundle
// This script loads the game engine and initializes the game

(function (): void {
  // Create a script element to load the game engine
  const script = document.createElement('script');
  script.src = '/games/cube-combat/engine.js';
  script.type = 'text/javascript';
  script.async = false;
  script.onload = (): void => {
    console.log('Cube Combat game engine loaded');
  };
  script.onerror = (): void => {
    console.error('Failed to load Cube Combat game engine');
  };

  // Append to head to ensure it loads after the DOM is ready
  document.head.appendChild(script);
})();

