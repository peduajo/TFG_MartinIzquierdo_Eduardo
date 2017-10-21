from Tkinter import *
import random
master = Tk()

width = 25
(x,y) = (20,20)
acciones = ["arriba","abajo","izquierda","derecha"]
mundo = Canvas(master,width=x*width,height=y*width)
Xinicial = random.randint(0,x-1)
Yinicial = random.randint(0,y-1)
bot = (Xinicial,Yinicial)
score = 1
reiniciar = False
recompensaCesped = -0.04
recompensaAgua = -0.24
recompensaHielo = -0.08
recompensaMontanaHielo = -0.20
recompensaIsla = -0.16
recompensaMontana = -0.12
recompensaTesoro = 3
final = (random.randint(0,x-1),random.randint(0,y-1))
estados = []
estadosCesped = []
estadosAgua = []
estadosMontana = []
estadosHielo = []
estadosIsla = []
estadosMontanaHielo = []
repeticiones = 0
scoreAnterior = 0
c = 0
keyEstados1 = ["c","c","c","c","c","c","c","c","c","c","a","a","a","a","a","h","h","h","h","h",
              "c","c","c","c","c","c","m","m","m","c","a","a","i","i","a","h","h","h","h","h",
              "c","c","c","c","c","c","m","m","m","c","a","a","i","i","a","h","mh","mh","mh","h",
              "c","c","c","c","c","c","m","m","m","c","a","a","a","a","a","h","mh","mh","mh","h",
              "c","m","m","m","c","c","c","c","c","c","a","a","a","a","a","h","mh","mh","mh","h",
              "c","m","m","m","c","c","c","c","c","c","a","i","i","a","a","h","h","h","h","h",
              "c","m","m","m","c","c","c","c","c","c","a","i","i","a","a","h","h","h","h","h",
              "c","c","c","c","c","c","c","c","c","c","a","a","a","a","a","h","h","h","h","h",
              "c","c","c","c","c","c","c","c","c","c","a","a","a","a","a","h","h","h","h","h",
              "c","c","m","m","m","c","c","c","c","c","c","c","c","c","c","h","mh","mh","mh","h",
              "c","c","m","m","m","c","c","m","m","m","c","c","c","c","c","h","mh","mh","mh","h",
              "c","c","m","m","m","c","c","m","m","m","c","c","c","c","c","h","mh","mh","mh","h",
              "c","c","c","c","c","c","c","m","m","m","c","c","c","c","c","h","h","h","h","h",
              "c","c","c","c","c","c","c","c","c","c","a","a","a","a","a","h","h","h","h","h",
              "c","c","c","c","c","c","c","c","c","c","a","a","i","i","a","h","h","h","h","h",
              "c","c","c","c","m","m","m","c","c","c","a","a","i","i","a","h","mh","mh","mh","h",
              "c","c","c","c","m","m","m","c","c","c","a","a","a","a","a","h","mh","mh","mh","h",
              "c","c","c","c","m","m","m","c","c","c","a","i","i","a","a","h","mh","mh","mh","h",
              "c","c","c","c","c","c","c","c","c","c","a","i","i","a","a","h","h","h","h","h",
              "c","c","c","c","c","c","c","c","c","c","a","a","a","a","a","h","h","h","h","h",]

keyEstados2 = ["c","c","c","c","c","c","c","c","c","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","m","m","m","a","c","c","c","c","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","a","a","a","a","a","a","a","a","c",
               "c","c","c","c","c","c","c","c","c","c"]

for j in range(y):
    for i in range(x):
        estados.append((i,j))

for estado in estados:
    if keyEstados1[c] == "c":
        estadosCesped.append(estado)
    elif keyEstados1[c] == "a":
        estadosAgua.append(estado)
    elif keyEstados1[c] == "m":
        estadosMontana.append(estado)
    elif keyEstados1[c] == "h":
        estadosHielo.append(estado)
    elif keyEstados1[c] == "i":
        estadosIsla.append(estado)
    elif keyEstados1[c] == "mh":
        estadosMontanaHielo.append(estado)
    c += 1


def renderizarMundo():
    global final,width,x,y,bot
    for s in estadosCesped:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="green", width=1)
    for s in estadosAgua:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="blue", width=1)
    for s in estadosMontana:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="brown", width=1)
    for s in estadosHielo:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="white", width=1)
    for s in estadosIsla:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="gray", width=1)
    for s in estadosMontanaHielo:
        mundo.create_rectangle(s[0]*width, s[1]*width, (s[0]+1)*width, (s[1]+1)*width, fill="black", width=1)
    mundo.create_rectangle(final[0]*width,final[1]*width,(final[0]+1)*width,(final[1]+1)*width, fill = "yellow",width=1)


renderizarMundo()

def moverse(dx,dy):
    global bot,x,y,score,spriteBot,reiniciar,final,scoreAnterior,repeticiones
    nueva_x = bot[0] + dx
    nueva_y = bot[1] + dy
    if(nueva_x >= 0) and (nueva_x < x) and (nueva_y >= 0) and (nueva_y < y):
        mundo.coords(spriteBot, nueva_x*width+width*2/10, nueva_y*width+width*2/10, nueva_x*width+width*8/10, nueva_y*width+width*8/10)
        bot = (nueva_x,nueva_y)
    if (nueva_x,nueva_y) == final:
        score += recompensaTesoro
        print "Se ha encontrado el tesoro con resultado: ", score
        reiniciar = True
        if score == scoreAnterior:
            repeticiones += 1
        else:
            repeticiones = 0
        scoreAnterior = score
        return recompensaTesoro

    elif (nueva_x,nueva_y) in estadosCesped:
        score += recompensaCesped
        return recompensaCesped

    elif (nueva_x,nueva_y) in estadosAgua:
        score += recompensaAgua
        return recompensaAgua

    elif (nueva_x,nueva_y) in estadosHielo:
        score += recompensaHielo
        return recompensaHielo

    elif (nueva_x,nueva_y) in estadosMontanaHielo:
        score += recompensaMontanaHielo
        return recompensaMontanaHielo

    elif (nueva_x,nueva_y) in estadosIsla:
        score += recompensaIsla
        return recompensaIsla

    elif (nueva_x,nueva_y) in estadosMontana:
        score += recompensaMontana
        return recompensaMontana


def reiniciarJuego():
    global bot,score,spriteBot, reiniciar
    bot = (Xinicial,Yinicial)
    score = 1
    reiniciar = False
    mundo.coords(spriteBot, bot[0]*width+width*2/10, bot[1]*width+width*2/10, bot[0]*width+width*8/10, bot[1]*width+width*8/10)

def haReiniciado():
    return reiniciar

spriteBot = mundo.create_rectangle(bot[0]*width+width*2/10, bot[1]*width+width*2/10,
                            bot[0]*width+width*8/10,bot[1]*width+width*8/10, fill="orange", width=1, tag="spriteBot")

mundo.grid(row=0, column=0)

def empezarJuego():
    master.mainloop()





