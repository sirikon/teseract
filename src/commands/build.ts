import builder from "../builder";

export default async function () {
  const resources = await builder({
    workDir: process.cwd()
  });

  for(const r of resources) {
    var dec = new TextDecoder("utf-8");
    console.log(r.path);
    console.log(dec.decode(r.data));
  }
}
