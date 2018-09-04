# Minio Bucket

Creates a new bucket for [Minio](https://github.com/minio/minio) server

## Usage

Set a bucket name to `component.minio.bucket.name` and then deploy this component

## Prerequisites

Current component requires following prerequisites to be available
* Minio
* Ingress

### Parameters

List of essential parameters. Full list can be found in [hub-component.yaml](https://github.com/agilestacks/applications/blob/master/components/minio-bucket/hub-component.yaml)
 
| Parameter | Default | Description  |
|:----------|---------|-----|
| `component.minio.name` | `minio` | Minio component name |
| `component.minio.accessKey` | <empty> | Sccess key for minio server. Stored in the secret with identified by component name. Random if empty |
| `component.minio.secretKey` | <empty> | Secret key for minio server. Stored in the secret with identified by component name. Random if empty |
| `component.minio.volumeType` | `gp2` | Type of minio volume for dynamic provisioner |
| `component.minio.storageSize` | `20Gi` | Size for PV to be created |
| `component.minio.bucket.name` | `default` | Default bucket to be created |
| `component.minio.bucket.policy` | `public` | Default bucket ACL |

### Outputs
None :)

## Supported verbs
* `deploy` - crete a new budket
* `undeploy` - delete a bucket

