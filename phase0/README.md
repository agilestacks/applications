# Phase 0

Generation phase. During this phase we will generate a workspace for application with all necessary components. 

### Usage
```bash
export GITHUB_TOKEN=my_secret_oauth_token
cat reactjs-example.yaml | ./deploy.sh 
```

Generation manifest can be found here:
```yaml
---
version: 1
kind: template
meta:
  name: reactjs:1
  brief: >
    Reactjs application with S3 backend
  source:
    github:
      remote: https://github.com/agilestacks/applications.git
      protocol: http
      refSpec: master
      subDir: app-templates/java-backend
      token:
        fromEnv: GITHUB_TOKEN
components:
- name: s3-website
  source:
    github:
      remote: https://github.com/agilestacks/applications.git
      protocol: http
      refSpec: master
      subDir: components/s3-website
      token:
        fromEnv: GITHUB_TOKEN
    # git:
    #   remote: http://github.com/agilestacks/applications.git
    #   subDir: components/s3-website
```

We do support two distinct source locations. Git (rely on fully configured `git`) client. And `github` that rely on `ghub` and Oauth Token as auth method
