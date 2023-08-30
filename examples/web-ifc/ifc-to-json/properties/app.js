import {
    geometryTypes
} from "./geometry-types";
import {
    IfcAPI, IFCRELDEFINESBYPROPERTIES
} from "web-ifc/web-ifc-api";

const table = document.createElement("table");

const ifcapi = new IfcAPI();
ifcapi.SetWasmPath("../../../../");

const leftContainer = document.getElementById("left-container");
const json = document.getElementById("json");


fetch('../../../../IFC/01.ifc')
  .then(response => response.text())
  .then(data => {
    LoadFileData(data);
});

async function LoadFileData(ifcAsText) {
    leftContainer.innerHTML = ifcAsText.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const uint8array = new TextEncoder().encode(ifcAsText);
    const modelID = await OpenIfc(uint8array);
    const allItems = GetAllItems(modelID);
    const result = JSON.stringify(allItems, undefined, 2);
    json.textContent = result;

}

async function OpenIfc(ifcAsText) {
    await ifcapi.Init();
    return ifcapi.OpenModel(ifcAsText);
}

function GetAllItems(modelID, excludeGeometry = false) {
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

function getPropertyWithExpressId(modelID=0) {
    const prop = document.getElementById("properties");
    prop.innerHTML = "";
    table.innerHTML = "";

    const elementID = parseInt(document.getElementById("expressIDLabel").value);

    // If third parameter is added as true, we get a flatten result
    const element = ifcapi.GetLine(modelID, elementID);

    // Now you can fetch GUID of that Element
    const guid      = element.GlobalId.value;
    createRowInTable("GUID", guid);

    const name      = element.Name.value;
    createRowInTable("Name", name);

    const ifcType   = element.__proto__.constructor.name;
    createRowInTable("IfcType", ifcType);

    const type      = element.ObjectType.value;
    createRowInTable("Object Type", type);

    const tag       = element.Tag.value;
    createRowInTable("Tag", tag);
    
    // grab all propertyset lines in the file
    let lines = ifcapi.GetLineIDsWithType(modelID, IFCRELDEFINESBYPROPERTIES);

    // In the below array we will store the IDs of the Property Sets found
    let propSetIds = [];
    for (let i = 0; i < lines.size(); i++) {
        // Getting the ElementID from Lines
        let relatedID = lines.get(i);
        
        // Getting Element Data using the relatedID
        let relDefProps = ifcapi.GetLine(modelID, relatedID);
        
        // Boolean for Getting the IDs if relevant IDs are present
        let foundElement = false;

        // RelatedObjects is a property that is an Array of Objects. 
        // The way IFC is structured, Entities that use same property are included inside RelatedObjects
        // We Search inside RelatedObjects if our ElementID is present or not
        relDefProps.RelatedObjects.forEach((relID) => {
            if(relID.value === elementID){
                foundElement = true;
            }
        });

        if(foundElement){
            // Relevant IDs are found we then we go to RelatingPropertyDefinition
            // RelatingPropertyDefinition contain the IDs of Property Sets
            // But they should not be array, hence using (!Array.isArray())
            if(!Array.isArray(relDefProps.RelatingPropertyDefinition)){
                let handle = relDefProps.RelatingPropertyDefinition;

                // Storing and pushing the IDs found in propSetIds Array
                propSetIds.push(handle.value);
            }
        }
    }

    

    // Getting the Property Sets from their IDs
    let propsets = propSetIds.map(id => ifcapi.GetLine(modelID, id, true));

    propsets.forEach((set) => {
        // There can multiple Property Sets
        set.HasProperties.forEach(p => {
            // We will check if the Values that are present are not null
            if(p.NominalValue != null){
                if(p.NominalValue.label === "IFCBOOLEAN"){
                    // We will talk about this function in Frontend Part
                    createRowInTable(p.Name.value, p.NominalValue.value);
                }
                else{
                    // We will talk about this function in Frontend Part
                    createRowInTable(p.NominalValue.label, p.NominalValue.value);
                }
            }
        });
    });


    
    prop.appendChild(table);
}



function createRowInTable(label, value){
    

    const row = document.createElement("tr");
    row.innerHTML = "<td>"+label+"</td><td>"+value+"</td>";

    table.appendChild(row);
}


window.getPropertyWithExpressId = getPropertyWithExpressId;

