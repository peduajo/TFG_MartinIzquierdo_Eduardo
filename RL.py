#prototipo de algoritmo de aprendizaje por refuerzo
#usando python 2.7
#reglas: el agente (el bot) tiene que conseguir llegar al tesoro
#Recompensas: cada estado tiene una recompensa distinta dependiendo de si es montana, agua o cesped o si ahi esta el tesoro
#Estados: cada celda del mapa es un estado
#Acciones: hay 8 acciones
#arreglar posible bucle de acciones
import random
import math
import csv

DISCOUNT_FACTOR = 0.9
LEARNING_RATE = 0.1
MAX_PASOS = 100
FILAS = 7
COLUMNAS = 7
NUM_ACCIONES = 8
REF_TESORO = 50
REF_CESPED = 3
REF_MONTANA = 1
REF_AGUA = 0.5


class item:
    def __init__(self,y,x,type):
        self.y = y
        self.x = x
        self.type = type

    def moverse(self,movimiento):
        if(movimiento==0):
            self.y -= 1
        elif(movimiento==1):
            self.x += 1
            self.y -= 1
        elif(movimiento==2):
            self.x += 1
        elif(movimiento==3):
            self.x += 1
            self.y += 1
        elif(movimiento==4):
            self.y += 1
        elif(movimiento==5):
            self.x -= 1
            self.y += 1
        elif(movimiento==6):
            self.x -= 1
        elif(movimiento==7):
            self.x -= 1
            self.y -= 1



    def toString(self):
        print('el objeto ' + self.type + ' esta en ' + str(self.y) + " " + str(self.x))

def imprimir_mundo():
    tabla = ''
    for i in range(FILAS):
        for j in range(COLUMNAS):
            tabla = tabla + ' '+ mundo[i,j]
        tabla += '\n'
    print(tabla)

def recompensa(estado,accion):
    return Qmatrix[estado,accion]


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
def check_tesoro():
    if(bot.x == tesoro.x and bot.y == tesoro.y):
        print("SE HA ENCONTRADO EL TESORO")
        return True
    else:
        return False
def getEstado():
    return tablaEstados[bot.y,bot.x]

def getPosiblesAcc():
    x = bot.x
    y = bot.y
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

def getAction():
    lis_rec = []
    caja_prob = []
    suma = 0
    estado = getEstado()
    posiblesAcc = getPosiblesAcc()
    list = ""
    for accion in posiblesAcc:
        list+= " "+str(accion)
        lis_rec.append(recompensa(estado,accion))
    #print("posibles acciones: "+list)
    refuerzoTotal = sum(lis_rec)
    norm = [float(i)/refuerzoTotal for i in lis_rec]
    numR = random.uniform(0,1)
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

def getRefuerzo():
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

def getActionLearned(refuerzo,estado):
    posAcc = getPosiblesAcc()
    for acc in posAcc:
        refuerzoTabla = recompensa(estado,acc)
        if(refuerzo == refuerzoTabla):
            return acc


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
estadoInicial = getEstado()
Xinicial = bot.x
Yinicial = bot.y
update_tesoro()
update_bot()
imprimir_mundo()
bot.toString()

#algoritm Q-learning online
for paso in range(MAX_PASOS):
    acciones = 0
    done = False
    clear_bot()
    estado = estadoInicial
    bot.x = Xinicial
    bot.y = Yinicial
    update_bot()
    while not done:
        clear_bot()
        action = getAction()
        estado = getEstado()
        print("la accion es: "+str(action) + " y el estado es: "+str(estado))
        bot.moverse(action)
        update_bot()
        refuerzo = getRefuerzo()
        siguienteEstado = getEstado()
        siguienteRefuerzoMixto = maxRefuerzo(siguienteEstado)
        Qmatrix[estado,action] += LEARNING_RATE * (refuerzo + DISCOUNT_FACTOR * siguienteRefuerzoMixto - Qmatrix[estado,action]);
        done = check_tesoro()
        acciones += 1
        if(done):
            print("paso: "+ str(paso) +" acciones: "+str(acciones))

imprimirQmatrix()
clear_bot()
bot.x = Xinicial
bot.y = Yinicial
update_bot()
imprimir_mundo()

#demostracion del aprendizaje
done = False
while not done:
    clear_bot()
    estado = getEstado()
    mejorRefuerzo = maxRefuerzo(estado)
    action = getActionLearned(mejorRefuerzo,estado)
    print("la accion es: "+str(action))
    bot.moverse(action)
    done = check_tesoro()
    update_bot()
    imprimir_mundo()

