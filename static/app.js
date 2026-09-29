import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1d2825');
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 8.2, 8.9); camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#d8e8d6', '#1d2825', 2.2));
const key = new THREE.DirectionalLight('#fff3cf', 4); key.position.set(-3, 8, 4); key.castShadow = true; scene.add(key);

const mat = {
  wood: new THREE.MeshStandardMaterial({color:'#d4bd8b', roughness:.74}),
  trim: new THREE.MeshStandardMaterial({color:'#806045', roughness:.6}),
  dark: new THREE.MeshStandardMaterial({color:'#17201d', roughness:.42}),
  red: new THREE.MeshStandardMaterial({color:'#ef744c', roughness:.4}),
  ivory: new THREE.MeshStandardMaterial({color:'#dce2d5', roughness:.48}),
  fly: new THREE.MeshStandardMaterial({color:'#29231f', roughness:.52}),
  flyStripe: new THREE.MeshStandardMaterial({color:'#b07b42', roughness:.6}),
  eye: new THREE.MeshStandardMaterial({color:'#5c1c17', roughness:.2}),
  wing: new THREE.MeshPhysicalMaterial({color:'#c9e7e2', transparent:true, opacity:.34, side:THREE.DoubleSide, roughness:.2, transmission:.15}),
  leg: new THREE.MeshStandardMaterial({color:'#6d4635', roughness:.7})
};
function mesh(geometry, material, parent, position=[0,0,0]) { const m=new THREE.Mesh(geometry, material); m.position.set(...position); m.castShadow=true; parent.add(m); return m; }

const board = new THREE.Group();
mesh(new THREE.BoxGeometry(6.8,.35,6.8), mat.wood, board, [0,-.25,0]).receiveShadow=true;
mesh(new THREE.BoxGeometry(5.9,.06,5.9), new THREE.MeshStandardMaterial({color:'#dfc996'}), board, [0,-.04,0]).receiveShadow=true;
const border = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.9,.07,5.9)), new THREE.LineBasicMaterial({color:'#765a3d'})); border.position.y=.01; board.add(border);
for (const [x,z] of [[-2.72,-2.72],[2.72,-2.72],[-2.72,2.72],[2.72,2.72]]) { mesh(new THREE.CylinderGeometry(.22,.22,.08,32),mat.dark,board,[x,.1,z]); const ring=mesh(new THREE.TorusGeometry(.22,.035,12,32),mat.red,board,[x,.15,z]); ring.rotation.x=Math.PI/2; }
const center=mesh(new THREE.TorusGeometry(.55,.025,12,48),mat.trim,board,[0,.1,0]); center.rotation.x=Math.PI/2; scene.add(board);
const coin=mesh(new THREE.CylinderGeometry(.18,.18,.07,32),mat.red,scene,[.72,.18,.55]);
mesh(new THREE.CylinderGeometry(.28,.28,.14,32),mat.ivory,scene,[0,.23,2.25]);

// A cleaner Drosophila melanogaster body: head, thorax, striped abdomen, compound eyes, six legs, and veined wings.
const fly=new THREE.Group(); fly.position.set(4.15,1.15,-.1); fly.rotation.y=-.45;
function ellipsoid(scale, position, material) { const m=mesh(new THREE.SphereGeometry(1,28,18),material,fly,position); m.scale.set(...scale); return m; }
ellipsoid([.31,.27,.27],[-.48,.02,0],mat.fly); // head
ellipsoid([.06,.09,.09],[-.72,.03,.14],mat.eye); ellipsoid([.06,.09,.09],[-.72,.03,-.14],mat.eye);
ellipsoid([.40,.32,.31],[0,0,0],mat.fly); // thorax
for (let i=0;i<4;i++) ellipsoid([.22-i*.025,.23-i*.025,.25-i*.025],[.30+i*.19,.01,0],i%2?mat.flyStripe:mat.fly); // abdomen segments
for (const side of [-1,1]) {
  const wing=mesh(new THREE.ShapeGeometry(new THREE.Shape().moveTo(0,0).lineTo(1.35,.16).lineTo(1.8,.7).lineTo(.65,.62).lineTo(0,0)),mat.wing,fly,[.08,.34,side*.12]);
  wing.rotation.set(side*.18, side*.08, side*.25); wing.scale.z=side;
  const veins=mesh(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.35,.58)),new THREE.LineBasicMaterial({color:'#86b8b1',transparent:true,opacity:.7})),new THREE.MeshBasicMaterial(),fly,[.09,.345,side*.13]); veins.rotation.set(side*.18,side*.08,side*.25); veins.scale.z=side;
  for (let i=0;i<3;i++) { const leg=mesh(new THREE.CylinderGeometry(.018,.028,.88,8),mat.leg,fly,[.05+i*.17,-.27,side*.12]); leg.rotation.z=side*(.62+i*.15); leg.rotation.x=side*.43; }
}
scene.add(fly);

const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.3,2.25),new THREE.Vector3(.7,.3,.55)]),new THREE.LineDashedMaterial({color:'#c8f14a',dashSize:.13,gapSize:.12})); ray.computeLineDistances(); ray.visible=false; scene.add(ray);
function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();} addEventListener('resize',resize); resize();
const clock=new THREE.Clock(); function animate(){const t=clock.getElapsedTime(); fly.position.y=1.15+Math.sin(t*2.1)*.04; fly.children.forEach((m,i)=>{if(i===5||i===6)m.rotation.z=Math.sin(t*18)*.14*(i===5?1:-1);}); renderer.render(scene,camera); requestAnimationFrame(animate);} animate();

const $=id=>document.getElementById(id); function sync(){['angle','power','striker'].forEach(id=>$(id+'Out').textContent=id==='power'?(+$('power').value/100).toFixed(2):id==='striker'?(+$('striker').value/70).toFixed(2):$('angle').value+'°');} ['angle','power','striker'].forEach(id=>$(id).addEventListener('input',sync)); sync();
async function post(url,body={}){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());return r.json();}
$('baseline').onclick=async()=>{const b=await (await fetch('/api/baseline')).json();$('angle').value=Math.round(b.angle);$('power').value=b.power*100;$('striker').value=b.striker*70;sync();$('telemetry').textContent='aim loaded';};
$('shoot').onclick=async()=>{ray.visible=true;const d=await post('/api/shot',{angle:+$('angle').value,power:+$('power').value/100,striker:+$('striker').value/70});$('shots').textContent=d.shots;$('potted').textContent=d.potted;$('telemetry').textContent=d.potted_this_shot?'pocketed':'miss';coin.position.x=d.potted_this_shot?2.72:.72;};
$('train').onclick=async()=>{const d=await post('/api/train');$('flyStatus').textContent='Readout trained';$('telemetry').textContent=`${d.samples} samples`;};
$('flyShot').onclick=async()=>{ray.visible=true;const d=await post('/api/fly-shot');$('shots').textContent=d.shots;$('potted').textContent=d.potted;$('telemetry').textContent=d.potted_this_shot?'fly pocketed':'fly missed';};
window.__flyControlsBound = true;
