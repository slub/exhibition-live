import { create } from "zustand";

type FormEditorStore = {
  previewEnabled: boolean;
  togglePreview: () => void;
};

export const useFormEditor = create<FormEditorStore>((set, get) => ({
  previewEnabled: false,
  togglePreview: () =>
    set(({ previewEnabled: prev }) => ({ previewEnabled: !prev })),
}));
