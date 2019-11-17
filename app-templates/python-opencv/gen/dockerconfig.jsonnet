
local helpers = import 'libs/docker.libsonnet';
local host = std.extVar("HUB_DOCKER_HOST");

{
  'config.json': {
    auths: {
      [host]: {
        username: std.extVar("HUB_DOCKER_USER"),
        password: std.extVar("HUB_DOCKER_PASS"),
      }
    },
    // credHelpers: helpers,
  },
}
