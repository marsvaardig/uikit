(() => {
  // Get UI container
  const $ui = document.querySelector('[data-uikit]');
  
  // Add initializing class
  $ui.classList.add('is:initializing');
  
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
    if (settings.sidebarToggles) {
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
  } catch (e) {
    console.error('Failed to parse UIkit settings:', e);
  }
})();
