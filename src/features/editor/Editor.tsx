import { AppBar, Box, Button, Toolbar } from "@mui/material"
import EditorTabs from "./EditorTabs"
import MapEditor from "./MapEditor"
import {
  AddCircle,
  GitHub,
  InfoRounded,
  RemoveCircle,
  Settings,
  Upload,
} from "@mui/icons-material"
import { useAppSelector } from "../../app/hooks"
import { getCurrentMap, getMaps } from "./editorSlice"
import { useState } from "react"
import MapForm from "../maps/MapForm"
import MapData from "../maps/MapData"
import { useDispatch } from "react-redux"
import { setChangelogOpen } from "../ui/uiSlice"
interface EditorProps {}

const Editor = ({}: EditorProps) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false)
  const [mapDialogData, setMapDialogData] = useState<MapData | undefined>(
    undefined,
  )
  const currentMap = useAppSelector(getCurrentMap)
  const maps = useAppSelector(getMaps)
  const dispatch = useDispatch()

  return (
    <Box
      sx={{
        minWidth: "100vw",
        minHeight: "100vh",
        bgcolor: "#000",
      }}
      display="flex"
      flexDirection={"column"}
    >
      <AppBar elevation={1}>
        <MapForm
          open={mapDialogOpen || maps.length == 0}
          onClose={() => {
            setMapDialogOpen(false)
            setMapDialogData(undefined)
          }}
          map={mapDialogData}
        />
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              color="inherit"
              onClick={() => setMapDialogOpen(true)}
              startIcon={<AddCircle />}
              aria-label="add new"
              sx={{ mr: 2 }}
            >
              New map
            </Button>
            <Button
              color="inherit"
              onClick={() => {
                setMapDialogData(currentMap)
                setMapDialogOpen(true)
              }}
              startIcon={<Settings />}
              aria-label="settings"
              sx={{ mr: 2 }}
            >
              Map settings
            </Button>
          </Box>
          <Button
            color="inherit"
            onClick={() => dispatch(setChangelogOpen(true))}
            startIcon={<InfoRounded />}
            aria-label="changelog"
            sx={{ mr: 2 }}
          >
            Changelog
          </Button>
          <Button
            color="inherit"
            onClick={() => dispatch(setChangelogOpen(true))}
            startIcon={<GitHub />}
            aria-label="changelog"
            href="https://github.com/mapmarktool/map-mark/"
            target="_blank"
          ></Button>
        </Toolbar>
      </AppBar>
      <EditorTabs />
      {currentMap && <MapEditor />}
    </Box>
  )
}

export default Editor
