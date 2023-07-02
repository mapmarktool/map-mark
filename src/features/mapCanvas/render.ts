import { Position } from "../../app/types"
import MapData, { Marker } from "../maps/MapData"
import { MouseState } from "../mouse/mouseState"
import Camera from "./Camera"
import { center, distance, rounded } from "./helpers"

interface RenderData {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  cameraPos: Position
  cameraZoom: number
  mouseState: MouseState
  map?: MapData
  markers?: Marker[]
  hoverMarker?: string
}

export const MARKER_SIZE = 8

export default function render({
  canvas,
  image,
  cameraPos,
  cameraZoom,
  mouseState: mouse,
  map,
  markers,
  hoverMarker,
}: RenderData) {
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return
  }

  const camera = new Camera(cameraPos, cameraZoom)

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.translate(camera.position.x, camera.position.y)
  ctx.scale(camera.zoom, camera.zoom)

  ctx.drawImage(image as CanvasImageSource, 0, 0, image.width, image.height)

  if (mouse.position) {
    ctx.fillStyle = "rgba(0,0,0,0.25)"
    ctx.fillRect(
      Math.round(mouse.position.x),
      Math.round(mouse.position.y),
      1,
      1,
    )

    // Rectangle creation
    // TODO: Handle this conditonal outside of the rendering
    if (mouse.buttons.left.startClickPos && mouse.buttons.left.pressed) {
      const startClickPos = mouse.buttons.left.startClickPos
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.strokeRect(
        Math.min(startClickPos.x, mouse.position.x),
        Math.min(startClickPos.y, mouse.position.y),
        Math.abs(startClickPos.x - mouse.position.x),
        Math.abs(startClickPos.y - mouse.position.y),
      )
      if (distance(startClickPos, mouse.position) > MARKER_SIZE) {
        ctx.fillStyle = "rgba(0,1,0,0.25)"
        const centerPos = rounded(center(startClickPos, mouse.position))
        ctx.fillRect(
          centerPos.x - MARKER_SIZE / 2,
          centerPos.y - MARKER_SIZE / 2,
          MARKER_SIZE,
          MARKER_SIZE,
        )
      }
    }
  }

  markers?.forEach((m) => {
    ctx.shadowColor = "black"
    ctx.shadowBlur = 10

    if (map?.activeMarker == m.id) {
      ctx.fillStyle = "#00ff33"
    } else if (hoverMarker == m.id) {
      ctx.fillStyle = "white"
    } else {
      ctx.fillStyle = "red"
    }

    ctx.strokeStyle = "#333"

    // TODO: Handle rendering of locations being dragged

    const pos = {
      x: m.x,
      y: m.y,
    }

    ctx.fillRect(
      pos.x - MARKER_SIZE / 2,
      pos.y - MARKER_SIZE / 2,
      MARKER_SIZE,
      MARKER_SIZE,
    )
    ctx.shadowBlur = 0
    ctx.strokeRect(
      pos.x - MARKER_SIZE / 2,
      pos.y - MARKER_SIZE / 2,
      MARKER_SIZE,
      MARKER_SIZE,
    )
  })
}
