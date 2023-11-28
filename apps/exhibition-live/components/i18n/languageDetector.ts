import languageDetector from "next-language-detector";
const i18n = {
  locales: ["en", "de"],
  defaultLocale: "de",
};
export default languageDetector({
  supportedLngs: i18n.locales,
  fallbackLng: i18n.defaultLocale,
});
