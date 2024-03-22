import NiceModal, {NiceModalHocProps} from "@ebay/nice-modal-react";
import {FC} from "react";
import {create} from "zustand";

type UseModalRegistryType = {
    modalRegistry: Set<string>,
    registerModal: (modalName: string, element: FC<NiceModalHocProps>) => void
}

export const useModalRegistry = create<UseModalRegistryType>((set, get) => ({
    modalRegistry: new Set<string>(),
    registerModal: (modalName, element) => {
        if(get().modalRegistry.has(modalName)) {
            return
        }
        NiceModal.register(modalName, element)
        get().modalRegistry.add(modalName)
    }
}))
