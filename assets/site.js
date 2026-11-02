/* A.S. Pool & Snooker Club — static site, based on Kimi's 13-location directory.
   Edit locations in data/locations.json and mirror them in data/locations.js.
   The owner QR directory provides the 13 branch names; address/pin/phone/photo mappings need verification. */
(() => {
  'use strict';
  const locations = Array.isArray(window.CLUB_LOCATIONS) ? window.CLUB_LOCATIONS : [];
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => Array.from(root.querySelectorAll(s));
  const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeUrl = v => typeof v==='string' && /^https:\/\//i.test(v) ? v : '#locations';
  const clubImages = {"1":["snooker-row","hall-dark","hall-players"],"2":["snooker-classic","snooker-center","hall-wood"],"3":["hall-cream","hall-modern","brand-exterior"],"4":["hall-dark","hall-players","snooker-row"],"5":["hall-wood","snooker-classic","snooker-detail"],"6":["snooker-center","snooker-detail","pool-balls"],"7":["hall-players","snooker-row","pool-balls"],"8":["hero-hall","pool-multi","pool-reception"],"9":["pool-multi","snooker-green","pool-balls"],"10":["hall-modern","pool-reception","hall-cream"],"11":["pool-reception","snooker-green","brand-entrance"],"12":["snooker-green","pool-multi","hall-modern"],"13":["snooker-detail","snooker-classic","pool-balls"]};
  const phoneHref = v => 'tel:' + String(v||'').replace(/[^\d+]/g,'');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentFilter = 'all', searchTerm = '', map = null, mapMarkers = new Map(), selectedLocation = null;

  // Local artwork is AI-retouched; titles describe the subject, not a guaranteed branch.
  const gallery = [
    {image:'hero-hall',title:'Under the table lights',desc:'Green tables, warm wood and a place to settle into your game.',type:'snooker'},
    {image:'pool-reception',title:'A place to play',desc:'Pool tables and a welcoming club atmosphere.',type:'pool'},
    {image:'hall-dark',title:'A good place for a frame',desc:'Multiple tables ready for the next game.',type:'snooker'},
    {image:'brand-exterior',title:'Spot the A.S. sign',desc:'A.S. Pool & Snooker Club brand storefront imagery.',type:'spaces'},
    {image:'hall-modern',title:'Room to play',desc:'Snooker and pool tables across the club space.',type:'spaces'},
    {image:'snooker-classic',title:'The green felt',desc:'A classic snooker-table setup.',type:'snooker'},
    {image:'pool-balls',title:'Ready to break',desc:'Pool balls and cue on green felt.',type:'pool'},
    {image:'hall-wood',title:'The snooker hall',desc:'Warm wood finishes and table lighting.',type:'spaces'},
    {image:'pool-multi',title:'Blue felt, green felt',desc:'Pool and snooker tables side by side.',type:'pool'},
    {image:'snooker-green',title:'The next frame awaits',desc:'A focused view down the snooker table.',type:'snooker'},
    {image:'hall-cream',title:'The club floor',desc:'Open layout with tables and overhead lighting.',type:'spaces'},
    {image:'brand-entrance',title:'A.S. branding',desc:'Club identity and entrance imagery.',type:'spaces'}
  ];
  const imagePath = id => 'assets/images/' + id + '.webp';
  const noContact = (l) => !l.phone || !/^\+?\d/.test(l.phone);

  function visibleLocations() {
    return locations.filter(l => (currentFilter === 'all' || l.city === currentFilter)
      && (!searchTerm || [l.name, l.city, l.address].some(v => String(v||'').toLowerCase().includes(searchTerm))));
  }
  function locationCard(loc) {
    return `<article class="location-card" id="location-${loc.id}">
      <div class="location-photo"><img src="${escapeHTML(loc.image)}" alt="Enhanced view of a snooker or pool club space" loading="lazy" decoding="async"><span class="location-id">${String(loc.id).padStart(2,'0')} / 13</span><span class="location-city">${escapeHTML(loc.city)}</span></div>
      <div class="location-body"><h3>${escapeHTML(loc.name)}</h3><p class="address">${escapeHTML(loc.address)}</p>
      <div class="location-card-actions"><a class="link-directions" href="${escapeHTML(safeUrl(loc.maps))}" target="_blank" rel="noopener noreferrer" aria-label="Open directions to ${escapeHTML(loc.name)} in Google Maps">${validGeo(loc)?'Directions':'Find on Maps'} <span aria-hidden="true">↗</span></a>${noContact(loc) ? `<a class="link-call" href="#contact">Enquire</a>` : `<a class="link-call" href="${phoneHref(loc.phone)}" aria-label="Call ${escapeHTML(loc.name)}">Call club</a>`}</div>
      <div class="location-secondary-actions"><button type="button" data-open-club="${loc.id}" class="location-map-link">Explore club <span aria-hidden="true">↗</span></button>${validGeo(loc)?`<button type="button" data-show-map="${loc.id}" class="location-map-link" aria-label="Show ${escapeHTML(loc.name)} on the interactive map">See on map <span aria-hidden="true">↗</span></button>`:``}</div>
      </div></article>`;
  }
  function renderLocations(){
    const visible=visibleLocations();
    $('#locations-grid').innerHTML=visible.map(locationCard).join('');
    $('#locations-empty').hidden=visible.length>0;
    $('#location-count').textContent=String(locations.length);
    $('#results-summary').textContent=`Showing ${visible.length} of ${locations.length} locations`;
    $$('#location-filters button').forEach(b=>{let active=b.dataset.filter===currentFilter;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    mapMarkers.forEach(({marker,location})=>{ if(!map)return; let visibleNow=visible.some(x=>x.id===location.id); if(visibleNow&&!map.hasLayer(marker))marker.addTo(map); if(!visibleNow&&map.hasLayer(marker))map.removeLayer(marker); });
    if(map&&visible.length){const points=visible.filter(l=>validGeo(l)).map(l=>[l.lat,l.lng]);if(points.length>0)map.fitBounds(points,{padding:[38,38],maxZoom:12,animate:!reduceMotion});}
  }
  function setFilter(v){currentFilter=v;renderLocations();}
  function validGeo(l){return Number.isFinite(l.lat) && Number.isFinite(l.lng) && l.lat>=-90 && l.lat<=90 && l.lng>=-180 && l.lng<=180;}
  function selectedLocationContent(l) {
    const dest=safeUrl(l.maps);
    return `<span>SELECTED CLUB</span><strong>${escapeHTML(l.name)}</strong><a href="${escapeHTML(dest)}" target="_blank" rel="noopener noreferrer">Open Google Maps ↗</a>`;
  }
  function selectLocation(id, fly=true){
    const l=locations.find(l=>l.id===Number(id));if(!l)return;
    selectedLocation=l;
    $('#map-selected').innerHTML=selectedLocationContent(l);
    mapMarkers.forEach(({element})=>{if(element)element.classList.remove('selected')});
    let ref=mapMarkers.get(l.id);if(ref?.element)ref.element.classList.add('selected');
    if(map&&validGeo(l)){
      if(!map.hasLayer(ref.marker))ref.marker.addTo(map);
      if(fly)map.flyTo([l.lat,l.lng],Math.max(map.getZoom(),12),{duration:reduceMotion?0:0.65});
      ref.marker.openPopup();
    }
  }
  function initMap(){
    const holder=$('#club-map');if(!holder)return;
    if(!window.L){holder.classList.add('map-unavailable');return;}
    try{
      holder.innerHTML='';
      map=L.map('club-map',{scrollWheelZoom:false,zoomControl:true,preferCanvas:true}).setView([23.038,72.58],10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:18}).addTo(map);
      for(const l of locations){
        if(!validGeo(l))continue;
        const el=L.DomUtil.create('div','custom-marker');el.textContent=String(l.id).padStart(2,'0');
        const icon=L.divIcon({html:el,iconSize:[29,29],iconAnchor:[14,14],className:'marker-wrapper'});
        const marker=L.marker([l.lat,l.lng],{icon}).addTo(map);
        marker.bindPopup(`<strong>${escapeHTML(l.name)}</strong><div>${escapeHTML(l.city)}</div><a href="${escapeHTML(safeUrl(l.maps))}" target="_blank" rel="noopener noreferrer">Directions ↗</a>`);
        marker.on('click',()=>selectLocation(l.id,false));
        mapMarkers.set(l.id,{marker,location:l,element:el});
      }
      fitMap();
      if(locations.length) selectLocation(locations[0].id,false);
    }catch(err){ console.warn('Interactive map unavailable',err);holder.innerHTML='<p class="map-fallback">Map unavailable. Use the directions on the club cards instead.</p>';map=null; }
  }
  function fitMap(){if(!map)return;const pts=visibleLocations().filter(l=>validGeo(l)).map(l=>[l.lat,l.lng]);if(pts.length)map.fitBounds(pts,{padding:[38,38],maxZoom:12});}


  let lastClubFocus=null;
  function openClubDialog(id){
    const loc=locations.find(l=>l.id===Number(id));if(!loc)return;
    const pictures=clubImages[loc.id]||['hero-hall','hall-cream','pool-balls'];
    const mainImg=pictures[0],other=pictures.slice(1);
    $('#club-dialog-content').innerHTML=`<div class="club-dialog-images"><img class="club-dialog-main-image" src="${imagePath(mainImg)}" alt="Enhanced club atmosphere photograph"><div class="club-dialog-images-side">${other.map(im=>`<img src="${imagePath(im)}" alt="Enhanced snooker or pool club atmosphere">`).join('')}</div></div><div class="club-dialog-details"><p class="eyebrow"><span class="eyebrow-line"></span> ${escapeHTML(loc.city)} · CLUB ${String(loc.id).padStart(2,'0')}</p><h2 id="club-dialog-title">${escapeHTML(loc.name)}</h2><p class="club-dialog-address">${escapeHTML(loc.address)}</p><p class="club-dialog-note">Photos are illustrative and may not show this branch. Please check amenities with the club.</p><div class="club-dialog-links"><a class="button button-accent" href="${escapeHTML(safeUrl(loc.maps))}" target="_blank" rel="noopener noreferrer">${validGeo(loc)?'Get directions':'Find on Maps'} ↗</a>${noContact(loc)?`<a class="button button-outline" href="#contact">Send enquiry</a>`:`<a class="button button-outline" href="${phoneHref(loc.phone)}">Call club ↗</a>`}</div></div>`;
    lastClubFocus=document.activeElement;$('#club-dialog').hidden=false;document.body.classList.add('modal-open');$('#club-dialog-close').focus();
  }
  function closeClubDialog(){if($('#club-dialog').hidden)return;$('#club-dialog').hidden=true;document.body.classList.remove('modal-open');$('#club-dialog-content').innerHTML='';if(lastClubFocus?.isConnected)lastClubFocus.focus();}
  let currentGallery='all',lightboxIndex=0,lastFocus=null;
  const visibleGallery=()=>gallery.filter(g=>currentGallery==='all'||g.type===currentGallery);
  function renderGallery(){
    const items=visibleGallery();
    $('#gallery-grid').innerHTML=items.map((g,i)=>`<button class="gallery-tile ${currentGallery==='all'&&(i===0||i===8)?'wide':''} ${currentGallery==='all'&&(i===1||i===6)?'tall':''}" type="button" data-gallery-index="${i}" aria-label="View photo: ${escapeHTML(g.title)}"><img src="${imagePath(g.image)}" loading="lazy" decoding="async" alt="${escapeHTML(g.title)}"><span class="tile-icon" aria-hidden="true">↗</span><span class="tile-text"><small>${g.type==='spaces'?'THE CLUB':g.type.toUpperCase()}</small><strong>${escapeHTML(g.title)}</strong></span></button>`).join('');
    $$('#gallery-filters button').forEach(b=>{const active=b.dataset.gallery===currentGallery;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
  }
  function showLightbox(i){const items=visibleGallery();if(!items.length)return;lightboxIndex=(i+items.length)%items.length;let g=items[lightboxIndex];$('#lightbox-image').src=imagePath(g.image);$('#lightbox-image').alt=g.title;$('#lightbox-title').textContent=g.title;$('#lightbox-count').textContent=`${lightboxIndex+1} / ${items.length}`;$('#lightbox-description').textContent=g.desc;$('#lightbox').hidden=false;document.body.classList.add('modal-open');$('#lightbox-close').focus();}
  function openLightbox(i){lastFocus=document.activeElement;showLightbox(i);}
  function closeLightbox(){$('#lightbox').hidden=true;document.body.classList.remove('modal-open');$('#lightbox-image').removeAttribute('src');if(lastFocus?.isConnected)lastFocus.focus();}
  function moveLightbox(n){showLightbox(lightboxIndex+n);}
  let startX=null;
  function bind(){
    $('#year').textContent=String(new Date().getFullYear());
    document.addEventListener('as:open-club',e=>openClubDialog(e.detail.id));
    const menu=$('#menu-toggle'),mobile=$('#mobile-nav');
    menu.addEventListener('click',()=>{const isOpen=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!isOpen));menu.setAttribute('aria-label',isOpen?'Open menu':'Close menu');mobile.hidden=isOpen;});
    $$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');}));
    $('#location-search').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderLocations();});
    $('#location-filters').addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(b)setFilter(b.dataset.filter);});
    $('#clear-search').addEventListener('click',()=>{$('#location-search').value='';searchTerm='';setFilter('all')});
    $('#locations-grid').addEventListener('click',e=>{let club=e.target.closest('button[data-open-club]');if(club){openClubDialog(club.dataset.openClub);return;}let b=e.target.closest('button[data-show-map]');if(!b)return;selectLocation(b.dataset.showMap);document.querySelector('.map-section').scrollIntoView({behavior:reduceMotion?'auto':'smooth'});});
    $('#club-dialog-close').addEventListener('click',closeClubDialog);
    $('#club-dialog-content').addEventListener('click',e=>{if(e.target.closest('a[href="#contact"]'))closeClubDialog();});
    $('#club-dialog').addEventListener('click',e=>{if(e.target.hasAttribute('data-close-club'))closeClubDialog()});
    $('#map-fit').addEventListener('click',fitMap);
    $('#gallery-filters').addEventListener('click',e=>{const b=e.target.closest('button[data-gallery]');if(!b)return;currentGallery=b.dataset.gallery;renderGallery()});
    $('#gallery-grid').addEventListener('click',e=>{const b=e.target.closest('button[data-gallery-index]');if(b)openLightbox(Number(b.dataset.galleryIndex));});
    $('#lightbox-close').addEventListener('click',closeLightbox);
    $('#lightbox-next').addEventListener('click',()=>moveLightbox(1));
    $('#lightbox-prev').addEventListener('click',()=>moveLightbox(-1));
    $('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#club-dialog').hidden){closeClubDialog();return;}if(!$('#club-dialog').hidden&&e.key==='Tab'){const close=$('#club-dialog-close');const focusables=[close,...$$('#club-dialog-content a')];const ix=focusables.indexOf(document.activeElement);if(e.shiftKey&&ix===0){e.preventDefault();focusables[focusables.length-1].focus()}else if(!e.shiftKey&&ix===focusables.length-1){e.preventDefault();close.focus()}return;}if($('#lightbox').hidden){if(e.key==='Escape'&&!mobile.hidden){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.focus();}return;}if(e.key==='Escape')closeLightbox();else if(e.key==='ArrowRight')moveLightbox(1);else if(e.key==='ArrowLeft')moveLightbox(-1);else if(e.key==='Tab'){const els=[$('#lightbox-close'),$('#lightbox-prev'),$('#lightbox-next')],idx=els.indexOf(document.activeElement);if(e.shiftKey&&idx===0){e.preventDefault();els[2].focus()}else if(!e.shiftKey&&idx===2){e.preventDefault();els[0].focus()}}});
    $('#lightbox-image').addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX},{passive:true});
    $('#lightbox-image').addEventListener('touchend',e=>{if(startX===null)return;let diff=e.changedTouches[0].clientX-startX;if(Math.abs(diff)>55)moveLightbox(diff<0?1:-1);startX=null},{passive:true});
    $('#contact-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const data=new FormData(e.currentTarget);const subject=`A.S. Pool & Snooker Club — ${data.get('type')}`;const message=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nEnquiry: ${data.get('type')}\n\n${data.get('message')}`;window.location.href=`mailto:arvindkhant3588@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  function start(){bind();renderLocations();renderGallery();initMap();}
})();
