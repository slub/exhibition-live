import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreatePage } from "./pages/Create";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import { ListPage } from "./pages/List";
import Backend from "i18next-http-backend";
import { ImportPage } from "../components/importExport/ImportPage";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

let router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: ":locale/create/:typeName",
    element: <CreatePage />,
  },
  {
    path: ":locale/list/:typeName",
    element: <ListPage />,
  },
  {
    path: ":locale/import",
    element: <ImportPage />,
  },
]);

i18n
  .use(Backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: "de",
    ns: ["translation", "table"],
    defaultNS: "translation",
  });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App>
      <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
    </App>
  </React.StrictMode>,
);
