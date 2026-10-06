"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LightningBoltIcon } from "@radix-ui/react-icons";

export default function CircuitCursor({ host }: { host?: HTMLElement|null }) {
  const cursor=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=cursor.current;if(!element)return;
    const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const move=(event:PointerEvent)=>{
      if(!fine.matches||event.pointerType==="touch"||window.innerWidth<701){reset();return;}
      element.style.setProperty("--cursor-x",`${event.clientX}px`);element.style.setProperty("--cursor-y",`${event.clientY}px`);
      element.dataset.visible="true";document.documentElement.classList.add("custom-cursor");
      element.dataset.mode=(event.target as Element).closest("a,button,input")?"link":"scene";
      element.dataset.reduced=String(reduced.matches);
    };
    const leave=(event:MouseEvent)=>{if(!event.relatedTarget){element.dataset.visible="false";document.documentElement.classList.remove("custom-cursor");}};
    const down=()=>{element.dataset.pressed="true";};const up=()=>{element.dataset.pressed="false";};
    const reset=()=>{element.dataset.visible="false";document.documentElement.classList.remove("custom-cursor");};
    window.addEventListener("pointermove",move);window.addEventListener("mouseout",leave);window.addEventListener("pointerdown",down);window.addEventListener("pointerup",up);window.addEventListener("blur",reset);fine.addEventListener("change",reset);
    return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("mouseout",leave);window.removeEventListener("pointerdown",down);window.removeEventListener("pointerup",up);window.removeEventListener("blur",reset);fine.removeEventListener("change",reset);document.documentElement.classList.remove("custom-cursor");};
  },[host]);
  const content=<div ref={cursor} className="circuit-cursor" aria-hidden="true" data-visible="false"><LightningBoltIcon /><span className="cursor-orbit" /></div>;
  return host?createPortal(content,host):content;
}
