var AprendizajePorRefuerzo = AprendizajePorRefuerzo || {};

var parar = true;
var mostrar = false;
var discountFactor, iteracionesMaximas, maxPasos, repDifQ, cargarRefuerzos, descargaQ, nombreTileSet, cObjetos, cBackground, backGroundLayers = [], x, y;

function getSize(){
    return [x,y];
}

function initGame(nombreTileS,capaObjetos,capasBackground,width,height){
    nombreTileSet = nombreTileS;
    cObjetos = capaObjetos;
    cBackground = capasBackground.split("-");
    x = width;
    y = height;
}
function getControlFormulario(){
    var gammaInp = document.getElementById("gamma");
    var tiempoEpInp = document.getElementById("tiempoEpisodio");
    var maxPasosEpInp = document.getElementById("maxPasos");
    var repeticionesDifQ = document.getElementById("repeticionesQ");
    var list = document.getElementById("listaRefuerzos").getElementsByTagName("input");
    var listaInputs = [gammaInp,tiempoEpInp,maxPasosEpInp,repeticionesDifQ];
    for(var i=0;i<list.length;i++){
        listaInputs.push(list[i]);
    }
    for(var i=0;i<listaInputs.length;i++){
        if(listaInputs[i].value === ''){
            return false;
        }
    }
    return true;
}
function empezarJuego() {
    var controlFormulario = getControlFormulario();
    if(controlFormulario){
        document.getElementById("errorValores").style.display = "none";
        cargarRefuerzos = true;
        $("#entrenarBtn").addClass('disabled');
        $("#stopBtn").removeClass('disabled');
        $("#circulos").removeClass('disabled');
        document.getElementById("entrenarBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;
        document.getElementById("circulos").disabled = false;
        var gammaInp = document.getElementById("gamma");
        var tiempoEpInp = document.getElementById("tiempoEpisodio");
        var maxPasosEpInp = document.getElementById("maxPasos");
        var repeticionesDifQ = document.getElementById("repeticionesQ");
        parar = false;
        discountFactor = parseFloat(gammaInp.value);
        iteracionesMaximas = parseInt(tiempoEpInp.value);
        maxPasos = parseInt(maxPasosEpInp.value);
        repDifQ = parseInt(repeticionesDifQ.value);
        var labelEstado = document.getElementById("estado");
        labelEstado.innerHTML = "ENTRENANDO";
        labelEstado.style.color = "blue";
    }
    else{
        document.getElementById("errorValores").style.display = "block";
    }
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
    document.getElementById("repDiferencialQ").innerHTML = 0;
    document.getElementById("episodioActual").innerHTML = 0;
    document.getElementById("ultimoScore").innerHTML = "--";
    $("#entrenarBtn").removeClass('disabled');
    $("#stopBtn").addClass('disabled');
    document.getElementById("entrenarBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
    parar = true;
    var labelEstado = document.getElementById("estado");
    labelEstado.innerHTML = "PARADO";
    labelEstado.style.color = "red";
    AprendizajePorRefuerzo.game.state.start('Game');
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
function cargarValores() {
    document.getElementById("gamma").value = "0.7";
    document.getElementById("tiempoEpisodio").value = "1000";
    document.getElementById("maxPasos").value = "200";
    document.getElementById("repeticionesQ").value = "12";
    var list = document.getElementById("listaRefuerzos").getElementsByTagName("input");
    var rndTesoro = [1,2,3];
    var rndRef = [-0.04,-0.08,-0.12,-0.16,-0.20,-0.24];
    list[0].value = rndTesoro[Math.floor(Math.random() * rndTesoro.length)];
    for(var i=1;i<list.length;i++){
        list[i].value = rndRef[Math.floor(Math.random() * rndRef.length)];
    }
}
function descargarQ(){
    descargaQ = true;
}

AprendizajePorRefuerzo.Game = function () {};

AprendizajePorRefuerzo.Game.prototype = {
    create : function(){
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage(nombreTileSet,'gameTiles');
        this.addBackground();
        this.spriteBot = this.game.add.tileSprite(this.ajustarPunto("x"),this.ajustarPunto("y"),this.map.tileWidth,this.map.tileHeight,'bot');
        this.spriteBot.anchor.setTo(0.5);
        this.spriteBot.scale.setTo(0.8);
        this.inicioTesoroX = this.ajustarPunto("x");
        this.inicioTesoroY = this.ajustarPunto("y");
        this.tesoro = this.game.add.tileSprite(this.inicioTesoroX,this.inicioTesoroY,this.map.tileWidth,this.map.tileHeight,'tesoro');
        this.tesoro.anchor.setTo(0.5);
        this.tesoro.scale.setTo(0.8);
        this.game.physics.enable([this.spriteBot,this.tesoro],Phaser.Physics.ARCADE);
        this.spriteBot.body.collideWorldBounds = true;
        this.tesoro.body.collideWorldBounds = true;
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
        this.difQmin = Math.pow(10,-10);
        this.circulos = {};
        this.mejorValEstados = {};
        this.mejorValEstadosProx = {};
        this.rectangulosPorTipo = {};
        this.listaRefuerzos = {};
        this.repeticiones = 0;
        this.creados = false;
    },
    update : function () {
        if(descargaQ){
            descargaQ = false;
            var inicio = ['Estado'];
            var acciones = ["arriba","abajo","izquierda","derecha"];
            var primeraFila = inicio.concat(acciones);
            var data = this.Q;
            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent +=primeraFila + "\n";
            var estados = Object.keys(this.Q);
            for(var i=0;i<estados.length;i++){
                var valoresEstado = Object.values(this.Q[estados[i]]);
                estados[i] = estados[i].replace(',','-');
                var fila = [estados[i]];
                for(var j=0;j<valoresEstado.length;j++){
                    fila.push(valoresEstado[j].toFixed(3));
                }
                csvContent += fila+ "\n";
            }
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "Qmatrix.csv");
            link.click();
        }
        if(cargarRefuerzos){
            var list = document.getElementById("listaRefuerzos").getElementsByTagName("input");
            for(var i=0;i<list.length;i++){
                this.listaRefuerzos[list[i].id] = parseFloat(list[i].value);
            }
            this.rectangulosPorTipo = this.getRectangulos();
            cargarRefuerzos = false;
        }
        if(mostrar){
            if(!this.creados){
                this.crearCirculos();
                this.creados = true;
                for(var i=0;i<backGroundLayers.length;i++){
                    backGroundLayers[i].alpha = 0.25;
                }
            }
            if(this.pasos > 10){
                this.ajustarCirculos();
            }
            var posicionRatonX = this.game.input.mousePointer.x;
            var posicionRatonY = this.game.input.mousePointer.y;
            var tilePointer = this.map.getTileWorldXY(posicionRatonX,posicionRatonY,this.map.tileWidth,this.map.tileHeight);
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
            for(var i=0;i<backGroundLayers.length;i++){
                    backGroundLayers[i].alpha = 1.0;
                }
        }
        if(!parar){
            document.getElementById("episodioActual").innerHTML = this.pasos;
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
                document.getElementById("ultimoScore").innerHTML = this.score.toFixed(3);
                this.score = 1;
                this.iteraciones = 0;
                this.pasos++;
                this.spriteBot.x = this.ajustarPunto("x");
                this.spriteBot.y = this.ajustarPunto("y");
                this.done = false;
            }
            if(this.difQ < this.difQmin && this.pasos > 30){
                this.repeticiones++;
                document.getElementById("repDiferencialQ").innerHTML = this.repeticiones;
            }
            else{
                this.repeticiones = 0;
            }
            if(this.repeticiones === repDifQ || this.pasos === maxPasos){
                var labelEstado = document.getElementById("estado");
                labelEstado.innerHTML = "ENTRENADO";
                labelEstado.style.color = "green";
                parar = true;
            }

        }

    },
    addBackground : function(){
        for(var i=0;i<cBackground.length;i++){
            var backgroundlayer = this.map.createLayer(cBackground[i]);
            backgroundlayer.resizeWorld();
            backGroundLayers.push(backgroundlayer);
        }
    },
    getRectangulos : function(){
        var rectangulosPorTipo = {};
        for(var i=1;i<Object.keys(this.listaRefuerzos).length;i++){
            rectangulosPorTipo[Object.keys(this.listaRefuerzos)[i]] = this.getRectanglesFromObjects(this.findObjectsByType(Object.keys(this.listaRefuerzos)[i]));
        }
        return rectangulosPorTipo;
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
            var valoresMaximos = Object.values(this.mejorValEstados);
            var minValor = Math.min.apply(Math, valoresMaximos);
            var escala = (maxValEst - minValor)/(1 - minValor);
            if(escala<0.1){
                escala = 0.1;
            }
            else if(escala>1){
                escala = 1;
            }
            circulo.scale.setTo(escala);
        }
    },
    crearCirculos : function () {
        for(var j=this.map.tileHeight/2; j<this.map.heightInPixels;j+=this.map.tileHeight){
            for(var i=this.map.tileWidth/2; i<this.map.widthInPixels;i+=this.map.tileWidth){
                var circulo = this.game.add.tileSprite(i,j,this.map.tileWidth,this.map.tileHeight,'circuloAmarillo');
                circulo.anchor.setTo(0.5);
                circulo.scale.setTo(0.1);
                var estadoCirculo = this.map.getTileWorldXY(i,j,this.map.tileWidth,this.map.tileHeight);
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
                    temp[this.acciones[j]] = 1;
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
            recompensa = this.listaRefuerzos['tesoro'];
            this.score += recompensa;
            return recompensa;
        }
        for(var i=0;i<Object.keys(this.rectangulosPorTipo).length;i++){
            var rectangulos = this.rectangulosPorTipo[Object.keys(this.rectangulosPorTipo)[i]];
            for(var j=0;j<rectangulos.length;j++){
                if(Phaser.Rectangle.intersects(this.spriteBot.getBounds(), rectangulos[j])){
                    recompensa = this.listaRefuerzos[Object.keys(this.rectangulosPorTipo)[i]];
                    this.score += recompensa;
                    return recompensa;
                }
            }
        }
    },
    checkBot : function () {
        if(this.getEstadoBot()[0] === this.estadoTesoro[0] && this.getEstadoBot()[1] === this.estadoTesoro[1]){
            this.done = true;
        }
    },
    getEstadoBot: function () {
        var tileB = this.map.getTileWorldXY(this.spriteBot.body.x,this.spriteBot.body.y,this.map.tileWidth,this.map.tileHeight);
        return [tileB.x,tileB.y];
    },
    getEstadoTesoro : function () {
        var tileT = this.map.getTileWorldXY(this.tesoro.body.x,this.tesoro.body.y,this.map.tileWidth,this.map.tileHeight);
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
    findObjectsByType : function (type) {
        var result = [];
        this.map.objects[cObjetos].forEach(function (element) {
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