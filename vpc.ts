import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface VpcArgs {
  cidrBlock?: pulumi.Input<string>;
  instanceTenancy?: pulumi.Input<string>;
  enableDnsHostnames?: pulumi.Input<boolean>;
  enableDnsSupport?: pulumi.Input<boolean>;
};

export class Vpc extends pulumi.ComponentResource {
  public vpcId: pulumi.Output<string>;
  public subnetIds: pulumi.Output<string>[] = [];
  public rdsSecurityGroupIds: pulumi.Output<string>[] = [];
  public feSecurityGroupIds: pulumi.Output<string>[] = [];

  constructor(name: string, args: VpcArgs, opts?: pulumi.ComponentResourceOptions) {
    super("tickr:VPC", name, args, opts);

    const vpcName = `${name}-vpc`;
    const cidrBlock = args.cidrBlock || "10.100.0.0/16";
    const instanceTenancy = args.instanceTenancy || "default";
    const enableDnsHostnames = args.enableDnsHostnames || true;
    const enableDnsSupport = args.enableDnsSupport || true;

    const vpc = new aws.ec2.Vpc(vpcName, {
      cidrBlock: cidrBlock,
      instanceTenancy: instanceTenancy,
      enableDnsHostnames: enableDnsHostnames,
      enableDnsSupport: enableDnsSupport,
      tags: { "Name": vpcName },
    }, { parent: this });

    const igwName = `${name}-igw`;
    const igw = new aws.ec2.InternetGateway(igwName, {
      vpcId: vpc.id,
      tags: { "Name": igwName },
    }, { parent: this });

    const rtName = `${name}-rt`;
    const routeTable = new aws.ec2.RouteTable(rtName, {
      vpcId: vpc.id,
      routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
      tags: { "Name": rtName },
    }, { parent: this });

    const allZones = aws.getAvailabilityZones({ state: "available" });
    const subnets: pulumi.Output<string>[] = [];
    const subnetNameBase = `${name}-subnet`;
    for (let i = 0; i < 2; i++) {
      const az = allZones.then(it => it.zoneIds[i]);
      const subnetName = `${subnetNameBase}-${i}`;
      const vpcSubnet = new aws.ec2.Subnet(subnetName, {
        assignIpv6AddressOnCreation: false,
        vpcId: vpc.id,
        mapPublicIpOnLaunch: true,
        cidrBlock: `10.100.${subnets.length}.0/24`,
        availabilityZoneId: az,
        tags: { "Name": subnetName },
      }, { parent: this });

      const _ = new aws.ec2.RouteTableAssociation(`vpc-route-table-assoc-${i}`, {
        routeTableId: routeTable.id,
        subnetId: vpcSubnet.id,
      }, { parent: this });

      subnets.push(vpcSubnet.id);
    };

    const rdsSgName = `${name}-rds-sg`;
    const rdsSecurityGroup = new aws.ec2.SecurityGroup(rdsSgName, {
      vpcId: vpc.id,
      description: "Allow client access",
      tags: { "Name": rdsSgName },
      ingress: [
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 3306,
          toPort: 3306,
          protocol: "tcp",
          description: "Allow RDS access",
        },
      ],
      egress: [
        {
          protocol: "-1",
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
    }, { parent: this });

    const feSgName = `${name}-fe-sg`;
    const feSecurityGroup = new aws.ec2.SecurityGroup(feSgName, {
      vpcId: vpc.id,
      description: "Allows all HTTP(s) traffic.",
      tags: { "Name": feSgName },
      ingress: [
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 443,
          toPort: 443,
          protocol: "tcp",
          description: "Allow https",
        },
        {
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 80,
          toPort: 80,
          protocol: "tcp",
          description: "Allow http",
        },
      ],
      egress: [
        {
          protocol: "-1",
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
    }, { parent: this });

    this.vpcId = vpc.id;
    this.subnetIds = subnets;
    this.rdsSecurityGroupIds = [rdsSecurityGroup.id];
    this.feSecurityGroupIds = [feSecurityGroup.id];
    this.registerOutputs({});
  };
};