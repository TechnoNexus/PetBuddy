python -m venv petbuddy-env

source petbuddy-env/bin/activate

pip install -r requirements.txt

pip freeze > requirements.txt

uvicorn main:app --reload

cd frontend

npm install

npm install axios @mui/material @emotion/react @emotion/styled react-router-dom @mui/icons-material

npm run dev

deactivate
