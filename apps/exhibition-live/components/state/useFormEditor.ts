import { create } from 'zustand'

type FormEditorStore = {
  previewEnabled: boolean
  formData: object | null
  setFormData: (formData: object| null) => void
  togglePreview: () => void
}

export const useFormEditor = create<FormEditorStore>((set, get) => ({
  previewEnabled: false,
  formData: null,
  togglePreview: () => set(({previewEnabled: prev}) => ({previewEnabled: !prev})),
  setFormData: (formData) => set({formData})
}))

