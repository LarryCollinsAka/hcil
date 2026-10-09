import type { HomeBlock } from "@/content/types";
import { Audiences } from "./Audiences";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Highlights } from "./Highlights";
import { Languages } from "./Languages";
import { Principles } from "./Principles";
import { Steps } from "./Steps";

// Maps each block type to its component. Unknown types are ignored, so a newer database block
// cannot break an older deployment.
export function BlockRenderer({ blocks }: { blocks: HomeBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "hero":
            return <Hero key={index} {...block.props} />;
          case "highlights":
            return <Highlights key={index} {...block.props} />;
          case "steps":
            return <Steps key={index} {...block.props} />;
          case "principles":
            return <Principles key={index} {...block.props} />;
          case "audiences":
            return <Audiences key={index} {...block.props} />;
          case "languages":
            return <Languages key={index} {...block.props} />;
          case "faq":
            return <Faq key={index} {...block.props} />;
          case "cta":
            return <Cta key={index} {...block.props} />;
          default:
            return null;
        }
      })}
    </>
  );
}
