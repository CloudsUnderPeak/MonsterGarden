(function (Garden) {
  'use strict';

  Garden.drawCreature = function (context, resident, world, width, height, reducedMotion) {
    const moving = resident.wait <= 0;
    const depth = .7 + resident.y * .4;
    const viewportScale = Math.max(.65, Math.min(1.25, Math.min(width / 800, height / 650)));
    const size = resident.size * depth * viewportScale;
    const phase = resident.phase;
    const bounce = reducedMotion ? 0 : moving
      ? Math.abs(Math.sin(phase * 2.6)) * size * world.scene.bounce
      : Math.sin(phase) * 1.1;
    const squash = reducedMotion ? 0 : moving
      ? Math.sin(phase * 5.2) * .055
      : Math.sin(phase) * .025;
    const x = resident.x * width;
    const y = resident.y * height;

    context.fillStyle = world.sceneId === 'pond' ? '#112f383d' : '#64795124';
    context.beginPath();
    context.ellipse(x, y + 2, size * .34, size * .095, 0, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(x, y - bounce);
    if (!reducedMotion) {
      context.rotate(moving ? Math.sin(phase * 2.6) * .055 : Math.sin(phase * .6) * .025);
    }
    context.scale(resident.face * (1 + squash), 1 - squash);
    const [sx, sy, sw, sh] = resident.crop;
    const ratio = sw / sh;
    const imageHeight = Math.min(size * 1.3, size / ratio);
    const imageWidth = imageHeight * ratio;
    context.drawImage(resident.image, sx, sy, sw, sh,
      -imageWidth / 2, -imageHeight, imageWidth, imageHeight);
    context.restore();
  };
})(window.MonsterGarden);
