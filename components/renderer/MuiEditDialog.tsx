import {Close as CloseIcon,DeleteForever as RemoveIcn, Fullscreen as FullscreenIcon, Refresh as ReloadIcon, Save as SaveIcon,Search as SearchIcon} from '@mui/icons-material'
import {alpha, AppBar, Badge, Box, IconButton, InputBase, styled, Toolbar, Typography} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import * as React from 'react'
import {useState} from 'react'

const Search = styled('div')(({ theme }) => ({
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


export default function MuiEditDialog({children, open, title, onSave, onCancel, onClose, onReload, onRemove, search}: {
    onCancel?: () =>  void,
    onSave?: () => void,
    onClose?: () => void,
    onReload?: () => void,
    onRemove?: () => void,
    open?: boolean,
    title?: string,
    search?: React.ReactChild,
    children?: React.ReactChild}) {
    const theme = useTheme()
    const [forceFullscreen, setForceFullscreen] = useState(false)
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'))


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
                            <Box sx={{ flexGrow: 3 }} >
                            <Search >
                                    {search}
                            </Search>
                            </Box>
                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                {onSave && <IconButton
                                    size="large"
                                    aria-label="save your edits!"
                                    onClick={onSave}
                                    color="inherit">
                                        <SaveIcon />
                                </IconButton>}
                                {onRemove && <IconButton
                                    size="large"
                                    aria-label="reload from server"
                                    onClick={onRemove}
                                    color="inherit">
                                    <RemoveIcn />
                                </IconButton>}
                                {onReload && <IconButton
                                    size="large"
                                    aria-label="reload from server"
                                    onClick={onReload}
                                    color="inherit">
                                        <ReloadIcon />
                                </IconButton>}
                                <IconButton
                                    size="large"
                                    aria-label="close without saving"
                                    onClick={() => setForceFullscreen(ff => !ff)}
                                    color="inherit">
                                    <FullscreenIcon />
                                </IconButton>
                                <IconButton
                                    size="large"
                                    aria-label="close without saving"
                                    onClick={onClose}
                                    color="inherit">
                                    <Badge badgeContent={1} color="error">
                                        <CloseIcon />
                                    </Badge>
                                </IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>
                <DialogContent>
                    {children}
                </DialogContent>
                <DialogActions>
                    {onCancel && <Button autoFocus onClick={onCancel}>
                        abbrechen
                    </Button>}
                    {onSave && <Button onClick={onSave} autoFocus>
                        speichern
                    </Button>}
                </DialogActions>
            </Dialog>
    )
}
