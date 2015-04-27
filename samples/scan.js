browser = require('../index');
browser.browser({
    test: true,
    poll: 0
}, function(error, d) {
    if (error) {
        console.log("#", error);
    } else if (d) {
        console.log(d);
    } else {
    }
});
