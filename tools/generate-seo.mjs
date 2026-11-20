import { readFile, writeFile } from "node:fs/promises";
import { allPages, services, rooms } from "./seo-data.mjs";

const root = process.cwd();
const SITE = "https://adastra-code.github.io/potolki-mytishchi";
const V = "20261121c";

const nav = `
      <nav class="nav" id="nav" aria-label="Основная навигация">
        <a href="uslugi.html">Услуги</a>
        <a href="index.html#calculator">Калькулятор</a>
        <a href="gallery.html">Работы</a>
        <a href="index.html#process">Этапы</a>
        <a href="index.html#reviews">Отзывы</a>
        <a href="index.html#contacts">Контакты</a>
        <div class="nav__mobile-cta">
          <a class="btn btn--solid btn--block" href="index.html#contacts">Замер бесплатно</a>
          <a class="nav__phone" href="tel:+79919690999">+7 (991) 969-09-99</a>
        </div>
      </nav>`;

const header = `
  <header class="header" id="header">
    <div class="container header__inner">
      <a class="logo" href="index.html" aria-label="Потолки Мытищи — на главную">
        <span class="logo__mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="currentColor" stroke-opacity=".35" />
            <path d="M10 27h20M13 21h14M16 15h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          </svg>
        </span>
        <span class="logo__text">ПОТОЛКИ <em>МЫТИЩИ</em></span>
      </a>${nav}
      <div class="header__actions">
        <a class="header__phone" href="tel:+79919690999">
          <span>Круглосуточно, без выходных</span>
          <strong>+7 (991) 969-09-99</strong>
        </a>
        <a class="btn btn--solid" href="index.html#contacts">Замер бесплатно</a>
        <button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="nav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

const footer = `
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <a class="logo" href="index.html" aria-label="Потолки Мытищи — на главную">
          <span class="logo__mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="40" height="40">
              <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="currentColor" stroke-opacity=".35" />
              <path d="M10 27h20M13 21h14M16 15h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            </svg>
          </span>
          <span class="logo__text">ПОТОЛКИ <em>МЫТИЩИ</em></span>
        </a>
        <p>Натяжные потолки под ключ<br />Мытищи и Московская область</p>
      </div>
      <nav class="footer__nav" aria-label="Навигация в подвале">
        <a href="uslugi.html">Услуги</a>
        <a href="index.html#calculator">Калькулятор</a>
        <a href="gallery.html">Работы</a>
        <a href="cases.html">Кейсы</a>
        <a href="index.html#reviews">Отзывы</a>
        <a href="index.html#contacts">Контакты</a>
      </nav>
      <div class="footer__contacts">
        <a href="tel:+79919690999">+7 (991) 969-09-99</a>
        <a href="https://wa.me/79919690999" target="_blank" rel="noopener">WhatsApp</a>
        <a href="index.html#contacts">Мытищи, ул. Борисовка, 12А</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© <span id="year">2026</span> Натяжные потолки. Не является публичной офертой.</p>
      <div class="footer__legal">
        <a href="privacy.html">Политика конфиденциальности</a>
        <a href="index.html">На главную</a>
      </div>
    </div>
  </footer>`;

const mobileBar = `
  <nav class="mobile-bar" aria-label="Быстрые действия">
    <a class="mobile-bar__item" href="tel:+79919690999">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6.6 3.9c.4-.4 1-.4 1.4 0l2 2c.4.4.4 1 0 1.4L8.7 8.7a15 15 0 0 0 6.6 6.6l1.4-1.3c.4-.4 1-.4 1.4 0l2 2c.4.4.4 1 0 1.4l-1.2 1.2c-.8.8-2 1.1-3 .8-4.8-1.5-8.7-5.4-10.2-10.2-.3-1 0-2.2.8-3l1.1-1.1Z" />
      </svg>
      <span>Позвонить</span>
    </a>
    <a class="mobile-bar__item mobile-bar__item--accent" href="index.html#calculator">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 18h2M12 18h2M16 18h.01" />
      </svg>
      <span>Расчёт</span>
    </a>
    <a class="mobile-bar__item" href="https://wa.me/79919690999?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C%20%D0%BD%D0%B0%D1%82%D1%8F%D0%B6%D0%BD%D0%BE%D0%B9%20%D0%BF%D0%BE%D1%82%D0%BE%D0%BB%D0%BE%D0%BA." target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />
        <path d="M8.8 9.5c0 3 2.4 5.4 5.4 5.4" />
      </svg>
      <span>WhatsApp</span>
    </a>
  </nav>`;

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const pageSchema = (page) => {
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE}/uslugi.html` },
  ];
  if (page.type === "room") {
    crumbs.push({ "@type": "ListItem", position: 3, name: "Комнаты", item: `${SITE}/uslugi.html#rooms` });
  }
  crumbs.push({
    "@type": "ListItem",
    position: crumbs.length + 1,
    name: page.short,
    item: `${SITE}/${page.slug}.html`,
  });

  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: page.h1,
        description: page.description,
        serviceType: "Натяжные потолки",
        areaServed: ["Мытищи", "Москва", "Московская область"],
        provider: {
          "@type": "LocalBusiness",
          name: "Натяжные потолки",
          telephone: "+7-991-969-09-99",
          address: {
            "@type": "PostalAddress",
            streetAddress: "ул. Борисовка, 12А",
            addressLocality: "Мытищи",
            addressRegion: "Московская область",
            addressCountry: "RU",
          },
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          price: page.priceFrom,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs,
      },
    ],
    null,
    2
  );
};

