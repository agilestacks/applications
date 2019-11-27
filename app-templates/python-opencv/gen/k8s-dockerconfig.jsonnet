local k8s = import 'libs/templates.libsonnet';
local docker_host = std.extVar("HUB_DOCKER_HOST");
local stripped_hostname = std.split(docker_host,":")[0];

local dockerconfig = {
  auths: {
    [stripped_hostname]: {
      username: std.extVar("HUB_DOCKER_USER"),
      password: std.extVar("HUB_DOCKER_PASS"),
    }
  },
  credHelpers: import 'libs/credhelpers.libsonnet',
};

k8s.secret("dockerconfig") {
  data: {
    'config.json': std.base64(std.toString(dockerconfig)),
  },
}
