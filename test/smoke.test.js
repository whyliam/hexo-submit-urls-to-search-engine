var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');

var generator = require('../lib/generator');
var cjhreadline = require('../lib/cjhreadline');

function createHexoContext(overrides) {
    return {
        log: {
            info: function () {},
            error: function () {}
        },
        config: {
            hexo_submit_urls_to_search_engine: Object.assign({
                submit_condition: 'count',
                count: 2,
                period: 900,
                txt_path: 'submit_urls.txt',
                replace: 0,
                find_what: '',
                replace_with: ''
            }, overrides || {})
        }
    };
}

function createLocals(posts) {
    return {
        posts: {
            toArray: function () {
                return posts;
            }
        }
    };
}

function testGeneratorCountMode() {
    var result = generator.call(createHexoContext(), createLocals([
        {date: new Date('2024-01-01'), permalink: 'https://example.com/a/'},
        {date: new Date('2024-01-03'), permalink: 'https://example.com/c/'},
        {date: new Date('2024-01-02'), permalink: 'https://example.com/b/'}
    ]));

    assert.strictEqual(result.path, 'submit_urls.txt');
    assert.strictEqual(result.data, 'https://example.com/c/\nhttps://example.com/b/');
}

function testGeneratorReplacement() {
    var result = generator.call(createHexoContext({
        count: 1,
        replace: 1,
        find_what: 'http://old.example.com',
        replace_with: 'https://new.example.com'
    }), createLocals([
        {date: new Date('2024-01-01'), permalink: 'http://old.example.com/post/'}
    ]));

    assert.strictEqual(result.data, 'https://new.example.com/post/');
}

function readFileToArr(filePath) {
    return new Promise(function (resolve, reject) {
        cjhreadline.readFileToArr(filePath, function (data, err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function readMissingFile(filePath) {
    return new Promise(function (resolve) {
        cjhreadline.readFileToArr(filePath, function (data, err) {
            resolve({data: data, err: err});
        });
    });
}

async function testReadFileToArr() {
    var tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-submit-test-'));
    var filePath = path.join(tmpDir, 'urls.txt');
    fs.writeFileSync(filePath, 'https://example.com/a/\n\nhttps://example.com/b/\n', 'utf8');

    var data = await readFileToArr(filePath);
    assert.deepStrictEqual(data, [
        'https://example.com/a/',
        'https://example.com/b/'
    ]);
}

async function testReadFileError() {
    var result = await readMissingFile(path.join(os.tmpdir(), 'hexo-submit-missing-file.txt'));
    assert.deepStrictEqual(result.data, []);
    assert(result.err instanceof Error);
}

async function main() {
    testGeneratorCountMode();
    testGeneratorReplacement();
    await testReadFileToArr();
    await testReadFileError();
}

main().catch(function (err) {
    console.error(err);
    process.exit(1);
});
