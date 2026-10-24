(function (Garden) {
  'use strict';

  const hitMasks = new WeakMap();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function getPose(resident, world, width, height, reducedMotion) {
    const held = world.drag?.resident === resident;
    const moving = resident.wait <= 0 && !resident.landing;
    const depth = .7 + resident.y * .4;
    const viewportScale = Math.max(.65, Math.min(1.25, Math.min(width / 800, height / 650)));
    const size = resident.size * depth * viewportScale;
    const phase = resident.phase;
    const ratio = resident.crop[2] / resident.crop[3];
    const imageHeight = Math.min(size * 1.3, size / ratio);
    const imageWidth = imageHeight * ratio;
    let x = resident.x * width;
    let y = resident.y * height;
    let angle = 0;
    let scaleX = resident.face;
    let scaleY = 1;
    let pivotX = 0;
    let pivotY = 0;

    if (held) {
      const drag = world.drag;
      x = drag.x * width;
      y = drag.y * height - (reducedMotion ? 22 : 18 + Math.min(1, drag.age / .12) * 10);
      pivotX = drag.gripX * imageWidth;
      pivotY = drag.gripY * imageHeight;
      angle = reducedMotion ? .08 : Math.sin(phase * 7.5) * .24 + drag.sway * .5;
      scaleX *= reducedMotion ? 1 : 1 + Math.sin(phase * 10.5) * .1;
      scaleY = reducedMotion ? 1.08 : 1.14 + Math.sin(phase * 8.5 + 1) * .09;
    } else {
      if (resident.landing) {
        const landing = resident.landing;
        const progress = Math.min(1, landing.elapsed / landing.duration) ** 2;
        x = (landing.fromX + (resident.x - landing.fromX) * progress) * width;
        y = (landing.fromY + (resident.y - landing.fromY) * progress) * height;
      } else if (!reducedMotion) {
        y -= moving ? Math.abs(Math.sin(phase * 2.6)) * size * world.scene.bounce
          : Math.sin(phase) * 1.1;
      }
      if (!reducedMotion) {
        let squash = moving ? Math.sin(phase * 5.2) * .055 : Math.sin(phase) * .025;
        if (resident.settle > 0) squash += Math.sin((1 - resident.settle / .24) * Math.PI) * .18;
        scaleX *= 1 + squash;
        scaleY = 1 - squash;
        angle = moving ? Math.sin(phase * 2.6) * .055 : Math.sin(phase * .6) * .025;
      }
    }

    return { x, y, angle, scaleX, scaleY, pivotX, pivotY, imageWidth, imageHeight, size, held };
  }

  function footPosition(pose) {
    const dx = -pose.pivotX * pose.scaleX;
    const dy = -pose.pivotY * pose.scaleY;
    return {
      x: pose.x + Math.cos(pose.angle) * dx - Math.sin(pose.angle) * dy,
      y: pose.y + Math.sin(pose.angle) * dx + Math.cos(pose.angle) * dy,
    };
  }

  function getHitMask(resident) {
    if (hitMasks.has(resident.image)) return hitMasks.get(resident.image);
    const [sx, sy, sw, sh] = resident.crop;
    const scale = Math.min(1, 128 / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    let mask = null;
    try {
      context.drawImage(resident.image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      mask = {
        width: canvas.width,
        height: canvas.height,
        pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
      };
    } catch {
      // A file:// image may be drawable while pixel reads remain restricted.
    }
    hitMasks.set(resident.image, mask);
    return mask;
  }

  Garden.pickCreature = function (world, point, width, height, reducedMotion) {
    const frontToBack = [...world.residents].sort((a, b) => a.y - b.y).reverse();
    for (const resident of frontToBack) {
      const pose = getPose(resident, world, width, height, reducedMotion);
      const dx = point.x - pose.x;
      const dy = point.y - pose.y;
      const localX = (Math.cos(pose.angle) * dx + Math.sin(pose.angle) * dy) / pose.scaleX + pose.pivotX;
      const localY = (-Math.sin(pose.angle) * dx + Math.cos(pose.angle) * dy) / pose.scaleY + pose.pivotY;
      const u = localX / pose.imageWidth + .5;
      const v = localY / pose.imageHeight + 1;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
      const mask = getHitMask(resident);
      if (mask && mask.pixels[(Math.floor(v * mask.height) * mask.width + Math.floor(u * mask.width)) * 4 + 3] <= 12) continue;
      return { resident, grip: { x: u - .5, y: v - 1 } };
    }
    return null;
  };

  Garden.creaturePose = Object.freeze({ get: getPose, footPosition });

  Garden.drawCreature = function (context, resident, world, width, height, reducedMotion) {
    const pose = getPose(resident, world, width, height, reducedMotion);
    const foot = footPosition(pose);
    const shadowX = pose.held ? foot.x : resident.x * width;
    const shadowY = pose.held ? clamp(foot.y + 38, height * .49, height * .94) : resident.y * height + 2;
    context.fillStyle = pose.held ? '#30452520' : world.sceneId === 'pond' ? '#112f383d' : '#64795124';
    context.beginPath();
    context.ellipse(shadowX, shadowY, pose.size * (pose.held ? .27 : .34),
      pose.size * (pose.held ? .065 : .095), 0, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(pose.x, pose.y);
    context.rotate(pose.angle);
    context.scale(pose.scaleX, pose.scaleY);
    context.translate(-pose.pivotX, -pose.pivotY);
    context.drawImage(resident.image, ...resident.crop,
      -pose.imageWidth / 2, -pose.imageHeight, pose.imageWidth, pose.imageHeight);
    context.restore();
  };
})(window.MonsterGarden);
