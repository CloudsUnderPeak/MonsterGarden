(function (Garden) {
  'use strict';

  class WorldRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      if (!this.context) throw new Error('Canvas 2D is unavailable');
      this.width = 0;
      this.height = 0;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas);
      this.resize();
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, bounds.width);
      this.height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * ratio);
      this.canvas.height = Math.round(this.height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    render(world, reducedMotion) {
      const { context, width, height } = this;
      Garden.sceneRenderer.drawBackground(context, world, width, height);
      // Sort a copy so overlap follows ground depth without mutating simulation order.
      const residents = [...world.residents].sort((a, b) => a.y - b.y);
      for (const resident of residents) {
        Garden.drawCreature(context, resident, world, width, height, reducedMotion);
      }
      Garden.sceneRenderer.drawForeground(context, world, width, height);
    }

    destroy() {
      this.resizeObserver.disconnect();
    }
  }

  Garden.WorldRenderer = WorldRenderer;
})(window.MonsterGarden);
