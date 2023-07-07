export interface Location {
  id: string
  map: string
  name?: string
  parentId?: string
  x: number
  y: number
}

export default interface MapData {
  id: string
  name: string
  image: string
  bgColor?: string
  activeLocation?: string
  selectedLocations?: string[]
}
