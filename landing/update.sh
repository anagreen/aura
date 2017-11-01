#!/usr/bin/env bash
set -x

dirs='assets scripts'
for dir in $dirs; do
  rsync -avh --delete ./dist/$dir/auracoins/ ../../squarespace/$dir/auracoins/
done

cp ./dist/index.html ../../squarespace/pages/auracoins.page
cp ./auracoins.page.conf ../../squarespace/pages/auracoins.page.conf
