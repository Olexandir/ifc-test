import {IfcAPI,IFCSPACE} from "web-ifc/web-ifc-api";
const ifcFileLocation = "sample.ifc"; // dont forget to modify for your ifc filename
let modelID = 0;
const ifcapi = new IfcAPI();
//ifcapi.SetWasmPath("./wasm/"); only if the wasm file are note at the same level as app.js

/**
 * resolve a Uint8Array().
 * 
 * @param string url location of your ifc file
 * @returns {Promise}
 */
 function getIfcFile(url) {
  return new Promise((resolve, reject) => {
      var oReq = new XMLHttpRequest();
      oReq.responseType = "arraybuffer";
      oReq.addEventListener("load", () => {
          resolve(new Uint8Array(oReq.response));
      });
      oReq.open("GET", url);
      oReq.send();
  });
}

/**
 * Get all IFCSPACE from ifc file
 * @param integer modelID 
 * @returns array
 */
 function getAllSpaces(modelID) {
  // Get all the propertyset lines in the IFC file
  let lines = ifcapi.GetLineIDsWithType(modelID, IFCSPACE);
  let lineSize = lines.size();
  let spaces = [];
  for (let i = 0; i < lineSize; i++) {
      // Getting the ElementID from Lines
      let relatedID = lines.get(i);
      // Getting Element Data using the relatedID
      let relDefProps = ifcapi.GetLine(modelID, relatedID);
      spaces.push(relDefProps);

  }
  return spaces;
}


ifcapi.Init().then(() => {
  getIfcFile(ifcFileLocation).then( (ifcData) => {
      modelID = ifcapi.OpenModel(ifcData);
      let isModelOpened = ifcapi.IsModelOpen(modelID);
      console.log({isModelOpened});
      let spaces = getAllSpaces(modelID);
      console.log({spaces});
      ifcapi.CloseModel(modelID);
  });
});