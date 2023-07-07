import { Box } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  addMarker,
  getCurrentMap,
  removeMarker,
  setActiveMarker,
  setMarkerParent,
  setSelectedMarkers,
  updateMarkerPosition,
} from "../editor/editorSlice"
import { useEffect, useRef, useState } from "react"
import {
  distance,
  duration,
  findHoveredMarker,
  screenToWorldPosition,
} from "./helpers"
import { Position } from "../../app/types"
import render, { MARKER_SIZE } from "./render"
import { current } from "@reduxjs/toolkit"
import useInput from "../input/useInput"

interface MapCanvasProps {}

const ZOOM_STEP = 0.25
const DRAG_THRESHOLD = 300

const MapCanvas = ({}: MapCanvasProps) => {
  const [windowDimension, setWindowDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const [cameraPos, setCameraPos] = useState<Position>({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement>()
  const [cameraZoom, setCameraZoom] = useState<number>(1)
  const [hoverMarker, setHoverMarker] = useState<string | undefined>()
  const [startedDragOnMarker, setStartedDragOnMarker] = useState(false)
  const [draggingMarkers, setDraggingMarkers] = useState(false)
  const dispatch = useAppDispatch()
  const currentMap = useAppSelector(getCurrentMap)
  const canvas = useRef<HTMLCanvasElement>(null)
  const {
    mouseState: mouse,
    updateMouse,
    keyboardState: keyboard,
    updateKeyboard,
  } = useInput({
    parent: canvas,
    worldPositionTransform: (pos: Position) =>
      screenToWorldPosition(pos, cameraPos, cameraZoom),
  })
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
    if (!canvas.current || !image) {
      return
    }

    render({
      canvas: canvas.current,
      image,
      cameraPos,
      cameraZoom,
      mouseState: mouse,
      map: currentMap,
      markers,
      hoverMarker,
      draggingMarkers,
    })
  }, [
    canvas,
    image,
    windowDimension, // Not actually used, just used to force re-render when browser is resized
    cameraPos,
    cameraZoom,
    mouse,
    markers,
    currentMap?.activeMarker,
    currentMap?.selectedMarkers,
    draggingMarkers,
    hoverMarker,
  ])

  // Controls
  useEffect(() => {
    if (!mouse.position) {
      updateMouse()
      return
    }

    if (mouse.wheelMovement) {
      const delta = mouse.wheelMovement < 0 ? ZOOM_STEP : -ZOOM_STEP
      setCameraZoom(Math.max(cameraZoom + delta, 0.1))
    }

    // Check if hovering marker
    if (markers) {
      setHoverMarker(findHoveredMarker(markers, mouse)?.id)
    }

    if (
      mouse.buttons.left.pressed &&
      startedDragOnMarker &&
      duration(mouse.buttons.left.holdStart) >= DRAG_THRESHOLD
    ) {
      setDraggingMarkers(true)
    }

    if (mouse.buttons.left.justReleased && draggingMarkers && mouse.position) {
      if (currentMap?.activeMarker) {
        dispatch(updateMarkerPosition(mouse.position))
      }
      setStartedDragOnMarker(false)
      setDraggingMarkers(false)
    }

    if (hoverMarker) {
      if (mouse.buttons.left.justPressed) {
        setStartedDragOnMarker(true)
        dispatch(setActiveMarker(hoverMarker))
      }
      if (
        mouse.buttons.right.justReleased &&
        duration(mouse.buttons.right.holdStart) <= 300
      ) {
        dispatch(removeMarker(hoverMarker))
        dispatch(setSelectedMarkers(undefined))
      }
    } else {
      if (
        (mouse.buttons.right.pressed || mouse.buttons.middle.pressed) &&
        mouse.movement
      ) {
        setCameraPos({
          x: cameraPos.x + mouse.movement.x,
          y: cameraPos.y + mouse.movement.y,
        })
      }

      if (
        mouse.buttons.right.justReleased &&
        duration(mouse.buttons.right.holdStart) < 300
      ) {
        dispatch(setActiveMarker(undefined))
      }

      if (
        mouse.buttons.left.justReleased &&
        mouse.buttons.left.startClickPos &&
        duration(mouse.buttons.left.holdStart) < 300 &&
        distance(mouse.buttons.left.startClickPos, mouse.position) < MARKER_SIZE
      ) {
        // Create a new marker
        const id = crypto.randomUUID()

        dispatch(
          addMarker({
            id,
            ...mouse.position,
          }),
        )

        // If shift is held, automatically parent it to previous marker
        if (keyboard.keys.shift.pressed && currentMap?.activeMarker) {
          dispatch(setMarkerParent({ id, parent: currentMap.activeMarker }))
        }

        dispatch(setActiveMarker(id))
      }

      if (
        !startedDragOnMarker &&
        mouse.buttons.left.justReleased &&
        mouse.buttons.left.startClickPos &&
        distance(mouse.buttons.left.startClickPos, mouse.position) > MARKER_SIZE
      ) {
        const startPos = {
          x: Math.min(mouse.buttons.left.startClickPos.x, mouse.position.x),
          y: Math.min(mouse.buttons.left.startClickPos.y, mouse.position.y),
        }
        const endPos = {
          x: Math.max(mouse.buttons.left.startClickPos.x, mouse.position.x),
          y: Math.max(mouse.buttons.left.startClickPos.y, mouse.position.y),
        }
        const selected = markers
          ?.filter(
            (m) =>
              m.x > startPos.x &&
              m.x < endPos.x &&
              m.y > startPos.y &&
              m.y < endPos.y,
          )
          .map((m) => m.id)
        dispatch(setSelectedMarkers(selected))
      }
    }

    updateMouse()
    updateKeyboard()
  }, [
    mouse,
    updateMouse,
    keyboard,
    updateKeyboard,
    markers,
    hoverMarker,
    currentMap?.activeMarker,
  ])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code == "Delete" && currentMap?.selectedMarkers) {
        currentMap.selectedMarkers.forEach((id) => {
          dispatch(removeMarker(id))
        })
      }
    }

    window.addEventListener("keydown", onKeyDown, false)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [currentMap?.selectedMarkers])

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
