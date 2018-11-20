# Workflow Application Template
Workflow applications are useful for any multi-stage computational pipeline. They simplify the task of performing complex staging or data ETL to run dependent chains of jobs, such as simulations or machine learning. The example workflow step performs video transcoding for video files copied to input storage bucket and writes transcoded video to the output storage bucket. This demonstrates integration between Argo and Minio.

Workflow Applications also automate the dev/test/deploy cycle by automatically registering with your source control system to initiate build jobs when commits occur under the specified conditions. 

# Major Components 
- Git repository in order to store Docker files that define workflow steps
- Argo workflow specs
- Container registry for resulting containers.
- Event-Monitoring integrated with Object storage

## Usage Scenario
1. Create a Git repository
2. Create a Docker registry
3. Build a container that runs Argo steps
3. Configure Argo steps to be triggered by the events from object storage 
4. Push source code for container to Git to activate the build and deploy process

## Prerequisites
- Create an API access token in either Github or Gitlab. **Important!**: token must have following capabilities: `repo`, `admin:repo_hook`, `delete_repo`
- These can be created and configured [here](https://github.com/settings/tokens)
- Once you have this token, assignn it to the environment Environment variable `GITHUB_TOKEN`,  or `GITLAB_TOKEN` depending on your chosen platform. 

## Configuration
Define following parameters in `hub.yaml`:
- `component.github.repository.organization`
- `component.github.repository.name`
