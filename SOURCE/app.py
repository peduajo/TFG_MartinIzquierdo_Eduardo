# encoding: utf-8
from flask import Flask,render_template,request,flash,redirect,url_for,jsonify,send_file
import os
from database import init_db,db_session
from models import User,Map
import json
import io


app = Flask(__name__)
init_db()


@app.route('/login', methods=['GET','POST'])
def login():
    if request.method =='POST':
        POST_USUARIO = str(request.form['email'])
        nombre = POST_USUARIO.split('@')[0]
        POST_PWD = str(request.form['password'])
        query = User.query.filter(User.username==POST_USUARIO, User.password==POST_PWD)
        result = query.first()
        if result:
            return redirect(url_for('home', email = nombre, idUser = result.id))
        else:
            flash('CAMPOS INCORRECTOS')
            return render_template('login.html')
    else:
        return render_template('login.html')

@app.route('/registro',methods=['GET','POST'])
def registro():
    if request.method =='POST':
        POST_USUARIO = str(request.form['email'])
        POST_PWD = str(request.form['password'])
        POST_REPPWD = str(request.form['repPassword'])
        query = User.query.filter(User.username==POST_USUARIO)
        result = query.first()
        if POST_PWD != POST_REPPWD:
            flash(u'LAS CONTRASEÑAS NO COINCIDEN')
            return redirect(request.url)
        elif result:
            flash('YA EXISTE ESTE USUARIO')
            return redirect(request.url)
        else:
            user = User(POST_USUARIO,POST_PWD)
            db_session.add(user)
            db_session.commit()
            return redirect(url_for('login'))

    else:
        return render_template('registro.html')

