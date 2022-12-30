import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

const password = new random.RandomPassword("mysql-password", {
    length: 16,
});

export const mysqlPassword = pulumi.secret(password.result);
