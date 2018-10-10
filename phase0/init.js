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
const shell = require('child_process').execSync;

const manifestURL = process.env.APPLICATION_MANIFEST;
const appRepoOrg = process.env.APP_REPO_ORG;
const appRepoName = process.env.APP_REPO_NAME;
const appRepoToken = process.env.COMPONENT_GITHUB_TOKEN;
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
        shell(`rm -rf ${directory}`);
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
    shell(`git clone --single-branch -b ${branch} ${securedGithub}`);
    const srcPath = repoPath === undefined ? appName : [repoPath, appName].join('/');
    const destPath = [workspaceDir, dir].join('/');
    shell(`mkdir -p ${destPath}`);
    shell(`touch ${srcPath}/.cpignore`)
    shell(`rsync -htrzai --progress --exclude-from ${srcPath}/.cpignore ${srcPath}/ ${destPath}`);
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
            shell(`git clone --single-branch -b ${branch} ${securedGithub}`);
        }
        const srcPath = repoPath
        const destPath = [workspaceDir, '.hub', dir].join('/');
        shell(`mkdir -p ${destPath}`);
        shell(`touch ${srcPath}/.cpignore`)
        shell(`rsync -htrzai --progress --exclude-from ${srcPath}/.cpignore ${srcPath}/ ${destPath}`);
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
    fs.writeFile([workspaceDir, '.hub', manifest.meta.source.dir, 'hub.yaml'].join('/'), yaml, (err) => {
        if (err) {
            logger.error('Cannot write manifest file to disk', err);
            fail();
        }
        logger
            .info(`Application manifest and configuration has been created and placed to 
                ${[workspaceDir, '.hub'].join('/')}`);
    });
}

async function perform() {
    if (manifestURL) {
        const manifest = downloadManifest();
        await prepareWorkspace(manifest);
        copyManifest(manifest);
    } else if (appRepoName && appRepoOrg && appRepoToken) {
        const gitUrl = securedGithubUrl(`https://github.com/${appRepoOrg}/${appRepoName}.git`, appRepoToken); 
        shell(`git clone --single-branch -b master ${gitUrl}`);
        shell(`rsync -htrzai --progress ${appRepoName}/ ${workspaceDir}`);
        logger.info('Application workspace initialized');
    } else {
        logger.error('Cannot initialize application workspace');
        fail();
    }
}

perform();
