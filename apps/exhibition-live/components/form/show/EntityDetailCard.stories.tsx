import { Meta, StoryObj } from "@storybook/react";
import { EntityDetailCard } from "@slub/edb-advanced-components";

export default {
  title: "presentation/kb/EntityDetailCard",
  component: EntityDetailCard,
} as Meta<typeof EntityDetailCard>;

const exampleOne = {
  data: {
    "@id": "http://ontologies.slub-dresden.de/exhibition/entity/Exhibition#s-1",
    "@type": "http://ontologies.slub-dresden.de/exhibition#Exhibition",
    title: "Otto Dix. DER KRIEG. Das Dresdner Triptychon",
    description:
      "2014 jährt sich der Beginn des Ersten Weltkrieges zum 100. Mal. Kein anderer Künstler des 20. Jahrhunderts hat sich intensiver und nachdrücklicher mit dem Ersten Weltkrieg auseinandergesetzt als Otto Dix (1891–1969). Seine schockierend realistischen Darstellungen von Verwundeten und Toten in den Schützengräben des Ersten Weltkriegs sind in das kollektive Bildgedächtnis eingegangen.",
    originalTitle: "Otto Dix. DER KRIEG. Das Dresdner Triptychon",
    exhibitionSeries: {
      idAuthority: {},
    },
    exhibitionCategory: {
      "@id":
        "http://ontologies.slub-dresden.de/exhibition/entity/ExhibitionCategory#s-1",
      "@type":
        "http://ontologies.slub-dresden.de/exhibition#ExhibitionCategory",
      name: "Sonderausstellung",
      description:
        "Als Sonderausstellung wird eine thematisch und zeitlich begrenzte Ausstellung bezeichnet.",
      idAuthority: {},
    },
    exhibitionGenre: [],
    sourceCorporation: {
      idAuthority: {},
    },
    startDate: {
      dateValue: 20140405,
    },
    endDate: {
      dateValue: 20140713,
    },
    exhibitionType: {
      "@id":
        "http://ontologies.slub-dresden.de/exhibition/entity/EventType#s-1",
      "@type": "http://ontologies.slub-dresden.de/exhibition#EventType",
      idAuthority: {},
    },
    published: true,
    places: [
      {
        "@id": "http://ontologies.slub-dresden.de/exhibition/entity/Place#s-1",
        "@type": "http://ontologies.slub-dresden.de/exhibition#Place",
        title: "Albertinum",
        description: "",
        idAuthority: {},
      },
    ],
    locations: [
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/Location#s-1",
        "@type": "http://ontologies.slub-dresden.de/exhibition#Location",
        title: "Dresden",
        description: "EIne Stadt im Osten Deutschlands",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Dresden_Stadtwappen.svg/500px-Dresden_Stadtwappen.svg.png",
        idAuthority: {},
      },
    ],
    tags: [],
    involvedPersons: [
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-926",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-183",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Goya y Lucientes, Francisco José de",
          description: "",
          gender: "m",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-7",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Ausgestellte Künstler:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-4",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-184",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Dalbajewa, Birgit",
          description: "",
          gender: "f",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-3",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Leihgeber:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-923",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-1",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Fleischer, Simone",
          birthDate: 19791229,
          gender: "f",
          personDeceased: false,
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-9",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Co-Kurator:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-925",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-186",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Grünewald, Matthias",
          description: "",
          gender: "m",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-7",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Ausgestellte Künstler:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-924",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-182",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Dix, Otto",
          description: "",
          gender: "m",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-7",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Ausgestellte Künstler:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedPerson#s-922",
        "@type": "http://ontologies.slub-dresden.de/exhibition#InvolvedPerson",
        person: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Person#s-185",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Person",
          name: "Peters, Olaf",
          description: "",
          gender: "m",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/PersonRole#s-3",
          "@type": "http://ontologies.slub-dresden.de/exhibition#PersonRole",
          title: "Leihgeber:in",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
    ],
    involvedCorporations: [
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-10",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-13",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Kunstbibliothek",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-12",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-14",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Militärhistorisches Museum der Bundeswehr Dresden",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-8",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-8",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Kunstmuseum Stuttgart",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-14",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-5",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Sächsische Landesbibliothek - Staats- und Universitätsbibliothek",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-11",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-10",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Kupferstich Kabinett",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-2",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-9",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Zeppelin Museum Friedrichshafen - Technik und Kunst",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-9",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-12",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Stiftung Deutsches Historisches Museum, Berlin",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-15",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-17",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Kunstsammlung Gera",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-13",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-16",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Deutsches Plakatmuseum",
          description:
            "Deutsches Plakatmuseum - viel zu viel\nDeutsches Plakatmuseum\nDeutsches Plakatmuseum",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-10",
          "@type":
            "http://ontologies.slub-dresden.de/exhibition#CorporationRole",
          title: "Leihgeber",
          description: "",
          idAuthority: {},
        },
        idAuthority: {},
      },
      {
        "@id":
          "http://ontologies.slub-dresden.de/exhibition/entity/InvolvedCorporation#s-1",
        "@type":
          "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
        corporation: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/Corporation#s-11",
          "@type": "http://ontologies.slub-dresden.de/exhibition#Corporation",
          name: "Galerie Neue Meister",
          description: "",
          idAuthority: {},
        },
        role: {
          "@id":
            "http://ontologies.slub-dresden.de/exhibition/entity/CorporationRole#s-6",
          idAuthority: {},
        },
        idAuthority: {},
      },
    ],
    finissage: {},
    midissage: {},
    vernissage: {},
    exponatsAndPersons: [],
    exponatsAndCorporations: [],
    resources: [],
    idAuthority: {},
  },
  cardInfo: {
    label: "Otto Dix. DER KRIEG. Das Dresdner Triptychon",
    description:
      "2014 jährt sich der Beginn des Ersten Weltkrieges zum 100. Mal. Kein anderer Künstler des 20. Jahrhunderts hat sich intensiver und nachdrücklicher mit dem Ersten Weltkrieg auseinandergesetzt als Otto Dix (1891–1969). Seine schockierend realistischen Darstellungen von Verwundeten und Toten in den Schützengräben des Ersten Weltkriegs sind in das kollektive Bildgedächtnis eingegangen.",
    image: null,
  },
};

type Story = StoryObj<typeof EntityDetailCard>;
export const EntityDetailCardExampleWithControls: Story = {
  args: {
    typeIRI: exampleOne.data["@type"],
    entityIRI: exampleOne.data["@id"],
    cardInfo: exampleOne.cardInfo,
    data: exampleOne.data,
    readonly: true,
  },
};
