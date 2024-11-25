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
                domain: "mock.yourdoc.click",
                ports: [
                    { listen: "80/http", redirect: "8000/http" },
                    { listen: "443/https", forward: "8000/http" }
                ],
            },
            dev: {
                command: "pnpm run dev",
            },
        });
    },
});
