/* Beweging: cijfers tellen op, lijnen tekenen zich, kaarten verschijnen na elkaar. */
(()=>{document.documentElement.classList.add('js');
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const fmt=new Intl.NumberFormat('nl-NL');
const run=(el)=>{const end=+el.dataset.count,dec=+(el.dataset.dec||0),dur=1400,t0=performance.now();
 const f=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);
  el.textContent=(dec?(end*e).toFixed(dec).replace('.',','):fmt.format(Math.round(end*e)))+(el.dataset.suffix||'');
  if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
 const t=e.target;t.classList.add('is-in');if('count' in t.dataset)run(t);io.unobserve(t)}),{threshold:.4});
document.querySelectorAll('[data-count],[data-bewijs-line],[data-bewijs-item]').forEach((e,i)=>{if(e.hasAttribute('data-bewijs-item'))e.style.setProperty('--i',i%6);io.observe(e)});})();
