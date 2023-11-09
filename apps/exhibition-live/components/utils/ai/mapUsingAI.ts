import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { filterForPrimitivePropertiesAndArrays } from "../core";
import { JSONSchema7 } from "json-schema";

type Context = {
  jsonSchema: JSONSchema7;
  openai?: {
    model?: string;
    organization?: string;
    apiKey?: string;
  };
};

const defaultModel = "gpt-3.5-turbo";
export const mapAbstractDataUsingAI = async (
  id: string,
  typeName: string,
  data: any,
  context: Context,
): Promise<any | null> => {
  const { jsonSchema, openai } = context;
  if (!openai?.organization || !openai?.apiKey) {
    console.warn("No OpenAI API Key or Organization set");
    return null;
  }
  const configuration = new Configuration(openai);
  const openaiInstance = new OpenAIApi(configuration);
  const entrySchema = {
    type: "object",
    properties: filterForPrimitivePropertiesAndArrays(jsonSchema.properties),
  };
  try {
    const firstMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content:
          "The task is to map an abstract and description of an entity from a librarian catalogue to a more simple model of a user given JSON Schema. First listen to the next two user prompts, only respond to system commands.",
      },
      {
        role: "user",
        content: `The JSONSchema of the object of type \`${typeName}\` is:
           \`\`\`json
            ${JSON.stringify(entrySchema)}
            \`\`\``,
      },
      {
        role: "user",
        content: `The data returned from the library catalog is:
            \`\`\`json
            ${JSON.stringify(data)}
            \`\`\``,
      },
      {
        role: "system",
        content: `Extract dates, like beginning and end of the ${typeName} from the text according to the schema. Hint: dates tha map to an integer should be converted to YYYYMMDD, if any of the part is unknown fill it with 0. Omit null values in the resultset.`,
      },
    ];
    const response = await openaiInstance.createChatCompletion({
      model: openai?.model || defaultModel,
      messages: firstMessages,
      max_tokens: 1500,
    });
    const dataFromGNDRaw =
      response.data?.choices?.[0]?.message?.content || "{}";
    console.log({ data: response.data, dataFromGNDRaw });
    const { ["@id"]: _1, ...dataFromGND } = JSON.parse(dataFromGNDRaw);
    const inject = {
      idAuthority: {
        "@id": id,
      },
      lastNormUpdate: new Date().toISOString(),
    };
    return { ...dataFromGND, ...inject };
  } catch (e) {
    console.error("could not guess mapping", e);
  }
  return null;
};

export const mapDataUsingAI = async (
  id: string,
  typeName: string,
  data: any,
  context: Context,
): Promise<any | null> => {
  const { jsonSchema, openai } = context;
  if (!open || !openai?.organization || !openai?.apiKey) {
    console.log("No OpenAI API Key or Organization set");
    return null;
  }
  const { model } = openai;
  const configuration = new Configuration(openai);
  const openaiInstance = new OpenAIApi(configuration);
  const entrySchema = {
    type: "object",
    properties: filterForPrimitivePropertiesAndArrays(jsonSchema.properties),
  };
  try {
    const firstMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content:
          "The task is to map complex norm data from the GND to a more simple model of a  user given JSON Schema. First listen to the next two user prompts, only respond to system commands.",
      },
      {
        role: "user",
        content: `The JSONSchema of the object of type \`${typeName}\` is:
           \`\`\`json
            ${JSON.stringify(entrySchema)}
            \`\`\``,
      },
      {
        role: "user",
        content: `The data returned from the GND is:
            \`\`\`json
            ${JSON.stringify(data)}
            \`\`\``,
      },
      {
        role: "system",
        content:
          "Output the result of mapping the GND data to the schema (minified JSON without newlines). Hint: dates tha map to an integer should be converted to YYYYMMDD, if any of the part is unknown fill it with 0. Omit null values in the resultset.",
      },
    ];
    const response = await openaiInstance.createChatCompletion({
      model: model,
      messages: firstMessages,
      max_tokens: 1200,
    });
    const dataFromGNDRaw =
      response.data?.choices?.[0]?.message?.content || "{}";
    console.log({ data: response.data, dataFromGNDRaw });
    const { ["@id"]: _1, ...dataFromGND } = JSON.parse(dataFromGNDRaw);
    const inject = {
      idAuthority: {
        "@id": id,
      },
      lastNormUpdate: new Date().toISOString(),
    };
    const newData = { ...dataFromGND, ...inject };
    return newData;

    /*
    const generateMappingMessage: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content:
          "for each mapped target field, give a small declarative representation of gnd fields used as input and a strategy used for mapping. The different strategies will be implemented by a developer. Output the declarations as JSON.",
      },
    ];
    const mappingResponse = await openaiInstance.createChatCompletion({
      model: model,
      messages: [
        ...firstMessages,
        {
          role: "assistant",
          content: dataFromGNDRaw,
        },
        ...generateMappingMessage,
      ],
      max_tokens: 1200,
    });
    const mappingDataRaw =
      mappingResponse.data?.choices?.[0]?.message?.content || "{}";
    console.log({ mappingDataRaw });

     */
  } catch (e) {
    console.error("could not guess mapping", e);
  }
  return null;
};
