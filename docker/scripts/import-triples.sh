#!/usr/bin/env bash

#default values
endpoint_url="http://localhost:7878/store"
input_file="dump.nt"
format_mime="application/n-triples"

function help {
    echo "Usage: $0 [-e endpoint-url] [-i input-file] [-f format-mime]"
    echo "  -e endpoint-url  The url of the endpoint to query. Default: http://localhost:7878/store"
    echo "  -i input-file    The file to read the triples from. Default: dump.nt"
    echo "  -f format-mime   The mime type of the input file. Default: application/n-triples"
    echo "  -h               Show this help message"
    exit 0
}

#parse options
while getopts "e:i:f:h" opt; do
    case ${opt} in
        e ) endpoint_url=$OPTARG;;
        i ) input_file=$OPTARG;;
        f ) format_mime=$OPTARG;;
        h ) help;;
        \? ) help;;
    esac
done

curl -f -X POST -H "Content-Type:${format_mime}" -T "${input_file}" "${endpoint_url}?default&no_transaction"