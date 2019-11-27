local k8s = import 'libs/templates.libsonnet';
local app = std.extVar("HUB_APP_NAME");
local ingressHost = std.extVar("HUB_INGRESS_HOST");

k8s.ingress(name=app) {
  spec: {
    rules: [
      k8s.ingressRule(host=ingressHost, serviceName=app),
    ]
  },
}
