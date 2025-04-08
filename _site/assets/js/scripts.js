(() => {
  // Our elements
  const $ui = document.querySelector('[data-uikit]');
  
  $ui.classList.add('is:initializing');
  
  setTimeout(() => {
    $ui.classList.remove('is:initializing');
  }, 500)
  
  function isMobile() {
    return window.getComputedStyle($ui).getPropertyValue('--mv-mobile') === '1';
  }
  
  function setWidth(newWidth, type) {
    document.body.style.setProperty(`--mv-sidebar-${type}-width`, `${newWidth}px`);
  }
  
  function resetWidth(type) {
    document.body.style.removeProperty(`--mv-sidebar-${type}-width`);
  }
  
  function setToggleStorage(type) {
    if (isMobile()) {
      return;
    }
    localStorage.setItem(`sidebarToggle-${type}`, true);
  }
  
  // Resizing logic
  function initResizing($resizer) {
    let startX, startY, startWidth, maxWidth, minWidth, resizeDirection, isResizing = false;
    const sidebarType = $resizer.getAttribute('data-sidebar-resizer');
    const className = `has:toggled-sidebar-${sidebarType}`;
    
    if (localStorage.getItem(`sidebarWidth-${sidebarType}`)) {
      setWidth(localStorage.getItem(`sidebarWidth-${sidebarType}`), sidebarType);
    }
    
    if (localStorage.getItem(`sidebarToggle-${sidebarType}`)) {
      $ui.classList.add(`has:toggled-sidebar-${sidebarType}`);
    }
    
    function onMouseMove(e, $sidebar) {
      if (!resizeDirection || !isResizing) return;
      let newWidth;
      if (sidebarType === 'left') {
        newWidth = startWidth + (e.clientX - startX);
      } else {
        newWidth = startWidth - (e.clientX - startX);
      }
      if ($ui.classList.contains(className) && newWidth > minWidth) {
        setWidth(newWidth, sidebarType);
        if (sidebarType === 'left') {
          $ui.classList.remove(className);
          localStorage.removeItem(`sidebarToggle-${sidebarType}`);
        }
      }
      else if (newWidth > minWidth && newWidth < maxWidth) {
        setWidth(newWidth, sidebarType);
      }
      // @TODO: properly add the closing mechanism without messing stuff up
      else if (newWidth < minWidth) {
        if (sidebarType === 'left') {
          setWidth(startWidth, sidebarType);
          $ui.classList.add(className);
          setToggleStorage(sidebarType);
        }
        // if (sidebarType === 'right') {
        //   setWidth(startWidth, sidebarType);
        //   $ui.classList.remove(className);
        //   // Reset CSS variable and localstorage
        //   localStorage.setItem(`sidebarWidth-${sidebarType}`, startWidth);
        //   localStorage.removeItem(`sidebarToggle-${sidebarType}`);
        // }
      }
    }
    
    function onMouseUp(e, $sidebar) {
      isResizing = false;
      resizeDirection = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      $ui.classList.remove('has:resizing');
      
      $sidebar.removeAttribute('data-resizing');
      
      // Save the new width and height in localstorage if not toggled
      if ((!$ui.classList.contains(className) && sidebarType !== 'right') || (sidebarType === 'right' && $ui.classList.contains(className))) {
        localStorage.setItem(`sidebarWidth-${sidebarType}`, $sidebar.offsetWidth);
      }
      
      // If not toggled; remove the toggled localstorage
      if (!$ui.classList.contains(className)) {
        localStorage.removeItem(`sidebarToggle-${sidebarType}`);
      }
    }
    
    function initResize(e, direction) {
      const $sidebar = e.target.closest('[data-sidebar]');
      
      $sidebar.setAttribute('data-resizing', direction);
      
      e.preventDefault();
      isResizing = true;
      resizeDirection = direction;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = $sidebar.offsetWidth;
      $ui.classList.add('has:resizing');
      maxWidth = parseInt(window.getComputedStyle($sidebar).getPropertyValue('max-width'));
      minWidth = parseInt(window.getComputedStyle($sidebar).getPropertyValue('min-width'));
      
      // Add listeners
      document.addEventListener('mousemove', (e) => onMouseMove(e, $sidebar));
      document.addEventListener('mouseup', (e) => onMouseUp(e, $sidebar));
    }
    
    // Initial mousedown event
    $resizer.addEventListener('mousedown', (e) => initResize(e, 'horizontal'));
    
    // When doubleclicking on the resizer; reset the corresponding width
    $resizer.addEventListener('dblclick', (e) => {
      const $sidebar = e.target.closest('[data-sidebar]');
      resetWidth(sidebarType);
      localStorage.removeItem(`sidebarWidth-${sidebarType}`);
    });
  }
  
  // Initialize resizing for sidebars
  ['left', 'right', 'component'].forEach(side => {
    const el = document.querySelector(`[data-sidebar-resizer="${side}"]`);
    if (el) {
      initResizing(el);
    }
  });
  
  // The toggle buttons for sidebars
  document.querySelectorAll('[data-sidebar-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const direction = el.getAttribute('data-sidebar-toggle');
      $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
      if ($ui.classList.contains(`has:toggled-sidebar-${direction}`)) {
        setToggleStorage(direction);
      } else {
        localStorage.removeItem(`sidebarToggle-${direction}`);
      }
    });
  });
  
  // Toggle search
  const searchToggle = document.querySelector('[data-toggle-search]');
  if (searchToggle) {
    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();
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
  
  // toggle the
  const rightSidebarTypeToggleFloat = document.querySelector('[data-sidebar-type="float"]');
  document.querySelectorAll('[data-sidebar-type-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const sidebar = el.closest('[data-sidebar]');
      const type = el.getAttribute('data-sidebar-type-toggle');
      sidebar.setAttribute('data-sidebar-type', type);
    });
  });
  
  
  // Profile toggle
  const profileToggle = document.querySelector('[data-toggle-profile]');
  if (profileToggle) {
    profileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      $ui.classList.toggle('has:toggled-profile');
    });
  }
  
  // If open, close when esc is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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
  document.addEventListener('click', (e) => {
    const $profile = document.querySelector('[data-toggle-profile]');
    if ($ui.classList.contains('has:toggled-profile') && !$profile.contains(e.target)) {
      $ui.classList.remove('has:toggled-profile');
    }
    
    // When clicking outside of the .search-wrapper, and not on the search toggle button, close the search
    const $searchWrapper = document.querySelector('.search-wrapper');
    const $searchToggle = document.querySelector('[data-toggle-search]');
    if ($ui.classList.contains('has:toggled-search') && !$searchWrapper.contains(e.target) && !$searchToggle.contains(e.target)) {
      $ui.classList.remove('has:toggled-search');
    }
  });
  
  // Tabs
  
  const tabList = document.querySelector('.sidebar__tabs ul');
  if (tabList) {
    
    const tabs = tabList.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('.tab-content');
    const pageId = document.body.id; // e.g., "page-id-345"
    const storageKey = `activeTab-${pageId}`;
    
    // Load saved tab from localStorage
    const savedTabId = localStorage.getItem(storageKey);
    if (savedTabId) {
      const savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
      if (savedTab) {
        activateTab(savedTab);
      }
    }
    
    
    // @TODO: use data-attributes istead of classes
    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let newIndex;
        if (e.key === 'ArrowRight') {
          newIndex = (index + 1) % tabs.length;
          tabs[newIndex].focus();
        } else if (e.key === 'ArrowLeft') {
          newIndex = (index - 1 + tabs.length) % tabs.length;
          tabs[newIndex].focus();
        }
      });
      
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(tab);
        localStorage.setItem(storageKey, tab.getAttribute('href'));
      });
    });
    
    function activateTab(selectedTab) {
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.parentElement.classList.remove('is:active');
      });
      
      panels.forEach(panel => {
        panel.classList.remove('is:active');
        panel.setAttribute('hidden', '');
      });
      
      selectedTab.setAttribute('aria-selected', 'true');
      selectedTab.parentElement.classList.add('is:active');
      
      const targetPanel = document.querySelector(selectedTab.getAttribute('href'));
      targetPanel.classList.add('is:active');
      targetPanel.removeAttribute('hidden');
    }
  }
  
  
  const toggles = document.querySelectorAll('.filter-toggle');
  
  if (toggles.length > 0) {
    
    toggles.forEach(toggle => {
      const dropdownId = toggle.getAttribute('aria-controls');
      const dropdown = document.getElementById(dropdownId);
      
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns();
        if (!isOpen) {
          toggle.setAttribute('aria-expanded', 'true');
          dropdown.hidden = false;
        }
      });
      
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        } else if (e.key === 'Escape') {
          closeAllDropdowns();
          toggle.focus();
        }
      });
      
      dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          dropdown.hidden = true;
          toggle.focus();
        }
      });
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filter')) {
        closeAllDropdowns();
      }
    });
    
    function closeAllDropdowns() {
      toggles.forEach(t => {
        const id = t.getAttribute('aria-controls');
        const dd = document.getElementById(id);
        t.setAttribute('aria-expanded', 'false');
        dd.hidden = true;
      });
    }
  }
  
  
})();



