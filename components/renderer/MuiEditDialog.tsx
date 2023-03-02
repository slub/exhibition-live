import {Close as CloseIcon,DeleteForever as RemoveIcn, Menu as MenuIcon, Refresh as ReloadIcon, Save as SaveIcon,Search as SearchIcon} from '@mui/icons-material'
import {alpha, AppBar, Badge, Box, IconButton, InputBase, styled, Toolbar, Typography} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import * as React from 'react'

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

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}))


export default function MuiEditDialog({children, open, title, onSave, onCancel, onClose, onReload, onRemove}: {
    onCancel?: () =>  void,
    onSave?: () => void,
    onClose?: () => void,
    onReload?: () => void,
    onRemove?: () => void,
    open?: boolean,
    title?: string,
    children?: React.ReactChild}) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'))


    return (
            <Dialog
                fullScreen={fullScreen}
                open={Boolean(open)}
                onClose={onClose}
                aria-labelledby="responsive-dialog-title"
            >

                    <AppBar position="static">
                        <Toolbar variant="dense">
                            <Typography variant="h6" color="inherit" component="div">
                                {title || 'Bearbeiten oder Erstellen'}
                            </Typography>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search…"
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </Search>
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