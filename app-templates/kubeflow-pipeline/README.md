# Kubeflow Pipeline Application

** Work in progress **

## Temporary instructions

While work in progress here are some getting started instructions that shall be deprecated as soon work will be completed

```bash
export GITHUB_TOKEN=your-github-api-token
git -C work init
git -C work remote add origin https://$GITHUB_TOKEN@github.com/agilestacks/applications
git -C work fetch
git -C work checkout origin/master -- app-templates/kubeflow-pipeline
```

Grant access to Jupyter keyring
```bash
kubectl apply -f .hub/rbac.yaml
kubectl -n harbor get secret $HARBOR_PULL_SECRET -o json| jq -rMc 'del(.metadata.namespace)' | kubectl apply -f -
```

Run Jupyter notebook from: [wip/app-templates/kubeflow-pipeline/main.ipynb](main.ipynb)

