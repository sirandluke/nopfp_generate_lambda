const https = require('https');
const COLOR_API_ENDPOINT = 'https://www.thecolorapi.com/scheme?'

const mode = [
  'monochrome',
  'monochrome-light',
  'analogic',
  'complement',
  'analogic-complement',
  'triad',
  'quad'
];

function pivotChoice(p) {
  var a, b;
  let ran = Math.floor(Math.random() * 3);  // [0, 2]
  let i = Math.floor(Math.random()*p.length);  // [0, 4]
  switch (ran) {
    case 2:
      a = p[i];
      b = p[(i + 4) % p.length];
      break;
    case 1:
      a = p[i];
      b = p[(i + 2) % p.length];
      break;
    default:
      a = p[0];
      b = p.slice(-1)[0];
  }
  return {
    a,
    b
  };
}


// Source: https://www.canva.com/colors/color-wheel/
function choosePalette() {
  // Generate random initial color.
  return new Promise((resolve, reject) => {
    let color = (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);
    let url = COLOR_API_ENDPOINT + `hex=${color}&mode=${mode[Math.floor(Math.random()*mode.length)]}`
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk
      });
      response.on('end', () => {
        let palette = JSON.parse(data).colors;
        let colorObjs = pivotChoice(palette);
        let colorA = {
          name: colorObjs.a.name.value,
          hex: colorObjs.a.hex.value
        };
        let colorB = {
          name: colorObjs.b.name.value,
          hex: colorObjs.b.hex.value
        };
        resolve({colorA, colorB});
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { choosePalette };