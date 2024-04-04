/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    ns: ["translation", "table"],
    defaultNS: "translation",
  },
  react: { useSuspense: false },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
