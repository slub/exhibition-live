---
to: packages/<%= name.split("/")[1] %>/src/index.tsx
---
export * from "./<%= h.changeCase.pascal(name.split("/")[1]) %>";
