import React from "react";

import LobidAutocompleteSearch from "./LobidAutocompleteSearch";

export default {
  title: "ui/form/LobidAutocomplete",
  component: LobidAutocompleteSearch,
};

export const LobID = () => <LobidAutocompleteSearch typeName={"Person"} />;
