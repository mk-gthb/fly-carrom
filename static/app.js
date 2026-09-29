import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1d2825');
const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
camera.position.set(0, 8, 9); camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#f4ead0', '#1d2825', 2.4));
const sun = new THREE.DirectionalLight('#fff1c9', 4); sun.position.set(-4, 8, 5); sun.castShadow = true; scene.add(sun);

const boardMat = new THREE.MeshStandardMaterial({color:'#d4bd8b', roughness:.75});
const darkMat = new THREE.MeshStandardMaterial({color:'#17201d', roughness:.4});
const redMat = new THREE.MeshStandardMaterial({color:'#ef744c', roughness:.4});
const ivoryMat = new THREE.MeshStandardMaterial({color:'#dce2d5', roughness:.5});

const board = new THREE.Mesh(new THREE.BoxGeometry(6.8,.35,6.8), boardMat); board.position.y=-.25; board.receiveShadow=true; scene.add(board);
const top = new THREE.Mesh(new THREE.BoxGeometry(5.9,.06,5.9), new THREE.MeshStandardMaterial({color:'#dfc996'})); top.position.y=-.04; top.receiveShadow=true; scene.add(top);
const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.9,.08,5.9)), new THREE.LineBasicMaterial({color:'#765a3d'})); frame.position.y=.02; scene.add(frame);
for (const [x,z] of [[-2.72,-2.72],[2.72,-2.72],[-2.72,2.72],[2.72,2.72]]) { const p=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.08,24),darkMat); p.position.set(x,.1,z); scene.add(p); }
const coin = new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.07,24),redMat); coin.position.set(.7,.18,.5); coin.castShadow=true; scene.add(coin);
const striker = new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.14,24),ivoryMat); striker.position.set(0,.23,2.25); striker.castShadow=true; scene.add(striker);

// Procedural Drosophila: three body regions, red compound eyes, abdomen bands, wings, and six legs.
const fly = new THREE.Group(); fly.position.set(4.1, 1.2, -.2); fly.rotation.y=-.45;
const flyMat=new THREE.MeshStandardMaterial({color:'#29231f',roughness:.55});
const stripeMat=new THREE.MeshStandardMaterial({color:'#b07b42',roughness:.6});
const eyeMat=new THREE.MeshStandardMaterial({color:'#621d1a',roughness:.22});
const wingMat=new THREE.MeshBasicMaterial({color:'#c9e7e2',transparent:true,opacity:.45,side:THREE.DoubleSide});
function part(geometry, material, position, scale=[1,1,1]) { const m=new THREE.Mesh(geometry,material); m.position.set(...position); m.scale.set(...scale); m.castShadow=true; fly.add(m); return m; }
part(new THREE.SphereGeometry(1,20,14),flyMat,[-.5,0,0],[.3,.27,.27]);
part(new THREE.SphereGeometry(1,20,14),eyeMat,[-.7,.05,.15],[.07,.1,.1]); part(new THREE.SphereGeometry(1,20,14),eyeMat,[-.7,.05,-.15],[.07,.1,.1]);
part(new THREE.SphereGeometry(1,20,14),flyMat,[0,0,0],[.4,.32,.3]);
for(let i=0;i<4;i++) part(new THREE.SphereGeometry(1,20,14),i%2?stripeMat:flyMat,[.32+i*.2,0,0],[.23,.23,.24]);
for(const side of [-1,1]) {
  const wing=part(new THREE.PlaneGeometry(1.5,.55),wingMat,[.65,.35,side*.16]); wing.rotation.set(side*.18,side*.1,side*.2);
  for(let i=-1;i<2;i++){const leg=part(new THREE.CylinderGeometry(.018,.03,.85,8),new THREE.MeshStandardMaterial({color:'#704838'}),[.05+i*.18,-.25,side*.13]);leg.rotation.z=side*(.6+i*.13);leg.rotation.x=side*.4;}
}
scene.add(fly);
const trajectory=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.3,2.25),new THREE.Vector3(.7,.3,.5)]),new THREE.LineDashedMaterial({color:'#c8f14a',dashSize:.13,gapSize:.12})); trajectory.computeLineDistances(); trajectory.visible=false; scene.add(trajectory);

function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();} addEventListener('resize',resize); resize();
const clock=new THREE.Clock(); function render(){const t=clock.getElapsedTime();fly.position.y=1.2+Math.sin(t*2)*.04;fly.children[4].rotation.z=Math.sin(t*18)*.12;fly.children[5].rotation.z=-Math.sin(t*18)*.12;renderer.render(scene,camera);requestAnimationFrame(render);} render();

const $=id=>document.getElementById(id); function sync(){['angle','power','striker'].forEach(id=>$(id+'Out').textContent=id==='power'?(+$('power').value/100).toFixed(2):id==='striker'?(+$('striker').value/70).toFixed(2):$('angle').value+'°');} ['angle','power','striker'].forEach(id=>$(id).addEventListener('input',sync)); sync();
async function post(url,body={}){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return r.json();}
$('baseline').onclick=async()=>{const b=await (await fetch('/api/baseline')).json();$('angle').value=Math.round(b.angle);$('power').value=b.power*100;$('striker').value=b.striker*70;sync();$('telemetry').textContent='aim loaded';};
$('shoot').onclick=async()=>{trajectory.visible=true;const d=await post('/api/shot',{angle:+$('angle').value,power:+$('power').value/100,striker:+$('striker').value/70});$('shots').textContent=d.shots;$('potted').textContent=d.potted;$('telemetry').textContent=d.potted_this_shot?'pocketed':'miss';coin.position.x=d.potted_this_shot?2.72:.7;};
$('train').onclick=async()=>{const d=await post('/api/train');$('flyStatus').textContent='Readout trained';$('telemetry').textContent=`${d.samples} samples`;};
$('flyShot').onclick=async()=>{trajectory.visible=true;const d=await post('/api/fly-shot');$('shots').textContent=d.shots;$('potted').textContent=d.potted;$('telemetry').textContent=d.potted_this_shot?'fly pocketed':'fly missed';};
