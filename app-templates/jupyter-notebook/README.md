# Jupyter Notebook applications
Jupyter notebook environment that requires no setup and runs entirely in the cloud with JupyterHub. This applicaiton has been optimized for Simulation and Machine Learning workloads, such as video transcoding.  Jupyter Hub allows you to use and share Jupyter notebooks with others without having to download, install, or run anything on your own computer other than a browser.  Agile Stacks integrates Jupyter with other Kubernetes services such as Docker registry, logging, monitoring, storage, security, and allows to use GitHub repository for source code versioning and team collaboration in a secure reliable way.  

## Scenario
1. Create a git repository
2. Create docker registry
3. Optional: edit the Docker container that runs Jupyter notebook - to install additional libraries or tools
4. Create, edit, and run Jupyter notebooks
5. Commit code to Git to share with others or to deploy
6. Use Kubeflow (TF-Serving, Seldon) to deploy in production

## Prerequisites
- Environment variable `GITHUB_TOKEN`: Github OAuth token (configured [here](https://github.com/settings/tokens)) **Important!**: token must have following capabilities: `repo`, `admin:repo_hook`, `delete_repo`

## Configuration
Define following parameters in `hub.yaml`:
- `component.github.repository.organization`
- `component.github.repository.name`
