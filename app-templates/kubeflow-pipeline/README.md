# Kubeflow Pipeline Application

** Work in progress **

## Temporary instructions

While work in progress here are some getting started instructions that shall be deprecated as soon work will be completed

```bash
export GITHUB_TOKEN=your-github-api-token
git clone --depth 1 --no-checkout --filter=blob:none https://$GITHUB_TOKEN@github.com/agilestacks/applications wip
git -C wip checkout master -- app-templates/kubeflow-pipeline
```

Grant access to Jupyter keyring
```bash
kubectl apply -f .hub/rbac.yaml
```

Run Jupyter notebook from: [wip/app-templates/kubeflow-pipeline/main.ipynb](main.ipynb)

