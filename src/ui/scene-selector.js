(function (Garden) {
  'use strict';

  Garden.bindSceneSelector = function (select, world, canvas, beforeChange = () => {}) {
    for (const [id, scene] of Object.entries(Garden.scenes)) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = scene.name;
      select.append(option);
    }
    select.value = world.sceneId;

    function syncScene() {
      beforeChange();
      world.setScene(select.value);
      document.body.dataset.scene = world.sceneId;
      canvas.setAttribute('aria-label',
        `小怪物在${world.scene.name}自由活動，按住怪物可拿起拖曳，點擊地面可吸引牠們靠近`);
    }

    // Native select supports touch, keyboard navigation, and screen readers.
    select.addEventListener('change', syncScene);
    syncScene();
    return () => select.removeEventListener('change', syncScene);
  };
})(window.MonsterGarden);
