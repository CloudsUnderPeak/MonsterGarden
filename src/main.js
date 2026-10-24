(function (Garden) {
  'use strict';

  // Composition root: coordinates modules; simulation and rendering own their state.
  const canvas = document.querySelector('#world');
  const status = document.querySelector('#asset-status');
  const redistributeButton = document.querySelector('#redistribute');
  const world = new Garden.Simulation();
  const renderer = new Garden.WorldRenderer(canvas);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dragControls = Garden.bindCreatureDrag(canvas, world, renderer,
    () => motionPreference.matches);
  const unbindSelector = Garden.bindSceneSelector(
    document.querySelector('#scene-select'), world, canvas, dragControls.cancel,
  );
  let previousTime = null;
  let frameId = null;

  function frame(now) {
    const elapsed = previousTime === null ? 0 : Math.min((now - previousTime) / 1000, .05);
    previousTime = now;
    // Honor reduced-motion preferences with a still habitat and native scene switching.
    if (!motionPreference.matches) world.update(elapsed * .8);
    renderer.render(world, motionPreference.matches);
    frameId = requestAnimationFrame(frame);
  }

  function onVisibilityChange() {
    previousTime = null;
    if (document.hidden) {
      dragControls.cancel();
      cancelAnimationFrame(frameId);
      frameId = null;
    } else if (frameId === null) {
      frameId = requestAnimationFrame(frame);
    }
  }

  function redistributeResidents() {
    dragControls.cancel();
    world.redistributeResidents();
  }

  async function loadResidents() {
    try {
      await Garden.resources.refreshScript('src/config/monsters.js');
      const { assets, failed } = await Garden.loadMonsterImages(Garden.monsterPaths);
      world.setResidents(assets);
      redistributeButton.disabled = assets.length === 0;
      if (failed) {
        status.textContent = `${failed} 張怪物圖片無法載入，請檢查檔案路徑與瀏覽器的 AVIF 支援。`;
      } else if (!assets.length) {
        status.textContent = '尚未設定怪物圖片。';
      }
      status.hidden = assets.length > 0 && failed === 0;
    } catch (error) {
      console.error('Unable to load monster images', error);
      status.textContent = '怪物圖片載入失敗，請重新整理後再試。';
      status.hidden = false;
    }
  }

  redistributeButton.addEventListener('click', redistributeResidents);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', (event) => {
    // The back-forward cache retains the existing application and listeners.
    if (event.persisted) return;
    cancelAnimationFrame(frameId);
    renderer.destroy();
    unbindSelector();
    dragControls.destroy();
    redistributeButton.removeEventListener('click', redistributeResidents);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  loadResidents();
  frameId = requestAnimationFrame(frame);
})(window.MonsterGarden);
