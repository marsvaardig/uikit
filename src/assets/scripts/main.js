(() => {
  
  // Chrome elements
  const $ui = document.querySelector('[data-uikit]');
  const $navigationWrapper = document.querySelector('[data-navigation-wrapper]');
  const $trees = document.querySelectorAll("[data-tree-uid]");
  const $splitSwitch = document.querySelector('[data-table-switch]');
  const $main = document.querySelector('[data-main]');
  const $toggleSplits = document.querySelectorAll('[data-toggle-split]');
  const $tables = document.querySelectorAll('[data-table]');
  const $toggles = document.querySelectorAll('[data-filter-toggle]');
  const $sidebarToggles = document.querySelectorAll('[data-sidebar-toggle]');
  const $sidebarTypeToggles = document.querySelectorAll('[data-sidebar-type-toggle]')
  const $searchToggle = document.querySelector('[data-toggle-search]');
  const $profileToggle = document.querySelector('[data-toggle-profile]');
  const $tabList = document.querySelectorAll('[data-tabs]');
  
  // Chrome localstorage settings
  function getChromeState() {
    const saved = localStorage.getItem('uikit-chrome');
    return saved ? JSON.parse(saved) : {};
  }
  
  function setChromeState(newState) {
    localStorage.setItem('uikit-chrome', JSON.stringify(newState));
  }
  
  function removeFromChromeState(type, key) {
    const state = getChromeState();
    
    if (state[type] && typeof state[type] === 'object') {
      delete state[type][key];
      setChromeState(state);
    }
  }
  
  function isMobile() {
    return window.getComputedStyle($ui).getPropertyValue('--ui-mobile') === '1';
  }
  
  function setWidth(newWidth, type) {
    document.body.style.setProperty(`--ui-sidebar-${type}-width`, `${newWidth}px`);
  }
  
  function resetWidth(type) {
    document.body.style.removeProperty(`--ui-sidebar-${type}-width`);
  }
  
  function setHeight(newHeight, type) {
    document.body.style.setProperty(`--ui-sidebar-${type}-height`, `${newHeight}px`);
  }
  
  function resetHeight(type) {
    document.body.style.removeProperty(`--ui-sidebar-${type}-height`);
  }
  
  function setToggleStorage(type, toggled) {
    if (isMobile()) {
      return;
    }
    const state = getChromeState();
    state.sidebarToggles = state.sidebarToggles || {};
    state.sidebarToggles[type] = toggled; // true of false
    setChromeState(state);
  }
  
  function getClientCoords(ev) {
    if (ev.touches && ev.touches.length > 0) {
      return { clientX: ev.touches[0].clientX, clientY: ev.touches[0].clientY };
    } else if (ev.changedTouches && ev.changedTouches.length > 0) {
      return { clientX: ev.changedTouches[0].clientX, clientY: ev.changedTouches[0].clientY };
    } else {
      return { clientX: ev.clientX, clientY: ev.clientY };
    }
  }

// Resizing logic
  function initResizing($resizer) {
    let startX, startY, startWidth, minWidth, maxWidth, startHeight, minHeight, maxHeight, resizeDirection, isResizing = false;
    const sidebarType = $resizer.getAttribute('data-sidebar-resizer');
    const className = `has:toggled-sidebar-${sidebarType}`;
    let $sidebar;
    
    function onMove(ev) {
      if (!resizeDirection || !isResizing) return;
      
      const { clientX, clientY } = getClientCoords(ev);
      let newWidth, newHeight;
      
      if (resizeDirection === 'horizontal') {
        if (sidebarType === 'left') {
          newWidth = startWidth + (clientX - startX);
        } else {
          newWidth = startWidth - (clientX - startX);
        }
        if ($ui.classList.contains(className) && newWidth > minWidth) {
          setWidth(newWidth, sidebarType);
          if (sidebarType === 'left') {
            $ui.classList.remove(className);
          }
        } else if (newWidth > minWidth && newWidth < maxWidth) {
          setWidth(newWidth, sidebarType);
        }
      }
      
      if (resizeDirection === 'vertical') {
        newHeight = startHeight - (clientY - startY);
        if ($ui.classList.contains(className) && newHeight > minHeight) {
          setHeight(newHeight, sidebarType);
          if (sidebarType === 'left') {
            $ui.classList.remove(className);
          }
        } else if (newHeight > minHeight && newHeight < maxHeight) {
          setHeight(newHeight, sidebarType);
        }
      }
    }
    
    function onEnd(ev) {
      isResizing = false;
      resizeDirection = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      
      $ui.classList.remove('has:resizing');
      $sidebar.removeAttribute('data-resizing');
      
      // Save the new width and height in localstorage if not toggled
      if ((!$ui.classList.contains(className) && sidebarType !== 'right') || (sidebarType === 'right' && $ui.classList.contains(className))) {
        const state = getChromeState();
        state.sidebarWidths = state.sidebarWidths || {};
        state.sidebarHeights = state.sidebarHeights || {};
        
        state.sidebarWidths[sidebarType] = $sidebar.offsetWidth;
        state.sidebarHeights[sidebarType] = $sidebar.offsetHeight;
        
        setChromeState(state);
      }
    }
    
    function getWidthValueInPixels($sidebar, type) {
      const val = getComputedStyle($sidebar).getPropertyValue(type);
      return val.includes('%') ? parseFloat(val) / 100 * $sidebar.parentElement.getBoundingClientRect().width : parseFloat(val);
    }
    
    function initResize(ev, direction) {
      $sidebar = ev.target.closest('[data-sidebar]');
      if (!$sidebar) return;
      
      const { clientX, clientY } = getClientCoords(ev);
      
      $sidebar.setAttribute('data-resizing', direction);
      ev.preventDefault();
      
      isResizing = true;
      resizeDirection = direction;
      startX = clientX;
      startY = clientY;
      startWidth = $sidebar.offsetWidth;
      startHeight = $sidebar.offsetHeight;
      maxHeight = getWidthValueInPixels($sidebar, 'max-height');
      minHeight = getWidthValueInPixels($sidebar, 'min-height');
      maxWidth = getWidthValueInPixels($sidebar, 'max-width');
      minWidth = getWidthValueInPixels($sidebar, 'min-width');
      
      $ui.classList.add('has:resizing');
      
      // Add listeners
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }
    
    $resizer.addEventListener('mousedown', (ev) => {
      const rect = $resizer.getBoundingClientRect();
      const direction = rect.height > rect.width ? 'horizontal' : 'vertical';
      initResize(ev, direction);
    });
    
    $resizer.addEventListener('touchstart', (ev) => {
      const rect = $resizer.getBoundingClientRect();
      const direction = rect.height > rect.width ? 'horizontal' : 'vertical';
      initResize(ev, direction);
    }, { passive: false });
    
    $resizer.addEventListener('dblclick', () => {
      resetWidth(sidebarType);
      resetHeight(sidebarType);
      removeFromChromeState('sidebarWidths', sidebarType);
      removeFromChromeState('sidebarHeights', sidebarType);
    });
  }
  
  // Initialize resizing for sidebars
  ['left', 'right', 'component', 'split'].forEach((side) => {
    const $el = document.querySelector(`[data-sidebar-resizer="${side}"]`);
    if ($el) {
      initResizing($el);
    }
  });
  
  // The toggle buttons for sidebars
  if ($sidebarToggles.length > 0) {
    $sidebarToggles.forEach(($el) => {
      $el.addEventListener('click', (ev) => {
        ev.preventDefault();
        const direction = $el.getAttribute('data-sidebar-toggle');
        const toggled = $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
        setToggleStorage(direction, toggled);
      });
    });
  }
  
  // When clicking the left sidebar navigation on mobile
  
  if ($navigationWrapper) {
    $navigationWrapper.addEventListener('click', (ev) => {
      if (isMobile() && (ev.target.closest('.navigation__heading') || !ev.target.closest('.navigation--persistent'))) {
        $ui.classList.add('has:toggled-sidebar-left');
      }
    });
  }
  
  // Toggle search
  
  if ($searchToggle) {
    $searchToggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      $ui.classList.toggle('has:toggled-search');
      
      // If toggled, place focus on the input
      if ($ui.classList.contains('has:toggled-search')) {
        const $searchInput = document.querySelector('[type="search"]');
        if ($searchInput) {
          $searchInput.focus();
        }
      }
    });
  }
  
  // toggle the sidebar type
  if ($sidebarTypeToggles.length > 0) {
    $sidebarTypeToggles.forEach(($el) => {
      $el.addEventListener('click', (ev) => {
        ev.preventDefault();
        const sidebar = $el.closest('[data-sidebar]');
        const type = $el.getAttribute('data-sidebar-type-toggle');
        sidebar.setAttribute('data-sidebar-type', type);
        
        // Save in localStorage
        const sidebarId = sidebar.getAttribute('data-sidebar'); // bijvoorbeeld 'right'
        const state = getChromeState();
        state.sidebarTypes = state.sidebarTypes || {};
        state.sidebarTypes[sidebarId] = type;
        setChromeState(state);
      });
    });
  }
  
  
  // Profile toggle
  if ($profileToggle) {
    $profileToggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      $ui.classList.toggle('has:toggled-profile');
    });
  }
  
  // If open, close when esc is pressed
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if ($ui.classList.contains('has:toggled-search')) {
        $ui.classList.remove('has:toggled-search');
        // Move the focus to the toggle button
        const $searchToggle = document.querySelector('[data-toggle-search]');
        if ($searchToggle) {
          $searchToggle.focus();
        }
      }
      if ($ui.classList.contains('has:toggled-profile')) {
        $ui.classList.remove('has:toggled-profile');
      }
    }
  });
  
  // Close the search when clicking outside
  document.addEventListener('click', (ev) => {
    const $profile = document.querySelector('[data-toggle-profile]');
    if ($ui.classList.contains('has:toggled-profile') && !$profile.contains(ev.target)) {
      $ui.classList.remove('has:toggled-profile');
    }
    
    // When clicking outside of the .search-wrapper, and not on the search toggle button, close the search
    const $searchWrapper = document.querySelector('[data-search]');
    const $searchToggle = document.querySelector('[data-toggle-search]');
    if ($ui.classList.contains('has:toggled-search') && !$searchWrapper.contains(ev.target) && !$searchToggle.contains(ev.target)) {
      $ui.classList.remove('has:toggled-search');
    }
  });
  
  // Tabs
  if ($tabList.length > 0) {
    $tabList.forEach(($tabList) => {
      const $tabs = $tabList.querySelectorAll('[role="tab"]');
      const $panels = document.querySelectorAll('[data-tab-content]');
      const pageId = document.body.id; // e.g., "page-id-345"
      
      // @TODO: use data-attributes istead of classes
      $tabs.forEach(($tab, index) => {
        $tab.addEventListener('keydown', (ev) => {
          let newIndex;
          if (ev.key === 'ArrowRight') {
            newIndex = (index + 1) % $tabs.length;
            $tabs[newIndex].focus();
          } else if (ev.key === 'ArrowLeft') {
            newIndex = (index - 1 + $tabs.length) % $tabs.length;
            $tabs[newIndex].focus();
          }
        });

        $tab.addEventListener('click', (ev) => {
          ev.preventDefault();
          UIkit.tabs.activateTab($tab);
          const chromeState = getChromeState();
          chromeState.tabs = chromeState.tabs || {};
          chromeState.tabs[pageId] = $tab.getAttribute('href');
          setChromeState(chromeState);
        });
      });
    });
  }
  
  
  

  // ✨ Instelbare setting
  const hoverActivation = true;

  // ✨ Alleen true als je een dropdown handmatig hebt geopend
  let hoverModeActive = false;
  
  if ($toggles.length > 0) {
    
    $toggles.forEach(($toggle) => {
      const dropdownId = $toggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      // ✅ Handmatige klik
      $toggle.addEventListener('click', () => {
        const isOpen = $toggle.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns();
        
        if (!isOpen) {
          $toggle.setAttribute('aria-expanded', 'true');
          dropdown.hidden = false;
          
          if (hoverActivation) {
            hoverModeActive = true;
          }
        } else {
          hoverModeActive = false;
        }
      });
      
      // ⌨️ Keyboard interactie
      $toggle.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          $toggle.click();
        } else if (ev.key === 'Escape') {
          closeAllDropdowns();
          $toggle.focus();
          hoverModeActive = false;
        }
      });
      
      dropdown.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          $toggle.setAttribute('aria-expanded', 'false');
          dropdown.hidden = true;
          $toggle.focus();
          hoverModeActive = false;
        }
      });
      
      // ✨ Hover werkt alleen als:
      // 1. hoverActivation = true
      // 2. je eerst handmatig iets open hebt geklikt
      $toggle.addEventListener('mouseenter', () => {
        const isOpen = $toggle.getAttribute('aria-expanded') === 'true';
        
        if (hoverActivation && hoverModeActive && !isOpen) {
          closeAllDropdowns();
          $toggle.setAttribute('aria-expanded', 'true');
          dropdown.hidden = false;
        }
      });
    });
    
    // ⛔ Buiten klikken sluit alles + hovermode uit
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.filter')) {
        closeAllDropdowns();
        hoverModeActive = false;
      }
    });
    
    function closeAllDropdowns() {
      $toggles.forEach(($toggle) => {
        const id = $toggle.getAttribute('aria-controls');
        const dd = document.getElementById(id);
        $toggle.setAttribute('aria-expanded', 'false');
        dd.hidden = true;
      });
    }
  }
  
  
  
  if ($trees.length > 0) {
    $trees.forEach(($tree) => {
      const treeId = $tree.getAttribute("data-tree-uid") || "default";
      // Use chrome state for treeStates
      let chromeState = getChromeState();
      let savedState = (chromeState.treeStates && chromeState.treeStates[treeId]) ? chromeState.treeStates[treeId] : {};

      // Herstel opgeslagen open/gesloten status
      for (const [id, isOpen] of Object.entries(savedState)) {
        const $li = $tree.querySelector(`li[data-id="${id}"]`);
        if ($li && isOpen) $li.classList.add("open");
      }
      
      $tree.addEventListener("click", (ev) => {
        const toggle = ev.target.closest("button.tree-nav__toggle");
        const link = ev.target.closest("a");
        const li = ev.target.closest("li[data-id]");
        if (!li) return;
        
        const id = li.dataset.id;
        if (!id) return;
        
        let isOpen = false;
        
        // Echte toggle: veranderen
        if (toggle) {
          li.classList.toggle("open");
          isOpen = li.classList.contains("open"); // status na togglen
        } else {
          isOpen = true;
        }
        
        // Klik op toggle of link: altijd status opslaan
        if (toggle || link) {
          const chromeState = getChromeState();
          chromeState.treeStates = chromeState.treeStates || {};
          chromeState.treeStates[treeId] = chromeState.treeStates[treeId] || {};
          chromeState.treeStates[treeId][id] = isOpen;
          setChromeState(chromeState);
        }
      });
    });
  }
  
  
  
  // Table
  
  if ($tables.length > 0) {
    $tables.forEach($table => {
      // Get rows in tbody
      const $rows = $table.querySelectorAll('tbody tr');
      if ($rows) {
        $rows.forEach($row => {
          // Add single click
          $row.addEventListener('click', () => {
            $row.classList.toggle('is:selected');
          });
          // Add double click
          $row.addEventListener('dblclick', () => {
            const $link = $row.querySelector('a');
            const url = $link.getAttribute('href');
            if (url) {
              window.location.href = url;
            }
          });
        })
      }
    });
  }
  
  
  
  // TODO: TEMP
  $toggleSplits.forEach(($el) => {
    $el.addEventListener('click', (ev) => {
      const className = `has:toggled-sidebar-split`;
      ev.preventDefault();
      $ui.classList.toggle(className);
    });
  });
  
  
  // @TODO: Temp
  
  if ($splitSwitch && $main) {
    $splitSwitch.addEventListener('click', (ev) => {
      ev.preventDefault();
      $ui.classList.add('has:resizing');
      $ui.classList.toggle('has:split-vertical');
      
      const state = getChromeState();
      state.splitSwitch = $ui.classList.contains('has:split-vertical');
      setChromeState(state);
      
      setTimeout(() => {
        $ui.classList.remove('has:resizing');
      }, 0);
    });
  }
  
  // @TODO: Temp
  // Add a class when the window is resizing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    $ui.classList.add('is:resizing');
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      $ui.classList.remove('is:resizing');
    }, 500);
  });
  
  
  
  // Open our search on cmd/ctrl + f
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const isFindShortcut = (isMac && e.metaKey && e.key === 'f') || (!isMac && e.ctrlKey && e.key === 'f');
    
    if (!isFindShortcut) return;
    
    const active = document.activeElement;
    const isFormField = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;
    
    // Alleen overriden als we NIET al in een form field zitten
    if (!isFormField) {
      e.preventDefault();
      
      const $searchInput = document.querySelector('[data-search-input]');
      if ($searchInput) {
        $searchInput.focus();
        $searchInput.select();
      }
    }
  });
  
  
  
  function getSidebarWidth(varName, fallback) {
    const value = parseFloat(getComputedStyle($ui).getPropertyValue(varName));
    return isNaN(value) ? fallback : value;
  }
  
  // Touch support
