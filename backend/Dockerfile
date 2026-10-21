FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY *.py ./

RUN useradd --create-home appuser
USER appuser

CMD ["sh", "-c", "uvicorn api_server:app --host 0.0.0.0 --port ${PORT:-8000}"]
