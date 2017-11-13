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
    urlCirculo = url_for('static', filename='assets/images/circuloAmarillo.png')
    urlTesoro = url_for('static', filename='assets/images/tesoro.png')
    urlBot = url_for('static', filename='assets/images/bot.png')
    id = request.args.get('idUser')
    if request.method == 'GET':
        mapasUsuario = []
        mapas = Map.query.filter(Map.idUser==id).all()
        for mapa in mapas:
            mapasUsuario.append(mapa.nombreMapa)
        return render_template('carga.html',name=email,idUser = id,mapasUsuario = mapasUsuario)
    else:
        tipoCarga = request.form.get('tipoCarga')
        refuerzos = request.form.getlist('listaRefuerzos')
        if tipoCarga == "Abrir nuevo mapa":
            mapaInput = request.files['mapaJson']
            tileSetInput = request.files['tileSet']
            if mapaInput.filename == '':
                flash('MAPA NO SELECCIONADO')
                return redirect(request.url)
            elif tileSetInput.filename == '':
                flash('PATRONES NO SELECCIONADOS')
                return redirect(request.url)
            elif not refuerzos:
                flash('NO HAY REFUERZOS')
                return redirect(request.url)
            else:
                textJsonMap = mapaInput.read()
                query = Map.query.filter(Map.mapa==textJsonMap,Map.idUser==id)
                result = query.first()
                if result:
                    flash('YA EXISTE ESTE MAPA')
                    return redirect(request.url)
                else:
                    stringRefuerzos = '-'.join(refuerzos)
                    map = Map(textJsonMap,id,mapaInput.filename,tileSetInput.read(),stringRefuerzos)
                    db_session.add(map)
                    db_session.commit()
                    urlMapa = url_for('getMap',id = id, nombreMapa = mapaInput.filename)
                    urlTileset = url_for('getTileset',id = id, nombreMapa = mapaInput.filename)
                    return render_template('index.html',name=email,urlMapa = urlMapa,urlCirculo = urlCirculo, urlTesoro = urlTesoro, urlBot = urlBot, urlTileset = urlTileset, listaRefuerzos = refuerzos)
        else:
             nombreMapa = request.form.get('listaMapas')
             stringRefuerzos = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first().refuerzos
             listaRefuerzos = stringRefuerzos.split('-')
             urlMapa = url_for('getMap',id = id, nombreMapa = nombreMapa)
             urlTileset = url_for('getTileset',id = id, nombreMapa = nombreMapa)
             return render_template('index.html',name=email,urlMapa = urlMapa,urlCirculo = urlCirculo, urlTesoro = urlTesoro, urlBot = urlBot, urlTileset = urlTileset, listaRefuerzos = listaRefuerzos)

@app.route("/getMap/<int:id>")
def getMap(id):
    nombreMapa = request.args.get('nombreMapa')
    mapa = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first()
    return jsonify(json.loads(mapa.mapa))

@app.route("/getTileset/<int:id>")
def getTileset(id):
    nombreMapa = request.args.get('nombreMapa')
    mapa = Map.query.filter(Map.idUser==id,Map.nombreMapa==nombreMapa).first()
    return send_file(io.BytesIO(mapa.tileSet),attachment_filename='tileset.png',mimetype='image/png')


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()



if __name__=="__main__":
    app.secret_key = os.urandom(12)
    app.run(debug=True)