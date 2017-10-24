var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

AprendizajePorRefuerzo.Preload = function () {};

AprendizajePorRefuerzo.Preload.prototype = {
    preload : function () {
        this.load.tilemap('map','assets/tilemaps/map.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles','assets/images/tiles2.png');
        this.load.image('tesoro','assets/images/tesoro.png');
        this.load.image('bot','assets/images/bot.png');
        this.load.image('circuloAmarillo','assets/images/circuloAmarillo.png');
    },
    create : function () {
        this.game.stage.backgroundColor = '#fff';
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.state.start('Game');
    }

};