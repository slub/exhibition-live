---
title: SLUB Ereignisdatenbank Workshop
type: slide
tags: presentation
slideOptions:
  theme: simple
  transition: "fade"
  # https://hedgedoc.c3d2.de/p/workshop-ereignisdatenbank_2024#/
---

## Workshop Ereignisdatenbanken

13.Mai 2024
Sebastian Tilsch
SLUB - sächsische Staats- und Universitätsbibliothek
www.slub-dresden.de

---

## Ziel

- Verständnis für das Ereignisdatenbank Framework entwickeln
- Entwicklung weiterer Fachdatenbank ermöglichen

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

```bash
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

```bash
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

```bash
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

Die Ereignisdatenbank gliedert sich in ein mehrschichtiges Komponentenbasiertes Frontendbuilding System ein. Dabei stellt den Anfangspunkt das Datenschema in Form
eines LinkML- bzw. JSON-Schemas dar. Um dieses Schema herum fügen sich deklarativ die Komponenten und Mapper zusammen, um eine dynamische und flexible Oberfläche zu schaffen.

Es gibt Deklarationen für

- Formulare
- Norm-Datenmappings
- Import-Mappings
- Tabellen- und Listenansichten (Spalten, Filter, Sortierung)
- Detailansichten

---

# Backendkommunikation

Die Ereignisdatenbank kann mit verschiedenen Backend-Implementierungen betrieben werden. Die SPARQL-Implementierung ist die Referenzimplementierung und kommt
mit einem Datenbankserver aus - braucht also keine API. Die Prisma-Implementierung ist eine Implementierung, die auf einer relationalen Datenbank aufbaut. Wir wollen uns zunächst
auf die SPARQL-Implementierung konzentrieren.

---

## Pakete

- Pakete mit reiner Business-Logik und Typdefinitionen können in Node.js und Browser-Umgebungen verwendet werden
- React und MUI - Komponenten für die Oberfläche liegen in Form von
  teils unabhängigen, teils aufeinander aufbauenden NPM-Paketen vor.
- bisher nicht in einer Paket-Registry veröffentlicht
- können in Applikationen und anderen Paketen zu den `dependencies` hinzugefügt werden

---

Lokale Pakete können in Projekten in die `package.json` hinzugefügt werden:

```json
{
  "dependencies": {
    "@slub/sparql-schema": "workspace:*",
    "@slub/sparql-db-impl": "workspace:*",
    "@slub/edb-ui-utils": "workspace:*"
  }
}
```

Diese Workspace-Abhängigkeiten werden dann von `bun` automatisch aufgelöst und über `turbo` in den Build-Prozess eingebunden.

---

# Zur Verwendung von Next.JS

Die React-Komponenten können in verschiedenen Frontend-Frameworks verwendet werden. Die Ereignisdatenbank verwendet Next.JS als Frontend-Framework. Next.JS ist ein React-Framework, das
Server-Side-Rendering und Static-Site-Generation unterstützt. Es ist sehr flexibel und kann auch als reines Single-Page-Application-Framework verwendet werden.

---

# Die manuelle Dateneingabe

Formulare sind die erste Säule der CRUD-Architektur, um Daten händisch, aber unterstützt durch Normdaten einzugeben. Das Ereignisdatenframework kann
für alle Entitäten bzw. Klassen des Schemas optional gestützt durch Forumlar-zentrierten UI-Schemata , Formulare generieren. Schema, UI-Schema und die in der Applikation
eingegebundenen Renderer bilden die Informationsbasis dafür,
wie die einzelnen Attribute der Entität in der Erfassungsmaske dargestellt werden sollen. Es ist jedoch nicht notwendig alles bis ins kleinste zu beschreiben. Auch gänzlich
ohne UI-Schema wird bereits ein ready-to-use Formular generiert. Das JSON-Forms eigene Konzept der `Raks` und `Renderer` ermöglicht es sehr allgemeine bis hin zu hochspezialisierte
Formulareinheiten (Eingabefelder,...) darzustellen.

---

# Renderer

Ein Renderer ist eine Komponente, die ein Formularfeld darstellt. Dabei kann ein Renderer ein einfaches Textfeld sein, oder auch ein komplexes Formularfeld, wie eine
Straßenkarte oder eine Datumseingabe. Mithilfe eines `tester` wird ein Rang ermittelt auf Basis aller zur Laufzeit zur Verfügung stehenden Informationen aus dem Schema,
den bereits eingegebenen Daten und den UI-Schema Konfigurationen. Dieser Rang wird dann genutzt um den besten Renderer für das aktuelle Formularfeld zu ermitteln.

Ähnlich wie bei CSS wird dabei das spezifischste Renderer-Element gewählt, welches die Anforderungen des Formularfeldes am besten erfüllt.
Möchte man einen bestimmten Renderer enforcen, so muss man lediglich auf eine eindeutige zuordnung und einen innerhalb der Applikation wahrscheinlichen hohen Rang setzen.

---

## Beispiel

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "age": {
      "type": "integer",
      "title": "Age"
    }
  }
}
```

---

Um einen Renderer für das Feld `age` zu erstellen können wir Folgende Komponente kreieren:

```tsx:
const AgeRendererComponent = ({
  data,
  id,
  enabled,
  handleChange,
  errors,
  path,
}: ControlProps) => (
  <input
    value={Number(data)}
    type="number"
    min={schema.minimum || 0}
    max={schema.maximum || undefined}
    onChange={(e) => handleChange(path, Number(e.target.value))}
    style={{ backgroundColor: errors?.length > 0 ? "red" : "initial" }}
    id={id}
    disabled={!enabled}
  />
);
```

---

Damit dem Renderer aus dem JSON-Forms Context die entsprechenden Props weiteregereicht bekommt, muss der Renderer noch mithilfe des `withJsonFormsControlProps` HOC dekoriert werden:

```tsx:
export const AgeRenderer = withJsonFormsControlProps(AgeRendererComponent);
```

Nun schreiben wir einen einfachen Tester, der auf alle Attribute, die mit age enden zutrifft:

```tsx:
export const ageRendererTester: RankedTester = rankWith(
  4,
  scopeEndsWith("age"),
);
```

---

Nun wird der Renderer in der Datei `additionalRenderers.ts` registriert:

```tsx:
import { AgeRenderer, ageRendererTester } from './AgeRenderer';

export const additionalRenderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: ageRendererTester,
    renderer: AgeRenderer,
  },
];
```

Der einfachheithalber wollen wir den eben erstellten Renderer nicht gleich
in die Gesamtapplikation einbinden sondern zunächst mit einem einfach JSON-Forms Formular testen.

---

# Formular

```tsx:
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { additionalRenderers } from './additionalRenderers';
import schema from './schema.json';

const renderers = [
  ...materialRenderers,
  ...additionalRenderers,
];

const App = () => {
  const [data, setData] = useState({ name: 'Max', age: 42 });
  return (
    <JsonForms
      schema={schema}
      data={data}
      renderers={renderers}
      cells={materialCells}
    />
  );
};
```
