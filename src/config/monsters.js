(function (Garden) {
  'use strict';

  // Formal filenames are stable IDs. Import rules are documented in AGENTS.md.
  // Paths are relative to index.html, including on GitHub project Pages.
  Garden.monsterPaths = Object.freeze([
    'assets/monsters/monster-001.avif',
    'assets/monsters/monster-002.avif',
    'assets/monsters/monster-003.avif',
    'assets/monsters/monster-004.avif',
    'assets/monsters/monster-005.avif',
    'assets/monsters/monster-006.avif',
    'assets/monsters/monster-007.avif',
    'assets/monsters/monster-008.avif',
    'assets/monsters/monster-009.avif',
    'assets/monsters/monster-010.avif',
    'assets/monsters/monster-011.avif',
    'assets/monsters/monster-012.png',
    'assets/monsters/monster-013.png',
    'assets/monsters/monster-014.png',
    'assets/monsters/monster-015.png',
    'assets/monsters/monster-016.png',
    'assets/monsters/monster-017.png',
    'assets/monsters/monster-018.png',
  ]);

  // These source images face left; other images are assumed to face right.
  Garden.leftFacingMonsters = Object.freeze([
    'monster-004',
    'monster-008',
    'monster-011',
  ]);
})(window.MonsterGarden);
