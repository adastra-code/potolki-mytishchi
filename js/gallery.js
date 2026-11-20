(() => {
  "use strict";

  const grid = document.getElementById("photoGrid");
  const box = document.getElementById("lightbox");
  if (!grid || !box) return;

  const shots = Array.from(grid.querySelectorAll(".shot"));
  const image = document.getElementById("lightboxImage");
  const counter = document.getElementById("lightboxCounter");
  const title = document.getElementById("lightboxTitle");
  const closeBtn = box.querySelector(".lightbox__close");
  const prevBtn = box.querySelector(".lightbox__arrow--prev");
  const nextBtn = box.querySelector(".lightbox__arrow--next");
  const total = shots.length;

  let current = 0;
  let lastTrigger = null;

  const preload = (i) => {
    const shot = shots[(i + total) % total];
    if (!shot) return;
    const img = new Image();
    img.src = shot.dataset.full;
  };

  const render = (i) => {
    current = (i + total) % total;
    const shot = shots[current];
    const thumb = shot.querySelector("img");

    image.src = shot.dataset.full;
    image.alt = thumb ? thumb.alt : `Фото ${current + 1}`;
    counter.textContent = `${current + 1} / ${total}`;
    if (title) title.textContent = shot.dataset.title || "Натяжные потолки, Мытищи";
    box.setAttribute("aria-label", `Просмотр фото ${current + 1} из ${total}`);

    preload(current + 1);
    preload(current - 1);
  };

  const open = (i, trigger) => {
    lastTrigger = trigger || null;
    render(i);
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

  shots.forEach((shot, i) => {
    shot.addEventListener("click", (event) => {
      event.preventDefault();
      open(i, shot);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => render(current - 1));
  nextBtn.addEventListener("click", () => render(current + 1));

  box.addEventListener("click", (event) => {
    if (event.target === box) close();
  });

  document.addEventListener("keydown", (event) => {
    if (box.hidden) return;
    if (event.key === "Escape") {
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
