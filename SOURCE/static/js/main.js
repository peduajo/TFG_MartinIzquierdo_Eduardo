var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

var size = getSize();
AprendizajePorRefuerzo.game = new Phaser.Game(parseInt(size[0]), parseInt(size[1]), Phaser.AUTO, 'game');

AprendizajePorRefuerzo.game.state.add('Preload',AprendizajePorRefuerzo.Preload);
AprendizajePorRefuerzo.game.state.add('Game',AprendizajePorRefuerzo.Game);

AprendizajePorRefuerzo.game.state.start('Preload');