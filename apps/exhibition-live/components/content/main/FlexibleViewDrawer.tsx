import { useCallback, useMemo, useState } from "react";
import { TimelineItem, TimelineOptions } from "vis-timeline/types";
import { filterUndefOrNull } from "../../utils/core";
import { dateValueToDate } from "./Search";
import { Box, Tab, Tabs } from "@mui/material";
import VisTimelineWrapper from "../visTimelineWrapper/VisTimelineWrapper";
import * as React from "react";
import { typeIRItoTypeName } from "./Dashboard";
import { JsonView } from "react-json-view-lite";
import { Home, Timeline } from "@mui/icons-material";

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

export const FlexibleViewDrawer = ({
  data,
  typeIRI,
  selectedEntityIRI,
  onEntitySelected,
}: FlexibleViewDrawerProps) => {
  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI]);
  const [selectedView, setSelectedView] = useState<number>(1);
  const handleViewChange = useCallback(
    (id: number) => {
      //if(! event.target.id in ViewType) return;
      setSelectedView(id);
    },
    [setSelectedView],
  );
  const CurrentSemanticListView = useMemo(
    () => views[selectedView]?.component,
    [selectedView],
  );

  const drawerHeight = 500;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        overflow: "auto",
      }}
    >
      <Tabs value={selectedView} aria-label="icon label tabs example">
        {views.map((viewDesc, index) => (
          <Tab
            onClick={() => handleViewChange(index)}
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
          drawerHeight={drawerHeight}
        />
      )}
    </Box>
  );
};
