(function (Garden) {
  'use strict';

  Garden.scenes = Object.freeze({
    meadow: {
      name: '微風草原',
      sky: ['#edf0db', '#dae7c0'],
      ground: '#c5d7a4',
      far: '#d1dfb6',
      hill: '#bccf9d',
      speed: 1,
      bounce: .10,
    },
    pond: {
      name: '月光池畔',
      sky: ['#1f3543', '#57736c'],
      ground: '#516f5e',
      far: '#415d57',
      hill: '#36594e',
      speed: .65,
      bounce: .07,
    },
    snow: {
      name: '靜靜雪原',
      sky: ['#d8e6eb', '#f0f3ee'],
      ground: '#e6eeeb',
      far: '#d0deda',
      hill: '#bdcfca',
      speed: .48,
      bounce: .045,
    },
  });
})(window.MonsterGarden = window.MonsterGarden || {});
