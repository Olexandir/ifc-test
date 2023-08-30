import { IFCBUILDINGSTOREY, IfcAPI } from "web-ifc";

const ifcapi = new IfcAPI();
ifcapi.SetWasmPath("../../../../");

let modelID;

fetch("../../../../IFC/01.ifc")
  .then((response) => response.text())
  .then((data) => {
    // This will send the file data to our LoadFileData method
    LoadFileData(data);
  });

async function LoadFileData(ifcAsText) {
  const uint8array = new TextEncoder().encode(ifcAsText);
  modelID = await OpenIfc(uint8array);
  console.log(modelID, ifcapi);
  getLevels();
}

async function getLevels() {
  levels = await ifcapi.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY);
  for (let i = 0; i < levels.size(); i++) {
    const lvl = ifcapi.GetLine(modelID, levels.get(i));
    if (lvl.Name.value === "Nivel 2") {
      console.log(levels.get(i), lvl);
      lvl.LongName.value = "Level 2";
      ifcapi.WriteLine(modelID, lvl);
      createDownloadLink(lvl);
    } else {
      console.log(lvl);
    }
  }
}

function createDownloadLink(lvl) {
  const data = ifcapi.ExportFileAsIFC(modelID);
  const blob = new Blob([data]);
  const file = new File([blob], "modified.ifc");
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.innerText = "Download";
  link.download = "modified.ifc";
  link.setAttribute("href", url);

  document.body.appendChild(link);
}

async function OpenIfc(ifcAsText) {
  await ifcapi.Init();
  return ifcapi.OpenModel(ifcAsText);
}
