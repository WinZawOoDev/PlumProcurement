import { create } from 'zustand'
import { IPrice } from '../database'

interface PriceState {
    editPrice: IPrice | null;
    toggleEdit: (price: IPrice | null) => void;
}

const usePriceStore = create<PriceState>((set) => ({
    editPrice: null,
    toggleEdit: (price: IPrice | null) => set({ editPrice: price })
}));


export { usePriceStore };
