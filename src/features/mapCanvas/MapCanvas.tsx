import { Box } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  addMarker,
  getCurrentMap,
  removeMarker,
  setActiveMarker,
} from "../editor/editorSlice"
import { useEffect, useRef, useState } from "react"
import { duration, findHoveredMarker, screenToWorldPosition } from "./helpers"
import { Position } from "../../app/types"
import useMouse from "../mouse/useMouse"
import render from "./render"

interface MapCanvasProps {}

const ZOOM_STEP = 0.25

const MapCanvas = ({}: MapCanvasProps) => {
  const [windowDimension, setWindowDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const [cameraPos, setCameraPos] = useState<Position>({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement>()
  const [cameraZoom, setCameraZoom] = useState<number>(1)
  const [hoverMarker, setHoverMarker] = useState<string | undefined>()

  const dispatch = useAppDispatch()
  const currentMap = useAppSelector(getCurrentMap)
  const canvas = useRef<HTMLCanvasElement>(null)
  const { mouseState: mouse, updateMouse } = useMouse({
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

    if (hoverMarker) {
      if (mouse.buttons.left.justPressed) {
        dispatch(setActiveMarker(hoverMarker))
      }
      if (
        mouse.buttons.right.justReleased &&
        duration(mouse.buttons.right.holdStart) <= 300
      ) {
        dispatch(removeMarker(hoverMarker))
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
        mouse.buttons.left.justReleased &&
        duration(mouse.buttons.left.holdStart) <= 300
      ) {
        const id = crypto.randomUUID()

        // TODO: Drag rectangle positioning

        dispatch(
          addMarker({
            id,
            ...mouse.position,
          }),
        )
        dispatch(setActiveMarker(id))
        //setHoverMarker(id)
      }
    }

    updateMouse()
  }, [mouse, updateMouse, markers, hoverMarker])

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
