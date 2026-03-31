import { createContext } from "react";

export const HeaderContext = createContext({
  showHeader: true,
  setShowHeader: () => {},
});