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

const fs = require('fs');
const path = require('path');
const shell = require('child_process').execSync;

const manifestURL = process.env.APPLICATION_MANIFEST;
const workspaceDir = process.env.WORKSPACE_DIR === undefined ? '/Users/oginskis/workspace' :
    process.env.WORKSPACE_DIR;
const token = process.env.GITHUB_TOKEN;
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.simple()
});

function fail() {
    process.exit(1);
}

function checkEnv() {
    if (manifestURL === undefined) {
        logger.error('APPLICATION_MANIFEST env variable is not set');
        fail();
    }
    if (token === undefined) {
        logger.error('GITHUB_TOKEN env variable is not set');
        fail();
    }
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
        shell(`rm -rf ${directory}`);
    });
}

function securedGithubUrl(url) {
    if (!url.startsWith('https://github.com')) {
        logger.error('Only repositories from Github are supported right now');
        fail();
    }
    return url.replace('github.com', `${token}@github.com`);
}

async function checkoutApplication(meta) {
    const {
        name,
        source
    } = meta;
    const {
        repository: url,
        repoDir,
        branch
    } = source;
    const appName = name.split(':')[0];
    const securedGithub = securedGithubUrl(url);
    shell(`git clone --single-branch -b ${branch} ${securedGithub}`);
    const srcPath = path
        .dirname((repoDir === undefined) ? appName : [repoDir, appName].join('/'));
    shell(`cp ${[srcPath, appName].join('/')}/Makefile ${workspaceDir}`);
    return url;
}

async function prepareWorkspace(manifest) {
    const {
        components,
        meta
    } = manifest;
    logger.info('Checking out GIT repositories');
    shell(`mkdir -p ${workspaceDir}`);
    const clonedRepos = [];
    const appRepo = await checkoutApplication(meta);
    clonedRepos.push(appRepo);
    await forEach(components, async (component) => {
        const {
            name,
            source
        } = component;
        const {
            repository: url,
            repoDir,
            branch,
            dir
        } = source;
        if (!clonedRepos.includes(url)) {
            clonedRepos.push(url);
            const securedGithub = securedGithubUrl(url);
            shell(`git clone --single-branch -b ${branch} ${securedGithub}`);
        }
        const srcPath = path
            .dirname((repoDir === undefined) ? name : [repoDir, name].join('/'));
        const destPath = [workspaceDir, dir].join('/');
        shell(`mkdir -p ${destPath}`);
        shell(`cp -r ${[srcPath, name].join('/')}/* ${destPath}`);
    });
    logger.info(`Components [${components
        .map(element => element.name)}] placed to ${workspaceDir}`);
    await clean(uniq(components.map(component => component.source.repoDir.split('/')[0])));
}

function createAndPlaceManifest(manifest) {
    const {
        components
    } = manifest;
    components.forEach((element) => {
        const {
            source
        } = element;
        delete source.repository;
        delete source.branch;
        delete source.repoDir;
    });
    const yaml = safeDump(manifest);
    fs.writeFile(`${workspaceDir}/hub.yaml`, yaml, (err) => {
        if (err) {
            logger.error('Cannot write manifest file to disk', err);
            fail();
        }
        logger.info(`Manifest has been created and placed to ${workspaceDir}`);
    });
}

async function perform() {
    checkEnv();
    const manifest = downloadManifest();
    await prepareWorkspace(manifest);
    createAndPlaceManifest(manifest);
}

perform();
