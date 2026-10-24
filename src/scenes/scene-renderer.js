(function (Garden) {
  'use strict';

  const seed = (index) => {
    const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function ellipse(context, x, y, rx, ry, color) {
    context.fillStyle = color;
    context.beginPath();
    context.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), 0, 0, Math.PI * 2);
    context.fill();
  }

  function drawTree(context, x, y, size, sceneId) {
    const night = sceneId === 'pond';
    const snow = sceneId === 'snow';
    const colors = night ? ['#3c5c4a', '#466650', '#52735a']
      : snow ? ['#9aafa3', '#afc1b6', '#c7d6ca']
        : ['#96ad7c', '#a7bc85', '#b3c68f'];

    context.fillStyle = night ? '#304d43' : '#899c70';
    context.fillRect(x - size * .06, y - size * .5, size * .12, size * .6);
    ellipse(context, x, y - size * .65, size * .47, size * .54, colors[0]);
    ellipse(context, x - size * .23, y - size * .55, size * .33, size * .33, colors[1]);
    ellipse(context, x + size * .17, y - size * .88, size * .3, size * .27, colors[2]);
    if (snow) {
      ellipse(context, x, y - size * 1.12, size * .24, size * .09, '#eaf1ec');
      ellipse(context, x - size * .22, y - size * .78, size * .22, size * .07, '#eaf1ec');
    }
  }

  function drawSky(context, world, width, height) {
    const { scene, sceneId, time } = world;
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, scene.sky[0]);
    gradient.addColorStop(1, scene.sky[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    if (sceneId === 'pond') {
      for (let i = 0; i < 45; i++) {
        const opacity = .3 + Math.sin(time * .7 + i) * .15;
        const radius = seed(i + 70) + .5;
        ellipse(context, seed(i + 1) * width, seed(i + 90) * height * .4,
          radius, radius, `rgba(246,239,194,${opacity})`);
      }
      ellipse(context, width * .78, height * .18, 29, 29, '#e4dfb4');
      ellipse(context, width * .79, height * .17, 29, 29, scene.sky[0]);
    } else if (sceneId === 'meadow') {
      ellipse(context, width * .76, height * .19, 65, 65, '#f0edc422');
      ellipse(context, width * .76, height * .19, 45, 45, '#f0edc4');
    }

    for (let i = 0; i < 5; i++) {
      const x = ((seed(i + 6) * width + time * 2 + 100) % (width + 200)) - 100;
      const y = height * (.15 + seed(i + 8) * .16);
      const color = sceneId === 'pond' ? '#78908016' : '#ffffff46';
      ellipse(context, x, y, 65, 14, color);
      ellipse(context, x - 22, y - 7, 32, 18, color);
    }
  }

  function drawTerrain(context, world, width, height) {
    const { scene, sceneId, time } = world;
    ellipse(context, width * .22, height * .59, width * .67, height * .24, scene.far);
    ellipse(context, width * .87, height * .6, width * .55, height * .27, scene.hill);
    ellipse(context, width * .5, height * 1.06, width * .97, height * .64, scene.ground);

    context.beginPath();
    context.moveTo(width * .52, height * .43);
    context.bezierCurveTo(width * .3, height * .62, width * .75, height * .72, width * .58, height);
    context.lineTo(width * .76, height);
    context.bezierCurveTo(width * .87, height * .69, width * .38, height * .56, width * .55, height * .43);
    context.fillStyle = sceneId === 'pond' ? '#81917a24'
      : sceneId === 'snow' ? '#ffffff60' : '#e1e3b57a';
    context.fill();

    const treeSize = Math.min(height, width * 1.1);
    drawTree(context, width * .05, height * .5, treeSize * .31, sceneId);
    drawTree(context, width * .96, height * .55, treeSize * .36, sceneId);
    drawTree(context, width * .17, height * .46, treeSize * .2, sceneId);

    if (sceneId === 'pond') {
      ellipse(context, width * .69, height * .73, width * .22, height * .1, '#365e65');
      ellipse(context, width * .69, height * .72, width * .21, height * .085, '#507e8055');
      for (let i = 0; i < 6; i++) {
        ellipse(context, width * (.54 + i * .05), height * (.72 + Math.sin(i) * .03),
          12 + Math.sin(time + i) * 2, 1, '#bad1bd44');
      }
      ellipse(context, width * .78, height * .75, 17, 5, '#73916b');
      ellipse(context, width * .6, height * .69, 13, 4, '#829b70');
    }
  }

  function drawPlants(context, world, width, height) {
    const { sceneId, time } = world;
    const night = sceneId === 'pond';
    const snow = sceneId === 'snow';
    const count = Math.round(Math.min(180, width / 9));
    for (let i = 0; i < count; i++) {
      const x = seed(i + 33) * width;
      const y = height * (.47 + seed(i + 133) * .51);
      if (night && x > width * .46 && x < width * .92 && y > height * .62 && y < height * .84) continue;
      const scale = .5 + y / height;
      const sway = Math.sin(time * 1.4 + i) * 2;
      context.strokeStyle = snow ? '#a9bbb366' : night ? '#6f8c6570' : '#8ca66d70';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x - 2, y - 5 * scale, x - 4 + sway, y - 10 * scale);
      context.moveTo(x, y);
      context.quadraticCurveTo(x + 4, y - 3, x + 5 + sway, y - 7 * scale);
      context.stroke();
      if (i % 4 === 0 && !snow) {
        ellipse(context, x - 4 + sway, y - 10 * scale, 3 * scale, 2 * scale,
          night ? '#aeb994' : '#f0ebcd');
        ellipse(context, x - 4 + sway, y - 10 * scale, 1.2, 1.2, '#c0b56c');
      }
    }
    const stone = snow ? '#c8d6d2' : night ? '#3c554d' : '#a5b58f';
    ellipse(context, width * .06, height * .88, 29, 13, stone);
    ellipse(context, width * .09, height * .9, 19, 11, stone);
  }

  function drawParticles(context, world, width, height) {
    const { sceneId, time } = world;
    if (sceneId === 'pond') {
      for (let i = 0; i < 35; i++) {
        const x = seed(i + 400) * width + Math.sin(time * .3 + i) * 15;
        const y = height * (.35 + seed(i + 500) * .52) + Math.cos(time * .4 + i) * 10;
        ellipse(context, x, y, 8, 8, '#e4e9a009');
        ellipse(context, x, y, 2, 2, `rgba(228,233,160,${.4 + Math.sin(time * 1.5 + i) * .3})`);
      }
    } else if (sceneId === 'snow') {
      for (let i = 0; i < 95; i++) {
        const x = (seed(i + 600) * width + Math.sin(time * .2 + i) * 18 + width) % width;
        const y = (seed(i + 700) * height + time * (8 + seed(i) * 12)) % height;
        const radius = 1 + seed(i + 800) * 2;
        ellipse(context, x, y, radius, radius, '#ffffffa6');
      }
    } else {
      for (let i = 0; i < 20; i++) {
        const x = (seed(i + 800) * width + time * 5) % width;
        const y = height * (.35 + seed(i + 900) * .5) + Math.sin(time * .4 + i) * 8;
        ellipse(context, x, y, 1.5, 1.5, '#fffce49a');
      }
    }
  }

  function drawFootprints(context, world, width, height) {
    if (world.sceneId !== 'snow') return;
    for (const footprint of world.footprints) {
      const color = `rgba(140,165,164,${footprint.life * .3})`;
      ellipse(context, footprint.x * width - 3, footprint.y * height, 2, 1, color);
      ellipse(context, footprint.x * width + 3, footprint.y * height + 3, 2, 1, color);
    }
  }

  function drawDestination(context, world, width, height) {
    if (!world.destination) return;
    const { x, y, at } = world.destination;
    const age = world.time - at;
    const color = world.sceneId === 'pond' ? '230,230,180' : '109,135,81';
    context.strokeStyle = `rgba(${color},${Math.max(0, .5 - age * .25)})`;
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(x * width, y * height, 10 + age * 15, 5 + age * 7, 0, 0, Math.PI * 2);
    context.stroke();
  }

  Garden.sceneRenderer = Object.freeze({
    drawBackground(context, world, width, height) {
      drawSky(context, world, width, height);
      drawTerrain(context, world, width, height);
      drawPlants(context, world, width, height);
      drawFootprints(context, world, width, height);
    },
    drawForeground(context, world, width, height) {
      drawParticles(context, world, width, height);
      drawDestination(context, world, width, height);
    },
  });
})(window.MonsterGarden);
