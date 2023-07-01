import { Box } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  addMarker,
  getCurrentMap,
  removeMarker,
  setActiveMarker,
  updateMarkerPosition,
} from "./editorSlice"
import { useEffect, useRef, useState } from "react"
import Camera from "./Camera"
import { center, distance, rounded } from "./mapCanvas.helpers"

interface MapCanvasProps {}

export interface Position {
  x: number
  y: number
}

const ZOOM_STEP = 0.25
const MARKER_SIZE = 8
const DRAG_TIME = 300

const MapCanvas = ({}: MapCanvasProps) => {
  const [windowDimension, setWindowDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const [cameraPos, setCameraPos] = useState<Position>({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement>()
  const [cameraZoom, setCameraZoom] = useState<number>(1)
  const [hoverMarker, setHoverMarker] = useState<string | undefined>()
  const [currentMousePos, setCurrentMousePos] = useState<Position | undefined>()
  const [startClickPos, setStartClickPos] = useState<Position | undefined>()
  const [startClickTime, setStartClickTime] = useState<number | undefined>()
  const [draggingActive, setDraggingActive] = useState(false)

  const dispatch = useAppDispatch()
  const currentMap = useAppSelector(getCurrentMap)
  const canvas = useRef<HTMLCanvasElement>(null)
  const imageData = currentMap?.image
  const markers = currentMap?.markers

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      if (!canvas.current) {
        return
      }
      canvas.current.style.width = "0px"
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  })

  useEffect(() => {
    if (!imageData) {
      return
    }

    const image = new Image()
    image.src = imageData

    image.onload = () => {
      setImage(image)

      if (canvas?.current) {
        setCameraPos({
          x: (canvas.current.clientWidth - image.width) / 2 / cameraZoom,
          y: (canvas.current.clientHeight - image.height) / 2 / cameraZoom,
        })
      }
    }
  }, [imageData, canvas])

  useEffect(() => {
    if (!canvas.current) {
      return
    }

    const ctx = canvas.current.getContext("2d")
    if (!ctx || !image) {
      return
    }

    const camera = new Camera(cameraPos, cameraZoom)

    canvas.current.width = canvas.current.clientWidth
    canvas.current.height = canvas.current.clientHeight

    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)

    ctx.translate(camera.position.x, camera.position.y)
    ctx.scale(camera.zoom, camera.zoom)

    ctx.drawImage(image as CanvasImageSource, 0, 0, image.width, image.height)

    if (currentMousePos) {
      ctx.fillStyle = "rgba(0,0,0,0.25)"
      ctx.fillRect(
        Math.round(currentMousePos.x),
        Math.round(currentMousePos.y),
        1,
        1,
      )

      // Rectangle creation
      if (startClickPos && !draggingActive) {
        ctx.strokeStyle = "rgba(0,0,0,0.25)"
        ctx.strokeRect(
          Math.min(startClickPos.x, currentMousePos.x),
          Math.min(startClickPos.y, currentMousePos.y),
          Math.abs(startClickPos.x - currentMousePos.x),
          Math.abs(startClickPos.y - currentMousePos.y),
        )
        if (distance(startClickPos, currentMousePos) > MARKER_SIZE) {
          ctx.fillStyle = "rgba(0,1,0,0.25)"
          const centerPos = rounded(center(startClickPos, currentMousePos))
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

      if (currentMap?.activeMarker == m.id) {
        ctx.fillStyle = "#00ff33"
      } else if (hoverMarker == m.id) {
        ctx.fillStyle = "white"
      } else {
        ctx.fillStyle = "red"
      }

      ctx.strokeStyle = "#333"

      const pos =
        currentMap &&
        currentMap.activeMarker == m.id &&
        currentMousePos &&
        draggingActive &&
        startClickTime &&
        startClickTime + DRAG_TIME < Date.now()
          ? rounded(currentMousePos)
          : {
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
  }, [
    canvas,
    image,
    windowDimension,
    cameraPos,
    cameraZoom,
    markers,
    currentMap?.activeMarker,
    hoverMarker,
    currentMousePos,
    draggingActive,
    startClickPos,
  ])

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      // Panning
      if (e.buttons & 4) {
        setCameraPos({
          x: cameraPos.x + e.movementX,
          y: cameraPos.y + e.movementY,
        })
        e.preventDefault()
      }

      // Update mouse position
      setCurrentMousePos({
        x: (e.offsetX - cameraPos.x) / cameraZoom,
        y: (e.offsetY - cameraPos.y) / cameraZoom,
      })

      if (!markers) {
        return
      }

      if (!currentMousePos) {
        return
      }

      // Check if hovering marker
      const halfMarker = MARKER_SIZE / 2
      const hover = [...markers]
        .reverse()
        .find(
          (m) =>
            currentMousePos.x > m.x - halfMarker &&
            currentMousePos.x < m.x + halfMarker &&
            currentMousePos.y > m.y - halfMarker &&
            currentMousePos.y < m.y + halfMarker,
        )

      setHoverMarker(hover?.id)
    }

    const mouseClickHandler = (e: MouseEvent) => {
      if (!currentMousePos) {
        return
      }

      if (e.button === 0) {
        if (hoverMarker) {
          dispatch(setActiveMarker(hoverMarker))
          setDraggingActive(true)
        }

        setStartClickPos(currentMousePos)
        setStartClickTime(Date.now())
      }
    }

    const mouseClickReleaseHandler = (e: MouseEvent) => {
      e.preventDefault()

      if (!currentMousePos) {
        return
      }

      // Left click
      if (e.button === 0) {
        if (
          draggingActive &&
          startClickTime &&
          startClickTime + DRAG_TIME < Date.now()
        ) {
          setDraggingActive(false)
          dispatch(updateMarkerPosition(currentMousePos))
          setStartClickPos(undefined)
          setStartClickTime(undefined)
          return
        } else {
          setDraggingActive(false)
        }

        if (!hoverMarker) {
          // Add new marker if not currently hovering one
          const id = crypto.randomUUID()

          // If dragging a rectangle, put marker in the center
          const pos =
            startClickPos &&
            distance(currentMousePos, startClickPos) > MARKER_SIZE
              ? center(currentMousePos, startClickPos)
              : currentMousePos

          dispatch(
            addMarker({
              id,
              ...pos,
            }),
          )
          dispatch(setActiveMarker(id))
          setHoverMarker(id)
        }

        setStartClickPos(undefined)
        setStartClickTime(undefined)
      }

      // Right click
      if (e.button === 2) {
        if (hoverMarker) {
          dispatch(removeMarker(hoverMarker))
        }
      }
    }

    const mouseLeaveHandler = (e: MouseEvent) => {
      setDraggingActive(false)
      setCurrentMousePos(undefined)
    }

    const mouseWheelHandler = (e: WheelEvent) => {
      if (!canvas.current) {
        return
      }

      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP

      setCameraZoom(Math.max(cameraZoom + delta, 0.1))
      e.preventDefault()
    }

    const contextMenuHandler = (e: MouseEvent) => {
      e.preventDefault()
    }

    canvas.current?.addEventListener("mousemove", mouseMoveHandler, false)
    canvas.current?.addEventListener("mousedown", mouseClickHandler, false)
    canvas.current?.addEventListener("mouseup", mouseClickReleaseHandler, false)
    canvas.current?.addEventListener("mouseleave", mouseLeaveHandler, false)
    canvas.current?.addEventListener("wheel", mouseWheelHandler, false)
    canvas.current?.addEventListener("contextmenu", contextMenuHandler, false)

    return () => {
      canvas.current?.removeEventListener("mousemove", mouseMoveHandler)
      canvas.current?.removeEventListener("mousedown", mouseClickHandler)
      canvas.current?.removeEventListener("mouseup", mouseClickReleaseHandler)
      canvas.current?.removeEventListener("mouseleave", mouseLeaveHandler)
      canvas.current?.removeEventListener("wheel", mouseWheelHandler)
      canvas.current?.removeEventListener("contextmenu", contextMenuHandler)
    }
  }, [
    canvas,
    cameraPos,
    cameraZoom,
    hoverMarker,
    currentMap?.markers,
    startClickPos,
    currentMousePos,
  ])

  return (
    <Box
      ref={canvas}
      component={"canvas"}
      sx={{
        flexGrow: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: currentMap?.bgColor,
      }}
    ></Box>
  )
}

export default MapCanvas
