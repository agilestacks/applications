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
// const shell = require('child_process').sync;

const fs = require('fs');
const glob = require("glob").sync;

const manifestURL = process.env.APPLICATION_MANIFEST;
const appRepoOrg = process.env.APP_REPO_ORG;
const appRepoName = process.env.APP_REPO_NAME;
const appRepoToken = process.env.COMPONENT_GITHUB_TOKEN;
const workspaceDir = process.env.WORKSPACE_DIR === undefined ? '/Users/oginskis/workspace' :
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

function downloadManifest() {
    logger.info(`Downloading manifest from ${manifestURL}`);
    let res;
    try {
        res = request('GET', manifestURL);
    } catch (err) {
        logger.error('Cannot download the manifest', err);
        fail();
    }
    logger.info('Downloaded manifest: ');
    logger.info(res.body);
    const {
        body: manifest
    } = res;
    if (manifest === undefined) {
        logger.error('Manifest not found');
        fail();
    }
    return safeLoad(manifest);
}

async function clean(directories) {
    await forEach(directories, async (directory) => {
        shelljs.rm('-rf', directory);
    });
}

function securedGithubUrl(url, token) {
    const githubToken = process.env[token];
    if (!url.startsWith('https://github.com')) {
        logger.error('Only repositories from Github are supported right now');
        fail();
    }
    return url.replace('github.com', `${githubToken}@github.com`);
}

async function checkoutApplication(meta) {
    const {
        name,
        source
    } = meta;
    const {
        repoUrl: url,
        repoPath,
        branch,
        dir,
        fromEnv: token
    } = source;
    const appName = name.split(':')[0];
    const securedGithub = securedGithubUrl(url, token);
    shelljs.exec(`git clone --single-branch -b ${branch} ${securedGithub}`);
    const srcPath = repoPath === undefined ? appName : [repoPath, appName].join('/');
    const destPath = [workspaceDir, dir].join('/');
    shelljs.mkdir('-p', destPath);
    shelljs.touch(`${srcPath}/.cpignore`)
    shelljs.exec(`rsync -htrzai --progress --exclude-from ${srcPath}/.cpignore ${srcPath}/ ${destPath}`);
    return url;
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
            repoUrl: url,
            repoPath,
            branch,
            dir,
            fromEnv: token
        } = source;
        if (!clonedRepos.includes(url)) {
            clonedRepos.push(url);
            const securedGithub = securedGithubUrl(url, token);
            shelljs.exec(`git clone --single-branch -b ${branch} ${securedGithub}`);
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

function copyManifest(manifest) {
    deleteObsoleteProperties(manifest);
    const yaml = safeDump(manifest);
    fs.writeFile([hubDir, manifest.meta.source.dir, 'hub.yaml'].join('/'), yaml, (err) => {
        if (err) {
            logger.error('Cannot write manifest file to disk', err);
            fail();
        }
        logger
            .info(`Application manifest and configuration has been created and placed to ${hubDir}`);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function callShellHooks(parameters) {
    const formattedParams = parameters
        .filter(parameter => parameter.value !== undefined)
        .filter(parameter => !String(parameter.value).includes('$'))
        .map(parameter => `${parameter.name}='${parameter.value}'`)
        .join(' ');
    logger.info(`Parameters eligible for substitution: ${formattedParams}`);
    shelljs.cd([hubDir, 'init.d'].join('/'));
    const scripts = glob('*.sh');
    logger.info(`Calling shell hooks: ${scripts}`);
    await forEach(scripts, async (script) => {
        shelljs.exec(`sh -c "./${script} ${formattedParams}"`);
    })
}

async function perform() {
    try {
        if (manifestURL) {
            const manifest = downloadManifest();
            await prepareWorkspace(manifest);
            copyManifest(manifest);
            await callShellHooks(manifest.parameters);
        } else if (appRepoName && appRepoOrg && appRepoToken) {
            const gitUrl = securedGithubUrl(`https://github.com/${appRepoOrg}/${appRepoName}.git`, appRepoToken);
            shelljs.exec(`git clone --single-branch -b master ${gitUrl}`);
            shelljs.exec(`rsync -htrzai --progress ${appRepoName}/ ${workspaceDir}`);
            logger.info('Application workspace initialized');
        } else {
            throw new Error('Cannot initialize application workspace');
        }
    } catch (error) {
        fail(error);
    }
}

perform();
