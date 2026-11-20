(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const config = window.SITE_CONFIG || {};
  const leadsEndpoint = String(config.leadsEndpoint || "").trim();

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
  const area = $("#area");
  const lights = $("#lights");
  const chandeliers = $("#chandeliers");
  const pipes = $("#pipes");
  const corners = $("#corners");
  const areaOut = $("#areaOut");
  const lightsOut = $("#lightsOut");
  const chandeliersOut = $("#chandeliersOut");
  const pipesOut = $("#pipesOut");
  const cornersOut = $("#cornersOut");
  const totalOut = $("#totalOut");
  const breakdown = $("#breakdown");
  const demolition = $("#install");
  const typeChipsRoot = $("#typeChips");
  const typeChips = typeChipsRoot ? $$('input[name="type"]', typeChipsRoot) : [];

  const PRICE_LIGHT = 450;
  const PRICE_CHANDELIER = 650;
  const PRICE_PIPE = 600;
  const PRICE_CORNER = 300;
  const PRICE_DEMOLITION = 180;
  const MIN_ORDER = 9900;

  let calcState = null;

  const money = (n) => `${new Intl.NumberFormat("ru-RU").format(n)} ₽`;

  const setFill = (input) => {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const p = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--p", `${p}%`);
  };

  const calcTotal = () => {
    const s = Number(area.value);
    const l = Number(lights.value);
    const ch = Number(chandeliers.value);
    const p = Number(pipes.value);
    const c = Number(corners.value);

    const selected = typeChips.find((chip) => chip.checked);
    const rate = Number(selected?.value || 890);
    const typeName = selected?.parentElement.querySelector("span")?.textContent.trim() || "Матовый";

    const rows = [
      { label: `Полотно · ${typeName.toLowerCase()} · ${s} м²`, value: s * rate },
      { label: `Светильники · ${l} шт`, value: l * PRICE_LIGHT },
      { label: `Люстры · ${ch} шт`, value: ch * PRICE_CHANDELIER },
      { label: `Обход труб · ${p} шт`, value: p * PRICE_PIPE },
      { label: `Дополнительные углы · ${c} шт`, value: c * PRICE_CORNER },
    ];

    let raw = rows.reduce((sum, row) => sum + row.value, 0);
    if (demolition.checked) {
      raw += s * PRICE_DEMOLITION;
      rows.push({ label: `Демонтаж · ${s} м²`, value: s * PRICE_DEMOLITION });
    }

    const total = Math.max(MIN_ORDER, Math.round(raw / 10) * 10);
    if (total > raw) rows.push({ label: "До минимального заказа", value: total - raw });

    areaOut.textContent = `${s} м²`;
    lightsOut.textContent = `${l} шт`;
    chandeliersOut.textContent = `${ch} шт`;
    pipesOut.textContent = `${p} шт`;
    cornersOut.textContent = `${c} шт`;
    totalOut.textContent = money(total);

    if (breakdown) {
      breakdown.innerHTML = rows
        .filter((row) => row.value > 0)
        .map(
          (row) =>
            `<div><span>${row.label}</span><strong>${money(row.value)}</strong></div>`
        )
        .join("");
    }

    calcState = {
      typeName,
      area: s,
      lights: l,
      chandeliers: ch,
      pipes: p,
      corners: c,
      demolition: demolition.checked,
      total,
    };

    [area, lights, chandeliers, pipes, corners].forEach(setFill);
  };

  if (
    area && lights && chandeliers && pipes && corners &&
    totalOut && breakdown && demolition
  ) {
    [area, lights, chandeliers, pipes, corners, demolition, ...typeChips].forEach((el) =>
      el.addEventListener("input", calcTotal)
    );
    calcTotal();
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

      const summary = [
        "Расчёт с сайта:",
        `Тип: ${calcState.typeName}`,
        `Площадь: ${calcState.area} м²`,
        `Светильники: ${calcState.lights} шт`,
        `Люстры: ${calcState.chandeliers} шт`,
        `Обход труб: ${calcState.pipes} шт`,
        `Дополнительные углы: ${calcState.corners} шт`,
        `Демонтаж: ${calcState.demolition ? "да" : "нет"}`,
        `Ориентировочная стоимость: ${totalOut.textContent}`,
        "Точная смета — после замера.",
      ].join("\n");

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
        showToast("Расчёт перенесён в форму заявки");
        return;
      }

      const waUrl = `https://wa.me/${config.whatsapp || "79919690999"}?text=${encodeURIComponent(summary)}`;
      window.open(waUrl, "_blank");
    });
  }

  /* ---------------------------------------------------------
     Forms
     --------------------------------------------------------- */
  const showError = (field, message) => {
    field.classList.add("is-invalid");
    const error = $(".field__error", field);
    if (error) error.textContent = message;
    const input = $("input, textarea", field);
    if (input) input.setAttribute("aria-invalid", "true");
  };

  const clearError = (field) => {
    field.classList.remove("is-invalid");
    const error = $(".field__error", field);
    if (error) error.textContent = "";
    const input = $("input, textarea", field);
    if (input) input.removeAttribute("aria-invalid");
  };

  $$(".form").forEach((form) => {
    const fields = $$(".field", form).filter((f) => $("input[required], textarea[required]", f));
    const consent = $('input[name="consent"]', form);
    const consentWrap = consent?.closest(".consent");
    const consentError = $(".consent__error", form);
    const button = $('button[type="submit"]', form);
    const success = $(".form__success", form);
    const channel = $(".form__channel", form);
    const isHero = form.dataset.form === "hero";

    fields.forEach((field) => {
      const input = $("input, textarea", field);
      input.addEventListener("input", () => clearError(field));
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
      return data;
    };

    const whatsappMessage = (data) => {
      const lines = [
        `Заявка с сайта ${config.siteName || "Потолки Мытищи"}`,
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
      ];
      if (data.area) lines.push(`Площадь: ${data.area} м²`);
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
        const input = $("input, textarea", field);
        const value = input.value.trim();

        if (input.type === "tel") {
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
        const firstInvalid = $(".field.is-invalid input, .field.is-invalid textarea", form);
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
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          showSuccess("Заявка отправлена! Свяжемся с вами в течение 15 минут.");
          showToast("Заявка отправлена. Перезвоним в течение 15 минут!");
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
      resetForm();
      button.disabled = false;
      button.textContent = original;
    });

    if (!leadsEndpoint) {
      if (channel) channel.hidden = false;
      if (button) {
        button.textContent = isHero ? "Получить расчёт в WhatsApp" : "Записаться через WhatsApp";
      }
    }
  });

  /* ---------------------------------------------------------
     Misc
     --------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
