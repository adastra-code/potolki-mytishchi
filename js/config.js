/**
 * Настройки сайта.
 *
 * leadsEndpoint — необязательный URL вебхука (Formspree, CRM, Make/n8n,
 * собственная функция). Если он пустой, формы открывают WhatsApp
 * с уже заполненным текстом заявки.
 *
 * whatsapp — номер в международном формате без +, пробелов и скобок.
 */
window.SITE_CONFIG = {
  // FormSubmit: заявки приходят на почту. Используется случайный адрес формы,
  // чтобы email не был виден в коде сайта.
  leadsEndpoint: "https://formsubmit.co/ajax/dfea62c613dcda03fed2e09278062c66",
  whatsapp: "79919690999",
  siteName: "Академия Натяжных Потолков",
  phone: "+7 (991) 969-09-99",
  // Номер счётчика Яндекс.Метрики. Подставляется при сборке production
  // в tools/build-prod.mjs; в GitHub-копии остаётся пустым.
  metrikaId: "",
};
