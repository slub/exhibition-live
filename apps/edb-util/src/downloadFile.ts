import {hash} from "spark-md5";
import fs from "fs";
import http from "http";
import https from "https";

export const downloadImage = (url: string, path: string) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
  return downloadFile(url, path, imageExtensions);
}
export const downloadFile = (url: string, path: string, extensions: string[]) => {
  const promise = new Promise((resolve, reject) => {
    //get file extension
    const ext = url.split(".").pop();
    if (!ext || !extensions.includes(ext)) {
      throw new Error("Invalid image type");
    }
    const newName = hash(url) + "." + ext;
    const filePath = `${path}/${newName}`;
    if(fs.existsSync(filePath)) {
      resolve(filePath);
      return;
    }
    const file = fs.createWriteStream(`${path}/${newName}`);
    const onResponse = (response: any) => {
      response.pipe(file);
      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        resolve(filePath);
      });
    }
    if(url.startsWith("https"))
      http.get(url, onResponse)
    else https.get(url, onResponse);
  });
  return promise;
}
