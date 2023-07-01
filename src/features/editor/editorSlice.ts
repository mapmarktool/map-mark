import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import MapData, { Marker } from "../maps/MapData"
import { Position } from "./MapCanvas"

interface EditorState {
  currentMap: string | null
  maps: MapData[]
}

const initialState: EditorState = {
  currentMap: null,
  maps: [],
}

interface CreateMapPayload {
  id: string
  image: string
  name: string
}

interface AddMarkerPayload {
  id: string
  x: number
  y: number
}

const getCurrMapIndex = (state: EditorState) => {
  return state.maps.findIndex((m) => m.id === state.currentMap)
}

const getActiveMarkerIndex = (state: EditorState) => {
  const mapIndex = getCurrMapIndex(state)
  if (mapIndex >= 0) {
    const map = state.maps[mapIndex]
    const active = map.activeMarker
    if (!active) {
      return -1
    }
    return map.markers.findIndex((m) => m.id == active)
  }

  return -1
}

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    newMap: (state, action: PayloadAction<CreateMapPayload>) => {
      const lastMap =
        state.maps.length > 0 ? state.maps[state.maps.length - 1] : null
      const bgColor = lastMap?.bgColor ?? undefined
      state.maps = [...state.maps, { bgColor, markers: [], ...action.payload }]
      state.currentMap = action.payload.id
    },
    selectMap: (state, action: PayloadAction<string>) => {
      if (state.maps.find((m) => action.payload === m.id)) {
        state.currentMap = action.payload
      }
    },
    setBgColor: (state, action: PayloadAction<string>) => {
      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        state.maps[mapIndex].bgColor = action.payload
      }
    },
    setActiveMarker: (state, action: PayloadAction<string | undefined>) => {
      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        if (!action.payload) {
          state.maps[mapIndex].activeMarker = undefined
          return
        }

        const marker = state.maps[mapIndex].markers.find(
          (m) => m.id == action.payload,
        )
        state.maps[mapIndex].activeMarker = marker?.id
      }
    },
    removeMarker: (state, action: PayloadAction<string>) => {
      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        const currMap = state.maps[mapIndex]
        state.maps[mapIndex].markers = currMap.markers.filter(
          (m) => m.id != action.payload,
        )

        if (currMap.activeMarker == action.payload) {
          state.maps[mapIndex].activeMarker = undefined
        }
      }
    },
    addMarker: (state, action: PayloadAction<AddMarkerPayload>) => {
      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        state.maps[mapIndex].markers.push({
          id: action.payload.id,
          x: Math.round(action.payload.x),
          y: Math.round(action.payload.y),
        })
      }
    },
    updateMarkerPosition: (state, action: PayloadAction<Position>) => {
      if (isNaN(action.payload.x) || isNaN(action.payload.y)) {
        return
      }

      const mapIndex = getCurrMapIndex(state)
      const activeMarkerIndex = getActiveMarkerIndex(state)

      if (mapIndex >= 0 && activeMarkerIndex >= 0) {
        state.maps[mapIndex].markers[activeMarkerIndex].x = Math.round(
          action.payload.x,
        )
        state.maps[mapIndex].markers[activeMarkerIndex].y = Math.round(
          action.payload.y,
        )
      }
    },
    updateMarkerName: (state, action: PayloadAction<string>) => {
      const mapIndex = getCurrMapIndex(state)
      const activeMarkerIndex = getActiveMarkerIndex(state)

      if (mapIndex >= 0 && activeMarkerIndex >= 0) {
        state.maps[mapIndex].markers[activeMarkerIndex].name = action.payload
      }
    },
  },
})

export const {
  selectMap,
  newMap,
  addMarker,
  removeMarker,
  updateMarkerPosition,
  updateMarkerName,
  setActiveMarker,
  setBgColor,
} = editorSlice.actions

export const getCurrentMap = (state: RootState) =>
  state.editor.maps.find((m) => m.id === state.editor.currentMap)
export const getMaps = (state: RootState) => state.editor.maps

export const editorReducer = editorSlice.reducer
