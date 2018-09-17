# Workflow Application 
Workflow application backed with Argo. This applicaiton has been optimized for Simulation and Machine Learning workloads, such as video transcoding.

## Scenario
1. Create a git repository
2. Create docker registry
3. Build a container that runs Argo job
3. Configure Argo to be triggered by events from object storage 
4. Implementation of actual Argo job

## Prerequisites
- Environment variable `GITHUB_TOKEN`: Github OAuth token (configured [here](https://github.com/settings/tokens)) **Important!**: token must have following capabilities: `repo`, `admin:repo_hook`, `delete_repo`

## Configuration
Define following parameters in `hub.yaml`:
- `component.github.repository.organization`
- `component.github.repository.name`
