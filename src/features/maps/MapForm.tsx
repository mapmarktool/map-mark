import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useTheme,
} from "@mui/material"
import { Formik } from "formik"
import { useAppDispatch } from "../../app/hooks"
import {
  CreateMapPayload,
  deleteMap,
  newMap,
  updateMap,
} from "../editor/editorSlice"
import MapData from "./MapData"
import ConfirmationDialog from "../ui/ConfirmationDialog"
import { SetStateAction, useState } from "react"

interface MapFormProps {
  open: boolean
  onClose: () => void
  map?: MapData
}

export interface MapFormData {
  name: string
  image?: string
}

type MapFormErrors = { [key in keyof MapFormData]?: string }

const MapForm = ({ open, map, onClose }: MapFormProps) => {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const dispatch = useAppDispatch()
  const theme = useTheme()

  function validate(values: MapFormData) {
    const errors: MapFormErrors = {}

    if (!values.name || values.name.length == 0) {
      errors.name = "Required"
    }

    if (!values.image) {
      errors.image = "Required"
    }

    return errors
  }

  async function handleImage(files: FileList) {
    if (!files[0]) {
      return
    }

    const file = files[0]
    const image = await new Promise<string>((resolve) => {
      const reader = new FileReader()

      reader.addEventListener("load", () => {
        resolve(reader.result as string)
      })

      reader.readAsDataURL(file)
    })

    return image
  }

  const data: MapFormData | undefined = map
    ? {
        name: map.name,
        image: map.image,
      }
    : undefined

  const emptyMapForm: MapFormData = { name: "", image: undefined }
  const initialValues: MapFormData = data ?? emptyMapForm

  function handleDelete(
    setValues: (
      values: React.SetStateAction<MapFormData>,
      shouldValidate?: boolean,
    ) => void,
  ) {
    if (map) {
      dispatch(deleteMap(map.id))
    }
    setDeleteConfirmationOpen(false)
    setValues(emptyMapForm, false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        transitionDuration={{
          enter: theme.transitions.duration.enteringScreen,
          exit: 0,
          appear: 0,
        }}
      >
        <DialogTitle>{map ? "Map settings" : "New map"}</DialogTitle>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={(values) => {
            if (values.image) {
              const data: CreateMapPayload = {
                id: crypto.randomUUID(),
                name: values.name,
                image: values.image,
              }

              if (map) {
                data.id = map.id
                dispatch(updateMap(data))
              } else {
                dispatch(newMap(data))
              }
            }
            onClose()
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setValues,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Box p={4}>
                  <Stack gap={2}>
                    {values.image && (
                      <img
                        style={{ height: 300, objectFit: "contain" }}
                        src={values.image}
                      />
                    )}

                    <Button
                      component="label"
                      variant="outlined"
                      color="primary"
                    >
                      <input
                        type="file"
                        name="image"
                        onChange={async (e) => {
                          if (!e.currentTarget.files) {
                            return
                          }
                          const image = await handleImage(e.currentTarget.files)
                          if (image) {
                            setValues({
                              ...values,
                              image,
                            })
                          }
                        }}
                        hidden
                      />
                      Select image
                    </Button>
                    <TextField
                      id="outlined-basic"
                      label="Name"
                      variant="outlined"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                      error={
                        (errors.name?.length != 0 && touched.name) ?? false
                      }
                      helperText={errors.name && touched.name && errors.name}
                    />
                  </Stack>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  sx={{ flexGrow: 1 }}
                >
                  {map ? "Update" : "Create"}
                </Button>
                {map && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={() => setDeleteConfirmationOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </DialogActions>
              <ConfirmationDialog
                open={deleteConfirmationOpen}
                title="Are you sure you want to delete the map?"
                content="This will remove the map and all locations assigned to the map."
                onCancel={() => setDeleteConfirmationOpen(false)}
                onConfirm={() => handleDelete(setValues)}
              />
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default MapForm
