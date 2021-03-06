var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};
var urlCirculo,urlTesoro,urlBot,urlMapa,urlTileset, x,y;

function initURL(circulo,tesoro,bot,mapa,tileSet,width,height){
    urlCirculo = circulo;
    urlTesoro = tesoro;
    urlBot = bot;
    urlMapa = mapa;
    urlTileset = tileSet;
}

AprendizajePorRefuerzo.Preload = function () {};

AprendizajePorRefuerzo.Preload.prototype = {
    preload : function () {
        this.load.tilemap('map',urlMapa,null,Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles',urlTileset);
        this.load.image('tesoro',urlTesoro);
        this.load.image('bot',urlBot);
        this.load.image('circuloAmarillo',urlCirculo);
    },
    create : function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.state.start('Game');
    }

};