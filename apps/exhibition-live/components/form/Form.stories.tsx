import TypedForm from "../content/main/TypedForm";
import { sladb } from "./formConfigs";

export default {
  title: "forms/Form",
  component: TypedForm,
};

export const TagForm = () => (
  <div>
    <TypedForm typeName={"Tag"} classIRI={sladb("Tag").value} />
  </div>
);
export const LocationForm = () => (
  <div>
    <TypedForm typeName={"Location"} classIRI={sladb("Location").value} />
  </div>
);
export const PlaceForm = () => (
  <div>
    <TypedForm typeName={"Place"} classIRI={sladb("Place").value} />
  </div>
);
