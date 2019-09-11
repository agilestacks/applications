local serviceName = std.extVar('SERVICE_NAME');
local versions = std.split(std.extVar('VERSIONS'), ' ');
local defaultVersion = std.extVar('DEFAULT_VERSION');
local meshFqdn = std.extVar('INGRESS_GATEWAY_FQDN');
local meshGatewayName = std.extVar('GATEWAY_NAME');
local headerName = std.extVar('HEADER_NAME');

local DefaultRouteEntry(defaultVersion, serviceName) = {
  route: [
    {
      destination: {
        host: serviceName,
        subset: defaultVersion,
      },
    },
  ],
};
local RouteEntry(version, serviceName, headerName) = {
  match: [
    {
      headers: {
        [headerName]: {
          exact: version,
        },
      },
    },
  ],
  route: [
    {
      destination: {
        host: serviceName,
        subset: version,
      },
    },
  ],
};
[
  {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'VirtualService',
    metadata: {
      name: serviceName + '-virtual',
    },
    spec: {
      hosts: [
        serviceName + '.' + meshFqdn,
        serviceName,
      ],
      gateways: [
        meshGatewayName + '.istio-system.svc.cluster.local',
        'mesh',
      ],
      http:
        std.join(
          [], [
            [
              RouteEntry(version, serviceName, headerName)
              for version in versions
            ],
            [
              DefaultRouteEntry(defaultVersion, serviceName),
            ],
          ]
        ),
    },
  },
]
