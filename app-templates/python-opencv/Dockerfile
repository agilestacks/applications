FROM python:3.7

ENV FLASK_ENV docker

COPY requirements.txt /
RUN pip install --upgrade pip
RUN pip install --compile --no-cache-dir -r /requirements.txt

WORKDIR /app
COPY src/ .

EXPOSE 80

ENTRYPOINT ["gunicorn", "-b", "0.0.0.0:80", "app"]
