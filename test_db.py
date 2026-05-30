import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
from sqlalchemy import create_engine, inspect
engine = create_engine(os.environ['DATABASE_URL'])
inspector = inspect(engine)
columns = inspector.get_columns('adoption_applications')
for c in columns:
    print(c['name'], c['nullable'])
