// Sizzle & Serve — shared configuration: canvas size, ingredients, recipes,
// scoring and timing. Everything the other modules need lives on Sizzle.cfg.
window.Sizzle = window.Sizzle || {};
(function () {
  'use strict';

  var INGREDIENTS = [
    { id: 'bun',     name: 'Bun',     key: '1', color: '#e8b25c', dark: '#a8742c', grill: false, cookMs: 0 },
    { id: 'patty',   name: 'Patty',   key: '2', color: '#8a5a33', dark: '#5d3a1e', grill: true,  cookMs: 6000 },
    { id: 'lettuce', name: 'Lettuce', key: '3', color: '#7dc242', dark: '#4a7d24', grill: false, cookMs: 0 },
    { id: 'tomato',  name: 'Tomato',  key: '4', color: '#e5484d', dark: '#a92c30', grill: false, cookMs: 0 },
    { id: 'cheese',  name: 'Cheese',  key: '5', color: '#ffc53d', dark: '#d99400', grill: false, cookMs: 0 },
    { id: 'sauce',   name: 'Sauce',   key: '6', color: '#f08c1e', dark: '#b25f06', grill: false, cookMs: 0 }
  ];

  // Each recipe is a dish a customer can order: a name and the exact stack
  // of ingredients, bottom to top, that the plate must hold to serve it.
  var RECIPES = [
    { name: 'Classic Burger', stack: ['bun', 'patty', 'lettuce', 'tomato'], price: 12 },
    { name: 'Cheese Melt',    stack: ['bun', 'patty', 'cheese', 'sauce'],   price: 14 },
    { name: 'Garden Stack',   stack: ['bun', 'lettuce', 'tomato', 'cheese'], price: 10 },
    { name: 'Double Trouble', stack: ['bun', 'patty', 'cheese', 'patty', 'sauce'], price: 18 },
    { name: 'Sunny Burger',   stack: ['bun', 'patty', 'lettuce', 'cheese', 'tomato'], price: 15 },
    { name: 'Saucy Stack',    stack: ['bun', 'patty', 'sauce', 'lettuce'],  price: 11 }
  ];

  window.Sizzle.cfg = {
    width: 1280,
    height: 720,
    shiftSeconds: 180,
    maxOrders: 3,
    orderSpawnMs: 14000,
    patienceMs: 52000,
    grillSlots: 2,
    grillBurnMs: 14000,
    serveBasePoints: 100,
    wrongServePenalty: 50,
    expiredOrderPenalty: 25,
    maxStrikes: 3,
    ingredients: INGREDIENTS,
    recipes: RECIPES,
    colors: {
      wall: '#f6e7c8',
      wallTrim: '#e0c48f',
      floor: '#c98f5f',
      counter: '#8a5a33',
      counterTop: '#b5773f',
      board: '#3e2f23',
      boardPaper: '#fff6dd',
      plate: '#f4f4f0',
      plateRim: '#c9c9c2',
      hud: '#2c2118',
      accent: '#e5484d',
      gold: '#ffc53d',
      green: '#4a9e3f',
      ink: '#2c2118'
    }
  };

  window.Sizzle.ingredientById = function (id) {
    for (var i = 0; i < INGREDIENTS.length; i++) {
      if (INGREDIENTS[i].id === id) return INGREDIENTS[i];
    }
    return null;
  };

  window.Sizzle.recipeByName = function (name) {
    for (var i = 0; i < RECIPES.length; i++) {
      if (RECIPES[i].name === name) return RECIPES[i];
    }
    return null;
  };
})();
