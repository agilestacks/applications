# Workflow Application Template
Workflow applications allow to create data processing pipelines for execution of distributed simulation, training and inferencing jobs in containers. This workflow applications template has been optimized for data preparation and simulation tasks.  The example workflow step performs video transcoding for video files copied to input storage bucket and writes transcoded vide to the output storage bucket.

# Components 
- Git repository in order to store Docker files that define workflow steps
- Argo workflow specs
- Container registry where to push containers to be executed by the workflow
- Object storage and event processing to automatically schedule execution of workflow steps

## Usage Scenario
1. Create a Git repository
2. Create a Docker registry
3. Build a container that runs Argo steps
3. Configure Argo steps to be triggered by the events from object storage 
4. Push source code for container to Git to activate the build and deploy process

## Prerequisites
- Environment variable `GITHUB_TOKEN`: Github OAuth token (configured [here](https://github.com/settings/tokens)) **Important!**: token must have following capabilities: `repo`, `admin:repo_hook`, `delete_repo`

## Configuration
Define following parameters in `hub.yaml`:
- `component.github.repository.organization`
- `component.github.repository.name`
