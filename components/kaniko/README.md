# Kaniko

This component build a docker image out of user source code in the git.

During the deploy time hub starts a Kubernetes job with two containers.
1. `git-sync`: to clone a user git repository
2. `kaniko`: to build and push a docker image

This component will check where is a docker registry pull secret

## Future evolution
- [ ] add support for ECR
- [ ] add support for Gitlab
- [ ] add troubleshooting section

## Configuration
Most important parameters can be found below
```yaml
parameters:
- name: component.kaniko
  parameters:
  - name: destination
    brief: Name of the docker image and destination to do a docker push
  - name: contextDir
    brief: directory inside of a git repository (default root)
- name: component.docker.registry
  parameters:
  - name: url
    brief: docker registry URL
  - name: pullSecret.name
    brief: name of a docker registry pull secret
  - name: pullSecret.namespace
    brief: name of a docker registry pull secret namespace
```

## Troubleshooting
TBD