// ==========================
  
  let startX = 0;
  let startY = 0;
  let startProgress = 0;
  let isDragging = false;
  let activeSidebar = null;
  let isHorizontalSwipe = null; // Nieuw: weten of we horizontaal zijn
  const swipeThreshold = 10; // pixels voordat we bepalen

// Max swipe afstand
  let swipeWidths;
  
  function handleTouchStart(e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isHorizontalSwipe = null;
    
    const minMoveValue = 240;
    
    swipeWidths = {
      left: Math.min(window.innerWidth * 0.8, 400),
      component: Math.max(getSidebarWidth('--ui-sidebar-component-width', window.innerWidth * 0.8), minMoveValue),
    };
    
    const swipeAreas = document.querySelectorAll('[data-swipe]');
    activeSidebar = null;
    
    swipeAreas.forEach(($area) => {
      const rect = $area.getBoundingClientRect();
      if (
        startX >= rect.left &&
        startX <= rect.right &&
        startY >= rect.top &&
        startY <= rect.bottom
      ) {
        const type = $area.getAttribute('data-swipe');
        if (type === 'sidebar-left' || type === 'sidebar-component') {
          activeSidebar = type.replace('sidebar-', '');
        }
      }
    });
    
    if (!activeSidebar) {
      isDragging = false;
      return;
    }
    
    const $ui = document.querySelector('[data-uikit]');
    const progressValue = getComputedStyle($ui).getPropertyValue(`--ui-sidebar-${activeSidebar}-progress`);
    startProgress = parseFloat(progressValue) || 0;
    
    isDragging = true;
    // Store the touch start time for velocity calculation
    e.currentTarget._touchStartTime = e.timeStamp;
  }
  
  function handleTouchMove(e) {
    if (!isDragging || !activeSidebar) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    
    if (isHorizontalSwipe === null) {
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }
    
    if (isHorizontalSwipe) {
      e.preventDefault();
      if (!$ui.classList.contains('is:resizing')) {
        $ui.classList.add('is:resizing');
      }
      
      let adjustedDeltaX = deltaX;
      if (activeSidebar === 'component') {
        adjustedDeltaX = startX - currentX;
      }
      
      let progress = startProgress + adjustedDeltaX / swipeWidths[activeSidebar];
      progress = Math.min(Math.max(progress, 0), 1);
      
      $ui.style.setProperty(`--ui-sidebar-${activeSidebar}-progress`, progress);
    }
  }
  
  function handleTouchEnd(e) {
    if (!isDragging || !activeSidebar) return;
    
    const $ui = document.querySelector('[data-uikit]');
    
    // Calculate velocity and flick detection
    const deltaX = e.changedTouches[0].clientX - startX;
    const timeDelta = e.timeStamp - (e.currentTarget._touchStartTime || 0);
    const velocity = Math.abs(deltaX / (timeDelta || 1)); // Avoid div by zero
    const flickThreshold = 0.8; // pixels per millisecond (verhoog gevoeligheid)
    const isFlick = velocity > flickThreshold && Math.abs(deltaX) > 30;
    const isFlickDirection = deltaX > 0 ? 'right' : 'left';
    
    isDragging = false;
    const finalProgress = parseFloat(getComputedStyle($ui).getPropertyValue(`--ui-sidebar-${activeSidebar}-progress`)) || 0;
    
    // Nieuwe logica voor beide richtingen
    const shouldOpen = isFlick
      ? (activeSidebar === 'left' && isFlickDirection === 'right') ||
        (activeSidebar === 'component' && isFlickDirection === 'left')
      : finalProgress > 0.5;

    if (shouldOpen) {
      $ui.classList.add(`has:toggled-sidebar-${activeSidebar}`);
      $ui.style.removeProperty(`--ui-sidebar-${activeSidebar}-progress`);
    } else {
      $ui.classList.remove(`has:toggled-sidebar-${activeSidebar}`);
      $ui.style.removeProperty(`--ui-sidebar-${activeSidebar}-progress`);
    }
    
    activeSidebar = null;
    isHorizontalSwipe = null;
    $ui.classList.remove('is:resizing');
  }
  
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  
})();
