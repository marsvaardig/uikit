// Set a global variable for the UIkit settings
window.UIkit = window.UIkit || {};

// Set a global variable for the Tabs
window.UIkit.tabs = window.UIkit.tabs || {};

// Add a function to activate a tab
UIkit.tabs.activateTab = function(selectedTab) {
  const $tabs = document.querySelectorAll('[role="tab"]');
  const $panels = document.querySelectorAll('[data-tab-content]');
  
  $tabs.forEach(($tab) => {
    $tab.setAttribute('aria-selected', 'false');
    $tab.parentElement.classList.remove('is:active');
  });
  
  $panels.forEach(($panel) => {
    $panel.classList.remove('is:active');
    $panel.setAttribute('hidden', '');
    const overflowContainer = $panel.closest('.overflow');
    if (overflowContainer) {
      overflowContainer.scrollTop = 0;
    }
  });
  
  selectedTab.setAttribute('aria-selected', 'true');
  selectedTab.parentElement.classList.add('is:active');
  
  const $targetPanel = document.querySelector(selectedTab.getAttribute('href'));
  if ($targetPanel) {
    $targetPanel.classList.add('is:active');
    $targetPanel.removeAttribute('hidden');
  }
};

// Run code immediately
(() => {
  // Get UI container
  const $ui = document.querySelector('[data-uikit]');
  
  // Add initializing class
  $ui.classList.add('is:initializing');
  
  function isMobile() {
    return window.getComputedStyle($ui).getPropertyValue('--ui-mobile') === '1';
  }
  
  // Remove initializing class after 500ms
  setTimeout(() => {
    $ui.classList.remove('is:initializing');
  }, 500)
  
  // Get settings
  const uikitChromeSettings = localStorage.getItem('uikit-chrome');
  if (!uikitChromeSettings) return;
  
  // Get from localStorage
  try {
    // Parse settings
    const settings = JSON.parse(uikitChromeSettings);
    
    // SidebarWidths
    if (settings.sidebarWidths) {
      for (const [type, width] of Object.entries(settings.sidebarWidths)) {
        if (typeof width === 'number' && width > 0) {
          document.body.style.setProperty(`--ui-sidebar-${type}-width`, `${width}px`);
        }
      }
    }
    
    // SidebarHeights
    if (settings.sidebarHeights) {
      for (const [type, height] of Object.entries(settings.sidebarHeights)) {
        if (typeof height === 'number' && height > 0) {
          document.body.style.setProperty(`--ui-sidebar-${type}-height`, `${height}px`);
        }
      }
    }
    
    // SplitSwitch
    if (settings.splitSwitch) {
      $ui.classList.add('has:split-vertical');
    }
    
    // SidebarToggles
    if (settings.sidebarToggles && !isMobile()) {
      for (const [type, toggled] of Object.entries(settings.sidebarToggles)) {
        if (toggled) {
          $ui.classList.add(`has:toggled-sidebar-${type}`);
        }
      }
    }
    
    // SidebarTypes
    if (settings.sidebarTypes) {
      for (const [sidebar, type] of Object.entries(settings.sidebarTypes)) {
        const $sidebar = document.querySelector(`[data-sidebar="${sidebar}"]`);
        if ($sidebar) {
          $sidebar.setAttribute('data-sidebar-type', type);
        }
      }
    }

    // Restore tree open/closed state
    // @TODO: set a11y aria-expanded etc.
    if (settings.treeStates) {
      for (const [treeId, treeState] of Object.entries(settings.treeStates)) {
        const $tree = document.querySelector(`[data-tree-uid="${treeId}"]`);
        if ($tree) {
          for (const [id, isOpen] of Object.entries(treeState)) {
            const $li = $tree.querySelector(`li[data-id="${id}"]`);
            if ($li && isOpen) $li.classList.add("open");
          }
        }
      }
    }
    
    // Restore active tabs
    if (settings.tabs) {
      const pageId = document.body.id;
      const savedTabId = settings.tabs[pageId];
      if (savedTabId) {
        const $savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
        if ($savedTab) {
          UIkit.tabs.activateTab($savedTab);
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse UIkit settings:', e);
  }
})();
