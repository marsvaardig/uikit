(() => {
  // src/assets/scripts/main.js
  (() => {
    const $ui = document.querySelector("[data-uikit]");
    $ui.classList.add("is:initializing");
    setTimeout(() => {
      $ui.classList.remove("is:initializing");
    }, 500);
    function isMobile() {
      return window.getComputedStyle($ui).getPropertyValue("--mv-mobile") === "1";
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
    function initResizing($resizer) {
      let startX, startY, startWidth, maxWidth, minWidth, resizeDirection, isResizing = false;
      const sidebarType = $resizer.getAttribute("data-sidebar-resizer");
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
        if (sidebarType === "left") {
          newWidth = startWidth + (e.clientX - startX);
        } else {
          newWidth = startWidth - (e.clientX - startX);
        }
        if ($ui.classList.contains(className) && newWidth > minWidth) {
          setWidth(newWidth, sidebarType);
          if (sidebarType === "left") {
            $ui.classList.remove(className);
            localStorage.removeItem(`sidebarToggle-${sidebarType}`);
          }
        } else if (newWidth > minWidth && newWidth < maxWidth) {
          setWidth(newWidth, sidebarType);
        } else if (newWidth < minWidth) {
          if (sidebarType === "left") {
            setWidth(startWidth, sidebarType);
            $ui.classList.add(className);
            setToggleStorage(sidebarType);
          }
        }
      }
      function onMouseUp(e, $sidebar) {
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
          localStorage.removeItem(`sidebarToggle-${sidebarType}`);
        }
      }
      function initResize(e, direction) {
        const $sidebar = e.target.closest("[data-sidebar]");
        $sidebar.setAttribute("data-resizing", direction);
        e.preventDefault();
        isResizing = true;
        resizeDirection = direction;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = $sidebar.offsetWidth;
        $ui.classList.add("has:resizing");
        maxWidth = parseInt(window.getComputedStyle($sidebar).getPropertyValue("max-width"));
        minWidth = parseInt(window.getComputedStyle($sidebar).getPropertyValue("min-width"));
        document.addEventListener("mousemove", (e2) => onMouseMove(e2, $sidebar));
        document.addEventListener("mouseup", (e2) => onMouseUp(e2, $sidebar));
      }
      $resizer.addEventListener("mousedown", (e) => initResize(e, "horizontal"));
      $resizer.addEventListener("dblclick", (e) => {
        const $sidebar = e.target.closest("[data-sidebar]");
        resetWidth(sidebarType);
        localStorage.removeItem(`sidebarWidth-${sidebarType}`);
      });
    }
    ["left", "right", "component"].forEach((side) => {
      const el = document.querySelector(`[data-sidebar-resizer="${side}"]`);
      if (el) {
        initResizing(el);
      }
    });
    document.querySelectorAll("[data-sidebar-toggle]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const direction = el.getAttribute("data-sidebar-toggle");
        $ui.classList.toggle(`has:toggled-sidebar-${direction}`);
        if ($ui.classList.contains(`has:toggled-sidebar-${direction}`)) {
          setToggleStorage(direction);
        } else {
          localStorage.removeItem(`sidebarToggle-${direction}`);
        }
      });
    });
    const searchToggle = document.querySelector("[data-toggle-search]");
    if (searchToggle) {
      searchToggle.addEventListener("click", (e) => {
        e.preventDefault();
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
    document.querySelectorAll("[data-sidebar-type-toggle]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const sidebar = el.closest("[data-sidebar]");
        const type = el.getAttribute("data-sidebar-type-toggle");
        sidebar.setAttribute("data-sidebar-type", type);
      });
    });
    const profileToggle = document.querySelector("[data-toggle-profile]");
    if (profileToggle) {
      profileToggle.addEventListener("click", (e) => {
        e.preventDefault();
        $ui.classList.toggle("has:toggled-profile");
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
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
    document.addEventListener("click", (e) => {
      const $profile = document.querySelector("[data-toggle-profile]");
      if ($ui.classList.contains("has:toggled-profile") && !$profile.contains(e.target)) {
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
        tabs.forEach((tab) => {
          tab.setAttribute("aria-selected", "false");
          tab.parentElement.classList.remove("is:active");
        });
        panels.forEach((panel) => {
          panel.classList.remove("is:active");
          panel.setAttribute("hidden", "");
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
      const pageId2 = document.body.id;
      const storageKey = `activeTab-${pageId2}`;
      const savedTabId = localStorage.getItem(storageKey);
      if (savedTabId) {
        const savedTab = document.querySelector(`[role="tab"][href="${savedTabId}"]`);
        if (savedTab) {
          activateTab2(savedTab);
        }
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener("keydown", (e) => {
          let newIndex;
          if (e.key === "ArrowRight") {
            newIndex = (index + 1) % tabs.length;
            tabs[newIndex].focus();
          } else if (e.key === "ArrowLeft") {
            newIndex = (index - 1 + tabs.length) % tabs.length;
            tabs[newIndex].focus();
          }
        });
        tab.addEventListener("click", (e) => {
          e.preventDefault();
          activateTab2(tab);
          localStorage.setItem(storageKey, tab.getAttribute("href"));
        });
      });
    }
    const toggles = document.querySelectorAll(".filter-toggle");
    const hoverActivation = true;
    let hoverModeActive = false;
    if (toggles.length > 0) {
      let closeAllDropdowns2 = function() {
        toggles.forEach((t) => {
          const id = t.getAttribute("aria-controls");
          const dd = document.getElementById(id);
          t.setAttribute("aria-expanded", "false");
          dd.hidden = true;
        });
      };
      var closeAllDropdowns = closeAllDropdowns2;
      toggles.forEach((toggle) => {
        const dropdownId = toggle.getAttribute("aria-controls");
        const dropdown = document.getElementById(dropdownId);
        toggle.addEventListener("click", () => {
          const isOpen = toggle.getAttribute("aria-expanded") === "true";
          closeAllDropdowns2();
          if (!isOpen) {
            toggle.setAttribute("aria-expanded", "true");
            dropdown.hidden = false;
            if (hoverActivation) {
              hoverModeActive = true;
            }
          } else {
            hoverModeActive = false;
          }
        });
        toggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle.click();
          } else if (e.key === "Escape") {
            closeAllDropdowns2();
            toggle.focus();
            hoverModeActive = false;
          }
        });
        dropdown.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            toggle.setAttribute("aria-expanded", "false");
            dropdown.hidden = true;
            toggle.focus();
            hoverModeActive = false;
          }
        });
        toggle.addEventListener("mouseenter", () => {
          const isOpen = toggle.getAttribute("aria-expanded") === "true";
          if (hoverActivation && hoverModeActive && !isOpen) {
            closeAllDropdowns2();
            toggle.setAttribute("aria-expanded", "true");
            dropdown.hidden = false;
          }
        });
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".filter")) {
          closeAllDropdowns2();
          hoverModeActive = false;
        }
      });
    }
    const tree = document.querySelector(".tree-nav");
    if (!tree) return;
    const pageId = document.body.id || "default";
    const stateKey = `tree-nav-state:${pageId}`;
    let savedState = JSON.parse(localStorage.getItem(stateKey) || "{}");
    for (const [id, isOpen] of Object.entries(savedState)) {
      const li = tree.querySelector(`li[data-id="${id}"]`);
      if (li && isOpen) li.classList.add("open");
    }
    tree.addEventListener("click", (e) => {
      const toggle = e.target.closest("button.toggle");
      if (!toggle) return;
      const li = toggle.closest("li[data-id]");
      const id = li?.dataset.id;
      if (!id) return;
      li.classList.toggle("open");
      savedState[id] = li.classList.contains("open");
      localStorage.setItem(stateKey, JSON.stringify(savedState));
    });
  })();
})();
