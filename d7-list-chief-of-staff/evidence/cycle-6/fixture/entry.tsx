import React from "react";import {createRoot}from "react-dom/client";
import {Bridge}from "/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d7-list-chief-of-staff/spacedock-bridge/client/bridge.tsx";
const colors={foreground:"#e8eaed",foregroundMuted:"#a4a9b2",surface0:"#15171b",surface1:"#1b1e24",surface2:"#242830",border:"#3c424e",statusDanger:"#fa8585",statusSuccess:"#80d0a0",statusWarning:"#e5c277",accent:"#8fbdff"};
createRoot(document.getElementById("root")!).render(<Bridge host={{id:"fixture-host",label:"Fictional offline host"}}theme={{colors}as any}layout={{compact:innerWidth<760,platform:"web"}as any}navigation={{openAgent(){throw Error("Read-only fixture")}}as any}/>);
