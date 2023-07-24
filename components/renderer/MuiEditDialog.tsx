import {
  Close as CloseIcon,
  DeleteForever as RemoveIcn,
  Fullscreen as FullscreenIcon,
  Refresh as ReloadIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  EditOff as EditOffIcon, SearchOff
} from '@mui/icons-material'
import {alpha, AppBar, Badge, Box, Hidden, IconButton, InputBase, styled, Toolbar, Typography} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import {useTheme} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import * as React from 'react'
import {useCallback, useState} from 'react'

const Search = styled('div')(({theme}) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))


export default function MuiEditDialog({
                                        children,
                                        open,
                                        title,
                                        onSave,
                                        onCancel,
                                        onClose,
                                        onReload,
                                        onRemove,
                                        onEdit,
                                        editMode,
                                        search
                                      }: {
  onCancel?: () => void,
  onSave?: () => void,
  onClose?: () => void,
  onReload?: () => void,
  onRemove?: () => void,
  onEdit?: () => void,
  editMode?: boolean,
  open?: boolean,
  title?: string,
  search?: React.ReactChild,
  children?: React.ReactChild
}) {
  const theme = useTheme()
  const [forceFullscreen, setForceFullscreen] = useState(false)
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [showSearch, setShowSearch] = useState(true);

  const toggleSearch = useCallback(
          () => {
            setShowSearch(prev => !prev)
          },
      [setShowSearch],
  );

  return (
      <Dialog
          fullScreen={fullScreen || forceFullscreen}
          open={Boolean(open)}
          onClose={onClose}
          fullWidth={true}
          maxWidth={'lg'}
          scroll={'paper'}
          disableScrollLock={false}
          aria-labelledby="responsive-dialog-title"
          onClick={e => e.stopPropagation()}
      >

        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div">
              {title || 'Bearbeiten oder Erstellen'}
            </Typography>
            <Hidden mdUp={true}>
              <IconButton onClick={toggleSearch} color="inherit">
                {showSearch ? <SearchOff /> : <SearchIcon/>}
              </IconButton>
            </Hidden>
            <Hidden mdDown={true}>
              <Box sx={{flexGrow: 3}}>
                <Search>
                  {search}
                </Search>
              </Box>
            </Hidden>
            <Box sx={{flexGrow: 1}}/>
            <Box sx={{display: 'flex'}}>
              {editMode &&
                  <>
                    {onSave && <IconButton
                        size="large"
                        aria-label="save your edits!"
                        onClick={onSave}
                        color="inherit">
                        <SaveIcon/>
                    </IconButton>}
                    {onRemove && <IconButton
                        onClick={onRemove}
                        color="inherit">
                        <RemoveIcn/>
                    </IconButton>}
                  </>
              }
              <IconButton
                  size="large"
                  aria-label="toggle edit mode"
                  onClick={onEdit}
                  color="inherit">
                {editMode ? <EditOffIcon/> : <EditIcon/>}
              </IconButton>
              {onReload && <IconButton
                  size="large"
                  aria-label="reload from server"
                  onClick={onReload}
                  color="inherit">
                  <ReloadIcon/>
              </IconButton>}
              <Hidden mdDown={true}>
                <IconButton
                    size="large"
                    aria-label="close without saving"
                    onClick={() => setForceFullscreen(ff => !ff)}
                    color="inherit">
                  <FullscreenIcon/>
                </IconButton>
              </Hidden>
              <IconButton
                  size="large"
                  aria-label="close without saving"
                  onClick={onClose}
                  color="inherit">
                <Badge badgeContent={1} color="error">
                  <CloseIcon/>
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
          {  showSearch && <Hidden mdUp={showSearch}>
            <Toolbar variant="dense">
              <Box sx={{flexGrow: 3}}>
                <Search>
                  {search}
                </Search>
              </Box>
            </Toolbar>
          </Hidden>}
        </AppBar>
        <DialogContent>
          {children}
        </DialogContent>
        <Hidden mdDown={true}>
          <DialogActions>
            {onCancel && <Button autoFocus onClick={onCancel}>
                abbrechen
            </Button>}
            {onSave && <Button onClick={onSave} autoFocus>
                speichern
            </Button>}
          </DialogActions>
        </Hidden>
      </Dialog>
  )
}
