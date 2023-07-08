import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

interface UiState {
  changelog: {
    open: boolean
    content?: string
    checksum?: string
  }
}

const initialState: UiState = {
  changelog: {
    open: false,
  },
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setChangelogOpen: (state, action: PayloadAction<boolean>) => {
      state.changelog.open = action.payload
    },
    setChangelogContent: (state, action: PayloadAction<string>) => {
      state.changelog.content = action.payload
      state.changelog.checksum = action.payload.length.toString()
    },
  },
})

export const { setChangelogOpen, setChangelogContent } = uiSlice.actions

export const getUi = (state: RootState) => state.ui
export const getChangelog = (state: RootState) => state.ui.changelog

export const uiReducer = uiSlice.reducer