@app.route("/home/<email>",methods=['GET','POST'])
def home(email):
    id = request.args.get('idUser')
    listaRefuerzos = []
    sizeTiles = [16,32]
    if request.method == 'GET':
        mapasUsuario = []
        mapas = Map.query.filter(Map.idUser==id).all()
        for mapa in mapas:
            mapasUsuario.append(mapa.nombreMapa)
        return render_template('carga.html',name=email,idUser = id,mapasUsuario = mapasUsuario)
    else:
        tipoCarga = request.form.get('tipoCarga')
        if tipoCarga == "Abrir nuevo mapa":
            mapaInput = request.files['mapaJson']
            tileSetInput = request.files['tileSet']
            if mapaInput.filename == '':
                flash('MAPA NO SELECCIONADO')
                return redirect(request.url)
            elif mapaInput.filename.split('.')[1] != "json":
                flash('EL MAPA NO ES ARCHIVO JSON')
                return redirect(request.url)
            elif tileSetInput.filename == '':
                flash('PATRONES NO SELECCIONADOS')
                return redirect(request.url)
            else:
                textJsonMap = mapaInput.read()
                mapa = Map.query.filter(Map.mapa==textJsonMap,Map.idUser==id).first()
                nombreMapa = Map.query.filter(Map.nombreMapa==mapaInput.filename,Map.idUser==id).first()
                if mapa:
                    flash('YA EXISTE ESTE MAPA')
                    return redirect(request.url)
                elif nombreMapa:
                    flash('YA EXITE UN MAPA CON ESTE NOMBRE')
                    return redirect(request.url)
                else:
                    capaObjetos = ''
                    capasBackground = []
                    nombreTileSet = tileSetInput.filename.split('.')[0]
                    mapaJson = json.loads(textJsonMap)
                    if mapaJson["tilesets"][0]["name"] != nombreTileSet:
                        flash('EL CONJUNTO DE PATRONES NO COINCIDE CON EL ASOCIADO AL MAPA')
                        return redirect(request.url)
                    for layer in mapaJson["layers"]:
                        if "objects" in layer.keys():
                            capaObjetos = layer["name"]
                            for object in layer["objects"]:
                                listaRefuerzos.append(object["properties"]["type"])
                        else:
                            capasBackground.append(layer["name"])

                    listaRefuerzos = list(set(listaRefuerzos))
                    refuerzos = "-".join(listaRefuerzos)
                    capasBackground = "-".join(capasBackground)
                    nCeldasAncho = mapaJson["width"]
                    nCeldasAlto = mapaJson["height"]
                    tileWidth = mapaJson["tilewidth"]
                    tileHeight = mapaJson["tileheight"]
                    width = nCeldasAncho*tileWidth
                    height = nCeldasAlto*tileHeight
                    if ((tileWidth not in sizeTiles) or (tileHeight not in sizeTiles)) and (tileWidth != tileHeight):
                        flash('ERROR EN LAS CELDAS')
                        return redirect(request.url)
                    elif (width > 480) or (height > 480):
                        flash('EL MAPA ES DEMASIADO GRANDE')
                        return redirect(request.url)

                    if tileWidth == sizeTiles[0]:
                        urlCirculo = url_for('static', filename='assets/circuloAmarillo16.png')
                        urlTesoro = url_for('static', filename='assets/tesoro16.png')
                        urlBot = url_for('static', filename='assets/bot16.png')
                    else:
                        urlCirculo = url_for('static', filename='assets/circuloAmarillo32.png')
                        urlTesoro = url_for('static', filename='assets/tesoro32.png')
                        urlBot = url_for('static', filename='assets/bot32.png')

                    map = Map(textJsonMap,id,mapaInput.filename,tileSetInput.read(),nombreTileSet,refuerzos,capaObjetos,capasBackground,width,height)
                    db_session.add(map)
                    db_session.commit()
                    urlMapa = url_for('getMap',id = id, nombreMapa = mapaInput.filename)
                    urlTileset = url_for('getTileset',id = id, nombreMapa = mapaInput.filename)
                    return render_template('index.html',name=email,urlMapa = urlMapa,urlCirculo = urlCirculo, urlTesoro = urlTesoro, urlBot = urlBot, urlTileset = urlTileset, listaRefuerzos = listaRefuerzos, nombreTileSet = nombreTileSet,capaObjetos = capaObjetos, capasBackground = capasBackground,x=width,y=height)

        else:
            nombreMapa = request.form.get('listaMapas')
            mapa = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first()
            listaRefuerzos = mapa.refuerzos.split('-')
            nombreTileSet = mapa.nombreTileSet
            capaObjetos = mapa.capaObjetos
            capasBackground = mapa.capasBackground
            tileWidth = json.loads(mapa.mapa)["tilewidth"]
            if tileWidth == sizeTiles[0]:
                urlCirculo = url_for('static', filename='assets/circuloAmarillo16.png')
                urlTesoro = url_for('static', filename='assets/tesoro16.png')
                urlBot = url_for('static', filename='assets/bot16.png')
            else:
                urlCirculo = url_for('static', filename='assets/circuloAmarillo32.png')
                urlTesoro = url_for('static', filename='assets/tesoro32.png')
                urlBot = url_for('static', filename='assets/bot32.png')

            urlMapa = url_for('getMap',id = id, nombreMapa = nombreMapa)
            urlTileset = url_for('getTileset',id = id, nombreMapa = nombreMapa)
            return render_template('index.html',name=email,urlMapa = urlMapa,urlCirculo = urlCirculo, urlTesoro = urlTesoro, urlBot = urlBot, urlTileset = urlTileset, listaRefuerzos = listaRefuerzos,nombreTileSet=nombreTileSet,capaObjetos = capaObjetos, capasBackground = capasBackground,x=mapa.width,y=mapa.height)

@app.route("/getMap/<int:id>")
def getMap(id):
    nombreMapa = request.args.get('nombreMapa')
    mapa = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first()
    mapaJson = json.loads(mapa.mapa)
    return jsonify(mapaJson)

@app.route("/getTileset/<int:id>")
def getTileset(id):
    nombreMapa = request.args.get('nombreMapa')
    mapa = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first()
    nameFileTileset = mapa.nombreTileSet + ".png"
    return send_file(io.BytesIO(mapa.tileSet),attachment_filename=nameFileTileset,mimetype='image/png')


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()



if __name__=="__main__":
    app.secret_key = os.urandom(12)
    app.run(debug=True)