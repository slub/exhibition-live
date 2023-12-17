import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { ParentSize } from "@visx/responsive";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { SELECT } from "@tpluscode/sparql-builder";
import { primaryFields, typeIRItoTypeName } from "../../config";
import { defaultPrefix } from "../../form/formConfigs";
import { variable } from "@rdfjs/data-model";
import { isString, orderBy, uniq } from "lodash";
import { fixSparqlOrder } from "../../utils/discover";
import { Box, Chip, Grid, Skeleton, Tab, Tabs } from "@mui/material";
import { withDefaultPrefix } from "../../utils/crud/makeSPARQLWherePart";
import { filterUndefOrNull } from "../../utils/core";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import VisTimelineWrapper from "../visTimelineWrapper/VisTimelineWrapper";
import { TimelineItem } from "vis-timeline/types";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import get from "lodash/get";
import { ListAlt, Polyline, Timeline } from "@mui/icons-material";
import {
  GenericListItem,
  GenericVirtualizedList,
} from "./GenericVirtualizedList";
import { useTranslation } from "react-i18next";

const makeFilterUNION2 = (searchString: string, length: number) => {
  const filterUNION = [];
  for (let i = 0; i < length; i++) {
    const filter = ` {
      ${i === 0 ? "?entity" : `?o${i - 1}`} ?p${i} ?o${i} .
      FILTER(CONTAINS(LCASE(STR(?o${i})), "${searchString}"))
    } `;
    filterUNION.push(filter);
  }
  return filterUNION.join(" UNION ");
};

const makeFilterUNION = (searchString: string, length: number) => {
  return `?entity ?p ?o . FILTER(CONTAINS(LCASE(STR(?o)), "${searchString}"))`;
};

const dateStringValueToInt = (date: string) => {
  if (date.length === 4) return parseInt(date);
  //const format = 'DD.MM.YYYY'
  const dateParts = date.split(".");
  const year = parseInt(dateParts[2]);
  return year;
};
const dateValueToInt = (date: Date | number | string) => {
  const realDate = new Date(date);
  return realDate.getFullYear();
};

export const dateValueToDate = (date: string) => {
  if (date.length === 4) return new Date(parseInt(date), 0, 1);
  const dateParts = date.split(".");
  const year = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[0]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
};

const personDateToDate = (date: string) => {
  // first pattern YYYYMMDD where each field can have zeros
  if (/\d{8}/.test(date)) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return new Date(parseInt(year), parseInt(month), parseInt(day));
  }
  if (/\d{4}/.test(date)) {
    return new Date(parseInt(date), 0, 1);
  }
  // can be YYYY-MM-DD
  if (/\d{4}-\d{2}-\d{2}/.test(date)) {
    const dateParts = date.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    return new Date(year, month, day);
  }
  // or german DD.MM.YYYY
  if (/\d{2}\.\d{2}\.\d{4}/.test(date)) {
    const dateParts = date.split(".");
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[0]);
    return new Date(year, month, day);
  }
  return null;
};

const itemToTimelineItemGeneric = (
  item: any,
  typeIRI: string,
  parseStart: (item: any) => Date | null,
  parseEnd: (item: any) => Date | null,
): TimelineItem | null => {
  const typeName = typeIRItoTypeName(typeIRI);
  if (isString(item.entity?.value)) {
    const start = parseStart(item);
    if (!start) return null;
    const end = parseEnd(item);
    const primaryField = primaryFields[typeName];
    const content = primaryField ? get(item, primaryField.label)?.value : null;
    return {
      id: item.entity?.value,
      content: content || typeName,
      start,
      end,
      style: "point", //!end || start === end ? 'circle' : 'box',
      group: typeName,
    };
  }
  return null;
};

