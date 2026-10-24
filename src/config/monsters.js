(function (Garden) {
  'use strict';

  // Paths are relative to index.html, including on GitHub project Pages.
  // Add the path here when adding a PNG or AVIF to assets/monsters/.
  Garden.monsterPaths = Object.freeze([
    'assets/monsters/5bp4724mlbcelzdf635ib5hm3xuh.avif',
    'assets/monsters/7ejsf1pslt9mujv4ljx7r6qryaw6.avif',
    'assets/monsters/7gcpm2ehje2s9v1n2banq11rtnfz.avif',
    'assets/monsters/9vnqk1xfozn7rdww7pzyul9v5xz0.avif',
    'assets/monsters/jk4zliy17f1eej88rymq76oxudil.avif',
    'assets/monsters/kkfhq3i99y20f75m367obmdo67bn.avif',
    'assets/monsters/luviga9xylmzqe2wogsfmlp2v27h.avif',
    'assets/monsters/ns3chv44noufc242tw7u1xmzign1.avif',
    'assets/monsters/rws786b8fijnrpijr3b8vtzuwz2u.avif',
    'assets/monsters/tg7wgvry53qa0532e1bz0jo495qj.avif',
    'assets/monsters/vsqfgvbsilxtn4xl4tv8l9mp7yx6.avif',
  ]);

  // These source images face left; other images are assumed to face right.
  Garden.leftFacingMonsters = Object.freeze([
    '9vnqk1xfozn7rdww7pzyul9v5xz0',
    'ns3chv44noufc242tw7u1xmzign1',
    'vsqfgvbsilxtn4xl4tv8l9mp7yx6',
  ]);
})(window.MonsterGarden);
