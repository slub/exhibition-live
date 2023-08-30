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
    echo "  -h               Show this help message"
    exit 0
}

#parse options
while getopts "e:o:h" opt; do
    case ${opt} in
        e ) endpoint_url=$OPTARG;;
        o ) output_file=$OPTARG;;
        f ) format_mime=$OPTARG;;
        h ) help;;
        \? ) help;;
    esac
done


curl "${endpoint_url}" \
  -H 'Accept: ${format_mime},*/*;q=0.9' \
  -H 'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw 'query=CONSTRUCT%20%7B%20%3Fsub%20%3Fpred%20%3Fobj%20.%20%7D%20WHERE%20%7B%0A%20%20%3Fsub%20%3Fpred%20%3Fobj%20.%0A%7D' \
  --compressed \
  --output ${output_file}
