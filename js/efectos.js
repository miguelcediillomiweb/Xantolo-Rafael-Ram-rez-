(() => {
  const config = window.INVITACION_CONFIG || {};
  const $ = id => document.getElementById(id);
  const portada = $("portada"), invitacion = $("invitacion"), modal = $("modalVideo"), contenedorVideo = $("contenedorVideo");
  $("horaEvento").textContent = config.hora || "Horario por confirmar";
  $("lugarEvento").textContent = config.lugar || "Escuela Primaria Rafael Ramírez";
  // Cuenta regresiva al jueves 29 de octubre de 2026, a las 8:30 a. m. hora de México.
  const fechaCelebracion = new Date("2026-10-29T08:30:00-06:00").getTime();
  function actualizarCuenta() {
    let restante = fechaCelebracion - Date.now();
    if (restante <= 0) {
      ["cuentaDias","cuentaHoras","cuentaMinutos","cuentaSegundos"].forEach(id => { const el = $(id); if(el) el.textContent = "00"; });
      const mensaje = $("cuentaMensaje"); if (mensaje) mensaje.textContent = "🎉 ¡Hoy es la celebración! ¡Te esperamos!";
      return;
    }
    const dias = Math.floor(restante / 86400000); restante %= 86400000;
    const horas = Math.floor(restante / 3600000); restante %= 3600000;
    const minutos = Math.floor(restante / 60000); restante %= 60000;
    const segundos = Math.floor(restante / 1000);
    [["cuentaDias",dias],["cuentaHoras",horas],["cuentaMinutos",minutos],["cuentaSegundos",segundos]].forEach(([id,n]) => { const el=$(id); if(el) el.textContent=String(n).padStart(2,"0"); });
  }
  actualizarCuenta(); window.setInterval(actualizarCuenta,1000);
  $("abrirInvitacion").addEventListener("click", () => {
    portada.classList.add("fuera"); invitacion.hidden = false;
    window.setTimeout(() => { portada.hidden = true; window.scrollTo({top:0,behavior:"smooth"}); }, 750);
  });
  function videoHTML(url) {
    const raw = (url || "").trim();
    if (!raw) return '<div class="sin-video"><p>🎃 Falta configurar el video</p><p>Abre <code>js/config.js</code> y pega el enlace de YouTube o la ruta del archivo MP4 en <code>video</code>.</p></div>';
    const yt = raw.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" title="Video de Halloween" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    if (/\.mp4(?:[?#].*)?$/i.test(raw) || raw.startsWith("video/")) { const safe = raw.replace(/&/g,"&amp;").replace(/"/g,"&quot;"); return `<video src="${safe}" controls autoplay playsinline preload="metadata">Tu navegador no puede reproducir este video.</video>`; }
    return '<div class="sin-video"><p>⚠️ No reconozco el enlace.</p><p>Usa un enlace de YouTube o la ruta de un archivo MP4.</p></div>';
  }
  $("abrirVideo").addEventListener("click", () => { contenedorVideo.innerHTML = videoHTML(config.video); modal.classList.add("abierto"); modal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; $("cerrarVideo").focus(); });
  function cerrarVideo(){ modal.classList.remove("abierto"); modal.setAttribute("aria-hidden","true"); contenedorVideo.innerHTML=""; document.body.style.overflow=""; $("abrirVideo").focus(); }
  $("cerrarVideo").addEventListener("click",cerrarVideo); modal.addEventListener("click",e=>{if(e.target===modal)cerrarVideo()}); document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("abierto"))cerrarVideo()});
  const style=document.createElement("style"); style.textContent='.sin-video{height:100%;min-height:180px;display:grid;place-content:center;padding:20px;color:#fff0ce;text-align:center;background:radial-gradient(circle,#35164d,#050208)}.sin-video p{margin:6px}.sin-video code{color:#ffd36b;overflow-wrap:anywhere}'; document.head.appendChild(style);
  const canvas=$("chispas"),ctx=canvas.getContext("2d");let w=0,h=0,particles=[];
  function resize(){const dpr=Math.min(window.devicePixelRatio||1,2);w=window.innerWidth;h=window.innerHeight;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(75,Math.floor(w/8))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.5,vy:Math.random()*.55+.12,vx:(Math.random()-.5)*.25,a:Math.random()*.7+.2,hue:[35,285,325,170][Math.floor(Math.random()*4)]}))}
  let last=0;function draw(t){if(t-last>32){last=t;ctx.clearRect(0,0,w,h);for(const p of particles){p.y-=p.vy;p.x+=p.vx;if(p.y<-5){p.y=h+5;p.x=Math.random()*w}if(p.x<-5)p.x=w+5;if(p.x>w+5)p.x=-5;ctx.globalAlpha=p.a*(.6+.4*Math.sin(t/700+p.x));ctx.fillStyle=`hsl(${p.hue} 100% 68%)`;ctx.shadowBlur=10;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.shadowBlur=0}requestAnimationFrame(draw)}
  window.addEventListener("resize",resize,{passive:true});resize();requestAnimationFrame(draw);
})();