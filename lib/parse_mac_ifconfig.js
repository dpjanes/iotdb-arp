/*
 *  lib/parse.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-16
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var path = require('path');
var ip = require('ip');
var scan = require('./scan');

var partial = "";
var collectd = {};

/**
 *  Call me when starting
 */
var started = function () {
    partial = "";
    collectd = {};
};

/**
 *  Call with a line of data
 */
var line = function (line, callback) {
    if (line.match(/^[a-z]/)) {
        _emit(callback);
    }

    
    var interface_match = line.match(/^([a-z][a-z0-9]+):.*<([^>]*)>/)
    if (interface_match) {
        _emit(callback);

        collectd.interface = interface_match[1];
        collectd.flags = interface_match[2].split(",");

        return;
    }

    var data_match = line.match(/^\s*([a-z0-9]+ .*)$/)
    if (!data_match) {
        return;
    }

    var parts = data_match[1].split(" ");
    for (var pi = 0; pi < (parts.length & 0xFE); pi += 2) {
        var key = parts[pi];
        var value = parts[pi + 1];
        if (!collectd[key]) {
            collectd[key] = value;
        }
    }
};

/**
 *  Call with a complete buffer of data
 */
var buffer = function(chunk, callback) {
    var lines = (partial + chunk).split("\n");
    for (var li = 0; li < lines.length - 1; li++) {
        line(lines[li], callback);
    }

    partial = lines[li];
}

/**
 *  Call me when you expect no more data
 */
var finished = function (callback) {
    _emit(callback);
};

/**
 */
var _emit = function(callback) {
    if (Object.keys(collectd).length) {
        callback(null, collectd);
        collectd = {};
    }
}

/**
 *  In particular, callback
 */
var range = function(paramd, callback) {
    var ranged = null;

    var scand = {
        command: "ifconfig",
        av: [ "-a" ],
        started: started,
        line: line,
        buffer: buffer,
        finished: finished,
    }
    
    scan.scan(scand, function(error, d) {
        if (d === null) {
            if (!ranged) {
                callback("no range could be discovered", null);
            } else {
                callback(null, ranged);
            }
            return;
        }

        if (ranged) {
            return;
        }

        if (!d.interface.match(/^en/)) {
            return;
        }

        if (!d.inet || !d.netmask) {
            return;
        }

        var mask = ip.fromLong(d.netmask);
        var subnet = ip.subnet(d.inet, mask);

        var first = subnet.firstAddress.split(".");
        var last = subnet.lastAddress.split(".");

        d.range = [ first[0], first[1], first[2], first[3] + "-" + last[3], ].join(".");
        ranged = d;
    });
};

/**
 *  API
 */
exports.range = range;

exports.started = started;
exports.line = line;
exports.buffer = buffer;
exports.finished = finished;

exports.test = path.join(__dirname, "..", "data", "macosx", "ifconfig.data");
