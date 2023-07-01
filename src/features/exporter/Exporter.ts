import MapData, { Marker } from "../maps/MapData"

export interface Exporter {
  name: string
  exportMarker: (map: MapData, marker: Marker) => string
  exportMap: (map: MapData, markers: Marker[]) => string
}
