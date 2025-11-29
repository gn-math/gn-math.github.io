//PiP bypass by Ashen Arrow
class PiPPlayer{constructor(t={}){this.options=Object.assign({src:null,width:420,height:720,background:"#000",ui:!0,sandbox:null,allowHtml:!1,fullPage:!1,fetchFullPage:!1,onOpen:null,onClose:null,onLoad:null,onError:null},t),this.pipWindow=null,this._closeWatcher=null,this._postHandler=null}_resolveSize(t,e="width"){if("number"==typeof t)return Math.max(100,Math.round(t));if("string"==typeof t&&t.endsWith("%")){let o=parseFloat(t)/100;if(Number.isFinite(o))return"width"===e?Math.max(200,Math.round(screen.availWidth*o)):Math.max(200,Math.round(screen.availHeight*o))}return"width"===e?420:720}async open(t=null){if(!("documentPictureInPicture"in window)){let e=Error("Document Picture-in-Picture not supported in this browser.");throw this.options.onError&&this.options.onError(e),e}let o=null,n=null,i=null,s=t||this.options.src;if(!s){let r=Error("No src/html provided to PiPPlayer.open()");throw this.options.onError&&this.options.onError(r),r}if("object"==typeof s&&null!==s)o=s.url||null,n=s.html||null,i=s.base||null;else if("string"==typeof s){let l=s.trim();"<"===l[0]&&this.options.allowHtml?n=s:o=s}else{let a=Error("Unsupported source type for PiPPlayer.open()");throw this.options.onError&&this.options.onError(a),a}if(!o&&!n){let d=Error("Neither URL nor HTML content provided.");throw this.options.onError&&this.options.onError(d),d}let c=this._resolveSize(this.options.width,"width"),p=this._resolveSize(this.options.height,"height");this.pipWindow=await documentPictureInPicture.requestWindow({width:c,height:p});try{if(this.options.fullPage&&n){let h=this._prepareFullPageHtml(n,i);this._docWrite(h)}else if(this.options.fetchFullPage&&o){let u=await fetch(o,{credentials:"same-origin"}).then(t=>t.text()),w=this._prepareFullPageHtml(u,i||o);this._docWrite(w)}else{let m=o?this._escapeHtml(o):"about:blank",$=this.options.sandbox?`sandbox="${this._escapeHtml(this.options.sandbox)}"`:"",f=n?this._escapeHtml(n):"",g=this._buildShellHtml(m,$,f);if(this._docWrite(g),n)try{let b=this.pipWindow.document,v=b.getElementById("pipFrame");v&&(v.srcdoc=(i?`<base href="${this._escapeHtml(i)}">`:"")+n)}catch(y){}}let _=t=>{try{if(!t.data||"object"!=typeof t.data)return;let e=t.data;"loaded"===e.__pip_event&&"function"==typeof this.options.onLoad&&this.options.onLoad(),"error"===e.__pip_event&&"function"==typeof this.options.onError&&this.options.onError(Error("Frame load error")),"close"===e.__pip_event&&"function"==typeof this.options.onClose&&this.options.onClose()}catch(o){}};window.addEventListener("message",_),this._postHandler=_}catch(x){this.options.onError&&this.options.onError(x),console.error("PiP inject error",x)}return this._watchClose(),"function"==typeof this.options.onOpen&&this.options.onOpen(),this.pipWindow}close(){if(this.pipWindow&&!this.pipWindow.closed){try{this.pipWindow.close()}catch(t){}this._cleanup()}}_watchClose(){this.pipWindow&&(this._closeWatcher=setInterval(()=>{(!this.pipWindow||this.pipWindow.closed)&&(clearInterval(this._closeWatcher),this._closeWatcher=null,"function"==typeof this.options.onClose&&this.options.onClose(),this.pipWindow=null)},300))}_cleanup(){this._closeWatcher&&(clearInterval(this._closeWatcher),this._closeWatcher=null),this._postHandler&&(window.removeEventListener("message",this._postHandler),this._postHandler=null),this.pipWindow=null}_docWrite(t){try{let e=this.pipWindow.document;e.open(),e.write(t),e.close()}catch(o){throw o}}_prepareFullPageHtml(t,e){let o=t;e&&/<head[^>]*>/i.test(o)&&!/<base\s/i.test(o)&&(o=o.replace(/<head([^>]*)>/i,(t,o)=>`<head${o}><base href="${this._escapeHtml(e)}">`));let n=`<script>
(function(){
  try{
    var send = function(ev){ try{ if(window.opener) window.opener.postMessage({__pip_event:ev}, '*'); }catch(e){} };
    send('loaded');
    window.addEventListener('beforeunload', function(){ send('unload'); });
    window.addEventListener('pagehide', function(){ send('unload'); });
    window.addEventListener('message', function(ev){
      try{ if(ev && ev.data && ev.data.__pip_action === 'close') { window.close(); } }catch(e){}
    });
  }catch(e){}
})();
</script>`;return/<\/body>/i.test(o)?o=o.replace(/<\/body>/i,n+"</body>"):o+=n,o}_buildShellHtml(t,e,o){return`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PiP Viewer</title>
<style>
  html,body{height:100%;width:100%;margin:0;padding:0;background:${this.options.background};overflow:hidden;font-family:system-ui,Segoe UI,Roboto,Arial;}
  :root{ --accent:#1db954; --btn-bg: rgba(255,255,255,0.06); --btn-hover: rgba(255,255,255,0.12); }
  .wrap{position:relative;height:100%;width:100%;display:flex;flex-direction:column;box-sizing:border-box;}
  iframe{flex:1;width:100%;height:100%;border:0;display:block;background:#000;transform-origin:0 0;}
  .controls-left{position:absolute;left:10px;top:10px;display:flex;gap:8px;z-index:9999;pointer-events:auto;}
  .controls-right{position:absolute;right:10px;top:10px;display:flex;gap:8px;z-index:9999;pointer-events:auto;}
  .btn{background:var(--btn-bg);border:0;padding:8px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;min-width:36px;min-height:36px;}
  .btn:hover{background:var(--btn-hover);}
  .btn svg{width:18px;height:18px;display:block;stroke:#fff;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
  .spinner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;border:4px solid rgba(255,255,255,0.08);border-top-color:var(--accent);animation:spin 1s linear infinite;z-index:900;display:none;}
  .spinner.show{display:block;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .alert{position:absolute;left:50%;top:14px;transform:translateX(-50%);background:rgba(0,0,0,0.65);color:#fff;padding:6px 10px;border-radius:8px;z-index:10000;font-size:12px;opacity:0;transition:opacity .2s;}
  .alert.show{opacity:1;}
</style>
</head>
<body>
  <div class="wrap" id="wrap">
    ${this.options.ui?`<div class="controls-left" id="controlsLeft">
      <button class="btn" id="btnBack" title="Back">${this._svg("back")}</button>
      <button class="btn" id="btnForward" title="Forward">${this._svg("forward")}</button>
      <button class="btn" id="btnReload" title="Reload">${this._svg("reload")}</button>
      <button class="btn" id="btnOpenTab" title="Open in new tab">${this._svg("external")}</button>
    </div>
    <div class="controls-right" id="controlsRight">
      <button class="btn" id="btnZoomOut" title="Zoom Out">${this._svg("zoomOut")}</button>
      <button class="btn" id="btnZoomIn" title="Zoom In">${this._svg("zoomIn")}</button>
      <button class="btn" id="btnFullscreen" title="Fullscreen">${this._svg("fullscreen")}</button>
      <button class="btn" id="btnClose" title="Close">${this._svg("close")}</button>
    </div>`:""}

    <div class="spinner" id="spinner"></div>
    <div class="alert" id="alert"></div>

    <iframe id="pipFrame" src="${t}" ${e} allow="autoplay; encrypted-media; fullscreen"></iframe>
  </div>

  <script>
  (function(){
    const frame = document.getElementById('pipFrame');
    const spinner = document.getElementById('spinner');
    const alertEl = document.getElementById('alert');
    function showSpinner(){ spinner.classList.add('show'); }
    function hideSpinner(){ spinner.classList.remove('show'); }
    function showAlert(txt, ms=1400){ try{ alertEl.textContent = txt; alertEl.classList.add('show'); setTimeout(()=>alertEl.classList.remove('show'), ms);}catch(e){} }
    showSpinner();
    frame.addEventListener('load', ()=> { hideSpinner(); try { if(window.opener) window.opener.postMessage({__pip_event:'loaded'}, '*'); } catch(e){} });
    frame.addEventListener('error', ()=> { hideSpinner(); try { if(window.opener) window.opener.postMessage({__pip_event:'error'}, '*'); } catch(e){} });
    function canAccessFrame(){ try{ return !!frame.contentWindow && !!frame.contentWindow.location && frame.contentWindow.location.href !== 'about:blank'; } catch(e){ return false; } }
    const elBack = document.getElementById('btnBack'); if(elBack) elBack.addEventListener('click', ()=>{ if(canAccessFrame()){ try{ frame.contentWindow.history.back(); return;}catch(e){} } showAlert('Back not available'); });
    const elFwd = document.getElementById('btnForward'); if(elFwd) elFwd.addEventListener('click', ()=>{ if(canAccessFrame()){ try{ frame.contentWindow.history.forward(); return;}catch(e){} } showAlert('Forward not available'); });
    const elReload = document.getElementById('btnReload'); if(elReload) elReload.addEventListener('click', ()=>{ if(canAccessFrame()){ try{ frame.contentWindow.location.reload(); return;}catch(e){} } try{ const u=new URL(frame.src, location.href); u.searchParams.set('_pip_reload', Date.now().toString(36)); frame.src = u.toString(); showSpinner(); }catch(e){ frame.src = frame.src; showSpinner(); }});
    const elOpen = document.getElementById('btnOpenTab'); if(elOpen) elOpen.addEventListener('click', ()=>{ try{ window.open(frame.src,'_blank'); }catch(e){ showAlert('Unable to open'); }});
    let zoom=1; function applyZoom(){ frame.style.transform = 'scale(' + zoom + ')'; frame.style.width = (100/zoom) + '%'; frame.style.height = (100/zoom) + '%'; }
    const elZin = document.getElementById('btnZoomIn'); if(elZin) elZin.addEventListener('click', ()=>{ zoom = Math.min(2, +(zoom + 0.1).toFixed(2)); applyZoom(); });
    const elZout = document.getElementById('btnZoomOut'); if(elZout) elZout.addEventListener('click', ()=>{ zoom = Math.max(0.5, +(zoom - 0.1).toFixed(2)); applyZoom(); });
    const elFs = document.getElementById('btnFullscreen'); if(elFs) elFs.addEventListener('click', async ()=>{ try{ if(!document.fullscreenElement){ await document.documentElement.requestFullscreen(); return;} await document.exitFullscreen(); }catch(e){ try{ await frame.requestFullscreen(); return;}catch(e){} try{ window.open(frame.src,'_blank'); }catch(e){} }});
    const elClose = document.getElementById('btnClose'); if(elClose) elClose.addEventListener('click', ()=>{ try{ if(window.opener) window.opener.postMessage({__pip_event:'close'}, '*'); }catch(e){} try{ window.close(); }catch(e){} });
    document.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape'){ try{ window.close(); } catch(e){} }});
    window.addEventListener('beforeunload', ()=>{ try{ if(window.opener) window.opener.postMessage({__pip_event:'unload'}, '*'); }catch(e){} });
  })();
  </script>
</body></html>`}_svg(t){return({close:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12"/></svg>',reload:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 12a8 8 0 1 0-2.34 5.66L20 20v-4h-4l1.66 1.66A6 6 0 1 1 18 12z"/></svg>',back:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6"/></svg>',forward:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6"/></svg>',external:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 3h7v7M10 14L21 3M5 5h5V3H3v12h2z"/></svg>',zoomIn:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM11 8v6M8 11h6"/></svg>',zoomOut:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM8 11h6"/></svg>',fullscreen:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h6M20 20h-6M4 20v-6M20 4v6"/></svg>'})[t]||""}_escapeHtml(t){return String(t).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}}window.PiPPlayer=PiPPlayer;