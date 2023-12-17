import {
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TimelineItem, TimelineOptions } from "vis-timeline/types";
import { filterUndefOrNull } from "../../utils/core";
import { dateValueToDate } from "./Search";
import { Box, Tab, Tabs } from "@mui/material";
import VisTimelineWrapper from "../visTimelineWrapper/VisTimelineWrapper";
import * as React from "react";
import { JsonView } from "react-json-view-lite";
import { Home, Timeline } from "@mui/icons-material";
import { useDrawerDimensions } from "../../state";
import { debounce } from "lodash";
import { typeIRItoTypeName } from "../../config";

type FlexibleViewDrawerProps = {
  data: any;
  typeIRI: string;
  selectedEntityIRI?: string | string[];
  onEntitySelected?: (iri: string[] | string | null) => void;
  drawerHeight: number;
};

const TimelineViewPart = ({
  data,
  timelineOptions,
  selectedTimelineItems,
  onSelect,
}: {
  data: TimelineItem[];
  timelineOptions?: TimelineOptions;
  selectedTimelineItems?: string[];
  onSelect?: (items: string[]) => void;
}) => {
  return (
    <VisTimelineWrapper
      items={data}
      options={timelineOptions}
      onSelect={onSelect}
      selection={selectedTimelineItems}
    />
  );
};
type TimelineViewProps = {};
export const TimelineView = ({
  data,
  typeIRI,
  selectedEntityIRI,
  onEntitySelected,
  drawerHeight,
}: FlexibleViewDrawerProps & TimelineViewProps) => {
  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI]);
  const timelineOptions = useMemo<TimelineOptions>(
    () => ({
      height: drawerHeight - 50,
      multiselect: true,
    }),
    [drawerHeight],
  );
  const timeLineItems = useMemo<TimelineItem[]>(() => {
    if (typeName !== "Exhibition") return [];
    //console.log({table: table.})
    return filterUndefOrNull(
      data.map((entity) => {
        if (!entity.fromDateDisplay_single?.value) return null;
        const startDate = dateValueToDate(entity.fromDateDisplay_single.value);
        if (!startDate) return null;
        const endDate =
          entity.toDateDisplay_single?.value &&
          entity.toDateDisplay_single.value !==
            entity.fromDateDisplay_single.value
            ? dateValueToDate(entity.toDateDisplay_single.value)
            : undefined;
        return {
          id: entity.entity?.value,
          content: entity.title_single?.value,
          start: startDate,
          ...(endDate ? { end: endDate } : {}),
        };
      }),
    );
  }, [data, typeName]);

  return (
    <TimelineViewPart
      data={timeLineItems}
      timelineOptions={timelineOptions}
      selectedTimelineItems={
        Array.isArray(selectedEntityIRI)
          ? selectedEntityIRI
          : [selectedEntityIRI]
      }
      onSelect={
        onEntitySelected ? (items) => onEntitySelected(items[0]) : undefined
      }
    />
  );
};

export const DefaultView = ({
  data,
  typeIRI,
  selectedEntityIRI,
  onEntitySelected,
}: FlexibleViewDrawerProps) => {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <JsonView
        data={{
          typeIRI,
          selectedEntityIRI,
        }}
      />
    </Box>
  );
};

enum ViewType {
  Timeline = "timeline",
  Table = "table",
  Default = "default",
}

type SemanticListView = {
  type: ViewType;
  label: string;
  icon: React.ReactElement;
  component: React.ComponentType<FlexibleViewDrawerProps>;
};

const views: SemanticListView[] = [
  {
    type: ViewType.Timeline,
    label: "Timeline",
    icon: <Timeline />,
    component: TimelineView,
  },
  {
    type: ViewType.Default,
    label: "Default",
    icon: <Home />,
    component: DefaultView,
  },
];

export const useDebounce = (
  fnToDebounce: (...args: any) => any,
  durationInMs = 200,
) => {
  if (isNaN(durationInMs)) {
    throw new TypeError("durationInMs for debounce should be a number");
  }

  if (fnToDebounce == null) {
    throw new TypeError("fnToDebounce cannot be null");
  }

  if (typeof fnToDebounce !== "function") {
    throw new TypeError("fnToDebounce should be a function");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(fnToDebounce, durationInMs), [
    fnToDebounce,
    durationInMs,
  ]);
};
export const FlexibleViewDrawer = ({
  data,
  typeIRI,
  selectedEntityIRI,
  onEntitySelected,
}: FlexibleViewDrawerProps) => {
  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI]);
  const [selectedView, setSelectedView] = useState<number>(1);
  const { setDrawerHeight, drawerHeight } = useDrawerDimensions();
  const handleViewChange = useCallback(
    (_e: any, id: number) => {
      //if(! event.target.id in ViewType) return;
      if (drawerHeight < 100) setDrawerHeight(500);
      setSelectedView(id);
    },
    [setSelectedView, setDrawerHeight, drawerHeight],
  );
  const CurrentSemanticListView = useMemo(
    () => views[selectedView]?.component,
    [selectedView],
  );

  const [debouncedHeight, setDebouncedHeight] = useState(drawerHeight);
  const setDrawerHeightDebounced = useDebounce(setDebouncedHeight, 500);
  useEffect(() => {
    setDrawerHeightDebounced(drawerHeight);
  }, [drawerHeight, setDrawerHeightDebounced]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        overflow: "auto",
      }}
    >
      <Tabs
        value={selectedView}
        onChange={handleViewChange}
        aria-label="icon label tabs example"
      >
        {views.map((viewDesc, index) => (
          <Tab
            key={viewDesc.type}
            label={viewDesc.label}
            icon={viewDesc.icon}
          />
        ))}
      </Tabs>
      {CurrentSemanticListView && (
        <CurrentSemanticListView
          data={data}
          typeIRI={typeIRI}
          selectedEntityIRI={selectedEntityIRI}
          onEntitySelected={onEntitySelected}
          drawerHeight={debouncedHeight}
        />
      )}
    </Box>
  );
};
