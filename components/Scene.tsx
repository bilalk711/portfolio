"use client";

import { useEffect, useRef } from "react";

type Props = { enabled: boolean; zoom: number; depth: number; onZoomChange: (zoom: number) => void };
const vertex = `attribute vec2 a_position; varying vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
const fragment = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_resolution,u_pointer,u_pan,u_click;
uniform float u_aspect,u_strength,u_time,u_zoom,u_depth,u_clickTime;
void main(){
  vec2 uv=vec2(v_uv.x,1.-v_uv.y);
  float ratio=u_resolution.x/u_resolution.y;
  vec2 cover=ratio>u_aspect?vec2(1.,u_aspect/ratio):vec2(ratio/u_aspect,1.);
  vec2 parallax=(u_pointer-.5)*vec2(.012,.007)*u_strength;
  vec2 sourceUV=(uv-.5)*cover/(1.+u_zoom)+.5-u_pan+parallax;
  vec2 mouseUV=(u_pointer-.5)*cover/(1.+u_zoom)+.5-u_pan+parallax;
  vec2 clickUV=(u_click-.5)*cover/(1.+u_zoom)+.5-u_pan+parallax;
  float face=1.-smoothstep(.88,1.15,length((sourceUV-vec2(.70,.46))/vec2(.17,.43)));
  float circuits=max(smoothstep(.70,.83,sourceUV.y),smoothstep(.80,.93,sourceUV.x));
  circuits=max(circuits,smoothstep(.47,.54,sourceUV.x)*(1.-smoothstep(.57,.63,sourceUV.x)));
  float mask=circuits*(1.-face);
  vec2 aspect=vec2(u_aspect,1.);
  float dist=length((sourceUV-mouseUV)*aspect);
  float lens=1.-smoothstep(.015,.24,dist);
  vec2 focused=mouseUV+(sourceUV-mouseUV)/(1.+lens*.085*u_strength*mask);
  float age=u_time-u_clickTime;
  float ring=exp(-pow((length((sourceUV-clickUV)*aspect)-age*.22)*24.,2.))*exp(-age*1.7)*step(0.,age);
  vec2 direction=normalize(sourceUV-clickUV+vec2(.00001));
  vec2 sampleUV=clamp(mix(sourceUV,focused,mask)+direction*ring*.006*mask,vec2(.001),vec2(.999));
  vec2 texel=1./u_resolution;
  float blur=u_depth*mask*(.35+u_strength*(1.-lens)*.9);
  vec3 color=texture2D(u_image,sampleUV).rgb*.4;
  color+=texture2D(u_image,sampleUV+texel*vec2(blur,0.)).rgb*.15;
  color+=texture2D(u_image,sampleUV-texel*vec2(blur,0.)).rgb*.15;
  color+=texture2D(u_image,sampleUV+texel*vec2(0.,blur)).rgb*.15;
  color+=texture2D(u_image,sampleUV-texel*vec2(0.,blur)).rgb*.15;
  float signal=smoothstep(.4,.85,color.r)*mask*(lens*u_strength*.17+ring*.35);
  gl_FragColor=vec4(color+vec3(signal),1.);
}`;

