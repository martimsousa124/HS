/* ==========================================================
   Casa Maré · script.js
   ========================================================== */

/* ---------- CONFIGURAÇÃO DO MOTOR DE RESERVAS ----------
   Quando escolher o motor (Cloudbeds, Amenitiz, Sirvoy, Booking, Airbnb...),
   preencha este objeto e/ou implemente a função `searchAvailability`. */
const BOOKING_CONFIG = {
  provider: null,        // ex.: 'cloudbeds' | 'amenitiz' | 'sirvoy'
  endpoint: '',          // URL da API ou do motor de reservas
  redirectUrl: ''        // alternativa: redirecionar para a página do motor com os parâmetros
};

/**
 * PONTO DE INTEGRAÇÃO
 * Recebe { checkin, checkout, guests } e devolve uma Promise.
 * Substituir o corpo desta função pela chamada real à API.
 */
async function searchAvailability({ checkin, checkout, guests }) {
  // Exemplo de ligação futura:
  // const qs = new URLSearchParams({ checkin, checkout, guests });
  // if (BOOKING_CONFIG.redirectUrl) { window.location.href = `${BOOKING_CONFIG.redirectUrl}?${qs}`; return; }
  // const res = await fetch(`${BOOKING_CONFIG.endpoint}?${qs}`);
  // return res.json();

  console.info('[Reservas] Pedido preparado:', { checkin, checkout, guests });
  return new Promise(resolve => setTimeout(() => resolve({ demo: true }), 600));
}

/* ---------- UTILITÁRIOS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const toISO = d => d.toISOString().split('T')[0];

/* ---------- HEADER & MENU MÓVEL ---------- */
const header = $('#header');
const nav = $('#nav');
const navToggle = $('#navToggle');

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

/* ---------- ANIMAÇÕES AO SCROLL ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 90}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ---------- FORMULÁRIO DE RESERVAS ---------- */
const form = $('#bookingForm');
const msg = $('#bookingMsg');
const checkin = $('#checkin');
const checkout = $('#checkout');

const today = new Date();
const tomorrow = new Date(today.getTime() + 864e5);
checkin.min = toISO(today);
checkout.min = toISO(tomorrow);

checkin.addEventListener('change', () => {
  const next = new Date(new Date(checkin.value).getTime() + 864e5);
  checkout.min = toISO(next);
  if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  if (!data.checkin || !data.checkout || data.checkout <= data.checkin) {
    msg.textContent = 'Por favor, escolha datas de check-in e check-out válidas.';
    return;
  }

  const nights = Math.round((new Date(data.checkout) - new Date(data.checkin)) / 864e5);
  msg.textContent = 'A verificar disponibilidade…';
  try {
    await searchAvailability(data);
    msg.textContent = `Pedido registado: ${nights} noite(s), ${data.guests} hóspede(s). (Modo demonstração — ligar ao motor de reservas.)`;
  } catch (err) {
    console.error(err);
    msg.textContent = 'Não foi possível verificar agora. Tente novamente ou contacte-nos.';
  }
});

/* Botões "Ver Detalhes": sobem à barra de reservas e guardam a suíte escolhida */
document.querySelectorAll('[data-suite]').forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.setItem('suite', btn.dataset.suite);
    $('#inicio').scrollIntoView({ behavior: 'smooth' });
    checkin.focus({ preventScroll: true });
  })
);

/* ---------- NEWSLETTER & CONTACTO (simulados) ---------- */
$('#newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#newsMsg').textContent = 'Obrigado! Subscrição registada.';
  e.target.reset();
});
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  alert('Obrigado pela sua mensagem! Entraremos em contacto brevemente.');
  e.target.reset();
});

/* ---------- ANO NO RODAPÉ ---------- */
$('#year').textContent = new Date().getFullYear();
