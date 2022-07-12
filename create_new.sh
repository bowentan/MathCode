#! /bin/bash
type=$1
category=$2
title=$3

d=""
if [ "$type" == "posts" ]; then
    d=$(date +"%Y-%m-%d")
    d=$(echo "$d-")
fi
title=$(echo "$title" | tr "[:upper:]" "[:lower:]" | sed 's/ /-/g')
filename=$(echo "$d$title.md")

touch _$category/_posts/$filename