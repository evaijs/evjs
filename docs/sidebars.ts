import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  guideSidebar: [
    {
      type: "category",
      label: "Introduction",
      items: ["overview", "quick-start"],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: ["architecture", "server-functions", "server-routes", "routing"],
    },
    {
      type: "category",
      label: "Community",
      items: ["contributing", "roadmap"],
    },
  ],
};

export default sidebars;
