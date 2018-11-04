# Jupyter Notebook Application Template
Jupyter notebook environment that requires no setup and runs entirely in the cloud with JupyterHub. Jupyter Hub allows you to use and share Jupyter notebooks with others without having to download, install, or run anything on your own computer other than a browser.  Agile Stacks integrates Jupyter with other Kubernetes services such as Docker registry, logging, monitoring, storage, security, and allows to use GitHub repository for source code versioning and team collaboration in a secure reliable way.  

## Application components
- Git repository in order to store user workspace notebooks and application configuration
- Container registry where to push customized Jupyter Notebook images
- Jupyter Notebook workspace integrated with Git repository

## Scenario
1. The application creates a Git repository where to store user workspace notebooks and application configuration
2. The application creates a Docker registry and pushes there customized Jupyter notebook image
3. Jupyter Notebook workspace pod gets provisioned within JupyterHub using the Agilestacks's Automation Hub
4. Application users get access to the links to their Notebook workspace and Git repository through the Control plane (Stacks > Applications > List)
5. Optional: edit the Dockerfile to install additional libraries or tools. Docker image will be automatically rebuilt and re-deployed to the workspace after the Dockerfile has been pushed to the Git repository

## Configuration
Jupyter Notebook Application Template form accepts the following parameters:
- a name of the Jupyter Notebook user workspace (must be unique within a stack)
- Jupyter Notebook base image name (such as jupyter/base-notebook, etc.) that can be extended with custom libraries or tools
