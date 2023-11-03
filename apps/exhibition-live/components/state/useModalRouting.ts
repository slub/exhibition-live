import { create } from "zustand";

type UseModalRouting = {
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModalRouting = create<UseModalRouting>((set, get) => ({
  modalOpen: false,
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}));
