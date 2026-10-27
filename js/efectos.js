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
  function lluviaEspeluznante(){
    const capa=document.createElement("div"); capa.className="lluvia-espeluznante"; capa.setAttribute("aria-hidden","true"); document.body.appendChild(capa);
    const figuras=["🦴","🦇","💀","🎃","🦴","🦇","👻","🎃","☠️","🦇","💀","🦴"];
    for(let i=0;i<64;i++){const pieza=document.createElement("span");pieza.className="pieza-voladora";pieza.textContent=figuras[Math.floor(Math.random()*figuras.length)];pieza.style.left=(Math.random()*100)+"%";pieza.style.setProperty("--dx",((Math.random()-.5)*440)+"px");pieza.style.setProperty("--rot",((Math.random()-.5)*1100)+"deg");pieza.style.setProperty("--dur",(1.4+Math.random()*2.2)+"s");pieza.style.setProperty("--delay",(Math.random()*.45)+"s");pieza.style.fontSize=(20+Math.random()*30)+"px";capa.appendChild(pieza)}
    window.setTimeout(()=>capa.remove(),4300);
  }
  $("abrirInvitacion").addEventListener("click", () => {
    lluviaEspeluznante(); const boton=$("abrirInvitacion"); boton.textContent="💀 ¡Sorpresa!"; boton.disabled=true;
    portada.classList.add("fuera"); invitacion.hidden = false;
    window.setTimeout(() => { portada.hidden = true; window.scrollTo({top:0,behavior:"smooth"}); }, 750);
  });
  let reproductorYT = null;
  let apiYTLista = !!(window.YT && window.YT.Player);
  let cargandoYT = false;
  let cerrandoVideo = false;
  let videoTerminado = false;
  let vigilanciaFinVideo = null;

  function efectoTeleAntigua() {
    if (cerrandoVideo) return;
    cerrandoVideo = true;
    if (vigilanciaFinVideo) { clearInterval(vigilanciaFinVideo); vigilanciaFinVideo = null; }
    try { if (reproductorYT && reproductorYT.stopVideo) reproductorYT.stopVideo(); } catch (_) {}
    const efecto = document.createElement("div");
    efecto.className = "apagado-tele";
    efecto.setAttribute("aria-hidden", "true");
    efecto.innerHTML = '<span class="apagado-linea"></span>';
    modal.appendChild(efecto);
    window.setTimeout(() => {
      try { if (reproductorYT && reproductorYT.destroy) reproductorYT.destroy(); } catch (_) {}
      reproductorYT = null;
      contenedorVideo.replaceChildren();
      efecto.remove();
      modal.classList.remove("abierto");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      cerrandoVideo = false;
      videoTerminado = false;
    }, 760);
  }

  function crearReproductorYT() {
    if (!apiYTLista || !window.YT || !window.YT.Player ||
        !modal.classList.contains("abierto") || cerrandoVideo ||
        reproductorYT || !document.getElementById("reproductorAtaud")) return;
    reproductorYT = new YT.Player("reproductorAtaud", {
      width: "100%",
      height: "100%",
      videoId: "5xaJE-PWyLs",
      playerVars: {
        autoplay: 1, controls: 0, disablekb: 1, fs: 0, playsinline: 1,
        rel: 0, modestbranding: 1, iv_load_policy: 3, loop: 0,
        cc_load_policy: 0, origin: window.location.origin
      },
      events: {
        onReady: event => {
          // Inicia una sola reproducción y vigila el final como respaldo por si YouTube no emite ENDED.
          try {
            event.target.setLoop(false);
            event.target.playVideo();
          } catch (_) {}
          if (vigilanciaFinVideo) clearInterval(vigilanciaFinVideo);
          // Respaldo firme: cierra al llegar al final estimado aunque Shorts/iframe
          // no emita ENDED o vuelva a empezar la reproducción.
          const inicioReproduccion = Date.now();
          vigilanciaFinVideo = window.setInterval(() => {
            if (cerrandoVideo || videoTerminado || !reproductorYT) return;
            try {
              const duracion = Number(reproductorYT.getDuration()) || 0;
              const actual = Number(reproductorYT.getCurrentTime()) || 0;
              const estado = reproductorYT.getPlayerState();
              const llegoAlFinal = duracion > 0 && actual >= duracion - 0.8;
              const excedioDuracion = duracion > 0 && Date.now() - inicioReproduccion >= (duracion + 2.5) * 1000;
              const excedioLimiteSeguro = Date.now() - inicioReproduccion >= 180000;
              if (llegoAlFinal || excedioDuracion || excedioLimiteSeguro || estado === YT.PlayerState.ENDED) {
                videoTerminado = true;
                try { reproductorYT.pauseVideo(); reproductorYT.seekTo(0, true); } catch (_) {}
                efectoTeleAntigua();
              }
            } catch (_) {
              if (Date.now() - inicioReproduccion >= 180000) {
                videoTerminado = true;
                efectoTeleAntigua();
              }
            }
          }, 250);
        },
        onStateChange: event => {
          if (event.data === YT.PlayerState.ENDED && !videoTerminado) {
            videoTerminado = true;
                    efectoTeleAntigua();
          }
        },
        onError: event => {
          // No cerrar el ataúd automáticamente: un error de YouTube no debe
          // disparar el efecto de apagado antes de que el usuario vea el reproductor.
          console.warn("YouTube no pudo reproducir el video. Código:", event.data);
          const aviso = document.getElementById("avisoVideoError");
          if (aviso) {
            aviso.hidden = false;
            aviso.textContent = "YouTube no pudo cargar este video (código " + event.data + "). Comprueba que el video permita inserción y que haya conexión.";
          } else {
            const mensaje = document.createElement("p");
            mensaje.id = "avisoVideoError";
            mensaje.className = "aviso-video-error";
            mensaje.setAttribute("role", "status");
            mensaje.textContent = "YouTube no pudo cargar este video (código " + event.data + "). Comprueba que el video permita inserción y que haya conexión.";
            contenedorVideo.appendChild(mensaje);
          }
        }
      }
    });
  }

  function cargarAPIYouTube() {
    if (window.YT && window.YT.Player) {
      apiYTLista = true;
      crearReproductorYT();
      return;
    }
    if (cargandoYT) return;
    cargandoYT = true;
    const callbackAnterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof callbackAnterior === "function") {
        try { callbackAnterior(); } catch (_) {}
      }
      apiYTLista = true;
      cargandoYT = false;
      crearReproductorYT();
    };
    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.dataset.youtubeIframeApi = "true";
      document.head.appendChild(tag);
    }
  }

  function abrirVideoAtaud() {
    if (modal.classList.contains("abierto") || cerrandoVideo) return;
    videoTerminado = false;
    contenedorVideo.innerHTML = '<div id="reproductorAtaud" class="reproductor-vertical"></div><p id="avisoVideoError" class="aviso-video-error" hidden></p>';
    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lluviaAtaud();
    cargarAPIYouTube();
  }
  $("abrirVideo").addEventListener("click", abrirVideoAtaud);
  const cerrarVideoBtn = $("cerrarVideo");
  if (cerrarVideoBtn) cerrarVideoBtn.addEventListener("click", efectoTeleAntigua);
  modal.addEventListener("click", event => { if (event.target === modal) efectoTeleAntigua(); });
  // Araña pequeña que baja con un hilo corto unido a ella; sin raya blanca por toda la pantalla.
  let aranaIniciada = false;
  function iniciarAranaColgante() {
    if (aranaIniciada) return;
    aranaIniciada = true;
    const hilo = document.createElement("span");
    hilo.className = "arana-hilo";
    hilo.setAttribute("aria-hidden", "true");
    const araña = document.createElement("span");
    araña.className = "arana-colgante";
    araña.textContent = "🕷️";
    araña.setAttribute("aria-hidden", "true");
    document.body.append(hilo, araña);
    function bajar() {
      if (!invitacion || invitacion.hidden) { hilo.remove(); araña.remove(); aranaIniciada = false; return; }
      const ancho = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const x = 28 + Math.random() * Math.max(1, ancho - 56);
      const duracion = 18 + Math.random() * 7;
      araña.style.left = x + "px";
      araña.style.setProperty("--arana-x", x + "px");
      araña.style.setProperty("--arana-duracion", duracion + "s");
      hilo.style.left = x + "px";
      hilo.style.height = "0px";
      araña.style.animation = "none"; void araña.offsetHeight; araña.style.animation = "";
      const inicio = performance.now();
      function actualizarHilo(ahora) {
        if (!araña.isConnected) return;
        const alto = Math.max(0, araña.getBoundingClientRect().top + araña.offsetHeight * .35);
        hilo.style.height = Math.min(window.innerHeight, alto) + "px";
        if (ahora - inicio < duracion * 1000) requestAnimationFrame(actualizarHilo);
      }
      requestAnimationFrame(actualizarHilo);
      window.setTimeout(bajar, duracion * 1000 + 1800);
    }
    bajar();
  }
  function lluviaAtaud() {
    const capa = document.createElement("div");
    capa.className = "lluvia-espeluznante lluvia-ataud";
    capa.setAttribute("aria-hidden", "true");
    document.body.appendChild(capa);
    const figuras = ["🌼","🌼","💀","🦴","🦴","💀","🌼","🕯️","🌸","☠️"];
    for (let i = 0; i < 42; i++) {
      const pieza = document.createElement("span");
      pieza.className = "pieza-voladora";
      pieza.textContent = figuras[Math.floor(Math.random() * figuras.length)];
      pieza.style.left = (Math.random() * 100) + "%";
      pieza.style.setProperty("--dx", ((Math.random() - .5) * 360) + "px");
      pieza.style.setProperty("--rot", ((Math.random() - .5) * 900) + "deg");
      pieza.style.setProperty("--dur", (1.1 + Math.random() * 1.8) + "s");
      pieza.style.setProperty("--delay", (Math.random() * .18) + "s");
      pieza.style.fontSize = (20 + Math.random() * 26) + "px";
      capa.appendChild(pieza);
    }
    window.setTimeout(() => capa.remove(), 3300);
  }
  $("abrirInvitacion").addEventListener("click", () => { window.setTimeout(iniciarAranaColgante, 850); });
  const canvas=$("chispas"),ctx=canvas.getContext("2d");let w=0,h=0,particles=[];
  function resize(){const dpr=Math.min(window.devicePixelRatio||1,2);w=window.innerWidth;h=window.innerHeight;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(75,Math.floor(w/8))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.5,vy:Math.random()*.55+.12,vx:(Math.random()-.5)*.25,a:Math.random()*.7+.2,hue:[35,285,325,170][Math.floor(Math.random()*4)]}))}
  let last=0;function draw(t){if(t-last>32){last=t;ctx.clearRect(0,0,w,h);for(const p of particles){p.y-=p.vy;p.x+=p.vx;if(p.y<-5){p.y=h+5;p.x=Math.random()*w}if(p.x<-5)p.x=w+5;if(p.x>w+5)p.x=-5;ctx.globalAlpha=p.a*(.6+.4*Math.sin(t/700+p.x));ctx.fillStyle=p.hue===0?`rgba(255,255,255,${p.a})`:`hsl(${p.hue} 100% 68%)`;ctx.shadowBlur=10;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.shadowBlur=0}requestAnimationFrame(draw)}
  window.addEventListener("resize",resize,{passive:true});resize();requestAnimationFrame(draw);

  // Revelar la sorpresa con un efecto al llegar a ella al desplazarse por la página.
  const bloqueSorpresa = document.querySelector(".sorpresa-recre");
  if (bloqueSorpresa) {
    if ("IntersectionObserver" in window) {
      const observadorSorpresa = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            bloqueSorpresa.classList.add("sorpresa-visible");
            observadorSorpresa.unobserve(bloqueSorpresa);
          }
        }
      }, { threshold: 0.22 });
      observadorSorpresa.observe(bloqueSorpresa);
    } else {
      bloqueSorpresa.classList.add("sorpresa-visible");
    }
  }
})();