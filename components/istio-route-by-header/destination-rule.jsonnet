local serviceName = std.extVar('SERVICE_NAME');
local versions = std.split(std.extVar('VERSIONS'), ' ');
[
  {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'DestinationRule',
    metadata: {
      name: serviceName + '-rule',
    },
    spec: {
      host: serviceName,
      subsets: [
        { labels: { version: x }, name: x }
        for x in versions
      ],
    },
  },
]
