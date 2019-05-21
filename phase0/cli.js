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

var applicationTemplates = process.env.APPLICATION_TEMPLATES || '../app-templates/'

const cli = meow(`
    Usage
    $ cli.js <input>

    Options
    --file, -f use manifest to generate another
    --output -o save manifest into file

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
    const inputFile = cli.flags.file
    const outputFile = cli.flags.output

    var doc = readFile(inputFile)
    var requires = ['hub', ...doc.requires]
    self.logger.info('App requires: [' + requires + ']')
    var slicesDir = path.join(applicationTemplates, doc.application, '.hub/manifests')
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
