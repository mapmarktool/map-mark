import MapData, { Location } from "../maps/MapData"

export interface Exporter {
  name: string
  exportLocation: (maps: MapData[], location: Location) => string
  exportLocations: (maps: MapData[], locations: Location[]) => string
}
