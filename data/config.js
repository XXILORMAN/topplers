/* Impostazioni del sito: tre valori da compilare al momento giusto. */
window.CONFIG = {
  /* Sezione Kickstarter (ricompense, stretch goal, stato, roadmap, conto alla rovescia, tasti e link marcati data-ks).
     true = visibile. A fine campagna metti false: la pagina la toglie da sola, senza toccare altro. */
  KICKSTARTER_ATTIVO: true,
  /* Link della campagna. Finche' e' vuoto i tasti Kickstarter restano spenti. */
  KICKSTARTER_URL: "",
  /* Data e ora del lancio, ISO 8601 (es. "2026-11-05T16:00:00+01:00"). Se null il conto alla rovescia dice "data in arrivo". */
  DATA_LANCIO: null,
  /* Indirizzo che riceve l'email (Formspree, Buttondown, Mailchimp...). Se vuoto il modulo conferma ma non invia niente. */
  FORM_ENDPOINT: "",
  /* Email di contatto scritta nella pagina privacy.html (obbligatoria per Google Play). Finche' e' vuota la pagina mostra un segnaposto rosso. */
  /* Profili social. Finche' un indirizzo e' vuoto il suo tasto resta spento con la scritta "in arrivo". */
  INSTAGRAM_URL: "",
  TIKTOK_URL: "",
  YOUTUBE_URL: "",
  /* Link al trailer completo (es. su YouTube). Se c'e', sotto il maxi schermo compare il tasto "Guarda il trailer completo". */
  TRAILER_URL: "",
  CONTATTO_EMAIL: "topplersofficial@gmail.com"
};
