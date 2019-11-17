.DEFAULT_GOAL := run

VIRTUALENV := .venv
PYTHON     := python3
PIP        := source $(VIRTUALENV)/bin/activate; pip3
PYLINT     := source $(VIRTUALENV)/bin/activate; pylint
PYTEST     := source $(VIRTUALENV)/bin/activate; pytest
FLASK      := source $(VIRTUALENV)/bin/activate; cd src && flask
DOCKER     := docker
SKAFFOLD   := skaffold
SKAFFOLD_PROFILE := incluster

IMAGE      ?= agilestacks/opencvapp

$(VIRTUALENV):
	$(PYTHON) -m venv $(abspath $@)

install: $(VIRTUALENV)
	$(PIP) install -r requirements.txt

lint: $(VIRTUALENV)
	$(PYLINT) api

pytest: $(VIRTUALENV)
	$(PYTEST) --junitxml=junit.xml

flask: $(VIRTUALENV)
	$(FLASK) run --port=5000

clean: gen-clean
	@rm -rf $(VIRTUALENV) __pycache__

image:
	$(DOCKER) build -t $(IMAGE) $(CURDIR)

docker:
	test -e /dev/video0 \
	&& $(DOCKER) run --rm -it --device /dev/video0 -p 5000:5000 $(IMAGE) \
	|| $(DOCKER) run --rm -it -p 80:80 $(IMAGE)

gen-%:
	$(eval dir    := $(firstword $(subst -, ,$@)))
	$(eval target := $(lastword $(subst -, ,$@)))
	$(MAKE) -C $(dir) $(target)

skaffold-%: 
	$(SKAFFOLD) -p $(SKAFFOLD_PROFILE) $(lastword $(subst -, ,$@))

skaffold-run:
skaffold-dev:
skaffold: gen skaffold-dev

gen: gen-apply

.PHONY: clean install lint pytest run gen
