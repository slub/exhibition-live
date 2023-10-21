import {Box, Card, CardContent, Grid, Typography} from '@mui/material'
import {useRouter} from 'next/router'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'

import {useFormRefsContext} from '../../provider/formRefsContext'
import {SearchSection} from './SearchSection'


export const ContextSection = () => {
  const { toolbarRef} = useFormRefsContext()
  const router = useRouter()
  const { t } = useTranslation()
  const {typeName} = router.query as { typeName: string | null | undefined }

  return (
    <Grid container spacing={2} direction={'column'}>
      <Grid item>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>{!typeName ? null : t(typeName)}</Grid>
              <Grid item xs={6}>
              <SearchSection />
              </Grid>
            
          

              {/* notification & profile */}
              {/* @ts-ignore */}
              <Box sx={{  flexGrow:0 }} ><div ref={toolbarRef} /></Box>
              
              </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
