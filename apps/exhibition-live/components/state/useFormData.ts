import { create } from "zustand";

type UseFormData = {
  formData: any;
  setFormData: (formData: ((old:  Record<string, any>) => Record<string, any> ) | Record<string, any>) => void;
};

export const useFormData = create<UseFormData>((set, get) => ({
  formData: {},
  setFormData: (formData) => {
   if(typeof formData === 'function') {
     set({ formData: formData(get().formData) })
   }  else {
     set({ formData })
   }
  },
}));
