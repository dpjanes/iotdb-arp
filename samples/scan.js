browser = require('../index');
browser.browser({
    verbose: true,
    poll: 0
}, function(error, d) {
    if (error) {
        console.log("#", error);
    } else if (d) {
        console.log(d);
    } else {
    }
});
