import * as resources from "@pulumi/azure-native/resources";
import * as tls_self_signed_cert from "@pulumi/tls-self-signed-cert";

import { mysqlPassword } from "./config";
import { MySql } from "./mySql";
import { Temporal } from "./temporal";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("tickrResourceGroup");

// Create an Azure Resource SSL Certificate
const certificate = new tls_self_signed_cert.SelfSignedCertificate("certificate", {
    dnsName: "*.tickrbot.com",
    validityPeriodHours: 807660,
    localValidityPeriodHours: 17520,
    subject: {
        commonName: "temporal-cert",
        organization: "tickr LLC",
    },
});

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
    version: "1.17.4",
    uiVersion: "2.9.0",
    uiPort: "8080",
    uiEnabled: "true",
    uiTlsServerName: "ui-tls-server",
    uiTlsCertData: certificate.pem,
    uiTlsCertKeyData: certificate.privateKey,
    uiTlsCertCaData: certificate.caCert,
    storage: {
        type: "mysql",
        hostName: database.hostName,
        login: database.administratorLogin,
        password: database.administratorPassword,
    },
    app: {
        folder: "./workflow",
        port: 8080,
    },
})

export const serverEndpoint = temporal.serverEndpoint;
export const webEndpoint = temporal.webEndpoint;
export const starterEndpoint = temporal.starterEndpoint;
