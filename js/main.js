(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const config = window.SITE_CONFIG || {};
  const leadsEndpoint = String(config.leadsEndpoint || "").trim();
  const metrikaId = String(config.metrikaId || "").trim();

  const reachGoal = (goal) => {
    if (metrikaId && typeof window.ym === "function") {
      window.ym(metrikaId, "reachGoal", goal);
    }
  };

  if (metrikaId) {
    window.ym =
      window.ym ||
      function () {
        (window.ym.a = window.ym.a || []).push(arguments);
      };
    window.ym.l = Date.now();
    window.ym(metrikaId, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);

    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith("tel:")) reachGoal("phone_click");
      if (href.includes("wa.me")) reachGoal("whatsapp_click");
    });
  }

  /* ---------------------------------------------------------
     Header: shadow after scroll
     --------------------------------------------------------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  const burger = $("#burger");
  const nav = $("#nav");

  const closeNav = () => {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";
  });

  $$("a", nav).forEach((link) => link.addEventListener("click", closeNav));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 979) closeNav();
  });

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Calculator
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Calculator v3: несколько комнат
     --------------------------------------------------------- */
  const TYPE_LABELS = {
    matte: "Матовый",
    gloss: "Глянцевый",
    satin: "Сатиновый",
    light: "Световые линии",
    shadow: "Теневой",
    multi: "Многоуровневый",
  };
  const MAX_ROOMS = 6;

  let calcState = null;

  const calcRooms = $("#calcRooms");
  const addRoomBtn = $("#addRoom");
  const totalOut = $("#totalOut");
  const breakdown = $("#breakdown");

  if (calcRooms && addRoomBtn && totalOut && breakdown) {
    let roomSeq = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
    const typeOptions = Object.entries(TYPE_LABELS)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");

    const renumber = () => {
      const rooms = Array.from(calcRooms.querySelectorAll(".calc-room"));
      rooms.forEach((room, index) => {
        const number = room.querySelector(".room-number");
        if (number) number.textContent = String(index + 1);
        const remove = room.querySelector(".calc-room__remove");
        if (remove) {
          remove.hidden = rooms.length === 1;
          remove.setAttribute("aria-label", `Удалить комнату ${index + 1}`);
        }
      });
      addRoomBtn.disabled = rooms.length >= MAX_ROOMS;
    };

    const readRooms = () =>
      Array.from(calcRooms.querySelectorAll(".calc-room")).map((room) => {
        const value = (selector, min, max) =>
          clamp(room.querySelector(selector)?.value, min, max);
        return {
          type: room.querySelector(".room-type")?.value || "matte",
          area: value(".room-area", 3, 150),
          lights: value(".room-lights", 0, 24),
          chandeliers: value(".room-chandeliers", 0, 4),
          pipes: value(".room-pipes", 0, 4),
          corners: value(".room-corners", 0, 8),
          demolition: Boolean(room.querySelector(".room-demolition")?.checked),
        };
      });

    const calcTotal = () => {
      const rooms = readRooms();
      const totalArea = rooms.reduce((sum, room) => sum + room.area, 0);

      Array.from(calcRooms.querySelectorAll(".calc-room")).forEach((roomEl, index) => {
        const subtotal = roomEl.querySelector(".room-subtotal");
        if (subtotal) subtotal.textContent = `${rooms[index].area} м²`;
      });

      breakdown.innerHTML = rooms
        .map(
          (room, index) =>
            `<div><span>Комната ${index + 1} · ${TYPE_LABELS[room.type].toLowerCase()}</span><strong>${room.area} м²</strong></div>`
        )
        .join("");

      totalOut.textContent = `${rooms.length} комн. · ${totalArea} м²`;
      calcState = { rooms, totalArea };
    };

    const createRoom = (defaults = {}) => {
      if (calcRooms.children.length >= MAX_ROOMS) return null;

      const id = ++roomSeq;
      const room = document.createElement("div");
      room.className = "calc-room";
      room.dataset.id = String(id);
      room.innerHTML = `
        <div class="calc-room__head">
          <span class="calc-room__title">Комната <span class="room-number"></span></span>
          <button class="calc-room__remove" type="button" aria-label="Удалить комнату">×</button>
        </div>
        <div class="calc-room__grid">
          <label class="field field--compact calc-room__type">
            <span>Тип потолка</span>
            <select class="room-type">${typeOptions}</select>
          </label>
          <label class="field field--compact">
            <span>Площадь, м²</span>
            <input class="room-area" type="number" inputmode="decimal" min="3" max="150" step="1" />
          </label>
          <label class="field field--compact">
            <span>Светильники, шт</span>
            <input class="room-lights" type="number" inputmode="numeric" min="0" max="24" step="1" />
          </label>
          <label class="field field--compact">
            <span>Люстры, шт</span>
            <input class="room-chandeliers" type="number" inputmode="numeric" min="0" max="4" step="1" />
          </label>
          <label class="field field--compact">
            <span>Обход труб, шт</span>
            <input class="room-pipes" type="number" inputmode="numeric" min="0" max="4" step="1" />
          </label>
          <label class="field field--compact">
            <span>Доп. углы, шт</span>
            <input class="room-corners" type="number" inputmode="numeric" min="0" max="8" step="1" />
          </label>
        </div>
        <label class="switch calc-room__demolition">
          <input class="room-demolition" type="checkbox" />
          <span class="switch__box" aria-hidden="true"></span>
          <span>Демонтаж старого потолка</span>
        </label>
        <div class="calc-room__subtotal">
          <span>Площадь</span>
          <strong class="room-subtotal">0 м²</strong>
        </div>`;

      calcRooms.appendChild(room);

      const values = {
        type: defaults.type || "matte",
        area: defaults.area ?? 18,
        lights: defaults.lights ?? 4,
        chandeliers: defaults.chandeliers ?? 0,
        pipes: defaults.pipes ?? 0,
        corners: defaults.corners ?? 0,
        demolition: Boolean(defaults.demolition),
      };

      room.querySelector(".room-type").value = values.type;
      room.querySelector(".room-area").value = values.area;
      room.querySelector(".room-lights").value = values.lights;
      room.querySelector(".room-chandeliers").value = values.chandeliers;
      room.querySelector(".room-pipes").value = values.pipes;
      room.querySelector(".room-corners").value = values.corners;
      room.querySelector(".room-demolition").checked = values.demolition;

      renumber();
      calcTotal();
      return room;
    };

    calcRooms.addEventListener("input", calcTotal);
    calcRooms.addEventListener("change", calcTotal);
    calcRooms.addEventListener("click", (event) => {
      const remove = event.target.closest(".calc-room__remove");
      if (!remove) return;
      if (calcRooms.children.length === 1) return;
      remove.closest(".calc-room").remove();
      renumber();
      calcTotal();
    });

    addRoomBtn.addEventListener("click", () => {
      createRoom({ area: 18, type: "matte", lights: 4 });
    });

    createRoom({
      area: 24,
      type: "matte",
      lights: 6,
      chandeliers: 0,
      pipes: 0,
      corners: 0,
      demolition: true,
    });
  }

  /* ---------------------------------------------------------
     Accordion
     --------------------------------------------------------- */
  const accordion = $("#accordion");

  const setPanelHeight = (item) => {
    const panel = $(".accordion__panel", item);
    if (!panel) return;
    panel.style.maxHeight = item.classList.contains("is-open")
      ? `${panel.scrollHeight}px`
      : "0px";
  };

  if (accordion) {
    const items = $$(".accordion__item", accordion);

    items.forEach((item) => {
      const trigger = $(".accordion__trigger", item);
      trigger.setAttribute("aria-expanded", String(item.classList.contains("is-open")));
      setPanelHeight(item);

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        items.forEach((other) => {
          other.classList.remove("is-open");
          $(".accordion__trigger", other).setAttribute("aria-expanded", "false");
          setPanelHeight(other);
        });

        if (willOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          setPanelHeight(item);
        }
      });
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        items.forEach((item) => {
          if (item.classList.contains("is-open")) setPanelHeight(item);
        });
      }, 150);
    });
  }

  /* ---------------------------------------------------------
     Phone mask
     --------------------------------------------------------- */
  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    const rest = digits.slice(1);
    let out = "+7";
    if (rest.length) out += ` (${rest.slice(0, 3)}`;
    if (rest.length >= 3) out += ")";
    if (rest.length > 3) out += ` ${rest.slice(3, 6)}`;
    if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
    if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
    return out;
  };

  $$('input[type="tel"]').forEach((input) => {
    input.addEventListener("focus", () => {
      if (!input.value) input.value = "+7 (";
    });
    input.addEventListener("input", () => {
      input.value = formatPhone(input.value);
    });
    input.addEventListener("blur", () => {
      if (input.value.replace(/\D/g, "").length <= 1) input.value = "";
    });
  });

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  const toastEl = $("#toast");
  let toastTimer;

  const showToast = (text) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
  };

  /* ---------------------------------------------------------
     Calculator → contact form
     --------------------------------------------------------- */
  const calcSend = $("#calcSend");
  if (calcSend) {
    calcSend.addEventListener("click", () => {
      if (!calcState) return;

      const roomLines = calcState.rooms.map((room, index) => {
        const details = [
          `${room.area} м²`,
          TYPE_LABELS[room.type].toLowerCase(),
          `светильники ${room.lights}`,
          `люстры ${room.chandeliers}`,
          `трубы ${room.pipes}`,
          `углы ${room.corners}`,
          `демонтаж ${room.demolition ? "да" : "нет"}`,
        ].join(", ");
        return `Комната ${index + 1}: ${details}`;
      });

      const summary = [
        "Параметры с сайта:",
        ...roomLines,
        `Всего: ${calcState.rooms.length} комн., ${calcState.totalArea} м²`,
        "Стоимость рассчитаем после замера.",
      ]
        .filter(Boolean)
        .join("\n");

      const contactForm = $('form[data-form="contact"]');
      if (contactForm) {
        const comment = $('textarea[name="comment"]', contactForm);
        if (comment) {
          comment.value = summary;
          comment.dispatchEvent(new Event("input", { bubbles: true }));
        }
        contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          $('input[name="name"]', contactForm)?.focus({ preventScroll: true });
        }, 500);
        showToast("Параметры перенесены в форму заявки");
        reachGoal("calculator_send");
        return;
      }

      const waUrl = `https://wa.me/${config.whatsapp || "79919690999"}?text=${encodeURIComponent(summary)}`;
      window.open(waUrl, "_blank");
    });
  }

  /* ---------------------------------------------------------
     Prefill from gallery / cases
     --------------------------------------------------------- */
  const prefillParams = new URLSearchParams(location.search);
  const photoNumber = (prefillParams.get("photo") || "").replace(/\D/g, "").slice(0, 3);
  const caseNumber = (prefillParams.get("case") || "").replace(/\D/g, "").slice(0, 2);
  const contactFormForPrefill = $('form[data-form="contact"]');

  if (contactFormForPrefill) {
    const comment = $('textarea[name="comment"]', contactFormForPrefill);
    if (comment && !comment.value) {
      if (photoNumber) {
        comment.value = `Хочу такой же потолок, как на фото №${photoNumber} в галерее.`;
      } else if (caseNumber) {
        comment.value = `Интересует кейс №${caseNumber}. Хочу такой же потолок.`;
      }
    }
  }

  /* ---------------------------------------------------------
     Forms
     --------------------------------------------------------- */
  const showError = (field, message) => {
    field.classList.add("is-invalid");
    const error = $(".field__error", field);
    if (error) error.textContent = message;
    const input = $("input, textarea, select", field);
    if (input) input.setAttribute("aria-invalid", "true");
  };

  const clearError = (field) => {
    field.classList.remove("is-invalid");
    const error = $(".field__error", field);
    if (error) error.textContent = "";
    const input = $("input, textarea, select", field);
    if (input) input.removeAttribute("aria-invalid");
  };

  const dateToIso = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateField = $('input[type="date"]');
  if (dateField) {
    const today = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 90);
    dateField.min = dateToIso(today);
    dateField.max = dateToIso(max);
    dateField.value = dateToIso(today);

    const chips = $$(".date-chip");
    const setChip = (offset) => {
      chips.forEach((chip) =>
        chip.classList.toggle("is-active", Number(chip.dataset.dateOffset) === offset)
      );
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const date = new Date();
        date.setDate(date.getDate() + Number(chip.dataset.dateOffset));
        dateField.value = dateToIso(date);
        setChip(Number(chip.dataset.dateOffset));
        dateField.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });

    dateField.addEventListener("change", () => {
      const diff = Math.round(
        (new Date(`${dateField.value}T00:00:00`) - new Date(`${dateToIso(new Date())}T00:00:00`)) /
          86400000
      );
      setChip(diff);
    });
  }

  $$(".form").forEach((form) => {
    const fields = $$(".field", form).filter((f) =>
      $("input[required], textarea[required], select[required]", f)
    );
    const consent = $('input[name="consent"]', form);
    const consentWrap = consent?.closest(".consent");
    const consentError = $(".consent__error", form);
    const button = $('button[type="submit"]', form);
    const success = $(".form__success", form);
    const channel = $(".form__channel", form);
    const isHero = form.dataset.form === "hero";

    fields.forEach((field) => {
      const input = $("input, textarea, select", field);
      input.addEventListener("input", () => clearError(field));
      input.addEventListener("change", () => clearError(field));
    });

    if (consent) {
      consent.addEventListener("change", () => {
        consentWrap?.classList.remove("is-invalid");
        if (consentError) consentError.hidden = true;
      });
    }

    $$(".consent__text a", form).forEach((link) => {
      link.addEventListener("click", (event) => event.stopPropagation());
    });

    const resetForm = () => {
      form.reset();
      $$("input[type='tel']", form).forEach((i) => (i.value = ""));
      consentWrap?.classList.remove("is-invalid");
      if (consentError) consentError.hidden = true;
    };

    const collectData = () => {
      const data = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string" && value.trim()) data[key] = value.trim();
      });
      data.consent = Boolean(consent?.checked);
      data.source = form.dataset.form || "site";
      data.page = location.href;
      data.referrer = document.referrer || "";
      data.sentAt = new Date().toISOString();
      data._subject =
        form.dataset.form === "booking"
          ? `Запись на замер — ${location.pathname}`
          : form.dataset.form === "quiz"
            ? `Тест подбора — ${location.pathname}`
            : `Заявка с сайта — ${location.pathname}`;
      data._template = "table";
      return data;
    };

    const whatsappMessage = (data) => {
      const lines = [
        `Заявка с сайта ${config.siteName || "Академия Натяжных Потолков"}`,
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
      ];
      if (data.area) lines.push(`Площадь: ${data.area} м²`);
      if (data.date) {
        const date = new Date(`${data.date}T00:00:00`);
        if (!Number.isNaN(date.getTime())) {
          lines.push(
            `Дата: ${date.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`
          );
        }
      }
      if (data.time) lines.push(`Время: ${data.time}`);
      if (data.comment) lines.push(`Комментарий: ${data.comment}`);
      lines.push(`Страница: ${location.href}`);
      return lines.join("\n");
    };

    const showSuccess = (text, waUrl) => {
      if (!success) return;
      if (waUrl) {
        success.innerHTML = `${text} <a href="${waUrl}" target="_blank" rel="noopener">Открыть чат</a>`;
      } else {
        success.textContent = text;
      }
      success.hidden = false;
      setTimeout(() => {
        if (success) success.hidden = true;
      }, 15000);
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let valid = true;

      fields.forEach((field) => {
        const input = $("input, textarea, select", field);
        const value = input.value.trim();

        if (input.tagName === "SELECT") {
          if (!value) {
            showError(field, "Выберите время");
            valid = false;
          } else clearError(field);
        } else if (input.type === "date") {
          if (!value) {
            showError(field, "Выберите дату");
            valid = false;
          } else if (input.min && value < input.min) {
            showError(field, "Дата уже прошла — выберите другую");
            valid = false;
          } else clearError(field);
        } else if (input.type === "tel") {
          if (value.replace(/\D/g, "").length !== 11) {
            showError(field, "Введите номер полностью: +7 (___) ___-__-__");
            valid = false;
          } else clearError(field);
        } else if (value.length < 2) {
          showError(field, "Укажите имя — хотя бы 2 символа");
          valid = false;
        } else clearError(field);
      });

      if (consent && !consent.checked) {
        consentWrap?.classList.add("is-invalid");
        if (consentError) consentError.hidden = false;
        valid = false;
      }

      if (!valid) {
        const firstInvalid = $(".field.is-invalid input, .field.is-invalid textarea, .field.is-invalid select", form);
        if (firstInvalid) firstInvalid.focus();
        else consent?.focus();
        return;
      }

      const original = button.textContent;
      button.disabled = true;
      button.textContent = "Отправляем…";

      const data = collectData();

      if (leadsEndpoint) {
        try {
          const response = await fetch(leadsEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || (result && String(result.success).toLowerCase() === "false")) {
            throw new Error(result?.message || `HTTP ${response.status}`);
          }

          showSuccess("Заявка отправлена! Свяжемся с вами.");
          showToast("Заявка отправлена. Перезвоним.");
          const goal = form.dataset.form === "booking"
            ? "booking_submit"
            : form.dataset.form === "quiz"
              ? "quiz_submit"
              : "form_submit";
          reachGoal(goal);
          resetForm();
        } catch (error) {
          showToast(`Не удалось отправить. Позвоните ${config.phone || "+7 (991) 969-09-99"}.`);
        } finally {
          button.disabled = false;
          button.textContent = original;
        }
        return;
      }

      const waUrl = `https://wa.me/${config.whatsapp || "79919690999"}?text=${encodeURIComponent(whatsappMessage(data))}`;
      const win = window.open(waUrl, "_blank");
      if (win) win.opener = null;

      showSuccess("Открыли WhatsApp с готовым текстом. Нажмите «Отправить» в чате — заявка попадёт к нам.", waUrl);
      showToast("Осталось отправить сообщение в WhatsApp");
      const goal = form.dataset.form === "booking"
        ? "booking_whatsapp"
        : form.dataset.form === "quiz"
          ? "quiz_whatsapp"
          : "form_whatsapp";
      reachGoal(goal);
      resetForm();
      button.disabled = false;
      button.textContent = original;
    });

    if (!leadsEndpoint) {
      if (channel) channel.hidden = false;
      if (button) {
        button.textContent = isHero ? "Отправить заявку в WhatsApp" : "Отправить в WhatsApp";
      }
    }
  });

  /* ---------------------------------------------------------
     Misc
     --------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
