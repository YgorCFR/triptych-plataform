from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, DateTime
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)  # Add the email column
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Topico(Base):

    __tablename__ = 'topico'

    id = Column(Integer, primary_key=True, index=True)
    nome_topico = Column(String, unique=True, index=True)

class Projeto(Base):

    __tablename__ = 'projeto'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    descricao = Column(String)
    id_autor = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    updated_at = Column(DateTime(timezone=False), server_default=func.now())
    images_urls = Column(String)
    id_topico = Column(Integer, ForeignKey("topico.id"), nullable=False)
    id_osf = Column(Integer, default="", nullable=True)
    id_zenodo = Column(Integer, default="", nullable=True)
    tags = Column(JSON)

class MembroProjeto(Base):

    __tablename__ = 'membros_projeto'

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("users.id"), nullable=False)
    id_projeto = Column(Integer, ForeignKey("projeto.id"), nullable=False)

class TopicoInteresse(Base):

    __tablename__ = 'topicos_interesse'

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profile.id"), index=True)
    topico_id = Column(Integer, ForeignKey("topico.id"), index=True)

class Perfil(Base):

    __tablename__ = 'profile'

    id = Column(Integer, primary_key=True, index=True)
    possui_zenodo = Column(Integer)
    possui_osf = Column(Integer)
    possui_arxiv = Column(Integer)
    universidade = Column(String)
    sobre = Column(String)
    areas = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)


