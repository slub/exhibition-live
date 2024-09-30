import {
  DeclarativeMapping,
  DeclarativeMappings,
} from "@slub/edb-data-mapping";
import { sladb } from "./lobidMappings";

const createWikidataMappings = (
  language: string | string[],
): Record<string, DeclarativeMappings> => {
  const createLanguageSpecificMappings = (
    labelField: string = "title",
  ): DeclarativeMappings => {
    return [
      {
        source: {
          path: `$.labels.${language}.value`,
        },
        target: {
          path: labelField,
        },
        mapping: {
          strategy: {
            id: "takeFirst",
          },
        },
      },
      {
        source: {
          path: `$.descriptions.${language}.value`,
        },
        target: {
          path: "description",
        },
        mapping: {
          strategy: {
            id: "takeFirst",
          },
        },
      },
    ];
  };

  const wikidataLocationMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("title"),
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P131[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "parent",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Location").value,
            typeName: "Location",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P1448[*].mainsnak.datavalue.value.text",
      },
      target: {
        path: "titleVariants",
      },
      mapping: {
        strategy: {
          id: "concatenate",
          options: {
            separator: ", ",
          },
        },
      },
    },
  ];

  const wikidataExhibitionSeriesMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("title"),
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P131[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "location",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Location").value,
            typeName: "Location",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P31[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "seriesType",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("SeriesType").value,
            typeName: "SeriesType",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P361[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "parent",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("ExhibitionSeries").value,
            typeName: "ExhibitionSeries",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P921[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "tags",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            typeIRI: sladb("Tag").value,
            typeName: "Tag",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
  ];

  const wikidataExhibitionMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("title"),
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P276[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "locations",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            typeIRI: sladb("Location").value,
            typeName: "Location",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P580[*].mainsnak.datavalue.value.time",
      },
      target: {
        path: "startDate.dateValue",
      },
      mapping: {
        strategy: {
          id: "dateStringToSpecialInt",
        },
      },
    },
    {
      source: {
        path: "$.claims.P582[*].mainsnak.datavalue.value.time",
      },
      target: {
        path: "endDate.dateValue",
      },
      mapping: {
        strategy: {
          id: "dateStringToSpecialInt",
        },
      },
    },
    {
      source: {
        path: "$.claims.P1545[*].mainsnak.datavalue.value",
      },
      target: {
        path: "seriesOrdinal",
      },
      mapping: {
        strategy: {
          id: "takeFirst",
        },
      },
    },
    {
      source: {
        path: "$.claims.P361[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "parent",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("ExhibitionSeries").value,
            typeName: "ExhibitionSeries",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P856[*].mainsnak.datavalue.value",
      },
      target: {
        path: "website",
      },
      mapping: {
        strategy: {
          id: "takeFirst",
        },
      },
    },
  ];

  const wikidataPersonMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("name"),
    {
      source: {
        path: "$.claims.P569[*].mainsnak.datavalue.value.time",
      },
      target: {
        path: "birthDate",
      },
      mapping: {
        strategy: {
          id: "dateStringToSpecialInt",
        },
      },
    },
    {
      source: {
        path: "$.claims.P570[*].mainsnak.datavalue.value.time",
      },
      target: {
        path: "deathDate",
      },
      mapping: {
        strategy: {
          id: "dateStringToSpecialInt",
        },
      },
    },
    {
      source: {
        path: "$.claims.P106[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "profession",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            typeIRI: sladb("Occupation").value,
            typeName: "Occupation",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.labels[*].value",
      },
      target: {
        path: "nameVariant",
      },
    },
    {
      source: {
        path: "$.claims.P21[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "gender",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Gender").value,
            typeName: "Gender",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P570",
      },
      target: {
        path: "personDeceased",
      },
      mapping: {
        strategy: {
          id: "exists",
        },
      },
    },
    {
      source: {
        path: "$.id",
      },
      target: {
        path: "externalId",
      },
      mapping: {
        strategy: {
          id: "takeFirst",
        },
      },
    },
    {
      source: {
        path: "$.claims.P463[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "memberOfCorp",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            typeIRI: sladb("Corporation").value,
            typeName: "Corporation",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
  ];

  const wikidataOccupationMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("title"),
    {
      source: {
        path: "$.claims.P279[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "parent",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Occupation").value,
            typeName: "Occupation",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.id",
      },
      target: {
        path: "externalId",
      },
      mapping: {
        strategy: {
          id: "takeFirst",
        },
      },
    },
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
  ];

  const wikidataPlaceMapping: DeclarativeMappings = [
    ...createLanguageSpecificMappings("title"),
    {
      source: {
        path: "$.aliases.de[*].value",
      },
      target: {
        path: "titleVariants",
      },
      mapping: {
        strategy: {
          id: "concatenate",
          options: {
            separator: ", ",
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P131[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "location",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Location").value,
            typeName: "Location",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P361[*].mainsnak.datavalue.value.id",
      },
      target: {
        path: "parent",
      },
      mapping: {
        strategy: {
          id: "createEntityWithAuthoritativeLink",
          options: {
            single: true,
            typeIRI: sladb("Place").value,
            typeName: "Place",
            mainProperty: {
              offset: 0,
            },
            authorityFields: [
              {
                offset: 0,
                authorityLinkPrefix: "http://www.wikidata.org/entity/",
                authorityIRI: "http://www.wikidata.org",
              },
            ],
          },
        },
      },
    },
    {
      source: {
        path: "$.claims.P18[*].mainsnak.datavalue.value",
      },
      target: {
        path: "image",
      },
      mapping: {
        strategy: {
          id: "withDotTemplate",
          options: {
            single: true,
            template:
              "http://commons.wikimedia.org/wiki/Special:FilePath/{{value}}",
          },
        },
      },
    },
  ];

  return {
    Location: wikidataLocationMapping,
    ExhibitionSeries: wikidataExhibitionSeriesMapping,
    Exhibition: wikidataExhibitionMapping,
    Person: wikidataPersonMapping,
    Occupation: wikidataOccupationMapping,
    Place: wikidataPlaceMapping,
  };
};

export const wikidataMappings = createWikidataMappings("de");

export const wikidataTypeMap = {
  Person: "Q5",
  Corporation: "Q43229",
  Place: "Q2221906",
  Location: "Q2221906",
  Occupation: "Q28640", // Add this line for Occupation
};
