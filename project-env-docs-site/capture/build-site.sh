#!/bin/bash
# build the throwaway copy with the GitHub Pages gem set (github-pages 232, Ruby 3.3, as pages.github.com/versions.json lists on 2026-10-27)
B=${1:-/tmp/docs-site-build}
docker run --rm -v "$B":/site -e PAGES_REPO_NWO=iamcxa/kc-paseo-plugins -e JEKYLL_ENV=production -w /site ruby:3.3 bash -c 'bundle config set path /site/vendor/bundle >/dev/null && bundle install --quiet 2>&1 | tail -3 && bundle exec jekyll build --baseurl /kc-paseo-plugins 2>&1 | tail -25'
