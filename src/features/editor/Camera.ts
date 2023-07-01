import { Position } from "./MapCanvas"

export default class Camera {
  public position: Position
  public zoom: number

  constructor(position: Position, zoom: number) {
    this.position = position
    this.zoom = zoom
  }

  GetScreenPosition(pos: Position): Position {
    return {
      x: pos.x + this.position.x,
      y: pos.y + this.position.y,
    }
  }
}
