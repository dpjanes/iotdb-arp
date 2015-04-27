/*
 *  lib/scan.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-27
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

var net = require('net')

var flood = function(paramd, done) {
    paramd.max = paramd.max || 64;
    paramd.timeout = 2500;
    paramd.port = 1;

    var start_ms = (new Date()).getTime();

    var ip_parts = paramd.ip.split(".");
    if (ip_parts.length !== 4) {
        return done("need XXX.XXX.XXX.XXX type IP address");
    }

    var hosts = [];
    for (var i = 1; i < 255; i++) {
        ip_parts[3] = "" + i;
        
        hosts.push(ip_parts.join("."));
    }

    var log = function() {
        if (paramd.verbose) {
            console.log.apply(console.log, Array.prototype.slice.call(arguments));
        }
    }

    var connect = function(host, port, callback) {
        log("-", "CONNECT", host);
        var timer_id;
        var client = net.connect(1, host, function() {
            if (client) {
                log("-", "SUCCESS", host, port);
                client.destroy();
                callback(host, port);
            }

            if (timer_id) {
                clearTimeout(timer_id);
                timer_id = null;
            }
        });
        client.on('error', function() {
            if (client) {
                log("-", "FAIL", host, port);
                callback(host, port);
                client = null;
            }
            if (timer_id) {
                clearTimeout(timer_id);
                timer_id = null;
            }
        })

        timer_id = setTimeout(function() {
            if (client) {
                log("-", "TIMEOUT", host, port);
                callback(host, port);
                client.destroy();
            }
        }, paramd.timeout);
    }

    var actives = [];
    var finished = false;

    var scan = function() {
        log("-", "remaining", hosts.length, "active", actives.length);

        if (hosts.length === 0) {
            if (actives.length === 0) {
                log("-", "finished");
                log("-", "time", ((new Date()).getTime() - start_ms) / 1000.0);
                done(null);
            } else if (actives.length < 10) {
                log("-", "actives", actives);
            }

            return;
        }

        if (actives.length >= paramd.max) {
            log("-", "stalling");
            return;
        }

        var host = hosts.pop();
        actives.push(host);

        connect(host, paramd.port, function(host, port) {
            var index = actives.indexOf(host);
            if (index > -1) {
                actives.splice(index, 1);
            }

            scan();
        });

        scan();
    };

    scan();
}

/*
 *  API
 */
exports.flood = flood;
