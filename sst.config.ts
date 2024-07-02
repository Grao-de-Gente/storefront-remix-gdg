import type { SSTConfig } from "sst";
import { RemixSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "storefront-remix-gdg-1",
      region: "sa-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new RemixSite(stack, "site", {
        runtime: "nodejs20.x",
        environment: {
          NODE_ENV: "production",
          VENDURE_API_URL:"https://back.graodegente.app/shop-api",
          CF_PAGES:"1",
        },
      });
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;
