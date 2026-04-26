# hexo-submit-urls-to-search-engine

Hexo deployer plugin for submitting recently updated post URLs to Google, Bing and Baidu, helping search engines discover new content sooner.

## Features

- Generate a URL list from the latest updated Hexo posts.
- Submit URLs to Google Indexing API.
- Submit URLs to Bing Webmaster API or Bing IndexNow.
- Submit URLs to Baidu URL Push API.
- Support Baidu and Bing tokens through environment variables.
- Support simple URL replacement before submission.

## Requirements

- Node.js and Hexo.
- A verified site in the target search engine webmaster platform.
- API credentials for the search engines you enable.

## Installation

```bash
npm install --save hexo-submit-urls-to-search-engine
```

or:

```bash
yarn add hexo-submit-urls-to-search-engine
```

## Configuration

Add the following configuration to your Hexo `_config.yml`.

```yaml
hexo_submit_urls_to_search_engine:
  # URL generation. Only "count" is currently supported.
  submit_condition: count
  count: 10
  period: 900

  # Enable or disable each search engine: 1 = enabled, 0 = disabled.
  google: 0
  bing: 1
  baidu: 1

  # Generated URL list path under Hexo public_dir.
  txt_path: submit_urls.txt

  # Baidu URL Push API.
  baidu_host: https://example.com
  baidu_token: 0

  # Bing Webmaster API or IndexNow.
  bing_host: https://example.com
  bing_enable_indexnow: false
  bing_token: 0

  # Google Indexing API.
  google_host: https://example.com
  google_key_file: google-key.json
  google_proxy: 0

  # Optional URL replacement before submitting.
  replace: 0
  find_what: http://example.com
  replace_with: https://example.com
```

Then add the deployers you want to use:

```yaml
deploy:
  - type: cjh_google_url_submitter
  - type: cjh_bing_url_submitter
  - type: cjh_baidu_url_submitter
```

You can remove deployers for search engines you do not use.

## Credentials

### Baidu

Set `baidu_host` to the site registered in Baidu Search Resource Platform.

Use either:

```yaml
baidu_token: your_baidu_token
```

or keep `baidu_token: 0` and provide:

```bash
export BAIDU_TOKEN=your_baidu_token
```

### Bing

Set `bing_host` to the site registered in Bing Webmaster Tools.

Use either:

```yaml
bing_token: your_bing_api_key
```

or keep `bing_token: 0` and provide:

```bash
export BING_TOKEN=your_bing_api_key
```

To use IndexNow, set:

```yaml
bing_enable_indexnow: true
```

When IndexNow is enabled, make sure the key file is accessible at:

```text
https://example.com/your_bing_api_key.txt
```

### Google

Set `google: 1` only after preparing a Google service account key for the Indexing API.

Place the JSON key file in the Hexo project root, the same directory as `_config.yml`, and set:

```yaml
google_key_file: google-key.json
```

If your network requires a proxy for Google APIs, set:

```yaml
google_proxy: http://127.0.0.1:7890
```

Keep credential files and tokens out of public repositories.

## Usage

Run the normal Hexo build and deploy flow:

```bash
hexo clean && hexo generate && hexo deploy
```

During `hexo generate`, the plugin writes the latest post URLs to `txt_path`.

During `hexo deploy`, the enabled deployers submit those URLs to the configured search engines.

## Notes

- `submit_condition: count` is the only supported mode at the moment.
- `period` is kept in the configuration for compatibility, but it is not implemented.
- `count` controls how many recently updated posts are submitted.
- If `replace: 1`, each generated permalink is processed with `find_what` and `replace_with`.
- Search engines may return success even when indexing still takes time. Submission is not an indexing guarantee.

## License

GPL-3.0-only
