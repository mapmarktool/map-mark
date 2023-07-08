import MapData, { Location } from "../features/maps/MapData"
import { RootState } from "./store"

export interface SaveData {
  maps: Omit<MapData, "image">[]
  locations: Location[]
  version: SaveVersion
  changelogChecksum?: string
}

export enum SaveVersion {
  One = "1",
}

export const CURRENT_SAVE_VERSION = SaveVersion.One

export function serializeState(state: RootState) {
  const data: SaveData = {
    maps: state.editor.maps.map((m) => ({
      ...m,
      image: undefined,
    })),
    locations: state.editor.locations,
    changelogChecksum: state.ui.changelog.checksum,
    version: CURRENT_SAVE_VERSION,
  }
  return JSON.stringify(data)
}

export function deserializeState(data: string) {
  const saveData: SaveData = JSON.parse(data)

  if (!saveData.version) {
    console.error("Save data lacks version, save data is probably broken.")
  }

  return saveData
}
