// Keeps the experiment controls usable if a WebGL/CDN module is unavailable.
if (!window.__flyControlsBound) {
  const $ = id => document.getElementById(id);
  const post = async (url, body={}) => (await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})).json();
  $('flyShot').onclick = async () => { const d=await post('/api/fly-shot'); $('shots').textContent=d.shots; $('potted').textContent=d.potted; $('telemetry').textContent=d.potted_this_shot?'fly pocketed':'fly missed'; };
  $('train').onclick = async () => { const d=await post('/api/train'); $('flyStatus').textContent='Readout trained'; $('telemetry').textContent=`${d.samples} samples`; };
  $('shoot').onclick = async () => { const d=await post('/api/shot',{angle:+$('angle').value,power:+$('power').value/100,striker:+$('striker').value/70}); $('shots').textContent=d.shots; $('potted').textContent=d.potted; $('telemetry').textContent=d.potted_this_shot?'pocketed':'miss'; };
}
