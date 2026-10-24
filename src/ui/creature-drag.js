(function (Garden) {
  'use strict';

  Garden.bindCreatureDrag = function (canvas, world, renderer, prefersReducedMotion) {
    let active = null;
    let groundPress = null;

    function pointFrom(event) {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - bounds.left) / bounds.width,
        y: (event.clientY - bounds.top) / bounds.height,
      };
    }

    function pick(point) {
      return Garden.pickCreature(world,
        { x: point.x * renderer.width, y: point.y * renderer.height },
        renderer.width, renderer.height, prefersReducedMotion());
    }

    function releaseActive() {
      const pointer = active;
      active = null;
      if (pointer && world.drag?.resident === pointer.resident) {
        const pose = Garden.creaturePose.get(pointer.resident, world,
          renderer.width, renderer.height, prefersReducedMotion());
        const foot = Garden.creaturePose.footPosition(pose);
        world.releaseDrag({ x: foot.x / renderer.width, y: foot.y / renderer.height },
          !prefersReducedMotion());
      }
      canvas.classList.remove('is-dragging', 'can-grab');
      if (pointer && canvas.hasPointerCapture(pointer.id)) {
        canvas.releasePointerCapture(pointer.id);
      }
    }

    function cancel() {
      groundPress = null;
      releaseActive();
    }

    function onPointerDown(event) {
      if (active || !event.isPrimary || event.button !== 0) return;
      const point = pointFrom(event);
      const hit = pick(point);
      if (!hit) {
        groundPress = { id: event.pointerId, x: event.clientX, y: event.clientY };
        return;
      }
      if (!world.beginDrag(hit.resident, point, hit.grip)) return;
      event.preventDefault();
      groundPress = null;
      active = { id: event.pointerId, resident: hit.resident };
      canvas.classList.add('is-dragging');
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Window listeners also handle releases if pointer capture is unavailable.
      }
    }

    function onPointerMove(event) {
      if (active) {
        if (event.pointerId !== active.id) return;
        if (world.drag?.resident !== active.resident) {
          cancel();
          return;
        }
        if (event.pointerType === 'mouse' && event.buttons === 0) {
          cancel();
          return;
        }
        world.moveDrag(pointFrom(event));
        return;
      }
      if (event.pointerType === 'mouse') {
        canvas.classList.toggle('can-grab', event.target === canvas && Boolean(pick(pointFrom(event))));
      }
    }

    function onPointerUp(event) {
      if (active?.id === event.pointerId) {
        releaseActive();
        return;
      }
      if (groundPress?.id !== event.pointerId) return;
      const moved = Math.hypot(event.clientX - groundPress.x, event.clientY - groundPress.y);
      groundPress = null;
      if (event.target === canvas && moved < 8) {
        const point = pointFrom(event);
        world.attract(point.x, point.y);
      }
    }

    function onPointerCancel(event) {
      if (active?.id === event.pointerId || groundPress?.id === event.pointerId) cancel();
    }

    function onLostCapture(event) {
      if (active?.id === event.pointerId) cancel();
    }

    function onPointerLeave() {
      if (!active) canvas.classList.remove('can-grab');
    }

    function onKeyDown(event) {
      if (event.key === 'Escape' && active) {
        event.preventDefault();
        cancel();
      }
    }

    function onContextMenu(event) {
      if (active) event.preventDefault();
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('lostpointercapture', onLostCapture);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', onKeyDown);

    return {
      cancel,
      destroy() {
        cancel();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('lostpointercapture', onLostCapture);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('contextmenu', onContextMenu);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);
        window.removeEventListener('blur', cancel);
        window.removeEventListener('keydown', onKeyDown);
      },
    };
  };
})(window.MonsterGarden);
