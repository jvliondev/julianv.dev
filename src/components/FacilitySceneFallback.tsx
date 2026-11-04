import { projects } from "@/data/projects";

const bays = [
  { id: "xondry", x: -8, y: 365, w: 340, h: 330, accent: "#b275ff", motif: "network" },
  { id: "squadamp", x: 285, y: 382, w: 265, h: 278, accent: "#ff9854", motif: "wave" },
  { id: "atomlang-evolved-sdk", x: 492, y: 400, w: 245, h: 250, accent: "#23d9ff", motif: "packet" },
  { id: "raeyl", x: 934, y: 400, w: 245, h: 250, accent: "#af84ff", motif: "key" },
  { id: "realball26", x: 1168, y: 382, w: 265, h: 278, accent: "#ffad5a", motif: "court" },
  { id: "classified", x: 1340, y: 345, w: 340, h: 330, accent: "#ff5269", motif: "sealed" },
];

export function FacilitySceneFallback({ open = false }: { open?: boolean }) {
  return <svg className="scene-fallback" viewBox="0 0 1672 780" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="rock" x2="0" y2="1"><stop stopColor="#1a2831"/><stop offset=".55" stopColor="#101920"/><stop offset="1" stopColor="#05090d"/></linearGradient>
      <linearGradient id="floor" x2="0" y2="1"><stop stopColor="#0b1720"/><stop offset=".45" stopColor="#101c25"/><stop offset="1" stopColor="#030609"/></linearGradient>
      <radialGradient id="portal" cx=".5" cy=".5" r=".5"><stop stopColor="#6bf8ff" stopOpacity=".95"/><stop offset=".08" stopColor="#25d9ed" stopOpacity=".55"/><stop offset=".35" stopColor="#0d7f9b" stopOpacity=".15"/><stop offset="1" stopColor="#07121a" stopOpacity="0"/></radialGradient>
      <linearGradient id="steel" x2="0" y2="1"><stop stopColor="#687c86"/><stop offset=".12" stopColor="#263743"/><stop offset=".52" stopColor="#15232d"/><stop offset=".9" stopColor="#344653"/><stop offset="1" stopColor="#0b141b"/></linearGradient>
      <linearGradient id="glass" x2="0" y2="1"><stop stopColor="#071b25"/><stop offset=".55" stopColor="#09151d"/><stop offset="1" stopColor="#03070a"/></linearGradient>
      <pattern id="rough" width="78" height="64" patternUnits="userSpaceOnUse"><path d="M4 8h29M50 17h17M18 39h37M3 57h18" stroke="#7d8d92" strokeOpacity=".1"/><circle cx="41" cy="27" r="1" fill="#a9bbbf" fillOpacity=".16"/><circle cx="68" cy="51" r="1.2" fill="#000" fillOpacity=".65"/></pattern>
      <pattern id="hazard" width="22" height="22" patternTransform="rotate(35)" patternUnits="userSpaceOnUse"><rect width="11" height="22" fill="#f0a448"/><rect x="11" width="11" height="22" fill="#101820"/></pattern>
      <filter id="soft"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1672" height="780" fill="#060c11"/>
    <path d="M0 0h1672v390L1145 463 836 340 527 463 0 390z" fill="url(#rock)"/>
    <path d="M0 0h1672v390L1145 463 836 340 527 463 0 390z" fill="url(#rough)"/>
    <path d="M0 0l485 48 175 352L0 476zm1672 0l-485 48-175 352 660 76z" fill="#111d25" stroke="#53626a" strokeOpacity=".22" strokeWidth="8"/>
    <path d="M10 20l447 48 153 318M1662 20l-447 48-153 318" fill="none" stroke="#344650" strokeWidth="20" opacity=".7"/>
    <path d="M50 0l220 400M1622 0l-220 400M340 0l145 396M1332 0l-145 396" stroke="#283943" strokeWidth="18"/>
    <path d="M36 0v360M1628 0v360M265 0v300M1407 0v300" stroke="#778890" strokeOpacity=".23" strokeWidth="5"/>
    <path d="M0 440L510 380l326-74 326 74 510 60v340H0z" fill="url(#floor)" stroke="#53636c" strokeOpacity=".32" strokeWidth="3"/>
    <path d="M0 440L510 380l326-74 326 74 510 60" fill="none" stroke="#7f939b" strokeOpacity=".32" strokeWidth="8"/>
    <path d="M0 500l836-194 836 194M0 598l836-292 836 292M0 704l836-398 836 398" fill="none" stroke="#5c727f" strokeOpacity=".13" strokeWidth="3"/>
    <g stroke="#397d91" strokeOpacity=".4" strokeWidth="3"><path d="M35 780L795 308"/><path d="M135 780L818 308"/><path d="M1637 780L877 308"/><path d="M1537 780L854 308"/></g>
    <path d="M68 780L816 309" stroke="#44d9f0" strokeWidth="7" opacity=".66" filter="url(#glow)"/>
    <path d="M1604 780L856 309" stroke="#44d9f0" strokeWidth="7" opacity=".66" filter="url(#glow)"/>
    <ellipse cx="836" cy="492" rx="430" ry="170" fill="#38b7dc" opacity=".12" filter="url(#soft)"/>
    <g transform="translate(836 278)">
      <circle r="333" fill="#081018" stroke="#020507" strokeWidth="34"/>
      <circle r="322" fill="none" stroke="url(#steel)" strokeWidth="44"/>
      <circle r="299" fill="none" stroke="#83969d" strokeOpacity=".42" strokeWidth="5"/>
      <circle r="278" fill="none" stroke="#243742" strokeWidth="21"/>
      <circle r="255" fill="none" stroke="#758991" strokeOpacity=".5" strokeWidth="4" strokeDasharray="28 9"/>
      <circle r="232" fill="none" stroke="#101d25" strokeWidth="32"/>
      <circle r="210" fill="none" stroke="#627b84" strokeOpacity=".38" strokeWidth="5"/>
      <circle r="195" fill="#071018" stroke="#1a3542" strokeWidth="18"/>
      <circle r="188" fill="url(#portal)"/>
      <path d="M-16-323h32v64h-32zm-16 264h64v16h-64z" fill="url(#hazard)" opacity=".75"/>
      <g fill="#acbcc0" stroke="#081018" strokeWidth="3">{Array.from({ length: 24 }, (_, i) => { const a = (Math.PI * 2 * i) / 24; return <circle key={i} cx={Math.cos(a) * 313} cy={Math.sin(a) * 313} r="7"/>; })}</g>
      <path d="M-12-189h24v375h-24z" fill="#b8ffff" opacity=".88" filter="url(#glow)"/>
      <g className={open ? "fallback-open" : "fallback-closed"}>
        <path d="M-7-188A188 188 0 0 0-7 188H-7z" fill="#17252e" stroke="#82949c" strokeOpacity=".5" strokeWidth="4"/>
        <path d="M7-188A188 188 0 0 1 7 188H7z" fill="#17252e" stroke="#82949c" strokeOpacity=".5" strokeWidth="4"/>
      </g>
    </g>
    {bays.map((bay) => {
      const product = projects.find((item) => item.id === bay.id)!;
      return <g key={bay.id} transform={`translate(${bay.x} ${bay.y})`}>
        <path d={`M0 30L28 0H${bay.w - 20}L${bay.w} 26V${bay.h}H0z`} fill="#03080c" stroke="#455964" strokeWidth="12"/>
        <path d={`M12 34L36 14H${bay.w - 30}L${bay.w - 12} 36V${bay.h - 12}H12z`} fill="url(#glass)" stroke={bay.accent} strokeOpacity=".65" strokeWidth="3"/>
        <path d={`M24 55H${bay.w - 24}V${bay.h - 25}H24z`} fill={bay.accent} opacity=".09"/>
        <path d={`M24 55H${bay.w - 24}V${bay.h - 25}H24z`} fill="url(#rough)" opacity=".6"/>
        <path d={`M0 ${bay.h - 6}H${bay.w}M8 28L28 4M${bay.w - 8} 28L${bay.w - 28} 4`} fill="none" stroke={bay.accent} strokeOpacity=".72" strokeWidth="7"/>
        {bay.motif === "network" && <g fill="none" stroke={bay.accent} strokeWidth="3"><circle cx={bay.w / 2} cy={bay.h * .58} r={bay.w * .19}/><circle cx={bay.w / 2} cy={bay.h * .58} r={bay.w * .28} strokeOpacity=".45"/><path d={`M${bay.w * .29} ${bay.h * .48}L${bay.w * .5} ${bay.h * .58}L${bay.w * .72} ${bay.h * .43}M${bay.w * .34} ${bay.h * .68}L${bay.w * .64} ${bay.h * .63}`}/></g>}
        {bay.motif === "wave" && <g strokeWidth="5" stroke={bay.accent}>{Array.from({ length: 15 }, (_, i) => <path key={i} d={`M${bay.w * .18 + i * bay.w * .046} ${bay.h * .58 - Math.sin(i * .9) * 12}v${28 + Math.abs(Math.cos(i)) * 60}`} strokeOpacity={.5 + .5 * (i % 2)}/> )}</g>}
        {bay.motif === "packet" && <g fill="#21dff4" stroke="#b2faff" strokeWidth="2"><circle cx={bay.w * .27} cy={bay.h * .57} r="15"/><circle cx={bay.w * .73} cy={bay.h * .57} r="15"/><path d={`M${bay.w * .35} ${bay.h * .57}H${bay.w * .65}`} stroke="#6ff8ff" strokeWidth="5"/><rect x={bay.w * .45} y={bay.h * .52} width="23" height="23"/></g>}
        {bay.motif === "key" && <g fill="none" stroke={bay.accent} strokeWidth="8"><circle cx={bay.w * .52} cy={bay.h * .48} r="25"/><path d={`M${bay.w * .52} ${bay.h * .55}L${bay.w * .37} ${bay.h * .76}h35l-15-21m15 21v-13m-25 13v-10`}/><circle cx={bay.w * .25} cy={bay.h * .65} r="8"/><circle cx={bay.w * .75} cy={bay.h * .65} r="8"/></g>}
        {bay.motif === "court" && <g fill="none" stroke={bay.accent} strokeWidth="3"><path d={`M${bay.w * .15} ${bay.h * .75}H${bay.w * .85}M${bay.w * .28} ${bay.h * .55}v${bay.h * .22}m${bay.w * .44} -${bay.h * .22}v${bay.h * .22}`}/><circle cx={bay.w * .5} cy={bay.h * .68} r="26"/><path d={`M${bay.w * .68} ${bay.h * .46}h45v33m-10-1h20`}/></g>}
        {bay.motif === "sealed" && <g fill="none" stroke="#ff5269" strokeWidth="7"><path d={`M${bay.w * .31} ${bay.h * .38}h${bay.w * .38}v${bay.h * .34}h-${bay.w * .38}z`}/><path d={`M${bay.w * .4} ${bay.h * .38}v-17a22 22 0 0 1 44 0v17`}/><path d={`M${bay.w * .5} ${bay.h * .5}v40m-13-13h26`}/></g>}
        <path d={`M14 ${bay.h - 46}H${bay.w - 14}`} stroke={bay.accent} strokeWidth="2" opacity=".8"/>
        <text x="24" y={bay.h - 20} fill="#d8e5e9" fontFamily="sans-serif" fontWeight="700" fontSize="16" letterSpacing="2">{product.shortName.toUpperCase()}</text>
      </g>;
    })}
    <g transform="translate(836 655)" fill="#03080c" stroke="#23424c" strokeWidth="3" opacity=".92">
      <circle cy="-62" r="24"/><path d="M-40-31q40-22 80 0l18 92H-58z"/><path d="M-28 50l-20 120h34l22-95 22 95h34L44 50z"/>
    </g>
    <g opacity=".35" fill="#c5e3e8"><circle cx="180" cy="420" r="3"/><circle cx="1425" cy="435" r="4"/><circle cx="270" cy="540" r="2"/><circle cx="1320" cy="528" r="3"/></g>
    <g fill="none" stroke="#ffad5a" strokeWidth="12" opacity=".75" filter="url(#glow)"><path d="M75 350h70"/><path d="M1525 350h70"/></g>
    <g fill="none" stroke="#f65371" strokeWidth="10" opacity=".8" filter="url(#glow)"><path d="M180 260h35"/><path d="M1457 260h35"/></g>
    <path d="M0 716L836 325l836 391" fill="none" stroke="#72d9eb" strokeOpacity=".1" strokeWidth="22"/>
  </svg>;
}
