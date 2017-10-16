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
        this.epsilon = 1.0;
        this.epsilonDecay = 0.9999;
        this.minEpsilon = 0.1;
        this.discountFactor = 0.5;
        this.learningRate = 0.125;
        this.maxPasos = 5;
        this.pasos = 0;
        this.refTesoro = 100;
        this.refCesped = 7;
        this.refHielo = 3;
        this.refMontana = 4;
        this.refAgua = 1;
        this.refIsla = 0.5;
        this.refMontanaHelada = 2;
        this.game.time.advancedTiming = true;
        this.game.time.desiredFps=120;
        this.numEstados = this.map.height * this.map.width;
        this.inc = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
        this.Qmatrix = this.inicializarQmatrix();
        this.tablaEstados = this.inicializarTablaEstados();
        this.done = false;
        this.test = false;
        this.camino = [];
        this.count = 0;
        this.startCamino = false;


    },
    update : function () {

        console.log("-----------------------------------------------");
        console.log("El bot esta en: "+this.getEstadoBot().x+"-"+this.getEstadoBot().y+" y en el punto: "+this.bot.body.x+"-"+this.bot.body.y);
        console.log("El tesoro esta en: "+this.estadoTesoro.x+"-"+this.estadoTesoro.y+" y en el punto: "+this.tesoro.body.x+"-"+this.tesoro.body.y);
        console.log("Epsilon: "+this.epsilon);
        if(!this.done && !this.test){
            var estado = this.getEstadoBot();
            var idEstado = this.tablaEstados[estado.y][estado.x];
            var accion = this.getAccion();
            this.moverse(accion);
            this.checkBot();
            var refuerzo = this.getRefuerzoBot();
            console.log("La accion tiene una recompensa de: "+refuerzo);
            var siguienteEstado = this.getEstadoBot();
            var idSiguienteEstado = this.tablaEstados[siguienteEstado.y][siguienteEstado.x];
            var siguienteRefuerzoMixto = this.maxRefuerzo(idSiguienteEstado);
            this.Qmatrix[idEstado][accion] += this.learningRate * (refuerzo + this.discountFactor * siguienteRefuerzoMixto - this.Qmatrix[idEstado][accion]);
            if(this.epsilon > this.minEpsilon){
                this.epsilon *= this.epsilonDecay;
            }
        }
        else if(!this.test){
            alert("Se ha encontrado el tesoro");
            this.pasos++;
            this.bot.x = this.inicioBotX;
            this.bot.y = this.inicioBotY;
            this.done = false;
            if(this.pasos === this.maxPasos){
                this.descargarQmatrix();
                this.test = true;
            }

        }
        else if(this.test && !this.startCamino){
            alert("Test Forward");
            this.forward();
            this.startCamino = true;
        }
        else if(this.startCamino){
            this.wait(1000);
            if(this.count<this.camino.length-1){
                var est = this.camino[this.count];
                var nextEstado = this.camino[this.count+1];
                var acc = this.getAccionTest(est,nextEstado);
                this.moverse(acc);
                this.count++;
            }
            else{
                alert("Fin test");
            }
        }
    },
    wait : function (ms) {
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
            end = new Date().getTime();
        }
    },
    getAccionTest : function (estoy,voy) {
        var diferenciaX = voy.x - estoy.x;
        var diferenciaY = voy.y - estoy.y;
        for(var i=0;i<this.inc.length;i++){
            if(this.inc[i][0] === diferenciaX && this.inc[i][1] === diferenciaY){
               return i;
            }
        }
    },
    forward : function () {
        var final = this.tablaEstados[this.estadoTesoro.y][this.estadoTesoro.x];
        var estadoBot = this.getEstadoBot();
        var inicial = this.tablaEstados[estadoBot.y][estadoBot.x];
        var primero = {id:inicial , coste:0 , vieneDe:null , x:estadoBot.x , y:estadoBot.y};
        var anchura = {};
        anchura[primero.id] = primero;
        var indices = [];
        indices.push(primero.id);
        var c = 0;
        while(indices.length<this.numEstados){
            var estoy = anchura[indices[c]];
            var adyacentes = this.getAdyacentes(estoy);
            for(var i=0;i<adyacentes.length;i++){
                var voy = adyacentes[i];
                if(indices.includes(voy.id)){
                    voy = anchura[voy.id];
                }
                else{
                    anchura[voy.id] = voy;
                    indices.push(voy.id);
                }
                if(this.mejor(estoy.coste + this.getCosteMapa(estoy,voy),voy.coste)){
                    voy.coste = estoy.coste + this.getCosteMapa(estoy,voy);
                    voy.vieneDe = voy.vieneDe = estoy;
                }
            }
            c += 1;

        }
        var siguiente = anchura[final];
        this.camino.push(siguiente);
        while(siguiente.id !== inicial){
            siguiente = siguiente.vieneDe;
            this.camino.push(siguiente);
        }
        this.camino.reverse();
        
    },
    getCosteMapa : function (estoy,voy) {
        var diferenciaX = voy.x - estoy.x;
        var diferenciaY = voy.y - estoy.y;
        var accion = 0;
        for(var i=0;i<this.inc.length;i++){
            if(this.inc[i][0] === diferenciaX && this.inc[i][1] === diferenciaY){
                accion = i;
            }
        }
        return (1/this.Qmatrix[estoy.id][accion]);
    },
    getAdyacentes : function (estado) {
        var adyacentes = [];
        var x = estado.x;
        var y = estado.y;
        var posAcc = this.getPosiblesAcc(x,y);
        for(var i=0;i<posAcc.length;i++){
            x += this.inc[posAcc[i]][0];
            y += this.inc[posAcc[i]][1];
            var id = this.tablaEstados[y][x];
            adyacentes.push({id:id , coste:99999 , vieneDe:null , x:x , y:y});
            x = estado.x;
            y = estado.y;
        }
        return adyacentes;
    },
    mejor : function (a,b) {
        return a<b;
    },
    descargarQmatrix : function () {
        var data = this.Qmatrix;
        var csvContent = "data:text/csv;charset=utf-8,";
        data.forEach(function(infoArray, index){

            dataString = infoArray.join(",");
            csvContent += index < data.length ? dataString+ "\n" : dataString;

        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Qmatrix.csv");
        link.click();
    },
    maxRefuerzo : function (idEstado) {
        lisRec = [];
        for(var i=0;i<this.inc.length;i++){
            lisRec.push(this.Qmatrix[idEstado][i]);
        }
        return Math.max.apply(Math,lisRec);
    },
    getAccion : function () {
        var lisRec = [];
        var cajaProb = [];
        var norm = [];
        var suma = 0;
        cajaProb.push(suma);
        var numR = Math.random();
        var epsilonR = Math.random();
        var estado = this.getEstadoBot();
        var idEstado = this.tablaEstados[estado.y][estado.x];
        var posAcc = this.getPosiblesAcc(estado.x,estado.y);
        for(var i=0;i<posAcc.length;i++){
            lisRec.push(this.Qmatrix[idEstado][posAcc[i]]);
        }
        var refuerzoTotal = lisRec.reduce(function(a, b) { return a + b; }, 0);
        for(var i=0;i<lisRec.length;i++){
            norm.push(lisRec[i]/refuerzoTotal);
        }
        if(epsilonR <= this.epsilon){
            return posAcc[Math.floor(Math.random() * posAcc.length)];
        }
        for(var i=0;i<norm.length;i++){
            suma += norm[i];
            cajaProb.push(suma);
        }
        for(var i=0;i<cajaProb.length;i++){
            var indice = i;
            var max = cajaProb[indice];
            if(indice === 0){
                var min = 0;
            }
            else{
                var min = cajaProb[indice-1];
            }
            if(numR >= min && numR <= max){
                return posAcc[indice-1];
            }
        }


    },
    getPosiblesAcc : function (x,y) {
        var limDer = this.map.width-1;
        var limIzq = 0;
        var limArriba = 0;
        var limAbajo = this.map.height-1;
        if(x === limDer && y === limArriba){
            return [4,5,6];
        }
        else if(x === limDer && y === limAbajo){
            return [0,6,7];
        }
        else if(x === limIzq && y === limArriba){
            return [2,3,4];
        }
        else if(x === limIzq && y === limAbajo){
            return [0,1,2];
        }
        else if(x === limDer){
            return [0,4,5,6,7];
        }
        else if(x === limIzq){
            return [0,1,2,3,4];
        }
        else if(y === limArriba){
            return [2,3,4,5,6];
        }
        else if(y === limAbajo){
            return [0,1,2,6,7];
        }
        else{
            return [0,1,2,3,4,5,6,7];
        }
    },
    moverse : function (accion) {
        this.bot.body.x += this.inc[accion][0]*this.map.tileWidth;
        this.bot.body.y += this.inc[accion][1]*this.map.tileHeight;
    },
    inicializarTablaEstados : function () {
        var tablaEstados = [];
        var id = 0;
        for(var i = 0;i<this.map.height;i++){
            var fila = [];
            for(var j=0;j<this.map.width;j++){
                fila.push(id);
                id++;
            }
            tablaEstados.push(fila);
        }
        return tablaEstados;
    },
    inicializarQmatrix : function () {
        var Qmatrix = [];
        for(var i = 0;i<this.numEstados;i++){
            var fila = [];
            for(var j=0;j<this.inc.length;j++){
                fila.push(0.01);
            }
            Qmatrix.push(fila);
        }
        return Qmatrix;
    },
    getRefuerzoBot : function () {
        if(this.done){
            return this.refTesoro;
        }
        for(var i=0;i<this.cespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.cespedRectangles[i])){
                return this.refCesped;
            }
        }
        for(var i=0;i<this.hieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.hieloRectangles[i])){
                return this.refHielo;
            }
        }
        for(var i=0;i<this.aguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.aguaRectangles[i])){
                return this.refAgua;
            }
        }
        for(var i=0;i<this.montAguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montAguaRectangles[i])){
                return this.refIsla;
            }
        }
        for(var i=0;i<this.montHieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montHieloRectangles[i])){
                return this.refMontanaHelada;
            }
        }
        for(var i=0;i<this.montCespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.bot.getBounds(), this.montCespedRectangles[i])){
                return this.refMontana;
            }
        }
    },
    checkBot : function () {
        if(this.getEstadoBot() === this.estadoTesoro){
            this.done = true;
        }
    },
    getEstadoBot: function () {
        return this.map.getTileWorldXY(this.bot.body.x,this.bot.body.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
    },
    getEstadoTesoro : function () {
        return this.map.getTileWorldXY(this.tesoro.body.x,this.tesoro.body.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
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