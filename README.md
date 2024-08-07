The adb-next project is an exhibition-catalog, that uses [Next.js](https://nextjs.org/).

# Documentation

## Exhibition Catalog Live

A live demo of the exhibition catalog is available here: [https://slub.github.io/exhibition-live/](https://slub.github.io/exhibition-live/)

You might want to set your own storage backend(s) within the settings modal.

## Development Documentation

Please have a look at the **[Storybook of the EDB Framework](https://slub.github.io/exhibition-live/storybook/)** for an indepth documentation of the frontend components, th cli
and the overall architecture of the exhibition catalog and the EDB framework.

# Development

## Getting Started

For a quick start install all dependencies initially build the packages and start the development server of the nextjs exhibition-live application.

```bash
bun i && bun build:packages && bun run dev:exhibition
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Committing and Contributing

### Formatter

please only commit linted and formatted code by using husky

```bash
bun run prepare
```

## Storage Endpoints

The project can operate on a variety of storage endpoints. The default is a temporary in memory DB within the browser,
which is sufficient for testing purposes. The application can also be configured to use any SPARQL 1.1 endpoint.
Either provide an initial config or use the settings modal within the application to configure the endpoints.

You can quickly launch an Oxigraph SPARQL 1.1 endpoint with docker:

```bash
docker run -p 7878:7878 -v $(pwd)/data:/data -it ghcr.io/oxigraph/oxigraph:latest
```

Consult the [Oxigraph GitHub repository](https://github.com/oxigraph/oxigraph) for further information.

### Other SPARQL 1.1 endpoints

Other SPARQL Endpoints, like Jena Fuseki, Virtuoso, Blazegraph or GraphDB can be used as well.
Additional effort might be needed to configure CORS and authentication and to get along with some
Endpoints not beeing fully SPARQL 1.1 compliant.

### Endpoint Configuration

The configuration of endpoints within the `exhibition-live` application can either be done dynamically at runtime using
the settings modal or by providing a `SPARQL_ENDPOINT` environment variable at build time, which disables setting the endpoint
within the modal and is especially suitable for production deployments, where one wants to make sure all users operate on the same endpoint.

## Storybook

This project uses [Storybooks](https://storybook.js.org/) to enforce reusable component based development and to document them with
all of their props and options. It also gives an overview over the frontend components used for this project.

```bash
cd app/exhibition-live
bun i && bun run storybook
```

Open [http://localhost:6006](http://localhost:6006) with your browser to see the storybook.

## Testing

Unit tests of core functionality is done by `jest`. For integration tests of the frontend `Cypress` is being used.

### Trouble Shooting

Cypress under Nix:
it might be necessary to delete `~/.cache/Cypress`

```
rm -rf ~/.cache/Cypress
```

## Using Docker

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine.
1. Build your container: `docker build -t exhibition-docker .`.
1. Run your container: `docker run -p 3000:3000 exhibition-docker`.

### develop within docker

1. `docker compose up -d`
2. `docker compose  exec exhibition-live /bin/bash`

## Technologies

### NextJS

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
  You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### @rdfjs and SPARQL related packages

The project uses the [RDFJS](https://rdf.js.org/) stack for RDF processing.This choice does also offer the
ability to use the same code for both the browser and the server. The project uses the following packages:

Some of the following libraries are being used within this project:

- @rdfjs/parser-n3 for RDF parsing and serialisation of turtle and ntriples
- @rdfjs/parser-jsonld for RDF parsing and serialisation of JSON-LD
- @rdfjs/dataset as a temporary in memory RDF store
- oxigraph for SPARQL 1.1 compliant RDF storage within a ServiceWorker (browser) or on the server
- RDF/JS for RDF processing
- @tpluscode/rdfine for common RDF Vocabularies and typesafe namespaces
- SPARQL.js for SPARQL query generation
- sparql-http-client for SPARQL compliant query execution and easier triple streaming
- clownface for RDF graph traversal
- openAI for optional AI based data mapping from unknown sources (complementary to manual declaration based mapping)

### LinkML

LinkML was used for the initial data schemata and schema-conversion. Nevertheless the single source of truth for the data schemata
is the JSON Schema located within the public directory.

The main schema is located within the `schema/exhibition-info.yml` directory

### JSON Schema

The JSON Schema ist the basis for:

- Form generation
- Form validation
- Data conversion
- Query generation
- Document extraction
- Ontology generation and Semantic-Mapping

Alongside the core Exhibition Schema, there are complementary declaration files referring to elements from the core schema,
that provide additional information for the frontend, like:

- the UI-Schemata for form layout and style hints
- data mapping declarations for data conversion from and to norm data repositories

# Helpful Commands

Complete rebuild without cache:

```
docker compose down
docker compose rm -f
docker compose pull
docker compose up --build -d
```

Deletes all images, reloads all images from repository, starts all images with building in daemon-mode, may add `docker compose logs -f` for output in following mode.
