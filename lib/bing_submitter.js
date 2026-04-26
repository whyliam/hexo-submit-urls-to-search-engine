var pathFn = require('path');
var cjhreadline = require('./cjhreadline');
var request = require('request');

module.exports = function (args) {
    var log = this.log;
    var config = this.config;
    var bing = config.hexo_submit_urls_to_search_engine.bing;
    if (bing == 1) {
        var urlsPath = config.hexo_submit_urls_to_search_engine.txt_path;
        var host = config.hexo_submit_urls_to_search_engine.bing_host;
        var token = config.hexo_submit_urls_to_search_engine.bing_token;
        var enableIndexNow = config.hexo_submit_urls_to_search_engine.bing_enable_indexnow;
        if (token == 0) {
            token = process.env.BING_TOKEN;
        }
        var publicDir = this.public_dir;
        var UrlsFile = pathFn.join(publicDir, urlsPath);
        cjhreadline.readFileToArr(UrlsFile, function (data, err) {
            if (err) {
                log.error("Failed to read bing urls file: " + err.message);
                return;
            }
            if (data.length === 0) {
                log.info("No bing urls to submit");
                return;
            }
            if (enableIndexNow) {
                log.info("Submitting bing urls by Bing IndexNow API \n");
                var urlList = [];
                for (let i = 0; i < data.length; ++i) {
                    log.info("Bing Submitting: " + data[i]);
                    urlList.push(data[i]);
                }
                var targetHost;
                try {
                    targetHost = new URL(urlList[0]).host;
                } catch (err) {
                    log.error("Invalid bing url: " + urlList[0]);
                    return;
                }
                var options = {
                    uri: 'https://bing.com/IndexNow',
                    method: 'POST',
                    json: {
                        "host": targetHost,
                        "key": token,
                        "keyLocation": host.replace(/\/$/, '') + "/" + token + ".txt",
                        "urlList": urlList,
                    }
                };
                request(options, function (error, response, body) {
                    if (error) {
                        log.error("Bing request failed: " + error.message);
                        return;
                    }
                    console.log("Bing response: ", {
                        statusCode: response.statusCode,
                    });
                });
            } else {
                log.info("Submitting bing urls \n");
                for (let i = 0; i < data.length; ++i) {
                    log.info("Bing Submitting: " + data[i]);


                    var options = {
                        uri: 'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=' + token,
                        method: 'POST',
                        json: {
                            "siteUrl": host,
                            "url": data[i]
                        }
                    };

                    request(options, function (error, response, body) {
                        if (error) {
                            log.error("Bing request failed: " + error.message);
                            return;
                        }
                        console.log("Bing response: ", {
                            statusCode: response.statusCode,
                        });
                    });
                }
            }

        });
    } else {
        console.log("Bing submit: off ");
    }
};
