module.exports = {
  extends: ["next", "turbo", "prettier"],
  plugins: ["simple-import-sort"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "turbo/no-undeclared-env-vars": "off",
  }
}
