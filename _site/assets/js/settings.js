(() => {
  // src/assets/scripts/settings.js
  (() => {
    const $ui = document.querySelector("[data-uikit]");
    $ui.classList.add("is:initializing");
    setTimeout(() => {
      $ui.classList.remove("is:initializing");
    }, 500);
    const uikitChromeSettings = localStorage.getItem("uikit-chrome");
    if (!uikitChromeSettings) return;
    try {
      const settings = JSON.parse(uikitChromeSettings);
      if (settings.sidebarWidths) {
        for (const [type, width] of Object.entries(settings.sidebarWidths)) {
          if (typeof width === "number" && width > 0) {
            document.body.style.setProperty(`--ui-sidebar-${type}-width`, `${width}px`);
          }
        }
      }
      if (settings.sidebarHeights) {
        for (const [type, height] of Object.entries(settings.sidebarHeights)) {
          if (typeof height === "number" && height > 0) {
            document.body.style.setProperty(`--ui-sidebar-${type}-height`, `${height}px`);
          }
        }
      }
      if (settings.splitSwitch) {
        $ui.classList.add("has:split-vertical");
      }
      if (settings.sidebarToggles) {
        for (const [type, toggled] of Object.entries(settings.sidebarToggles)) {
          if (toggled) {
            $ui.classList.add(`has:toggled-sidebar-${type}`);
          }
        }
      }
      if (settings.sidebarTypes) {
        for (const [sidebar, type] of Object.entries(settings.sidebarTypes)) {
          const $sidebar = document.querySelector(`[data-sidebar="${sidebar}"]`);
          if ($sidebar) {
            $sidebar.setAttribute("data-sidebar-type", type);
          }
        }
      }
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
      console.error("Failed to parse UIkit settings:", e);
    }
  })();
})();
