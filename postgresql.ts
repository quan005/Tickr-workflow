import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface PostgresqlArgs {
  dbName: pulumi.Input<string>;
  dbUsername: pulumi.Input<string>;
  dbPassword: pulumi.Input<string>;
  subnetIds: pulumi.Output<string>[];
  securityGroupIds: pulumi.Input<pulumi.Input<string>[]>;
  engine: pulumi.Input<string>;
  engineVersion: pulumi.Input<string>;
  allocatedStorage: pulumi.Input<number>;
  maxAllocatedStorage: pulumi.Input<number>;
  instanceClass: pulumi.Input<string>;
  storageType: pulumi.Input<string>;
};

export class Postgresql extends pulumi.ComponentResource {
  public dbAddress: pulumi.Output<string>;
  public dbName: pulumi.Output<string>;
  public dbUsername: pulumi.Output<string>;
  public dbPassword: pulumi.Output<string | undefined>;

  constructor(name: string, args: PostgresqlArgs, opts?: pulumi.ComponentResourceOptions) {
    super("tickr:Postgresql", name, args, opts);

    const rdsSubnetGroupName = `${name}-sng`;
    const rdsSubnetGroup = new aws.rds.SubnetGroup(rdsSubnetGroupName, {
      subnetIds: args.subnetIds,
      tags: { "Name": rdsSubnetGroupName },
    }, { parent: this });

    const rdsName = `${name}-rds`;
    const db = new aws.rds.Instance(rdsName, {
      dbName: pulumi.interpolate`${args.dbName}`,
      username: pulumi.interpolate`${args.dbUsername}`,
      password: pulumi.interpolate`${args.dbPassword}`,
      vpcSecurityGroupIds: args.securityGroupIds,
      dbSubnetGroupName: rdsSubnetGroup.name,
      allocatedStorage: args.allocatedStorage,
      engine: pulumi.interpolate`${args.engine}`,
      engineVersion: pulumi.interpolate`${args.engineVersion}`,
      instanceClass: pulumi.interpolate`${args.instanceClass}`,
      storageType: pulumi.interpolate`${args.storageType}`,
      skipFinalSnapshot: true,
      publiclyAccessible: false,
    }, { parent: this });

    this.dbAddress = db.address;
    this.dbName = db.dbName;
    this.dbUsername = db.username;
    this.dbPassword = db.password;

    this.registerOutputs({});
  }
};