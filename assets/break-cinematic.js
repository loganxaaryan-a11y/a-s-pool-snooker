/* A.S. Pool & Snooker — optional cinematic canvas break.
   No external rendering/physics dependencies. Does not block the regular directory.
   The cue ball strikes a 15-ball rack. Branch choices are accessible DOM controls. */
(() => {
  'use strict';
  function init() {
    const byId = id => document.getElementById(id);
    const section = byId('break-experience');
    const stage = byId('break-stage');
    const play = byId('break-play');
    const canvas = byId('break-canvas');
    const ctx = canvas?.getContext('2d', {alpha:false});
    const poster = byId('break-photo-trigger');
    const trigger = byId('break-trigger');
    const skip = byId('break-skip');
    const reset = byId('break-reset');
    const result = byId('break-results');
    const grid = byId('break-results-grid');
    const announcer = byId('break-live-status');
    const stageNote = byId('break-stage-note');
    const locations = Array.isArray(window.CLUB_LOCATIONS) ? window.CLUB_LOCATIONS : [];
    if (!ctx || !section || !locations.length || !poster || !trigger || !skip || !reset) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const palette = ['#e3bd47','#285baa','#c3453c','#744790','#ec8c27','#167c58','#963e37','#121414','#a2b5cc','#d9bd56','#477ec3','#bd5a4d','#7863af','#bd762f','#349d7f'];
    let world = {}, balls = [], cue = null, mode = 'ready', portrait = false;
    let frame = 0, last = 0, clock = 0, fired = false, hitAt = -100, settledAt = -100;
    let sizingObserver = null;

    function roundRect(x,y,w,h,r) {
      if (ctx.roundRect) {ctx.beginPath();ctx.roundRect(x,y,w,h,r);} else {ctx.beginPath();ctx.rect(x,y,w,h);}
    }
    function size() {
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      portrait = bounds.width < 565;
      const W = portrait ? 380 : 860;
      const H = portrait ? 416 : 398;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      ctx.setTransform(canvas.width/W, 0, 0, canvas.height/H, 0, 0);
      world = {W,H,r:portrait?12:13.7,pad:portrait?26:30};
      if(mode==='ready') setRack();
      paint();
    }
    function ball(x,y,id) {return {x,y,id,r:world.r, vx:0,vy:0,angle:0,striped:id>8};}
    function setRack() {
      const {W,H,r} = world;
      cue=portrait ? ball(W/2,H-69,0) : ball(W*.215,H/2,0);
      balls=[];
      const rowPitch=Math.sqrt(3)*r + 0.34;
      const spacing=2*r + 0.22;
      // An American 8-ball rack: the 8 is in the middle, the corner balls differ.
      const order=[1,10,3,6,8,14,12,7,2,15,4,13,5,9,11];
      let k=0;
      for(let row=0;row<5;row++){
        for(let pos=0;pos<=row;pos++){
          const side=(pos-row/2)*spacing;
          let x,y;
          if(portrait){x=W/2+side;y=H*.53-row*rowPitch;}
          else{x=W*.615+row*rowPitch;y=H/2+side;}
          const b=ball(x,y,order[k++]);
          b.row=row;
          balls.push(b);
        }
      }
    }
    function feltSurface() {
      const {W,H,pad} = world;
      // Wood rails, cushion lips, felt texture and pockets: restrained 2.5D material shading.
      const wood=ctx.createLinearGradient(0,0,0,H);
      wood.addColorStop(0,'#513a27');wood.addColorStop(.25,'#b38a57');wood.addColorStop(.55,'#543722');wood.addColorStop(1,'#1c1c16');
      ctx.fillStyle='#071009';ctx.fillRect(0,0,W,H);
      roundRect(2,2,W-4,H-4,18);ctx.fillStyle=wood;ctx.fill();
      roundRect(11,11,W-22,H-22,14);ctx.fillStyle='#0e1511';ctx.fill();
      roundRect(18,18,W-36,H-36,13);
      const cushion=ctx.createLinearGradient(0,0,0,H);
      cushion.addColorStop(0,'#13492d');cushion.addColorStop(.5,'#123d2b');cushion.addColorStop(1,'#031d17');
      ctx.fillStyle=cushion;ctx.fill();
      const field=ctx.createRadialGradient(W*.44,H*.39,10,W*.5,H*.5,Math.max(W,H)*.70);
      field.addColorStop(0,'#248558');field.addColorStop(.62,'#10623e');field.addColorStop(1,'#063820');
      roundRect(pad,pad,W-2*pad,H-2*pad,8);ctx.fillStyle=field;ctx.fill();
      ctx.save();roundRect(pad,pad,W-2*pad,H-2*pad,8);ctx.clip();
      ctx.globalAlpha=.11;ctx.strokeStyle='#abcf9f';ctx.lineWidth=.5;
      for(let i=0;i<80;i++){
        const t=(i*37.4)%W, y=pad+(i*47.83)%(H-2*pad);
        ctx.beginPath();ctx.moveTo(t,y);ctx.lineTo(t+19,y+1.3);ctx.stroke();
      }
      ctx.restore();
      const shade=ctx.createLinearGradient(0,0,W,H);
      shade.addColorStop(0,'#ffffff19');shade.addColorStop(.47,'#ffffff02');shade.addColorStop(1,'#00000032');
      roundRect(pad,pad,W-pad*2,H-pad*2,8);ctx.fillStyle=shade;ctx.fill();
      ctx.strokeStyle='#0000005f';ctx.lineWidth=5;ctx.stroke();
      ctx.lineWidth=1.2;ctx.strokeStyle='#b8a57d99';roundRect(13,13,W-26,H-26,13);ctx.stroke();
      ctx.fillStyle='#050c0b';
      const pocketR=portrait?11:12;
      [[pad,pad],[W/2,pad],[W-pad,pad],[pad,H-pad],[W/2,H-pad],[W-pad,H-pad]].forEach(([x,y])=>{
        ctx.beginPath();ctx.arc(x,y,pocketR,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#1e291f';ctx.lineWidth=3;ctx.stroke();
      });
      ctx.fillStyle='#e0c18a77';
      if(!portrait){for(let k=1;k<8;k++){if(k===4)continue;const x=pad+(W-2*pad)*k/8;ctx.beginPath();ctx.moveTo(x,13);ctx.lineTo(x+4,16);ctx.lineTo(x,20);ctx.lineTo(x-4,16);ctx.fill();}}
    }
    function drawBall(b) {
      const {x,y,r,id}=b;
      ctx.save();
      // Soft, offset shadow underneath the sphere.
      ctx.beginPath();ctx.ellipse(x+2.4,y+r*.68,r*.93,r*.45,0,0,2*Math.PI);ctx.fillStyle='#001107a1';ctx.filter='blur(3px)';ctx.fill();ctx.filter='none';
      const color=id===0?'#f6f0df':palette[(id-1+palette.length)%palette.length];
      ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);
      const sphere=ctx.createRadialGradient(x-r*.42,y-r*.55,r*.07,x+r*.23,y+r*.38,r*1.38);
      if(id===0){sphere.addColorStop(0,'#ffffff');sphere.addColorStop(.65,'#edeae0');sphere.addColorStop(1,'#868e83');}
      else if(id===8){sphere.addColorStop(0,'#55595a');sphere.addColorStop(.30,'#171d1f');sphere.addColorStop(.78,'#05090a');sphere.addColorStop(1,'#000100');}
      else{sphere.addColorStop(0,'#ffffff');sphere.addColorStop(.14,color);sphere.addColorStop(.70,color);sphere.addColorStop(1,'#151710');}
      ctx.fillStyle=sphere;ctx.fill();ctx.clip();
      if(b.striped && id!==8){
        // Wide band across a lighter striped pool ball.
        ctx.fillStyle='#f4f3e9';ctx.fillRect(x-r,y-r*.95,2*r,r*.58);
        ctx.fillRect(x-r,y+r*.45,2*r,r*.70);
      }
      ctx.beginPath();ctx.ellipse(x-r*.32,y-r*.53,r*.28,r*.16,-.45,0,2*Math.PI);ctx.fillStyle='#ffffff97';ctx.fill();
      if(id!==0){
        ctx.beginPath();ctx.ellipse(x,y,r*.40,r*.41,.1,0,2*Math.PI);ctx.fillStyle='#faf7eb';ctx.fill();
        ctx.fillStyle='#17231c';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`700 ${r*.69}px "Arial",sans-serif`;ctx.fillText(String(id),x,y+0.4);
      }
      ctx.restore();
    }
    function drawCue() {
      const {W,H}=world;
      if (mode==='finished') return;
      const active = mode==='playing';
      let t=clock;
      let fade=active?Math.max(0,1-Math.max(0,t-.55)*2.8):1;
      if(fade<=0)return;
      const tipDistance=world.r+5;
      const tap=active?Math.min(t/.30,1):0;
      const retract=active?Math.max(0,(t-.4)*125):0;
      ctx.save();ctx.globalAlpha=fade;ctx.lineCap='round';ctx.shadowColor='#08130e99';ctx.shadowBlur=7;ctx.shadowOffsetY=3;
      const start=portrait ? [world.W/2,H-15+tap*14+retract] : [22-tap*16-retract,H/2];
      const end=portrait ? [world.W/2,cue.y+tipDistance+tap*14+retract] : [cue.x-tipDistance-tap*14-retract,H/2];
      const g=ctx.createLinearGradient(start[0],start[1],end[0],end[1]);
      g.addColorStop(0,'#81542d');g.addColorStop(.65,'#d5b687');g.addColorStop(.92,'#efe0ad');g.addColorStop(1,'#e9ddcb');
      ctx.strokeStyle=g;ctx.lineWidth=portrait?7:6;ctx.beginPath();ctx.moveTo(...start);ctx.lineTo(...end);ctx.stroke();
      ctx.shadowBlur=0;ctx.strokeStyle='#f5f0d3';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...start);ctx.lineTo(...end);ctx.stroke();ctx.restore();
    }
    function impactAccent() {
      if(hitAt<0)return;
      const t=clock-hitAt;
      if(t<0||t>.30)return;
      const center=portrait?[world.W/2,world.H*.53]:[world.W*.615,world.H/2];
      ctx.save();ctx.globalAlpha=(1-t/.3)*.38;ctx.strokeStyle='#f3ecc3';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(...center,17+t*170,0,2*Math.PI);ctx.stroke();ctx.restore();
    }
    function paint() {
      if(!world.W)return;
      ctx.clearRect(0,0,world.W,world.H);
      feltSurface();drawCue();
      for(const b of balls)drawBall(b);
      if(cue)drawBall(cue);
      impactAccent();
    }
    function physics(dt){
      if(clock>.27 && !fired){
        fired=true;
        if(portrait){cue.vy=-570;cue.vx=.22;}else{cue.vx=850;cue.vy=.25;}
      }
      const all=[cue,...balls];
      const {W,H,pad}=world, radius=world.r;
      for(const b of all){
        if(!b)continue;
        b.x+=b.vx*dt;b.y+=b.vy*dt;
        const damping=Math.exp(-1.48*dt);
        b.vx*=damping;b.vy*=damping;
        if(Math.abs(b.vx)<.7)b.vx=0;if(Math.abs(b.vy)<.7)b.vy=0;
        if(b.x<pad+radius){b.x=pad+radius;b.vx=Math.abs(b.vx)*.79;}
        if(b.x>W-pad-radius){b.x=W-pad-radius;b.vx=-Math.abs(b.vx)*.79;}
        if(b.y<pad+radius){b.y=pad+radius;b.vy=Math.abs(b.vy)*.79;}
        if(b.y>H-pad-radius){b.y=H-pad-radius;b.vy=-Math.abs(b.vy)*.79;}
      }
      // Equal-mass circular collision response with restitution and overlap correction.
      for(let i=0;i<all.length;i++) for(let j=i+1;j<all.length;j++){
        const a=all[i],b=all[j];if(!a||!b)continue;
        const dx=b.x-a.x,dy=b.y-a.y,dist2=dx*dx+dy*dy,diameter=2*radius;
        if(dist2>=diameter*diameter)continue;
        const dist=Math.max(.0001,Math.sqrt(dist2)),nx=dx/dist,ny=dy/dist;
        const overlap=diameter-dist;
        a.x-=nx*overlap*.5;b.x+=nx*overlap*.5;
        a.y-=ny*overlap*.5;b.y+=ny*overlap*.5;
        const vel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(vel>=0)continue;
        const impulse=-(1+.91)*vel/2;
        a.vx-=impulse*nx;a.vy-=impulse*ny;
        b.vx+=impulse*nx;b.vy+=impulse*ny;
        if(hitAt<0 && (a===cue||b===cue)) {
          hitAt=clock;
          // A restrained, stylized shock transfer through the tightly packed rack.
          // Physical collisions continue to run afterward; this supplies visible
          // separation at small display sizes instead of a barely moving cluster.
          balls.forEach((other,index)=>{
            const lateral=portrait?(other.x-world.W/2):(other.y-world.H/2);
            const direction=(lateral===0 ? (index%2 ? 1:-1) : Math.sign(lateral));
            const spread=direction*(32 + Math.abs(lateral)*1.5)+(index%3-1)*9;
            const forward=65 + other.row*26 + (index%4)*7;
            if(portrait){other.vx+=spread;other.vy-=forward;}
            else{other.vy+=spread;other.vx+=forward;}
          });
        }
      }
    }
    function loop(now){
      if(mode!=='playing')return;
      if(!last)last=now;
      const dt=Math.min(.035,(now-last)/1000);last=now;
      clock+=dt;
      // Fixed substeps avoid balls tunneling through the tightly packed rack.
      const steps=Math.max(1,Math.ceil(dt/(1/180)));
      for(let i=0;i<steps;i++)physics(dt/steps);
      paint();
      if(clock>=2.55){
        finish();return;
      }
      frame=window.requestAnimationFrame(loop);
    }
    function revealControls(){
      result.hidden=false;
      reset.hidden=false;
      trigger.hidden=true;
      skip.hidden=true;
      play.classList.add('is-revealed');
      announcer.textContent='The break is complete. All thirteen clubs are available to explore.';
    }
    function finish(){
      window.cancelAnimationFrame(frame);frame=0;
      mode='finished';
      stageNote.textContent='YOUR BREAK · YOUR NEXT CLUB';
      play.classList.remove('is-playing');
      poster.hidden=true;
      revealControls();
      paint();
      // The visitor asked to discover branches; bring the first choices into view
      // only once they have actively played/skipped, never on page load.
      window.setTimeout(()=>{
        if(result.hidden || !result.isConnected || document.hidden)return;
        const box=result.getBoundingClientRect();
        if(box.bottom>window.innerHeight-24){result.scrollIntoView({behavior:media.matches?'auto':'smooth',block:'nearest'});}
      },130);
    }
    function start(instant=false){
      if(mode!=='ready')return;
      mode='playing';trigger.disabled=true;
      stageNote.textContent='THE BREAK · IN MOTION';
      play.classList.add('is-playing');
      poster.disabled=true;
      announcer.textContent='Cue ball rolling toward the rack.';
      if(instant || media.matches){
        poster.hidden=true;
        // Accessible, non-animated final layout of the balls.
        const offsets=portrait?[[.16,.22],[.65,.14],[.72,.37],[.24,.49],[.79,.69],[.42,.29],[.38,.62],[.17,.72],[.65,.55],[.40,.81],[.80,.22],[.58,.79],[.23,.32],[.63,.85],[.85,.50]]:[[.20,.18],[.33,.54],[.52,.22],[.71,.39],[.85,.70],[.44,.75],[.62,.61],[.27,.79],[.75,.17],[.55,.85],[.17,.46],[.88,.22],[.40,.29],[.74,.80],[.55,.47]];
        balls.forEach((b,i)=>{b.x=world.pad+(world.W-2*world.pad)*offsets[i][0];b.y=world.pad+(world.H-2*world.pad)*offsets[i][1];});
        if(portrait){cue.y=world.H-68;}else{cue.x=world.W*.22;}
        finish();return;
      }
      last=0;clock=0;fired=false;hitAt=-100;
      frame=window.requestAnimationFrame(loop);
    }
    function rerack(){
      window.cancelAnimationFrame(frame);frame=0;
      mode='ready';last=0;clock=0;fired=false;hitAt=-100;
      setRack();paint();
      play.classList.remove('is-playing','is-revealed');
      poster.hidden=false;poster.disabled=false;
      result.hidden=true;trigger.hidden=false;trigger.disabled=false;skip.hidden=false;reset.hidden=true;
      stageNote.textContent='THE BREAK · IN MOTION';
      announcer.textContent='Racked and ready to break again.';
    }
    const dotColors=['#f1c95f','#5a86b3','#cf6852','#9672b1','#edb266','#6dac88','#d28a68','#424a4d','#8ea4b6','#d1ad62','#668ebf','#bc7168','#a294d2'];
    grid.innerHTML=locations.map((l,i)=>`<button type="button" class="break-location" data-club-id="${l.id}" aria-label="Explore ${String(l.name).replace(/&/g,'&amp;').replace(/</g,'&lt;')}"><span class="break-location-ball" style="--ball-tone:${dotColors[i%dotColors.length]}">${String(i+1).padStart(2,'0')}</span><span class="break-location-name">${String(l.name).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span><span class="break-location-arrow" aria-hidden="true">↗</span></button>`).join('');
    grid.addEventListener('click',e=>{
      const button=e.target.closest('[data-club-id]');
      if(button)document.dispatchEvent(new CustomEvent('as:open-club',{detail:{id:Number(button.dataset.clubId)}}));
    });
    trigger.addEventListener('click',()=>start());
    poster.addEventListener('click',()=>start());
    skip.addEventListener('click',()=>start(true));
    reset.addEventListener('click',rerack);
    sizingObserver=new ResizeObserver(()=>{size();});sizingObserver.observe(stage);
    size();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
