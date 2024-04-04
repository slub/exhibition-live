#/usr/bin/env bash

# Input file containing your documents, one per line in NDJSON format
INPUT_FILE="Exhibition.json"
# Output file that will be generated, ready for bulk import
OUTPUT_FILE="Exhibition.ndjson"
# Elasticsearch index name
INDEX_NAME="exhibition"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Input file does not exist: $INPUT_FILE"
    exit 1
fi

# Create or overwrite the output file
> "$OUTPUT_FILE"

# Initialize document ID
doc_id=1

# Read each line from the input file and add index action with ID
while IFS= read -r line; do
    # Print the index action line with document ID to the output file
    echo "{\"index\":{\"_index\":\"$INDEX_NAME\", \"_id\":\"$doc_id\"}}" >> "$OUTPUT_FILE"
    # Print the original JSON document to the output file
    echo "$line" >> "$OUTPUT_FILE"
    # Increment the document ID
    ((doc_id++))
done < "$INPUT_FILE"

echo "Finished preparing $OUTPUT_FILE for bulk import."
