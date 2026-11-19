// Intersection Observer для анімацій
const io = new IntersectionObserver(e => e.forEach(x => x.isIntersecting && x.target.classList.add('vis')),{threshold:.1});
document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

// Burger
const burger = document.getElementById('burger');
const mobNav = document.getElementById('mob-nav');
if(burger&&mobNav){
  burger.addEventListener('click',()=>{
    const open = mobNav.style.display==='flex';
    mobNav.style.display = open?'none':'flex';
  });
  mobNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobNav.style.display='none';}));
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

// Sticky
const sticky = document.getElementById('sticky');
if(sticky) window.addEventListener('scroll',()=>sticky.classList.toggle('on',scrollY>500));

// Header shadow
const hdr = document.getElementById('header');
if(hdr) window.addEventListener('scroll',()=>hdr.style.boxShadow=scrollY>20?'0 4px 24px rgba(0,0,0,.1)':'none');

// Lightbox
function openLb(el){
  const img=el.querySelector('img');
  document.getElementById('lb-img').src=img.src;
  document.getElementById('lb').classList.add('on');
  document.body.style.overflow='hidden';
}
function closeLb(){
  document.getElementById('lb').classList.remove('on');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});

// Subpage nav toggle
document.querySelectorAll('.nav-toggle').forEach(b=>b.addEventListener('click',()=>b.parentElement.querySelector('.nav')?.classList.toggle('open')));

// 2026 motion: scroll progress + staged reveal
(function(){
  const bar=document.createElement('div');bar.className='scroll-bar';bar.setAttribute('aria-hidden','true');document.body.prepend(bar);
  if(!('IntersectionObserver' in window))return;
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.section .container > *, .srv-card, .why-card, .faq-item, .step-item, .price-table, .page-hero__inner > *').forEach((el,i)=>{
    el.classList.add('reveal');el.style.setProperty('--d',(i%4)*80+'ms');ro.observe(el);
  });
})();
