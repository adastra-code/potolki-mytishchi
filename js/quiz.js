(() => {
  "use strict";

  const QUESTIONS = [
    {
      key: "room",
      title: "Какая комната?",
      hint: "От этого зависят материал, свет и влагостойкость.",
      options: [
        { value: "living", label: "Гостиная" },
        { value: "kitchen", label: "Кухня" },
        { value: "bath", label: "Ванная" },
        { value: "bedroom", label: "Спальня" },
        { value: "kids", label: "Детская" },
      ],
    },
    {
      key: "area",
      title: "Какая площадь потолка?",
      hint: "Достаточно примерной площади — точные размеры снимет мастер.",
      options: [
        { value: "s", label: "До 10 м²", area: 8 },
        { value: "m", label: "10–20 м²", area: 15 },
        { value: "l", label: "20–30 м²", area: 25 },
        { value: "xl", label: "Больше 30 м²", area: 38 },
      ],
    },
    {
      key: "priority",
      title: "Что для вас важнее?",
      hint: "Можно выбрать один главный критерий.",
      options: [
        { value: "clean", label: "Ровный белый потолок" },
        { value: "hide", label: "Скрыть крепёж и светильники" },
        { value: "light", label: "Световые линии и подсветка" },
        { value: "design", label: "Дизайн и сложная форма" },
        { value: "budget", label: "Минимальная цена" },
      ],
    },
    {
      key: "light",
      title: "Какой свет нужен?",
      hint: "Если пока не решили — выберите «Пока не решил».",
      options: [
        { value: "chandelier", label: "Люстра" },
        { value: "spots", label: "Точечные светильники" },
        { value: "lines", label: "Световые линии" },
        { value: "unknown", label: "Пока не решил" },
      ],
    },
    {
      key: "when",
      title: "Когда планируете?",
      hint: "Это поможет понять, когда лучше приехать на замер.",
      options: [
        { value: "now", label: "Сейчас" },
        { value: "month", label: "В течение месяца" },
        { value: "later", label: "Через 2–3 месяца" },
        { value: "research", label: "Просто изучаю" },
      ],
    },
  ];

  const TYPE = {
    matte: { title: "матовый потолок", rate: 890, profile: "классический профиль", link: "uslugi.html" },
    gloss: { title: "глянцевый потолок", rate: 990, profile: "классический профиль", link: "uslugi.html" },
    satin: { title: "сатиновый потолок", rate: 950, profile: "классический профиль", link: "uslugi.html" },
    light: { title: "световые линии", rate: 1450, profile: "профиль со световой линией", link: "svetovye-linii.html" },
    shadow: { title: "теневой потолок", rate: 1590, profile: "теневой профиль", link: "tenevye-potolki.html" },
    multi: { title: "многоуровневый потолок", rate: 1900, profile: "многоуровневая конструкция", link: "mnogourovnevye-potolki.html" },
  };

  const roomLabel = {
    living: "Гостиная",
    kitchen: "Кухня",
    bath: "Ванная",
    bedroom: "Спальня",
    kids: "Детская",
  };

  const priorityLabel = {
    clean: "Ровный белый потолок",
    hide: "Скрыть крепёж и светильники",
    light: "Световые линии и подсветка",
    design: "Дизайн и сложная форма",
    budget: "Минимальная цена",
  };

  const lightLabel = {
    chandelier: "Люстра",
    spots: "Точечные светильники",
    lines: "Световые линии",
    unknown: "Пока не решил",
  };

  const whenLabel = {
    now: "Сейчас",
    month: "В течение месяца",
    later: "Через 2–3 месяца",
    research: "Просто изучаю",
  };

  const stage = document.getElementById("quizStage");
  const result = document.getElementById("quizResult");
  const form = document.getElementById("quizForm");
  const bar = document.getElementById("quizBar");
  const stepLabel = document.getElementById("quizStepLabel");
  const nav = document.getElementById("quizNav");
  const back = document.getElementById("quizBack");
  const comment = document.getElementById("quizComment");
  if (!stage || !result || !form) return;

  let step = 0;
  let answers = {};
  let advanceTimer = null;

  const selectedValue = (key) => answers[key]?.value;

  const clearAdvance = () => {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  };

  const renderStep = () => {
    const question = QUESTIONS[step];
    const current = selectedValue(question.key);

    stepLabel.textContent = `Шаг ${step + 1} из ${QUESTIONS.length}`;
    bar.style.width = `${((step + 1) / QUESTIONS.length) * 100}%`;
    back.disabled = step === 0;

    stage.innerHTML = `
      <div class="quiz-question">
        <h2>${question.title}</h2>
        <p class="quiz-hint">${question.hint}</p>
        <div class="quiz-options">
          ${question.options
            .map(
              (option, index) => `
                <button class="quiz-option${current === option.value ? " is-selected" : ""}" type="button" data-value="${option.value}">
                  <span class="quiz-option__letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
                  <span>${option.label}</span>
                </button>`
            )
            .join("")}
        </div>
      </div>`;
  };

  const choose = (value) => {
    const question = QUESTIONS[step];
    const option = question.options.find((item) => item.value === value);
    if (!option) return;

    clearAdvance();
    answers[question.key] = option;

    stage.querySelectorAll(".quiz-option").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.value === value);
    });

    advanceTimer = setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        step += 1;
        renderStep();
      } else {
        showResult();
      }
    }, 220);
  };

  const buildRecommendation = () => {
    const areaOption = answers.area;
    const area = areaOption?.area || 15;
    let typeKey = "matte";

    if (answers.priority?.value === "light" || answers.light?.value === "lines") typeKey = "light";
    else if (answers.priority?.value === "hide") typeKey = "shadow";
    else if (answers.priority?.value === "design") typeKey = "multi";
    else if (answers.priority?.value === "budget") typeKey = "matte";
    else if (answers.room?.value === "bath") typeKey = "matte";

    const type = TYPE[typeKey];
    let lightCost = 0;
    if (answers.light?.value === "chandelier") lightCost = 650;
    if (answers.light?.value === "spots") {
      lightCost = Math.max(4, Math.round(area / 3)) * 450;
    }

    const estimate = Math.max(9900, Math.ceil((area * type.rate + lightCost) / 1000) * 1000);

    const reason =
      typeKey === "shadow"
        ? "Теневой профиль даёт аккуратную линию по периметру и скрывает крепёж — без пластиковой вставки."
        : typeKey === "light"
          ? "Световые линии дают ровный свет и помогают зонировать комнату без лишних светильников."
          : typeKey === "multi"
            ? "Многоуровневая конструкция позволяет зонировать пространство, спрятать коммуникации и добавить свет."
            : "Матовое полотно — универсальное решение: не даёт бликов, легко моется и подходит для большинства интерьеров.";

    const note =
      answers.room?.value === "bath"
        ? "Для ванной используем влагостойкое ПВХ-полотно и влагозащищённое освещение. Важна нормальная вентиляция."
        : answers.room?.value === "kitchen"
          ? "Для кухни продумываем свет над рабочей зоной и аккуратный обход вытяжки и вентиляции."
          : answers.room?.value === "kids"
            ? "Для детской подбираем сертифицированные материалы и мягкий свет без резких бликов."
            : answers.room?.value === "bedroom"
              ? "Для спальни лучше подойдёт мягкий свет и спокойная матовая фактура."
              : "Для гостиной можно добавить световые линии, трек или подсветку по периметру.";

    return { area, areaLabel: areaOption?.label || "15 м²", typeKey, type, estimate, reason, note };
  };

  const showResult = () => {
    const data = buildRecommendation();
    const summary = [
      "Подбор с сайта:",
      `Комната: ${roomLabel[answers.room?.value] || "не указана"}`,
      `Площадь: ${data.areaLabel}`,
      `Приоритет: ${priorityLabel[answers.priority?.value] || "не указан"}`,
      `Свет: ${lightLabel[answers.light?.value] || "не указан"}`,
      `Срок: ${whenLabel[answers.when?.value] || "не указан"}`,
      `Рекомендация: ${data.type.title}, ${data.type.profile}`,
      `Ориентир: от ${new Intl.NumberFormat("ru-RU").format(data.estimate)} ₽`,
      "Точная смета — после замера.",
    ].join("\n");

    comment.value = summary;
    stage.hidden = true;
    nav.hidden = true;
    result.hidden = false;
    form.hidden = false;
    stepLabel.textContent = "Готово";
    bar.style.width = "100%";

    result.innerHTML = `
      <span class="quiz-result__badge">Рекомендация</span>
      <h2>${roomLabel[answers.room?.value] || "Комната"}: ${data.type.title}</h2>
      <p class="quiz-result__lead">${data.reason}</p>
      <div class="quiz-facts">
        <div class="quiz-fact"><span>Площадь</span><strong>${data.areaLabel}</strong></div>
        <div class="quiz-fact"><span>Профиль</span><strong>${data.type.profile}</strong></div>
        <div class="quiz-fact"><span>Свет</span><strong>${lightLabel[answers.light?.value] || "Уточним на замере"}</strong></div>
        <div class="quiz-fact"><span>Ориентир</span><strong>от ${new Intl.NumberFormat("ru-RU").format(data.estimate)} ₽</strong></div>
      </div>
      <p class="quiz-result__note">${data.note} Ориентир не заменяет смету: точная цена зависит от геометрии, профиля и света.</p>
      <div class="quiz-result__actions">
        <a class="btn btn--solid" href="${data.type.link}">Подробнее об услуге</a>
        <button class="quiz-restart" type="button" id="quizRestart">Пройти заново</button>
      </div>`;

    result.querySelector("#quizRestart").addEventListener("click", restart);
    form.querySelector('input[name="name"]')?.focus({ preventScroll: true });
  };

  const restart = () => {
    clearAdvance();
    answers = {};
    step = 0;
    form.reset();
    comment.value = "";
    result.hidden = true;
    form.hidden = true;
    stage.hidden = false;
    nav.hidden = false;
    result.innerHTML = "";
    renderStep();
    stage.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  stage.addEventListener("click", (event) => {
    const option = event.target.closest(".quiz-option");
    if (option) choose(option.dataset.value);
  });

  back.addEventListener("click", () => {
    clearAdvance();
    if (step === 0) return;
    step -= 1;
    result.hidden = true;
    form.hidden = true;
    stage.hidden = false;
    nav.hidden = false;
    renderStep();
  });

  renderStep();
})();
