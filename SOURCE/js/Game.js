var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

AprendizajePorRefuerzo.Game = function () {};

AprendizajePorRefuerzo.Game.prototype = {
    create : function(){
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiles2','gameTiles');
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.backgroundlayer.resizeWorld();
        this.bot = this.game.add.sprite(this.game.world.randomX,this.game.world.randomY,'bot');
        this.game.physics.arcade.enable(this.bot);
        this.bot.body.collideWorldBounds = true;
        this.tx = this.game.world.randomX;
        this.ty = this.game.world.randomY;
        this.tileTesoro = this.map.getTileWorldXY(this.tx, this.ty,16,16, this.backgroundlayer);
        this.tesoro = this.game.add.sprite(this.tx,this.ty,'tesoro');
        this.tesoro.enableBody = true;
        this.tesoro.physicsBodyType = Phaser.Physics.ARCADE;
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
        this.rozamiento = 1.0;
    },
    update : function () {
        this.bot.body.velocity.y = 0;
        this.bot.body.velocity.x = 0;

        if(this.cursors.up.isDown) {
            this.bot.body.velocity.y -= 50*this.rozamiento;
        }
        else if(this.cursors.down.isDown) {
            this.bot.body.velocity.y += 50*this.rozamiento;
        }
        if(this.cursors.left.isDown) {
            this.bot.body.velocity.x -= 50*this.rozamiento;
        }
        else if(this.cursors.right.isDown) {
            this.bot.body.velocity.x += 50*this.rozamiento;
        }
        this.tileBot = this.map.getTileWorldXY(this.bot.body.x, this.bot.body.y,16,16, this.backgroundlayer);
        if(this.tileBot.x === this.tileTesoro.x && this.tileBot.y === this.tileTesoro.y){
            alert("Se ha encontrado el tesoro!");
            this.game.state.start('Game');
        }
        for(var i=0;i<this.cespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.cespedRectangles[i])){
                console.log("Estoy en el cesped!");
                this.rozamiento=1.0;
            }
        }
        for(var i=0;i<this.hieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.hieloRectangles[i])){
                console.log("Estoy en el hielo!");
                this.rozamiento=0.75;
            }
        }
        for(var i=0;i<this.aguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.aguaRectangles[i])){
                console.log("Estoy en el agua!");
                this.rozamiento=0.1;
            }
        }
        for(var i=0;i<this.montAguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montAguaRectangles[i])){
                console.log("Estoy en una montaña del mar!");
                this.rozamiento = 0.3;
            }
        }
        for(var i=0;i<this.montHieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montHieloRectangles[i])){
                console.log("Estoy en una montaña nevada!");
                this.rozamiento = 0.2;
            }
        }
        for(var i=0;i<this.montCespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montCespedRectangles[i])){
                console.log("Estoy en una montaña de pradera!");
                this.rozamiento = 0.5;
            }
        }



    },
    findObjectsByType : function (type,map) {
        var result = new Array();
        map.objects['objectLayer'].forEach(function (element) {
            if(element.properties.type === type){
                result.push(element);
            }
        });
        return result;
    },
    getRectanglesFromObjects : function (objects) {
        var result = new Array();
        for(var i = 0;i<objects.length;i++){
            result.push(new Phaser.Rectangle(objects[i].x,objects[i].y,objects[i].width,objects[i].height));
        }
        return result;
    }
};