import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormDataState {
  formData: { [propertyPath: string]: any };
}

const initialState: FormDataState = {
  formData: {},
};

interface SetFormDataPayload {
  formData: { [propertyPath: string]: any };
  cause?: string;
}

const formSlice = createSlice({
  name: "formData",
  initialState,
  reducers: {
    // Action to initialize form data by creating a new entity with a generated iri and returning the new entityIRI
    initializeFormData: (
      state,
      action: PayloadAction<{ newEntityIRI: () => string; typeIRI: string }>,
    ) => {
      state.formData = {
        "@id": action.payload.newEntityIRI(),
        "@type": action.payload.typeIRI,
      };
    },
    // Action to set form data with an optional cause
    setFormData: (state, action: PayloadAction<SetFormDataPayload>) => {
      state.formData = action.payload.formData;
      // Optionally, you might want to log the cause or handle it differently
      if (action.payload.cause) {
        console.log(`Data updated due to: ${action.payload.cause}`);
      }
    },
    // Action to update form data with an updater function and optional cause
    updateFormData: (
      state,
      action: PayloadAction<{
        propertyPath: string;
        updater: (formData: any) => any | any;
        cause?: string;
      }>,
    ) => {
      const { propertyPath, updater, cause } = action.payload;
      state.formData[propertyPath] =
        typeof updater === "function"
          ? updater(state.formData[propertyPath])
          : updater;
      if (cause) {
        console.log(`Data updated due to: ${cause}`);
      }
    },
  },
});

export const { setFormData, updateFormData, initializeFormData } =
  formSlice.actions;

export default formSlice.reducer;
