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
  AutocompleteRenderInputParams,
} from "@mui/material"
import ColorPicker from "./ColorPicker"
import {
  getCurrentMap,
  getLocations,
  getMaps,
  setActiveLocation,
  setBgColor,
  setLocationParent,
  updateLocationName,
  updateLocationPosition,
} from "./editorSlice"
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { Fragment, ReactNode, useEffect, useRef, useState } from "react"
import EmotrackerExporter from "../exporter/emoTracker/EmoTrackerExporter"
import ExportDialog from "../exporter/ExportDialog"
import { Location } from "../maps/MapData"
import { FileCopy, SelectAllOutlined } from "@mui/icons-material"
import { copyToClipboard } from "../../helpers"

interface DetailsPaneProps {}

const DetailsPane = ({}: DetailsPaneProps) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportLocations, setExportLocations] = useState<Location[] | Location>(
    [],
  )
  const maps = useAppSelector(getMaps)
  const currentMap = useAppSelector(getCurrentMap)
  const locations = useAppSelector(getLocations)
  const dispatch = useAppDispatch()
  const nameField = useRef<HTMLInputElement>()
  const locationItems = locations.map((m) => (
    <Fragment key={m.id}>
      <ListItemButton
        key={m.id}
        onClick={() => dispatch(setActiveLocation(m.id))}
        selected={currentMap?.activeLocation == m.id}
      >
        <ListItemText
          primary={m.name}
          secondary={`${maps.find((map) => map.id == m.map)?.name} (${m.x}, ${
            m.y
          })`}
        />
      </ListItemButton>
      <Divider />
    </Fragment>
  ))
  const activeLocation = locations?.find(
    (m) => m.id == currentMap?.activeLocation,
  )

  const locationParentCandidates = activeLocation
    ? locations.filter(
        (l) => l.id != activeLocation.id && l.parentId != activeLocation.id,
      )
    : []

  const currentLocationParent = locations.find(
    (l) => l.id == activeLocation?.parentId,
  )

  useEffect(() => {
    nameField.current?.focus()
  }, [locations?.length])

  function getLocationLabel(location: Location) {
    const name = location.name ?? `${location.x}, ${location.y}`
    return `${maps.find((m) => m.id == location.map)?.name} - ${name}`
  }

  return (
    <Paper elevation={2} sx={{ width: 300, borderRadius: 0, padding: 2 }}>
      <Stack gap={2}>
        <Box>
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
          <Typography variant="overline" display="block">
            Active Location
          </Typography>
          <Paper elevation={6} sx={{ padding: 2 }}>
            <TextField
              inputRef={nameField}
              disabled={!activeLocation}
              value={activeLocation?.name ?? ""}
              onChange={(e) =>
                dispatch(updateLocationName(e.currentTarget.value))
              }
              label="Name"
              fullWidth
            />
            <Stack direction={"row"} sx={{ marginTop: 2 }} gap={2}>
              <TextField
                disabled={!activeLocation}
                size="small"
                onChange={(e) => {
                  const x = parseInt(e.currentTarget.value)
                  dispatch(
                    updateLocationPosition({
                      x: isNaN(x) ? 0 : x,
                      y: activeLocation?.y ?? 0,
                    }),
                  )
                }}
                value={activeLocation?.x ?? ""}
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
                disabled={!activeLocation}
                size="small"
                onChange={(e) => {
                  const y = parseInt(e.currentTarget.value)
                  dispatch(
                    updateLocationPosition({
                      x: activeLocation?.x ?? 0,
                      y: isNaN(y) ? 0 : y,
                    }),
                  )
                }}
                value={activeLocation?.y ?? ""}
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
                    disabled={!activeLocation}
                    onClick={() => {
                      if (activeLocation) {
                        copyToClipboard(
                          `
"x": ${activeLocation.x},
"y": ${activeLocation.y}`,
                        )
                      }
                    }}
                  >
                    <FileCopy />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Autocomplete
              sx={{ marginTop: 2 }}
              renderInput={(params) => <TextField {...params} label="Parent" />}
              options={locationParentCandidates}
              value={currentLocationParent ?? null}
              onChange={(_, location) =>
                activeLocation &&
                dispatch(
                  setLocationParent({
                    id: activeLocation.id,
                    parent: location?.id,
                  }),
                )
              }
              getOptionLabel={getLocationLabel}
            />
            <Button
              variant="outlined"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => {
                if (currentMap && activeLocation) {
                  setExportLocations(activeLocation)
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
            Locations
          </Typography>
          <Paper elevation={6} sx={{ overflow: "scroll", height: "50vh" }}>
            {locationItems && locationItems.length > 0 && (
              <List sx={{ padding: 0 }}>{locationItems}</List>
            )}
          </Paper>
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={() => {
              if (currentMap) {
                setExportLocations(locations)
                setExportDialogOpen(true)
              }
            }}
          >
            Export
          </Button>
        </Box>
        <ExportDialog
          open={exportDialogOpen}
          locations={exportLocations}
          onClose={() => setExportDialogOpen(false)}
        />
      </Stack>
    </Paper>
  )
}

export default DetailsPane
