// Christopher G (2020)
// This code took more time to write than it should be. JS, WHY?
console.log("GGEZ")
var BASE = "https://himawari8-dl.nict.go.jp/himawari8/img/D531106";
var SCALE = 550;
var LEVEL = 2;
var canvas = document.getElementById('h8');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "medium";

function formatUrl(x, y, level) {
  var d = new Date();
  d.setMinutes(Math.round((d.getMinutes() - 20)/10)*10);
  var year = d.getUTCFullYear();
  var month = ("0" + (d.getUTCMonth()+1)).slice(-2);
  var date = ("0" + d.getUTCDate()).slice(-2);
  var hour = ("0" + d.getUTCHours()).slice(-2);
  var minute = ("0" + d.getUTCMinutes()).slice(-2);
  if (hour == 02 && minute == 40) {
    minute -= 10;
  }
  var url = `${BASE}/${level}d/${SCALE}/${year}/${month}/${date}/${hour}${minute}00_${x}_${y}.png`;
  return url;
}

function getEarth(){
  var h = [...Array(LEVEL).keys()];
  var v = [...Array(LEVEL).keys()];
  var imgs = [];
  var img;
  var url;
  for (var x of h) {
    for (var y of v) {
      url = formatUrl(x, y, LEVEL);
      var foo = ctx.canvas.width / LEVEL;
      img = new Image();
      img.onload = (
        function(x, y, scale){
          return function() {
            ctx.drawImage(this, (x*scale), (y*scale), (scale), (scale));
          }
        }
      )(x,y,foo);
      img.src = url;
    }
  }
}

(function() {
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
    LEVEL = (canvas.width > (LEVEL * 550)) ? 4 : 2;
    getEarth(LEVEL); 
  }
  resizeCanvas();
})();

function moreDetail() {
  LEVEL = LEVEL * 2;
  if (LEVEL > 8) {
    LEVEL = 2;
  }
  console.log(LEVEL);
  getEarth(LEVEL);
}

var timer = setInterval(function() {
    getEarth(LEVEL);
}, 60 * 5 * 1000); 