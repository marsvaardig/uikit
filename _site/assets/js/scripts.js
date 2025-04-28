(() => {
  // src/assets/scripts/main.js
  (() => {
    const $ui = document.querySelector("[data-uikit]");
    const $navigationWrapper = document.querySelector("[data-navigation-wrapper]");
    const $trees = document.querySelectorAll("[data-tree-uid]");
    const $splitSwitch = document.querySelector("[data-table-switch]");
    const $main = document.querySelector("[data-main]");
    const $toggleSplits = document.querySelectorAll("[data-toggle-split]");
    const $tables = document.querySelectorAll("[data-table]");
    const $toggles = document.querySelectorAll("[data-filter-toggle]");
    const $sidebarToggles = document.querySelectorAll("[data-sidebar-toggle]");
    const $sidebarTypeToggles = document.querySelectorAll("[data-sidebar-type-toggle]");
    const $searchToggle = document.querySelector("[data-toggle-search]");
    const $profileToggle = document.querySelector("[data-toggle-profile]");
    const $tabList = document.querySelectorAll("[data-tabs]");
    function getChromeState() {
      const saved = localStorage.getItem("uikit-chrome");
      return saved ? JSON.parse(saved) : {};
    }
    function setChromeState(newState) {
      localStorage.setItem("uikit-chrome", JSON.stringify(newState));
    }
    function removeFromChromeState(type, key) {
      const state = getChromeState();
      if (state[type] && typeof state[type] === "object") {
        delete state[type][key];
        setChromeState(state);
      }
    }
    function isMobile() {
      return window.getComputedStyle($ui).getPropertyValue("--ui-mobile") === "1";
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
      state.sidebarToggles[type] = toggled;
      setChromeState(state);
    }
    function initResizing($resizer) {
      let startX, startY, startWidth, minWidth, maxWidth, startHeight, minHeight, maxHeight, resizeDirection, isResizing = false;
      const sidebarType = $resizer.getAttribute("data-sidebar-resizer");
      const className = `has:toggled-sidebar-${sidebarType}`;
      function onMouseMove(ev) {
        if (!resizeDirection || !isResizing) return;
        let newWidth;
        let newHeight;
        if (resizeDirection === "horizontal") {
          if (sidebarType === "left") {
            newWidth = startWidth + (ev.clientX - startX);
          } else {
            newWidth = startWidth - (ev.clientX - startX);
          }
          if ($ui.classList.contains(className) && newWidth > minWidth) {
            setWidth(newWidth, sidebarType);
            if (sidebarType === "left") {
              $ui.classList.remove(className);
            }
          } else if (newWidth > minWidth && newWidth < maxWidth) {
            setWidth(newWidth, sidebarType);
          }
        }
        if (resizeDirection === "vertical") {
          newHeight = startHeight - (ev.clientY - startY);
          if ($ui.classList.contains(className) && newHeight > minHeight) {
            setHeight(newHeight, sidebarType);
            if (sidebarType === "left") {
              $ui.classList.remove(className);
            }
          } else if (newHeight > minHeight && newHeight < maxHeight) {
            setHeight(newHeight, sidebarType);
          }
        }
      }
      function onMouseUp(ev, $sidebar) {
        isResizing = false;
        resizeDirection = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        $ui.classList.remove("has:resizing");
        $sidebar.removeAttribute("data-resizing");
        if (!$ui.classList.contains(className) && sidebarType !== "right" || sidebarType === "right" && $ui.classList.contains(className)) {
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
        return val.includes("%") ? parseFloat(val) / 100 * $sidebar.parentElement.getBoundingClientRect().width : parseFloat(val);
      }
      function initResize(ev, direction) {
        const $sidebar = ev.target.closest("[data-sidebar]");
        $sidebar.setAttribute("data-resizing", direction);
        ev.preventDefault();
        isResizing = true;
        resizeDirection = direction;
        startX = ev.clientX;
        startY = ev.clientY;
        startWidth = $sidebar.offsetWidth;
        startHeight = $sidebar.offsetHeight;
        maxHeight = getWidthValueInPixels($sidebar, "max-height");
        minHeight = getWidthValueInPixels($sidebar, "min-height");
        maxWidth = getWidthValueInPixels($sidebar, "max-width");
        minWidth = getWidthValueInPixels($sidebar, "min-width");
        $ui.classList.add("has:resizing");
        document.addEventListener("mousemove", (ev2) => onMouseMove(ev2, $sidebar));
        document.addEventListener("mouseup", (ev2) => onMouseUp(ev2, $sidebar));
      }
      $resizer.addEventListener("mousedown", (ev) => {
        const rect = $resizer.getBoundingClientRect();
        const direction = rect.height > rect.width ? "horizontal" : "vertical";
        initResize(ev, direction);
      });
      $resizer.addEventListener("dblclick", () => {
        resetWidth(sidebarType);
        resetHeight(sidebarType);
        removeFromChromeState("sidebarWidths", sidebarType);
        removeFromChromeState("sidebarHeights", sidebarType);
      });
    }
    ["left", "right", "component", "split"].forEach((side) => {
      const $el = document.querySelector(`[data-sidebar-resizer="${side}"]`);
      if ($el) {
        initResizing($el);
      }
    });
    if ($sidebarToggles.length > 0) {
      $sidebarToggles.forEach(($el) => {
        $el.addEventListener("click", (ev) => {
          ev.preventDefault();
          const direction = $el.getAttribute("data-sidebar-toggle");
          const toggled = $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
          setToggleStorage(direction, toggled);
        });
      });
    }
    if ($navigationWrapper) {
      $navigationWrapper.addEventListener("click", (ev) => {
        if (isMobile() && (ev.target.closest(".navigation__heading") || !ev.target.closest(".navigation--persistent"))) {
          $ui.classList.add("has:toggled-sidebar-left");
        }
      });
    }
    if ($searchToggle) {
      $searchToggle.addEventListener("click", (ev) => {
        ev.preventDefault();
        $ui.classList.toggle("has:toggled-search");
        if ($ui.classList.contains("has:toggled-search")) {
          const $searchInput = document.querySelector('[type="search"]');
          if ($searchInput) {
            $searchInput.focus();
          }
        }
      });
    }
    if ($sidebarTypeToggles.length > 0) {
      $sidebarTypeToggles.forEach(($el) => {
        $el.addEventListener("click", (ev) => {
          ev.preventDefault();
          const sidebar = $el.closest("[data-sidebar]");
          const type = $el.getAttribute("data-sidebar-type-toggle");
          sidebar.setAttribute("data-sidebar-type", type);
          const sidebarId = sidebar.getAttribute("data-sidebar");
          const state = getChromeState();
          state.sidebarTypes = state.sidebarTypes || {};
          state.sidebarTypes[sidebarId] = type;
          setChromeState(state);
        });
      });
    }
    if ($profileToggle) {
      $profileToggle.addEventListener("click", (ev) => {
        ev.preventDefault();
        $ui.classList.toggle("has:toggled-profile");
      });
    }
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        if ($ui.classList.contains("has:toggled-search")) {
          $ui.classList.remove("has:toggled-search");
          const $searchToggle2 = document.querySelector("[data-toggle-search]");
          if ($searchToggle2) {
            $searchToggle2.focus();
          }
        }
        if ($ui.classList.contains("has:toggled-profile")) {
          $ui.classList.remove("has:toggled-profile");
        }
      }
    });
    document.addEventListener("click", (ev) => {
      const $profile = document.querySelector("[data-toggle-profile]");
      if ($ui.classList.contains("has:toggled-profile") && !$profile.contains(ev.target)) {
        $ui.classList.remove("has:toggled-profile");
      }
      const $searchWrapper = document.querySelector("[data-search]");
      const $searchToggle2 = document.querySelector("[data-toggle-search]");
      if ($ui.classList.contains("has:toggled-search") && !$searchWrapper.contains(ev.target) && !$searchToggle2.contains(ev.target)) {
        $ui.classList.remove("has:toggled-search");
      }
    });
    if ($tabList.length > 0) {
      $tabList.forEach(($tabList2) => {
        const $tabs = $tabList2.querySelectorAll('[role="tab"]');
        const $panels = document.querySelectorAll("[data-tab-content]");
        const pageId = document.body.id;
        const storageKey = `activeTab-${pageId}`;
        const savedTabId = localStorage.getItem(storageKey);
        if (savedTabId) {
          const $savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
          if ($savedTab) {
            activateTab($savedTab);
          }
        }
        $tabs.forEach(($tab, index) => {
          $tab.addEventListener("keydown", (ev) => {
            let newIndex;
            if (ev.key === "ArrowRight") {
              newIndex = (index + 1) % $tabs.length;
              $tabs[newIndex].focus();
            } else if (ev.key === "ArrowLeft") {
              newIndex = (index - 1 + $tabs.length) % $tabs.length;
              $tabs[newIndex].focus();
            }
          });
          $tab.addEventListener("click", (ev) => {
            ev.preventDefault();
            activateTab($tab);
            localStorage.setItem(storageKey, $tab.getAttribute("href"));
          });
        });
        function activateTab(selectedTab) {
          $tabs.forEach(($tab) => {
            $tab.setAttribute("aria-selected", "false");
            $tab.parentElement.classList.remove("is:active");
          });
          $panels.forEach(($panel) => {
            $panel.classList.remove("is:active");
            $panel.setAttribute("hidden", "");
            const overflowContainer = $panel.closest(".overflow");
            if (!overflowContainer) return;
            overflowContainer.scrollTop = 0;
          });
          selectedTab.setAttribute("aria-selected", "true");
          selectedTab.parentElement.classList.add("is:active");
          const $targetPanel = document.querySelector(selectedTab.getAttribute("href"));
          $targetPanel.classList.add("is:active");
          $targetPanel.removeAttribute("hidden");
        }
      });
    }
    const hoverActivation = true;
    let hoverModeActive = false;
    if ($toggles.length > 0) {
      let closeAllDropdowns2 = function() {
        $toggles.forEach(($toggle) => {
          const id = $toggle.getAttribute("aria-controls");
          const dd = document.getElementById(id);
          $toggle.setAttribute("aria-expanded", "false");
          dd.hidden = true;
        });
      };
      var closeAllDropdowns = closeAllDropdowns2;
      $toggles.forEach(($toggle) => {
        const dropdownId = $toggle.getAttribute("aria-controls");
        const dropdown = document.getElementById(dropdownId);
        $toggle.addEventListener("click", () => {
          const isOpen = $toggle.getAttribute("aria-expanded") === "true";
          closeAllDropdowns2();
          if (!isOpen) {
            $toggle.setAttribute("aria-expanded", "true");
            dropdown.hidden = false;
            if (hoverActivation) {
              hoverModeActive = true;
            }
          } else {
            hoverModeActive = false;
          }
        });
        $toggle.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            $toggle.click();
          } else if (ev.key === "Escape") {
            closeAllDropdowns2();
            $toggle.focus();
            hoverModeActive = false;
          }
        });
        dropdown.addEventListener("keydown", (ev) => {
          if (ev.key === "Escape") {
            $toggle.setAttribute("aria-expanded", "false");
            dropdown.hidden = true;
            $toggle.focus();
            hoverModeActive = false;
          }
        });
        $toggle.addEventListener("mouseenter", () => {
          const isOpen = $toggle.getAttribute("aria-expanded") === "true";
          if (hoverActivation && hoverModeActive && !isOpen) {
            closeAllDropdowns2();
            $toggle.setAttribute("aria-expanded", "true");
            dropdown.hidden = false;
          }
        });
      });
      document.addEventListener("click", (ev) => {
        if (!ev.target.closest(".filter")) {
          closeAllDropdowns2();
          hoverModeActive = false;
        }
      });
    }
    if ($trees.length > 0) {
      $trees.forEach(($tree) => {
        const treeId = $tree.getAttribute("data-tree-uid") || "default";
        const stateKey = `tree-nav-state:${treeId}`;
        let savedState = JSON.parse(localStorage.getItem(stateKey) || "{}");
        for (const [id, isOpen] of Object.entries(savedState)) {
          const $li = $tree.querySelector(`li[data-id="${id}"]`);
          if ($li && isOpen) $li.classList.add("open");
        }
        $tree.addEventListener("click", (ev) => {
          const toggle = ev.target.closest("button.tree-nav__toggle");
          const link = ev.target.closest("a");
          if (!toggle && !link) return;
          const li = ev.target.closest("li[data-id]");
          if (toggle) {
            const id = li?.dataset.id;
            if (!id) return;
            li.classList.toggle("open");
            savedState[id] = li.classList.contains("open");
          }
          if (link) {
            const id = li?.dataset.id;
            if (!id) return;
            savedState[id] = li;
          }
          localStorage.setItem(stateKey, JSON.stringify(savedState));
        });
      });
    }
    if ($tables.length > 0) {
      $tables.forEach(($table) => {
        const $rows = $table.querySelectorAll("tbody tr");
        if ($rows) {
          $rows.forEach(($row) => {
            $row.addEventListener("click", () => {
              $row.classList.toggle("is:selected");
            });
            $row.addEventListener("dblclick", () => {
              const $link = $row.querySelector("a");
              const url = $link.getAttribute("href");
              if (url) {
                window.location.href = url;
              }
            });
          });
        }
      });
    }
    $toggleSplits.forEach(($el) => {
      $el.addEventListener("click", (ev) => {
        const className = `has:toggled-sidebar-split`;
        ev.preventDefault();
        $ui.classList.toggle(className);
      });
    });
    if ($splitSwitch && $main) {
      $splitSwitch.addEventListener("click", (ev) => {
        ev.preventDefault();
        $ui.classList.add("has:resizing");
        $ui.classList.toggle("has:split-vertical");
        const state = getChromeState();
        state.splitSwitch = $ui.classList.contains("has:split-vertical");
        setChromeState(state);
        setTimeout(() => {
          $ui.classList.remove("has:resizing");
        }, 0);
      });
    }
    let resizeTimeout;
    window.addEventListener("resize", () => {
      $ui.classList.add("is:resizing");
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        $ui.classList.remove("is:resizing");
      }, 500);
    });
    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isFindShortcut = isMac && e.metaKey && e.key === "f" || !isMac && e.ctrlKey && e.key === "f";
      if (!isFindShortcut) return;
      const active = document.activeElement;
      const isFormField = active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable;
      if (!isFormField) {
        e.preventDefault();
        const $searchInput = document.querySelector("[data-search-input]");
        if ($searchInput) {
          $searchInput.focus();
          $searchInput.select();
        }
      }
    });
  })();
})();
