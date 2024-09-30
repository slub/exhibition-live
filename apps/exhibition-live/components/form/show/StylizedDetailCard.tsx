import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Fab, styled, Typography } from "@mui/material";
import ColorThief from "color-thief-ts";
import MarkdownContent from "./MarkdownContentNoSSR";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { EntityDetailCardProps } from "@slub/edb-advanced-components";

type ColorArray = [number, number, number];

type StyledCardProps = {
  palette: ColorArray[];
  children: React.ReactNode;
};

const StyledAnimatedCard = styled(Box)<StyledCardProps>(
  ({ theme, palette }) => ({
    "& h1.heading": {
      fontSize: "2em",
      textAlign: "center",
      color: "white",
      animation: "pop 0.7s",
      padding: 20,
      textOverflow: "ellipsis",
    },
    "&:hover h1.heading": { background: theme.palette.secondary.dark },
    "& h1": { fontSize: "2em", color: "black" },
    "& p": {
      fontSize: "1em",
      lineHeight: 1.4,
      color: theme.palette.primary.dark,
      marginBottom: "1.5rem",
      textAlign: "justify",
    },
    "& .wrap": {
      display: "flex",
      flexWrap: "nowrap",
      justifyContent: "space-between",
      width: "100%",
      height: "65vmin",
      margin: "2rem auto",
      border: "none",
      transition: "0.3s ease-in-out",
      position: "relative",
      overflow: "hidden",
    },
    "& .overlay": {
      position: "relative",
      display: "flex",
      width: "100%",
      height: "100%",
      padding: "1rem 0.75rem",
      background: theme.palette.secondary.dark,
      transition: "0.4s ease-in-out",
      zIndex: 1,
    },
    "& .active .overlay": {
      width: 0,
    },
    "& .overlay-content": {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "60%",
      height: "100%",
      padding: "0.5rem 0 0 0.5rem",
      transition: "0.3s ease-in-out 0.2s",
      textAlign: "left",
      zIndex: 1,
    },
    "& .card-action": {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      padding: "0.5rem",
    },
    "& .image-content": {
      position: "absolute",
      top: "0",
      right: "0",
      width: "40%",
      height: "100%",
      backgroundSize: "cover",
      transition: "0.3s ease-in-out",
    },
    "& .inset": {
      maxWidth: "50%",
      margin: "0.25em 1em 1em 0",
      borderRadius: "0.25em",
      cssFloat: "left",
    },
    "& .dots": {
      position: "absolute",
      bottom: "1rem",
      right: "2rem",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "55px",
      height: "4vmin",
      transition: "0.3s ease-in-out 0.3s",
    },
    "& .dot": {
      width: "14px",
      height: "14px",
      background: theme.palette.background.default,
      border: "1px solid indigo",
      borderRadius: "50%",
      transition: "0.3s ease-in-out 0.3s",
    },
    "& .text": {
      position: "absolute",
      top: "0",
      right: "0",
      width: "50%",
      height: "100%",
      padding: "3vmin 4vmin",
      background: theme.palette.background.paper,
      overflowY: "auto",
    },
    "& .text.active": {
      width: "100%",
      transition: "0.3s ease-in-out",
    },
    "& .active.wrap .overlay": { width: 0, opacity: 0 },
    "& .active.wrap .overlay-content": { width: 0, opacity: 0 },
    "& .active.wrap .image-content": { width: 0, opacity: 0 },
    "& .wrap:hover .overlay": { width: "50%" },
    "&. .wrap:hover .text": { width: "0%" },
    "& .wrap:hover .image-content": { width: "40em" },
    "& .wrap:hover .overlay-content": {
      border: "none",
      transitionDelay: "0.2s",
      width: "40%",
    },
    "& .wrap:hover .dots": { transform: "translateX(1rem)" },
    "& .wrap:hover .dots .dot": { background: "white" },
    "& .animate": {
      animationDuration: "0.7s",
      animationTimingFunction: "cubic-bezier(0.26, 0.53, 0.74, 1.48)",
      animationFillMode: "backwards",
    },
    "& .pop": { animationName: "pop" },
    "& @keyframes pop": {
      "& 0%": { opacity: 0, transform: "scale(0.5, 0.5)" },
      "& 100%": { opacity: 1, transform: "scale(1, 1)" },
    },
    "& .slide": { animationName: "slide" },
    "& @keyframes slide": {
      "& 0%": { opacity: 0, transform: "translate(4em, 0)" },
      "& 100%": { opacity: 1, transform: "translate(0, 0)" },
    },
    "& .slide-left": { animationName: "slide-left" },
    "& @keyframes slide-left": {
      "& 0%": { opacity: 0, transform: "translate(-40px, 0)" },
      "& 100%": { opacity: 1, transform: "translate(0, 0)" },
    },
    "& .slide-up": { animationName: "slide-up" },
    "& @keyframes slide-up": {
      "& 0%": { opacity: 0, transform: "translateY(3em)" },
      "& 100%": { opacity: 1, transform: "translateY(0)" },
    },
    "& .delay-1": { animationDelay: "0.3s" },
    "& .delay-2": { animationDelay: "0.6s" },
    "& .delay-3": { animationDelay: "0.9s" },
    "& .delay-4": { animationDelay: "1.2s" },
    "& .delay-5": { animationDelay: "1.5s" },
    "& .delay-6": { animationDelay: "1.8s" },
    "& .delay-7": { animationDelay: "2.1s" },
    "& .delay-8": { animationDelay: "2.4s" },
  }),
);

