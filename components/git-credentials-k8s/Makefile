.DEFAULT_GOAL := compile

DOCKER_USER   := agilestacks
DOCKER_PASSWD := $(HOME)/.docker/password.txt
DOCKER_IMAGE  := docker.io/$(DOCKER_USER)/git-credentials
DOCKER_TAG    := $(shell git rev-parse --short HEAD)

compile install clean init:
	$(MAKE) -C "src" $@

docker-login:
	cat $(DOCKER_PASSWD) | xargs | docker login --username $(DOCKER_USER) --password-stdin

docker-build:
	docker build -t $(DOCKER_IMAGE):latest .

docker-push: docker-login
	docker tag $(DOCKER_IMAGE):latest $(DOCKER_IMAGE):$(DOCKER_TAG)
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	docker push $(DOCKER_IMAGE):latest

.PHONY: compile install run docker
