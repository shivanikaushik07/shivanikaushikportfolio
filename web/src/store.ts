import { create } from 'zustand'

// Global interaction state: which domain is open / hovered / whether the intro is done
interface StoreState {
  active: string | null // id of the open domain (null = overview)
  hovered: string | null // id of the hovered domain
  entered: boolean // has the intro been dismissed
  sceneProgress: number // cover artwork load progress 0-100 (replaces three's LoadingManager)
  setActive: (id: string | null) => void
  setHovered: (id: string | null) => void
  enter: () => void
  setSceneProgress: (n: number) => void
}

export const useStore = create<StoreState>((set) => ({
  active: null,
  hovered: null,
  entered: false,
  sceneProgress: 0,
  setActive: (id) => set({ active: id }),
  setHovered: (id) => set({ hovered: id }),
  enter: () => set({ entered: true }),
  setSceneProgress: (n) => set({ sceneProgress: n }),
}))

// Dev hook: in the console, __store.getState().setActive('ads')
declare global {
  interface Window {
    __store?: typeof useStore
  }
}
if (import.meta.env.DEV) window.__store = useStore
