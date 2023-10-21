import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import {initReactI18next} from 'react-i18next'

const base = process.env.NEXT_PUBLIC_BASE_PATH || '/public'

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: `${base}/locales/{{lng}}/{{ns}}.json`
      },
      fallbackLng: 'de',
      debug: true,
      interpolation: {
        escapeValue: false,
      }
    })

export default i18n
