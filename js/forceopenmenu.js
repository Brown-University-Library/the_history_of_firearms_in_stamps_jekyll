window.onload = () => {
  const mediumScreen = window.matchMedia('(min-width: 1000px)');
  const mainNav = document.querySelector('header > nav');
  const hamburgerMenu = document.querySelector('header > nav > details');

  // Determines whether to load the hamburger menu
  // Or to force it open and horizontal for desktop.
  function loadMenu() {
    if (mediumScreen.matches) {
      // desktop: force open hamburger
      hamburgerMenu.open = true;
      hamburgerMenu.classList.add('forcedopen');
    } else {
      // mobile: force close hamburger
      hamburgerMenu.open = false;
      hamburgerMenu.classList.remove('forcedopen');
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Enhancing accessibility with Esc key
  window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (!mediumScreen.matches) {
        // mobile: dealing with hamburger too
        hamburgerMenu.open = false;
      }
    }
  });

  const debouncedResize = debounce(loadMenu, 100);
  window.addEventListener('resize', debouncedResize);
  loadMenu();
}
