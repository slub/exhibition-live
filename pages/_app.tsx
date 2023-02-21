import '../styles/globals.css'
import '../styles/jquery.typeahead.min.css'
import '../styles/jquery-ui.min.css'
import '../styles/highlight.min.css'
import '../styles/tooltipster.bundle.min.css'
import '../styles/tooltipster-sideTip-shadow.min.css'
import '../styles/layout.css'
import '../styles/temp.css'
import 'leaflet/dist/leaflet.css'

import {ThemeProvider} from '@mui/styles'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type { AppProps } from 'next/app'

import defaultTheme from '../components/theme/default-theme'

export const queryClient = new QueryClient()
const QueryClientProviderWrapper = ({children}: { children: React.ReactChild }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
export default function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={defaultTheme}>
    <QueryClientProviderWrapper>
      <Component {...pageProps} />
    </QueryClientProviderWrapper>
  </ThemeProvider>
}
