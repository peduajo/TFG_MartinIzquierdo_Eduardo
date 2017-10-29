from flask import Flask,render_template,session,request,flash
import os

app = Flask(__name__)

@app.route('/')
def home():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return render_template('index.html')

@app.route('/login', methods=['POST'])
def do_admin_login():
    if request.form['password']=='1234' and request.form['email']=='login@gmail.com':
        session['logged_in']=True
    else:
        flash('CAMPOS INCORRECTOS')
    return home()

@app.route("/logout")
def logout():
    session['logged_in'] = False
    return home()

if __name__=="__main__":
    app.secret_key = os.urandom(12)
    app.run(debug=True)