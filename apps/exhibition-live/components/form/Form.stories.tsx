import TypedForm from "../content/main/TypedForm";
import { sladb } from "../config/formConfigs";

export default {
  title: "forms/Form",
  component: TypedForm,
};

export const TagForm = () => (
  <div>
    <TypedForm
      typeName={"Tag"}
      classIRI={sladb("Tag").value}
      entityIRI={"http://example.com/tag"}
    />
  </div>
);
export const LocationForm = () => (
  <div>
    <TypedForm
      typeName={"Location"}
      classIRI={sladb("Location").value}
      entityIRI={"http://example.com/location"}
    />
  </div>
);
export const PlaceForm = () => (
  <div>
    <TypedForm
      typeName={"Place"}
      classIRI={sladb("Place").value}
      entityIRI={"http://example.com/place"}
    />
  </div>
);
