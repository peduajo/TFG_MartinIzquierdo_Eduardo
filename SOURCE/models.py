from sqlalchemy import Column, Integer, String ,ForeignKey,Text,LargeBinary
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    password = Column(String)
    maps = relationship("Map")

    def __init__(self, username, password):
        self.username = username
        self.password = password

class Map(Base):
    __tablename__ = "mapas"
    id = Column(Integer, primary_key=True)
    idUser = Column(Integer,ForeignKey('users.id'))
    mapa = Column(Text)
    nombreMapa = Column(String)
    tileSet = Column(LargeBinary)
    nombreTileSet = Column(String)
    refuerzos = Column(String)
    capaObjetos = Column(String)
    capasBackground = Column(String)
    width = Column(Integer)
    height = Column(Integer)

    def __init__(self, mapa, idUser,nombreMapa,tileSet,nombreTileSet,refuerzos,capaObjetos,capasBackground,width,heigh):
        self.mapa = mapa
        self.idUser = idUser
        self.nombreMapa = nombreMapa
        self.tileSet = tileSet
        self.nombreTileSet = nombreTileSet
        self.refuerzos = refuerzos
        self.capaObjetos = capaObjetos
        self.capasBackground = capasBackground
        self.width = width
        self.height = heigh

