import { postgresqlPassword } from "./config";
import { Vpc } from "./vpc";
import { Postgresql } from "./postgresql";
import { Temporal } from "./temporal";

const appName = "tickr-temporal";

const vpc = new Vpc(`${appName}-net`, {});

const postgres = new Postgresql(`${appName}-db`, {
  dbName: "tickr-temporal-db",
  dbUsername: "daquan@tickr",
  dbPassword: postgresqlPassword,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.rdsSecurityGroupIds,
  engine: "PostreSQL",
  engineVersion: "13.8",
  allocatedStorage: 30,
  maxAllocatedStorage: 90,
  instanceClass: "db.t4g.micro",
  storageType: "gp2"
});

const temporal = new Temporal(`${appName}`, {
  dbType: "postgresql",
  dbHost: postgres.dbAddress,
  dbName: postgres.dbName,
  dbUsername: postgres.dbUsername,
  dbPassword: postgres.dbPassword,
  dbPort: "5432",
  serverVersion: "1.17.4",
  uiVersion: "2.9.0",
  vpcId: vpc.vpcId,
  subnetIds: vpc.subnetIds,
  securityGroupIds: vpc.feSecurityGroupIds,
  app: {
    folder: "./workflow",
    port: 9090
  },
});

export const serverEndpoint = temporal.serverEndpoint;
export const uiEndpoint = temporal.uiEndpoint;