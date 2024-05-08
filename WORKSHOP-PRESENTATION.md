---
title: SLUB Ereignisdatenbank Workshop
type: slide
tags: presentation
slideOptions:
  theme: simple
  transition: "fade"
---

## Workshop Ereignisdatenbanken

12.Mai 2024
Sebastian Tilsch
SLUB - sächsische Staats- und Universitätsbibliothek
www.slub-dresden.de

---

## Ziel

- Verständnis für das Ereignisdatenbank Framework entwickeln
- Entwiclung weiterer Fachdatenbank ermöglichen

---

## Aufbau

- Grundlagenvermittlung
- Frontend-Architektur
- Backendkommunikation/Datenbank

---

## Grundlagen

### Frameworks

React, typescript, Next.JS

### Statemanagement

Zustand, Hooks, Redux

### Kommunikation

React-Query, SPARQL, Backend

---

## Grundlagen

### Bundling, CI, Version

NPM-Pakete, turbo, esbuild, Packaging

### Testing

jest, Cypress

### Dokumentation

Storybooks, Schema-Dokumentation

---

## Das `exhibition-live` Mono Repo

```
.
├── apps # Komandozeilenanwendungen, Server und Frontends
├── bun.lockb # Lockfile für das Build-Tool `bun` (npm replacement)
├── DEVELOPMENT.md # Diese Datei
├── docker  # Docker Compose um einen SPARQL Endpunkt zu starten (Oxigraph)
│   ├── docker-compose.yml
│   ├── nginx.config
│   ├── scripts # Skripte um Daten in den SPARQL Endpunkt zu laden und zu exportieren
├── docker-compose.yml # Docker Compose um eine Entwicklungsumgebung zu starten
├── Dockerfile
├── Dockerfile.develop
├── flake.lock # Lockfile für die Nix Flake
├── flake.nix # Nix Flake für eine reproduzierbare Entwicklungsumgebung
├── LICENSE
├── manifestation
├── package.json
├── packages # Wiederverwendbare Bibliotheken (NPM-Pakete)
├── README.md
├── turbo.json # Turbo-Config für den Build-Prozess und die Verwaltung des Monorepos
└── typedoc.json # Typedoc-Konfiguration für die Dokumentation
```

---

### Apps

```
.
├── apps # Komandozeilenanwendungen, Server und Frontends
│   ├── edb-api # API für die Ereignisdatenbank (SPARQL Implementierung)
│   ├── edb-cli # CLI für die Ereignisdatenbank
│   ├── edb-mongo-api # API für die Ereignisdatenbank (MongoDB Implementierung)
│   ├── edb-prisma-cli # CLI für die Ereignisdatenbank (Prisma Implementierung)
│   ├── edb-solr-cli # CLI für die Ereignisdatenbank (Solr Integration und export)
│   └── exhibition-live # Frontend für die Ausstellungsdatenbank
```

---

### Packages

```
.
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

```

---

# Grundlagen Typescript

jedes JavaScript Programm ist auch valides TypeScript

Typen bringen Laufzeitsicherheit, da viele Fehler bereits zur Compile Zeit abgefangen werden

Typescript ≠ OOP !

---

# Typescript Compiler

Typescript wird zu JavaScript transpiliert. Typen sind zur Laufzeit nicht mehr vorhanden.

Ein einfacher Transpiler ist `tsc` (Typescript Compiler)

Komplexere Setups nutzen Build-Tools wie `esbuild` oder `webpack` für weitere Optimierungen
wie Tree-Shaking, Code-Splitting, Minification, etc.

---

# Types und Interfaces

| Feature                 | Interface                                                                                                             | Type                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Declaration Merging** | Unterstützt Merging, wodurch mehrere Deklarationen kombiniert werden können.                                          | Unterstützt kein Merging; eine erneute Deklaration führt zu einem Fehler.                         |
| **Erweiterbarkeit**     | Kann mit dem Schlüsselwort `extends` um andere Schnittstellen erweitert werden.                                       | Kann nicht direkt erweitert werden; verwendet Überschneidungen (Unions), um Typen zu kombinieren. |
| **Fähigkeiten**         | Am besten geeignet für die Definition der Formen von Objekten und ihrer Beziehungen in einem objektorientierten Stil. | Vielseitiger, fähig zur Darstellung von Unions, Tupeln und primitiven Typen.                      |
| **Syntax**              | Im Allgemeinen einfacher für die Definition traditioneller Objektstrukturen.                                          | Bietet mehr Flexibilität bei der Definition und Kombination von Typen.                            |
| **Anwendungsfall**      | Ideal für objektorientierte Programmiermuster, bei denen eine Erweiterung der Objektstrukturen erforderlich ist.      | Bevorzugt für komplexe Typmanipulationen und wenn die Kombination von Typen erforderlich ist.     |

---

# Ereignisdatenbank
