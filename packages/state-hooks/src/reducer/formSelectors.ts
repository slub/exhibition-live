import { RootState } from "./formStore";

export const selectFormData = (state: RootState, entityIRI: string) =>
  state.formData.formData[entityIRI];
