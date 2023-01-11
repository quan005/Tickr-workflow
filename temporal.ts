import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { caCert, cert, createCaCertificate, createSignedCertificate } from "./cert";

const config = new pulumi.Config();

export interface AppArgs {
  folder: pulumi.Input<string>;
  port: pulumi.Input<number>;
}

export interface TemporalArgs {
  dbType: string;
  dbHost: pulumi.Output<string>;
  dbName: pulumi.Output<string>;
  dbUsername: pulumi.Output<string>;
  dbPassword: pulumi.Output<string | undefined>;
  dbPort: string;
  serverVersion: string;
  uiVersion: string;
  vpcId: pulumi.Output<string>;
  subnetIds: pulumi.Output<string>[];
  securityGroupIds: pulumi.Output<string>[];
  app: AppArgs;
};

export class Temporal extends pulumi.ComponentResource {
  public serverEndpoint: pulumi.Output<string>;
  public uiEndpoint: pulumi.Output<string>;

  constructor(name: string, args: TemporalArgs, opts?: pulumi.ComponentResourceOptions) {
    super("tickr:Temporal", name, args, opts);

    const ecsInstanceRole = new aws.iam.Role(`${name}-ecs-instance-role`, {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "",
            Effect: "Allow",
            Principal: {
              Service: "ec2.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      }),
    });

    const ecsInstanceRolePolicyAttachment = new aws.iam.RolePolicyAttachment(`${name}-ecs-instance-policy`, {
      role: ecsInstanceRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
    });

    const ecsInstanceProfile = new aws.iam.InstanceProfile(`${name}-ecs-instance-profile`, {
      role: ecsInstanceRole.name
    })

    const temporalServerEc2Ami = aws.ec2.getAmiOutput({
      mostRecent: true,
      owners: ["amazon"],
      filters: [
        {
          name: "name",
          values: ["amzn2-ami-hvm-*-arm64-*"]
        }
      ]
    });

    const ec2Ami = aws.ec2.getAmiOutput({
      mostRecent: true,
      owners: ["amazon"],
      filters: [
        {
          name: "name",
          values: ["amzn2-ami-ecs-hvm-*-x86_64-*"]
        }
      ]
    });

    const clusterName = `${name}-ecs`
    const userData = JSON.stringify(`#!/bin/bash echo ECS_CLUSTER=${clusterName} >> /etc/ecs/ecs.config`);

    const temporalServerEc2 = new aws.ec2.LaunchConfiguration(`${name}-server-ec2`, {
      imageId: temporalServerEc2Ami.id,
      instanceType: "t4g.small",
      iamInstanceProfile: ecsInstanceProfile.name,
      userData: userData
    });
    const temporalUiEc2 = new aws.ec2.LaunchConfiguration(`${name}-ui-ec2`, {
      imageId: ec2Ami.id,
      instanceType: "t3.micro",
      iamInstanceProfile: ecsInstanceProfile.name,
      userData: userData
    });
    const temporalWorkerEc2 = new aws.ec2.LaunchConfiguration(`${name}-worker-ec2`, {
      imageId: ec2Ami.id,
      instanceType: "t3.micro",
      iamInstanceProfile: ecsInstanceProfile.name,
      userData: userData
    });

    const cluster = new aws.ecs.Cluster(`${name}-ecs`, {
      name: clusterName
    }, { parent: this });

    const alb = new aws.lb.LoadBalancer(`${name}-alb`, {
      loadBalancerType: "network",
      subnets: args.subnetIds,
    }, { parent: this });

    const temporalServertg = new aws.lb.TargetGroup(`${name}-server-tg`, {
      name: `${name}-server-tg`,
      port: 7233,
      protocol: "TCP",
      targetType: "ip",
      vpcId: args.vpcId,
    }, { parent: this });

    const temporalServerListener = new aws.lb.Listener(`${name}-server-listener`, {
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: temporalServertg.arn,
        }
      ],
      loadBalancerArn: alb.arn,
      port: 7233,
      protocol: "TCP",
    }, { parent: this });

    const temporalUitg = new aws.lb.TargetGroup(`${name}-ui-tg`, {
      name: `${name}-ui-tg`,
      port: 8088,
      protocol: "TCP",
      targetType: "ip",
      vpcId: args.vpcId,
    }, { parent: this });

