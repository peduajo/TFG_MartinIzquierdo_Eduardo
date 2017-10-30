var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

var parar = true;
var mostrar = false;
var discountFactor = null,refTesoro = null,refCesped = null,refHielo = null,refMontana = null,refAgua = null,refIsla = null,refMontanaHelada = null,iteracionesMaximas = null,maxPasos = null;
function empezarJuego() {
    $("#entrenarBtn").addClass('disabled');
    $("#stopBtn").removeClass('disabled');
    $("#circulos").removeClass('disabled');
    document.getElementById("entrenarBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
    document.getElementById("circulos").disabled = false;
    var gammaInp = document.getElementById("gamma");
    var tiempoEpInp = document.getElementById("tiempoEpisodio");
    var tesoroInp = document.getElementById("tesoro");
    var cespedInp = document.getElementById("cesped");
    var hieloInp = document.getElementById("hielo");
    var montanaInp = document.getElementById("montana");
    var aguaInp = document.getElementById("agua");
    var islaInp = document.getElementById("isla");
    var montanaHInp = document.getElementById("montanaH");
    var maxPasosEpInp = document.getElementById("maxPasos");
    parar = false;
    discountFactor = parseFloat(gammaInp.value);
    refTesoro = parseFloat(tesoroInp.value);
    refCesped = parseFloat(cespedInp.value);
    refHielo = parseFloat(hieloInp.value);
    refMontana = parseFloat(montanaInp.value);
    refAgua = parseFloat(aguaInp.value);
    refIsla = parseFloat(islaInp.value);
    refMontanaHelada = parseFloat(montanaHInp.value);
    iteracionesMaximas = parseInt(tiempoEpInp.value);
    maxPasos = parseInt(maxPasosEpInp.value);
    var labelEstado = document.getElementById("estado");
    labelEstado.innerHTML = "ENTRENANDO";
    labelEstado.style.color = "blue";
}
function pararJuego() {
    $("#stopBtn").addClass('disabled');
    $("#entrenarBtn").removeClass('disabled');
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("entrenarBtn").disabled = false;
    parar = true;
    var labelEstado = document.getElementById("estado");
    labelEstado.innerHTML = "PARADO";
    labelEstado.style.color = "red";
}
function reiniciarJuego(){
    $("#stopBtn").addClass('disabled');
    $("#circulos").addClass('disabled');
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("circulos").disabled = true;
    parar = true;
    var labelEstado = document.getElementById("estado");
    labelEstado.innerHTML = "PARADO";
    labelEstado.style.color = "red";
    AprendizajePorRefuerzo.game.state.start('Game');
}
function cargarValores() {
    document.getElementById("gamma").value = "0.9";
    document.getElementById("tiempoEpisodio").value = "1000";
    document.getElementById("tesoro").value = "3";
    document.getElementById("cesped").value = "-0.04";
    document.getElementById("hielo").value = "-0.08";
    document.getElementById("montana").value = "-0.12";
    document.getElementById("agua").value = "-0.24";
    document.getElementById("isla").value = "-0.16";
    document.getElementById("montanaH").value = "-0.20";
    document.getElementById("maxPasos").value = "200";
}
function  circulos() {
    if(!mostrar){
        mostrar = true;
    }
    else {
        mostrar = false;
        document.getElementById("valArriba").innerHTML = "--";
        document.getElementById("valAbajo").innerHTML = "--";
        document.getElementById("valIzquierda").innerHTML = "--";
        document.getElementById("valDerecha").innerHTML = "--";
    }
}
AprendizajePorRefuerzo.Game = function () {};

AprendizajePorRefuerzo.Game.prototype = {
    create : function(){
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiles2','gameTiles');
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.backgroundlayer.resizeWorld();
        this.spriteBot = this.game.add.tileSprite(this.ajustarPunto("x"),this.ajustarPunto("y"),16,16,'bot');
        this.spriteBot.anchor.setTo(0.5);
        this.spriteBot.scale.setTo(0.8);
        this.inicioTesoroX = this.ajustarPunto("x");
        this.inicioTesoroY = this.ajustarPunto("y");
        this.tesoro = this.game.add.tileSprite(this.inicioTesoroX,this.inicioTesoroY,16,16,'tesoro');
        this.tesoro.anchor.setTo(0.5);
        this.tesoro.scale.setTo(0.8);
        this.game.physics.enable([this.spriteBot,this.tesoro],Phaser.Physics.ARCADE);
        this.spriteBot.body.collideWorldBounds = true;
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
        this.pasos = 0;
        this.game.time.advancedTiming = true;
        this.acciones = ["arriba","abajo","izquierda","derecha"];
        this.inc = {"arriba":[0,-1],"abajo":[0,1],"izquierda":[-1,0],"derecha":[1,0]};
        this.estados = this.inicializarEstados();
        this.Q = {};
        this.N = {};
        this.inicializarTablas();
        this.done = false;
        this.iteraciones = 0;
        this.score = 1;
        this.difQ = 999;
        this.difQmin = Math.pow(10,-11);
        this.circulos = {};
        this.mejorValEstados = {};
        this.mejorValEstadosProx = {};
        this.repeticiones = 0;
        this.creados = false;
    },
    update : function () {
        if(mostrar){
            if(!this.creados){
                this.crearCirculos();
                this.creados = true;
                this.backgroundlayer.alpha = 0.25;
            }
            this.ajustarCirculos();
            var posicionRatonX = this.game.input.mousePointer.x;
            var posicionRatonY = this.game.input.mousePointer.y;
            var tilePointer = this.map.getTileWorldXY(posicionRatonX,posicionRatonY,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
            if(tilePointer !== null){
                var estadoPointer = [tilePointer.x,tilePointer.y];
                document.getElementById("valArriba").innerHTML = this.Q[estadoPointer]["arriba"].toFixed(3);
                document.getElementById("valAbajo").innerHTML = this.Q[estadoPointer]["abajo"].toFixed(3);
                document.getElementById("valIzquierda").innerHTML = this.Q[estadoPointer]["izquierda"].toFixed(3);
                document.getElementById("valDerecha").innerHTML = this.Q[estadoPointer]["derecha"].toFixed(3)
            }
        }
        else if(this.creados){
            this.destruirCirculos();
            this.creados = false;
            this.backgroundlayer.alpha = 1.0;
        }
        if(!parar){
            if(!this.done && this.iteraciones < iteracionesMaximas){
                var estado = this.getEstadoBot();
                var accVal = this.maxQ(estado);
                var accion = accVal[0];
                this.moverse(accion);
                this.checkBot();
                var refuerzo = this.getRefuerzoBot();
                this.N[estado][accion] += 1;
                var alpha = 60/(59 + this.N[estado][accion]);
                var proximoEstado = this.getEstadoBot();
                var accValProx = this.maxQ(proximoEstado);
                var inc = refuerzo + discountFactor * accValProx[1];
                this.mejorValEstados = this.mejorValoracion();
                this.incQ(estado,accion,alpha,inc);
                this.mejorValEstadosProx = this.mejorValoracion();
                this.difQ = this.difValoraciones();
                this.iteraciones += 1;

            }
            else {
                console.log("Paso: "+this.pasos+"acabado con resultado: "+this.score);
                this.score = 1;
                this.iteraciones = 0;
                this.pasos++;
                this.spriteBot.x = this.ajustarPunto("x");
                this.spriteBot.y = this.ajustarPunto("y");
                this.done = false;
            }

            if(this.difQ < this.difQmin && this.pasos > 30){
                this.repeticiones++;
            }
            else{
                this.repeticiones = 0;
            }

            if(this.repeticiones === 20 || this.pasos === maxPasos){
                var labelEstado = document.getElementById("estado");
                labelEstado.innerHTML = "ENTRENADO";
                labelEstado.style.color = "green";
                parar = true;
            }

        }

    },
    destruirCirculos : function () {
        for(var i=0;i<this.estados.length;i++){
            this.circulos[this.estados[i]].destroy();
        }
    },
    ajustarCirculos : function () {
        for(var i=0;i<this.estados.length;i++){
            var circulo = this.circulos[this.estados[i]];
            var maxValEst = this.mejorValEstados[this.estados[i]];
            if(maxValEst !== 0.0){
                var escala = 0.05/Math.abs(maxValEst);
                if(escala > 1){
                    escala = 1.0;
                }
                else if(escala<0.2){
                    escala = 0.2;
                }
                circulo.scale.setTo(escala);
            }
        }
    },
    crearCirculos : function () {
        for(var j=this.map.tileHeight/2; j<this.map.heightInPixels;j+=this.map.tileHeight){
            for(var i=this.map.tileWidth/2; i<this.map.widthInPixels;i+=this.map.tileWidth){
                var circulo = this.game.add.tileSprite(i,j,16,16,'circuloAmarillo');
                circulo.anchor.setTo(0.5);
                circulo.scale.setTo(0.2);
                var estadoCirculo = this.map.getTileWorldXY(i,j,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
                this.circulos[[estadoCirculo.x,estadoCirculo.y]] = circulo;
            }
        }
    },
    difValoraciones : function () {
        var diferencial = [];
        for(var i=0;i<this.estados.length;i++){
            diferencial.push(Math.abs(this.mejorValEstados[this.estados[i]]-this.mejorValEstadosProx[this.estados[i]]));
        }
        return Math.max.apply(null, diferencial);
    },
    mejorValoracion : function () {
        var mejorValEstados = {};
        for(var i=0;i<this.estados.length;i++){
            var valAcc = this.maxQ(this.estados[i]);
            mejorValEstados[this.estados[i]] = valAcc[1];
        }
        return mejorValEstados;
    },
    sleep : function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    },
    incQ : function (s,a,alpha,inc) {
        this.Q[s][a] = this.Q[s][a] + alpha*(inc-this.Q[s][a]);
    },
    maxQ : function (estado) {
        var val = null;
        var acc = null;
        for(var i=0;i<this.acciones.length;i++){
            var q = this.Q[estado][this.acciones[i]];
            if (val === null || q > val){
                val = q;
                acc = this.acciones[i];
            }
        }
        return [acc,val];
    },
    getPosiblesAcc : function (estado) {
        var x = estado[0];
        var y = estado[1];
        var limDer = this.map.width-1;
        var limIzq = 0;
        var limArriba = 0;
        var limAbajo = this.map.height-1;
        if(x === limDer && y === limArriba){
            return ["abajo","izquierda"];
        }
        else if(x === limDer && y === limAbajo){
            return ["arriba","izquierda"];
        }
        else if(x === limIzq && y === limArriba){
            return ["abajo","derecha"];
        }
        else if(x === limIzq && y === limAbajo){
            return ["arriba","derecha"];
        }
        else if(x === limDer){
            return ["arriba","abajo","izquierda"];
        }
        else if(x === limIzq){
            return ["arriba","abajo","derecha"];
        }
        else if(y === limArriba){
            return ["abajo","izquierda","derecha"];
        }
        else if(y === limAbajo){
            return ["arriba","izquierda","derecha"];
        }
        else{
            return ["arriba","abajo","izquierda","derecha"];
        }
    },
    moverse : function (accion) {
        this.spriteBot.body.x += this.inc[accion][0]*this.map.tileWidth;
        this.spriteBot.body.y += this.inc[accion][1]*this.map.tileHeight;
    },
    inicializarEstados : function () {
        var estados = [];
        for(var j = 0; j<this.map.height; j++){
            for(var i=0; i<this.map.width; i++){
                estados.push([i,j]);
            }
        }
        return estados;
    },
    inicializarTablas : function () {
        for(var i=0;i<this.estados.length;i++){
            var temp = {};
            var tempA = {};
            var posAcc = this.getPosiblesAcc(this.estados[i]);
            for(var j=0;j<this.acciones.length;j++){
                tempA[this.acciones[j]] = 0;
                if(posAcc.includes(this.acciones[j])){
                    temp[this.acciones[j]] = 0;
                }
                else{
                    temp[this.acciones[j]] = -999;
                }
            }
            this.Q[this.estados[i]] = temp;
            this.N[this.estados[i]] = tempA;
        }
    },
    getRefuerzoBot : function () {
        var recompensa = null;
        if(this.done){
            recompensa = refTesoro;
        }
        for(var i=0;i<this.cespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.cespedRectangles[i])){
                recompensa = refCesped;
            }
        }
        for(var i=0;i<this.hieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.hieloRectangles[i])){
                recompensa = refHielo;
            }
        }
        for(var i=0;i<this.aguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.aguaRectangles[i])){
                recompensa = refAgua;
            }
        }
        for(var i=0;i<this.montAguaRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.montAguaRectangles[i])){
                recompensa = refIsla;
            }
        }
        for(var i=0;i<this.montHieloRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.montHieloRectangles[i])){
                recompensa = refMontanaHelada;
            }
        }
        for(var i=0;i<this.montCespedRectangles.length;i++){
            if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), this.montCespedRectangles[i])){
                recompensa = refMontana;
            }
        }
        this.score += recompensa;
        return recompensa;
    },
    checkBot : function () {
        if(this.getEstadoBot()[0] === this.estadoTesoro[0] && this.getEstadoBot()[1] === this.estadoTesoro[1]){
            this.done = true;
        }
    },
    getEstadoBot: function () {
        var tileB = this.map.getTileWorldXY(this.spriteBot.body.x,this.spriteBot.body.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
        return [tileB.x,tileB.y];
    },
    getEstadoTesoro : function () {
        var tileT = this.map.getTileWorldXY(this.tesoro.body.x,this.tesoro.body.y,this.map.tileWidth,this.map.tileHeight,this.backgroundlayer);
        return [tileT.x,tileT.y];
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