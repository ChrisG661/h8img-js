// Christopher G (2021)
// This code took more time to write than it should be. CORS, WHY?
// An overengineered yet buggy piece of ~art~ code

console.log("hi :)");
var BASE = "https://himawari8-dl.nict.go.jp/himawari8/img/D531106";
var BASE_CORS = "himawari8-dl.nict.go.jp:443/himawari8/img/D531106";
var CORS = "https://cors-px.chrisg661.repl.co/"; // CORS proxy
var SCALE = 550;
var LEVEL = 2;
var canvas = document.getElementById('h8');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

function altlatestdate() {
  console.log("Using alternative date method");
  var d = new Date();
  d.setMinutes(Math.round((d.getMinutes() - 20)/10)*10);
  var year = d.getUTCFullYear();
  var month = ("0" + (d.getUTCMonth()+1)).slice(-2);
  var date = ("0" + d.getUTCDate()).slice(-2);
  var hour = ("0" + d.getUTCHours()).slice(-2);
  var minute = ("0" + d.getUTCMinutes()).slice(-2);
  var date = `${year}/${month}/${date}/${hour}${minute}00`;
  return date;
}

function latestdate(level) {
  var uri = CORS + BASE_CORS + "/latest.json";
  var date = (async function ()
  {
    var resp = await fetch(uri);
    if (resp.status != 200) {
      console.log('NOT OK!');
      return altlatestdate();
    }
    else {
      var d = ((await resp.json()).date).replaceAll('-', '/').replaceAll(' ', '/').replaceAll(':', '');
      return d;
    }
  })();
  return date;
}

function latestUrl(x, y, level, date) {
  var url = `${BASE}/${level}d/${SCALE}/${date}_${x}_${y}.png`;
  return url;
}

async function getEarth(){
  var h = [...Array(LEVEL).keys()];
  var v = [...Array(LEVEL).keys()];
  var img;
  var url;
  var date = await latestdate(LEVEL).then(function (date) {return date}); // don't know if this is necessary, but whatever.
  for (var x of h) {
    for (var y of v) {
      url = latestUrl(x, y, LEVEL, date);
      var currentScale = ctx.canvas.width / LEVEL;
      img = new Image();
      img.onload = (
        function(x, y, scale){
          return function() {
            ctx.drawImage(this, (x*scale), (y*scale), (scale), (scale));
          }
        }
      )(x,y,currentScale);
      img.src = url;
    }
  }
}

(function() {
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    // support hidpi screen
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height =  window.innerWidth * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerWidth + 'px';
    LEVEL = (canvas.width > (LEVEL * 550)) ? 8 : 4;
    //console.log(LEVEL);
    getEarth(LEVEL); 
  }
  resizeCanvas();
})();

function moreDetail() {
  LEVEL = LEVEL * 2;
  if (LEVEL > 16) {
    LEVEL = 2;
  }
  //console.log(LEVEL);
  getEarth(LEVEL);
}

var timer = setInterval(function() {
    getEarth(LEVEL);
}, 60 * 5 * 1000);