export const StylizedDetailCard = ({
  cardInfo,
  cardActionChildren,
}: EntityDetailCardProps) => {
  const imgRef = useRef<HTMLImageElement>();
  const [activated, setActivated] = useState(false);
  const [colorPalette, setColorPalette] = useState([]);
  useEffect(() => {
    const ct = new ColorThief({ crossOrigin: true });
    if (!imgRef.current) {
      return;
    }
    if (imgRef.current.complete) {
      console.log("will try to get palette from image");
      try {
        setColorPalette(ct.getPalette(imgRef.current, 3));
      } catch (e) {
        console.log("cannot get color palette");
        console.error(e);
      }
    } else {
      imgRef.current.addEventListener("load", () => {
        console.log("will try to get palette from image");
        try {
          setColorPalette(ct.getPalette(imgRef.current, 3));
        } catch (e) {
          console.log("cannot get color palette");
          console.error(e);
        }
      });
    }
  }, [cardInfo.image, setColorPalette]);
  return (
    <StyledAnimatedCard palette={colorPalette}>
      <div className={`wrap animate pop ${activated ? "active" : ""}`}>
        <Fab
          color="primary"
          aria-label="detail"
          sx={{ position: "absolute", right: 30 }}
          onClick={() => setActivated((a) => !a)}
        >
          {activated ? <ArrowRight /> : <ArrowLeft />}
        </Fab>
        <div className="overlay">
          <div className="overlay-content animate slide-left delay-2">
            <h1 className="animate slide-left pop delay-4 heading">
              {cardInfo.label}
            </h1>
            <Typography
              variant="body1"
              className="animate slide-left pop delay-5"
              sx={{ color: "white", marginBottom: "2.5rem" }}
            >
              <pre>{JSON.stringify(colorPalette, null, 2)}</pre>
              {cardInfo.label}
            </Typography>
          </div>
          <div
            className="image-content animate slide delay-5"
            style={{ backgroundImage: `url(${cardInfo.image})` }}
          >
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                alt={cardInfo.label}
                src={cardInfo.image}
                style={{ display: "block", height: "1px" }}
              />
            }
          </div>
          <div className="dots animate">
            <div className="dot animate slide-up delay-6"></div>
            <div className="dot animate slide-up delay-7"></div>
            <div className="dot animate slide-up delay-8"></div>
          </div>
        </div>
        <div className={`text ${activated ? "active" : ""}`}>
          {<MarkdownContent mdDocument={cardInfo.description} />}
        </div>
      </div>
      <div className="card-action">{cardActionChildren}</div>
    </StyledAnimatedCard>
  );
};
