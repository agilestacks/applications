#!/usr/bin/env node
'use strict';

const meow = require('meow');
const self = require('.')

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// TODO we can present automation hub as library in a devDependency
var autoHubSrc = process.env.AUTOMATION_HUB_SRC || '../../automation-hub/api/src/'
const app = require(path.join(autoHubSrc, 'controllers/applications'))

// var applicationTemplates = process.env.APPLICATION_TEMPLATES || '../app-templates/'

const cli = meow(`
    Usage
    $ cli.js <flags> <app-root>

    app-root: directory where application source code is (<app-root>/.hub)

    Options
    --file, -f request payload in yaml format
    --output, -o save manifest into file (if empty then to stdout)
    --requires, -r comma separated list of slices (if empty will be taken from payload)
`, {
        flags: {
            file: {
                type: 'string',
                alias: 'f'
            },
            output: {
                type: 'string',
                alias: 'o'
            },
            requires: {
                type: 'string',
                alias: 'r'
            },
        }
    });

function readFile(file) {
    try {
        self.logger.info('Reading file: ' + file)
        return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        self.logger.error('Cannot open the file: ' + file, e);
        process.exit(1);
    }
}

function writeFile(file, content) {
    fs.writeFile(file, content, function (err) {
        if (err) {
            console.log(err);
            process.exit(2);
        }
        self.logger.info('Saved file: ' + file);
    });
}

if (module.parent == null) {
    var inputFile = cli.flags.file
    var outputFile = cli.flags.output
    var appRootDir = cli.input[0] || '.'

    var doc = readFile(inputFile)
    var requires
    if (cli.flags.requires) {
        requires = ['hub', ...cli.flags.requires.split(',')]
    } else {
        requires = ['hub', ...doc.requires]
    }
    self.logger.info('App requires: [' + requires + ']')
    var slicesDir = path.join(appRootDir, '.hub/manifests')
    var slices = fs.readdirSync(slicesDir).filter(file =>
        requires.includes(app.extractSliceComponentName(file) )
    ).map(
        file => path.join(slicesDir, file)
    ).sort().map(file =>
        readFile(file)
    )

    var man = app.createManifest(slices)
    if (outputFile) {
        writeFile(outputFile, man)
    } else {
        console.log(man);
    }
}
