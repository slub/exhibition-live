import React from "react";

import LobidAutocompleteSearch from "./LobidAutocompleteSearch";

export default {
  title: "form/lobid/LobidAutocomplete",
  component: LobidAutocompleteSearch,
}

export const LobID = () => <LobidAutocompleteSearch typeName={"Person"} />;
