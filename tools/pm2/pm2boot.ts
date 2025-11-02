require('ts-node/register');

/**
 * 解析命令
 * @param args      入参
 * @param argroot   默认 /data/app/game-server/dist/
 * @param cfgenv    默认 Royal
 * @param env       默认 production
 */
let parseArgs = function (args: any[]) {
    let argsMap = {};
    let mainPos = 1;

    while (args[mainPos].indexOf('--') > 0) {
        mainPos++;
    }
    argsMap['main'] = args[mainPos];

    for (let i = (mainPos + 1); i < args.length; i++) {
        let arg = args[i];
        let sep = arg.indexOf('=');
        let key = arg.slice(0, sep);
        let value = arg.slice(sep + 1);
        if (!isNaN(Number(value)) && (value.indexOf('.') < 0)) {
            value = Number(value);
        }
        argsMap[key] = value;
    }
    return argsMap;
};
const program = parseArgs(process.argv);

import util = require('util');
import path = require('path');
import fs = require('fs');
const root = path.resolve(__dirname, '../../');
const argroot = program['argroot'] ? program['argroot'] : '/data/app/game-server/dist/';
const cfgenv = program['cfgenv'] ? program['cfgenv'] : 'Royal';
const env = program['env'] ? program['env'] : 'production';
process.argv.push('cfgenv=' + cfgenv);

const masterApp = {
    "name": cfgenv + "-master",
    "cwd": argroot,
    "script": "app.js",
    "args": `cfgenv=${cfgenv} mode=stand-alone env=${env}`,
    "error_file": "/dev/null",
    "out_file": "/dev/null",
    "node_args": "--harmony",
    "exec_mode": "fork_mode"
};

let apps = [masterApp]

let servers = require('../../config/servers');
servers = servers[env];
if (!servers) {
    throw new Error(' no servers env ' + env);
}

let serverMap = {}, slist, i, l, server;
for (let serverType in servers) {
    slist = servers[serverType];
    for (i = 0, l = slist.length; i < l; i++) {
        server = slist[i];
        server.serverType = serverType;
        serverMap[server.id] = server;
    }
}
for (const sKey in serverMap) {
    server = serverMap[sKey];
    let cmd = 'env=' + env + ' ';
    let args = '';
    for (const key in server) {
        if (key === 'args') {
            args = server[key];
            continue;
        }
        cmd += util.format(' %s=%s ', key, server[key]);
    }
    //  console.log('cmd',sKey,cmd);
    serverMap[sKey] = {
        name: cfgenv + "-" + sKey,
        cwd: argroot,
        script: "app.js",
        args: cmd,
        error_file: "/dev/null",
        out_file: "/dev/null",
        node_args: " " + args,
        exec_mode: "fork_mode"
    };
    apps.push(serverMap[sKey]);
}

let generateType = 'auto'
let filename = '/pm2_' + env + '.json';
fs.writeFileSync(argroot + filename, JSON.stringify({ apps }, null, 4));
console.log('generate success', filename, apps.map(val => val.name));
