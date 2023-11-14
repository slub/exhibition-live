import React from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ROUNDED_CORNERS } from "./chartConfig";

export type BarStackHorizontalProps = {
  height: number;
  width: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
  scores: ScoreData[];
  max?: number | string;
};

const purple1 = "#6c5efb";
const purple2 = "#c998ff";
export const purple3 = "#a44afe";
export const background = "#eaedff";
const defaultMargin = { top: 40, left: 50, right: 40, bottom: 100 };

type ScoreData = {
  title: string;
  score: number;
};

let tooltipTimeout: number;

export default ({
  height,
  width,
  events = false,
  scores,
  margin = defaultMargin,
  max = "auto",
}: BarStackHorizontalProps) => {
  // bounds

  return (
    <BarChart
      layout="vertical"
      width={width}
      height={500}
      data={scores}
      margin={margin}
    >
      <XAxis type={"number"} scale={"linear"} domain={[0, max]} />
      <YAxis type={"category"} dataKey={"title"} />
      <Tooltip />
      <Bar
        dataKey="score"
        fill={purple1}
        activeBar={<Rectangle fill={purple2} stroke={purple1} />}
      />
    </BarChart>
  );
};
