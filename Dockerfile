# Imagem única para o Render: compila o frontend e roda o Django servindo site + API no mesmo endereço.

# 1) Frontend (React + Vite)
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# A API fica na mesma origem do site.
ENV VITE_API_BASE_URL=/api
RUN npm run build

# 2) Backend (Django)
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 FRONTEND_DIST=/app/frontend/dist
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
# Chave temporária só para o collectstatic; a real vem das variáveis do Render.
RUN DJANGO_SECRET_KEY=somente-para-build DJANGO_DEBUG=False python manage.py collectstatic --noinput
RUN chmod +x start.sh && useradd --create-home app && chown -R app /app
USER app
CMD ["./start.sh"]
