local k8s = import 'libs/templates.libsonnet';
local app = "opencv";
local svc = app;
local ingressHost = std.extVar("HUB_INGRESS_HOST");

{
  "ingress.json": k8s.ingress(name=app) {
    spec: {
      rules: [
        k8s.ingressRule(host=ingressHost, serviceName=app),
      ]
    },
  },
}