const itemToListItemReal = (
  item: any,
  typeIRI: string,
): GenericListItem | null => {
  const typeName = typeIRItoTypeName(typeIRI);
  if (isString(item.entity?.value)) {
    const primaryFieldDeclaration = primaryFields[typeName];
    const { label, description, image } = applyToEachField(
      item,
      primaryFieldDeclaration,
      extractFieldIfString,
    );
    return {
      id: item.entity.value,
      entry: item,
      primary: label,
      description,
      avatar: image,
    };
  }
  return null;
};
const itemToListItem = (item: any, typeIRI: string): GenericListItem | null => {
  const typeName = typeIRItoTypeName(typeIRI);
  if (isString(item.entity?.value)) {
    const primaryField = primaryFields[typeName];
    const primary = primaryField
      ? get(item, primaryField.label)?.value
      : JSON.stringify(item);
    const description = primaryField
      ? get(item, primaryField.description)?.value
      : null;
    const image = primaryField ? get(item, primaryField.image)?.value : null;
    return {
      id: item.entity.value,
      entry: item,
      primary: primary || typeName,
      description,
      avatar: image,
    };
  }
  return null;
};
const itemToTimelineItem = (
  item: any,
  typeIRI: string,
): TimelineItem | null => {
  const typeName = typeIRItoTypeName(typeIRI);
  if (typeName === "Person") {
    if (isString(item.birthDate?.value)) {
      const start = personDateToDate(item.birthDate.value);
      if (!start) return null;
      const end = item.deathDate
        ? personDateToDate(item.deathDate.value)
        : null;
      const primaryField = primaryFields[typeName];
      const content = primaryField
        ? get(item, primaryField.label)?.value
        : JSON.stringify(item);
      return {
        id: item.entity?.value,
        content: content || typeName,
        start,
        end,
        //style: 'point',//!end || start === end ? 'circle' : 'box',
        group: typeName,
      };
    }
  }
  if (typeName === "Exhibition") {
    if (
      isString(item.toDateDisplay?.value) &&
      isString(item.fromDateDisplay?.value)
    ) {
      const start = dateValueToDate(item.fromDateDisplay.value);
      if (!start) return null;
      const end =
        !item.toDateDisplay ||
        item.toDateDisplay.value === item.fromDateDisplay.value
          ? null
          : dateValueToDate(item.toDateDisplay.value);
      const primaryField = primaryFields[typeName];
      const content = primaryField
        ? get(item, primaryField.label)?.value
        : JSON.stringify(item);
      return {
        id: item.entity?.value,
        content: content || typeName,
        start,
        end,
        //style: 'point',//!end || start === end ? 'circle' : 'box',
        group: typeName,
      };
    }
  }
  return null;
};
export const SearchBar = ({ relevantTypes }: { relevantTypes: string[] }) => {
  const { t } = useTranslation("translation");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const { crudOptions } = useGlobalCRUDOptions();
  const { selectFetch } = crudOptions || {};
  const [selectedClassIRIs, setSelectedClassIRIs] = useState<string[]>([]);

  const handleClassSelect = useCallback(
    (classIRI: string) => {
      setSelectedClassIRIs((prev) => {
        if (prev.includes(classIRI)) {
          return prev.filter((iri) => iri !== classIRI);
        }
        return [...prev, classIRI];
      });
    },
    [setSelectedClassIRIs],
  );

  const { data: searchResults, isLoading: searchResultsLoading } = useQuery(
    ["search", searchText],
    async () => {
      if (!selectFetch) return [];
      const count = variable("count");
      const searchString = searchText.toLowerCase().replace(/"/g, "");
      const defaultClassIRIs = relevantTypes.map((iri) => `<${iri}>`);
      const query = fixSparqlOrder(
        SELECT.DISTINCT` ?type (COUNT(?type) AS ${count}) `.WHERE`
    ?entity a ?type .
    FILTER( ?type IN (${defaultClassIRIs.join(",")}) )
    FILTER(isIRI(?entity))
    ${searchString.length > 0 ? makeFilterUNION(searchString, 2) : ""}
    `.GROUP().BY` ?type `
          .ORDER()
          .BY(count)
          .build(),
      );
      return (await selectFetch(query))?.map((item) => ({
        id: item.type?.value,
        title: t(typeIRItoTypeName(item.type?.value)),
        score: parseInt(item.count?.value) || 0,
      }));
    },
    {
      enabled: !!selectFetch,
      keepPreviousData: true,
      staleTime: 1000,
    },
  );

  const searchResultsAndSelected = useMemo(() => {
    return orderBy(
      [
        ...(searchResults || []),
        ...selectedClassIRIs
          .filter((iri) => !searchResults?.find(({ id }) => id === iri))
          .map((iri) => ({
            id: iri,
            title: t(typeIRItoTypeName(iri)),
            score: 0,
          })),
      ],
      ["title"],
      ["desc"],
    );
  }, [t, searchResults, selectedClassIRIs]);

  const handleTimelineSelect = useCallback(
    (selection: any) => {
      setSelectedId(selection?.items?.[0]);
    },
    [setSelectedId],
  );

  const { data: allExhibitionsData } = useQuery(
    ["allExhibitions", searchText, selectedClassIRIs],
    async () => {
      if (!selectFetch) return [];
      const searchString = searchText.toLowerCase().replace(/"/g, "");
      const optionalProperties = [
        "title",
        "name",
        "label",
        "description",
        "image",
        "birthDate",
        "deathDate",
        "toDateDisplay",
        "fromDateDisplay",
      ];
      const sample = (propName: string) =>
        ` (SAMPLE(?${propName}List) AS ?${propName}) `;
      const makeOptional = (propName: string) =>
        `OPTIONAL { ?entity :${propName} ?${propName}List . }`;
      const wherePartOptionals = optionalProperties
        .map(makeOptional)
        .join("\n");
      const selectPartOptionals = optionalProperties.map(sample).join(" ");
      const defaultClassIRIs = relevantTypes.map((iri) => `<${iri}>`);
      const classIRIs =
        selectedClassIRIs.length > 0
          ? selectedClassIRIs.map((iri) => `<${iri}>`)
          : defaultClassIRIs;
      const entityV = variable("entity");
      const query = fixSparqlOrder(
        withDefaultPrefix(
          defaultPrefix,
          SELECT.DISTINCT`${entityV} ?type ${selectPartOptionals} `.WHERE`
    ${entityV} a ?type .
    FILTER( ?type IN (${classIRIs.join(",")}) )
    FILTER(isIRI(${entityV}))
    ${searchString.length > 0 ? makeFilterUNION(searchString, 2) : ""}
    ${wherePartOptionals}
    `.GROUP().BY`${entityV} ?type`
            .ORDER()
            .BY(entityV)
            .build(),
        ),
      );
      return await selectFetch(query);
    },
    {
      enabled: !searchResultsLoading,
      keepPreviousData: true,
      staleTime: 1000,
    },
  );

  const mapTypeToScore = (item?: any) => {
    return {
      title:
        item.title?.value ||
        item.name?.value ||
        item.label?.value ||
        item.entity?.value,
      to: item.toDateDisplay || item.birthDate,
      from: item.fromDateDisplay || item.deathDate,
    };
  };
  const timelineItems = useMemo<TimelineItem[]>(
    () =>
      filterUndefOrNull(
        allExhibitionsData?.map((item) =>
          itemToTimelineItem(item, item.type.value),
        ) || ([] as TimelineItem[]),
      ),
    [allExhibitionsData],
  );

  const dateScore = useMemo(() => {
    //const allExhibitions = allExhibitionsData?.map(mapTypeToScore)
    const allYears = uniq(
      filterUndefOrNull(
        timelineItems?.flatMap((item) => [item.start, item.end]) || [],
      ).map(dateValueToInt),
    );
    return orderBy(
      allYears.map((year) => {
        const exhibitions = timelineItems?.filter(
          (item) =>
            (item.start && dateValueToInt(item.start) === year) ||
            (item.end && dateValueToInt(item.end) === year),
        );
        const score: number = exhibitions?.length || 0;
        return { year, score };
      }),
      ["year"],
      ["asc"],
    ) as { year: number; score: number }[];
  }, [timelineItems]);

  const listItems: GenericListItem[] = useMemo(
    () =>
      filterUndefOrNull(
        allExhibitionsData?.map((item) =>
          itemToListItem(item, item.type.value),
        ) || ([] as GenericListItem[]),
      ),
    [allExhibitionsData],
  );

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  return (
    <Grid container direction={"row"} spacing={3}>
      <Grid item xs={12}>
        <Paper
          component="form"
          sx={{
            p: "12px 10",
            display: "flex",
            borderRadius: "1rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          <InputBase
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ ml: 1, flex: 1, fontSize: "2.5rem" }}
            inputProps={{
              "aria-label": "Such innerhalb der gesamten Datenbank",
            }}
          />
          <IconButton
            type="button"
            sx={{ p: "10px" }}
            size={"large"}
            aria-label="search"
          >
            <SearchIcon sx={{ fontSize: "2.5rem" }} />
          </IconButton>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{ minHeight: "5em" }}>
          {searchResultsAndSelected.map((item) => (
            <Grid item key={item.id}>
              <Chip
                variant={
                  selectedClassIRIs.includes(item.id) ? "filled" : "outlined"
                }
                onClick={() => handleClassSelect(item.id)}
                color={"secondary"}
                label={`${item.title} (${item.score})`}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: "12px 10",
                transition: "background-color 0.5s ease-in-out",
                backgroundColor: (theme) =>
                  `rgba(255, 255, 255, ${searchResultsLoading ? 0 : 0.8})`,
                display: "flex",
                borderRadius: "1rem",
                alignItems: "center",
                width: "100%",
                flexDirection: "column",
              }}
            >
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                orientation={"horizontal"}
              >
                <Tab
                  icon={<Polyline />}
                  iconPosition={"start"}
                  label={t("line chart")}
                />
                <Tab
                  icon={<Timeline />}
                  iconPosition={"start"}
                  label={t("timeline")}
                />
                <Tab
                  icon={<ListAlt />}
                  iconPosition={"start"}
                  label={t("List")}
                />
              </Tabs>
              <Box sx={{ width: "100%", height: "40vh" }}>
                {
                  <ParentSize>
                    {({ width, height }) =>
                      searchResultsLoading ? (
                        <Skeleton width={width} height={height} />
                      ) : (
                        <>
                          {[
                            tabIndex === 0 && (
                              <LineChart
                                key={"lineChart"}
                                width={width}
                                height={height}
                                data={dateScore}
                              >
                                <XAxis dataKey="year" />
                                <YAxis dataKey="score" />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke="#8884d8"
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            ),
                            tabIndex === 1 && (
                              <VisTimelineWrapper
                                key={"timeline"}
                                items={timelineItems}
                                options={{
                                  width: `${width}px`,
                                  height: `${height}px`,
                                  multiselect: false,
                                }}
                                onSelect={handleTimelineSelect}
                                selection={[selectedId]}
                              />
                            ),
                            tabIndex === 2 && (
                              <GenericVirtualizedList
                                key={"list"}
                                items={listItems}
                                width={width}
                                height={height}
                              />
                            ),
                          ]}
                        </>
                      )
                    }
                  </ParentSize>
                }
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
