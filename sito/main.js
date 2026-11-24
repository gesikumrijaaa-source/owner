// Menu mobile
const nav=document.querySelector('.nav'),toggle=document.querySelector('.nav__toggle');
toggle.addEventListener('click',()=>{const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',o)});
document.querySelectorAll('.nav__links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded',false)}));
// Anno nel footer
document.getElementById('year').textContent=new Date().getFullYear();
// Animazioni all'ingresso
const io='IntersectionObserver' in window&&new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
if(io)document.querySelectorAll('.section h2,.card,.steps li,.pain li,details,.form').forEach(el=>{el.classList.add('reveal');io.observe(el)});
// Invio form senza lasciare la pagina (Formspree)
const form=document.querySelector('.form'),status=form.querySelector('.form__status');
form.addEventListener('submit',async e=>{
  if(form.action.includes('TUO_ID')){e.preventDefault();status.textContent='Form non ancora collegato: configura Formspree (vedi README).';return}
  e.preventDefault();status.textContent='Invio in corso...';
  try{const r=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
    if(r.ok){form.reset();status.textContent='Grazie! Ti ricontattiamo entro 24 ore lavorative.'}else throw 0}
  catch{status.textContent='Qualcosa è andato storto. Scrivici via email o WhatsApp.'}
});
