# Workflow Application 
Workflow applications allow to create data processing pipelines for execution of distributed simulation, training and inferencing jobs in containers. This workflow applications template has been optimized for data preparation and simulation tasks.

# Components 
- Git repository in order to store Docker files that define workflow steps
- Argo workflow definition
- Container registry where to push workflow task image
- Object storage and event processing to automatically schedule execution of data processing pipelines

## Usage Scenario
1. Create a Git repository
2. Create a Docker registry
3. Build a container that runs Argo job
3. Configure Argo task to be triggered by events from object storage 
4. Implementat the actual Argo job

## Prerequisites
- Environment variable `GITHUB_TOKEN`: Github OAuth token (configured [here](https://github.com/settings/tokens)) **Important!**: token must have following capabilities: `repo`, `admin:repo_hook`, `delete_repo`

## Configuration
Define following parameters in `hub.yaml`:
- `component.github.repository.organization`
- `component.github.repository.name`
