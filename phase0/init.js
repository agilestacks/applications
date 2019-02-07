const {
    safeLoad,
    safeDump
} = require('js-yaml');
const winston = require('winston');
const request = require('sync-request');
const {
    forEach
} = require('p-iteration');
const {
    uniq
} = require('lodash');
const shelljs = require('shelljs');

const fs = require('fs');
const glob = require("glob").sync;

const manifestURL = process.env.APPLICATION_MANIFEST;
const parametersURL = process.env.PARAMETERS_MANIFEST;
const repoUrl = process.env.APP_GIT_REMOTE;
const repoBranch = process.env.APP_GIT_BRANCH;

const workspaceDir = process.env.WORKSPACE_DIR === undefined ? './workspace' :
    process.env.WORKSPACE_DIR;
const hubDir = [workspaceDir, '.hub'].join('/');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.simple()
});

function fail(error) {
    error && logger.error(error);
    process.exit(1);
}

function download(url) {
    logger.info(`Downloading file from ${url}`);
    let res;
    try {
        res = request('GET', url);
    } catch (err) {
        logger.error('Cannot download the file', err);
        fail();
    }
    logger.info('Downloaded file: ');
    logger.info(res.body);
    const {
        body: contents
    } = res;
    if (contents === undefined) {
        logger.error('File not found');
        fail();
    }
    return safeLoad(contents);
}

async function clean(directories) {
    await forEach(directories, async (directory) => {
        shelljs.rm('-rf', directory);
    });
}

function securedGitUrl({repoUrl, tokenEnv, repoKind}) {
    let token = process.env[tokenEnv];
    if (!repoKind || repoKind === 'github') {
        if (!token) {
            token = process.env.COMPONENT_GITHUB_TOKEN;
        }
        return repoUrl.replace('github.com', `${token}@github.com`);
    } else if (repoKind === 'gitlab') {
        if (!token) {
            token = process.env.COMPONENT_GITLAB_TOKEN;
        }
        return repoUrl.replace('://', `://oauth2:${token}@`);
    } else if (repoKind === 'bitbucket') {
        if (!token) {
            token = process.env.COMPONENT_BITBUCKET_TOKEN;
        }
        const user = process.env.APP_GIT_USER;
        return repoUrl.replace('://', `://${user}:${token}@`);
    } else {
        fail('Unknown Git repository kind');
    }
}

async function checkoutApplication(meta) {
    const {
        name,
        source
    } = meta;
    const {
        repoUrl,
        repoPath,
        branch,
        dir,
        fromEnv: tokenEnv
    } = source;
    const appName = name.split(':')[0];
    const securedGithub = securedGitUrl({repoUrl, tokenEnv});
    const gitBranch = process.env[branch] || 'master';
    shelljs.exec(`git clone --single-branch -b ${gitBranch} ${securedGithub}`);
    const srcPath = repoPath === undefined ? appName : [repoPath, appName].join('/');
    const destPath = [workspaceDir, dir].join('/');
    shelljs.mkdir('-p', destPath);
    shelljs.touch(`${srcPath}/.cpignore`)
    shelljs.exec(`rsync -htrzai --progress --exclude-from ${srcPath}/.cpignore ${srcPath}/ ${destPath}`);
    return repoUrl;
}

async function prepareWorkspace(manifest) {
    const {
        components,
        meta
    } = manifest;
    logger.info('Checking out GIT repositories');
    shelljs.mkdir('-p', workspaceDir);
    const clonedRepos = [];
    const appRepo = await checkoutApplication(meta);
    clonedRepos.push(appRepo);
    await forEach(components, async (component) => {
        const {
            source
        } = component;
        const {
            repoUrl,
            repoPath,
            branch,
            dir,
            fromEnv: tokenEnv
        } = source;
        const gitBranch = process.env[branch] || 'master';
        if (!clonedRepos.includes(repoUrl)) {
            clonedRepos.push(repoUrl);
            const securedGithub = securedGitUrl({repoUrl, tokenEnv});
            shelljs.exec(`git clone --single-branch -b ${gitBranch} ${securedGithub}`);
        }
        const srcPath = repoPath
        const destPath = [hubDir, dir].join('/');
        shelljs.mkdir('-p', destPath);
        shelljs.touch(`${srcPath}/.cpignore`)
        shelljs.exec(`rsync -htrzai --progress --exclude-from ${srcPath}/.cpignore ${srcPath}/ ${destPath}`);
    });
    logger.info(`Components required by the application [${components
        .map(element => element.name)}] placed to ${workspaceDir}/.hub`);
    await clean(uniq(components.map(component => component.source.repoPath.split('/')[0])));
}

function deleteObsoleteProperties(manifest) {
    const {
        meta,
        components
    } = manifest;
    delete meta.source.repoUrl;
    delete meta.source.repoPath;
    delete meta.source.branch;
    delete meta.source.fromEnv;
    components.forEach((element) => {
        const {
            source
        } = element;
        delete source.repoUrl;
        delete source.repoPath;
        delete source.branch;
        delete source.fromEnv;
    });
}

function copyParameters(parameters) {
    const yaml = safeDump(parameters);
    fs.writeFileSync([hubDir, 'managed.yaml'].join('/'), yaml);
}

function copyManifest(manifest) {
    deleteObsoleteProperties(manifest);
    const yaml = safeDump(manifest);
    fs.writeFileSync([hubDir, manifest.meta.source.dir, 'hub.yaml'].join('/'), yaml);
}

async function perform() {
    try {
        if (manifestURL) {
            const manifest = download(manifestURL);
            await prepareWorkspace(manifest);
            copyManifest(manifest);
            if (parametersURL) {
                const parameters = download(parametersURL);
                copyParameters(parameters);
            }
        } else if (repoUrl) {
            const gitUrl = securedGitUrl({repoUrl, repoKind: process.env.APP_GIT_KIND});
            shelljs.exec(`git clone --single-branch -b ${repoBranch} ${gitUrl} ${workspaceDir}`);
            if (parametersURL) {
                const parameters = download(parametersURL);
                copyParameters(parameters);
            }
            logger.info('Application workspace initialized');
        } else {
            throw new Error('Cannot initialize application workspace');
        }
    } catch (error) {
        fail(error);
    }
}

perform();
