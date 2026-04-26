var fs = require('fs');
var readline = require('readline');

function readFileToArr(fReadName, callback) {
    var done = false;
    function finish(data, err) {
        if (done) {
            return;
        }
        done = true;
        callback(data, err);
    }

    var fRead = fs.createReadStream(fReadName, 'utf8');
    fRead.on('error', function (err) {
        finish([], err);
    });

    var objReadline = readline.createInterface({
        input: fRead
    });
    objReadline.on('error', function (err) {
        finish([], err);
    });

    var arr = [];
    objReadline.on('line', function (line) {
        if (line) {
            arr.push(line);
        }
    });
    objReadline.on('close', function () {
        finish(arr);
    });
}

module.exports = {
    readFileToArr
};