export default function Scene({ enabled, zoom, depth, onZoomChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ enabled, zoom, depth, onZoomChange });
  const invalidate = useRef<() => void>(() => {});
  useEffect(() => { settings.current = { enabled, zoom, depth, onZoomChange }; invalidate.current(); }, [enabled, zoom, depth, onZoomChange]);

  useEffect(() => {
    const surface = canvas.current;
    const stage = surface?.closest<HTMLElement>(".stage");
    if (!surface || !stage) return;
    const gl = surface.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) { surface.dataset.ready = "unavailable"; return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source); gl.compileShader(shader); shaders.push(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment), program = gl.createProgram();
    if (!vs || !fs || !program) { shaders.forEach(s => gl.deleteShader(s)); return; }
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    const uniforms = Object.fromEntries(["resolution","pointer","pan","click","aspect","strength","time","zoom","depth","clickTime"].map(n => [n,gl.getUniformLocation(program,`u_${n}`)]));
    let raf=0, ready=false, disposed=false, active=false, dragging=false, strength=0, currentZoom=0, aspect=16/9, clickTime=-100;
    let pointer={x:.5,y:.5}, smoothed={x:.5,y:.5}, click={x:.5,y:.5}, pan={x:0,y:0}, previous={x:0,y:0};
    const image = new Image();
    const frame = (time: number) => {
      raf=0;
      if (disposed || !ready || document.hidden) return;
      if (window.innerWidth<701) { surface.style.opacity="0";surface.dataset.active="false";return; }
      const animated=settings.current.enabled && !reduced.matches;
      const target=active && animated ? 1 : 0;
      strength+=(target-strength)*.075;
      currentZoom+=(settings.current.zoom-currentZoom)*(reduced.matches?1:.13);
      smoothed.x+=(pointer.x-smoothed.x)*.075; smoothed.y+=(pointer.y-smoothed.y)*.075;
      if (settings.current.zoom===0) { pan.x*=.85; pan.y*=.85; }
      const limit=currentZoom*.28;
      pan.x=Math.max(-limit,Math.min(limit,pan.x)); pan.y=Math.max(-limit,Math.min(limit,pan.y));
      gl.uniform2f(uniforms.resolution,surface.width,surface.height);
      gl.uniform2f(uniforms.pointer,smoothed.x,smoothed.y); gl.uniform2f(uniforms.pan,pan.x,pan.y); gl.uniform2f(uniforms.click,click.x,click.y);
      gl.uniform1f(uniforms.aspect,aspect); gl.uniform1f(uniforms.strength,strength); gl.uniform1f(uniforms.time,time/1000);
      gl.uniform1f(uniforms.zoom,currentZoom); gl.uniform1f(uniforms.depth,settings.current.depth); gl.uniform1f(uniforms.clickTime,animated?clickTime:-100);
      gl.drawArrays(gl.TRIANGLES,0,6);
      surface.style.opacity="1"; surface.dataset.active=target?"true":"false";
      surface.dataset.zoom=(1+currentZoom).toFixed(3); surface.dataset.pan=`${pan.x.toFixed(3)},${pan.y.toFixed(3)}`;
      const settling=Math.abs(settings.current.zoom-currentZoom)>.001 || (Math.abs(pan.x)+Math.abs(pan.y)>.001 && settings.current.zoom===0);
      if (target || strength>.003 || settling || (animated && time/1000-clickTime<3)) raf=requestAnimationFrame(frame);
    };
    const start = () => { if (ready && !raf && !document.hidden) raf=requestAnimationFrame(frame); };
    invalidate.current=start;
    const resize = () => {
      const box=stage.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio || 1,2);
      surface.width=Math.round(box.width*dpr); surface.height=Math.round(box.height*dpr); gl.viewport(0,0,surface.width,surface.height); start();
    };
    const isControl = (event: Event) => (event.target as Element).closest("button,a,input,nav,.hero-copy,.scene-controls");
    const move = (event: PointerEvent) => {
      if(window.innerWidth<701) return;
      const box=stage.getBoundingClientRect(); pointer={x:(event.clientX-box.left)/box.width,y:(event.clientY-box.top)/box.height};
      active=!isControl(event);
      if (dragging && settings.current.zoom>0) { pan.x+=(event.clientX-previous.x)/box.width*.7; pan.y+=(event.clientY-previous.y)/box.height*.7; previous={x:event.clientX,y:event.clientY}; }
      start();
    };
    const down = (event: PointerEvent) => {
      if (isControl(event) || window.innerWidth<701) return;
      click={...pointer}; clickTime=performance.now()/1000;
      dragging=true; previous={x:event.clientX,y:event.clientY}; stage.setPointerCapture(event.pointerId); stage.dataset.dragging="true"; start();
    };
    const up = (event: PointerEvent) => { dragging=false; stage.dataset.dragging="false"; if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId); };
    const leave = () => { active=false; pointer={x:.5,y:.5}; start(); };
    const wheel = (event: WheelEvent) => {
      if (isControl(event) || event.ctrlKey || window.innerWidth<701) return;
      event.preventDefault(); settings.current.onZoomChange(Math.max(0,Math.min(.65,settings.current.zoom-event.deltaY*.001))); start();
    };
    const visibility = () => { if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start(); };
    const lost = () => { cancelAnimationFrame(raf);raf=0;ready=false;surface.style.opacity="0";surface.dataset.ready="unavailable"; };
    image.onload=()=>{ if(disposed)return; aspect=image.naturalWidth/image.naturalHeight; gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;surface.dataset.ready="true";resize(); };
    image.src="/assets/portfolio-hero-v2-4k.webp";
    const observer=new ResizeObserver(resize);observer.observe(stage);
    stage.addEventListener("pointermove",move);stage.addEventListener("pointerdown",down);stage.addEventListener("pointerup",up);stage.addEventListener("pointercancel",up);stage.addEventListener("pointerleave",leave);stage.addEventListener("wheel",wheel,{passive:false});
    document.addEventListener("visibilitychange",visibility);reduced.addEventListener("change",leave);surface.addEventListener("webglcontextlost",lost);
    return()=>{
      disposed=true;cancelAnimationFrame(raf);observer.disconnect();invalidate.current=()=>{};
      stage.removeEventListener("pointermove",move);stage.removeEventListener("pointerdown",down);stage.removeEventListener("pointerup",up);stage.removeEventListener("pointercancel",up);stage.removeEventListener("pointerleave",leave);stage.removeEventListener("wheel",wheel);
      document.removeEventListener("visibilitychange",visibility);reduced.removeEventListener("change",leave);surface.removeEventListener("webglcontextlost",lost);
      gl.deleteTexture(texture);gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);
    };
  }, []);
  return <canvas ref={canvas} className="circuit-scene" aria-hidden="true" data-active="false" />;
}
