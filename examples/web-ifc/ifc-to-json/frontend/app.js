import {geometryTypes} from "./geometry-types";
import {IfcAPI} from "web-ifc/web-ifc-api";

const ifcapi = new IfcAPI();
ifcapi.SetWasmPath("../../../../");

const button = document.getElementById("file-opener-button");
button.addEventListener('click', () => input.click());

const leftContainer = document.getElementById("left-container");
const saveButton = document.getElementById("save-button");

const json = document.getElementById("json");

const input = document.getElementById("file-input");
input.addEventListener(
    "change",
    (changed) => {
        const reader = new FileReader();
        reader.onload = () => LoadFile(reader.result);
        reader.readAsText(changed.target.files[0]);
    },
    false
);

async function LoadFile(ifcAsText) {
    leftContainer.innerHTML = ifcAsText.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const uint8array = new TextEncoder().encode(ifcAsText);
    const modelID = await OpenIfc(uint8array);
    const allItems = GetAllItems(modelID);
    const result = JSON.stringify(allItems, undefined, 2);
    json.textContent  = result;

    const blob = new Blob([result], {type: "application/json"});
    saveButton.href  = URL.createObjectURL(blob);
    saveButton.download = "data.json";
    saveButton.click();

    ifcapi.CloseModel(modelID);
}

async function OpenIfc(ifcAsText) {
    await ifcapi.Init();
    return ifcapi.OpenModel(ifcAsText);
}

function GetAllItems(modelID, excludeGeometry = true) {
    const allItems = {};
    const lines = ifcapi.GetAllLines(modelID);
    getAllItemsFromLines(modelID, lines, allItems, excludeGeometry);
    return allItems;
}

function getAllItemsFromLines(modelID, lines, allItems, excludeGeometry) {
    for (let i = 1; i <= lines.size(); i++) {
        try {
            saveProperties(modelID, lines, allItems, excludeGeometry, i);
        } catch (e) {
            console.log(e);
        }
    }
}

function saveProperties(modelID, lines, allItems, excludeGeometry, index) {
    const itemID = lines.get(index);
    const props = ifcapi.GetLine(modelID, itemID);
    props.type = props.__proto__.constructor.name;
    if (!excludeGeometry || !geometryTypes.has(props.type)) {
        allItems[itemID] = props;
    }
}