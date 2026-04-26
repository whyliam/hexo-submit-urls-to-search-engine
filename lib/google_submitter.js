var request = require("request");
var cjhreadline = require('./cjhreadline');
var pathFn = require('path');

module.exports = function (args) {

    var log = this.log;
    var config = this.config;
    var googleswitch = config.hexo_submit_urls_to_search_engine.google;
    if (googleswitch == 1) {
        var {google} = require("googleapis");
        var cjh_google_proxy = config.hexo_submit_urls_to_search_engine.google_proxy;
        if (cjh_google_proxy != 0) {
            google.options({proxy: cjh_google_proxy});
            process.env.HTTPS_PROXY = cjh_google_proxy;
            process.env.HTTP_PROXY = cjh_google_proxy;
        }
        var urlsPath = config.hexo_submit_urls_to_search_engine.txt_path;
        var google_key_file = config.hexo_submit_urls_to_search_engine.google_key_file;
        var rootDir = this.base_dir;
        var google_key = pathFn.join(rootDir, google_key_file);

        var key = require(google_key);

        var publicDir = this.public_dir;
        var UrlsFile = pathFn.join(publicDir, urlsPath);
        cjhreadline.readFileToArr(UrlsFile, function (data, err) {
            if (err) {
                log.error("Failed to read google urls file: " + err.message);
                return;
            }
            if (data.length === 0) {
                log.info("No google urls to submit");
                return;
            }

            log.info("Submitting google urls \n");
            const jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                ["https://www.googleapis.com/auth/indexing"],
                null
            );

            jwtClient.authorize(function (err, tokens) {
                if (err) {
                    log.error(err);
                    return;
                }

                for (let i = 0; i < data.length; ++i) {
                    log.info("Google Submitting: " + data[i]);
                    var options = {
                        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        auth: {"bearer": tokens.access_token},
                        json: {
                            "url": data[i],
                            "type": "URL_UPDATED"
                        }
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            log.error("Google request failed: " + error.message);
                            return;
                        }
                        console.log("Google response: ", body);
                    });
                }
            });
        });
    } else {
        console.log("google submit: off ");
    }
};
