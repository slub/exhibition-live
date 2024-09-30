import Ajv from "ajv";
import { $Validator, wrapValidatorAsTypeGuard } from "json-schema-to-ts";

const ajv = new Ajv();

const $validate: $Validator = (schema, data) => ajv.validate(schema, data);

export const validate = wrapValidatorAsTypeGuard($validate);
