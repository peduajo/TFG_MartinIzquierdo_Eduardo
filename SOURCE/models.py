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
    refuerzos = Column(String)

    def __init__(self, mapa, idUser,nombreMapa,tileSet,refuerzos):
        self.mapa = mapa
        self.idUser = idUser
        self.nombreMapa = nombreMapa
        self.tileSet = tileSet
        self.refuerzos = refuerzos
