OBJETIVOS DEL PROYECTO

El objetivo principal de este TFG es construir una aplicación visual que mediante un mundo en 2D donde alcanzar un objetivo se muestren los conceptos y acciones básicas del Aprendizaje por Refuerzo. Los objetivos específicos son los siguientes:
1. Definir un entorno visual para la edición del mundo y el problema a
resolver.
2. Establecer las formas de mostrar los elementos propios del Aprendizaje
por Refuerzo.
3. Crear un entorno Web con usuarios donde ejecutar la aplicación.

DEPENDENCIAS

Las librerias de python a instalar son las siguientes y vienen adjuntas con el comando para instalarlas:

1. Flask-SQLAlchemy:	pip install Flask-SQLAlchemy

2. Json:    pip install simplejson

INSTRUCCIONES 

Para desplegar el servidor, hay que ejecutar el archivo app.py del directorio SOURCE. Para ello, dentro del directorio SOURCE, se ejecuta:
	
	python app.py

Una vez hecho esto, hay que acceder a la URL en el buscador. En este caso: 
	
	http://127.0.0.1:5000/login

Para cargar el entrenamiento, hay que cargar el archivo JSON del mapa y el archivo PNG del conjunto de patrones. Estos archivos se encuentran en el directorio MAPASEJEMPLOS.

Nota: se recomienda mirar el Anexo B del documento del presente TFG para seguir el manual de usuario.
