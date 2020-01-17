#!/usr/bin/env python
from flask import Response, Flask, render_template
from flask_json import json_response
from uptime import uptime
from random import sample

application = Flask(__name__)
application.config.from_pyfile(f"conf/{application.config['ENV']}.py")

WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet',
    'consectetur', 'adipiscing', 'elit'
]

@application.route('/')
def index():
    # return the rendered template
    return render_template("index.html")

@application.route("/words")
@application.route("/words/<int:howmany>")
def words(howmany=3):
    resp = sample(WORDS, howmany)
    return json_response(200, data=resp, size=len(resp))

@application.route('/status')
def status():
    return json_response(
        200,
        status="ok",
        uptime=uptime(),
    )

if __name__ == "__main__":
    application.run(
      host=application.config['HOST'],
      port=application.config['PORT'],
    )
