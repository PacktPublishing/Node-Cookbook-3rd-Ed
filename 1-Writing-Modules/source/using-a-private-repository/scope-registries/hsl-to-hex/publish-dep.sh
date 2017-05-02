#! /bin/sh

# 400 - Missing hash and/or peer_id
# 403 - Not allowed
# 413 - Too big
# 200 - Ok!


if echo $npm_config_argv | grep -q "install"; then
  echo "Running at install step, skipping"
else
  if ipfs &>/dev/null; then
    echo "## Publishing dependency"

    mv node_modules .node_modules 2>/dev/null

    HASH=$(ipfs add . -r | tail -n 1 | cut -d ' ' -f 2)

    mv .node_modules node_modules 2>/dev/null

    echo "Published as $HASH"

    PEER=$(ipfs id --format '<id>')

    if [ -f ~/.stay/nodes.json ]; then
      cat ~/.stay/nodes.json | jq -rc '.[]' | while read host; do
        address="$host/api/pin/add/$HASH/$PEER"
        status=$(curl -X POST --silent $address)
        case "$status" in
          "400")  echo "$host - Application Error: Missing the hash and/or peer_id"
            ;;
          "403")  echo  "$host - You do not have access to pinning at this node"
            ;;
          "413")  echo  "$host - The module was too big to pin!"
            ;;
          "200") echo  "$host - Pinned!"
            ;;
          *) echo "Weird status code $status for $host"
            ;;
        esac
      done
    else
      echo "You don't have any saved nodes in ~/.stay/nodes.json, skip pinning"
    fi
  else
    echo "## Could not publish dependency to IPFS, doing the good'ol 'fetch from npm registry' way"
    echo "Either 'ipfs' doesn't exists in PATH or you haven't run 'ipfs daemon' before running the command"
    exit 0
  fi
fi
