(() => {
  "use strict";

  const box = document.getElementById("lightbox");
  if (!box) return;

  const triggers = Array.from(document.querySelectorAll(".case-card__overlay--photo"));
  if (!triggers.length) return;

  const image = document.getElementById("lightboxImage");
  const counter = document.getElementById("lightboxCounter");
  const title = document.getElementById("lightboxTitle");
  const cta = document.getElementById("lightboxCta");
  const closeBtn = box.querySelector(".lightbox__close");
  const prevBtn = box.querySelector(".lightbox__arrow--prev");
  const nextBtn = box.querySelector(".lightbox__arrow--next");
  if (!image || !counter || !title) return;

  const items = triggers.map((trigger) => {
    const card = trigger.closest(".case-card");
    const img = card?.querySelector("img");
    const room = card?.querySelector(".case-card__room")?.textContent.trim() || "";
    const heading = card?.querySelector("h2")?.textContent.trim() || "Пример кейса";
    const cardCta = card?.querySelector(".case-card__cta")?.getAttribute("href") || "zapis.html";
    return {
      trigger,
      full: img?.getAttribute("src") || "",
      alt: img?.getAttribute("alt") || heading,
      label: [heading, room].filter(Boolean).join(" · "),
      cta: cardCta,
    };
  }).filter((item) => item.full);

  let current = 0;
  let lastTrigger = null;

  const preload = (index) => {
    const item = items[(index + items.length) % items.length];
    if (!item) return;
    const pre = new Image();
    pre.src = item.full;
  };

  const render = (index) => {
    current = ((index % items.length) + items.length) % items.length;
    const item = items[current];
    image.src = item.full;
    image.alt = item.alt;
    counter.textContent = `${current + 1} / ${items.length}`;
    title.textContent = item.label;
    if (cta) cta.href = item.cta;
    box.setAttribute("aria-label", `Просмотр фото ${current + 1} из ${items.length}`);
    preload(current + 1);
    preload(current - 1);
  };

  const open = (index, trigger) => {
    lastTrigger = trigger || null;
    render(index);
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

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => open(index, trigger));
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
