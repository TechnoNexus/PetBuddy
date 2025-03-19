python -m pip install --upgrade pip

python -m venv petbuddy-env

source petbuddy-env/bin/activate

mkdir petbuddy

cd petbuddy

mkdir backend

cd backend

//pip install -r requirements.txt

//pip freeze > requirements.txt

//if requirements is not installed correctly  use below:

pip install "python-jose[cryptography]" "passlib[bcrypt]" fastapi uvicorn sqlalchemy psycopg2-binary python-multipart email-validator

//if needed 

//npm create vite@latest frontend -- --template react

cd frontend

npm install

//if needed 

//npm install axios @mui/material @emotion/react @emotion/styled react-router-dom @mui/icons-material

npm run dev

pip install -r requirements.txt

pip freeze > requirements.txt

uvicorn main:app --reload

deactivate
