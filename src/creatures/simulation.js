(function (Garden) {
  'use strict';

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const RESIDENT_LIMIT = 10;

  function inPond(x, y) {
    // Conservative shoreline bounds keep feet clear of the water.
    return x > .45 && x < .93 && y > .61 && y < .84;
  }

  class Simulation {
    constructor() {
      this.sceneId = 'meadow';
      this.residents = [];
      this.residentAssets = [];
      this.footprints = [];
      this.destination = null;
      this.time = 0;
      this.drag = null;
    }

    get scene() {
      return Garden.scenes[this.sceneId];
    }

    setResidents(assets) {
      this.residentAssets = [...assets];
      this.rerollResidents();
    }

    rerollResidents() {
      this.releaseDrag(null, false);
      // Shuffle a copy so every draw samples the complete loaded catalog.
      const candidates = [...this.residentAssets];
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      // No placeholder creatures: every resident requires a decoded image.
      this.residents = candidates.slice(0, RESIDENT_LIMIT).map((asset) => ({
        ...asset,
        size: random(82, 108),
      }));
      this.redistributeResidents();
    }

    redistributeResidents() {
      this.releaseDrag(null, false);
      this.footprints = [];
      this.destination = null;
      for (const resident of this.residents) {
        resident.x = random(.1, .9);
        resident.y = random(.5, .88);
        if (this.sceneId === 'pond' && inPond(resident.x, resident.y)) {
          resident.y = random(.49, .58);
        }
        resident.phase = random(0, Math.PI * 2);
        resident.wait = random(0, 4);
        resident.face = Math.random() < .5 ? -1 : 1;
        resident.step = 0;
        resident.landing = null;
        resident.settle = 0;
        this.chooseTarget(resident);
      }
    }

    setScene(id) {
      if (!Object.hasOwn(Garden.scenes, id)) return;
      this.releaseDrag(null, false);
      this.sceneId = id;
      this.footprints = [];
      this.destination = null;
      if (id === 'pond') {
        this.residents.forEach((resident) => {
          if (inPond(resident.x, resident.y)) resident.y = .56;
          this.chooseTarget(resident);
        });
      }
    }

    chooseTarget(resident) {
      resident.tx = random(.08, .92);
      resident.ty = random(.49, .89);
      if (this.sceneId === 'pond') {
        // Walk along the upper or left bank, rather than through water.
        if (resident.x > .43 && resident.y > .84) {
          resident.tx = random(.08, .4);
          resident.ty = random(.85, .89);
        } else if (resident.x > .43) resident.ty = random(.49, .58);
        else resident.tx = random(.08, .4);
      }
    }

    beginDrag(resident, point, grip) {
      if (this.drag || !this.residents.includes(resident)) return false;
      resident.landing = null;
      resident.settle = 0;
      this.destination = null;
      this.drag = {
        resident,
        x: point.x,
        y: point.y,
        gripX: grip.x,
        gripY: grip.y,
        age: 0,
        sway: 0,
      };
      return true;
    }

    moveDrag(point) {
      if (!this.drag) return;
      const x = clamp(point.x, .02, .98);
      this.drag.sway = clamp((x - this.drag.x) * 20, -.7, .7);
      this.drag.x = x;
      this.drag.y = clamp(point.y, .06, .96);
    }

    releaseDrag(position = null, animate = true) {
      if (!this.drag) return;
      const { resident } = this.drag;
      const from = position || { x: this.drag.x, y: this.drag.y };
      resident.x = clamp(from.x, .08, .92);
      resident.y = clamp(from.y, .49, .89);
      if (this.sceneId === 'pond' && inPond(resident.x, resident.y)) {
        // Place the resident on the nearer upper or left bank.
        if (resident.x - .43 < resident.y - .59) resident.x = .43;
        else resident.y = .59;
      }
      resident.landing = animate
        ? { fromX: from.x, fromY: from.y, elapsed: 0, duration: .28 }
        : null;
      resident.wait = random(.5, 1.2);
      resident.step = 0;
      this.drag = null;
      this.chooseTarget(resident);
    }

    attract(x, y) {
      if (y < .46 || y > .93) return;
      if (this.sceneId === 'pond' && inPond(x, y)) return;
      this.destination = { x, y, at: this.time };
      this.residents.forEach((resident) => {
        if (this.drag?.resident === resident || resident.landing) return;
        resident.tx = clamp(x + random(-.06, .06), .08, .92);
        resident.ty = clamp(y + random(-.025, .025), .49, .89);
        if (this.sceneId === 'pond') {
          // Move to the shared corner first if the other bank is across water.
          if (inPond(resident.tx, resident.ty)) resident.ty = .56;
          const acrossBanks = (resident.y > .61 && resident.tx > .43)
            || (resident.x > .43 && resident.ty > .61);
          if (acrossBanks) {
            resident.tx = .35;
            resident.ty = .54;
          }
        }
        resident.wait = random(0, .7);
      });
    }

    update(dt) {
      this.time += dt;
      for (const resident of this.residents) this.updateResident(resident, dt);
      for (const footprint of this.footprints) footprint.life -= dt * .035;
      this.footprints = this.footprints.filter((footprint) => footprint.life > 0).slice(-500);
      if (this.destination && this.time - this.destination.at > 2) this.destination = null;
    }

    updateResident(resident, dt) {
      resident.phase += dt * 3;
      if (this.drag?.resident === resident) {
        this.drag.age += dt;
        this.drag.sway *= Math.exp(-dt * 10);
        return;
      }
      if (resident.landing) {
        resident.landing.elapsed += dt;
        if (resident.landing.elapsed >= resident.landing.duration) {
          resident.landing = null;
          resident.settle = .24;
        }
        return;
      }
      resident.settle = Math.max(0, resident.settle - dt);
      resident.step += dt;
      if (resident.wait > 0) {
        resident.wait -= dt;
        return;
      }
      const dx = resident.tx - resident.x;
      const dy = resident.ty - resident.y;
      const distance = Math.hypot(dx, dy);
      if (distance < .012) {
        resident.wait = random(1.5, 6);
        this.chooseTarget(resident);
        return;
      }
      const travel = Math.min(distance, dt * .035 * this.scene.speed);
      resident.face = dx < 0 ? -1 : 1;
      resident.x += dx / distance * travel;
      resident.y += dy / distance * travel;
      if (this.sceneId === 'snow' && resident.step > .35) {
        this.footprints.push({ x: resident.x, y: resident.y, life: 1 });
        resident.step = 0;
      }
    }
  }

  Garden.Simulation = Simulation;
})(window.MonsterGarden);
