local template = import 'vscode-settings.json';
local domain_name = std.extVar("HUB_DOMAIN_NAME");
local kubeconfig  = std.extVar("KUBECONFIG");
local docker_registry = std.extVar("HUB_DOCKER_HOST") + "/library";
local known_kubeconfigs = std.split(std.extVar("HUB_KNOWN_KUBECONFIGS"), " ");

local parts     = std.split(kubeconfig, "/");
local file      = parts[std.length(parts)-1];
local basename1 = std.strReplace(file, ".yaml", "");
local basename2 = std.strReplace(basename1, "kubeconfig.", "");

template + {
  "vsdocker.imageUser": docker_registry,
  "vs-kubernetes": {
    "vs-kubernetes.knownKubeconfigs": known_kubeconfigs,
    "vs-kubernetes.kubeconfig": kubeconfig,
  },
  "cloudcode.active-kubeconfig": basename2,
  "cloudcode.profile-registry-map": {
      "local": docker_registry,
      "incluter": docker_registry
  },
  "cloudcode.kubeconfigs": [
   {
      local prts = std.split(fullpath, "/"),
      local f    = prts[std.length(prts)-1],
      local b1   = std.strReplace(f, ".yaml", ""),
      local b2   = std.strReplace(f, "kubeconfig.", ""),
      name: b2,
      path: fullpath,
   }
   for fullpath in known_kubeconfigs
  ]
}