const relatedCards = (page) =>
  page.related
    .map((slug) => allPages.find((item) => item.slug === slug))
    .filter(Boolean)
    .map(
      (item) => `
          <a class="seo-card" href="${item.slug}.html">
            <img src="${item.cardImage}" alt="${esc(item.cardTitle)}" loading="lazy" />
            <div class="seo-card__body">
              <h3>${esc(item.cardTitle)}</h3>
              <p>${esc(item.cardText)}</p>
              <span>Подробнее →</span>
            </div>
          </a>`
    )
    .join("");

const renderPage = (page) => {
  const isRoom = page.type === "room";
  const crumbs = `
        <nav class="breadcrumbs" aria-label="Хлебные крошки">
          <a href="index.html">Главная</a><span>/</span>
          <a href="uslugi.html">Услуги</a><span>/</span>
          ${isRoom ? `<a href="uslugi.html#rooms">Комнаты</a><span>/</span>` : ""}
          <span>${esc(page.short)}</span>
        </nav>`;

  const benefits = page.benefits
    .map(
      (item) => `
            <div class="seo-benefit">
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.text)}</p>
            </div>`
    )
    .join("");

  const priceRows = page.prices
    .map(
      (item) => `
              <tr><td>${esc(item.name)}</td><td>${esc(item.price)}</td></tr>`
    )
    .join("");

  const steps = page.process
    .map((item) => `<li>${esc(item)}</li>`)
    .join("");

  const photos = page.photos
    .map(
      (item) => `
            <figure><img src="${item.src}" alt="${esc(item.alt)}" loading="lazy" /></figure>`
    )
    .join("");

  const faq = page.faq
    .map(
      (item) => `
            <details class="seo-faq__item">
              <summary>${esc(item.q)}</summary>
              <p>${esc(item.a)}</p>
            </details>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <link rel="canonical" href="${SITE}/${page.slug}.html" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:url" content="${SITE}/${page.slug}.html" />
  <meta property="og:image" content="${SITE}/${page.cardImage}" />
  <meta property="og:site_name" content="Потолки Мытищи" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#0f1115" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f1115'/%3E%3Cpath d='M14 40h36M20 31h24M26 22h12' stroke='%23c8a165' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css?v=${V}" />
  <link rel="stylesheet" href="css/seo.css?v=${V}" />
  <script type="application/ld+json">
${pageSchema(page)}
  </script>
</head>
<body class="seo-page">
  <a class="skip-link" href="#main">Перейти к содержимому</a>${header}

  <main id="main">
    <div class="container">${crumbs}</div>

    <section class="seo-hero">
      <div class="container">
        <p class="eyebrow">${esc(page.eyebrow)}</p>
        <h1>${esc(page.h1)}</h1>
        <p class="seo-hero__lead">${esc(page.lead)}</p>
        <div class="seo-meta">
          <span>${esc(page.priceLabel)}</span>
          <span>Монтаж за 1 день</span>
          <span>Мытищи и Московская область</span>
        </div>
        <div class="seo-hero__cta">
          <a class="btn btn--solid btn--lg" href="index.html#calculator">Рассчитать стоимость</a>
          <a class="btn btn--ghost btn--lg" href="index.html#contacts">Записаться на замер</a>
        </div>
      </div>
    </section>

    <div class="container seo-layout">
      <article class="seo-article">
        ${page.intro.map((p) => `<p>${esc(p)}</p>`).join("")}

        <h2>${isRoom ? "Что учесть в этой комнате" : "Почему выбирают этот потолок"}</h2>
        <div class="seo-benefits">${benefits}</div>

        <h2>Цены</h2>
        <div class="seo-table-wrap">
          <table class="seo-table">
            <thead><tr><th>Вариант</th><th>Цена</th></tr></thead>
            <tbody>${priceRows}</tbody>
          </table>
        </div>
        <p class="seo-note">Цены ориентировочные и зависят от площади, геометрии, профиля, света и состояния основания. Точную смету фиксируем после бесплатного замера.</p>

        <h2>Как проходит монтаж</h2>
        <ol class="seo-steps">${steps}</ol>

        <h2>Фото работ</h2>
        <div class="seo-gallery">${photos}</div>

        <h2>Частые вопросы</h2>
        <div class="seo-faq">${faq}</div>

        <div class="seo-article-cta">
          <h2>Нужен такой потолок?</h2>
          <p>Приедем на замер, привезём образцы и назовём точную цену. Работаем по Мытищам и Московской области.</p>
          <div>
            <a class="btn btn--solid" href="index.html#calculator">Рассчитать</a>
            <a class="btn btn--ghost" href="tel:+79919690999">+7 (991) 969-09-99</a>
          </div>
        </div>
      </article>

      <aside class="seo-aside">
        <div class="seo-cta">
          <p class="eyebrow">Бесплатный замер</p>
          <h2>Рассчитать потолок</h2>
          <p>Привезём образцы, замерим комнату и зафиксируем смету в договоре.</p>
          <a class="btn btn--solid" href="index.html#calculator">Открыть калькулятор</a>
          <a class="seo-cta__phone" href="tel:+79919690999">+7 (991) 969-09-99</a>
        </div>
        <div class="seo-links">
          <h3>${isRoom ? "Другие комнаты" : "Другие услуги"}</h3>
          ${allPages
            .filter((item) => item.type === page.type && item.slug !== page.slug)
            .map((item) => `<a href="${item.slug}.html">${esc(item.cardTitle)}</a>`)
            .join("")}
          <a href="uslugi.html">Все услуги →</a>
        </div>
        <div class="seo-links">
          <h3>${isRoom ? "Виды потолков" : "По комнатам"}</h3>
          ${(isRoom ? services : rooms)
            .map((item) => `<a href="${item.slug}.html">${esc(item.cardTitle)}</a>`)
            .join("")}
          <a href="uslugi.html#rooms">Все комнаты →</a>
        </div>
      </aside>
    </div>

    <section class="seo-related">
      <div class="container">
        <h2>Смотрите также</h2>
        <div class="seo-related-grid">${relatedCards(page)}</div>
      </div>
    </section>
  </main>
${footer}${mobileBar}
  <script src="js/main.js?v=${V}"></script>
</body>
</html>
`;
};

const renderHub = () => {
  const serviceCards = services
    .map(
      (item) => `
          <a class="seo-card" href="${item.slug}.html">
            <img src="${item.cardImage}" alt="${esc(item.cardTitle)}" loading="lazy" />
            <div class="seo-card__body">
              <h3>${esc(item.cardTitle)}</h3>
              <p>${esc(item.cardText)}</p>
              <span>Подробнее · ${esc(item.priceLabel)} →</span>
            </div>
          </a>`
    )
    .join("");
  const roomCards = rooms
    .map(
      (item) => `
          <a class="seo-card" href="${item.slug}.html">
            <img src="${item.cardImage}" alt="${esc(item.cardTitle)}" loading="lazy" />
            <div class="seo-card__body">
              <h3>${esc(item.cardTitle)}</h3>
              <p>${esc(item.cardText)}</p>
              <span>Подробнее · ${esc(item.priceLabel)} →</span>
            </div>
          </a>`
    )
    .join("");

  const schema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Услуги и цены — натяжные потолки в Мытищах",
      url: `${SITE}/uslugi.html`,
      hasPart: allPages.map((item) => ({
        "@type": "WebPage",
        name: item.h1,
        url: `${SITE}/${item.slug}.html`,
      })),
    },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Услуги и цены — натяжные потолки в Мытищах | Потолки Мытищи</title>
  <meta name="description" content="Виды натяжных потолков и решения по комнатам: теневые, световые линии, парящие, многоуровневые. Цены, фото и монтаж в Мытищах и Московской области." />
  <link rel="canonical" href="${SITE}/uslugi.html" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:title" content="Услуги и цены — натяжные потолки в Мытищах" />
  <meta property="og:description" content="Виды натяжных потолков и решения по комнатам: цены, фото и монтаж в Мытищах и Московской области." />
  <meta property="og:url" content="${SITE}/uslugi.html" />
  <meta property="og:image" content="${SITE}/assets/img/work-living.jpg" />
  <meta property="og:site_name" content="Потолки Мытищи" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#0f1115" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f1115'/%3E%3Cpath d='M14 40h36M20 31h24M26 22h12' stroke='%23c8a165' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css?v=${V}" />
  <link rel="stylesheet" href="css/seo.css?v=${V}" />
  <script type="application/ld+json">
${schema}
  </script>
</head>
<body class="seo-page">
  <a class="skip-link" href="#main">Перейти к содержимому</a>${header}

  <main id="main">
    <div class="container">
      <nav class="breadcrumbs" aria-label="Хлебные крошки">
        <a href="index.html">Главная</a><span>/</span><span>Услуги</span>
      </nav>
    </div>

    <section class="seo-hero">
      <div class="container">
        <p class="eyebrow">Услуги</p>
        <h1>Услуги и цены</h1>
        <p class="seo-hero__lead">
          Натяжные потолки под ключ в Мытищах и Московской области: теневые профили,
          световые линии, парящие и многоуровневые конструкции. Выберите решение по типу
          или по комнате — на каждой странице есть цены, фото и ответы на вопросы.
        </p>
        <div class="seo-meta">
          <span>Монтаж за 1 день</span>
          <span>Замер бесплатно</span>
          <span>Гарантия по договору</span>
        </div>
      </div>
    </section>

    <section class="seo-hub">
      <div class="container">
        <div class="seo-hub__head">
          <h2>Виды потолков</h2>
          <p>Технологии, которые чаще всего выбирают для современных интерьеров.</p>
        </div>
        <div class="seo-hub-grid">${serviceCards}</div>
      </div>
    </section>

    <section class="seo-hub seo-hub--tint" id="rooms">
      <div class="container">
        <div class="seo-hub__head">
          <h2>По комнатам</h2>
          <p>Особенности выбора полотна, света и монтажа для кухни, ванной, спальни и детской.</p>
        </div>
        <div class="seo-hub-grid">${roomCards}</div>
      </div>
    </section>

    <section class="seo-hub">
      <div class="container seo-geo">
        <div>
          <h2>География работ</h2>
          <p>
            Выезжаем на замер в Мытищи, Королёв, Пушкино, Щёлково, Ивантеевку
            и ближайшие районы Московской области. Для дальних адресов стоимость
            и время выезда уточняйте при заявке — для большинства ближайших адресов
            замер бесплатный.
          </p>
          <a class="btn btn--solid" href="index.html#contacts">Уточнить выезд</a>
        </div>
        <ul class="seo-geo__list">
          <li>Мытищи</li><li>Королёв</li><li>Пушкино</li><li>Щёлково</li>
          <li>Ивантеевка</li><li>Москва</li><li>Ближайшие районы МО</li>
        </ul>
      </div>
    </section>

    <section class="seo-related">
      <div class="container seo-hub-cta">
        <div>
          <h2>Не знаете, что выбрать?</h2>
          <p>Опишите комнату и задачу — подскажем решение и посчитаем ориентир. Или откройте калькулятор и сравните варианты.</p>
        </div>
        <a class="btn btn--solid btn--lg" href="index.html#calculator">Рассчитать стоимость</a>
      </div>
    </section>
  </main>
${footer}${mobileBar}
  <script src="js/main.js?v=${V}"></script>
</body>
</html>
`;
};

for (const page of allPages) {
  await writeFile(`${root}\\${page.slug}.html`, renderPage(page), "utf8");
  console.log("wrote", `${page.slug}.html`);
}
await writeFile(`${root}\\uslugi.html`, renderHub(), "utf8");
console.log("wrote uslugi.html");
