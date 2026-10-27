#!/bin/bash
# usage: build-site.sh <repository-copy>   builds <copy>/_site with the github-pages 232 gem set in ruby:3.3; needs Docker and network
B=${1:?repository copy}
docker run --rm -v "$B":/site -e PAGES_REPO_NWO=iamcxa/kc-paseo-plugins -e JEKYLL_ENV=production -w /site ruby:3.3 bash -c 'bundle config set path /site/vendor/bundle >/dev/null && bundle install --quiet 2>&1 | tail -3 && bundle exec jekyll build --baseurl /kc-paseo-plugins 2>&1 | tail -25'
