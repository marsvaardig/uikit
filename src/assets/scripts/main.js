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
  
  // Add initializing class
  $ui.classList.add('is:initializing');
  
  // Remove initializing class after 500ms
  setTimeout(() => {
    $ui.classList.remove('is:initializing');
  }, 500)
  
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
  
  function setToggleStorage(type) {
    if (isMobile()) {
      return;
    }
    localStorage.setItem(`sidebarToggle-${type}`, true);
  }
  
  // Resizing logic
  function initResizing($resizer) {
    let startX, startY, startWidth, minWidth, maxWidth, startHeight, minHeight, maxHeight, resizeDirection, isResizing = false;
    const sidebarType = $resizer.getAttribute('data-sidebar-resizer');
    const className = `has:toggled-sidebar-${sidebarType}`;
    
    if (localStorage.getItem(`sidebarWidth-${sidebarType}`)) {
      setWidth(localStorage.getItem(`sidebarWidth-${sidebarType}`), sidebarType);
    }
    
    if (localStorage.getItem(`sidebarHeight-${sidebarType}`)) {
      setHeight(localStorage.getItem(`sidebarHeight-${sidebarType}`), sidebarType);
    }
    
    if (localStorage.getItem(`sidebarToggle-${sidebarType}`)) {
      $ui.classList.add(`has:toggled-sidebar-${sidebarType}`);
    }
    
    function onMouseMove(ev) {
      if (!resizeDirection || !isResizing) return;
      let newWidth;
      let newHeight;
      if (resizeDirection === 'horizontal') {
        if (sidebarType === 'left') {
          newWidth = startWidth + (ev.clientX - startX);
        } else {
          newWidth = startWidth - (ev.clientX - startX);
        }
        if ($ui.classList.contains(className) && newWidth > minWidth) {
          setWidth(newWidth, sidebarType);
          if (sidebarType === 'left') {
            $ui.classList.remove(className);
            localStorage.removeItem(`sidebarToggle-${sidebarType}`);
          }
        } else if (newWidth > minWidth && newWidth < maxWidth) {
          setWidth(newWidth, sidebarType);
        }
      }
      if (resizeDirection === 'vertical') {
        newHeight = startHeight - (ev.clientY - startY);
        if ($ui.classList.contains(className) && newHeight > minHeight) {
          setHeight(newHeight, sidebarType);
          if (sidebarType === 'left') {
            $ui.classList.remove(className);
            localStorage.removeItem(`sidebarToggle-${sidebarType}`);
          }
        } else if (newHeight > minHeight && newHeight < maxHeight) {
          setHeight(newHeight, sidebarType);
        }
      }
    }
    
    function onMouseUp(ev, $sidebar) {
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
      
      if ((!$ui.classList.contains(className))) {
        localStorage.setItem(`sidebarHeight-${sidebarType}`, $sidebar.offsetHeight);
      }
      
      // If not toggled; remove the toggled localstorage
      if (!$ui.classList.contains(className)) {
        localStorage.removeItem(`sidebarToggle-${sidebarType}`);
      }
    }
    
    function getWidthValueInPixels($sidebar, type) {
      const val = getComputedStyle($sidebar).getPropertyValue(type);
      return val.includes('%') ? parseFloat(val) / 100 * $sidebar.parentElement.getBoundingClientRect().width : parseFloat(val);
    }
    
    
    function initResize(ev, direction) {
      const $sidebar = ev.target.closest('[data-sidebar]');
      
      $sidebar.setAttribute('data-resizing', direction);
      
      ev.preventDefault();
      isResizing = true;
      resizeDirection = direction;
      startX = ev.clientX;
      startY = ev.clientY;
      startWidth = $sidebar.offsetWidth;
      startHeight = $sidebar.offsetHeight;
      maxHeight = getWidthValueInPixels($sidebar, 'max-height');
      minHeight = getWidthValueInPixels($sidebar, 'min-height');
      maxWidth = getWidthValueInPixels($sidebar, 'max-width');
      minWidth = getWidthValueInPixels($sidebar, 'min-width');
      $ui.classList.add('has:resizing');
      
      // Add listeners
      document.addEventListener('mousemove', (ev) => onMouseMove(ev, $sidebar));
      document.addEventListener('mouseup', (ev) => onMouseUp(ev, $sidebar));
    }
    
    // Initial mousedown event
    $resizer.addEventListener('mousedown', (ev) => {
      const rect = $resizer.getBoundingClientRect();
      const direction = rect.height > rect.width ? 'horizontal' : 'vertical';
      initResize(ev, direction);
    });
    
    // When doubleclicking on the resizer; reset the corresponding width
    $resizer.addEventListener('dblclick', () => {
      resetWidth(sidebarType);
      resetHeight(sidebarType);
      localStorage.removeItem(`sidebarWidth-${sidebarType}`);
      localStorage.removeItem(`sidebarHeight-${sidebarType}`);
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
        $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
        if ($ui.classList.contains(`has:toggled-sidebar-${direction}`)) {
          setToggleStorage(direction);
        } else {
          localStorage.removeItem(`sidebarToggle-${direction}`);
        }
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
  
  // toggle the
  if ($sidebarTypeToggles.length > 0) {
    $sidebarTypeToggles.forEach(($el) => {
      $el.addEventListener('click', (ev) => {
        ev.preventDefault();
        const sidebar = $el.closest('[data-sidebar]');
        const type = $el.getAttribute('data-sidebar-type-toggle');
        sidebar.setAttribute('data-sidebar-type', type);
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
      const storageKey = `activeTab-${pageId}`;
      
      // Load saved tab from localStorage
      const savedTabId = localStorage.getItem(storageKey);
      if (savedTabId) {
        const $savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
        if ($savedTab) {
          activateTab($savedTab);
        }
      }
      
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
          activateTab($tab);
          localStorage.setItem(storageKey, $tab.getAttribute('href'));
        });
      });
      
      function activateTab(selectedTab) {
        $tabs.forEach(($tab) => {
          $tab.setAttribute('aria-selected', 'false');
          $tab.parentElement.classList.remove('is:active');
        });
        
        $panels.forEach(($panel) => {
          $panel.classList.remove('is:active');
          $panel.setAttribute('hidden', '');
          const overflowContainer = $panel.closest('.overflow');
          if (!overflowContainer) return;
          // Reset overflow container scroll position
          overflowContainer.scrollTop = 0;
        });
        
        selectedTab.setAttribute('aria-selected', 'true');
        selectedTab.parentElement.classList.add('is:active');
        
        const $targetPanel = document.querySelector(selectedTab.getAttribute('href'));
        $targetPanel.classList.add('is:active');
        $targetPanel.removeAttribute('hidden');
      }
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
      const stateKey = `tree-nav-state:${treeId}`;
      let savedState = JSON.parse(localStorage.getItem(stateKey) || "{}");
      
      // Herstel opgeslagen open/gesloten status
      for (const [id, isOpen] of Object.entries(savedState)) {
        const $li = $tree.querySelector(`li[data-id="${id}"]`);
        if ($li && isOpen) $li.classList.add("open");
      }
      
      $tree.addEventListener("click", (ev) => {
        const toggle = ev.target.closest("button.tree-nav__toggle");
        const link = ev.target.closest("a");
        if (!toggle && !link) return;
        
        // Get the closest li element with a data-id attribute
        const li = ev.target.closest("li[data-id]");
        
        // When clicked on a toggle; toggle
        if (toggle) {
          const id = li?.dataset.id;
          if (!id) return;
          
          li.classList.toggle("open");
          savedState[id] = li.classList.contains("open");
        }
        
        // When clicked on a link; save the current state before going to the link so it's open on the next page
        if (link) {
          const id = li?.dataset.id;
          if (!id) return;
          
          // Sla de huidige status op
          savedState[id] = li;
        }
        
        localStorage.setItem(stateKey, JSON.stringify(savedState));
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
      $main.classList.toggle('main--stack');
      $splitSwitch.classList.toggle('is:stack')
      // Save state in localstorage
      if ($main.classList.contains('main--stack')) {
        localStorage.setItem('splitSwitch', 'true');
      } else {
        localStorage.removeItem('splitSwitch');
      }
      setTimeout(() => {
        $ui.classList.remove('has:resizing');
      }, 0);
    });
    
    if (localStorage.getItem('splitSwitch')) {
      $main.classList.add('main--stack');
      $splitSwitch.classList.add('is:stack')
    }
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
  
})();
