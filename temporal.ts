import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as containerinstance from "@pulumi/azure-native/containerinstance";
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const config = new pulumi.Config();

export interface MySqlArgs {
  type: "mysql";
  hostName: pulumi.Input<string>;
  login: pulumi.Input<string>;
  password: pulumi.Input<string>;
}

export interface AppArgs {
  folder: pulumi.Input<string>;
  port: pulumi.Input<number>;
}

export interface TemporalArgs {
  resourceGroupName: pulumi.Input<string>;
  location: pulumi.Input<string>;
  version: string;
  uiVersion: string;
  uiPort: string;
  uiEnabled: string;
  storage: MySqlArgs;
  app: AppArgs;
}

export class Temporal extends pulumi.ComponentResource {
  public serverEndpoint: pulumi.Output<string>;
  public webEndpoint: pulumi.Output<string>;
  public starterEndpoint: pulumi.Output<string>;

  constructor(name: string, args: TemporalArgs) {
    super("tickr:Temporal", name, args, undefined);

    let env = [
      { name: "AUTO_SETUP", value: <pulumi.Input<string>>"true" },
    ];

    if (args.storage.type === "mysql") {
      env.push({ name: "DB", value: "mysql" });
      env.push({ name: "MYSQL_SEEDS", value: args.storage.hostName });
      env.push({ name: "MYSQL_USER", value: args.storage.login });
      env.push({ name: "MYSQL_PWD", value: args.storage.password });
    }

    const temporalServer = new containerinstance.ContainerGroup("temporal-server", {
      resourceGroupName: args.resourceGroupName,
      containerGroupName: pulumi.interpolate`${args.resourceGroupName}-server`,
      location: args.location,
      osType: "Linux",
      ipAddress: {
        type: "Public",
        ports: [{ protocol: "TCP", port: 7233 }],
      },
      containers: [{
        name: "temporalio-server",
        image: pulumi.interpolate`temporalio/auto-setup:${args.version}`,
        ports: [{ port: 7233 }],
        resources: {
          requests: {
            memoryInGB: 4,
            cpu: 2,
          },
        },
        environmentVariables: env,
      }],
    }, { parent: this });

    this.serverEndpoint = pulumi.interpolate`${temporalServer.ipAddress.apply(ip => ip?.ip)}:7233`;

    const temporalWeb = new containerinstance.ContainerGroup("temporal-web", {
      resourceGroupName: args.resourceGroupName,
      containerGroupName: pulumi.interpolate`${args.resourceGroupName}-web`,
      location: args.location,
      osType: "Linux",
      ipAddress: {
        type: "Public",
        ports: [{ protocol: "TCP", port: 8080 }],
      },
      containers: [{
        name: "temporalio-ui",
        image: pulumi.interpolate`temporalio/ui-server:${args.uiVersion}`,
        ports: [{ port: 8080 }],
        resources: {
          requests: {
            memoryInGB: 1,
            cpu: 1,
          },
        },
        environmentVariables: [
          { name: "TEMPORAL_ADDRESS", value: this.serverEndpoint },
          { name: "TEMPORAL_UI_PORT", value: args.uiPort },
          { name: "TEMPORAL_UI_ENABLED", value: args.uiEnabled },
        ],
      }],
    }, { parent: this });

    this.webEndpoint = pulumi.interpolate`http://${temporalWeb.ipAddress.apply(ip => ip?.ip)}:8080`;

    const customImage = "temporal-tickr";

    const registry = new containerregistry.Registry("registry", {
      resourceGroupName: args.resourceGroupName,
      registryName: pulumi.output(args.resourceGroupName).apply(rg => rg.replace("-", "")),
      location: args.location,
      sku: {
        name: "Basic",
      },
      adminUserEnabled: true,
    }, { parent: this });

    const credentials = pulumi.all([args.resourceGroupName, registry.name]).apply(
      ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
      }));

    const adminUsername = credentials.apply(credentials => credentials.username!);
    const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);

    const myImage = new docker.Image(customImage, {
      imageName: pulumi.interpolate`${registry.loginServer}/${customImage}`,
      build: { context: args.app.folder },
      registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
      },
    }, { parent: this });

    const temporalWorker = new containerinstance.ContainerGroup("temporal-worker", {
      resourceGroupName: args.resourceGroupName,
      containerGroupName: pulumi.interpolate`${args.resourceGroupName}-worker`,
      location: args.location,
      osType: "Linux",
      ipAddress: {
        type: "Public",
        ports: [{ protocol: "TCP", port: args.app.port }],
      },
      imageRegistryCredentials: [{
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
      }],
      containers: [{
        name: "temporalio-worker",
        image: myImage.imageName,
        ports: [{ port: args.app.port }],
        resources: {
          requests: {
            memoryInGB: 4,
            cpu: 2,
          },
        },
        environmentVariables: [
          { name: "TEMPORAL_GRPC_ENDPOINT", value: this.serverEndpoint },
          { name: "API_HOSTNAME", value: config.require("API_HOSTNAME") },
          { name: "API_PORT", value: config.require("API_PORT") },
          { name: "KAFKA_BROKER", value: config.require("KAFKA_BROKER") },
          { name: "SCHEMA_REGISTRY_URL", value: config.require("SCHEMA_REGISTRY_URL") },
          { name: "REDIRECT_URI", value: config.require("REDIRECT_URI") },
          { name: "TD_AUTH_URL", value: config.require("TD_AUTH_URL") },
          { name: "TD_USERNAME", value: config.requireSecret("TD_USERNAME") },
          { name: "TD_PASSWORD", value: config.requireSecret("TD_PASSWORD") },
          { name: "TD_ANSWER_1", value: config.requireSecret("TD_ANSWER_1") },
          { name: "TD_ANSWER_2", value: config.requireSecret("TD_ANSWER_2") },
          { name: "TD_ANSWER_3", value: config.requireSecret("TD_ANSWER_3") },
          { name: "TD_ANSWER_4", value: config.requireSecret("TD_ANSWER_4") },
        ],
      }],
    }, { parent: this });

    this.starterEndpoint = pulumi.interpolate`http://${temporalWorker.ipAddress.apply(ip => ip?.ip)}:${args.app.port}/async?name=`;

    this.registerOutputs();
  }
}