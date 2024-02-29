import {spreadSheetMappin_NewYork} from "./spreadSheetMappings_NewYork";
import {spreadSheetMapping_Hamburg} from "./spreadSheetMapping_Hamburg";

export const spreadSheetMappings = {
  '[Kovolut Hamburg]': spreadSheetMapping_Hamburg,
  '[Kovolut K1 New York]': spreadSheetMappin_NewYork
} as const;
