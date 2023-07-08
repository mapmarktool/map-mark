import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import MapData, { Location } from "../maps/MapData"
import { Position } from "../../app/types"

interface EditorState {
  currentMap: string | null
  maps: MapData[]
  locations: Location[]
}

const initialState: EditorState = {
  currentMap: null,
  maps: [],
  locations: [],
}

export interface CreateMapPayload {
  id: string
  image: string
  name: string
}

export type UpdateMapPayload = CreateMapPayload

interface AddLocationPayload {
  id: string
  x: number
  y: number
}

const getCurrMapIndex = (state: EditorState) => {
  return state.maps.findIndex((m) => m.id === state.currentMap)
}

const getActiveLocationIndex = (state: EditorState) => {
  const mapIndex = getCurrMapIndex(state)
  if (mapIndex >= 0) {
    const map = state.maps[mapIndex]
    const active = map.activeLocation
    if (!active) {
      return -1
    }
    return state.locations.findIndex((l) => l.id == active)
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
      state.maps = [...state.maps, { bgColor, ...action.payload }]
      state.currentMap = action.payload.id
    },
    updateMap: (state, action: PayloadAction<UpdateMapPayload>) => {
      const mapIndex = state.maps.findIndex((m) => m.id == action.payload.id)
      if (mapIndex < 0) {
        return
      }
      state.maps[mapIndex] = {
        ...state.maps[mapIndex],
        ...action.payload,
      }
    },
    deleteMap: (state, action: PayloadAction<string>) => {
      state.maps = state.maps.filter((m) => m.id != action.payload)
      if (state.currentMap == action.payload) {
        state.currentMap = state.maps.length > 0 ? state.maps[0].id : null
      }
      state.locations = state.locations.filter((l) => l.map != action.payload)
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
    setActiveLocation: (state, action: PayloadAction<string | undefined>) => {
      const marker = state.locations.find((m) => m.id == action.payload)

      if (marker) {
        state.currentMap = marker.map
      }

      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        if (!action.payload) {
          state.maps[mapIndex].activeLocation = undefined
          state.maps[mapIndex].selectedLocations = undefined
          return
        }

        state.maps[mapIndex].activeLocation = marker?.id
        state.maps[mapIndex].selectedLocations = marker
          ? [marker.id]
          : undefined
      }
    },
    setLocationParent: (
      state,
      action: PayloadAction<{ id: string; parent?: string }>,
    ) => {
      const markerIndex = state.locations.findIndex(
        (m) => m.id == action.payload.id,
      )

      state.locations[markerIndex].parentId = action.payload.parent
    },
    setSelectedLocations: (
      state,
      action: PayloadAction<string[] | undefined>,
    ) => {
      const mapIndex = getCurrMapIndex(state)
      if (mapIndex >= 0) {
        state.maps[mapIndex].selectedLocations = action.payload
      }
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter((m) => m.id != action.payload)

      state.maps = state.maps.map((m) => ({
        ...m,
        selectedLocations: m.selectedLocations?.filter(
          (l) => l != action.payload,
        ),
        activeLocation:
          m.activeLocation == action.payload ? undefined : m.activeLocation,
      }))

      state.locations.forEach((m) => {
        m.parentId = m.parentId == action.payload ? undefined : m.parentId
      })
    },
    addLocation: (state, action: PayloadAction<AddLocationPayload>) => {
      if (!state.currentMap) {
        return
      }

      state.locations.push({
        id: action.payload.id,
        map: state.currentMap,
        x: Math.round(action.payload.x),
        y: Math.round(action.payload.y),
      })
    },
    updateLocationPosition: (state, action: PayloadAction<Position>) => {
      if (isNaN(action.payload.x) || isNaN(action.payload.y)) {
        return
      }

      const activeMarkerIndex = getActiveLocationIndex(state)

      if (activeMarkerIndex >= 0) {
        state.locations[activeMarkerIndex].x = Math.round(action.payload.x)
        state.locations[activeMarkerIndex].y = Math.round(action.payload.y)
      }
    },
    updateLocationName: (state, action: PayloadAction<string>) => {
      const activeMarkerIndex = getActiveLocationIndex(state)
      state.locations[activeMarkerIndex].name = action.payload
    },
  },
})

export const {
  selectMap,
  newMap,
  deleteMap,
  updateMap,
  addLocation,
  removeLocation,
  updateLocationPosition,
  updateLocationName,
  setActiveLocation,
  setLocationParent,
  setSelectedLocations,
  setBgColor,
} = editorSlice.actions

export const getCurrentMap = (state: RootState) =>
  state.editor.maps.find((m) => m.id === state.editor.currentMap)
export const getMaps = (state: RootState) => state.editor.maps
export const getLocations = (state: RootState) => state.editor.locations

export const editorReducer = editorSlice.reducer
