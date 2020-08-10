"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const config = new pulumi.Config();

const publicKey = config.get("publicKey");
const key = new aws.ec2.KeyPair("emil-e-commerce", { publicKey });
const keyName = key.keyName;

let size = "t2.micro";
let ubuntu = pulumi.output(
  aws.getAmi(
    {
      filters: [
        {
          name: "name",
          values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
        },
        {
          name: "virtualization-type",
          values: ["hvm"]
        }
      ],
      mostRecent: true,
      owners: ["099720109477"] // Canonical
    },
    { async: true }
  )
);

let group = new aws.ec2.SecurityGroup("webserver-secgrp", {
  description: "Simple e-commerce",
  ingress: [
    { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }
  ],
  egress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] }
  ]
});

let server = new aws.ec2.Instance("webserver-www", {
  instanceType: size,
  keyName,
  ami: ubuntu.id,
  vpcSecurityGroupIds: [group.id]
});

exports.publicIp = server.publicIp;
exports.publicHostName = server.publicDns;
