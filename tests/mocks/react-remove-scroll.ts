import type { ReactNode } from "react";

type RemoveScrollProps = {
  children?: ReactNode;
};

const RemoveScroll = ({ children }: RemoveScrollProps) => children ?? null;

(RemoveScroll as any).classNames = {};

// Export for both ESM and CommonJS patterns
export { RemoveScroll };
export default RemoveScroll;

// Handle the /dist/es5/index.js path that Radix UI imports
if (typeof module !== 'undefined') {
  module.exports = RemoveScroll;
  module.exports.RemoveScroll = RemoveScroll;
  module.exports.default = RemoveScroll;
}
