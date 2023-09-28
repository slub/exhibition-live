import {ComponentMeta} from '@storybook/react'
import React from 'react'

import DiscoverSearchTable from './DiscoverSearchTable'

export default {
  title: 'form/discover/DiscoverSearchTable',
  component: DiscoverSearchTable,
} as ComponentMeta<typeof DiscoverSearchTable>

export const DiscoverSearchTableDefault = () => <DiscoverSearchTable typeName={'Person'}  searchString={'Dix'}/>
