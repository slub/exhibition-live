---
to: packages/<%= name.split("/")[1] %>/jest.config.js
---
export default {
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};
