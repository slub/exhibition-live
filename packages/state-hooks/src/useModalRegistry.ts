import NiceModal, { NiceModalHocProps } from "@ebay/nice-modal-react";
import { FC } from "react";
import { create } from "zustand";

type UseModalRegistryType = {
  modalRegistry: Array<string>;
  registerModal: (modalName: string, element: FC<NiceModalHocProps>) => void;
};

export const useModalRegistry = (nc: typeof NiceModal) =>
  create<UseModalRegistryType>((set, get) => ({
    modalRegistry: [],
    registerModal: (modalName, element) => {
      if (get().modalRegistry.includes(modalName)) {
        return;
      }
      nc.register(modalName, element);
      set((state) => ({
        modalRegistry: [...state.modalRegistry, modalName],
      }));
    },
  }))();
