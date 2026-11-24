/* Trình phát bản nghe cho từng chương (dữ liệu từ manifest do build-audio sinh). */
const VoicePlayer=(function(){
  const dataEl=document.getElementById('voiceData');
  let manifest={};
  try{manifest=JSON.parse(dataEl?dataEl.textContent:'{}')||{};}catch(_){manifest={};}
  if(manifest.chapters)manifest=manifest.chapters;

  let active=null; // audio đang phát ở lần mount trước

  function fmt(sec){
    sec=Math.max(0,Math.floor(Number(sec)||0));
    const m=Math.floor(sec/60),s=sec%60;
    return m+':'+String(s).padStart(2,'0');
  }
  function entryFor(file){return manifest[file]||null;}

  function html(file){
    const item=entryFor(file);
    if(!item)return '';
    const dur=item.duration?fmt(item.duration):'';
    return '<section class="voice-player" data-voice-root>'
      +'<div class="voice-head"><div>'
      +'<div class="voice-kicker">Bản nghe</div>'
      +'<h2>Nghe bài đọc</h2>'
      +'<div class="voice-voice">'+esc(item.voice||'')+(dur?' · '+dur:'')+'</div>'
      +'</div><a class="voice-dl" href="'+esc(item.audio)+'" download>Tải MP3</a></div>'
      +'<div class="voice-row">'
      +'<button class="voice-toggle" type="button" aria-label="Phát bài đọc">&#9654;</button>'
      +'<div class="voice-track">'
      +'<input class="voice-range" type="range" min="0" max="1000" step="1" value="0" aria-label="Tiến trình bài đọc">'
      +'<div class="voice-meta"><span class="voice-time">0:00</span><span class="voice-sec">Bắt đầu</span><span class="voice-dur">'+esc(dur)+'</span></div>'
      +'</div>'
      +'<select class="voice-rate" aria-label="Tốc độ đọc">'
      +'<option value="0.8">0.8&times;</option><option value="1" selected>1&times;</option><option value="1.25">1.25&times;</option><option value="1.5">1.5&times;</option>'
      +'</select>'
      +'</div></section>';
  }

  function esc(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function sectionAt(item,t){
    let label='';
    const secs=item.sections||[];
    for(const s of secs){if(s.t<=t+0.05)label=s.title;else break;}
    return label;
  }

  function mount(root,file){
    const card=root.querySelector('[data-voice-root]');
    if(!card)return;
    const item=entryFor(file);
    if(!item)return;
    if(active){active.pause();active=null;}

    const audio=new Audio(item.audio);
    audio.preload='metadata';
    active=audio;
    const btn=card.querySelector('.voice-toggle');
    const range=card.querySelector('.voice-range');
    const timeEl=card.querySelector('.voice-time');
    const secEl=card.querySelector('.voice-sec');
    const durEl=card.querySelector('.voice-dur');
    const rateEl=card.querySelector('.voice-rate');
    let seeking=false;

    const paint=()=>{
      const d=Number.isFinite(audio.duration)?audio.duration:(item.duration||0);
      const t=audio.currentTime||0;
      const pct=d?Math.min(100,t/d*100):0;
      range.value=String(Math.round(pct/100*1000));
      range.style.setProperty('--fill',pct.toFixed(2)+'%');
      timeEl.textContent=fmt(t);
      if(d)durEl.textContent=fmt(d);
      const label=sectionAt(item,t);
      secEl.textContent=label||(audio.paused?'Bắt đầu':'Đang đọc');
    };

    btn.addEventListener('click',()=>{
      if(audio.paused){
        audio.playbackRate=Number(rateEl.value)||1;
        audio.play().catch(()=>{secEl.textContent='Không phát được tệp âm thanh';});
      }else audio.pause();
    });
    audio.addEventListener('play',()=>{btn.innerHTML='&#10074;&#10074;';btn.setAttribute('aria-label','Tạm dừng');});
    audio.addEventListener('pause',()=>{btn.innerHTML='&#9654;';btn.setAttribute('aria-label','Phát bài đọc');});
    audio.addEventListener('timeupdate',()=>{if(!seeking)paint();});
    audio.addEventListener('loadedmetadata',paint);
    audio.addEventListener('ended',()=>{paint();});
    range.addEventListener('input',()=>{
      const d=Number.isFinite(audio.duration)?audio.duration:(item.duration||0);
      if(!d)return;
      seeking=true;
      audio.currentTime=Number(range.value)/1000*d;
      paint();
    });
    range.addEventListener('change',()=>{seeking=false;paint();});
    rateEl.addEventListener('change',()=>{audio.playbackRate=Number(rateEl.value)||1;});
    card.addEventListener('keydown',e=>{
      if(e.key===' '&&e.target===card){e.preventDefault();btn.click();}
    });
    paint();
  }

  function stop(){if(active){active.pause();active.currentTime=0;active=null;}}
  return {html:html,mount:mount,stop:stop,has:file=>!!entryFor(file)};
})();
window.VoicePlayer=VoicePlayer;
