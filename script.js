// --- Series Circuit Discussion Simulator ---
window.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('seriesSimCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const voltageSlider = document.getElementById('seriesSimVoltage');
  const resistanceSlider = document.getElementById('seriesSimResistance');
  const voltageVal = document.getElementById('seriesSimVoltageVal');
  const resistanceVal = document.getElementById('seriesSimResistanceVal');
  // Schematic positions
  const battery = {x: 40, y: 60, w: 30, h: 60};
  const resistor = {x: 400, y: 80, w: 40, h: 20};
  // Wire path (array of points)
  const wirePath = [
    {x: battery.x + battery.w, y: battery.y + battery.h/2},
    {x: 120, y: 90},
    {x: resistor.x, y: resistor.y+resistor.h/2},
    {x: resistor.x+resistor.w, y: resistor.y+resistor.h/2},
    {x: 120, y: 140},
    {x: battery.x + battery.w, y: battery.y + battery.h/2 + 40},
    {x: battery.x, y: battery.y + battery.h/2 + 40},
    {x: battery.x, y: battery.y + battery.h/2},
  ];
  let voltage = parseInt(voltageSlider.value);
  let resistance = parseInt(resistanceSlider.value);
  let t = 0;
  function drawSchematic() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Battery
    ctx.save();
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(battery.x, battery.y, battery.w, battery.h);
    ctx.fillStyle = '#222';
    ctx.fillRect(battery.x+8, battery.y+10, 4, battery.h-20);
    ctx.fillRect(battery.x+18, battery.y+5, 4, battery.h-10);
    ctx.restore();
    // Wires
    ctx.save();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(wirePath[0].x, wirePath[0].y);
    for (let i=1; i<wirePath.length; i++) ctx.lineTo(wirePath[i].x, wirePath[i].y);
    ctx.stroke();
    ctx.restore();
    // Resistor
    ctx.save();
    ctx.strokeStyle = '#ffb347';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(resistor.x, resistor.y+resistor.h/2);
    ctx.lineTo(resistor.x+resistor.w, resistor.y+resistor.h/2);
    ctx.stroke();
    ctx.restore();
    // Resistor body
    ctx.save();
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(resistor.x, resistor.y, resistor.w, resistor.h);
    ctx.restore();
    // Battery label
    ctx.save();
    ctx.font = 'bold 16px Segoe UI';
    ctx.fillStyle = '#ffe066';
    ctx.fillText('+', battery.x + battery.w + 2, battery.y + 18);
    ctx.fillText('-', battery.x - 16, battery.y + battery.h - 8);
    ctx.restore();
    // Resistor label
    ctx.save();
    ctx.font = 'bold 15px Segoe UI';
    ctx.fillStyle = '#ffb347';
    ctx.fillText('R', resistor.x+resistor.w/2-6, resistor.y+resistor.h+18);
    ctx.restore();
  }
  function drawElectrons() {
    // Electron speed: base + scale with V/R
    const baseSpeed = 0.5;
    const speed = baseSpeed + 2.5 * (voltage / resistance);
    const numElectrons = 10;
    for (let i=0; i<numElectrons; i++) {
      // Each electron offset in time
      let progress = ((t*speed/60) + i/numElectrons) % 1;
      // Map progress to wire path
      let totalLen = 0, segLens = [];
      for (let j=0; j<wirePath.length-1; j++) {
        let dx = wirePath[j+1].x - wirePath[j].x;
        let dy = wirePath[j+1].y - wirePath[j].y;
        let len = Math.sqrt(dx*dx+dy*dy);
        segLens.push(len);
        totalLen += len;
      }
      let dist = progress * totalLen;
      let segIdx = 0;
      while (dist > segLens[segIdx] && segIdx < segLens.length-1) {
        dist -= segLens[segIdx];
        segIdx++;
      }
      let segStart = wirePath[segIdx];
      let segEnd = wirePath[segIdx+1];
      let segLen = segLens[segIdx];
      let frac = segLen ? dist/segLen : 0;
      let x = segStart.x + (segEnd.x-segStart.x)*frac;
      let y = segStart.y + (segEnd.y-segStart.y)*frac;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI*2);
      ctx.fillStyle = '#00e0ff';
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = '#00e0ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }
  function animate() {
    drawSchematic();
    drawElectrons();
    t++;
    requestAnimationFrame(animate);
  }
  voltageSlider.addEventListener('input', function() {
    voltage = parseInt(this.value);
    voltageVal.textContent = voltage;
  });
  resistanceSlider.addEventListener('input', function() {
    resistance = parseInt(this.value);
    resistanceVal.textContent = resistance;
  });
  voltageVal.textContent = voltage;
  resistanceVal.textContent = resistance;
  animate();
});
const canvas = document.getElementById("circuitCanvas");
const ctx = canvas.getContext("2d");

const voltageInput = document.getElementById("voltage");
const resistanceInput = document.getElementById("resistance");
const currentDisplay = document.getElementById("current");
const toggleBtn = document.getElementById("toggle");

let isOn = false;

function drawCircuit() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Battery
  ctx.fillStyle = "yellow";
  ctx.fillRect(50, 120, 20, 60);
  ctx.fillRect(80, 100, 10, 100);

  // Wires
  ctx.strokeStyle = isOn ? "lime" : "gray";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(90, 150);
  ctx.lineTo(300, 150);
  ctx.lineTo(300, 80);
  ctx.lineTo(500, 80);
  ctx.lineTo(500, 220);
  ctx.lineTo(90, 220);
  ctx.closePath();
  ctx.stroke();

  // Bulb (resistor)
  ctx.fillStyle = isOn ? "orange" : "white";
  ctx.beginPath();
  ctx.arc(400, 80, 15, 0, Math.PI * 2);
  ctx.fill();
}

function updatePhysics() {
  if (isOn) {
    const V = Number(voltageInput.value);
    const R = Number(resistanceInput.value);
    const I = (V / R).toFixed(2); // Ohm’s Law
    currentDisplay.textContent = I;
  } else {
    currentDisplay.textContent = "0";
  }
}

toggleBtn.addEventListener("click", () => {
  isOn = !isOn;
  toggleBtn.textContent = isOn ? "Switch OFF" : "Switch ON";
  drawCircuit();
  updatePhysics();
});

drawCircuit();

