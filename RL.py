import Mundo
import threading
import time
import csv
import random

discount = 0.9
epsilon = 1.0
epsilonDecay = 0.9999
acciones = Mundo.acciones
estados = Mundo.estados
final = Mundo.final
Q = {}
N = {}

def posiblesAcciones(s):
    x = s[0]
    y = s[1]
    limDer = Mundo.x - 1
    limIzq = 0
    limAbajo = Mundo.y -1
    limArriba = 0
    if(x == limDer and y == limArriba):
        posiblesMov = ["abajo","izquierda"]
    elif(x == limDer and y == limAbajo):
        posiblesMov  = ["arriba","izquierda"]
    elif(x == limIzq and y == limArriba):
        posiblesMov = ["abajo","derecha"]
    elif(x == limIzq and y == limAbajo):
        posiblesMov = ["arriba","derecha"]
    elif(x == limDer):
        posiblesMov = ["arriba","abajo","izquierda"]
    elif(x == limIzq):
        posiblesMov = ["arriba","abajo","derecha"]
    elif(y == limArriba):
        posiblesMov = ["abajo","izquierda","derecha"]
    elif(y == limAbajo):
        posiblesMov = ["arriba","izquierda","derecha"]
    else:
        posiblesMov = ["arriba","abajo","izquierda","derecha"]
    return posiblesMov

def inicializarTablas():
    for estado in estados:
        temp = {}
        tempA = {}
        posAcc = posiblesAcciones(estado)
        for acc in acciones:
            tempA[acc] = 0
            if acc in posAcc:
                temp[acc] = 0.1
            else:
                temp[acc] = -999

        Q[estado] = temp
        N[estado] = tempA

def moverse(accion):
    s = Mundo.bot
    if accion == acciones[0]:
        r = Mundo.moverse(0, -1)
    elif accion == acciones[1]:
        r = Mundo.moverse(0, 1)
    elif accion == acciones[2]:
        r = Mundo.moverse(-1, 0)
    elif accion == acciones[3]:
        r = Mundo.moverse(1, 0)
    s2 = Mundo.bot
    return s , accion , r , s2

def maxQ(s):
    val = None
    acc = None
    for a, q in Q[s].items():
        if val is None or (q > val):
            val = q
            acc = a
    return acc,val

def incQ(s, a, alpha, inc):
    Q[s][a] = Q[s][a] + alpha*(inc - Q[s][a])

def imprimirQmatrix():
    tabla = []
    for s in estados:
        fila = str(s)
        for a in acciones:
            fila = fila+" "+str(Q[s][a])
        tabla.append(fila.split(" "))

    with open('QMatrix.csv', 'wb') as f:
        writer = csv.writer(f)
        for list in tabla:
            writer.writerow(list)

def eGreedy(s):
    posAcc = posiblesAcciones(s)
    numR = random.uniform(0,1)
    if numR < epsilon:
        accion = posAcc[random.randint(0,len(posAcc)-1)]
    else:
        accion,_ = maxQ(s)

    return accion

def run():
    global discount,epsilon,epsilonDecay
    time.sleep(1)
    inicializarTablas()
    print "El bot esta en: ",Mundo.bot[0],"-",Mundo.bot[1]
    print "El tesoro esta en: ",Mundo.final[0],"-",Mundo.final[1]
    t = 1
    pruebas = 0
    sleep = 0.005
    while True:
        s = Mundo.bot
        accion = eGreedy(s)
        (s, a, r, s2) = moverse(accion)
        N[s][a] += 1
        alpha = float(60)/float(59 + N[s][a])
        _, maxVal = maxQ(s2)
        incQ(s, a, alpha, r + discount * maxVal)
        t += 1.0
        if Mundo.haReiniciado():
            Mundo.reiniciarJuego()
            time.sleep(0.01)
            t = 1.0
            pruebas += 1
        if Mundo.repeticiones == 10 and t == 1.0:
            imprimirQmatrix()
            sleep=0.1
        time.sleep(sleep)
        epsilon *= epsilonDecay
        #print "epsilon: ",epsilon," alpha: ",alpha

t = threading.Thread(target=run)
t.daemon = True
t.start()
Mundo.empezarJuego()
