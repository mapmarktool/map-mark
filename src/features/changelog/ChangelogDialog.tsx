import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material"
import { useEffect, useState } from "react"
import { marked } from "marked"
import "./changelog.css"

marked.use({
  headerIds: false,
  mangle: false,
})

interface ChangelogDialogProps {}

import changelog from "../../../CHANGELOG.md?url"
import { useAppSelector } from "../../app/hooks"
import {
  getChangelog,
  setChangelogContent,
  setChangelogOpen,
} from "../ui/uiSlice"
import { useDispatch } from "react-redux"

export const CHANGELOG_VERSION_KEY = "changelog-read"

const ChangelogDialog = ({}: ChangelogDialogProps) => {
  const [content, setContent] = useState<string>("")
  const changelogState = useAppSelector(getChangelog)
  const [checksum, setChecksum] = useState<string | undefined>(
    changelogState.checksum,
  )
  const dispatch = useDispatch()

  useEffect(() => {
    async function fetchChangelog() {
      try {
        const data = await fetch(changelog)
        const text = await data.text()
        dispatch(setChangelogContent(text))
      } catch (e) {
        console.warn("Could not fetch Changelog!", e)
        dispatch(setChangelogOpen(false))
      }
    }

    fetchChangelog()
  }, [])

  useEffect(() => {
    if (changelogState.content) {
      setContent(marked.parse(changelogState.content))

      if (checksum && changelogState.checksum != checksum) {
        dispatch(setChangelogOpen(true))
      }
    }
  }, [changelogState.content, changelogState.checksum])

  return (
    <Dialog
      open={changelogState.open}
      onClose={() => dispatch(setChangelogOpen(false))}
      fullWidth
    >
      <DialogContent>
        <Box p={2} display={"flex"}>
          {(content && (
            <span
              className="changelog"
              dangerouslySetInnerHTML={{ __html: content }}
            ></span>
          )) || <CircularProgress style={{ margin: "0 auto" }} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(setChangelogOpen(false))}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangelogDialog
