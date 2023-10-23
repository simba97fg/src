const baseSize = 100

function setRem() {
  const scale = window.innerWidth / 1440
  document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
}
setRem()
window.onresize = function() {
    setRem();
}