    const temporalUiListener = new aws.lb.Listener(`${name}-ui-listener`, {
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: temporalUitg.arn,
        }
      ],
      loadBalancerArn: alb.arn,
      port: 8088,
      protocol: "TCP",
    }, { parent: this });

    const temporalWorkertg = new aws.lb.TargetGroup(`${name}-worker-tg`, {
      name: `${name}-worker-tg`,
      port: args.app.port,
      protocol: "TCP",
      targetType: "ip",
      vpcId: args.vpcId,
    }, { parent: this });

    const temporalWorkerListener = new aws.lb.Listener(`${name}-worker-listener`, {
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: temporalWorkertg.arn,
        }
      ],
      loadBalancerArn: alb.arn,
      port: args.app.port,
      protocol: "TCP",
    }, { parent: this });

    const execRole = new aws.iam.Role(`${name}-task-exec-role`, {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "",
            Effect: "Allow",
            Principal: {
              Service: "ecs-tasks.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      }),
    });

    const execPolicyAttachment = new aws.iam.RolePolicyAttachment(`${name}-task-exec-policy`, {
      role: execRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    const taskRole = new aws.iam.Role(`${name}-task-access-role`, {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "",
            Effect: "Allow",
            Principal: {
              Service: "ecs-tasks.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      }),
    });

    const taskPolicyAttachment = new aws.iam.RolePolicyAttachment(`${name}-task-access-policy`, {
      role: taskRole.name,
      policyArn: aws.iam.ManagedPolicy.AmazonECSFullAccess,
    });

    const temporalServerTaskName = `${name}-server-task`;
    const temporalServerContainerName = `${name}-server-container`;
    const temporalServerTaskDefinition = pulumi.all([args.dbType, args.dbHost, args.dbPort, args.dbName, args.dbUsername, args.dbPassword]).
      apply(([dbType, dbHost, dbPort, dbName, dbUsername, dbPassword]) =>
        new aws.ecs.TaskDefinition(temporalServerTaskName, {
          family: `${temporalServerTaskName}-definition`,
          cpu: "1024",
          memory: "2",
          networkMode: "awsvpc",
          requiresCompatibilities: ["EC2"],
          executionRoleArn: execRole.arn,
          taskRoleArn: taskRole.arn,
          containerDefinitions: JSON.stringify([{
            "name": temporalServerContainerName,
            "image": `temporalio/auto-setup:${args.serverVersion}`,
            "portMappings": [{
              "containerPort": 7233,
              "hostPort": 7233,
              "protocol": "tcp",
            }],
            "environment": [
              {
                "name": "DB",
                "value": `${dbType}`,
              },
              {
                "name": "DB_PORT",
                "value": `${dbPort}`,
              },
              {
                "name": "POSTGRES_SEEDS",
                "value": `${dbHost}`,
              },
              {
                "name": "DBNAME",
                "value": `${dbName}`,
              },
              {
                "name": "POSTGRES_USER",
                "value": `${dbUsername}`,
              },
              {
                "name": "POSTGRES_PWD",
                "value": `${dbPassword}`,
              },
              {
                "name": "DYNAMIC_CONFIG_FILE_PATH",
                "value": `config/dynamicconfig/development-sql.yaml`,
              },
            ],
          }]),
        }, { parent: this }),
      );

    const temporalServerService = new aws.ecs.Service(`${name}-server-service`, {
      cluster: cluster.arn,
      desiredCount: 1,
      launchType: "EC2",
      taskDefinition: temporalServerTaskDefinition.arn,
      networkConfiguration: {
        subnets: args.subnetIds,
        securityGroups: args.securityGroupIds,
      },
      loadBalancers: [{
        targetGroupArn: temporalServertg.arn,
        containerName: temporalServerContainerName,
        containerPort: 7233,
      }],
    }, { dependsOn: [temporalServerListener], parent: this });

    this.serverEndpoint = pulumi.interpolate`http://${alb.dnsName}:7233`;

    const ca: caCert = createCaCertificate();
    const cert: cert = createSignedCertificate(ca);

    const temporalUiTaskName = `${name}-ui-task`;
    const temporalUiContainerName = `${name}-ui-container`;
    const temporalUiTaskDefinition = pulumi.all([args.uiVersion]).apply(([uiVersion]) =>
      new aws.ecs.TaskDefinition(temporalUiTaskName, {
        family: `${temporalUiTaskName}-definition`,
        cpu: "256",
        memory: "1",
        networkMode: "awsvpc",
        requiresCompatibilities: ["EC2"],
        executionRoleArn: execRole.arn,
        taskRoleArn: taskRole.arn,
        containerDefinitions: JSON.stringify([{
          "name": temporalUiContainerName,
          "image": `temporalio/ui:${args.uiVersion}`,
          "portMappings": [{
            "containerPort": 8088,
            "hostPort": 8088,
            "protocol": "tcp",
          }],
          "environment": [
            {
              "name": "TEMPORAL_ADDRESS",
              "value": pulumi.interpolate`${this.serverEndpoint}`.apply(v => JSON.stringify(v)),
            },
            {
              "name": "TEMPORAL_UI_PORT",
              "value": "8088",
            },
            {
              "name": "TEMPORAL_UI_ENABLED",
              "value": "true",
            },
            {
              "name": "TEMPORAL_TLS_SERVER_NAME",
              "value": `${name}-ui-tls`,
            },
            {
              "name": "TEMPORAL_TLS_CERT_DATA",
              "value": `${cert.certificate}`,
            },
            {
              "name": "TEMPORAL_TLS_KEY_DATA",
              "value": `${cert.privateKey}`,
            },
            {
              "name": "TEMPORAL_TLS_CA_DATA",
              "value": `${ca.caCertificate}`,
            },
          ],
        }]),
      }, { parent: this }),
    );

    const temporalUiService = new aws.ecs.Service(`${name}-ui-service`, {
      cluster: cluster.arn,
      desiredCount: 1,
      launchType: "EC2",
      taskDefinition: temporalUiTaskDefinition.arn,
      networkConfiguration: {
        subnets: args.subnetIds,
        securityGroups: args.securityGroupIds,
      },
      loadBalancers: [{
        targetGroupArn: temporalUitg.arn,
        containerName: temporalUiContainerName,
        containerPort: 8088,
      }],
    }, { dependsOn: [temporalUiListener], parent: this });

    this.uiEndpoint = pulumi.interpolate`http://${alb.dnsName}:8088`;

    const repo = new aws.ecr.Repository(`${name}-repository`);

    const getRegistryInfo = async (rid: string) => {
      const creds = await aws.ecr.getCredentials({ registryId: rid });
      const decoded = Buffer.from(creds.authorizationToken, 'base64');
      const decodedString = decoded.toString('ascii');
      const parts = decodedString.split(':');

      if (parts.length !== 2) {
        console.error("invalid Credentials");
      }

      return {
        server: creds.proxyEndpoint,
        username: parts[0],
        password: parts[1],
      }
    };

    const temporalWorkerTaskName = `${name}-worker-task`;
    const temporalWorkerContainerName = `${name}-worker-container`;
    const temporalWorkerTaskDefinition = new aws.ecs.TaskDefinition(temporalWorkerTaskName, {
      family: `${temporalWorkerTaskName}-definition`,
      cpu: "256",
      memory: "1",
      networkMode: "awsvpc",
      requiresCompatibilities: ["EC2"],
      executionRoleArn: execRole.arn,
      taskRoleArn: taskRole.arn,
      containerDefinitions: JSON.stringify([{
        "name": temporalWorkerContainerName,
        "image": "daquan05/tickr:latest",
        "portMappings": [{
          "containerPort": args.app.port,
          "hostPort": args.app.port,
          "protocol": "tcp",
        }],
        "environment": [
          {
            "name": "TEMPORAL_GRPC_ENDPOINT",
            "value": pulumi.interpolate`${this.serverEndpoint}`.apply(v => JSON.stringify(v)),
          },
          {
            "name": "API_HOSTNAME",
            "value": config.require("API_HOSTNAME"),
          },
          {
            "name": "API_PORT",
            "value": config.require("API_PORT"),
          },
          {
            "name": "KAFKA_BROKER",
            "value": config.require("KAFKA_BROKER"),
          },
          {
            "name": "SCHEMA_REGISTRY_URL",
            "value": config.require("SCHEMA_REGISTRY_URL"),
          },
          {
            "name": "REDIRECT_URI",
            "value": config.require("REDIRECT_URI"),
          },
          {
            "name": "TD_AUTH_URL",
            "value": config.require("TD_AUTH_URL"),
          },
          {
            "name": "TD_USERNAME",
            "value": config.requireSecret("TD_USERNAME").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TD_PASSWORD",
            "value": config.requireSecret("TD_PASSWORD").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TD_ANSWER_1",
            "value": config.requireSecret("TD_ANSWER_1").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TD_ANSWER_2",
            "value": config.requireSecret("TD_ANSWER_2").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TD_ANSWER_3",
            "value": config.requireSecret("TD_ANSWER_3").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TD_ANSWER_4",
            "value": config.requireSecret("TD_ANSWER_4").apply(v => JSON.stringify(v)),
          },
          {
            "name": "TLS_CERT",
            "value": cert.certificate,
          },
          {
            "name": "TLS_KEY",
            "value": cert.privateKey,
          },
        ],
      }]),
    }, { parent: this });

    const temporalWorkerService = new aws.ecs.Service(`${name}-worker-service`, {
      cluster: cluster.arn,
      desiredCount: 1,
      launchType: "EC2",
      taskDefinition: temporalWorkerTaskDefinition.arn,
      networkConfiguration: {
        subnets: args.subnetIds,
        securityGroups: args.securityGroupIds,
      },
      loadBalancers: [{
        targetGroupArn: temporalWorkertg.arn,
        containerName: temporalWorkerContainerName,
        containerPort: args.app.port,
      }],
    }, { dependsOn: [temporalWorkerListener], parent: this });

    this.registerOutputs();
  };
};