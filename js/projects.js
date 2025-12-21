// Projects gallery interactions
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".projects-tabs .tab");
  const tabsContainer = document.querySelector(".projects-tabs");
  const items = Array.from(document.querySelectorAll(".project-item"));
  const moreBtn = document.querySelector(".btn-more");
  const viewer = document.querySelector(".project-viewer");
  const viewerImg = viewer.querySelector(".viewer-media img");
  const viewerPrev = viewer.querySelector(".viewer-nav--prev");
  const viewerNext = viewer.querySelector(".viewer-nav--next");
  const viewerClose = viewer.querySelector(".viewer-close");
  const viewerDemoLink = viewer.querySelector(".viewer-demo");

  // per-project gallery state
  let galleryImages = [];
  let galleryIndex = 0;

  function showGalleryImage(idx) {
    if (!galleryImages || !galleryImages.length) return;
    // wrap index
    galleryIndex =
      ((idx % galleryImages.length) + galleryImages.length) %
      galleryImages.length;
    const src = galleryImages[galleryIndex] || "";
    viewerImg.src = src;
    // update alt text if available
    const alt = viewer.querySelector(".viewer-title")?.textContent || "";
    viewerImg.alt = alt;
    // hide nav if only one image
    if (galleryImages.length <= 1) {
      if (viewerPrev) viewerPrev.style.display = "none";
      if (viewerNext) viewerNext.style.display = "none";
    } else {
      if (viewerPrev) viewerPrev.style.display = "flex";
      if (viewerNext) viewerNext.style.display = "flex";
    }
  }

  function nextGallery() {
    showGalleryImage(galleryIndex + 1);
  }

  function prevGallery() {
    showGalleryImage(galleryIndex - 1);
  }

  // Ensure the Open Project anchor reliably opens the URL when enabled.
  // If it's disabled (aria-disabled or .disabled), prevent navigation.
  if (viewerDemoLink) {
    viewerDemoLink.addEventListener("click", function (e) {
      const isDisabled =
        this.getAttribute("aria-disabled") === "true" ||
        this.classList.contains("disabled");
      const href = this.getAttribute("href") || "";
      if (isDisabled || !href || href === "#") {
        e.preventDefault();
        return;
      }
      // Prevent default anchor navigation and open explicitly in a new tab
      // (some browsers can be inconsistent when hrefs are changed dynamically)
      e.preventDefault();
      try {
        window.open(href, "_blank", "noopener");
      } catch (err) {
        // fallback to normal navigation if window.open fails
        window.location.href = href;
      }
    });
  }

  let activeFilter = "all";
  let showingAll = false;

  // create sliding indicator element
  let indicator = null;
  if (tabsContainer) {
    indicator = document.createElement("div");
    indicator.className = "tab-indicator";
    tabsContainer.appendChild(indicator);
  }

  function filterItems() {
    const visible = items.filter((i) => {
      const cat = i.dataset.category;
      return activeFilter === "all" || activeFilter === cat;
    });

    // hide all first
    items.forEach((i) => i.classList.add("hidden"));

    // determine how many to show: desktop/tablet -> 6 (3x2), phones -> 2
    const isPhone = window.matchMedia("(max-width: 600px)").matches;
    const limit = isPhone ? 2 : 6;
    const toShow = showingAll ? visible : visible.slice(0, limit);
    toShow.forEach((i) => i.classList.remove("hidden"));

    // Update More button visibility
    if (visible.length > limit) {
      // show interactive More / Show less
      moreBtn.style.display = "inline-block";
      moreBtn.disabled = false;
      moreBtn.classList.remove("message");
      moreBtn.textContent = showingAll ? "Show less" : "See more";
    } else {
      // no extra items beyond the visible ones — show message in place of button
      moreBtn.style.display = "inline-block";
      moreBtn.disabled = true;
      moreBtn.classList.add("message");
      moreBtn.textContent = "AND MANY MORE TO COME!";
    }
    // animate visible (toShow) project tiles with a small stagger
    animateVisibleProjects(toShow);
    // fade-up reveal for the More band after tiles finish their stagger
    const moreWrap = document.querySelector(".more-wrap");
    if (moreWrap) {
      moreWrap.classList.add("fade-up");
      // wait until project tile stagger completes (80ms per tile) then reveal
      const revealDelay = Math.max(120, (toShow.length || 0) * 80 + 40);
      setTimeout(() => {
        moreWrap.classList.add("in-view");
      }, revealDelay);
    }
  }

  // animate an array of visible project nodes with a staggered fade-in
  function animateVisibleProjects(list) {
    if (!list || !list.length) return;
    // ensure all visible nodes have the fade-in class
    list.forEach((node) => {
      node.classList.add("fade-in");
      node.classList.remove("in-view");
    });
    // stagger reveal
    list.forEach((node, idx) => {
      const delay = idx * 120; // 80ms stagger
      setTimeout(() => {
        node.classList.add("in-view");
      }, delay);
    });
  }

  // tab click
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      showingAll = false;
      filterItems();
      // move indicator to the clicked tab
      updateIndicator();
    });
  });

  // More button
  moreBtn.addEventListener("click", () => {
    showingAll = !showingAll;
    filterItems();
  });

  // Open viewer on image click
  items.forEach((item) => {
    const btn = item.querySelector(".project-thumb");
    btn.addEventListener("click", () => {
      const img = item.querySelector("img");
      // build gallery for this project: prefer `data-images` (comma-separated URLs), fall back to [main image, placeholder]
      const dataImgs = (item.dataset.images || "").trim();
      if (dataImgs) {
        galleryImages = dataImgs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        // default: use the project's main image and a placeholder additional image
        galleryImages = [img.src, "images/project 2.jpg"];
      }
      // ensure unique and non-empty
      galleryImages = galleryImages.filter(Boolean);
      // prepare gallery index (first image will be shown after details are populated)
      galleryIndex = 0;
      // populate viewer details (title, description, demo link)
      const titleEl = viewer.querySelector(".viewer-title");
      const descEl = viewer.querySelector(".viewer-desc");
      const bulletsUl = viewer.querySelector(".viewer-bullets");
      const tagsContainer = viewer.querySelector(".viewer-tags");
      const demoLink = viewer.querySelector(".viewer-demo");
      // Prefer data attributes; fall back to project-meta text for title
      titleEl.textContent =
        item.dataset.title ||
        item.querySelector(".project-meta")?.textContent ||
        "";

      // Populate bullets list: prefer `data-bullets` (delimiter '||'), fallback to `data-desc` plain text
      if (bulletsUl) {
        bulletsUl.innerHTML = "";
        const raw = (item.dataset.bullets || "").trim();
        if (raw) {
          raw
            .split("||")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((text) => {
              const li = document.createElement("li");
              li.textContent = text;
              bulletsUl.appendChild(li);
            });
        } else if (item.dataset.desc && item.dataset.desc.trim()) {
          const li = document.createElement("li");
          li.textContent = item.dataset.desc.trim();
          bulletsUl.appendChild(li);
        }
      }

      // Populate tag chips (data-tags comma-separated)
      if (tagsContainer) {
        tagsContainer.innerHTML = "";
        const rawTags = (item.dataset.tags || "").trim();
        if (rawTags) {
          rawTags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((t) => {
              const span = document.createElement("span");
              span.className = "viewer-tag";
              span.textContent = t;
              tagsContainer.appendChild(span);
            });
        }
      }
      // Always show the Demo button. If no valid demo URL provided, mark as disabled
      demoLink.style.display = "inline-block";
      if (item.dataset.demo && item.dataset.demo !== "#") {
        demoLink.href = item.dataset.demo;
        demoLink.setAttribute("target", "_blank");
        demoLink.setAttribute("rel", "noopener noreferrer");
        demoLink.removeAttribute("aria-disabled");
        demoLink.classList.remove("disabled");
      } else {
        // placeholder state: visible but disabled so you can set the link in HTML later
        demoLink.href = "#";
        demoLink.removeAttribute("target");
        demoLink.removeAttribute("rel");
        demoLink.setAttribute("aria-disabled", "true");
        demoLink.classList.add("disabled");
      }
      // now show the first image so alt text reflects the title
      showGalleryImage(0);
      // show viewer
      viewer.setAttribute("aria-hidden", "false");
      viewer.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  // nav button handlers
  if (viewerNext)
    viewerNext.addEventListener("click", (e) => {
      e.stopPropagation();
      nextGallery();
    });
  if (viewerPrev)
    viewerPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prevGallery();
    });

  // keyboard navigation while viewer open
  function onViewerKey(e) {
    if (!viewer.classList.contains("open")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextGallery();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevGallery();
    } else if (e.key === "Escape") {
      // close viewer (re-use existing close handler)
      closeViewer();
    }
  }
  document.addEventListener("keydown", onViewerKey);

  // Close viewer
  viewerClose.addEventListener("click", () => closeViewer());
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) closeViewer();
  });

  function closeViewer() {
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    // remove image-only mode when closing so next open uses correct layout
    viewer.classList.remove("image-only");
    document.body.style.overflow = "";
  }

  // initialize
  filterItems();
  // position indicator on load (after layout) using rAF
  requestAnimationFrame(() => updateIndicator());
  // Recompute visible items on resize (keeps mobile limit accurate)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      filterItems();
      updateIndicator();
    }, 150);
  });

  // also update when fonts/images finish loading that may shift layout
  window.addEventListener("load", () => {
    requestAnimationFrame(() => updateIndicator());
  });

  function updateIndicator() {
    if (!indicator || !tabsContainer) return;
    const active =
      tabsContainer.querySelector(".tab.active") ||
      tabsContainer.querySelector(".tab");
    if (!active) return;
    // compute center-based left using fixed indicator width so size is same across tabs
    const containerRect = tabsContainer.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const indicatorWidth = window.matchMedia("(max-width:600px)").matches
      ? 80
      : 120; // responsive indicator width
    const activeCenter =
      activeRect.left - containerRect.left + activeRect.width / 2;
    let left = Math.round(activeCenter - indicatorWidth / 2);
    // clamp indicator so it stays within the track/container
    const maxLeft = Math.max(
      0,
      Math.round(containerRect.width - indicatorWidth)
    );
    if (left < 0) left = 0;
    if (left > maxLeft) left = maxLeft;
    indicator.style.width = indicatorWidth + "px";
    indicator.style.left = left + "px";
  }

  // reposition indicator when the tabs wrapper scrolls (horizontal scroll on small screens)
  const tabsWrap = document.querySelector(".tabs-wrap");
  if (tabsWrap) {
    tabsWrap.addEventListener("scroll", () => {
      // small debounce
      window.requestAnimationFrame(() => updateIndicator());
    });
  }

  /* Achievements / Certifications carousel + controls */
  function initAchievementsCarousel() {
    const wrappers = Array.from(
      document.querySelectorAll(".achievements-wrapper")
    );
    wrappers.forEach((wrap) => {
      const grid = wrap.querySelector(".achievements-grid");
      const leftBtn = wrap.querySelector(".left-btn");
      const rightBtn = wrap.querySelector(".right-btn");
      if (!grid) return;

      // Show/hide edge buttons when hovering edge cards
      const cards = Array.from(grid.querySelectorAll(".achievement-card"));
      if (cards.length) {
        const first = cards[0];
        const last = cards[cards.length - 1];
        first.addEventListener("mouseenter", () => {
          if (leftBtn) leftBtn.style.opacity = 1;
        });
        first.addEventListener("mouseleave", () => {
          if (leftBtn) leftBtn.style.opacity = 0;
        });
        last.addEventListener("mouseenter", () => {
          if (rightBtn) rightBtn.style.opacity = 1;
        });
        last.addEventListener("mouseleave", () => {
          if (rightBtn) rightBtn.style.opacity = 0;
        });
      }

      // On non-phone view, show controls when hovering the wrapper (easier access)
      // Mobile keeps the existing behavior (buttons hidden via CSS)
      const isPhone = window.matchMedia("(max-width:600px)").matches;
      if (!isPhone) {
        wrap.addEventListener("mouseenter", () => {
          if (leftBtn) leftBtn.style.opacity = 1;
          if (rightBtn) rightBtn.style.opacity = 1;
        });
        wrap.addEventListener("mouseleave", () => {
          if (leftBtn) leftBtn.style.opacity = 0;
          if (rightBtn) rightBtn.style.opacity = 0;
        });
      }

      // Clicking controls scrolls the grid by one card width
      function scrollByOffset(offset) {
        if (!grid) return;
        const rect = grid.getBoundingClientRect();
        const card = grid.querySelector(".achievement-card");
        const step = card
          ? card.getBoundingClientRect().width + 18
          : rect.width * 0.8;
        grid.scrollBy({ left: offset * step, behavior: "smooth" });
      }
      if (leftBtn) leftBtn.addEventListener("click", () => scrollByOffset(-1));
      if (rightBtn) rightBtn.addEventListener("click", () => scrollByOffset(1));

      // Touch swipe for mobile
      let startX = 0;
      let currentX = 0;
      let isTouch = false;
      grid.addEventListener(
        "touchstart",
        (e) => {
          isTouch = true;
          startX = e.touches[0].clientX;
        },
        { passive: true }
      );
      grid.addEventListener(
        "touchmove",
        (e) => {
          if (!isTouch) return;
          currentX = e.touches[0].clientX;
        },
        { passive: true }
      );
      grid.addEventListener("touchend", () => {
        if (!isTouch) return;
        const delta = startX - currentX;
        if (Math.abs(delta) > 40) {
          // swipe left -> next (positive delta), swipe right -> prev
          scrollByOffset(delta > 0 ? 1 : -1);
        }
        isTouch = false;
        startX = currentX = 0;
      });

      // Show carousel controls when grid is scrollable and update based on scroll edges
      function updateCarouselControls() {
        if (!grid) return;
        const scrollable = grid.scrollWidth > grid.clientWidth + 1;
        if (!scrollable) {
          if (leftBtn) leftBtn.style.display = "none";
          if (rightBtn) rightBtn.style.display = "none";
          return;
        }
        // ensure buttons are visible (use display so CSS hover still applies)
        if (leftBtn) leftBtn.style.display = "flex";
        if (rightBtn) rightBtn.style.display = "flex";

        const atLeft = grid.scrollLeft <= 4;
        const atRight =
          grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 4;

        if (leftBtn) {
          leftBtn.style.opacity = atLeft ? 0 : 1;
          leftBtn.disabled = atLeft;
          leftBtn.style.pointerEvents = atLeft ? "none" : "auto";
        }
        if (rightBtn) {
          rightBtn.style.opacity = atRight ? 0 : 1;
          rightBtn.disabled = atRight;
          rightBtn.style.pointerEvents = atRight ? "none" : "auto";
        }
      }

      // initial update and on scroll/resize
      updateCarouselControls();
      grid.addEventListener("scroll", () => {
        // throttle with rAF for smoothness
        window.requestAnimationFrame(() => updateCarouselControls());
      });
      let carouselResizeTimer = null;
      window.addEventListener("resize", () => {
        clearTimeout(carouselResizeTimer);
        carouselResizeTimer = setTimeout(() => updateCarouselControls(), 120);
      });

      // Re-check after images inside the grid finish loading (images can change scrollWidth)
      const imgs = Array.from(grid.querySelectorAll("img"));
      if (imgs.length) {
        imgs.forEach((img) => {
          if (img.complete) return;
          img.addEventListener("load", () => {
            // allow layout to settle
            setTimeout(() => updateCarouselControls(), 60);
          });
        });
      }

      // Ensure controls are correct after the full page load as a fallback
      window.addEventListener("load", () => {
        setTimeout(() => updateCarouselControls(), 80);
      });
    });
  }
  // init after DOM ready
  initAchievementsCarousel();

  // Reveal achievements / certifications titles and grids when scrolled into view
  function initAchievementsReveal() {
    const titles = Array.from(
      document.querySelectorAll(".achievements-title.fade-down")
    );
    const grids = Array.from(
      document.querySelectorAll(
        ".achievements-grid.fade-right, .achievements-grid.fade-left"
      )
    );

    if (!titles.length && !grids.length) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            // once animated, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    titles.forEach((el) => obs.observe(el));
    grids.forEach((el) => obs.observe(el));
  }
  initAchievementsReveal();

  // Reveal contact title, subtext, and form when scrolled into view
  function initContactReveal() {
    const title = document.querySelector(
      ".contact-section .achievements-title--hero.fade-down"
    );
    const sub = document.querySelector(".contact-subtext.fade-left");
    const form = document.querySelector(".contact-form.fade-right");

    const nodes = [title, sub, form].filter(Boolean);
    if (!nodes.length) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    nodes.forEach((n) => {
      // ensure the node has its base fade- class (already applied in HTML)
      obs.observe(n);
    });
  }
  initContactReveal();

  // Reveal footer with fade-up and cascade footer social links
  (function initFooterReveal() {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    // ensure base state: make footer ready for fade-up reveal
    if (!footer.classList.contains("fade-up")) footer.classList.add("fade-up");
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            // also add a convenience class so CSS can target cascade
            entry.target.classList.add("observed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    obs.observe(footer);
  })();

  // Make achievement & certification cards clickable to open in dedicated cert viewer
  (function initCardImageViewer() {
    const cards = Array.from(document.querySelectorAll(".achievement-card"));
    const certViewer = document.querySelector(".cert-viewer");
    const certViewerImg = certViewer.querySelector(".cert-viewer-content img");
    const certViewerClose = certViewer.querySelector(".cert-viewer-close");
    const certViewerOverlay = certViewer.querySelector(".cert-viewer-overlay");

    if (!cards.length || !certViewer) return;

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        // ignore clicks on inner buttons/controls
        if (
          e.target &&
          (e.target.tagName === "BUTTON" || e.target.closest("button"))
        ) {
          return;
        }

        const imgEl = card.querySelector(".card-media img");
        if (!imgEl) return;

        // set the image source
        certViewerImg.src = imgEl.src;
        certViewerImg.alt = card.dataset.title || imgEl.alt || "";

        // show viewer
        certViewer.classList.add("open");
        certViewer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    // Close viewer function
    function closeCertViewer() {
      certViewer.classList.remove("open");
      certViewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    // Close button
    certViewerClose.addEventListener("click", closeCertViewer);

    // Close on overlay click
    certViewerOverlay.addEventListener("click", closeCertViewer);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && certViewer.classList.contains("open")) {
        closeCertViewer();
      }
    });
  })();

  // Fade-up reveal for Projects boxed title
  (function revealProjectsTitle() {
    const projectsTitle = document.querySelector(
      ".projects-section .skills-title--inverted"
    );
    if (!projectsTitle) return;
    // mark initial state
    projectsTitle.classList.add("fade-up");
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            projectsTitle.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    obs.observe(projectsTitle);
  })();

  // Cascade/stagger reveal for project tabs (fade-up each tab in sequence)
  (function cascadeProjectTabs() {
    const tabs = Array.from(document.querySelectorAll(".projects-tabs .tab"));
    const tabsTrack = document.querySelector(".tabs-wrap");
    if (!tabs.length || !tabsTrack) return;

    // mark initial state and set stagger delays
    tabs.forEach((tab, i) => {
      tab.classList.add("fade-up");
      // small stagger (80ms per item)
      tab.style.transitionDelay = i * 80 + "ms";
    });

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // trigger cascade: add in-view class to each tab (they will respect their delay)
            tabs.forEach((t) => t.classList.add("in-view"));
            // ensure indicator updates after cascade (allow a bit more time)
            setTimeout(() => updateIndicator(), tabs.length * 80 + 40);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    obs.observe(tabsTrack);
  })();

  /* Contact form submission handler (fetch to endpoint or mailto fallback) */
  (function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const statusEl = form.querySelector(".form-status");

    function setStatus(msg, ok = true) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.style.color = ok ? "#000" : "#c62828";
    }

    form.addEventListener("submit", async (e) => {
      // Determine action & method first
      const action = (
        form.getAttribute("action") ||
        form.dataset.endpoint ||
        ""
      ).trim();
      const method = (form.getAttribute("method") || "POST").toUpperCase();

      // Honeypot check: if filled, silently abort (likely bot)
      const honeypot = form.querySelector('input[name="hp"]');
      if (honeypot && honeypot.value && honeypot.value.trim() !== "") {
        // Let the submission die quietly
        return;
      }

      // If the action points to an Apps Script Web App, allow a native form POST
      // so the browser will navigate to the script's HTML response (avoids CORS).
      if (action && action.includes("script.google.com")) {
        // Do not prevent default — allow normal form submission
        return;
      }

      // Otherwise handle via AJAX (existing behavior)
      e.preventDefault();

      const data = {};
      new FormData(form).forEach((v, k) => (data[k] = v));

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        setStatus("Please fill name, email and message.", false);
        return;
      }

      setStatus("Sending...");

      // If action is a mailto: use fallback to open mail client
      if (action.startsWith("mailto:")) {
        const mailto = `${action}?subject=${encodeURIComponent(
          data.subject || "Message from website"
        )}&body=${encodeURIComponent(
          `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
        )}`;
        window.location.href = mailto;
        setStatus("Opened your mail client.");
        return;
      }

      // If no action defined, show instructions to set endpoint
      if (!action || action === "#") {
        setStatus(
          "No endpoint configured. Set the form `action` to a server URL or `mailto:`.",
          false
        );
        return;
      }

      // Attempt to POST JSON to the configured endpoint
      try {
        const res = await fetch(action, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          // Try to read JSON/text error when available
          let msg = `Error ${res.status}`;
          try {
            const json = await res.json();
            msg = json.message || JSON.stringify(json);
          } catch (_) {
            try {
              const text = await res.text();
              if (text) msg = text;
            } catch (__) {}
          }
          setStatus(`Failed to send: ${msg}`, false);
          return;
        }

        setStatus("Message sent — thank you!");
        form.reset();
      } catch (err) {
        setStatus("Network error — please try again later.", false);
        console.error(err);
      }
    });
  })();
});
