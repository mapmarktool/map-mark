import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import EditorTabs from "./EditorTabs"
import MapEditor from "./MapEditor"
import { AddCircle } from "@mui/icons-material"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { getCurrentMap, getMaps, newMap } from "./editorSlice"
import { useState } from "react"
import MapForm from "../maps/MapForm"
interface EditorProps {}

const Editor = ({}: EditorProps) => {
  const [newMapOpen, setNewMapOpen] = useState(false)
  const currentMap = useAppSelector(getCurrentMap)
  const maps = useAppSelector(getMaps)

  return (
    <Box
      sx={{
        minWidth: "100vw",
        minHeight: "100vh",
        bgcolor: "primary.dark",
      }}
      display="flex"
      flexDirection={"column"}
    >
      <AppBar elevation={1}>
        <MapForm
          open={newMapOpen || maps.length == 0}
          onClose={() => setNewMapOpen(false)}
        />
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 4 }}
          >
            <MenuIcon />
          </IconButton>
          <Button
            color="inherit"
            onClick={() => setNewMapOpen(true)}
            startIcon={<AddCircle />}
            aria-label="add new"
            sx={{ mr: 2 }}
          >
            New
          </Button>
        </Toolbar>
      </AppBar>
      <EditorTabs onClickNew={() => setNewMapOpen(true)} />
      {currentMap && <MapEditor />}
    </Box>
  )
}

export default Editor
