import { create } from "zustand";
import { Lato, Concert_One, Work_Sans as Prompt } from "next/font/google";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";

// Custom fonts bundled (i.e. no external requests), see <https://nextjs.org/docs/pages/building-your-application/optimizing/fonts>
export const lato = Lato({
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lato",
});

export const concertOne = Concert_One({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--concert-one",
});

const prompt = Prompt({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--prompt",
});

type UseThemeSettings = {
  isOpen: string[];
  fontFamily: string;
  font: NextFontWithVariable;
  borderRadius: number;
  opened: boolean;
  defaultId: string;
  navType: "light" | "dark";
};

export const useThemeSettings = create<UseThemeSettings>((set, get) => ({
  isOpen: [], // for active default menu
  defaultId: "default",
  fontFamily: prompt.style.fontFamily,
  font: lato,
  borderRadius: 12,
  opened: true,
  navType: "light",
}));

/*


const customizationReducer = (state = initialState, action) => {
  let id;
  switch (action.type) {
    case actionTypes.MENU_OPEN:
      id = action.id;
      return {
        ...state,
        isOpen: [id]
      };
    case actionTypes.SET_MENU:
      return {
        ...state,
        opened: action.opened
      };
    case actionTypes.SET_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.fontFamily
      };
    case actionTypes.SET_BORDER_RADIUS:
      return {
        ...state,
        borderRadius: action.borderRadius
      };
    case actionTypes.SET_SEARCH:
      return {
        ...state,
        search: action.search
      };
    case actionTypes.CLEAR_SEARCH:
      return {
        ...state,
        search: ''
      };
    default:
      return state;
  }
};
 */
