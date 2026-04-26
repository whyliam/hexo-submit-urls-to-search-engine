var fs = require('fs');
var readline = require('readline');

function readFileToArr(fReadName, callback) {
    var hasError = false;
    var fRead = fs.createReadStream(fReadName, 'utf8');
    fRead.on('error', function (err) {
        hasError = true;
        callback([], err);
    });

    var objReadline = readline.createInterface({
        input: fRead
    });
    var arr = [];
    objReadline.on('line', function (line) {
        if (line) {
            arr.push(line);
        }
    });
    objReadline.on('close', function () {
        if (hasError) {
            return;
        }
        callback(arr);
    });
}

module.exports = {
    readFileToArr
};
