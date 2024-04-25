import { configureStore } from "@reduxjs/toolkit";
import formDataReducer from "./formSlice";

const store = configureStore({
  reducer: {
    formData: formDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
