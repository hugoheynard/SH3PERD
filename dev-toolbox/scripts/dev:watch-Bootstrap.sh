npx concurrently \
  --raw \
  --prefix name \
  --prefix-colors yellow,green \
  -n BUILD,RUN \
  "bash -c '
    echo \"🧹 Cleaning...\"
    echo \"👀 Starting full TypeScript watch with project references...\"
    tsc -b --watch
  '" \
  "bash -c '
    echo \"[WAIT] Waiting for bootstrap build...\"
    npx wait-on dist/index.js
    tsx watch --clear-screen=false src/app.ts 2>&1 | while IFS= read -r line; do
      echo -e \"\033[0;32m[RUN]\\033[0m \$line\"
    done
  '"
