import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { editorReducer } from "../features/editor/editorSlice"
import { uiReducer } from "../features/ui/uiSlice"

export const store = (preloadedState?: RootState) => {
  const store = configureStore({
    reducer: {
      editor: editorReducer,
      ui: uiReducer,
    },
    preloadedState: preloadedState,
  })
  return store
}

export type AppStore = ReturnType<typeof store>
export type AppDispatch = AppStore["dispatch"]
export type RootState = {
  editor: ReturnType<typeof editorReducer>
  ui: ReturnType<typeof uiReducer>
}
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
