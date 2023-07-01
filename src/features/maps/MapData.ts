export interface Marker {
  id: string
  name?: string
  x: number
  y: number
}
export default interface MapData {
  id: string
  name: string
  image: string
  bgColor?: string
  markers: Marker[]
  activeMarker?: string
}
