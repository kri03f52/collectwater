import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165/build/three.module.js';

// ======================
// 基本設定
// ======================


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ★ここに追加（影を有効化）
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// ======================
// 雲
// ======================

const textureLoader = new THREE.TextureLoader();
const cloudTexture = textureLoader.load("./cloud.png");
const clouds = [];

function spawnCloud() {

  // 雲のマテリアル
  const material = new THREE.MeshBasicMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide
});

  // 雲の形
  const cloud = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3),
    material
  );

  // 出現位置
  cloud.position.set(
    -20,
    5 + Math.random() * 2,
    (Math.random() - 0.5) * 10
  );

  // カメラ方向を向く
  cloud.lookAt(camera.position);

  scene.add(cloud);
  clouds.push(cloud);
}

// 最初から3つ出す
spawnCloud();
spawnCloud();
spawnCloud();

// 3秒ごとに追加
setInterval(spawnCloud, 3000);
// ======================
// 光
// ======================
const light = new THREE.DirectionalLight(0xffffff, 1.5);

light.position.set(0, 20, 0);

// ★影を出す設定
light.castShadow = true;

scene.add(light);

// ======================
// 地面
// ======================
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(10, 64),
  new THREE.MeshStandardMaterial({ color: 0x90EE90 })
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// ======================
// 虹
// ======================

const rainbows = [];
const rainbowColors = [
  0xff0000,
  0xff7f00,
  0xffff00,
  0x00ff00,
  0x0000ff,
  0x4b0082,
  0x9400d3
];

for (let i = 0; i < rainbowColors.length; i++) {

  const curve = new THREE.EllipseCurve(
    0, 0,                 // 中心
    8 - i * 0.3,          // 横半径
    8 - i * 0.15,          // 縦半径
    0,
    Math.PI,
    false
  );

  const points = curve.getPoints(100);

const tubeGeometry = new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3(
    points.map(p => new THREE.Vector3(p.x, p.y, 0))
  ),
  100,
  0.3,
  8,
  false
);

const material = new THREE.MeshBasicMaterial({
  color:  new THREE.Color(rainbowColors[i]).offsetHSL(0, -0.3, 0.2),
  transparent: true,
  opacity: 0.4
});

const rainbow = new THREE.Mesh(
  tubeGeometry,
  material
);
rainbow.castShadow = false;
rainbow.receiveShadow = false;

// 虹の位置
rainbow.position.set(0, 0, -5);

// 半透明設定
rainbow.material.transparent = true;

// 最初は見えなくする
rainbow.material.opacity = 0;

// 影なし
rainbow.castShadow = false;
rainbow.receiveShadow = false;

scene.add(rainbow);

// 配列に保存
rainbows.push(rainbow);
}



// ===== 花システム =====
const flowers = [];

function createFlower(x, z, isRare = false) {

  const size = isRare ? 2.5 : 1.2;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );

  const petal = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshStandardMaterial({
      color: isRare
        ? new THREE.Color().setHSL(Math.random(), 1.0, 0.6)
        : new THREE.Color().setHSL(Math.random(), 1.0, 0.6)
    })
  );

  stem.scale.set(size, size, size);
  petal.scale.set(size, size, size);

  stem.position.set(x, 0.25, z);
  petal.position.set(x, 0.6, z);

  scene.add(stem);
  scene.add(petal);

  flowers.push({ stem, petal });
}

function spawnFlowersBurst(x, z, isRare = false) {

  const count = isRare ? 8 : 5;

  for (let i = 0; i < count; i++) {

    const offsetX = (Math.random() - 0.5) * (isRare ? 12:8);
    const offsetZ = (Math.random() - 0.5) * (isRare ? 12:8);

    createFlower(x + offsetX, z + offsetZ, isRare);
  }
}

function createHouse(x, z) {

  
  // 本体
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );

  body.position.set(x, 1, z);

  // 屋根
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: 0xaa0000 })
  );

  roof.position.set(x, 2.5, z);
  roof.rotation.y = Math.PI / 4;

  scene.add(body);
  scene.add(roof);
}
// ======================
// UI
// ======================
const ui = document.getElementById("ui");
const splashSound = new Audio("./splash.mp3");
const catchSound = new Audio("catch.mp3");
let score = 0;
let zoom = 10;
let timeLeft = 40;
let bottleRadius = 1;

const startMenu = document.getElementById("startMenu");

const normalBtn =
  document.getElementById("normalBtn");

const bigBtn =
  document.getElementById("bigBtn");
const quizMenu =
  document.getElementById("quizMenu");

const trueBtn =
  document.getElementById("trueBtn");

const falseBtn =
  document.getElementById("falseBtn");
  const gameOverMenu =
  document.getElementById("gameOverMenu");

const gameOverText =
  document.getElementById("gameOverText");

let quizShown = false;
let quizActive = false;
let gameOver = false;

// ======================
// クイズ問題
// ======================

