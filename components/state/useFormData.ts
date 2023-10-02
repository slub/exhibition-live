import {create} from 'zustand'

type UseFormData = {
    formData: any,
    setFormData: (formData: any) => void
}

export const useFormData = create<UseFormData>((set) => ({
    formData: {},
    setFormData: (formData) => set({formData}),
}))
