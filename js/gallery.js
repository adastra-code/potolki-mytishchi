(() => {
  "use strict";

  const grid = document.getElementById("photoGrid");
  const box = document.getElementById("lightbox");
  if (!grid || !box) return;

  const allShots = Array.from(grid.querySelectorAll(".shot"));
  let shots = allShots;
  let total = shots.length;
  const image = document.getElementById("lightboxImage");
  const counter = document.getElementById("lightboxCounter");
  const title = document.getElementById("lightboxTitle");
  const cta = document.getElementById("lightboxCta");
  const closeBtn = box.querySelector(".lightbox__close");
  const prevBtn = box.querySelector(".lightbox__arrow--prev");
  const nextBtn = box.querySelector(".lightbox__arrow--next");

  let current = 0;
  let lastTrigger = null;

  const refresh = () => {
    shots = allShots.filter((shot) => !shot.hidden);
    total = shots.length;
  };

  const preload = (i) => {
    if (!total) return;
    const shot = shots[(i + total) % total];
    if (!shot) return;
    const img = new Image();
    img.src = shot.dataset.full;
  };

  const render = (i) => {
    if (!total) return;
    current = ((i % total) + total) % total;
    const shot = shots[current];
    const thumb = shot.querySelector("img");

    image.src = shot.dataset.full;
    image.alt = thumb ? thumb.alt : `Фото ${current + 1}`;
    counter.textContent = `${current + 1} / ${total}`;
    if (title) title.textContent = shot.dataset.title || "Натяжные потолки, Мытищи";
    box.setAttribute("aria-label", `Просмотр фото ${current + 1} из ${total}`);

    if (cta) {
      const number = (shot.getAttribute("href") || "").match(/(\d+)\.jpg/)?.[1];
      cta.href = `index.html?photo=${Number(number) || current + 1}#contacts`;
    }

    preload(current + 1);
    preload(current - 1);
  };

  const open = (trigger) => {
    refresh();
    if (!total) return;
    lastTrigger = trigger || null;
    render(Math.max(0, shots.indexOf(trigger)));
    box.hidden = false;
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    closeBtn.focus({ preventScroll: true });
  };

  const close = () => {
    box.hidden = true;
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    image.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  };

  allShots.forEach((shot) => {
    shot.addEventListener("click", (event) => {
      event.preventDefault();
      open(shot);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => render(current - 1));
  nextBtn.addEventListener("click", () => render(current + 1));

  box.addEventListener("click", (event) => {
    if (event.target === box) close();
  });

  const focusables = () =>
    Array.from(box.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter((el) => el.offsetParent !== null);

  document.addEventListener("keydown", (event) => {
    if (box.hidden) return;
    if (event.key === "Tab") {
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      render(current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      render(current + 1);
    }
  });

  let touchX = null;
  box.addEventListener("touchstart", (event) => {
    touchX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  box.addEventListener("touchend", (event) => {
    if (touchX === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
    touchX = null;
    if (Math.abs(dx) < 45) return;
    render(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
