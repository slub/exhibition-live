## Die Verzeichnistruktur

```
.
├── apps # Komandozeilenanwendungen, Server und Frontends
│   ├── edb-api # API für die Ereignisdatenbank (SPARQL Implementierung)
│   ├── edb-cli # CLI für die Ereignisdatenbank
│   ├── edb-mongo-api # API für die Ereignisdatenbank (MongoDB Implementierung)
│   ├── edb-prisma-cli # CLI für die Ereignisdatenbank (Prisma Implementierung)
│   ├── edb-solr-cli # CLI für die Ereignisdatenbank (Solr Integration und export)
│   └── exhibition-live # Frontend für die Ausstellungsdatenbank
├── bun.lockb # Lockfile für den Build-Tool `bun` (npm replacement)
├── DEVELOPMENT.md # Diese Datei
├── docker  # Docker Compose um einen SPARQL Endpunkt zu starten (Oxigraph)
│   ├── docker-compose.yml
│   ├── nginx.config
│   ├── scripts # Scripts um Daten in den SPARQL Endpunkt zu laden und zu exportieren
├── docker-compose.yml # Docker Compose um eine Entwicklungsumgebung zu starten
├── Dockerfile
├── Dockerfile.develop
├── flake.lock # Lockfile für die Nix Flake
├── flake.nix # Nix Flake für eine reproduzierbare Entwicklungsumgebung
├── LICENSE
├── manifestation
│   ├── exhibition # Konfigurationen und Schemata für die Ausstellungsdatenbank
│   └── musiconn # Konfigurationen und Schemata für die Aufführungsdatenbank
├── package.json
├── packages # Wiederverwendbare Bibliotheken (NPM-Pakete)
│   ├── build-helper # Hilfsfunktionen für den Build-Prozess
│   ├── core-types # Typdefinitionen für die Ereignisdatenbank, die keine externen Abhängigkeiten haben dürfen
│   ├── core-utils # Hilfsfunktionen für die Ereignisdatenbank
│   ├── debug-utils # Komponenten für die Debugging-Unterstützung
│   ├── eslint-config-edb # ESLint-Konfiguration für die Ereignisdatenbank
│   ├── form # Formularkomponenten
│   ├── form-renderer # Formular-Renderer
│   ├── global-types # Globale Typdefinitionen, welche in mehreren Paketen verwendet werden und die Abhängigkeiten haben dürfen
│   ├── graph-traversal # Graphtraversierungsfunktionen
│   ├── ideas # Ideen und Konzepte, welche noch nicht in die Ereignisdatenbank integriert sind
│   ├── json-schema-prisma-utils # Hilfsfunktionen für die JSON-Schema-Prisma-Integration
│   ├── json-schema-utils # allgemeine Hilfsfunktionen für Umgang mit JSON-Schema
│   ├── kxp-utils
│   ├── marc-to-rdf # MARC21 nach RDF Konverter
│   ├── prisma-db-impl # Prisma-Implementierung der Ereignisdatenbank
│   ├── remote-query # CRUD Remote Query Implementationen, welche die Unterschiede einzelner SPARQL Implementierungen abstrahiert
│   ├── sparql-db-impl # SPARQL-Implementierung der Ereignisdatenbank
│   ├── sparql-schema # JSON-Schema zu SPARQL Query Konverter
│   ├── state-hooks # React Hooks für das Statement-Management (Zustand, Redux und Provider)
│   ├── tsconfig # TypeScript-Konfigurationen für die Pakete und Anwendungen
│   ├── tsup-config # tsup-Konfigurationen für die Pakete und Anwendungen
│   └── ui-utils # Hilfsfunktionen, die nur das Frontend betreffen
├── README.md
├── turbo.json # Turbo-Config für den Build-Prozess und die Verwaltung des Monorepos
└── typedoc.json # Typedoc-Konfiguration für die Dokumentation
```
