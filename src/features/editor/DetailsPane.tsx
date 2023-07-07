import {
  Paper,
  List,
  ListItem,
  Typography,
  Box,
  Stack,
  ListItemText,
  ListItemButton,
  Divider,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Autocomplete,
} from "@mui/material"
import ColorPicker from "./ColorPicker"
import {
  getCurrentMap,
  setActiveMarker,
  setBgColor,
  setMarkerParent,
  updateMarkerName,
  updateMarkerPosition,
} from "./editorSlice"
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { Fragment, useEffect, useRef, useState } from "react"
import EmotrackerExporter from "../exporter/emoTracker/EmoTrackerExporter"
import ExportDialog from "../exporter/ExportDialog"
import { Marker } from "../maps/MapData"
import { FileCopy, SelectAllOutlined } from "@mui/icons-material"
import { copyToClipboard } from "../../helpers"

interface DetailsPaneProps {}

const DetailsPane = ({}: DetailsPaneProps) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportMarkers, setExportMarkers] = useState<Marker[] | Marker>([])
  const currentMap = useAppSelector(getCurrentMap)
  const dispatch = useAppDispatch()
  const nameField = useRef<HTMLInputElement>()
  const markers = currentMap?.markers.map((m) => (
    <Fragment key={m.id}>
      <ListItemButton
        key={m.id}
        onClick={() => dispatch(setActiveMarker(m.id))}
        selected={currentMap.activeMarker == m.id}
      >
        <ListItemText primary={m.name} secondary={`${m.x}, ${m.y}`} />
      </ListItemButton>
      <Divider />
    </Fragment>
  ))
  const activeMarker = currentMap?.markers.find(
    (m) => m.id == currentMap?.activeMarker,
  )

  useEffect(() => {
    nameField.current?.focus()
  }, [markers?.length])

  return (
    <Paper elevation={2} sx={{ width: 300, borderRadius: 0, padding: 2 }}>
      <Stack gap={2}>
        <Box>
          <Typography variant="overline" display="block">
            Active Marker
          </Typography>
          <Paper elevation={6} sx={{ padding: 2 }}>
            <TextField
              inputRef={nameField}
              disabled={!activeMarker}
              value={activeMarker?.name ?? ""}
              onChange={(e) =>
                dispatch(updateMarkerName(e.currentTarget.value))
              }
              label="Name"
              fullWidth
            />
            <Stack direction={"row"} sx={{ marginTop: 2 }} gap={2}>
              <TextField
                disabled={!activeMarker}
                size="small"
                onChange={(e) => {
                  const x = parseInt(e.currentTarget.value)
                  dispatch(
                    updateMarkerPosition({
                      x: isNaN(x) ? 0 : x,
                      y: activeMarker?.y ?? 0,
                    }),
                  )
                }}
                value={activeMarker?.x ?? ""}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">x</InputAdornment>
                  ),
                }}
              />
              <TextField
                disabled={!activeMarker}
                size="small"
                onChange={(e) => {
                  const y = parseInt(e.currentTarget.value)
                  dispatch(
                    updateMarkerPosition({
                      x: activeMarker?.x ?? 0,
                      y: isNaN(y) ? 0 : y,
                    }),
                  )
                }}
                value={activeMarker?.y ?? ""}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">y</InputAdornment>
                  ),
                }}
              />
              <Tooltip placement="right" title="Copy position to clipboard">
                <span>
                  <IconButton
                    aria-label="Copy"
                    disabled={!activeMarker}
                    onClick={() => {
                      if (activeMarker) {
                        copyToClipboard(
                          `
"x": ${activeMarker.x},
"y": ${activeMarker.y}`,
                        )
                      }
                    }}
                  >
                    <FileCopy />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => {
                if (currentMap && activeMarker) {
                  setExportMarkers(activeMarker)
                  setExportDialogOpen(true)
                }
              }}
            >
              Export
            </Button>
          </Paper>
        </Box>
        <Box>
          <Typography variant="overline" display="block">
            Markers
          </Typography>
          <Paper elevation={6} sx={{ overflow: "scroll", height: "50vh" }}>
            {markers && markers.length > 0 && (
              <List sx={{ padding: 0 }}>{markers}</List>
            )}
          </Paper>
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={() => {
              if (currentMap) {
                setExportMarkers(currentMap.markers)
                setExportDialogOpen(true)
              }
            }}
          >
            Export
          </Button>
        </Box>
        <Box>
          <Typography variant="overline" display="block">
            Background
          </Typography>
          <ColorPicker
            width={32}
            height={32}
            color={currentMap?.bgColor ?? "#000"}
            onChange={(hex) => dispatch(setBgColor(hex))}
          />
        </Box>
        <ExportDialog
          open={exportDialogOpen}
          map={currentMap}
          markers={exportMarkers}
          onClose={() => setExportDialogOpen(false)}
        />
      </Stack>
    </Paper>
  )
}

export default DetailsPane
