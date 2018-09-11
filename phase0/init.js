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
const gitApiSecret = process.env.GIT_API_SECRET;
const workspaceDir = process.env.WORKSPACE_DIR === undefined ? '/Users/oginskis/workspace' :
    process.env.WORKSPACE_DIR;
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.simple()
});

function fail() {
    process.exit(1);
}

function downloadManifest() {
    if (manifestURL === undefined) {
        logger.error('APPLICATION_MANIFEST env variable is not set');
        fail();
    }
    if (gitApiSecret === undefined) {
        logger.error('GIT_API_SECRET env variable is not set');
        fail();
    }
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

async function prepareWorkspace(manifest) {
    const {
        components
    } = manifest;
    logger.info('Checking out GIT repositories');
    shell(`mkdir -p ${workspaceDir}`);
    const clonedRepos = [];
    await forEach(components, async (component) => {
        const {
            name,
            source
        } = component;
        const {
            repository: url,
            repoDir,
            dir,
            branch
        } = source;
        if (!clonedRepos.includes(url)) {
            clonedRepos.push(url);
            shell(`git -c http.extraHeader="X-API-Secret: 
                ${gitApiSecret}" clone --single-branch -b ${branch} --depth=1 ${url}`);
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

function createAndPlaceMakefile() {
    shell(`cp Makefile ${workspaceDir}`);
    logger.info(`Makefile has been created and placed to ${workspaceDir}`);
}

async function perform() {
    shell(`rm -rf ${workspaceDir}`);
    const manifest = downloadManifest();
    await prepareWorkspace(manifest);
    createAndPlaceManifest(manifest);
    createAndPlaceMakefile();
}

perform();
