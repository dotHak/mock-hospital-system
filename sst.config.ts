/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
    app(input) {
        return {
            name: "mock-hospital-system",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        const vpc = new sst.aws.Vpc("MyVpc", { bastion: true });
        const cluster = new sst.aws.Cluster("MyCluster", { vpc });

        cluster.addService("MockHospitalSystem", {
            loadBalancer: {
                ports: [{ listen: "80/http", forward: "3000/http" }],
            },
            dev: {
                command: "pn run dev",
            },
        });
    }
});
