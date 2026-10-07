"use client";

import { createContext, useContext } from "react";
import { DEFAULT_PLATFORM, Platform } from "./tokens";

/** The prompt target. On "ios" the canvas draws a few parts the way iOS 26 draws them;
 *  each keeps the size of its Material part, so snapping, layout and the prompt do not change. */
export const PlatformContext = createContext<Platform>(DEFAULT_PLATFORM);
export const usePlatform = () => useContext(PlatformContext);
