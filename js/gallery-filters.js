(() => {
  "use strict";

  const grid = document.getElementById("photoGrid");
  if (!grid) return;

  const TAGS = {
    "01": "matte hall",
    "02": "light living",
    "03": "matte living kitchen",
    "04": "light bath",
    "05": "gloss living",
    "06": "matte",
    "07": "light track hall",
    "08": "gloss bedroom",
    "09": "shadow detail",
    "10": "shadow detail",
    "11": "light living",
    "12": "matte",
    "13": "light hall",
    "14": "matte",
    "15": "matte",
    "16": "matte",
    "17": "multi living",
    "18": "light track",
    "19": "matte",
    "20": "light matte",
    "21": "matte bath",
    "22": "matte",
    "23": "light living",
    "24": "matte",
    "25": "light track",
    "26": "light hall",
    "27": "matte",
    "28": "multi",
    "29": "matte",
    "30": "light",
    "31": "matte",
    "32": "matte",
    "33": "matte bath",
    "34": "matte bath",
    "35": "matte bath",
    "36": "shadow detail",
    "37": "multi",
    "38": "matte",
    "39": "matte",
    "40": "shadow",
    "41": "matte",
    "42": "matte",
    "43": "matte",
    "44": "shadow",
    "45": "light track",
    "46": "matte",
    "47": "matte",
    "48": "matte",
    "49": "matte",
    "50": "light",
    "51": "matte bath",
    "52": "matte bedroom",
    "53": "matte bath",
    "54": "gloss bedroom",
    "55": "matte",
    "56": "matte",
    "57": "matte",
    "58": "gloss",
    "59": "light",
    "60": "matte bedroom classic",
    "61": "matte",
    "62": "matte",
    "63": "matte",
    "64": "matte",
    "65": "track office",
    "66": "track office",
    "67": "track office",
    "68": "other",
    "69": "other",
  };

  const shots = Array.from(grid.querySelectorAll(".shot"));
  const filters = Array.from(document.querySelectorAll(".filter"));
  const result = document.getElementById("galleryResult");
  const empty = document.getElementById("galleryEmpty");

  shots.forEach((shot) => {
    const match = (shot.getAttribute("href") || "").match(/(\d+)\.jpg/);
    const number = match ? match[1].padStart(2, "0") : "";
    shot.dataset.tags = TAGS[number] || "matte";
  });

  const tagsOf = (shot) => (shot.dataset.tags || "").split(/\s+/).filter(Boolean);
  const allowed = new Set(filters.map((button) => button.dataset.filter));

  const apply = (filter, updateUrl = true) => {
    let visible = 0;
    shots.forEach((shot) => {
      const show = filter === "all" || tagsOf(shot).includes(filter);
      shot.hidden = !show;
      if (show) visible += 1;
    });

    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (result) result.textContent = `Показано: ${visible} из ${shots.length}`;
    if (empty) empty.hidden = visible !== 0;

    if (updateUrl) {
      const url = filter === "all" ? location.pathname : `${location.pathname}?filter=${filter}`;
      history.replaceState(null, "", url);
    }
  };

  filters.forEach((button) => {
    const filter = button.dataset.filter;
    const count =
      filter === "all"
        ? shots.length
        : shots.filter((shot) => tagsOf(shot).includes(filter)).length;

    const badge = button.querySelector("span");
    if (badge) badge.textContent = String(count);
    button.disabled = count === 0;
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));

    button.addEventListener("click", () => {
      if (button.disabled) return;
      apply(filter);
    });
  });

  const initial = new URLSearchParams(location.search).get("filter");
  apply(initial && allowed.has(initial) ? initial : "all", false);
})();
