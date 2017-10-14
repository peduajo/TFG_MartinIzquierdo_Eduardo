var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

AprendizajePorRefuerzo.Game = function () {};

AprendizajePorRefuerzo.Game.prototype = {
    create : function(){
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiles2','gameTiles');
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.backgroundlayer.resizeWorld();
        this.inicioBotX = this.ajustarPunto("x");
        this.inicioBotY = this.ajustarPunto("y");
        this.bot = this.game.add.tileSprite(this.inicioBotX,this.inicioBotY,16,16,'bot');
        this.bot.anchor.setTo(0.5);
        this.bot.scale.setTo(0.8);
        this.inicioTesoroX = this.ajustarPunto("x");
        this.inicioTesoroY = this.ajustarPunto("y");
        this.tesoro = this.game.add.tileSprite(this.inicioTesoroX,this.inicioTesoroY,16,16,'tesoro');
        this.tesoro.anchor.setTo(0.5);
        this.tesoro.scale.setTo(0.8);
        this.game.physics.enable([this.bot,this.tesoro],Phaser.Physics.ARCADE);
        this.bot.body.collideWorldBounds = true;
        this.tesoro.body.collideWorldBounds = true;
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cesped = this.findObjectsByType('grass',this.map);
        this.hielo = this.findObjectsByType('ice',this.map);
        this.agua = this.findObjectsByType('water',this.map);
        this.montanasAgua = this.findObjectsByType('waterMountains',this.map);
        this.montanasHielo = this.findObjectsByType('iceMountains',this.map);
        this.montanasCesped = this.findObjectsByType('greenMountains',this.map);
        this.cespedRectangles = this.getRectanglesFromObjects(this.cesped);
        this.hieloRectangles = this.getRectanglesFromObjects(this.hielo);
        this.aguaRectangles = this.getRectanglesFromObjects(this.agua);
        this.montAguaRectangles = this.getRectanglesFromObjects(this.montanasAgua);
        this.montHieloRectangles = this.getRectanglesFromObjects(this.montanasHielo);
        this.montCespedRectangles = this.getRectanglesFromObjects(this.montanasCesped);
        this.estadoTesoro = this.getEstadoTesoro();
        this.game.time.desiredFps=4;



    },
    update : function () {
        console.log("-----------------------------------------------");
        console.log("El bot esta en: "+this.getEstadoBot().x+"-"+this.getEstadoBot().y);
        console.log("El tesoro esta en: "+this.estadoTesoro.x+"-"+this.estadoTesoro.y);
        if(this.cursors.up.isDown) {
            this.bot.body.y -= this.map.tileHeight;
        }
        else if(this.cursors.down.isDown) {
            this.bot.body.y += this.map.tileHeight;
        }
        if(this.cursors.left.isDown) {
            this.bot.body.x -= this.map.tileWidth;
        }
        else if(this.cursors.right.isDown) {
            this.bot.body.x += this.map.tileWidth;
        }
        this.getEntornoBot();
        this.checkBot();


    },
    getEntornoBot : function () {
        for(var i=0;i<this.cespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.cespedRectangles[i])){
                console.log("cesped");
            }
        }
        for(var i=0;i<this.hieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.hieloRectangles[i])){
                console.log("hielo");
            }
        }
        for(var i=0;i<this.aguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.aguaRectangles[i])){
                console.log("agua");
            }
        }
        for(var i=0;i<this.montAguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montAguaRectangles[i])){
                console.log("isla");
            }
        }
        for(var i=0;i<this.montHieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montHieloRectangles[i])){
                console.log("montaña hielo");
            }
        }
        for(var i=0;i<this.montCespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montCespedRectangles[i])){
                console.log("montaña cesped");
            }
        }
    },
    checkBot : function () {
        if(this.getEstadoBot() === this.estadoTesoro){
            alert("Se ha encontrado el tesoro");
        }
    },
    getEstadoBot: function () {
        return this.map.getTileWorldXY(this.bot.x,this.bot.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
    },
    getEstadoTesoro : function () {
        return this.map.getTileWorldXY(this.tesoro.x,this.tesoro.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
    },
    ajustarPunto : function (eje) {
        if(eje === "x"){
            var rx = this.game.world.randomX;
            if(rx !== this.map.widthInPixels){
                var x = (rx - (rx % this.map.tileWidth) + (this.map.tileWidth/2));
            }
            else{
                var x = this.map.widthInPixels - (this.map.tileWidth/2);
            }
            console.log("El randomX era: "+rx+" y se ha ajustado a: "+x);
            return x;
        }
        else{
            var ry = this.game.world.randomY;
            if(ry !== this.map.heightInPixels){
                var y = (ry - (ry % this.map.tileHeight) + (this.map.tileHeight/2));
            }
            else{
                var y = this.map.heightInPixels - (this.map.tileHeight/2);
            }
            console.log("El randomY era: "+ry+" y se ha ajustado a: "+y);
            return y;
        }
    },
    findObjectsByType : function (type,map) {
        var result = [];
        map.objects['objectLayer'].forEach(function (element) {
            if(element.properties.type === type){
                result.push(element);
            }
        });
        return result;
    },
    getRectanglesFromObjects : function (objects) {
        var result = [];
        for(var i = 0;i<objects.length;i++){
            result.push(new Phaser.Rectangle(objects[i].x,objects[i].y,objects[i].width,objects[i].height));
        }
        return result;
    }
};