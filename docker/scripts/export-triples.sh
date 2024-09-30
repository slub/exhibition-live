#!/usr/bin/env bash

#default values
endpoint_url="http://localhost:7878/query"
output_file="dump.nt"
format_mime="application/n-triples"

function help {
    echo "Usage: $0 [-e endpoint-url] [-o output-file]"
    echo "  -e endpoint-url  The url of the endpoint to query. Default: http://localhost:7878/query"
    echo "  -o output-file   The file to write the triples to. Default: dump.nt"
    echo "  -f format-mime   The mime type of the output file. Default: application/n-triples"
    echo "  -d default-prefix   The default prefix to use in the query. Default: http://example.org/"
    echo "  -h               Show this help message"
    exit 0
}

#parse options
while getopts "e:o:f:d:h" opt; do
    case ${opt} in
        e ) endpoint_url=$OPTARG;;
        o ) output_file=$OPTARG;;
        f ) format_mime=$OPTARG;;
        d ) default_prefix=$OPTARG;;
        h ) help;;
        \? ) help;;
    esac
done

prefixes=""

if [ -n "$default_prefix" ]; then
    prefixes="PREFIX : <$default_prefix>"
fi

curl "${endpoint_url}" \
  -H "Accept: ${format_mime},*/*;q=0.9" \
  -H 'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --verbose \
  --data-urlencode "query=${prefixes} CONSTRUCT { ?sub ?pred ?obj . } WHERE { ?sub ?pred ?obj .}" \
  --compressed \
  --output ${output_file}
