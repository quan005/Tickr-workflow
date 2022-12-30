import * as resources from "@pulumi/azure-native/resources";

import { mysqlPassword } from "./config";
import { MySql } from "./mySql";
import { Temporal } from "./temporal";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("tickrResourceGroup");

// Create an Azure MySql resource
const database = new MySql("mysql", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    administratorLogin: "daquan-tickr",
    administratorPassword: mysqlPassword,
})

// Create an Azure resource (Temporal Cluster)
const temporal = new Temporal("temporal", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    version: "1.1.1",
    storage: {
        type: "mysql",
        hostName: database.hostName,
        login: database.administratorLogin,
        password: database.administratorPassword,
    },
    app:{
        folder: "./workflow",
        port: 8080,
    },
})

export const serverEndpoint = temporal.serverEndpoint;
export const webEndpoint = temporal.webEndpoint;
export const starterEndpoint = temporal.starterEndpoint;