const quizList = [

  {
    question:
      "工事請負契約書に添付される設計図書には請負代金内訳書は含まれない。",
    answer: true
  },

  {
    question:
      "建築基準法において、防火地域では木造建築物は建てられない。",
    answer: false
  },

  {
    question:
      "鉄筋コンクリートは圧縮に強いが引張に弱い。",
    answer: true
  },

  {
    question:
      "非常口の誘導灯は赤色で表示される。",
    answer: false
  },

  {
    question:
      "1級建築士は国土交通大臣の免許である。",
    answer: true
  },

  {
    question:
      "アスファルト防水工事の絶縁工法において、一般平場部の防水層の最下層には砂付き穴あきアスファルトルーフィングを用いる。",
    answer: true
  },

  {
    question:
      "尖頭アーチはゴシック建築の特徴である。",
    answer: true
  },

  {
    question:
      "かき氷で頭が「キーン」とする学問的な正式名称は「アイスクリーム頭痛」という。",
    answer: true
  },

   {
    question:
      "木材は、繊維方向よりも繊維直角方向のほうが強度が高い。",
    answer:false
  },

   {
    question:
      "日本の城で天守閣が最も多く残っている都道府県は北海道である。",
    answer: false,

    explanation:
    "天守閣が最も多いのは兵庫県"
  },

  {
    question:
      "かき氷で頭が「キーン」とする学問的な正式名称は「冷因頭痛」という。",
    answer: false,

    explanation:
    "正式名称は「アイスクリーム頭痛」"
  },

   {
    question:
      "都道府県の中で北海道だけ苗字にない。",
    answer:false,

 explanation:
    "苗字にないのは沖縄県と愛媛県"
  },

  {
    question:
      "蛸には心臓が３つある。",
    answer: true
  },

   {
    question:
      "バナナは放射線を出している。",
    answer: true
  },
  
];

let currentQuiz = null;

const quizText =
  document.getElementById("quizText");

  // ======================
// ボトル
// ======================

let bottle;

function createBottle() {
  // 前のボトルを削除
  if (bottle) {
    scene.remove(bottle);
  }

  bottle = new THREE.Mesh(

    new THREE.CylinderGeometry(
      bottleRadius,
      bottleRadius,
      bottleHeight,
      32
    ),

    new THREE.MeshStandardMaterial({
      color: 0xffffff
    })

  );

  // 地面にめり込まない
  bottle.position.y = bottleHeight / 2;

  bottle.castShadow = true;

  scene.add(bottle);
}
normalBtn.addEventListener("click", () => {

  bottleRadius = 0.6;
  bottleHeight = 2;

  createBottle();

  startMenu.style.display = "none";

});
bigBtn.addEventListener("click", () => {

  // 横幅だけ大きい
  bottleRadius = 1.2;

  // 高さは低め
  bottleHeight = 1.3;

  createBottle();

  startMenu.style.display = "none";

});
let bottleHeight = 2;
const waterRadius = 0.2;

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousedown", (e) => {
  mouseDown = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
});

// ======================
// 水オブジェクト
// ======================
const waters = [];
const splashes = [];

function spawnWater() {

  const count = 3; // 一度に出る数

  for (let i = 0; i < count; i++) {

    const isFast = Math.random() < 0.2;

    const water = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({
        color: isFast ? 0xff4444 : 0x00aaff
      })
    );

    water.castShadow = true;

    water.userData.speed = isFast ? 0.15 : 0.05;
    water.userData.point = isFast ? 5 : 1;

    water.position.set(
      (Math.random() - 0.5) * 10,
      20,
      (Math.random() - 0.5) * 10
    );

    scene.add(water);
    waters.push(water);
  }
}

function createSplash(x, z) {

  for (let i = 0; i < 8; i++) {

    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshStandardMaterial({
        color: 0x66ccff
      })
    );

    drop.position.set(x, 0.1, z);

    drop.userData.vx = (Math.random() - 0.5) * 0.1;
    drop.userData.vz = (Math.random() - 0.5) * 0.1;
    drop.userData.vy = Math.random() * 0.15;

    scene.add(drop);
    splashes.push(drop);
  }
}
  
// 2秒ごとに水生成
setInterval(spawnWater, 2000);

// ======================
// 操作
// ======================
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ======================
// 当たり判定
// ======================
function isHitWater(water, bottle) {

  const bottleTop = bottle.position.y + bottleHeight / 2;
  const waterBottom = water.position.y - waterRadius;

  const dx = bottle.position.x - water.position.x;
  const dz = bottle.position.z - water.position.z;

 const horizontalHit =
  Math.sqrt(dx * dx + dz * dz) < bottleRadius;

  const verticalHit = waterBottom <= bottleTop;

  return horizontalHit && verticalHit;
}

