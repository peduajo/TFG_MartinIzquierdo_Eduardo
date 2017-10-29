var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

AprendizajePorRefuerzo.Preload = function () {};

AprendizajePorRefuerzo.Preload.prototype = {
    preload : function () {
        this.load.tilemap('map','static/assets/tilemaps/map.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles','static/assets/images/tiles2.png');
        this.load.image('tesoro','static/assets/images/tesoro.png');
        this.load.image('bot','static/assets/images/bot.png');
        this.load.image('circuloAmarillo','static/assets/images/circuloAmarillo.png');
    },
    create : function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.state.start('Game');
    }

};