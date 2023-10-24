import { create } from "zustand";

type UseThemeSettings = {
  isOpen: string[];
  fontFamily: string;
  borderRadius: number;
  opened: boolean;
  defaultId: string;
  navType: "light" | "dark";
};

export const useThemeSettings = create<UseThemeSettings>((set, get) => ({
  isOpen: [], // for active default menu
  defaultId: "default",
  fontFamily: "'Roboto', sans-serif",
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