// ======================
// ループ
// ======================
function animate() {
  
  requestAnimationFrame(animate);

  if (gameOver) {

    renderer.render(scene, camera);
    return;

  }
  for (let i = clouds.length - 1; i >= 0; i--) {

  const c = clouds[i];

  // 右へ移動
  c.position.x += 0.02;

  // カメラ方向を向く
  c.lookAt(camera.position);

  // 画面外へ行ったら削除
  if (c.position.x > 20) {

    scene.remove(c);
    clouds.splice(i, 1);

  }
}

    timeLeft -= 1 / 60;
if (timeLeft <= 20 && !quizShown) {

  quizShown = true;
  quizActive = true;

  // ランダム問題
  currentQuiz =
    quizList[
      Math.floor(Math.random() * quizList.length)
    ];

  // 問題表示
  quizText.innerHTML =
    currentQuiz.question;

  quizMenu.style.display = "flex";
}

    // ======================
// 虹を徐々に表示
// ======================

if (timeLeft <= 30) {

  for (let i = 0; i < rainbows.length; i++) {

    const rainbow = rainbows[i];

    if (rainbow.material.opacity < 0.5) {

      rainbow.material.opacity += 0.002;

    }

  }

}


 if (timeLeft <= 0) {

  timeLeft = 0;

  gameOver = true;

  gameOverMenu.style.display = "flex";

  gameOverText.innerHTML =
    "ゲーム終了！<br><br>" +
    "スコア: " + score;

  renderer.render(scene, camera);

  return;
}

if (quizActive) {

  renderer.render(scene, camera);
  return;
}
  // ボトル移動
  if (keys["w"]) bottle.position.z -= 0.1;
  if (keys["s"]) bottle.position.z += 0.1;
  if (keys["a"]) bottle.position.x -= 0.1;
  if (keys["d"]) bottle.position.x += 0.1;
  

  // 水処理
  for (let i = waters.length - 1; i >= 0; i--) {

    const w = waters[i];

 w.position.y -= w.userData.speed;

    // 当たり判定
 if (isHitWater(w, bottle)) {

  // 水削除
  scene.remove(w);
  waters.splice(i, 1);

  // スコア
  score += w.userData.point;

  // 音
  catchSound.currentTime = 0;
  catchSound.play();

  // 🌸ここが追加（花5個）
  spawnFlowersBurst(
  w.position.x,
  w.position.z,
  w.userData.speed > 0.1
);

  // UI更新
  ui.innerHTML =
    "Score: " + score + "<br>" +
    "Time: " + Math.max(0, Math.floor(timeLeft));
}

    // 落ちたら削除
  if (w.position.y < 0) {

  splashSound.currentTime = 0;
  splashSound.play();

  createSplash(w.position.x, w.position.z);

  scene.remove(w);
  waters.splice(i, 1);
}
  }

camera.position.set(0, 15, zoom);
camera.lookAt(0, 0, 0);

// ★クイズ中じゃない時だけUI更新

  ui.innerHTML =
    "Score: " + score + "<br>" +
    "Time: " + Math.max(0, Math.floor(timeLeft));

for (let i = splashes.length - 1; i >= 0; i--) {

  const s = splashes[i];

  s.position.x += s.userData.vx;
  s.position.z += s.userData.vz;
  s.position.y += s.userData.vy;

  s.userData.vy -= 0.005;

  if (s.position.y < 0) {

    scene.remove(s);
    splashes.splice(i, 1);

  }
}
renderer.render(scene, camera);

}

animate();
window.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  const deltaX = e.clientX - mouseX;
  const deltaY = e.clientY - mouseY;

  camera.position.x -= deltaX * 0.01;
  camera.position.y += deltaY * 0.01;

  mouseX = e.clientX;
  mouseY = e.clientY;
});
window.addEventListener("wheel", (e) => {

  zoom += e.deltaY * 0.002;
  zoom = Math.max(3, Math.min(20, zoom));

    camera.position.z = zoom; 

});
// ======================
// クイズ
// ======================

// ======================
// クイズ
// ======================

function wrongAnswer() {

  gameOver = true;

  let explanationText = "";

  // 解説がある場合だけ表示
  if (currentQuiz.explanation) {

    explanationText =
      "<br><br>" +
      currentQuiz.explanation;

  }

  // クイズ画面を消す
  quizMenu.style.display = "none";

  // ゲームオーバー画面を表示
  gameOverMenu.style.display = "flex";

  // 表示内容
  gameOverText.innerHTML =
    "❌ 不正解！<br><br>" +
    "ゲーム終了" +
    explanationText +
    "<br><br>" +
    "スコア: " + score;
}

// 〇クリック
trueBtn.addEventListener("click", () => {

  if (currentQuiz.answer === true) {

    quizActive = false;
    quizMenu.style.display = "none";

  } else {

    wrongAnswer();

  }

});

// ×クリック
falseBtn.addEventListener("click", () => {

  if (currentQuiz.answer === false) {

    quizActive = false;
    quizMenu.style.display = "none";

  } else {

    wrongAnswer();

  }

});
