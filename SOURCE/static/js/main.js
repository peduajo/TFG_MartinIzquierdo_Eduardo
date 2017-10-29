var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

//AprendizajePorRefuerzo.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'game');
//AprendizajePorRefuerzo.game = new Phaser.Game(320,320,Phaser.AUTO,'');
AprendizajePorRefuerzo.game = new Phaser.Game(320, 320, Phaser.AUTO, 'game');

AprendizajePorRefuerzo.game.state.add('Preload',AprendizajePorRefuerzo.Preload);
AprendizajePorRefuerzo.game.state.add('Game',AprendizajePorRefuerzo.Game);

AprendizajePorRefuerzo.game.state.start('Preload');