import { Box } from "@mui/material"
import { useState } from "react"
import EditorToolbar, { Tool } from "./EditorToolbar"
import MapCanvas from "../mapCanvas/MapCanvas"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { getCurrentMap } from "./editorSlice"
import DetailsPane from "./DetailsPane"

interface MapEditorProps {}

const MapEditor = ({}: MapEditorProps) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        color: "white",
        padding: 0,
      }}
    >
      {/* 
      <EditorToolbar />
    */}
      <DetailsPane />
      <MapCanvas />
    </Box>
  )
}

export default MapEditor
