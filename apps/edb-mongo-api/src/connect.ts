import { MongoClient } from "mongodb";

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/adbSample";
const client = new MongoClient(uri);
export const database = client.db("adbSample");

export const closeConnection = async () => client.close();
