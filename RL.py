#prototipo de algoritmo de aprendizaje por refuerzo
#usando python 2.7
#reglas: el agente (el bot) tiene que conseguir llegar al tesoro
#Recompensas: cada estado tiene una recompensa distinta dependiendo de si es montana, agua o cesped o si ahi esta el tesoro
#Estados: cada celda del mapa es un estado
#Acciones: hay 8 acciones
import random
import math
import csv

#hiperparametros
EPSILON_DECAY = 0.999
EPSILON_MIN = 0.1
DISCOUNT_FACTOR = 0.5
LEARNING_RATE = 0.125
MAX_PASOS = 100
FILAS = 20
COLUMNAS = 20
NUM_ACCIONES = 8
REF_TESORO = 100
REF_CESPED = 10
REF_MONTANA = 4
REF_AGUA = 1

class item:
    def __init__(self,y,x,type):
        self.y = y
        self.x = x
        self.type = type
        self.end = False
        self.estados = []

    def moverse(self,movimiento):
        # incrementos segun el movimiento (inc_x,inc_y)
        inc=[(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]
        # actaliza la posicion con el movimiento
        self.x += inc[movimiento][0]
        self.y += inc[movimiento][1]
        
    def toString(self):
        print('el objeto ' + self.type + ' esta en ' + str(self.x) + " " + str(self.y))

class estado:
    def __init__(self,id,coste,vieneDe,x,y):
        self.id = id
        self.coste = coste
        self.vieneDe = vieneDe
        self.x = x
        self.y = y

def imprimir_mundo():
    tabla = ''
    for i in range(FILAS):
        for j in range(COLUMNAS):
            tabla = tabla + ' '+ mundo[i,j]
        tabla += '\n'
    print(tabla)

def recompensa(action):
    bot.moverse(action)
    update_bot()
    entornoactual = mundo[bot.y,bot.x][0]
    item = mundo[bot.y,bot.x][1]
    if(item=='t'):
        return REF_TESORO
    elif(entornoactual=='C'):
        return REF_CESPED
    elif(entornoactual=='A'):
        return REF_AGUA
    elif(entornoactual=='M'):
        return REF_MONTANA


def inicializar_mundo():
    for i in range(FILAS):
        for j in range(COLUMNAS):
            mundo[i,j] = elementosMundo[random.randint(0,len(elementosMundo)-1)]

def update_bot():
    mundo[bot.y,bot.x] = mundo[bot.y,bot.x] + 'b'

def update_tesoro():
    mundo[tesoro.y,tesoro.x] = mundo[tesoro.y,tesoro.x] + 't'

def clear_bot():
    mundo[bot.y,bot.x] = mundo[bot.y,bot.x][:len(mundo[bot.y,bot.x])-1]

def getEstado():
    return tablaEstados[bot.y,bot.x]

def getPosiblesAcc(x,y):
    limDer = COLUMNAS-1
    limIzq = 0
    limAbajo = FILAS-1
    limArriba = 0
    if(x == limDer and y == limArriba):
        posiblesMov = [4,5,6]
    elif(x == limDer and y == limAbajo):
        posiblesMov  = [0,6,7]
    elif(x == limIzq and y == limArriba):
        posiblesMov = [2,3,4]
    elif(x == limIzq and y == limAbajo):
        posiblesMov = [0,1,2]
    elif(x == limDer):
        posiblesMov = [0,4,5,6,7]
    elif(x == limIzq):
        posiblesMov = [0,1,2,3,4]
    elif(y == limArriba):
        posiblesMov = [2,3,4,5,6]
    elif(y == limAbajo):
        posiblesMov = [0,1,2,6,7]
    else:
        posiblesMov = [0,1,2,3,4,5,6,7]
    return posiblesMov

def getAction(epsilon):
    lis_rec = []
    caja_prob = []
    suma = 0
    estado = getEstado()
    posiblesAcc = getPosiblesAcc(bot.x,bot.y)
    list = ""
    for action in posiblesAcc:
        list+= " "+str(action)
        lis_rec.append(Qmatrix[estado,action])
    refuerzoTotal = sum(lis_rec)
    norm = [float(i)/refuerzoTotal for i in lis_rec]
    numR = random.uniform(0,1)
    if(numR <= epsilon):
        return posiblesAcc[random.randint(0,len(posiblesAcc)-1)]
    caja_prob.append(suma)
    for x in norm:
        suma += x
        caja_prob.append(suma)
    for x in caja_prob:
        indice = caja_prob.index(x)
        if(indice == 0):
            min = 0
        else:
            min = caja_prob[indice-1]
        max = x
        if(numR >= min and numR <= max):
            return posiblesAcc[indice-1]

def inicializar_Qmatrix():
    for i in range(num_estados):
        for j in range(NUM_ACCIONES):
            Qmatrix[i,j] = math.pow(10,-4)

def maxRefuerzo(estado):
    lis_rec = []
    for i in range(NUM_ACCIONES):
        lis_rec.append(Qmatrix[estado,i])
    return max(lis_rec)


def imprimirQmatrix():
    tabla = []
    for i in range(num_estados):
        fila = ""
        for j in range(NUM_ACCIONES):
            fila = fila+" "+str(Qmatrix[i,j])
        tabla.append(fila.split(" "))

    with open('QMatrix.csv', 'wb') as f:
        writer = csv.writer(f)
        for list in tabla:
            writer.writerow(list)

def inicializar_tablaEstados():
    id = 0
    for i in range(FILAS):
        for j in range(COLUMNAS):
            tablaEstados[i,j]=id
            id += 1

def imprimir_tablaEstados():
    tabla = ''
    for i in range(FILAS):
        for j in range(COLUMNAS):
            tabla = tabla + ' '+ str(tablaEstados[i,j])
        tabla += '\n'
    print(tabla)

def checkBot():
    estadoBot = getEstado()
    estadoTesoro = tablaEstados[tesoro.y,tesoro.x]
    if(estadoBot == estadoTesoro):
        bot.end = True
    else:
        bot.end = False

def imprimirEstadosRecorridos():
    list = ""
    for x in bot.estados:
        list += str(x)+" "
    print(list)

def algoritmoQLearningTraining():
    #algoritm Q-learning online
    epsilon = 0.1
    for paso in range(MAX_PASOS):
        bot.end = False
        clear_bot()
        bot.x = Xinicial
        bot.y = Yinicial
        update_bot()
        acciones = 0
        while not bot.end:
            clear_bot()
            action = getAction(epsilon)
            estado = getEstado()
            refuerzo = recompensa(action)
            siguienteEstado = getEstado()
            siguienteRefuerzoMixto = maxRefuerzo(siguienteEstado)
            #print("Experiencia : Estado: "+str(estado)+ " ,Accion: "+str(action)+" ,Refuerzo: "+str(refuerzo)+" ,Siguiente estado: "+str(siguienteEstado)+" , Siguiente refuerzo Mixto: "+str(siguienteRefuerzoMixto)+" , Epsilon: "+str(epsilon))
            Qmatrix[estado,action] += LEARNING_RATE * (refuerzo + DISCOUNT_FACTOR * siguienteRefuerzoMixto - Qmatrix[estado,action])
            acciones +=1
            checkBot()
            if(epsilon > EPSILON_MIN):
                epsilon *= EPSILON_DECAY
            if(bot.end):
                print("Se ha encontrado el tesoro, paso: "+str(paso)+ " ,acciones tomadas: "+str(acciones))

def forward():
    final = tablaEstados[tesoro.y,tesoro.x]
    inicial = tablaEstados[Yinicial,Xinicial]
    primero = estado(inicial,0,None,Xinicial,Yinicial)
    anchura = {}
    anchura[primero.id] = primero
    indices = []
    indices.append(primero.id)
    camino = []
    c = 0
    while(len(indices)<num_estados):
        estoy = anchura.get(indices[c])
        adyacentes = getAdyacentes(estoy)
        for ady in adyacentes:
            voy = ady
            if(voy.id in indices):
                voy = anchura.get(voy.id)
            else:
                anchura[voy.id] = voy
                indices.append(voy.id)
            if(mejor(estoy.coste + getCosteMapa(estoy,voy), voy.coste)):
                voy.coste = estoy.coste + getCosteMapa(estoy,voy)
                voy.vieneDe = estoy
        c += 1


    siguiente = anchura.get(final)
    camino.append(siguiente)
    print("El estado inicial es: "+str(inicial))
    print("El estado final es: "+str(final))
    while(siguiente.id != inicial):
        siguiente = siguiente.vieneDe
        camino.append(siguiente)

    camino.reverse()
    print("RECORRIDO FORWARD")
    for est in camino:
        print("El bot esta en: "+str(est.x)+"-"+str(est.y))
        clear_bot()
        bot.x = est.x
        bot.y = est.y
        update_bot()
        imprimir_mundo()

def mejor(a,b):
    return a<b

def getCosteMapa(estoy,voy):
    inc=[(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]
    diferenciaX = voy.x - estoy.x
    diferenciaY = voy.y - estoy.y
    accion = 0
    for acc in inc:
        if(acc[0] == diferenciaX and acc[1] == diferenciaY):
            accion = inc.index(acc)
    return 1/Qmatrix[estoy.id,accion]

def getAdyacentes(estadoOrigen):
    adyacentes = []
    x = estadoOrigen.x
    y = estadoOrigen.y
    inc=[(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]
    posAcc = getPosiblesAcc(x,y)
    for acc in posAcc:
        x += inc[acc][0]
        y += inc[acc][1]
        id = tablaEstados[y,x]
        adyacentes.append(estado(id,99999,estadoOrigen,x,y))
        x = estadoOrigen.x
        y = estadoOrigen.y
    return adyacentes





num_estados = FILAS*COLUMNAS
tablaEstados = {}
Qmatrix = {}
mundo = {}
elementosMundo = ['C','A','M']
inicializar_tablaEstados()
inicializar_Qmatrix()
inicializar_mundo()
bot = item(random.randint(0,FILAS-1),random.randint(0,COLUMNAS-1),'bot')
tesoro = item(random.randint(0,FILAS-1),random.randint(0,COLUMNAS-1),'tesoro')
Xinicial = bot.x
Yinicial = bot.y
update_tesoro()
update_bot()
imprimir_mundo()
bot.toString()
tesoro.toString()
algoritmoQLearningTraining()
imprimirQmatrix()
clear_bot()
bot.x = Xinicial
bot.y = Yinicial
update_bot()
forward()


