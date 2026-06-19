from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

IP_ADDRESS = "x.xxx.xx.xxx"
SQL_ALCHEMY_DATABASE_URL = "postgresql://rwuser:{0}@{1}:5432/agregador".format(quote_plus("xxxxxxxxxx"), IP_ADDRESS)

engine = create_engine(SQL_ALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()
