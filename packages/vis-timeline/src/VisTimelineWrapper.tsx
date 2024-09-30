import React, { useEffect, useRef, RefObject, useMemo } from "react";
import { DataSet } from "vis-data";
import { Timeline as TimelineConstructor } from "vis-timeline";

import {
  DataGroupCollectionType,
  DateType,
  IdType,
  Timeline as TimelineType,
  TimelineItem,
  TimelineOptions,
} from "vis-timeline/types";

import type {
  TimelineAnimationOptions,
  TimelineEvents,
} from "vis-timeline/types";

export type TimelineEventsWithMissing =
  | TimelineEvents
  | "dragover"
  | "markerchange"
  | "markerchanged";
export type TimelineEventHandler =
  | "onOcurrentTimeTick"
  | "onClick"
  | "onContextmenu"
  | "onDoubleClick"
  | "onDragover"
  | "onDrop"
  | "onMouseOver"
  | "onMouseDown"
  | "onMouseUp"
  | "onMouseMove"
  | "onGroupDragged"
  | "onChanged"
  | "onRangechange"
  | "onRangechanged"
  | "onSelect"
  | "onItemover"
  | "onItemout"
  | "onTimechange"
  | "onTimechanged"
  | "onMarkerchange"
  | "onMarkerchanged";

export type TimelineEventsHandlers = Partial<Record<TimelineEventHandler, any>>;

export type CustomTime = {
  datetime: Date;
  id: string;
};

export type SelectionOptions = {
  focus?: boolean;
  animation?: TimelineAnimationOptions;
};

const events: TimelineEventsWithMissing[] = [
  "currentTimeTick",
  "click",
  "contextmenu",
  "doubleClick",
  "dragover",
  "drop",
  "mouseOver",
  "mouseDown",
  "mouseUp",
  "mouseMove",
  "groupDragged",
  "changed",
  "rangechange",
  "rangechanged",
  "select",
  "itemover",
  "itemout",
  "timechange",
  "timechanged",
  "markerchange",
  "markerchanged",
];

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

type Props = {
  items?: TimelineItem[];
  options?: TimelineOptions;
  selection?: IdType[];
  customTimes?: CustomTime[];
  selectionOptions?: SelectionOptions;
  animate?: boolean | any;
  currentTime?: DateType;
} & TimelineEventsHandlers;

export const VisTimelineWrapper = ({
  items = [],
  options = {},
  selection,

  selectionOptions,

  currentTime,
  ...restProps
}: Props) => {
  const timelineContainerRef: RefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  const timelineDatasetRef = useRef<DataSet<TimelineItem> | null>();
  const timelineGroupsRef = useRef<DataGroupCollectionType>();
  const timelineRef = useRef<TimelineType | null>(null);
  const prevItems = useRef<TimelineItem[] | null>(null);

  useEffect(() => {
    timelineDatasetRef.current = new DataSet();
    timelineRef.current = new TimelineConstructor(
      timelineContainerRef.current!,
      // @ts-ignore
      timelineDatasetRef.current,
      timelineGroupsRef.current!,
      {},
    );

    return () => {
      timelineRef.current?.destroy();
      timelineRef.current = null;
    };
  }, []);

  // tried to fix the problem with the items not updating twice
  const itemsIdString = useMemo(
    () => items.map((item) => item.id).join(","),
    [items],
  );

  // tried to fix the problem with the items not updating twice
  useEffect(() => {
    if (!timelineDatasetRef.current) return;
    prevItems.current = items;
  }, [items]);

  useEffect(() => {
    if (!timelineDatasetRef.current || !timelineRef.current) return;

    let itemsLength = timelineDatasetRef.current.get().length;
    timelineDatasetRef.current.clear();
    timelineDatasetRef.current.add(items);
    if (items.length !== itemsLength) {
      timelineRef.current.fit();
    }
    // return () => {
    //   if (!timelineDatasetRef.current) return;
    //   timelineDatasetRef.current.clear();
    // };
  }, [items]);

  useEffect(() => {
    if (!timelineRef.current) return;
    console.log("set options");
    timelineRef.current.setOptions(options);
    //timelineRef.current.redraw()
  }, [options]);

  useEffect(() => {
    if (!timelineRef.current || !selection) return;
    console.log("set selection", selection);
    timelineRef.current.setSelection(
      selection,
      selectionOptions as Required<SelectionOptions>,
    );
    try {
      timelineRef.current?.focus(selection);
    } catch (e) {
      console.warn(e);
    }
  }, [selection, selectionOptions]);

  useEffect(() => {
    if (!timelineRef.current || !currentTime) return;
    timelineRef.current.setCurrentTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (!timelineRef.current) return;
    for (const event of events) {
      // @ts-ignore
      const eventHandler = restProps[`on${capitalizeFirstLetter(event)}`];
      if (eventHandler) {
        timelineRef.current.on(event, eventHandler);
      }
    }
    return () => {
      if (!timelineRef.current) return;
      for (const event of events) {
        // @ts-ignore
        const eventHandler = restProps[`on${capitalizeFirstLetter(event)}`];
        if (eventHandler) {
          timelineRef.current.off(event, eventHandler);
        }
      }
    };
  }, [restProps]);

  return <div ref={timelineContainerRef}></div>;
};
