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
    const repos = components
        .map((element) => {
            const {
                name,
                source
            } = element;
            const {
                repository,
                repoDir,
                dir,
                branch
            } = source;
            return {
                url: repository,
                name,
                repoDir,
                dir,
                branch
            };
        });
    const clonedRepos = [];
    await forEach(repos, async (repo) => {
        if (!clonedRepos.includes(repo.url)) {
            clonedRepos.push(repo.url);
            shell(`git -c http.extraHeader="X-API-Secret: 
                ${gitApiSecret}" clone --single-branch -b ${repo.branch} --depth=1 ${repo.url}`);
        }
        const srcPath = path
            .dirname((repo.repoDir === undefined) ? repo.name : [repo.repoDir, repo.name].join('/'));
        const destPath = [workspaceDir, repo.dir].join('/');
        shell(`mkdir -p ${destPath}`);
        shell(`cp -r ${[srcPath, repo.name].join('/')}/* ${destPath}`);
    });
    logger.info(`Components [${components
        .map(element => element.name)}] placed to ${workspaceDir}`);
    await clean(uniq(repos.map(repo => repo.repoDir.split('/')[0])));
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
