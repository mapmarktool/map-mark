import {
  Box,
  Button,
  Dialog,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material"
import MapData, { Marker } from "../maps/MapData"
import { useEffect, useState } from "react"
import { Exporter } from "./Exporter"
import EmotrackerExporter from "./emoTracker/EmoTrackerExporter"
import { copyToClipboard } from "../../helpers"

interface ExportDialogProps {
  map?: MapData
  markers?: Marker[]
  open: boolean
  onClose: () => void
}

const ExportDialog = ({ map, markers, open, onClose }: ExportDialogProps) => {
  const [exporter, setExporter] = useState<Exporter>(EmotrackerExporter)
  const [output, setOutput] = useState("")

  useEffect(() => {
    if (exporter && map && markers) {
      setOutput(exporter.exportMap(map, markers))
    }
  }, [exporter, map, markers])

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <Box p={4}>
        <Stack gap={2}>
          <FormControl fullWidth>
            <InputLabel id="exporter-label">Exporter</InputLabel>
            <Select
              value={exporter.name}
              labelId="exporter-label"
              label="Expoter"
              onChange={(e) => {
                switch (e.target.value) {
                  case EmotrackerExporter.name:
                    setExporter(EmotrackerExporter)
                }
              }}
            >
              <MenuItem value={EmotrackerExporter.name}>Emotracker</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ border: "1px solid #aaa", p: 2, borderRadius: 2 }}>
            <TextField
              fullWidth
              contentEditable={false}
              value={output}
              multiline
              variant="standard"
              sx={{ maxHeight: "50vh", overflow: "scroll" }}
            />
          </Box>
          <Stack direction={"row"} gap={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                copyToClipboard(output)
              }}
            >
              Copy to clipboard
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  )
}

export default ExportDialog
