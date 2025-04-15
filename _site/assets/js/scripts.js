(() => {
  // src/assets/scripts/main.js
  (() => {
    const $ui = document.querySelector("[data-uikit]");
    const $leftSidebar = document.querySelector(".navigation-wrapper");
    const $trees = document.querySelectorAll(".tree-nav");
    const $splitSwitch = document.querySelector("[data-table-switch]");
    const $main = document.querySelector(".main");
    const $toggleSplits = document.querySelectorAll("[data-toggle-split]");
    const $tables = document.querySelectorAll("[data-table]");
    const $toggles = document.querySelectorAll(".filter-toggle");
    $ui.classList.add("is:initializing");
    setTimeout(() => {
      $ui.classList.remove("is:initializing");
    }, 500);
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
    function setToggleStorage(type) {
      if (isMobile()) {
        return;
      }
      localStorage.setItem(`sidebarToggle-${type}`, true);
    }
    function initResizing($resizer) {
      let startX, startY, startWidth, minWidth, maxWidth, startHeight, minHeight, maxHeight, resizeDirection, isResizing = false;
      const sidebarType = $resizer.getAttribute("data-sidebar-resizer");
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
      function onMouseMove(e2, $sidebar) {
        if (!resizeDirection || !isResizing) return;
        let newWidth;
        let newHeight;
        if (resizeDirection === "horizontal") {
          if (sidebarType === "left") {
            newWidth = startWidth + (e2.clientX - startX);
          } else {
            newWidth = startWidth - (e2.clientX - startX);
          }
          if ($ui.classList.contains(className) && newWidth > minWidth) {
            setWidth(newWidth, sidebarType);
            if (sidebarType === "left") {
              $ui.classList.remove(className);
              localStorage.removeItem(`sidebarToggle-${sidebarType}`);
            }
          } else if (newWidth > minWidth && newWidth < maxWidth) {
            setWidth(newWidth, sidebarType);
          }
        }
        if (resizeDirection === "vertical") {
          newHeight = startHeight - (e2.clientY - startY);
          if ($ui.classList.contains(className) && newHeight > minHeight) {
            setHeight(newHeight, sidebarType);
            if (sidebarType === "left") {
              $ui.classList.remove(className);
              localStorage.removeItem(`sidebarToggle-${sidebarType}`);
            }
          } else if (newHeight > minHeight && newHeight < maxHeight) {
            setHeight(newHeight, sidebarType);
          }
        }
      }
      function onMouseUp(e2, $sidebar) {
        isResizing = false;
        resizeDirection = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        $ui.classList.remove("has:resizing");
        $sidebar.removeAttribute("data-resizing");
        if (!$ui.classList.contains(className) && sidebarType !== "right" || sidebarType === "right" && $ui.classList.contains(className)) {
          localStorage.setItem(`sidebarWidth-${sidebarType}`, $sidebar.offsetWidth);
        }
        if (!$ui.classList.contains(className)) {
          localStorage.setItem(`sidebarHeight-${sidebarType}`, $sidebar.offsetHeight);
        }
        if (!$ui.classList.contains(className)) {
          localStorage.removeItem(`sidebarToggle-${sidebarType}`);
        }
      }
      function getWidthValueInPixels($sidebar, type) {
        const val = getComputedStyle($sidebar).getPropertyValue(type);
        return val.includes("%") ? parseFloat(val) / 100 * $sidebar.parentElement.getBoundingClientRect().width : parseFloat(val);
      }
      function initResize(e2, direction) {
        const $sidebar = e2.target.closest("[data-sidebar]");
        $sidebar.setAttribute("data-resizing", direction);
        e2.preventDefault();
        isResizing = true;
        resizeDirection = direction;
        startX = e2.clientX;
        startY = e2.clientY;
        startWidth = $sidebar.offsetWidth;
        startHeight = $sidebar.offsetHeight;
        maxHeight = getWidthValueInPixels($sidebar, "max-height");
        minHeight = getWidthValueInPixels($sidebar, "min-height");
        maxWidth = getWidthValueInPixels($sidebar, "max-width");
        minWidth = getWidthValueInPixels($sidebar, "min-width");
        $ui.classList.add("has:resizing");
        document.addEventListener("mousemove", (ev) => onMouseMove(ev, $sidebar));
        document.addEventListener("mouseup", (ev) => onMouseUp(ev, $sidebar));
      }
      $resizer.addEventListener("mousedown", (ev) => {
        const rect = $resizer.getBoundingClientRect();
        const direction = rect.height > rect.width ? "horizontal" : "vertical";
        initResize(ev, direction);
      });
      $resizer.addEventListener("dblclick", () => {
        resetWidth(sidebarType);
        resetHeight(sidebarType);
        localStorage.removeItem(`sidebarWidth-${sidebarType}`);
        localStorage.removeItem(`sidebarHeight-${sidebarType}`);
      });
    }
    ["left", "right", "component", "split"].forEach((side) => {
      const $el = document.querySelector(`[data-sidebar-resizer="${side}"]`);
      if ($el) {
        initResizing($el);
      }
    });
    document.querySelectorAll("[data-sidebar-toggle]").forEach(($el) => {
      $el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const direction = $el.getAttribute("data-sidebar-toggle");
        $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
        if ($ui.classList.contains(`has:toggled-sidebar-${direction}`)) {
          setToggleStorage(direction);
        } else {
          localStorage.removeItem(`sidebarToggle-${direction}`);
        }
      });
    });
    if ($leftSidebar) {
      $leftSidebar.addEventListener("click", (ev) => {
        if (isMobile() && !ev.target.closest(".navigation--persistent")) {
          $ui.classList.add("has:toggled-sidebar-left");
        }
      });
    }
    const searchToggle = document.querySelector("[data-toggle-search]");
    if (searchToggle) {
      searchToggle.addEventListener("click", (ev) => {
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
    const rightSidebarTypeToggleFloat = document.querySelector('[data-sidebar-type="float"]');
    document.querySelectorAll("[data-sidebar-type-toggle]").forEach(($el) => {
      $el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const sidebar = $el.closest("[data-sidebar]");
        const type = $el.getAttribute("data-sidebar-type-toggle");
        sidebar.setAttribute("data-sidebar-type", type);
      });
    });
    const profileToggle = document.querySelector("[data-toggle-profile]");
    if (profileToggle) {
      profileToggle.addEventListener("click", (ev) => {
        ev.preventDefault();
        $ui.classList.toggle("has:toggled-profile");
      });
    }
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        if ($ui.classList.contains("has:toggled-search")) {
          $ui.classList.remove("has:toggled-search");
          const $searchToggle = document.querySelector("[data-toggle-search]");
          if ($searchToggle) {
            $searchToggle.focus();
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
      const $searchWrapper = document.querySelector(".search-wrapper");
      const $searchToggle = document.querySelector("[data-toggle-search]");
      if ($ui.classList.contains("has:toggled-search") && !$searchWrapper.contains(e.target) && !$searchToggle.contains(e.target)) {
        $ui.classList.remove("has:toggled-search");
      }
    });
    const tabList = document.querySelector(".sidebar__tabs ul");
    if (tabList) {
      let activateTab2 = function(selectedTab) {
        tabs.forEach(($tab) => {
          $tab.setAttribute("aria-selected", "false");
          $tab.parentElement.classList.remove("is:active");
        });
        panels.forEach(($panel) => {
          $panel.classList.remove("is:active");
          $panel.setAttribute("hidden", "");
          const overflowContainer = $panel.closest(".overflow");
          if (!overflowContainer) return;
          overflowContainer.scrollTop = 0;
        });
        selectedTab.setAttribute("aria-selected", "true");
        selectedTab.parentElement.classList.add("is:active");
        const targetPanel = document.querySelector(selectedTab.getAttribute("href"));
        targetPanel.classList.add("is:active");
        targetPanel.removeAttribute("hidden");
      };
      var activateTab = activateTab2;
      const tabs = tabList.querySelectorAll('[role="tab"]');
      const panels = document.querySelectorAll(".tab-content");
      const pageId = document.body.id;
      const storageKey = `activeTab-${pageId}`;
      const savedTabId = localStorage.getItem(storageKey);
      if (savedTabId) {
        const savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
        if (savedTab) {
          activateTab2(savedTab);
        }
      }
      tabs.forEach(($tab, index) => {
        $tab.addEventListener("keydown", (ev) => {
          let newIndex;
          if (ev.key === "ArrowRight") {
            newIndex = (index + 1) % tabs.length;
            tabs[newIndex].focus();
          } else if (ev.key === "ArrowLeft") {
            newIndex = (index - 1 + tabs.length) % tabs.length;
            tabs[newIndex].focus();
          }
        });
        $tab.addEventListener("click", (ev) => {
          ev.preventDefault();
          activateTab2($tab);
          localStorage.setItem(storageKey, $tab.getAttribute("href"));
        });
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
          if (ev.key === "Enter" || e.key === " ") {
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
          const li = $tree.querySelector(`li[data-id="${id}"]`);
          if (li && isOpen) li.classList.add("open");
        }
        $tree.addEventListener("click", (ev) => {
          const toggle = ev.target.closest("button.tree-nav__toggle");
          const link = ev.target.closest("a");
          if (!toggle && !link) return;
          const li = e.target.closest("li[data-id]");
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
        const rows = $table.querySelectorAll("tbody tr");
        if (rows) {
          rows.forEach(($row) => {
            $row.addEventListener("click", () => {
              $row.classList.toggle("is:selected");
            });
            $row.addEventListener("dblclick", () => {
              const link = $row.querySelector("a");
              const url = link.getAttribute("href");
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
        $main.classList.toggle("main--stack");
        $splitSwitch.classList.toggle("is:stack");
        if ($main.classList.contains("main--stack")) {
          localStorage.setItem("splitSwitch", "true");
        } else {
          localStorage.removeItem("splitSwitch");
        }
        setTimeout(() => {
          $ui.classList.remove("has:resizing");
        }, 0);
      });
      if (localStorage.getItem("splitSwitch")) {
        $main.classList.add("main--stack");
        $splitSwitch.classList.add("is:stack");
      }
    }
    let resizeTimeout;
    window.addEventListener("resize", () => {
      $ui.classList.add("is:resizing");
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        $ui.classList.remove("is:resizing");
      }, 500);
    });
  })();
})();
