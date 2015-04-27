ip = require('ip')
os = require('os')

var generator = function(paramd, callback) {

    niss = os.networkInterfaces();
    for (var nisi in niss) {
        var nis = niss[nisi];
        for (var nii in nis) {
            var ni = nis[nii];
            if (ni.internal) {
                continue;
            } else if (ni.family !== "IPv4") {
                continue;
            }

            if (paramd.restrict && !ip.isEqual(paramd.restrict, ni.address)) {
                continue;
            }

            var subnet = ip.subnet(ni.address, ni.netmask);
            var first_long = ip.toLong(subnet.firstAddress);
            for (var i = 0; (i < subnet.numHosts) && (i < paramd.max_hosts); i++) {
                var current_long = first_long + i;
                var current_ip = ip.fromLong(current_long)

                callback(null, current_ip, ni, subnet);
            }
        }
    }

    callback(null, null, null, null);
}

/*
 *  API
 */
exports.generator = generator;
