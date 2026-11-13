import {
	createFileBlockConfig,
	createFileBlockSpec,
	fileParse,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { MetisFileBlock } from "./MetisFileBlock";

const fileBlock = createReactBlockSpec(createFileBlockConfig, {
	meta: { fileBlockAccept: ["*/*"] },
	parse: fileParse(),
	render: MetisFileBlock,
})();

// Preserve BlockNote's durable HTML/Markdown export; canvas is only a view.
export const metisFileBlock = {
	...fileBlock,
	implementation: {
		...fileBlock.implementation,
		toExternalHTML: createFileBlockSpec().implementation.toExternalHTML,
	},
};
