local template = import 'vscode-settings.json';
local domain_name = std.extVar("HUB_DOMAIN_NAME");
local kubeconfig  = std.extVar("KUBECONFIG");
local docker_registry = std.extVar("HUB_DOCKER_HOST") + "/library";

template + {
  "vsdocker.imageUser": docker_registry,
  "cloudcode.kubeconfigs": {
    configPath: kubeconfig,
  },
  "cloudcode.profile-cluster-map": {
    incluster: {
      context: domain_name,
      configPath: kubeconfig,
    },
    "local": {
      context: domain_name,
      configPath: kubeconfig,
    },
  },
  "cloudcode.profile-registry-map": {
    "incluster": docker_registry,
    "local": docker_registry,
  },
}
