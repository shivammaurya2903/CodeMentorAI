document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navContainer = document.querySelector('.nav-container');

  if (!hamburger || !navMenu) {
    return;
  }

  const setMenuState = (isOpen) => {
    navMenu.classList.toggle('active', isOpen);
    hamburger.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  const closeMenu = () => {
    setMenuState(false);
  };

  hamburger.addEventListener('click', () => {
    const isOpen = !navMenu.classList.contains('active');
    setMenuState(isOpen);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.classList.contains('active')) {
      return;
    }

    if (navContainer && !navContainer.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });

  setMenuState(false);
});
