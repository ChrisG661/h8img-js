// Christopher G (2021)
// This code took more time to write than it should be. CORS, WHY?
// An overengineered yet buggy piece of ~art~ code

console.log("hi :)");
var BASE_URL = "https://himawari8-dl.nict.go.jp/himawari8/img/D531106";
var BASE_CORS = "himawari8-dl.nict.go.jp:443/himawari8/img/D531106";
var CORS = "https://cors-px.chrisg661.repl.co/"; // CORS proxy
var SCALE = 550;
var LEVEL = 2;
var CURRENT_DATE;
var currentDelay = 20;
var canvas = document.getElementById("h8");
var zoomcanvas = document.querySelector('.panzoom');
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

function altlatestdate() {
  console.log("Using alternative date method");
  var d = new Date();
  d.setMinutes(Math.round((d.getMinutes() - 20) / 10) * 10);
  var year = d.getUTCFullYear();
  var month = ("0" + (d.getUTCMonth() + 1)).slice(-2);
  var date = ("0" + d.getUTCDate()).slice(-2);
  var hour = ("0" + d.getUTCHours()).slice(-2);
  var minute = ("0" + d.getUTCMinutes()).slice(-2);
  var date = `${year}/${month}/${date}/${hour}${minute}00`;
  return date;
}

function latestdate(level) {
  var uri = CORS + BASE_CORS + "/latest.json";
  var date = (async function () {
    var resp = await fetch(uri);
    if (resp.status != 200) {
      console.log("NOT OK! - CORS is broken, cannot fetch latest date");
      return altlatestdate();
    }
    else {
      var d = ((await resp.json()).date).replaceAll("-", "/").replaceAll(" ", "/").replaceAll(":", "");
      return d;
    }
  })();
  return date;
}

function latestUrl(x, y, level, date) {
  var url = `${BASE_URL}/${level}d/${SCALE}/${date}_${x}_${y}.png`;
  return url;
}

async function getEarth(currentLevel, detailChange = false) {
  var date = await latestdate(currentLevel).then(function (date) { return date });
  if ((date == CURRENT_DATE && !detailChange)) {
    return;
  }
  else {
    CURRENT_DATE = date;
  }
  canvas.width = currentLevel * SCALE;
  canvas.height = currentLevel * SCALE;
  var h = [...Array(currentLevel).keys()];
  var v = [...Array(currentLevel).keys()];
  var img;
  var url;
  var maskWidth = canvas.width - (canvas.width*0.008);
  ctx.beginPath();
  ctx.arc(canvas.width/2,canvas.width/2,maskWidth/2,0,2*Math.PI);
  ctx.closePath();
  ctx.clip();
  for (var x of h) {
    for (var y of v) {
      url = latestUrl(x, y, currentLevel, date);
      var currentScale = ctx.canvas.width / currentLevel;
      //console.log(currentScale)
      img = new Image();
      img.onload = (
        function (x, y, scale) {
          return function () {
            ctx.drawImage(this, (x * scale), (y * scale), (scale), (scale));
          }
        }
      )(x, y, currentScale);
      img.src = url;
    }
  }
}

function moreDetail() {
  if (LEVEL == 16) {
    LEVEL = 20;
  }
  else if (LEVEL == 20) {
    LEVEL = 2; // back to lowest
  }
  else {
    LEVEL = LEVEL * 2;
  }
  console.log(LEVEL);
  getEarth(LEVEL, true);
}

var timer = setInterval(function () {
  getEarth(LEVEL);
}, 60 * 5 * 1000);

if (!zoomcanvas) {
  canvas.onload = getEarth(LEVEL, true);
}

if (zoomcanvas) {
  const panzoom = Panzoom(zoomcanvas, {
    animate: true,
    canvas: true,
    minScale: 0.15,
    maxScale: 10,
    startScale: 0.15,
    panOnlyWhenZoomed: true
  })
  
  async function animate() {
    await getEarth(LEVEL, true);
    setTimeout(function(){
      panzoom.zoom(1, {duration: 2000});
      panzoom.setOptions({minScale: 1})
    }, 1500);

  }

  zoomcanvas.onload = animate();

  zoomcanvas.parentElement.addEventListener("wheel", function (event) {
    if (!event.shiftKey) return;
    panzoom.zoomWithWheel(event);
  })

  // 2,4,8,16,20
  zoomcanvas.addEventListener("panzoomchange", (event) => {
    var prevLevel = LEVEL;
    //console.log(event.detail) // => { x: 0, y: 0, scale: 1 }
    if (event.detail.scale <= 1.5) {
      LEVEL = 2
    }
    else if (event.detail.scale <= 2.5) {
      LEVEL = 4
    }
    else if (event.detail.scale <= 3.5) {
      LEVEL = 8
    }
    else if (event.detail.scale <= 4.5) {
      LEVEL = 16
    }
    else if (event.detail.scale <= 5.5) {
      LEVEL = 16
    }
    else if (event.detail.scale > 6) {
      LEVEL = 20
    }
    else {
      LEVEL = 2
    }
    if (event.detail.scale == 1 && event.detail.x != 0 && event.detail.y != 0) {
      panzoom.pan(0, 0, { force: true }) // reset
    }
    if (LEVEL != prevLevel) {
      //console.log("current scale: ", prevLevel, LEVEL, event.detail.scale)
      getEarth(LEVEL, true)
    }
  })
}