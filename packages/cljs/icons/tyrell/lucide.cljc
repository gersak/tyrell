(ns
 tyrell.lucide
 (:refer-clojure
  :exclude
  [tag
   atom
   import
   map
   shuffle
   cat
   divide
   hash
   key
   replace
   type
   merge
   filter
   list
   send
   repeat]))


(def
 hand-helping
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14'/>\n<path d='m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9'/>\n<path d='m2 13 6 6'/>\n</svg>\n")


(def helping-hand hand-helping)


(def
 underline
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 4v6a6 6 0 0 0 12 0V4'/>\n<line y2='20' y1='20' x2='20' x1='4'/>\n</svg>\n")


(def
 file-plus-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M3 15h6'/>\n<path d='M6 12v6'/>\n</svg>\n")


(def
 sigma
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2'/>\n</svg>\n")


(def
 clock-9
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6H8'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 triangle-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/>\n<path d='M12 9v4'/>\n<path d='M12 17h.01'/>\n</svg>\n")


(def alert-triangle triangle-alert)


(def
 ethernet-port
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 20 3-3h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2l3 3z'/>\n<path d='M6 8v1'/>\n<path d='M10 8v1'/>\n<path d='M14 8v1'/>\n<path d='M18 8v1'/>\n</svg>\n")


(def
 triangle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'/>\n</svg>\n")


(def
 hand
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/>\n<path d='M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/>\n<path d='M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8'/>\n<path d='M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'/>\n</svg>\n")


(def
 search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21 21-4.34-4.34'/>\n<circle r='8' cy='11' cx='11'/>\n</svg>\n")


(def
 chart-scatter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle fill='currentColor' r='.5' cy='7.5' cx='7.5'/>\n<circle fill='currentColor' r='.5' cy='5.5' cx='18.5'/>\n<circle fill='currentColor' r='.5' cy='11.5' cx='11.5'/>\n<circle fill='currentColor' r='.5' cy='16.5' cx='7.5'/>\n<circle fill='currentColor' r='.5' cy='14.5' cx='17.5'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n</svg>\n")


(def scatter-chart chart-scatter)


(def
 signpost-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9H4L2 7l2-2h6'/>\n<path d='M14 5h6l2 2-2 2h-6'/>\n<path d='M10 22V4a2 2 0 1 1 4 0v18'/>\n<path d='M8 22h8'/>\n</svg>\n")


(def
 volume-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/>\n<path d='M16 9a5 5 0 0 1 0 6'/>\n<path d='M19.364 18.364a9 9 0 0 0 0-12.728'/>\n</svg>\n")


(def
 hand-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16'/>\n<path d='m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95'/>\n<path d='m2 15 6 6'/>\n<path d='m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91'/>\n</svg>\n")


(def
 columns-3-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5'/>\n<path d='m14.3 19.6 1-.4'/>\n<path d='M15 3v7.5'/>\n<path d='m15.2 16.9-.9-.3'/>\n<path d='m16.6 21.7.3-.9'/>\n<path d='m16.8 15.3-.4-1'/>\n<path d='m19.1 15.2.3-.9'/>\n<path d='m19.6 21.7-.4-1'/>\n<path d='m20.7 16.8 1-.4'/>\n<path d='m21.7 19.4-.9-.3'/>\n<path d='M9 3v18'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def columns-settings columns-3-cog)


(def table-config columns-3-cog)


(def
 contact
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 2v2'/>\n<path d='M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2'/>\n<path d='M8 2v2'/>\n<circle r='3' cy='11' cx='12'/>\n<rect rx='2' height='18' width='18' y='4' x='3'/>\n</svg>\n")


(def
 beer-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 13v5'/>\n<path d='M17 11.47V8'/>\n<path d='M17 11h1a3 3 0 0 1 2.745 4.211'/>\n<path d='m2 2 20 20'/>\n<path d='M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3'/>\n<path d='M7.536 7.535C6.766 7.649 6.154 8 5.5 8a2.5 2.5 0 0 1-1.768-4.268'/>\n<path d='M8.727 3.204C9.306 2.767 9.885 2 11 2c1.56 0 2 1.5 3 1.5s1.72-.5 2.5-.5a1 1 0 1 1 0 5c-.78 0-1.5-.5-2.5-.5a3.149 3.149 0 0 0-.842.12'/>\n<path d='M9 14.6V18'/>\n</svg>\n")


(def
 send-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z'/>\n<path d='M6 12h16'/>\n</svg>\n")


(def send-horizonal send-horizontal)


(def
 move-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 18L12 22L16 18'/>\n<path d='M12 2V22'/>\n</svg>\n")


(def
 clipboard-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='M9 14h6'/>\n<path d='M12 17v-6'/>\n</svg>\n")


(def
 gamepad-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='11' y1='11' x2='10' x1='6'/>\n<line y2='13' y1='9' x2='8' x1='8'/>\n<line y2='12' y1='12' x2='15.01' x1='15'/>\n<line y2='10' y1='10' x2='18.01' x1='18'/>\n<path d='M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z'/>\n</svg>\n")


(def
 lectern
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12h3a2 2 0 0 0 1.902-1.38l1.056-3.333A1 1 0 0 0 21 6H3a1 1 0 0 0-.958 1.287l1.056 3.334A2 2 0 0 0 5 12h3'/>\n<path d='M18 6V3a1 1 0 0 0-1-1h-3'/>\n<rect rx='1' y='10' x='8' height='12' width='8'/>\n</svg>\n")


(def
 lasso
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.704 14.467A10 8 0 0 1 2 10a10 8 0 0 1 20 0 10 8 0 0 1-10 8 10 8 0 0 1-5.181-1.158'/>\n<path d='M7 22a5 5 0 0 1-2-3.994'/>\n<circle r='2' cy='16' cx='5'/>\n</svg>\n")


(def
 eraser
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/>\n<path d='m5.082 11.09 8.828 8.828'/>\n</svg>\n")


(def
 chart-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='m19 9-5 5-4-4-3 3'/>\n</svg>\n")


(def line-chart chart-line)


(def
 disc-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='4' cy='12' cx='12'/>\n<path d='M12 12h.01'/>\n</svg>\n")


(def
 receipt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8'/>\n<path d='M12 17.5v-11'/>\n</svg>\n")


(def
 bed-single
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8'/>\n<path d='M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4'/>\n<path d='M3 18h18'/>\n</svg>\n")


(def
 wine
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 22h8'/>\n<path d='M7 10h10'/>\n<path d='M12 15v7'/>\n<path d='M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z'/>\n</svg>\n")


(def
 briefcase-medical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 11v4'/>\n<path d='M14 13h-4'/>\n<path d='M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/>\n<path d='M18 6v14'/>\n<path d='M6 6v14'/>\n<rect rx='2' y='6' x='2' height='14' width='20'/>\n</svg>\n")


(def
 ice-cream-bowl
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0'/>\n<path d='M12.14 11a3.5 3.5 0 1 1 6.71 0'/>\n<path d='M15.5 6.5a3.5 3.5 0 1 0-7 0'/>\n</svg>\n")


(def ice-cream-2 ice-cream-bowl)


(def
 parking-meter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 15h2'/>\n<path d='M12 12v3'/>\n<path d='M12 19v3'/>\n<path d='M15.282 19a1 1 0 0 0 .948-.68l2.37-6.988a7 7 0 1 0-13.2 0l2.37 6.988a1 1 0 0 0 .948.68z'/>\n<path d='M9 9a3 3 0 1 1 6 0'/>\n</svg>\n")


(def
 file-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3'/>\n<path d='m9 18-1.5-1.5'/>\n<circle r='3' cy='14' cx='5'/>\n</svg>\n")


(def
 arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 5v14'/>\n<path d='m19 12-7 7-7-7'/>\n</svg>\n")


(def
 check-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 4L9 15'/>\n<path d='M21 19L3 19'/>\n<path d='M9 15L4 10'/>\n</svg>\n")


(def
 figma
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z'/>\n<path d='M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z'/>\n<path d='M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z'/>\n<path d='M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z'/>\n<path d='M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z'/>\n</svg>\n")


(def
 corner-right-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 9 5-5 5 5'/>\n<path d='M4 20h7a4 4 0 0 0 4-4V4'/>\n</svg>\n")


(def
 file-key
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<circle r='2' cy='16' cx='10'/>\n<path d='m16 10-4.5 4.5'/>\n<path d='m15 11 1 1'/>\n</svg>\n")


(def
 earth
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.54 15H17a2 2 0 0 0-2 2v4.54'/>\n<path d='M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17'/>\n<path d='M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def globe-2 earth)


(def
 laptop-minimal-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h20'/>\n<path d='m9 10 2 2 4-4'/>\n<rect rx='2' height='12' width='18' y='4' x='3'/>\n</svg>\n")


(def
 chevrons-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 17 5-5-5-5'/>\n<path d='m13 17 5-5-5-5'/>\n</svg>\n")


(def
 beef
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3'/>\n<path d='m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5'/>\n<circle r='2.5' cy='8.5' cx='12.5'/>\n</svg>\n")


(def
 flashlight
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z'/>\n<line y2='6' y1='6' x2='18' x1='6'/>\n<line y2='12' y1='12' x2='12' x1='12'/>\n</svg>\n")


(def
 file-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n</svg>\n")


(def file-edit file-pen)


(def
 ghost
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 10h.01'/>\n<path d='M15 10h.01'/>\n<path d='M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z'/>\n</svg>\n")


(def
 list
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12h.01'/>\n<path d='M3 18h.01'/>\n<path d='M3 6h.01'/>\n<path d='M8 12h13'/>\n<path d='M8 18h13'/>\n<path d='M8 6h13'/>\n</svg>\n")


(def
 biceps-flexed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1'/>\n<path d='M15 14a5 5 0 0 0-7.584 2'/>\n<path d='M9.964 6.825C8.019 7.977 9.5 13 8 15'/>\n</svg>\n")


(def
 cctv
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97'/>\n<path d='M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z'/>\n<path d='M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15'/>\n<path d='M2 21v-4'/>\n<path d='M7 9h.01'/>\n</svg>\n")


(def
 volume-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 9a5 5 0 0 1 .95 2.293'/>\n<path d='M19.364 5.636a9 9 0 0 1 1.889 9.96'/>\n<path d='m2 2 20 20'/>\n<path d='m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11'/>\n<path d='M9.828 4.172A.686.686 0 0 1 11 4.657v.686'/>\n</svg>\n")


(def
 text-cursor-input
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6'/>\n<path d='M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7'/>\n<path d='M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1'/>\n<path d='M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1'/>\n<path d='M9 6v12'/>\n</svg>\n")


(def
 image-upscale
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3h5v5'/>\n<path d='M17 21h2a2 2 0 0 0 2-2'/>\n<path d='M21 12v3'/>\n<path d='m21 3-5 5'/>\n<path d='M3 7V5a2 2 0 0 1 2-2'/>\n<path d='m5 21 4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19'/>\n<path d='M9 3h3'/>\n<rect rx='1' height='10' width='10' y='11' x='3'/>\n</svg>\n")


(def
 megaphone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z'/>\n<path d='M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14'/>\n<path d='M8 6v8'/>\n</svg>\n")


(def
 croissant
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487'/>\n<path d='M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132'/>\n<path d='M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42'/>\n<path d='M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14'/>\n<path d='M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676'/>\n</svg>\n")


(def
 toy-brick
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='8' x='3' height='12' width='18'/>\n<path d='M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3'/>\n<path d='M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3'/>\n</svg>\n")


(def
 pencil-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982'/>\n<path d='m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353'/>\n<path d='m15 5 4 4'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 route-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='19' cx='6'/>\n<path d='M9 19h8.5c.4 0 .9-.1 1.3-.2'/>\n<path d='M5.2 5.2A3.5 3.53 0 0 0 6.5 12H12'/>\n<path d='m2 2 20 20'/>\n<path d='M21 15.3a3.5 3.5 0 0 0-3.3-3.3'/>\n<path d='M15 5h-4.3'/>\n<circle r='3' cy='5' cx='18'/>\n</svg>\n")


(def
 square-arrow-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 12h8'/>\n<path d='m12 16 4-4-4-4'/>\n</svg>\n")


(def arrow-right-square square-arrow-right)


(def
 briefcase-business
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12h.01'/>\n<path d='M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/>\n<path d='M22 13a18.15 18.15 0 0 1-20 0'/>\n<rect rx='2' y='6' x='2' height='14' width='20'/>\n</svg>\n")


(def
 house
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'/>\n<path d='M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/>\n</svg>\n")


(def home house)


(def
 swiss-franc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 21V3h8'/>\n<path d='M6 16h9'/>\n<path d='M10 9.5h7'/>\n</svg>\n")


(def
 navigation-2-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9.31 9.31 5 21l7-4 7 4-1.17-3.17'/>\n<path d='M14.53 8.88 12 2l-1.17 3.17'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 bluetooth-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 17-5 5V12l-5 5'/>\n<path d='m2 2 20 20'/>\n<path d='M14.5 9.5 17 7l-5-5v4.5'/>\n</svg>\n")


(def
 bed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 4v16'/>\n<path d='M2 8h18a2 2 0 0 1 2 2v10'/>\n<path d='M2 17h20'/>\n<path d='M6 8v9'/>\n</svg>\n")


(def
 panel-right-close
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M15 3v18'/>\n<path d='m8 9 3 3-3 3'/>\n</svg>\n")


(def
 signal-low
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h.01'/>\n<path d='M7 20v-4'/>\n</svg>\n")


(def
 chevrons-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 6 5 5 5-5'/>\n<path d='m7 13 5 5 5-5'/>\n</svg>\n")


(def
 memory-stick
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 19v-3'/>\n<path d='M10 19v-3'/>\n<path d='M14 19v-3'/>\n<path d='M18 19v-3'/>\n<path d='M8 11V9'/>\n<path d='M16 11V9'/>\n<path d='M12 11V9'/>\n<path d='M2 15h20'/>\n<path d='M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z'/>\n</svg>\n")


(def
 clock-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l2 1'/>\n<path d='M12.337 21.994a10 10 0 1 1 9.588-8.767'/>\n<path d='m14 18 4 4 4-4'/>\n<path d='M18 14v8'/>\n</svg>\n")


(def
 disc-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M6 12c0-1.7.7-3.2 1.8-4.2'/>\n<circle r='2' cy='12' cx='12'/>\n<path d='M18 12c0 1.7-.7 3.2-1.8 4.2'/>\n</svg>\n")


(def
 wind
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.8 19.6A2 2 0 1 0 14 16H2'/>\n<path d='M17.5 8a2.5 2.5 0 1 1 2 4H2'/>\n<path d='M9.8 4.4A2 2 0 1 1 11 8H2'/>\n</svg>\n")


(def
 corner-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 14 5-5-5-5'/>\n<path d='M4 20v-7a4 4 0 0 1 4-4h12'/>\n</svg>\n")


(def
 clapperboard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z'/>\n<path d='m6.2 5.3 3.1 3.9'/>\n<path d='m12.4 3.4 3.1 4'/>\n<path d='M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'/>\n</svg>\n")


(def
 subscript
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m4 5 8 8'/>\n<path d='m12 5-8 8'/>\n<path d='M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07'/>\n</svg>\n")


(def
 file-digit
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<rect rx='2' y='12' x='2' height='6' width='4'/>\n<path d='M10 12h2v6'/>\n<path d='M10 18h4'/>\n</svg>\n")


(def
 arrow-big-down-dash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 11a1 1 0 0 0 1 1h2.939a1 1 0 0 1 .75 1.811l-6.835 6.836a1.207 1.207 0 0 1-1.707 0L4.31 13.81a1 1 0 0 1 .75-1.811H8a1 1 0 0 0 1-1V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z'/>\n<path d='M9 4h6'/>\n</svg>\n")


(def
 grape
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 5V2l-5.89 5.89'/>\n<circle r='3' cy='15.89' cx='16.6'/>\n<circle r='3' cy='7.4' cx='8.11'/>\n<circle r='3' cy='11.65' cx='12.35'/>\n<circle r='3' cy='5.85' cx='13.91'/>\n<circle r='3' cy='10.09' cx='18.15'/>\n<circle r='3' cy='13.2' cx='6.56'/>\n<circle r='3' cy='17.44' cx='10.8'/>\n<circle r='3' cy='19' cx='5'/>\n</svg>\n")


(def
 flip-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3'/>\n<path d='M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3'/>\n<path d='M4 12H2'/>\n<path d='M10 12H8'/>\n<path d='M16 12h-2'/>\n<path d='M22 12h-2'/>\n</svg>\n")


(def
 hdmi-port
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 9a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1l2 2h12l2-2h1a1 1 0 0 0 1-1Z'/>\n<path d='M7.5 12h9'/>\n</svg>\n")


(def
 target
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='6' cy='12' cx='12'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 user-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 15H6a4 4 0 0 0-4 4v2'/>\n<path d='m14.305 16.53.923-.382'/>\n<path d='m15.228 13.852-.923-.383'/>\n<path d='m16.852 12.228-.383-.923'/>\n<path d='m16.852 17.772-.383.924'/>\n<path d='m19.148 12.228.383-.923'/>\n<path d='m19.53 18.696-.382-.924'/>\n<path d='m20.772 13.852.924-.383'/>\n<path d='m20.772 16.148.924.383'/>\n<circle r='3' cy='15' cx='18'/>\n<circle r='4' cy='7' cx='9'/>\n</svg>\n")


(def
 scissors
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='6'/>\n<path d='M8.12 8.12 12 12'/>\n<path d='M20 4 8.12 15.88'/>\n<circle r='3' cy='18' cx='6'/>\n<path d='M14.8 14.8 20 20'/>\n</svg>\n")


(def
 minimize-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 10 7-7'/>\n<path d='M20 10h-6V4'/>\n<path d='m3 21 7-7'/>\n<path d='M4 14h6v6'/>\n</svg>\n")


(def
 cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z'/>\n<path d='M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'/>\n<path d='M12 2v2'/>\n<path d='M12 22v-2'/>\n<path d='m17 20.66-1-1.73'/>\n<path d='M11 10.27 7 3.34'/>\n<path d='m20.66 17-1.73-1'/>\n<path d='m3.34 7 1.73 1'/>\n<path d='M14 12h8'/>\n<path d='M2 12h2'/>\n<path d='m20.66 7-1.73 1'/>\n<path d='m3.34 17 1.73-1'/>\n<path d='m17 3.34-1 1.73'/>\n<path d='m11 13.73-4 6.93'/>\n</svg>\n")


(def
 waypoints
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2.5' cy='4.5' cx='12'/>\n<path d='m10.2 6.3-3.9 3.9'/>\n<circle r='2.5' cy='12' cx='4.5'/>\n<path d='M7 12h10'/>\n<circle r='2.5' cy='12' cx='19.5'/>\n<path d='m13.8 17.7 3.9-3.9'/>\n<circle r='2.5' cy='19.5' cx='12'/>\n</svg>\n")


(def
 megaphone-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.636 6A13 13 0 0 0 19.4 3.2 1 1 0 0 1 21 4v11.344'/>\n<path d='M14.378 14.357A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1'/>\n<path d='m2 2 20 20'/>\n<path d='M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14'/>\n<path d='M8 8v6'/>\n</svg>\n")


(def
 file-video-camera
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<rect rx='1' y='12' x='2' height='6' width='8'/>\n<path d='m10 13.843 3.033-1.755a.645.645 0 0 1 .967.56v4.704a.645.645 0 0 1-.967.56L10 16.157'/>\n</svg>\n")


(def file-video-2 file-video-camera)


(def
 receipt-pound-sterling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M8 13h5'/>\n<path d='M10 17V9.5a2.5 2.5 0 0 1 5 0'/>\n<path d='M8 17h7'/>\n</svg>\n")


(def
 crosshair
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<line y2='12' y1='12' x2='18' x1='22'/>\n<line y2='12' y1='12' x2='2' x1='6'/>\n<line y2='2' y1='6' x2='12' x1='12'/>\n<line y2='18' y1='22' x2='12' x1='12'/>\n</svg>\n")


(def
 align-vertical-distribute-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='14' x='5' height='6' width='14'/>\n<rect rx='2' y='4' x='7' height='6' width='10'/>\n<path d='M2 20h20'/>\n<path d='M2 10h20'/>\n</svg>\n")


(def
 pi
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='20' y1='4' x2='9' x1='9'/>\n<path d='M4 7c0-1.7 1.3-3 3-3h13'/>\n<path d='M18 20c-1.7 0-3-1.3-3-3V4'/>\n</svg>\n")


(def
 table-cells-merge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 21v-6'/>\n<path d='M12 9V3'/>\n<path d='M3 15h18'/>\n<path d='M3 9h18'/>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n</svg>\n")


(def
 square-equal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 10h10'/>\n<path d='M7 14h10'/>\n</svg>\n")


(def equal-square square-equal)


(def
 file-sliders
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 12h8'/>\n<path d='M10 11v2'/>\n<path d='M8 17h8'/>\n<path d='M14 16v2'/>\n</svg>\n")


(def
 package-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-9'/>\n<path d='M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z'/>\n<path d='M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13'/>\n<path d='M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z'/>\n</svg>\n")


(def
 vegan
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 8q6 0 6-6-6 0-6 6'/>\n<path d='M17.41 3.59a10 10 0 1 0 3 3'/>\n<path d='M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14'/>\n</svg>\n")


(def
 airplay
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1'/>\n<path d='m12 15 5 6H7Z'/>\n</svg>\n")


(def
 gallery-thumbnails
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='14' width='18'/>\n<path d='M4 21h1'/>\n<path d='M9 21h1'/>\n<path d='M14 21h1'/>\n<path d='M19 21h1'/>\n</svg>\n")


(def
 clock-8
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l-4 2'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 section
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 5a4 3 0 0 0-8 0c0 4 8 3 8 7a4 3 0 0 1-8 0'/>\n<path d='M8 19a4 3 0 0 0 8 0c0-4-8-3-8-7a4 3 0 0 1 8 0'/>\n</svg>\n")


(def
 message-circle-warning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='M12 8v4'/>\n<path d='M12 16h.01'/>\n</svg>\n")


(def
 line-squiggle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2'/>\n</svg>\n")


(def
 badge-euro
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M7 12h5'/>\n<path d='M15 9.4a4 4 0 1 0 0 5.2'/>\n</svg>\n")


(def
 repeat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 2 4 4-4 4'/>\n<path d='M3 11v-1a4 4 0 0 1 4-4h14'/>\n<path d='m7 22-4-4 4-4'/>\n<path d='M21 13v1a4 4 0 0 1-4 4H3'/>\n</svg>\n")


(def
 circle-user-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 20a6 6 0 0 0-12 0'/>\n<circle r='4' cy='10' cx='12'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def user-circle-2 circle-user-round)


(def
 square-chevron-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m10 8 4 4-4 4'/>\n</svg>\n")


(def chevron-right-square square-chevron-right)


(def
 arrow-right-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 3 4 4-4 4'/>\n<path d='M20 7H4'/>\n<path d='m8 21-4-4 4-4'/>\n<path d='M4 17h16'/>\n</svg>\n")


(def
 grip
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='5' cx='12'/>\n<circle r='1' cy='5' cx='19'/>\n<circle r='1' cy='5' cx='5'/>\n<circle r='1' cy='12' cx='12'/>\n<circle r='1' cy='12' cx='19'/>\n<circle r='1' cy='12' cx='5'/>\n<circle r='1' cy='19' cx='12'/>\n<circle r='1' cy='19' cx='19'/>\n<circle r='1' cy='19' cx='5'/>\n</svg>\n")


(def
 luggage
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2'/>\n<path d='M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14'/>\n<path d='M10 20h4'/>\n<circle r='2' cy='20' cx='16'/>\n<circle r='2' cy='20' cx='8'/>\n</svg>\n")


(def
 badge-turkish-lira
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 7v10a5 5 0 0 0 5-5'/>\n<path d='m15 8-6 3'/>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76'/>\n</svg>\n")


(def
 hourglass
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 22h14'/>\n<path d='M5 2h14'/>\n<path d='M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22'/>\n<path d='M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'/>\n</svg>\n")


(def
 russian-ruble
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 11h8a4 4 0 0 0 0-8H9v18'/>\n<path d='M6 15h8'/>\n</svg>\n")


(def
 circle-chevron-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m10 8 4 4-4 4'/>\n</svg>\n")


(def chevron-right-circle circle-chevron-right)


(def
 microwave
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='15' width='20'/>\n<rect rx='1' y='8' x='6' height='7' width='8'/>\n<path d='M18 8v7'/>\n<path d='M6 19v2'/>\n<path d='M18 19v2'/>\n</svg>\n")


(def
 volume-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/>\n<path d='M16 9a5 5 0 0 1 0 6'/>\n</svg>\n")


(def
 party-popper
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5.8 11.3 2 22l10.7-3.79'/>\n<path d='M4 3h.01'/>\n<path d='M22 8h.01'/>\n<path d='M15 2h.01'/>\n<path d='M22 20h.01'/>\n<path d='m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10'/>\n<path d='m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17'/>\n<path d='m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7'/>\n<path d='M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z'/>\n</svg>\n")


(def
 boxes
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z'/>\n<path d='m7 16.5-4.74-2.85'/>\n<path d='m7 16.5 5-3'/>\n<path d='M7 16.5v5.17'/>\n<path d='M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z'/>\n<path d='m17 16.5-5-3'/>\n<path d='m17 16.5 4.74-2.85'/>\n<path d='M17 16.5v5.17'/>\n<path d='M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z'/>\n<path d='M12 8 7.26 5.15'/>\n<path d='m12 8 4.74-2.85'/>\n<path d='M12 13.5V8'/>\n</svg>\n")


(def
 file-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M2.62 13.8A2.25 2.25 0 1 1 6 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z'/>\n<path d='M4 6.005V4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-1.9-1.376'/>\n</svg>\n")


(def
 printer-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5'/>\n<path d='m16 19 2 2 4-4'/>\n<path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2'/>\n<path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/>\n</svg>\n")


(def
 reply
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 18v-2a4 4 0 0 0-4-4H4'/>\n<path d='m9 17-5-5 5-5'/>\n</svg>\n")


(def
 badge-percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='m15 9-6 6'/>\n<path d='M9 9h.01'/>\n<path d='M15 15h.01'/>\n</svg>\n")


(def
 type-outline
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z'/>\n</svg>\n")


(def
 square-dashed-kanban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 7v7'/>\n<path d='M12 7v4'/>\n<path d='M16 7v9'/>\n<path d='M5 3a2 2 0 0 0-2 2'/>\n<path d='M9 3h1'/>\n<path d='M14 3h1'/>\n<path d='M19 3a2 2 0 0 1 2 2'/>\n<path d='M21 9v1'/>\n<path d='M21 14v1'/>\n<path d='M21 19a2 2 0 0 1-2 2'/>\n<path d='M14 21h1'/>\n<path d='M9 21h1'/>\n<path d='M5 21a2 2 0 0 1-2-2'/>\n<path d='M3 14v1'/>\n<path d='M3 9v1'/>\n</svg>\n")


(def kanban-square-dashed square-dashed-kanban)


(def
 hamburger
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25'/>\n<path d='M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2'/>\n<path d='M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0'/>\n<path d='m6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2'/>\n</svg>\n")


(def
 sunrise
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v8'/>\n<path d='m4.93 10.93 1.41 1.41'/>\n<path d='M2 18h2'/>\n<path d='M20 18h2'/>\n<path d='m19.07 10.93-1.41 1.41'/>\n<path d='M22 22H2'/>\n<path d='m8 6 4-4 4 4'/>\n<path d='M16 18a4 4 0 0 0-8 0'/>\n</svg>\n")


(def
 toggle-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='15'/>\n<rect rx='7' y='5' x='2' height='14' width='20'/>\n</svg>\n")


(def
 square-star
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.035 7.69a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def
 map-pin-plus-inside
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'/>\n<path d='M12 7v6'/>\n<path d='M9 10h6'/>\n</svg>\n")


(def
 bug-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 7.13V6a3 3 0 0 0-5.14-2.1L8 2'/>\n<path d='M14.12 3.88 16 2'/>\n<path d='M22 13h-4v-2a4 4 0 0 0-4-4h-1.3'/>\n<path d='M20.97 5c0 2.1-1.6 3.8-3.5 4'/>\n<path d='m2 2 20 20'/>\n<path d='M7.7 7.7A4 4 0 0 0 6 11v3a6 6 0 0 0 11.13 3.13'/>\n<path d='M12 20v-8'/>\n<path d='M6 13H2'/>\n<path d='M3 21c0-2.1 1.7-3.9 3.8-4'/>\n</svg>\n")


(def
 message-square-share
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4'/>\n<path d='M16 3h6v6'/>\n<path d='m16 9 6-6'/>\n</svg>\n")


(def
 beer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 11h1a3 3 0 0 1 0 6h-1'/>\n<path d='M9 12v6'/>\n<path d='M13 12v6'/>\n<path d='M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z'/>\n<path d='M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8'/>\n</svg>\n")


(def
 pointer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 14a8 8 0 0 1-8 8'/>\n<path d='M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/>\n<path d='M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1'/>\n<path d='M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10'/>\n<path d='M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'/>\n</svg>\n")


(def
 receipt-indian-rupee
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M8 7h8'/>\n<path d='M12 17.5 8 15h1a4 4 0 0 0 0-8'/>\n<path d='M8 11h8'/>\n</svg>\n")


(def
 chart-bar-stacked
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 13v4'/>\n<path d='M15 5v4'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<rect rx='1' height='4' width='9' y='13' x='7'/>\n<rect rx='1' height='4' width='12' y='5' x='7'/>\n</svg>\n")


(def
 squares-intersect
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 22a2 2 0 0 1-2-2'/>\n<path d='M14 2a2 2 0 0 1 2 2'/>\n<path d='M16 22h-2'/>\n<path d='M2 10V8'/>\n<path d='M2 4a2 2 0 0 1 2-2'/>\n<path d='M20 8a2 2 0 0 1 2 2'/>\n<path d='M22 14v2'/>\n<path d='M22 20a2 2 0 0 1-2 2'/>\n<path d='M4 16a2 2 0 0 1-2-2'/>\n<path d='M8 10a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H9a1 1 0 0 1-1-1z'/>\n<path d='M8 2h2'/>\n</svg>\n")


(def
 sheet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<line y2='9' y1='9' x2='21' x1='3'/>\n<line y2='15' y1='15' x2='21' x1='3'/>\n<line y2='21' y1='9' x2='9' x1='9'/>\n<line y2='21' y1='9' x2='15' x1='15'/>\n</svg>\n")


(def
 spray-can
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3h.01'/>\n<path d='M7 5h.01'/>\n<path d='M11 7h.01'/>\n<path d='M3 7h.01'/>\n<path d='M7 9h.01'/>\n<path d='M3 11h.01'/>\n<rect y='5' x='15' height='4' width='4'/>\n<path d='m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2'/>\n<path d='m13 14 8-2'/>\n<path d='m13 19 8-2'/>\n</svg>\n")


(def
 scan-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<path d='M7 12h10'/>\n</svg>\n")


(def
 circle-check-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.801 10A10 10 0 1 1 17 3.335'/>\n<path d='m9 11 3 3L22 4'/>\n</svg>\n")


(def check-circle circle-check-big)


(def
 unfold-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-6'/>\n<path d='M12 8V2'/>\n<path d='M4 12H2'/>\n<path d='M10 12H8'/>\n<path d='M16 12h-2'/>\n<path d='M22 12h-2'/>\n<path d='m15 19-3 3-3-3'/>\n<path d='m15 5-3-3-3 3'/>\n</svg>\n")


(def
 chart-candlestick
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 5v4'/>\n<rect rx='1' y='9' x='7' height='6' width='4'/>\n<path d='M9 15v2'/>\n<path d='M17 3v2'/>\n<rect rx='1' y='5' x='15' height='8' width='4'/>\n<path d='M17 13v3'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n</svg>\n")


(def candlestick-chart chart-candlestick)


(def
 git-pull-request-draft
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='18' cx='18'/>\n<circle r='3' cy='6' cx='6'/>\n<path d='M18 6V5'/>\n<path d='M18 11v-1'/>\n<line y2='21' y1='9' x2='6' x1='6'/>\n</svg>\n")


(def
 chart-no-axes-column-increasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='10' y1='20' x2='12' x1='12'/>\n<line y2='4' y1='20' x2='18' x1='18'/>\n<line y2='16' y1='20' x2='6' x1='6'/>\n</svg>\n")


(def bar-chart chart-no-axes-column-increasing)


(def
 layout-list
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='7' width='7'/>\n<rect rx='1' y='14' x='3' height='7' width='7'/>\n<path d='M14 4h7'/>\n<path d='M14 9h7'/>\n<path d='M14 15h7'/>\n<path d='M14 20h7'/>\n</svg>\n")


(def
 umbrella
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 12a10.06 10.06 1 0 0-20 0Z'/>\n<path d='M12 12v8a2 2 0 0 0 4 0'/>\n<path d='M12 2v1'/>\n</svg>\n")


(def
 user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='12'/>\n</svg>\n")


(def
 list-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12H3'/>\n<path d='M16 18H3'/>\n<path d='M10 6H3'/>\n<path d='M21 18V8a2 2 0 0 0-2-2h-5'/>\n<path d='m16 8-2-2 2-2'/>\n</svg>\n")


(def
 file-chart-column-increasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 18v-2'/>\n<path d='M12 18v-4'/>\n<path d='M16 18v-6'/>\n</svg>\n")


(def file-bar-chart file-chart-column-increasing)


(def
 lasso-select
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 22a5 5 0 0 1-2-4'/>\n<path d='M7 16.93c.96.43 1.96.74 2.99.91'/>\n<path d='M3.34 14A6.8 6.8 0 0 1 2 10c0-4.42 4.48-8 10-8s10 3.58 10 8a7.19 7.19 0 0 1-.33 2'/>\n<path d='M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'/>\n<path d='M14.33 22h-.09a.35.35 0 0 1-.24-.32v-10a.34.34 0 0 1 .33-.34c.08 0 .15.03.21.08l7.34 6a.33.33 0 0 1-.21.59h-4.49l-2.57 3.85a.35.35 0 0 1-.28.14z'/>\n</svg>\n")


(def
 arrow-big-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 11a1 1 0 0 0 1 1h2.939a1 1 0 0 1 .75 1.811l-6.835 6.836a1.207 1.207 0 0 1-1.707 0L4.31 13.81a1 1 0 0 1 .75-1.811H8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z'/>\n</svg>\n")


(def
 iteration-cw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 10a8 8 0 1 1 8 8H4'/>\n<path d='m8 22-4-4 4-4'/>\n</svg>\n")


(def
 fullscreen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<rect rx='1' y='8' x='7' height='8' width='10'/>\n</svg>\n")


(def
 message-circle-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 5.004 2.224 3 3 0 0 1-.832 2.083l-3.447 3.62a1 1 0 0 1-1.45-.001z'/>\n</svg>\n")


(def
 sun-dim
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='12' cx='12'/>\n<path d='M12 4h.01'/>\n<path d='M20 12h.01'/>\n<path d='M12 20h.01'/>\n<path d='M4 12h.01'/>\n<path d='M17.657 6.343h.01'/>\n<path d='M17.657 17.657h.01'/>\n<path d='M6.343 17.657h.01'/>\n<path d='M6.343 6.343h.01'/>\n</svg>\n")


(def
 saudi-riyal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m20 19.5-5.5 1.2'/>\n<path d='M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2'/>\n<path d='m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2'/>\n<path d='M20 10 4 13.5'/>\n</svg>\n")


(def
 chart-network
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13.11 7.664 1.78 2.672'/>\n<path d='m14.162 12.788-3.324 1.424'/>\n<path d='m20 4-6.06 1.515'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<circle r='2' cy='6' cx='12'/>\n<circle r='2' cy='12' cx='16'/>\n<circle r='2' cy='15' cx='9'/>\n</svg>\n")


(def
 replace-all
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2'/>\n<path d='M14 4a2 2 0 0 1 2-2'/>\n<path d='M16 10a2 2 0 0 1-2-2'/>\n<path d='M20 14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2'/>\n<path d='M20 2a2 2 0 0 1 2 2'/>\n<path d='M22 8a2 2 0 0 1-2 2'/>\n<path d='m3 7 3 3 3-3'/>\n<path d='M6 10V5a 3 3 0 0 1 3-3h1'/>\n<rect rx='2' height='8' width='8' y='14' x='2'/>\n</svg>\n")


(def
 square-arrow-out-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6'/>\n<path d='m3 21 9-9'/>\n<path d='M9 21H3v-6'/>\n</svg>\n")


(def arrow-down-left-from-square square-arrow-out-down-left)


(def
 cannabis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-4'/>\n<path d='M7 12c-1.5 0-4.5 1.5-5 3 3.5 1.5 6 1 6 1-1.5 1.5-2 3.5-2 5 2.5 0 4.5-1.5 6-3 1.5 1.5 3.5 3 6 3 0-1.5-.5-3.5-2-5 0 0 2.5.5 6-1-.5-1.5-3.5-3-5-3 1.5-1 4-4 4-6-2.5 0-5.5 1.5-7 3 0-2.5-.5-5-2-7-1.5 2-2 4.5-2 7-1.5-1.5-4.5-3-7-3 0 2 2.5 5 4 6'/>\n</svg>\n")


(def
 iteration-ccw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 14 4 4-4 4'/>\n<path d='M20 10a8 8 0 1 0-8 8h8'/>\n</svg>\n")


(def
 message-circle-more
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='M8 12h.01'/>\n<path d='M12 12h.01'/>\n<path d='M16 12h.01'/>\n</svg>\n")


(def
 file-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M9 15h6'/>\n</svg>\n")


(def
 heart-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49'/>\n<path d='M15 15h6'/>\n<path d='M18 12v6'/>\n</svg>\n")


(def
 square-power
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v4'/>\n<path d='M7.998 9.003a5 5 0 1 0 8-.005'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def power-square square-power)


(def
 square-chevron-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m8 14 4-4 4 4'/>\n</svg>\n")


(def chevron-up-square square-chevron-up)


(def
 panda
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.25 17.25h1.5L12 18z'/>\n<path d='m15 12 2 2'/>\n<path d='M18 6.5a.5.5 0 0 0-.5-.5'/>\n<path d='M20.69 9.67a4.5 4.5 0 1 0-7.04-5.5 8.35 8.35 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5C2.49 11.2 2 12.88 2 14.5 2 19.47 6.48 22 12 22s10-2.53 10-7.5c0-1.62-.48-3.3-1.3-4.83'/>\n<path d='M6 6.5a.495.495 0 0 1 .5-.5'/>\n<path d='m9 12-2 2'/>\n</svg>\n")


(def
 align-horizontal-justify-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='6' height='14' width='6'/>\n<rect rx='2' y='7' x='16' height='10' width='6'/>\n<path d='M2 2v20'/>\n</svg>\n")


(def
 copy-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='18' y1='12' x2='15' x1='15'/>\n<line y2='15' y1='15' x2='18' x1='12'/>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 timer-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2h4'/>\n<path d='M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7'/>\n<path d='M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2'/>\n<path d='m2 2 20 20'/>\n<path d='M12 12v-2'/>\n</svg>\n")


(def
 folder-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='m9 13 2 2 4-4'/>\n</svg>\n")


(def
 chart-column-decreasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 17V9'/>\n<path d='M18 17v-3'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M8 17V5'/>\n</svg>\n")


(def
 badge-japanese-yen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='m9 8 3 3v7'/>\n<path d='m12 11 3-3'/>\n<path d='M9 12h6'/>\n<path d='M9 16h6'/>\n</svg>\n")


(def
 arrow-up-from-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 9-6-6-6 6'/>\n<path d='M12 3v14'/>\n<path d='M5 21h14'/>\n</svg>\n")


(def
 flip-vertical-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 3-5 5-5-5h10'/>\n<path d='m17 21-5-5-5 5h10'/>\n<path d='M4 12H2'/>\n<path d='M10 12H8'/>\n<path d='M16 12h-2'/>\n<path d='M22 12h-2'/>\n</svg>\n")


(def
 annoyed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M8 15h8'/>\n<path d='M8 9h2'/>\n<path d='M14 9h2'/>\n</svg>\n")


(def
 ligature
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 12h2v8'/>\n<path d='M14 20h4'/>\n<path d='M6 12h4'/>\n<path d='M6 20h4'/>\n<path d='M8 20V8a4 4 0 0 1 7.464-2'/>\n</svg>\n")


(def
 message-square-warning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M12 15h.01'/>\n<path d='M12 7v4'/>\n</svg>\n")


(def
 layout-grid
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='7' width='7'/>\n<rect rx='1' y='3' x='14' height='7' width='7'/>\n<rect rx='1' y='14' x='14' height='7' width='7'/>\n<rect rx='1' y='14' x='3' height='7' width='7'/>\n</svg>\n")


(def
 rocking-chair
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polyline points='3.5 2 6.5 12.5 18 12.5'/>\n<line y2='20' y1='12.5' x2='5.5' x1='9.5'/>\n<line y2='20' y1='12.5' x2='18.5' x1='15'/>\n<path d='M2.75 18a13 13 0 0 0 18.5 0'/>\n</svg>\n")


(def
 chevrons-up-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 15 5 5 5-5'/>\n<path d='m7 9 5-5 5 5'/>\n</svg>\n")


(def
 kayak
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 17a1 1 0 0 0-1 1v1a2 2 0 1 0 2-2z'/>\n<path d='M20.97 3.61a.45.45 0 0 0-.58-.58C10.2 6.6 6.6 10.2 3.03 20.39a.45.45 0 0 0 .58.58C13.8 17.4 17.4 13.8 20.97 3.61'/>\n<path d='m6.707 6.707 10.586 10.586'/>\n<path d='M7 5a2 2 0 1 0-2 2h1a1 1 0 0 0 1-1z'/>\n</svg>\n")


(def
 badge-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<line y2='12' y1='12' x2='16' x1='8'/>\n</svg>\n")


(def
 calendar-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.82-1.18'/>\n<path d='M21 15.5V6a2 2 0 0 0-2-2H9.5'/>\n<path d='M16 2v4'/>\n<path d='M3 10h7'/>\n<path d='M21 10h-5.5'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 circle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 air-vent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 17.5a2.5 2.5 0 1 1-4 2.03V12'/>\n<path d='M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/>\n<path d='M6 8h12'/>\n<path d='M6.6 15.572A2 2 0 1 0 10 17v-5'/>\n</svg>\n")


(def
 phone-missed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 2 6 6'/>\n<path d='m22 2-6 6'/>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 scale-3d
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 7v11a1 1 0 0 0 1 1h11'/>\n<path d='M5.293 18.707 11 13'/>\n<circle r='2' cy='19' cx='19'/>\n<circle r='2' cy='5' cx='5'/>\n</svg>\n")


(def scale-3-d scale-3d)


(def
 corner-left-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 9 9 4 4 9'/>\n<path d='M20 20h-7a4 4 0 0 1-4-4V4'/>\n</svg>\n")


(def
 milk
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2h8'/>\n<path d='M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2'/>\n<path d='M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0'/>\n</svg>\n")


(def
 clipboard-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5'/>\n<path d='M4 13.5V6a2 2 0 0 1 2-2h2'/>\n<path d='M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n</svg>\n")


(def clipboard-edit clipboard-pen)


(def
 file-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M12 12v6'/>\n<path d='m15 15-3-3-3 3'/>\n</svg>\n")


(def
 copyright
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M14.83 14.83a4 4 0 1 1 0-5.66'/>\n</svg>\n")


(def
 picture-in-picture
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 10h6V4'/>\n<path d='m2 4 6 6'/>\n<path d='M21 10V7a2 2 0 0 0-2-2h-7'/>\n<path d='M3 14v2a2 2 0 0 0 2 2h3'/>\n<rect rx='1' height='7' width='10' y='14' x='12'/>\n</svg>\n")


(def
 vault
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<circle fill='currentColor' r='.5' cy='7.5' cx='7.5'/>\n<path d='m7.9 7.9 2.7 2.7'/>\n<circle fill='currentColor' r='.5' cy='7.5' cx='16.5'/>\n<path d='m13.4 10.6 2.7-2.7'/>\n<circle fill='currentColor' r='.5' cy='16.5' cx='7.5'/>\n<path d='m7.9 16.1 2.7-2.7'/>\n<circle fill='currentColor' r='.5' cy='16.5' cx='16.5'/>\n<path d='m13.4 13.4 2.7 2.7'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 circle-power
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v4'/>\n<path d='M7.998 9.003a5 5 0 1 0 8-.005'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def power-circle circle-power)


(def
 omega
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 20h4.5a.5.5 0 0 0 .5-.5v-.282a.52.52 0 0 0-.247-.437 8 8 0 1 1 8.494-.001.52.52 0 0 0-.247.438v.282a.5.5 0 0 0 .5.5H21'/>\n</svg>\n")


(def
 mailbox
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z'/>\n<polyline points='15,9 18,9 18,11'/>\n<path d='M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2'/>\n<line y2='10' y1='10' x2='7' x1='6'/>\n</svg>\n")


(def
 gitlab
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z'/>\n</svg>\n")


(def
 music
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 18V5l12-2v13'/>\n<circle r='3' cy='18' cx='6'/>\n<circle r='3' cy='16' cx='18'/>\n</svg>\n")


(def
 rectangle-ellipsis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='6' x='2' height='12' width='20'/>\n<path d='M12 12h.01'/>\n<path d='M17 12h.01'/>\n<path d='M7 12h.01'/>\n</svg>\n")


(def form-input rectangle-ellipsis)


(def
 smartphone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='2' x='5' height='20' width='14'/>\n<path d='M12 18h.01'/>\n</svg>\n")


(def
 file-symlink
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 18 3-3-3-3'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M4 11V4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7'/>\n</svg>\n")


(def
 file-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/>\n<path d='M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z'/>\n</svg>\n")


(def file-video file-play)


(def
 alarm-clock-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='13' cx='12'/>\n<path d='M5 3 2 6'/>\n<path d='m22 6-3-3'/>\n<path d='M6.38 18.7 4 21'/>\n<path d='M17.64 18.67 20 21'/>\n<path d='m9 13 2 2 4-4'/>\n</svg>\n")


(def alarm-check alarm-clock-check)


(def
 handbag
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z'/>\n<path d='M8 11V6a4 4 0 0 1 8 0v5'/>\n</svg>\n")


(def
 door-closed-locked
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12h.01'/>\n<path d='M18 9V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14'/>\n<path d='M2 20h8'/>\n<path d='M20 17v-2a2 2 0 1 0-4 0v2'/>\n<rect rx='1' height='5' width='8' y='17' x='14'/>\n</svg>\n")


(def
 candy-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10v7.9'/>\n<path d='M11.802 6.145a5 5 0 0 1 6.053 6.053'/>\n<path d='M14 6.1v2.243'/>\n<path d='m15.5 15.571-.964.964a5 5 0 0 1-7.071 0 5 5 0 0 1 0-7.07l.964-.965'/>\n<path d='M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4'/>\n<path d='m2 2 20 20'/>\n<path d='M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4'/>\n</svg>\n")


(def
 turntable
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12.01h.01'/>\n<path d='M18 8v4a8 8 0 0 1-1.07 4'/>\n<circle r='4' cy='12' cx='10'/>\n<rect rx='2' height='16' width='20' y='4' x='2'/>\n</svg>\n")


(def
 circuit-board
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M11 9h4a2 2 0 0 0 2-2V3'/>\n<circle r='2' cy='9' cx='9'/>\n<path d='M7 21v-4a2 2 0 0 1 2-2h4'/>\n<circle r='2' cy='15' cx='15'/>\n</svg>\n")


(def
 folder-tree
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z'/>\n<path d='M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z'/>\n<path d='M3 5a2 2 0 0 0 2 2h3'/>\n<path d='M3 3v13a2 2 0 0 0 2 2h3'/>\n</svg>\n")


(def
 chart-gantt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 6h8'/>\n<path d='M12 16h6'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M8 11h7'/>\n</svg>\n")


(def
 equal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='9' y1='9' x2='19' x1='5'/>\n<line y2='15' y1='15' x2='19' x1='5'/>\n</svg>\n")


(def
 grid-2x2-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3'/>\n<path d='M16 19h6'/>\n<path d='M19 22v-6'/>\n</svg>\n")


(def grid-2-x-2-plus grid-2x2-plus)


(def
 recycle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5'/>\n<path d='M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12'/>\n<path d='m14 16-3 3 3 3'/>\n<path d='M8.293 13.596 7.196 9.5 3.1 10.598'/>\n<path d='m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843'/>\n<path d='m13.378 9.633 4.096 1.098 1.097-4.096'/>\n</svg>\n")


(def
 arrow-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 17V7h10'/>\n<path d='M17 17 7 7'/>\n</svg>\n")


(def
 clipboard-type
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='M9 12v-1h6v1'/>\n<path d='M11 17h2'/>\n<path d='M12 11v6'/>\n</svg>\n")


(def
 library
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 6 4 14'/>\n<path d='M12 6v14'/>\n<path d='M8 8v12'/>\n<path d='M4 4v16'/>\n</svg>\n")


(def
 panel-top-close
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n<path d='m9 16 3-3 3 3'/>\n</svg>\n")


(def
 square-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 8v8'/>\n<path d='m8 12 4 4 4-4'/>\n</svg>\n")


(def arrow-down-square square-arrow-down)


(def
 list-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 12H3'/>\n<path d='M16 6H3'/>\n<path d='M16 18H3'/>\n<path d='M18 9v6'/>\n<path d='M21 12h-6'/>\n</svg>\n")


(def
 chevron-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 9 6 6 6-6'/>\n</svg>\n")


(def
 backpack
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'/>\n<path d='M8 10h8'/>\n<path d='M8 18h8'/>\n<path d='M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6'/>\n<path d='M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'/>\n</svg>\n")


(def
 calendar-check-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<path d='M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8'/>\n<path d='M3 10h18'/>\n<path d='m16 20 2 2 4-4'/>\n</svg>\n")


(def
 cloud-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 15-5.5 5.5L9 18'/>\n<path d='M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742'/>\n</svg>\n")


(def
 heading
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 12h12'/>\n<path d='M6 20V4'/>\n<path d='M18 20V4'/>\n</svg>\n")


(def
 hexagon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>\n</svg>\n")


(def
 non-binary
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v10'/>\n<path d='m8.5 4 7 4'/>\n<path d='m8.5 8 7-4'/>\n<circle r='5' cy='17' cx='12'/>\n</svg>\n")


(def
 strikethrough
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 4H9a3 3 0 0 0-2.83 4'/>\n<path d='M14 12a4 4 0 0 1 0 8H6'/>\n<line y2='12' y1='12' x2='20' x1='4'/>\n</svg>\n")


(def
 calendar-fold
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<path d='M21 17V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11Z'/>\n<path d='M3 10h18'/>\n<path d='M15 22v-4a2 2 0 0 1 2-2h4'/>\n</svg>\n")


(def
 message-square-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5'/>\n</svg>\n")


(def
 bird
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 7h.01'/>\n<path d='M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20'/>\n<path d='m20 7 2 .5-2 .5'/>\n<path d='M10 18v3'/>\n<path d='M14 17.75V21'/>\n<path d='M7 18a6 6 0 0 0 3.84-10.61'/>\n</svg>\n")


(def
 bot-message-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6V2H8'/>\n<path d='M15 11v2'/>\n<path d='M2 12h2'/>\n<path d='M20 12h2'/>\n<path d='M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z'/>\n<path d='M9 11v2'/>\n</svg>\n")


(def
 sun-medium
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='12' cx='12'/>\n<path d='M12 3v1'/>\n<path d='M12 20v1'/>\n<path d='M3 12h1'/>\n<path d='M20 12h1'/>\n<path d='m18.364 5.636-.707.707'/>\n<path d='m6.343 17.657-.707.707'/>\n<path d='m5.636 5.636.707.707'/>\n<path d='m17.657 17.657.707.707'/>\n</svg>\n")


(def
 calendar-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 18 4 4 4-4'/>\n<path d='M16 2v4'/>\n<path d='M18 14v8'/>\n<path d='M21 11.354V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.343'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 badge-info
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<line y2='12' y1='16' x2='12' x1='12'/>\n<line y2='8' y1='8' x2='12.01' x1='12'/>\n</svg>\n")


(def
 shield-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M9 12h6'/>\n<path d='M12 9v6'/>\n</svg>\n")


(def
 tickets
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m4.5 8 10.58-5.06a1 1 0 0 1 1.342.488L18.5 8'/>\n<path d='M6 10V8'/>\n<path d='M6 14v1'/>\n<path d='M6 19v2'/>\n<rect rx='2' height='13' width='20' y='8' x='2'/>\n</svg>\n")


(def
 book-marked
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v8l3-3 3 3V2'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n</svg>\n")


(def
 creative-commons
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M10 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1'/>\n<path d='M17 9.3a2.8 2.8 0 0 0-3.5 1 3.1 3.1 0 0 0 0 3.4 2.7 2.7 0 0 0 3.5 1'/>\n</svg>\n")


(def
 shirt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z'/>\n</svg>\n")


(def
 dock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 8h20'/>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M6 16h12'/>\n</svg>\n")


(def
 signpost
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13v8'/>\n<path d='M12 3v3'/>\n<path d='M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z'/>\n</svg>\n")


(def
 door-closed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12h.01'/>\n<path d='M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14'/>\n<path d='M2 20h20'/>\n</svg>\n")


(def
 github
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4'/>\n<path d='M9 18c-4.51 2-5-2-7-2'/>\n</svg>\n")


(def
 fold-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 12h6'/>\n<path d='M22 12h-6'/>\n<path d='M12 2v2'/>\n<path d='M12 8v2'/>\n<path d='M12 14v2'/>\n<path d='M12 20v2'/>\n<path d='m19 9-3 3 3 3'/>\n<path d='m5 15 3-3-3-3'/>\n</svg>\n")


(def
 nfc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 8.32a7.43 7.43 0 0 1 0 7.36'/>\n<path d='M9.46 6.21a11.76 11.76 0 0 1 0 11.58'/>\n<path d='M12.91 4.1a15.91 15.91 0 0 1 .01 15.8'/>\n<path d='M16.37 2a20.16 20.16 0 0 1 0 20'/>\n</svg>\n")


(def
 clipboard-paste
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 14h10'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v1.344'/>\n<path d='m17 18 4-4-4-4'/>\n<path d='M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113'/>\n<rect rx='1' height='4' width='8' y='2' x='8'/>\n</svg>\n")


(def
 cone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98'/>\n<ellipse ry='3' rx='9' cy='19' cx='12'/>\n</svg>\n")


(def
 cooking-pot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 12h20'/>\n<path d='M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8'/>\n<path d='m4 8 16-4'/>\n<path d='m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8'/>\n</svg>\n")


(def
 proportions
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M12 9v11'/>\n<path d='M2 9h13a2 2 0 0 1 2 2v9'/>\n</svg>\n")


(def
 bring-to-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='8' width='8' y='8' x='8'/>\n<path d='M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2'/>\n<path d='M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2'/>\n</svg>\n")


(def
 usb
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='7' cx='10'/>\n<circle r='1' cy='20' cx='4'/>\n<path d='M4.7 19.3 19 5'/>\n<path d='m21 3-3 1 2 2Z'/>\n<path d='M9.26 7.68 5 12l2 5'/>\n<path d='m10 14 5 2 3.5-3.5'/>\n<path d='m18 12 1-1 1 1-1 1Z'/>\n</svg>\n")


(def
 separator-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v18'/>\n<path d='m16 16 4-4-4-4'/>\n<path d='m8 8-4 4 4 4'/>\n</svg>\n")


(def
 hard-hat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5'/>\n<path d='M14 6a6 6 0 0 1 6 6v3'/>\n<path d='M4 15v-3a6 6 0 0 1 6-6'/>\n<rect rx='1' height='4' width='20' y='15' x='2'/>\n</svg>\n")


(def
 cake-slice
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 13H3'/>\n<path d='M16 17H3'/>\n<path d='m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6'/>\n<circle r='2' cy='7' cx='9'/>\n</svg>\n")


(def
 sun-moon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v2'/>\n<path d='M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715'/>\n<path d='M16 12a4 4 0 0 0-4-4'/>\n<path d='m19 5-1.256 1.256'/>\n<path d='M20 12h2'/>\n</svg>\n")


(def
 ticket
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='M13 5v2'/>\n<path d='M13 17v2'/>\n<path d='M13 11v2'/>\n</svg>\n")


(def
 calendar-plus-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n<path d='M10 16h4'/>\n<path d='M12 14v4'/>\n</svg>\n")


(def
 case-lower
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9v7'/>\n<path d='M14 6v10'/>\n<circle r='3.5' cy='12.5' cx='17.5'/>\n<circle r='3.5' cy='12.5' cx='6.5'/>\n</svg>\n")


(def
 mail-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2'/>\n<path d='M20 22v.01'/>\n</svg>\n")


(def mail-question mail-question-mark)


(def
 layout-template
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='7' width='18'/>\n<rect rx='1' y='14' x='3' height='7' width='9'/>\n<rect rx='1' y='14' x='16' height='7' width='5'/>\n</svg>\n")


(def
 panel-right-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M15 3v18'/>\n<path d='m10 15-3-3 3-3'/>\n</svg>\n")


(def
 brackets
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3'/>\n<path d='M8 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3'/>\n</svg>\n")


(def
 star-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8.34 8.34 2 9.27l5 4.87L5.82 21 12 17.77 18.18 21l-.59-3.43'/>\n<path d='M18.42 12.76 22 9.27l-6.91-1L12 2l-1.44 2.91'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 shrink
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 15 6 6m-6-6v4.8m0-4.8h4.8'/>\n<path d='M9 19.8V15m0 0H4.2M9 15l-6 6'/>\n<path d='M15 4.2V9m0 0h4.8M15 9l6-6'/>\n<path d='M9 4.2V9m0 0H4.2M9 9 3 3'/>\n</svg>\n")


(def
 shrimp
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 12h.01'/>\n<path d='M13 22c.5-.5 1.12-1 2.5-1-1.38 0-2-.5-2.5-1'/>\n<path d='M14 2a3.28 3.28 0 0 1-3.227 1.798l-6.17-.561A2.387 2.387 0 1 0 4.387 8H15.5a1 1 0 0 1 0 13 1 1 0 0 0 0-5H12a7 7 0 0 1-7-7V8'/>\n<path d='M14 8a8.5 8.5 0 0 1 0 8'/>\n<path d='M16 16c2 0 4.5-4 4-6'/>\n</svg>\n")


(def
 church
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9h4'/>\n<path d='M12 7v5'/>\n<path d='M14 22v-4a2 2 0 0 0-4 0v4'/>\n<path d='M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22'/>\n<path d='m18 7 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.618a1 1 0 0 1 .553-.894L6 7'/>\n</svg>\n")


(def
 circle-percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m15 9-6 6'/>\n<path d='M9 9h.01'/>\n<path d='M15 15h.01'/>\n</svg>\n")


(def percent-circle circle-percent)


(def
 crop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 2v14a2 2 0 0 0 2 2h14'/>\n<path d='M18 22V8a2 2 0 0 0-2-2H2'/>\n</svg>\n")


(def
 flask-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v6.292a7 7 0 1 0 4 0V2'/>\n<path d='M5 15h14'/>\n<path d='M8.5 2h7'/>\n</svg>\n")


(def
 brick-wall-fire
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3v2.107'/>\n<path d='M17 9c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 22 17a5 5 0 0 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C13 11.5 16 9 17 9'/>\n<path d='M21 8.274V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.938'/>\n<path d='M3 15h5.253'/>\n<path d='M3 9h8.228'/>\n<path d='M8 15v6'/>\n<path d='M8 3v6'/>\n</svg>\n")


(def
 cookie
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5'/>\n<path d='M8.5 8.5v.01'/>\n<path d='M16 15.5v.01'/>\n<path d='M12 12v.01'/>\n<path d='M11 17v.01'/>\n<path d='M7 14v.01'/>\n</svg>\n")


(def
 chart-column-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<rect rx='1' height='12' width='4' y='5' x='15'/>\n<rect rx='1' height='9' width='4' y='8' x='7'/>\n</svg>\n")


(def bar-chart-big chart-column-big)


(def
 redo-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 14 5-5-5-5'/>\n<path d='M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13'/>\n</svg>\n")


(def
 circle-slash-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 2 2 22'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def circle-slashed circle-slash-2)


(def
 calendar-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 14h1v4'/>\n<path d='M16 2v4'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n<rect rx='2' height='18' width='18' y='4' x='3'/>\n</svg>\n")


(def
 tag
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z'/>\n<circle fill='currentColor' r='.5' cy='7.5' cx='7.5'/>\n</svg>\n")


(def
 book-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='m9 9.5 2 2 4-4'/>\n</svg>\n")


(def
 octagon-pause
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 15V9'/>\n<path d='M14 15V9'/>\n<path d='M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z'/>\n</svg>\n")


(def pause-octagon octagon-pause)


(def
 cup-soda
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8'/>\n<path d='M5 8h14'/>\n<path d='M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0'/>\n<path d='m12 8 1-6h2'/>\n</svg>\n")


(def
 option
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3h6l6 18h6'/>\n<path d='M14 3h7'/>\n</svg>\n")


(def
 sparkle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'/>\n</svg>\n")


(def
 briefcase
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'/>\n<rect rx='2' y='6' x='2' height='14' width='20'/>\n</svg>\n")


(def
 circle-chevron-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m16 10-4 4-4-4'/>\n</svg>\n")


(def chevron-down-circle circle-chevron-down)


(def
 decimals-arrow-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 18h10'/>\n<path d='m17 21 3-3-3-3'/>\n<path d='M3 11h.01'/>\n<rect rx='2.5' height='8' width='5' y='3' x='15'/>\n<rect rx='2.5' height='8' width='5' y='3' x='6'/>\n</svg>\n")


(def
 presentation
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 3h20'/>\n<path d='M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3'/>\n<path d='m7 21 5-5 5 5'/>\n</svg>\n")


(def
 square-sigma
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M16 8.9V7H8l4 5-4 5h8v-1.9'/>\n</svg>\n")


(def sigma-square square-sigma)


(def
 rotate-cw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/>\n<path d='M21 3v5h-5'/>\n</svg>\n")


(def
 file-audio
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0'/>\n</svg>\n")


(def
 ellipsis-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='12' cx='12'/>\n<circle r='1' cy='5' cx='12'/>\n<circle r='1' cy='19' cx='12'/>\n</svg>\n")


(def more-vertical ellipsis-vertical)


(def
 badge-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<line y2='16' y1='8' x2='12' x1='12'/>\n<line y2='12' y1='12' x2='16' x1='8'/>\n</svg>\n")


(def
 screen-share-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3'/>\n<path d='M8 21h8'/>\n<path d='M12 17v4'/>\n<path d='m22 3-5 5'/>\n<path d='m17 3 5 5'/>\n</svg>\n")


(def
 square-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n<path d='M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z'/>\n</svg>\n")


(def play-square square-play)


(def
 align-horizontal-distribute-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='4' height='14' width='6'/>\n<rect rx='2' y='7' x='14' height='10' width='6'/>\n<path d='M10 2v20'/>\n<path d='M20 2v20'/>\n</svg>\n")


(def
 file-clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3'/>\n<path d='M8 14v2.2l1.6 1'/>\n<circle r='6' cy='16' cx='8'/>\n</svg>\n")


(def
 calendar-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 2v4'/>\n<path d='M21 11.75V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.25'/>\n<path d='m22 22-1.875-1.875'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def
 image-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21'/>\n<path d='m14 19 3 3v-5.5'/>\n<path d='m17 22 3-3'/>\n<circle r='2' cy='9' cx='9'/>\n</svg>\n")


(def
 swatch-book
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z'/>\n<path d='M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7'/>\n<path d='M 7 17h.01'/>\n<path d='m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8'/>\n</svg>\n")


(def
 radius
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.34 17.52a10 10 0 1 0-2.82 2.82'/>\n<circle r='2' cy='19' cx='19'/>\n<path d='m13.41 13.41 4.18 4.18'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 folder-sync
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5'/>\n<path d='M12 10v4h4'/>\n<path d='m12 14 1.535-1.605a5 5 0 0 1 8 1.5'/>\n<path d='M22 22v-4h-4'/>\n<path d='m22 18-1.535 1.605a5 5 0 0 1-8-1.5'/>\n</svg>\n")


(def
 panels-top-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n<path d='M9 21V9'/>\n</svg>\n")


(def layout panels-top-left)


(def
 headset
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z'/>\n<path d='M21 16v2a4 4 0 0 1-4 4h-5'/>\n</svg>\n")


(def
 circle-equal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 10h10'/>\n<path d='M7 14h10'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 dessert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.162 3.167A10 10 0 0 0 2 13a2 2 0 0 0 4 0v-1a2 2 0 0 1 4 0v4a2 2 0 0 0 4 0v-4a2 2 0 0 1 4 0v1a2 2 0 0 0 4-.006 10 10 0 0 0-8.161-9.826'/>\n<path d='M20.804 14.869a9 9 0 0 1-17.608 0'/>\n<circle r='2' cy='4' cx='12'/>\n</svg>\n")


(def
 carrot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46'/>\n<path d='M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z'/>\n<path d='M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z'/>\n</svg>\n")


(def
 receipt-euro
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M8 12h5'/>\n<path d='M16 9.5a4 4 0 1 0 0 5.2'/>\n</svg>\n")


(def
 map
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z'/>\n<path d='M15 5.764v15'/>\n<path d='M9 3.236v15'/>\n</svg>\n")


(def
 check-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 6 7 17l-5-5'/>\n<path d='m22 10-7.5 7.5L13 16'/>\n</svg>\n")


(def
 inbox
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polyline points='22 12 16 12 14 15 10 15 8 12 2 12'/>\n<path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/>\n</svg>\n")


(def
 clock-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l3.644 1.822'/>\n<path d='M16 19h6'/>\n<path d='M19 16v6'/>\n<path d='M21.92 13.267a10 10 0 1 0-8.653 8.653'/>\n</svg>\n")


(def
 circle-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<line y2='12' y1='8' x2='12' x1='12'/>\n<line y2='16' y1='16' x2='12.01' x1='12'/>\n</svg>\n")


(def alert-circle circle-alert)


(def
 tv-minimal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 21h10'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n</svg>\n")


(def tv-2 tv-minimal)


(def
 align-justify
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12h18'/>\n<path d='M3 18h18'/>\n<path d='M3 6h18'/>\n</svg>\n")


(def
 power
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v10'/>\n<path d='M18.4 6.6a9 9 0 1 1-12.77.04'/>\n</svg>\n")


(def
 a-large-small
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16'/>\n<path d='M15.697 14h5.606'/>\n<path d='m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'/>\n<path d='M3.304 13h6.392'/>\n</svg>\n")


(def
 tent-tree
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='4' cx='4'/>\n<path d='m14 5 3-3 3 3'/>\n<path d='m14 10 3-3 3 3'/>\n<path d='M17 14V2'/>\n<path d='M17 14H7l-5 8h20Z'/>\n<path d='M8 14v8'/>\n<path d='m9 14 5 8'/>\n</svg>\n")


(def
 database
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<ellipse ry='3' rx='9' cy='5' cx='12'/>\n<path d='M3 5V19A9 3 0 0 0 21 19V5'/>\n<path d='M3 12A9 3 0 0 0 21 12'/>\n</svg>\n")


(def
 tickets-plane
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12'/>\n<path d='m12 13.5 3.75.5'/>\n<path d='m4.5 8 10.58-5.06a1 1 0 0 1 1.342.488L18.5 8'/>\n<path d='M6 10V8'/>\n<path d='M6 14v1'/>\n<path d='M6 19v2'/>\n<rect rx='2' height='13' width='20' y='8' x='2'/>\n</svg>\n")


(def
 captions
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='5' x='3' height='14' width='18'/>\n<path d='M7 15h4M15 15h2M7 11h2M13 11h4'/>\n</svg>\n")


(def subtitles captions)


(def
 martini
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 22h8'/>\n<path d='M12 11v11'/>\n<path d='m19 3-7 8-7-8Z'/>\n</svg>\n")


(def
 arrow-up-to-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 3h14'/>\n<path d='m18 13-6-6-6 6'/>\n<path d='M12 7v14'/>\n</svg>\n")


(def
 monitor-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13V7'/>\n<path d='m15 10-3 3-3-3'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n</svg>\n")


(def
 badge-indian-rupee
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M8 8h8'/>\n<path d='M8 12h8'/>\n<path d='m13 17-5-1h1a4 4 0 0 0 0-8'/>\n</svg>\n")


(def
 camera-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='22' y1='2' x2='22' x1='2'/>\n<path d='M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16'/>\n<path d='M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5'/>\n<path d='M14.121 15.121A3 3 0 1 1 9.88 10.88'/>\n</svg>\n")


(def
 fuel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='22' y1='22' x2='15' x1='3'/>\n<line y2='9' y1='9' x2='14' x1='4'/>\n<path d='M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18'/>\n<path d='M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5'/>\n</svg>\n")


(def
 satellite-dish
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 10a7.31 7.31 0 0 0 10 10Z'/>\n<path d='m9 15 3-3'/>\n<path d='M17 13a6 6 0 0 0-6-6'/>\n<path d='M21 13A10 10 0 0 0 11 3'/>\n</svg>\n")


(def
 bike
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3.5' cy='17.5' cx='18.5'/>\n<circle r='3.5' cy='17.5' cx='5.5'/>\n<circle r='1' cy='5' cx='15'/>\n<path d='M12 17.5V14l-3-3 4-3 2 3h2'/>\n</svg>\n")


(def
 decimals-arrow-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13 21-3-3 3-3'/>\n<path d='M20 18H10'/>\n<path d='M3 11h.01'/>\n<rect rx='2.5' height='8' width='5' y='3' x='6'/>\n</svg>\n")


(def
 chart-no-axes-column
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='10' y1='20' x2='18' x1='18'/>\n<line y2='4' y1='20' x2='12' x1='12'/>\n<line y2='14' y1='20' x2='6' x1='6'/>\n</svg>\n")


(def bar-chart-2 chart-no-axes-column)


(def
 swords
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/>\n<line y2='13' y1='19' x2='19' x1='13'/>\n<line y2='20' y1='16' x2='20' x1='16'/>\n<line y2='19' y1='21' x2='21' x1='19'/>\n<polyline points='14.5 6.5 18 3 21 3 21 6 17.5 9.5'/>\n<line y2='18' y1='14' x2='9' x1='5'/>\n<line y2='20' y1='17' x2='4' x1='7'/>\n<line y2='21' y1='19' x2='5' x1='3'/>\n</svg>\n")


(def
 message-square-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 19H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 1.184-1.826'/>\n<path d='m2 2 20 20'/>\n<path d='M8.656 3H20a2 2 0 0 1 2 2v11.344'/>\n</svg>\n")


(def
 scan-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<path d='M7 8h8'/>\n<path d='M7 12h10'/>\n<path d='M7 16h6'/>\n</svg>\n")


(def
 arrow-down-z-a
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 4v16'/>\n<path d='M15 4h5l-5 6h5'/>\n<path d='M15 20v-3.5a2.5 2.5 0 0 1 5 0V20'/>\n<path d='M20 18h-5'/>\n</svg>\n")


(def arrow-down-za arrow-down-z-a)


(def
 rat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 22H4a2 2 0 0 1 0-4h12'/>\n<path d='M13.236 18a3 3 0 0 0-2.2-5'/>\n<path d='M16 9h.01'/>\n<path d='M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3'/>\n<path d='M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18'/>\n</svg>\n")


(def
 tornado
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 4H3'/>\n<path d='M18 8H6'/>\n<path d='M19 12H9'/>\n<path d='M16 16h-6'/>\n<path d='M11 20H9'/>\n</svg>\n")


(def
 toggle-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='9'/>\n<rect rx='7' y='5' x='2' height='14' width='20'/>\n</svg>\n")


(def
 file
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n</svg>\n")


(def
 puzzle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z'/>\n</svg>\n")


(def
 align-vertical-distribute-center
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17h-3'/>\n<path d='M22 7h-5'/>\n<path d='M5 17H2'/>\n<path d='M7 7H2'/>\n<rect rx='2' height='6' width='14' y='14' x='5'/>\n<rect rx='2' height='6' width='10' y='4' x='7'/>\n</svg>\n")


(def
 receipt-turkish-lira
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 6.5v11a5.5 5.5 0 0 0 5.5-5.5'/>\n<path d='m14 8-6 3'/>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z'/>\n</svg>\n")


(def
 signal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h.01'/>\n<path d='M7 20v-4'/>\n<path d='M12 20v-8'/>\n<path d='M17 20V8'/>\n<path d='M22 4v16'/>\n</svg>\n")


(def
 egg-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 20 20'/>\n<path d='M20 14.347V14c0-6-4-12-8-12-1.078 0-2.157.436-3.157 1.19'/>\n<path d='M6.206 6.21C4.871 8.4 4 11.2 4 14a8 8 0 0 0 14.568 4.568'/>\n</svg>\n")


(def
 arrow-up-1-0
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<path d='M17 10V4h-2'/>\n<path d='M15 10h4'/>\n<rect ry='2' height='6' width='4' y='14' x='15'/>\n</svg>\n")


(def arrow-up-10 arrow-up-1-0)


(def
 file-audio-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<circle r='1' cy='17' cx='3'/>\n<path d='M2 17v-3a4 4 0 0 1 8 0v3'/>\n<circle r='1' cy='17' cx='9'/>\n</svg>\n")


(def
 baseline
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 20h16'/>\n<path d='m6 16 6-12 6 12'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def
 vibrate-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 8 2 2-2 2 2 2-2 2'/>\n<path d='m22 8-2 2 2 2-2 2 2 2'/>\n<path d='M8 8v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2'/>\n<path d='M16 10.34V6c0-.55-.45-1-1-1h-4.34'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 glass-water
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z'/>\n<path d='M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0'/>\n</svg>\n")


(def
 brain
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18V5'/>\n<path d='M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4'/>\n<path d='M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5'/>\n<path d='M17.997 5.125a4 4 0 0 1 2.526 5.77'/>\n<path d='M18 18a4 4 0 0 0 2-7.464'/>\n<path d='M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517'/>\n<path d='M6 18a4 4 0 0 1-2-7.464'/>\n<path d='M6.003 5.125a4 4 0 0 0-2.526 5.77'/>\n</svg>\n")


(def
 files
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 21 8v7a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'/>\n<path d='M15 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1'/>\n</svg>\n")


(def
 torus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<ellipse ry='2' rx='3' cy='11' cx='12'/>\n<ellipse ry='8.5' rx='10' cy='12.5' cx='12'/>\n</svg>\n")


(def
 scan-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<circle r='3' cy='12' cx='12'/>\n<path d='m16 16-1.9-1.9'/>\n</svg>\n")


(def
 square-dashed-bottom-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9.5 8 12l2 2.5'/>\n<path d='M14 21h1'/>\n<path d='m14 9.5 2 2.5-2 2.5'/>\n<path d='M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2'/>\n<path d='M9 21h1'/>\n</svg>\n")


(def
 message-circle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n</svg>\n")


(def
 message-square-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.7 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4.7'/>\n<circle r='3' cy='6' cx='19'/>\n</svg>\n")


(def
 receipt-japanese-yen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='m12 10 3-3'/>\n<path d='m9 7 3 3v7.5'/>\n<path d='M9 11h6'/>\n<path d='M9 15h6'/>\n</svg>\n")


(def
 voicemail
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='12' cx='6'/>\n<circle r='4' cy='12' cx='18'/>\n<line y2='16' y1='16' x2='18' x1='6'/>\n</svg>\n")


(def
 octagon-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def
 messages-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/>\n<path d='M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1'/>\n</svg>\n")


(def
 ship-wheel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='12' cx='12'/>\n<path d='M12 2v7.5'/>\n<path d='m19 5-5.23 5.23'/>\n<path d='M22 12h-7.5'/>\n<path d='m19 19-5.23-5.23'/>\n<path d='M12 14.5V22'/>\n<path d='M10.23 13.77 5 19'/>\n<path d='M9.5 12H2'/>\n<path d='M10.23 10.23 5 5'/>\n<circle r='2.5' cy='12' cx='12'/>\n</svg>\n")


(def
 message-square-quote
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M14 13a2 2 0 0 0 2-2V9h-2'/>\n<path d='M8 13a2 2 0 0 0 2-2V9H8'/>\n</svg>\n")


(def
 contrast
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M12 18a6 6 0 0 0 0-12v12z'/>\n</svg>\n")


(def
 cuboid
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.05L2.95 8.41a2 2 0 0 0-.95 1.7v5.82a2 2 0 0 0 .88 1.66l6.05 4.07a2 2 0 0 0 2.17.05l9.95-6.12a2 2 0 0 0 .95-1.7V8.06a2 2 0 0 0-.88-1.66Z'/>\n<path d='M10 22v-8L2.25 9.15'/>\n<path d='m10 14 11.77-6.87'/>\n</svg>\n")


(def
 alarm-clock-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='13' cx='12'/>\n<path d='M5 3 2 6'/>\n<path d='m22 6-3-3'/>\n<path d='M6.38 18.7 4 21'/>\n<path d='M17.64 18.67 20 21'/>\n<path d='M12 10v6'/>\n<path d='M9 13h6'/>\n</svg>\n")


(def alarm-plus alarm-clock-plus)


(def
 monitor-pause
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 13V7'/>\n<path d='M14 13V7'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n</svg>\n")


(def
 archive-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='2' height='5' width='20'/>\n<path d='M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8'/>\n<path d='m9.5 17 5-5'/>\n<path d='m9.5 12 5 5'/>\n</svg>\n")


(def
 terminal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 19h8'/>\n<path d='m4 17 6-6-6-6'/>\n</svg>\n")


(def
 move-diagonal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 19H5v-6'/>\n<path d='M13 5h6v6'/>\n<path d='M19 5 5 19'/>\n</svg>\n")


(def
 droplet-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.715 13.186C18.29 11.858 17.384 10.607 16 9.5c-2-1.6-3.5-4-4-6.5a10.7 10.7 0 0 1-.884 2.586'/>\n<path d='m2 2 20 20'/>\n<path d='M8.795 8.797A11 11 0 0 1 8 9.5C6 11.1 5 13 5 15a7 7 0 0 0 13.222 3.208'/>\n</svg>\n")


(def
 file-scan
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M16 14a2 2 0 0 0-2 2'/>\n<path d='M20 14a2 2 0 0 1 2 2'/>\n<path d='M20 22a2 2 0 0 0 2-2'/>\n<path d='M16 22a2 2 0 0 1-2-2'/>\n</svg>\n")


(def
 arrow-up-wide-narrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<path d='M11 12h10'/>\n<path d='M11 16h7'/>\n<path d='M11 20h4'/>\n</svg>\n")


(def
 banknote-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5'/>\n<path d='m16 19 3 3 3-3'/>\n<path d='M18 12h.01'/>\n<path d='M19 16v6'/>\n<path d='M6 12h.01'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 move
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v20'/>\n<path d='m15 19-3 3-3-3'/>\n<path d='m19 9 3 3-3 3'/>\n<path d='M2 12h20'/>\n<path d='m5 9-3 3 3 3'/>\n<path d='m9 5 3-3 3 3'/>\n</svg>\n")


(def
 maximize
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3H5a2 2 0 0 0-2 2v3'/>\n<path d='M21 8V5a2 2 0 0 0-2-2h-3'/>\n<path d='M3 16v3a2 2 0 0 0 2 2h3'/>\n<path d='M16 21h3a2 2 0 0 0 2-2v-3'/>\n</svg>\n")


(def
 between-vertical-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='8' x='3' height='13' width='7'/>\n<path d='m15 2-3 3-3-3'/>\n<rect rx='1' y='8' x='14' height='13' width='7'/>\n</svg>\n")


(def
 laptop-minimal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='4' x='3' height='12' width='18'/>\n<line y2='20' y1='20' x2='22' x1='2'/>\n</svg>\n")


(def laptop-2 laptop-minimal)


(def
 radar
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.07 4.93A10 10 0 0 0 6.99 3.34'/>\n<path d='M4 6h.01'/>\n<path d='M2.29 9.62A10 10 0 1 0 21.31 8.35'/>\n<path d='M16.24 7.76A6 6 0 1 0 8.23 16.67'/>\n<path d='M12 18h.01'/>\n<path d='M17.99 11.66A6 6 0 0 1 15.77 16.67'/>\n<circle r='2' cy='12' cx='12'/>\n<path d='m13.41 10.59 5.66-5.66'/>\n</svg>\n")


(def
 logs
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 12h8'/>\n<path d='M13 18h8'/>\n<path d='M13 6h8'/>\n<path d='M3 12h1'/>\n<path d='M3 18h1'/>\n<path d='M3 6h1'/>\n<path d='M8 12h1'/>\n<path d='M8 18h1'/>\n<path d='M8 6h1'/>\n</svg>\n")


(def
 sparkles
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'/>\n<path d='M20 2v4'/>\n<path d='M22 4h-4'/>\n<circle r='2' cy='20' cx='4'/>\n</svg>\n")


(def stars sparkles)


(def
 lock-keyhole
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='16' cx='12'/>\n<rect rx='2' height='12' width='18' y='10' x='3'/>\n<path d='M7 10V7a5 5 0 0 1 10 0v3'/>\n</svg>\n")


(def
 octagon-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 9-6 6'/>\n<path d='M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z'/>\n<path d='m9 9 6 6'/>\n</svg>\n")


(def x-octagon octagon-x)


(def
 scan-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<path d='M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 4.172 4.306l-3.447 3.62a1 1 0 0 1-1.449 0z'/>\n</svg>\n")


(def
 folder-root
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'/>\n<circle r='2' cy='13' cx='12'/>\n<path d='M12 15v5'/>\n</svg>\n")


(def
 chevron-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 15-6-6-6 6'/>\n</svg>\n")


(def
 square-percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m15 9-6 6'/>\n<path d='M9 9h.01'/>\n<path d='M15 15h.01'/>\n</svg>\n")


(def percent-square square-percent)


(def
 haze
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m5.2 6.2 1.4 1.4'/>\n<path d='M2 13h2'/>\n<path d='M20 13h2'/>\n<path d='m17.4 7.6 1.4-1.4'/>\n<path d='M22 17H2'/>\n<path d='M22 21H2'/>\n<path d='M16 13a4 4 0 0 0-8 0'/>\n<path d='M12 5V2.5'/>\n</svg>\n")


(def
 folder-output
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 7.5V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-1.5'/>\n<path d='M2 13h10'/>\n<path d='m5 10-3 3 3 3'/>\n</svg>\n")


(def
 folder-symlink
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7'/>\n<path d='m8 16 3-3-3-3'/>\n</svg>\n")


(def
 file-badge-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13.69 12.479 1.29 4.88a.5.5 0 0 1-.697.591l-1.844-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88'/>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/>\n<circle r='3' cy='10' cx='12'/>\n</svg>\n")


(def
 vibrate
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 8 2 2-2 2 2 2-2 2'/>\n<path d='m22 8-2 2 2 2-2 2 2 2'/>\n<rect rx='1' y='5' x='8' height='14' width='8'/>\n</svg>\n")


(def
 laugh
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z'/>\n<line y2='9' y1='9' x2='9.01' x1='9'/>\n<line y2='9' y1='9' x2='15.01' x1='15'/>\n</svg>\n")


(def
 clock-fading
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2a10 10 0 0 1 7.38 16.75'/>\n<path d='M12 6v6l4 2'/>\n<path d='M2.5 8.875a10 10 0 0 0-.5 3'/>\n<path d='M2.83 16a10 10 0 0 0 2.43 3.4'/>\n<path d='M4.636 5.235a10 10 0 0 1 .891-.857'/>\n<path d='M8.644 21.42a10 10 0 0 0 7.631-.38'/>\n</svg>\n")


(def
 scan-eye
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<circle r='1' cy='12' cx='12'/>\n<path d='M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0'/>\n</svg>\n")


(def
 spade
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18v4'/>\n<path d='M2 14.499a5.5 5.5 0 0 0 9.591 3.675.6.6 0 0 1 .818.001A5.5 5.5 0 0 0 22 14.5c0-2.29-1.5-4-3-5.5l-5.492-5.312a2 2 0 0 0-3-.02L5 8.999c-1.5 1.5-3 3.2-3 5.5'/>\n</svg>\n")


(def
 cloud-rain-wind
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='m9.2 22 3-7'/>\n<path d='m9 13-3 7'/>\n<path d='m17 13-3 7'/>\n</svg>\n")


(def
 sliders-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='14' y1='21' x2='4' x1='4'/>\n<line y2='3' y1='10' x2='4' x1='4'/>\n<line y2='12' y1='21' x2='12' x1='12'/>\n<line y2='3' y1='8' x2='12' x1='12'/>\n<line y2='16' y1='21' x2='20' x1='20'/>\n<line y2='3' y1='12' x2='20' x1='20'/>\n<line y2='14' y1='14' x2='6' x1='2'/>\n<line y2='8' y1='8' x2='14' x1='10'/>\n<line y2='16' y1='16' x2='22' x1='18'/>\n</svg>\n")


(def sliders sliders-vertical)


(def
 spline-pointer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z'/>\n<path d='M5 17A12 12 0 0 1 17 5'/>\n<circle r='2' cy='5' cx='19'/>\n<circle r='2' cy='19' cx='5'/>\n</svg>\n")


(def
 undo-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 14 4 9l5-5'/>\n<path d='M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11'/>\n</svg>\n")


(def
 step-back
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z'/>\n<path d='M21 20V4'/>\n</svg>\n")


(def
 flask-conical-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v2.343'/>\n<path d='M14 2v6.343'/>\n<path d='m2 2 20 20'/>\n<path d='M20 20a2 2 0 0 1-2 2H6a2 2 0 0 1-1.755-2.96l5.227-9.563'/>\n<path d='M6.453 15H15'/>\n<path d='M8.5 2h7'/>\n</svg>\n")


(def
 arrow-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 7 7 17'/>\n<path d='M17 17H7V7'/>\n</svg>\n")


(def
 list-filter-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 18h4'/>\n<path d='M11 6H3'/>\n<path d='M15 6h6'/>\n<path d='M18 9V3'/>\n<path d='M7 12h8'/>\n</svg>\n")


(def
 file-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M10 9H8'/>\n<path d='M16 13H8'/>\n<path d='M16 17H8'/>\n</svg>\n")


(def
 file-stack
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1'/>\n<path d='M16 16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1'/>\n<path d='M21 6a2 2 0 0 0-.586-1.414l-2-2A2 2 0 0 0 17 2h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1z'/>\n</svg>\n")


(def
 folder-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2'/>\n</svg>\n")


(def
 package-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 16h6'/>\n<path d='M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14'/>\n<path d='m7.5 4.27 9 5.15'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<line y2='12' y1='22' x2='12' x1='12'/>\n</svg>\n")


(def
 droplet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'/>\n</svg>\n")


(def
 whole-word
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='7'/>\n<path d='M10 9v6'/>\n<circle r='3' cy='12' cx='17'/>\n<path d='M14 7v8'/>\n<path d='M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1'/>\n</svg>\n")


(def
 paint-roller
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='2' height='6' width='16'/>\n<path d='M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2'/>\n<rect rx='1' y='16' x='8' height='6' width='4'/>\n</svg>\n")


(def
 zap-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317'/>\n<path d='M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773'/>\n<path d='M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 clipboard-clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 14v2.2l1.6 1'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v.832'/>\n<path d='M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2'/>\n<circle r='6' cy='16' cx='16'/>\n<rect rx='1' height='4' width='8' y='2' x='8'/>\n</svg>\n")


(def
 square-kanban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 7v7'/>\n<path d='M12 7v4'/>\n<path d='M16 7v9'/>\n</svg>\n")


(def kanban-square square-kanban)


(def
 keyboard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 8h.01'/>\n<path d='M12 12h.01'/>\n<path d='M14 8h.01'/>\n<path d='M16 12h.01'/>\n<path d='M18 8h.01'/>\n<path d='M6 8h.01'/>\n<path d='M7 16h10'/>\n<path d='M8 12h.01'/>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n</svg>\n")


(def
 x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 6 6 18'/>\n<path d='m6 6 12 12'/>\n</svg>\n")


(def
 chevrons-right-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m20 17-5-5 5-5'/>\n<path d='m4 17 5-5-5-5'/>\n</svg>\n")


(def
 joystick
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z'/>\n<path d='M6 15v-2'/>\n<path d='M12 15V9'/>\n<circle r='3' cy='6' cx='12'/>\n</svg>\n")


(def
 cigarette
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14'/>\n<path d='M18 8c0-2.5-2-2.5-2-5'/>\n<path d='M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1'/>\n<path d='M22 8c0-2.5-2-2.5-2-5'/>\n<path d='M7 12v4'/>\n</svg>\n")


(def
 bath
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 4 8 6'/>\n<path d='M17 19v2'/>\n<path d='M2 12h20'/>\n<path d='M7 19v2'/>\n<path d='M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5'/>\n</svg>\n")


(def
 qr-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='5' width='5'/>\n<rect rx='1' y='3' x='16' height='5' width='5'/>\n<rect rx='1' y='16' x='3' height='5' width='5'/>\n<path d='M21 16h-3a2 2 0 0 0-2 2v3'/>\n<path d='M21 21v.01'/>\n<path d='M12 7v3a2 2 0 0 1-2 2H7'/>\n<path d='M3 12h.01'/>\n<path d='M12 3h.01'/>\n<path d='M12 16v.01'/>\n<path d='M16 12h1'/>\n<path d='M21 12v.01'/>\n<path d='M12 21v-1'/>\n</svg>\n")


(def
 dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='12.1' cx='12.1'/>\n</svg>\n")


(def
 ice-cream-cone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11'/>\n<path d='M17 7A5 5 0 0 0 7 7'/>\n<path d='M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4'/>\n</svg>\n")


(def ice-cream ice-cream-cone)


(def
 languages
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m5 8 6 6'/>\n<path d='m4 14 6-6 2-3'/>\n<path d='M2 5h12'/>\n<path d='M7 2h1'/>\n<path d='m22 22-5-10-5 10'/>\n<path d='M14 18h6'/>\n</svg>\n")


(def
 ampersands
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5'/>\n<path d='M22 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 2.5-5 2.5-5 6 0 1.7 1.3 3 3 3 2.8 0 5-2.2 5-5'/>\n</svg>\n")


(def
 banknote-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5'/>\n<path d='m17 17 5 5'/>\n<path d='M18 12h.01'/>\n<path d='m22 17-5 5'/>\n<path d='M6 12h.01'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 amphora
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v5.632c0 .424-.272.795-.653.982A6 6 0 0 0 6 14c.006 4 3 7 5 8'/>\n<path d='M10 5H8a2 2 0 0 0 0 4h.68'/>\n<path d='M14 2v5.632c0 .424.272.795.652.982A6 6 0 0 1 18 14c0 4-3 7-5 8'/>\n<path d='M14 5h2a2 2 0 0 1 0 4h-.68'/>\n<path d='M18 22H6'/>\n<path d='M9 2h6'/>\n</svg>\n")


(def
 arrow-left-from-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 6-6 6 6 6'/>\n<path d='M3 12h14'/>\n<path d='M21 19V5'/>\n</svg>\n")


(def
 bell-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M15 8h6'/>\n<path d='M16.243 3.757A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673A9.4 9.4 0 0 1 18.667 12'/>\n</svg>\n")


(def
 file-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m2.305 15.53.923-.382'/>\n<path d='m3.228 12.852-.924-.383'/>\n<path d='M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5'/>\n<path d='m4.852 11.228-.383-.923'/>\n<path d='m4.852 16.772-.383.924'/>\n<path d='m7.148 11.228.383-.923'/>\n<path d='m7.53 17.696-.382-.924'/>\n<path d='m8.772 12.852.923-.383'/>\n<path d='m8.772 15.148.923.383'/>\n<circle r='3' cy='14' cx='6'/>\n</svg>\n")


(def file-cog-2 file-cog)


(def
 wheat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 22 16 8'/>\n<path d='M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z'/>\n<path d='M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z'/>\n<path d='M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z'/>\n<path d='M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z'/>\n<path d='M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z'/>\n<path d='M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z'/>\n<path d='M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z'/>\n</svg>\n")


(def
 eye-closed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 18-.722-3.25'/>\n<path d='M2 8a10.645 10.645 0 0 0 20 0'/>\n<path d='m20 15-1.726-2.05'/>\n<path d='m4 15 1.726-2.05'/>\n<path d='m9 18 .722-3.25'/>\n</svg>\n")


(def
 cable-car
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 3h.01'/>\n<path d='M14 2h.01'/>\n<path d='m2 9 20-5'/>\n<path d='M12 12V6.5'/>\n<rect rx='3' y='12' x='4' height='10' width='16'/>\n<path d='M9 12v5'/>\n<path d='M15 12v5'/>\n<path d='M4 17h16'/>\n</svg>\n")


(def
 arrow-up-narrow-wide
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<path d='M11 12h4'/>\n<path d='M11 16h7'/>\n<path d='M11 20h10'/>\n</svg>\n")


(def sort-asc arrow-up-narrow-wide)


(def
 lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='11' x='3' height='11' width='18'/>\n<path d='M7 11V7a5 5 0 0 1 10 0v4'/>\n</svg>\n")


(def
 dice-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M15 9h.01'/>\n<path d='M9 15h.01'/>\n</svg>\n")


(def
 log-in
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 17 5-5-5-5'/>\n<path d='M15 12H3'/>\n<path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'/>\n</svg>\n")


(def
 squircle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9'/>\n</svg>\n")


(def
 cloud-upload
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13v8'/>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='m8 17 4-4 4 4'/>\n</svg>\n")


(def upload-cloud cloud-upload)


(def
 shield-ellipsis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M8 12h.01'/>\n<path d='M12 12h.01'/>\n<path d='M16 12h.01'/>\n</svg>\n")


(def
 ban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.929 4.929 19.07 19.071'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 smartphone-nfc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='6' x='2' height='12' width='7'/>\n<path d='M13 8.32a7.43 7.43 0 0 1 0 7.36'/>\n<path d='M16.46 6.21a11.76 11.76 0 0 1 0 11.58'/>\n<path d='M19.91 4.1a15.91 15.91 0 0 1 .01 15.8'/>\n</svg>\n")


(def
 list-video
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12H3'/>\n<path d='M12 18H3'/>\n<path d='M16 6H3'/>\n<path d='M21.033 14.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .968-.56z'/>\n</svg>\n")


(def
 text-select
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 21h1'/>\n<path d='M14 3h1'/>\n<path d='M19 3a2 2 0 0 1 2 2'/>\n<path d='M21 14v1'/>\n<path d='M21 19a2 2 0 0 1-2 2'/>\n<path d='M21 9v1'/>\n<path d='M3 14v1'/>\n<path d='M3 9v1'/>\n<path d='M5 21a2 2 0 0 1-2-2'/>\n<path d='M5 3a2 2 0 0 0-2 2'/>\n<path d='M7 12h10'/>\n<path d='M7 16h6'/>\n<path d='M7 8h8'/>\n<path d='M9 21h1'/>\n<path d='M9 3h1'/>\n</svg>\n")


(def text-selection text-select)


(def
 shopping-bag
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 10a4 4 0 0 1-8 0'/>\n<path d='M3.103 6.034h17.794'/>\n<path d='M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z'/>\n</svg>\n")


(def
 divide
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='6' cx='12'/>\n<line y2='12' y1='12' x2='19' x1='5'/>\n<circle r='1' cy='18' cx='12'/>\n</svg>\n")


(def
 piggy-bank
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z'/>\n<path d='M16 10h.01'/>\n<path d='M2 8v1a2 2 0 0 0 2 2h1'/>\n</svg>\n")


(def
 battery-warning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 17h.01'/>\n<path d='M10 7v6'/>\n<path d='M14 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2'/>\n<path d='M22 14v-4'/>\n<path d='M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2'/>\n</svg>\n")


(def
 wallet-minimal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 14h.01'/>\n<path d='M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14'/>\n</svg>\n")


(def wallet-2 wallet-minimal)


(def
 circle-dollar-sign
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8'/>\n<path d='M12 18V6'/>\n</svg>\n")


(def
 milk-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2h8'/>\n<path d='M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3'/>\n<path d='M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 rotate-ccw-key
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.5 9.5 1 1'/>\n<path d='m15.5 8.5-4 4'/>\n<path d='M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8'/>\n<path d='M3 3v5h5'/>\n<circle r='2' cy='14' cx='10'/>\n</svg>\n")


(def
 square-parking
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 17V7h4a3 3 0 0 1 0 6H9'/>\n</svg>\n")


(def parking-square square-parking)


(def
 refresh-ccw-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/>\n<path d='M3 3v5h5'/>\n<path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16'/>\n<path d='M16 16h5v5'/>\n<circle r='1' cy='12' cx='12'/>\n</svg>\n")


(def
 tally-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 4v16'/>\n<path d='M9 4v16'/>\n</svg>\n")


(def
 shell
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44'/>\n</svg>\n")


(def
 banknote-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5'/>\n<path d='M18 12h.01'/>\n<path d='M19 22v-6'/>\n<path d='m22 19-3-3-3 3'/>\n<path d='M6 12h.01'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 repeat-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 9 3-3 3 3'/>\n<path d='M13 18H7a2 2 0 0 1-2-2V6'/>\n<path d='m22 15-3 3-3-3'/>\n<path d='M11 6h6a2 2 0 0 1 2 2v10'/>\n</svg>\n")


(def
 pilcrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 4v16'/>\n<path d='M17 4v16'/>\n<path d='M19 4H9.5a4.5 4.5 0 0 0 0 9H13'/>\n</svg>\n")


(def
 circle-dot-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.1 2.18a9.93 9.93 0 0 1 3.8 0'/>\n<path d='M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7'/>\n<path d='M21.82 10.1a9.93 9.93 0 0 1 0 3.8'/>\n<path d='M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69'/>\n<path d='M13.9 21.82a9.94 9.94 0 0 1-3.8 0'/>\n<path d='M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7'/>\n<path d='M2.18 13.9a9.93 9.93 0 0 1 0-3.8'/>\n<path d='M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69'/>\n<circle r='1' cy='12' cx='12'/>\n</svg>\n")


(def
 cloud-drizzle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='M8 19v1'/>\n<path d='M8 14v1'/>\n<path d='M16 19v1'/>\n<path d='M16 14v1'/>\n<path d='M12 21v1'/>\n<path d='M12 16v1'/>\n</svg>\n")


(def
 copy-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='15' y1='15' x2='18' x1='12'/>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 spline
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='5' cx='19'/>\n<circle r='2' cy='19' cx='5'/>\n<path d='M5 17A12 12 0 0 1 17 5'/>\n</svg>\n")


(def
 refresh-cw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'/>\n<path d='M21 3v5h-5'/>\n<path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'/>\n<path d='M8 16H3v5'/>\n</svg>\n")


(def
 pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>\n</svg>\n")


(def edit-2 pen)


(def
 user-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.5 15H7a4 4 0 0 0-4 4v2'/>\n<path d='M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n<circle r='4' cy='7' cx='10'/>\n</svg>\n")


(def
 rectangle-circle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 4v16H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z'/>\n<circle r='8' cy='12' cx='14'/>\n</svg>\n")


(def
 plane
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z'/>\n</svg>\n")


(def
 align-vertical-space-between
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='15' x='5' height='6' width='14'/>\n<rect rx='2' y='3' x='7' height='6' width='10'/>\n<path d='M2 21h20'/>\n<path d='M2 3h20'/>\n</svg>\n")


(def
 chevron-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 18 6-6-6-6'/>\n</svg>\n")


(def
 tally-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 4v16'/>\n<path d='M9 4v16'/>\n<path d='M14 4v16'/>\n</svg>\n")


(def
 clipboard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n</svg>\n")


(def
 equal-not
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='9' y1='9' x2='19' x1='5'/>\n<line y2='15' y1='15' x2='19' x1='5'/>\n<line y2='19' y1='5' x2='5' x1='19'/>\n</svg>\n")


(def
 package
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z'/>\n<path d='M12 22V12'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<path d='m7.5 4.27 9 5.15'/>\n</svg>\n")


(def
 shield-user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M6.376 18.91a6 6 0 0 1 11.249.003'/>\n<circle r='4' cy='11' cx='12'/>\n</svg>\n")


(def
 mars
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3h5v5'/>\n<path d='m21 3-6.75 6.75'/>\n<circle r='6' cy='14' cx='10'/>\n</svg>\n")


(def
 instagram
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='5' rx='5' y='2' x='2' height='20' width='20'/>\n<path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'/>\n<line y2='6.5' y1='6.5' x2='17.51' x1='17.5'/>\n</svg>\n")


(def
 mail-warning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='M20 14v4'/>\n<path d='M20 22v.01'/>\n</svg>\n")


(def
 euro
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 10h12'/>\n<path d='M4 14h9'/>\n<path d='M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2'/>\n</svg>\n")


(def
 link
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/>\n<path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/>\n</svg>\n")


(def
 square-chevron-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m14 16-4-4 4-4'/>\n</svg>\n")


(def chevron-left-square square-chevron-left)


(def
 globe-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13'/>\n<path d='M2 12h8.5'/>\n<path d='M20 6V4a2 2 0 1 0-4 0v2'/>\n<rect rx='1' y='6' x='14' height='5' width='8'/>\n</svg>\n")


(def
 dice-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M16 8h.01'/>\n<path d='M12 12h.01'/>\n<path d='M8 16h.01'/>\n</svg>\n")


(def
 hand-platter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3V2'/>\n<path d='m15.4 17.4 3.2-2.8a2 2 0 1 1 2.8 2.9l-3.6 3.3c-.7.8-1.7 1.2-2.8 1.2h-4c-1.1 0-2.1-.4-2.8-1.2l-1.302-1.464A1 1 0 0 0 6.151 19H5'/>\n<path d='M2 14h12a2 2 0 0 1 0 4h-2'/>\n<path d='M4 10h16'/>\n<path d='M5 10a7 7 0 0 1 14 0'/>\n<path d='M5 14v6a1 1 0 0 1-1 1H2'/>\n</svg>\n")


(def
 video-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196'/>\n<path d='M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 user-round-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21a8 8 0 0 1 13.292-6'/>\n<circle r='5' cy='8' cx='10'/>\n<path d='M19 16v6'/>\n<path d='M22 19h-6'/>\n</svg>\n")


(def user-plus-2 user-round-plus)


(def
 gpu
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21V3'/>\n<path d='M2 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2.26'/>\n<path d='M7 17v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3'/>\n<circle r='2' cy='11' cx='16'/>\n<circle r='2' cy='11' cx='8'/>\n</svg>\n")


(def
 key
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4'/>\n<path d='m21 2-9.6 9.6'/>\n<circle r='5.5' cy='15.5' cx='7.5'/>\n</svg>\n")


(def
 square-activity
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M17 12h-2l-2 5-2-10-2 5H7'/>\n</svg>\n")


(def activity-square square-activity)


(def
 shrub
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-5.172a2 2 0 0 0-.586-1.414L9.5 13.5'/>\n<path d='M14.5 14.5 12 17'/>\n<path d='M17 8.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8a5 5 0 0 1 10 0z'/>\n</svg>\n")


(def
 sailboat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v15'/>\n<path d='M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z'/>\n<path d='M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z'/>\n</svg>\n")


(def
 file-x-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m8 12.5-5 5'/>\n<path d='m3 12.5 5 5'/>\n</svg>\n")


(def
 square-slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<line y2='9' y1='15' x2='15' x1='9'/>\n</svg>\n")


(def slash-square square-slash)


(def
 brain-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10.852 14.772-.383.923'/>\n<path d='m10.852 9.228-.383-.923'/>\n<path d='m13.148 14.772.382.924'/>\n<path d='m13.531 8.305-.383.923'/>\n<path d='m14.772 10.852.923-.383'/>\n<path d='m14.772 13.148.923.383'/>\n<path d='M17.598 6.5A3 3 0 1 0 12 5a3 3 0 0 0-5.63-1.446 3 3 0 0 0-.368 1.571 4 4 0 0 0-2.525 5.771'/>\n<path d='M17.998 5.125a4 4 0 0 1 2.525 5.771'/>\n<path d='M19.505 10.294a4 4 0 0 1-1.5 7.706'/>\n<path d='M4.032 17.483A4 4 0 0 0 11.464 20c.18-.311.892-.311 1.072 0a4 4 0 0 0 7.432-2.516'/>\n<path d='M4.5 10.291A4 4 0 0 0 6 18'/>\n<path d='M6.002 5.125a3 3 0 0 0 .4 1.375'/>\n<path d='m9.228 10.852-.923-.383'/>\n<path d='m9.228 13.148-.923.383'/>\n<circle r='3' cy='12' cx='12'/>\n</svg>\n")


(def
 meh
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<line y2='15' y1='15' x2='16' x1='8'/>\n<line y2='9' y1='9' x2='9.01' x1='9'/>\n<line y2='9' y1='9' x2='15.01' x1='15'/>\n</svg>\n")


(def
 sliders-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='4' y1='4' x2='14' x1='21'/>\n<line y2='4' y1='4' x2='3' x1='10'/>\n<line y2='12' y1='12' x2='12' x1='21'/>\n<line y2='12' y1='12' x2='3' x1='8'/>\n<line y2='20' y1='20' x2='16' x1='21'/>\n<line y2='20' y1='20' x2='3' x1='12'/>\n<line y2='6' y1='2' x2='14' x1='14'/>\n<line y2='14' y1='10' x2='8' x1='8'/>\n<line y2='22' y1='18' x2='16' x1='16'/>\n</svg>\n")


(def
 door-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 20H2'/>\n<path d='M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z'/>\n<path d='M11 4H8a2 2 0 0 0-2 2v14'/>\n<path d='M14 12h.01'/>\n<path d='M22 20h-3'/>\n</svg>\n")


(def
 corner-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 10 5 5-5 5'/>\n<path d='M4 4v7a4 4 0 0 0 4 4h12'/>\n</svg>\n")


(def
 beaker
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.5 3h15'/>\n<path d='M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3'/>\n<path d='M6 14h12'/>\n</svg>\n")


(def
 list-todo
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' height='6' width='6' y='5' x='3'/>\n<path d='m3 17 2 2 4-4'/>\n<path d='M13 6h8'/>\n<path d='M13 12h8'/>\n<path d='M13 18h8'/>\n</svg>\n")


(def
 cloud-sun
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v2'/>\n<path d='m4.93 4.93 1.41 1.41'/>\n<path d='M20 12h2'/>\n<path d='m19.07 4.93-1.41 1.41'/>\n<path d='M15.947 12.65a4 4 0 0 0-5.925-4.128'/>\n<path d='M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z'/>\n</svg>\n")


(def
 arrow-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 12h14'/>\n<path d='m12 5 7 7-7 7'/>\n</svg>\n")


(def
 store
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5'/>\n<path d='M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244'/>\n<path d='M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05'/>\n</svg>\n")


(def
 antenna
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 12 7 2'/>\n<path d='m7 12 5-10'/>\n<path d='m12 12 5-10'/>\n<path d='m17 12 5-10'/>\n<path d='M4.5 7h15'/>\n<path d='M12 16v6'/>\n</svg>\n")


(def
 chevron-first
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 18-6-6 6-6'/>\n<path d='M7 6v12'/>\n</svg>\n")


(def
 wheat-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 22 10-10'/>\n<path d='m16 8-1.17 1.17'/>\n<path d='M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z'/>\n<path d='m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97'/>\n<path d='M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62'/>\n<path d='M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z'/>\n<path d='M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z'/>\n<path d='m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98'/>\n<path d='M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 aperture
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m14.31 8 5.74 9.94'/>\n<path d='M9.69 8h11.48'/>\n<path d='m7.38 12 5.74-9.94'/>\n<path d='M9.69 16 3.95 6.06'/>\n<path d='M14.31 16H2.83'/>\n<path d='m16.62 12-5.74 9.94'/>\n</svg>\n")


(def
 calendar-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 19h6'/>\n<path d='M16 2v4'/>\n<path d='M19 16v6'/>\n<path d='M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 brush
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 10 3 3'/>\n<path d='M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z'/>\n<path d='M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031'/>\n</svg>\n")


(def
 thermometer-snowflake
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 20-1.25-2.5L6 18'/>\n<path d='M10 4 8.75 6.5 6 6'/>\n<path d='M10.585 15H10'/>\n<path d='M2 12h6.5L10 9'/>\n<path d='M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z'/>\n<path d='m4 10 1.5 2L4 14'/>\n<path d='m7 21 3-6-1.5-3'/>\n<path d='m7 3 3 6h2'/>\n</svg>\n")


(def
 clover
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.17 7.83 2 22'/>\n<path d='M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12'/>\n<path d='m7.83 7.83 8.34 8.34'/>\n</svg>\n")


(def
 concierge-bell
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z'/>\n<path d='M20 16a8 8 0 1 0-16 0'/>\n<path d='M12 4v4'/>\n<path d='M10 4h4'/>\n</svg>\n")


(def
 log-out
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 17 5-5-5-5'/>\n<path d='M21 12H9'/>\n<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/>\n</svg>\n")


(def
 unfold-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12h6'/>\n<path d='M8 12H2'/>\n<path d='M12 2v2'/>\n<path d='M12 8v2'/>\n<path d='M12 14v2'/>\n<path d='M12 20v2'/>\n<path d='m19 15 3-3-3-3'/>\n<path d='m5 9-3 3 3 3'/>\n</svg>\n")


(def
 file-spreadsheet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 13h2'/>\n<path d='M14 13h2'/>\n<path d='M8 17h2'/>\n<path d='M14 17h2'/>\n</svg>\n")


(def
 square-radical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 12h2l2 5 2-10h4'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def
 circle-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def play-circle circle-play)


(def
 square-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m16 12-4-4-4 4'/>\n<path d='M12 16V8'/>\n</svg>\n")


(def arrow-up-square square-arrow-up)


(def
 file-code-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m5 12-3 3 3 3'/>\n<path d='m9 18 3-3-3-3'/>\n</svg>\n")


(def
 telescope
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44'/>\n<path d='m13.56 11.747 4.332-.924'/>\n<path d='m16 21-3.105-6.21'/>\n<path d='M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z'/>\n<path d='m6.158 8.633 1.114 4.456'/>\n<path d='m8 21 3.105-6.21'/>\n<circle r='2' cy='13' cx='12'/>\n</svg>\n")


(def
 ship
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10.189V14'/>\n<path d='M12 2v3'/>\n<path d='M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6'/>\n<path d='M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76'/>\n<path d='M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n</svg>\n")


(def
 ear-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46'/>\n<path d='M6 8.5c0-.75.13-1.47.36-2.14'/>\n<path d='M8.8 3.15A6.5 6.5 0 0 1 19 8.5c0 1.63-.44 2.81-1.09 3.76'/>\n<path d='M12.5 6A2.5 2.5 0 0 1 15 8.5M10 13a2 2 0 0 0 1.82-1.18'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 worm
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 12-1.5 3'/>\n<path d='M19.63 18.81 22 20'/>\n<path d='M6.47 8.23a1.68 1.68 0 0 1 2.44 1.93l-.64 2.08a6.76 6.76 0 0 0 10.16 7.67l.42-.27a1 1 0 1 0-2.73-4.21l-.42.27a1.76 1.76 0 0 1-2.63-1.99l.64-2.08A6.66 6.66 0 0 0 3.94 3.9l-.7.4a1 1 0 1 0 2.55 4.34z'/>\n</svg>\n")


(def
 wallpaper
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='9' cx='8'/>\n<path d='m9 17 6.1-6.1a2 2 0 0 1 2.81.01L22 15V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2'/>\n<path d='M8 21h8'/>\n<path d='M12 17v4'/>\n</svg>\n")


(def
 ambulance
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10H6'/>\n<path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'/>\n<path d='M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14'/>\n<path d='M8 8v4'/>\n<path d='M9 18h6'/>\n<circle r='2' cy='18' cx='17'/>\n<circle r='2' cy='18' cx='7'/>\n</svg>\n")


(def
 space
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1'/>\n</svg>\n")


(def
 file-input
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M2 15h10'/>\n<path d='m9 18 3-3-3-3'/>\n</svg>\n")


(def
 book-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17h1.5'/>\n<path d='M12 22h1.5'/>\n<path d='M12 2h1.5'/>\n<path d='M17.5 22H19a1 1 0 0 0 1-1'/>\n<path d='M17.5 2H19a1 1 0 0 1 1 1v1.5'/>\n<path d='M20 14v3h-2.5'/>\n<path d='M20 8.5V10'/>\n<path d='M4 10V8.5'/>\n<path d='M4 19.5V14'/>\n<path d='M4 4.5A2.5 2.5 0 0 1 6.5 2H8'/>\n<path d='M8 22H6.5a1 1 0 0 1 0-5H8'/>\n</svg>\n")


(def book-template book-dashed)


(def
 hand-grab
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4'/>\n<path d='M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/>\n<path d='M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5'/>\n<path d='M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/>\n<path d='M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0'/>\n</svg>\n")


(def grab hand-grab)


(def
 stretch-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='4' height='20' width='6'/>\n<rect rx='2' y='2' x='14' height='20' width='6'/>\n</svg>\n")


(def
 calendar-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n<path d='m9 16 2 2 4-4'/>\n</svg>\n")


(def
 diff
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v14'/>\n<path d='M5 10h14'/>\n<path d='M5 21h14'/>\n</svg>\n")


(def
 shower-head
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m4 4 2.5 2.5'/>\n<path d='M13.5 6.5a4.95 4.95 0 0 0-7 7'/>\n<path d='M15 5 5 15'/>\n<path d='M14 17v.01'/>\n<path d='M10 16v.01'/>\n<path d='M13 13v.01'/>\n<path d='M16 10v.01'/>\n<path d='M11 20v.01'/>\n<path d='M17 14v.01'/>\n<path d='M20 11v.01'/>\n</svg>\n")


(def
 square-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/>\n<path d='M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z'/>\n</svg>\n")


(def pen-box square-pen)


(def edit square-pen)


(def pen-square square-pen)


(def
 arrow-down-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<path d='m21 8-4-4-4 4'/>\n<path d='M17 4v16'/>\n</svg>\n")


(def
 git-pull-request
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='18' cx='18'/>\n<circle r='3' cy='6' cx='6'/>\n<path d='M13 6h3a2 2 0 0 1 2 2v7'/>\n<line y2='21' y1='9' x2='6' x1='6'/>\n</svg>\n")


(def
 minimize
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3v3a2 2 0 0 1-2 2H3'/>\n<path d='M21 8h-3a2 2 0 0 1-2-2V3'/>\n<path d='M3 16h3a2 2 0 0 1 2 2v3'/>\n<path d='M16 21v-3a2 2 0 0 1 2-2h3'/>\n</svg>\n")


(def
 group
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5c0-1.1.9-2 2-2h2'/>\n<path d='M17 3h2c1.1 0 2 .9 2 2v2'/>\n<path d='M21 17v2c0 1.1-.9 2-2 2h-2'/>\n<path d='M7 21H5c-1.1 0-2-.9-2-2v-2'/>\n<rect rx='1' y='7' x='7' height='5' width='7'/>\n<rect rx='1' y='12' x='10' height='5' width='7'/>\n</svg>\n")


(def
 settings
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'/>\n<circle r='3' cy='12' cx='12'/>\n</svg>\n")


(def
 cloud-snow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='M8 15h.01'/>\n<path d='M8 19h.01'/>\n<path d='M12 17h.01'/>\n<path d='M12 21h.01'/>\n<path d='M16 15h.01'/>\n<path d='M16 19h.01'/>\n</svg>\n")


(def
 notepad-text-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M12 2v4'/>\n<path d='M16 2v4'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v2'/>\n<path d='M20 12v2'/>\n<path d='M20 18v2a2 2 0 0 1-2 2h-1'/>\n<path d='M13 22h-2'/>\n<path d='M7 22H6a2 2 0 0 1-2-2v-2'/>\n<path d='M4 14v-2'/>\n<path d='M4 8V6a2 2 0 0 1 2-2h2'/>\n<path d='M8 10h6'/>\n<path d='M8 14h8'/>\n<path d='M8 18h5'/>\n</svg>\n")


(def
 calendar-x-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<path d='M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8'/>\n<path d='M3 10h18'/>\n<path d='m17 22 5-5'/>\n<path d='m17 17 5 5'/>\n</svg>\n")


(def
 cassette-tape
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<circle r='2' cy='10' cx='8'/>\n<path d='M8 12h8'/>\n<circle r='2' cy='10' cx='16'/>\n<path d='m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3'/>\n</svg>\n")


(def
 thumbs-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 14V2'/>\n<path d='M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z'/>\n</svg>\n")


(def
 dice-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 12h.01'/>\n</svg>\n")


(def
 move-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 19H5V13'/>\n<path d='M19 5L5 19'/>\n</svg>\n")


(def
 vote
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 12 2 2 4-4'/>\n<path d='M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z'/>\n<path d='M22 19H2'/>\n</svg>\n")


(def
 bot-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.67 8H18a2 2 0 0 1 2 2v4.33'/>\n<path d='M2 14h2'/>\n<path d='M20 14h2'/>\n<path d='M22 22 2 2'/>\n<path d='M8 8H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 1.414-.586'/>\n<path d='M9 13v2'/>\n<path d='M9.67 4H12v2.33'/>\n</svg>\n")


(def
 type
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 4v16'/>\n<path d='M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2'/>\n<path d='M9 20h6'/>\n</svg>\n")


(def
 square-dashed-mouse-pointer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z'/>\n<path d='M5 3a2 2 0 0 0-2 2'/>\n<path d='M19 3a2 2 0 0 1 2 2'/>\n<path d='M5 21a2 2 0 0 1-2-2'/>\n<path d='M9 3h1'/>\n<path d='M9 21h2'/>\n<path d='M14 3h1'/>\n<path d='M3 9v1'/>\n<path d='M21 9v2'/>\n<path d='M3 14v1'/>\n</svg>\n")


(def mouse-pointer-square-dashed square-dashed-mouse-pointer)


(def
 bow-arrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 3h4v4'/>\n<path d='M18.575 11.082a13 13 0 0 1 1.048 9.027 1.17 1.17 0 0 1-1.914.597L14 17'/>\n<path d='M7 10 3.29 6.29a1.17 1.17 0 0 1 .6-1.91 13 13 0 0 1 9.03 1.05'/>\n<path d='M7 14a1.7 1.7 0 0 0-1.207.5l-2.646 2.646A.5.5 0 0 0 3.5 18H5a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .854.354L9.5 18.207A1.7 1.7 0 0 0 10 17v-2a1 1 0 0 0-1-1z'/>\n<path d='M9.707 14.293 21 3'/>\n</svg>\n")


(def
 square-menu
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 8h10'/>\n<path d='M7 12h10'/>\n<path d='M7 16h10'/>\n</svg>\n")


(def menu-square square-menu)


(def
 mouse-pointer-click
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 4.1 12 6'/>\n<path d='m5.1 8-2.9-.8'/>\n<path d='m6 12-1.9 2'/>\n<path d='M7.2 2.2 8 5.1'/>\n<path d='M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z'/>\n</svg>\n")


(def
 regex
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 3v10'/>\n<path d='m12.67 5.5 8.66 5'/>\n<path d='m12.67 10.5 8.66-5'/>\n<path d='M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z'/>\n</svg>\n")


(def
 square-check-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344'/>\n<path d='m9 11 3 3L22 4'/>\n</svg>\n")


(def check-square square-check-big)


(def
 badge-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/>\n<line y2='17' y1='17' x2='12.01' x1='12'/>\n</svg>\n")


(def badge-help badge-question-mark)


(def
 loader-circle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12a9 9 0 1 1-6.219-8.56'/>\n</svg>\n")


(def loader-2 loader-circle)


(def
 popsicle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.6 14.4c.8-.8.8-2 0-2.8l-8.1-8.1a4.95 4.95 0 1 0-7.1 7.1l8.1 8.1c.9.7 2.1.7 2.9-.1Z'/>\n<path d='m22 22-5.5-5.5'/>\n</svg>\n")


(def
 lamp-floor
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10v12'/>\n<path d='M17.929 7.629A1 1 0 0 1 17 9H7a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 9 2h6a1 1 0 0 1 .928.629z'/>\n<path d='M9 22h6'/>\n</svg>\n")


(def
 utensils
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'/>\n<path d='M7 2v20'/>\n<path d='M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'/>\n</svg>\n")


(def fork-knife utensils)


(def
 map-pin-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.977 14C19.6 12.701 20 11.343 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='M16 18h6'/>\n</svg>\n")


(def
 archive
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='2' height='5' width='20'/>\n<path d='M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8'/>\n<path d='M10 12h4'/>\n</svg>\n")


(def
 bean
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z'/>\n<path d='M5.341 10.62a4 4 0 1 0 5.279-5.28'/>\n</svg>\n")


(def
 panels-right-bottom
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 15h12'/>\n<path d='M15 3v18'/>\n</svg>\n")


(def
 equal-approximately
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0'/>\n<path d='M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0'/>\n</svg>\n")


(def
 message-square-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M7 11h10'/>\n<path d='M7 15h6'/>\n<path d='M7 7h8'/>\n</svg>\n")


(def
 refresh-cw-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47'/>\n<path d='M8 16H3v5'/>\n<path d='M3 12C3 9.51 4 7.26 5.64 5.64'/>\n<path d='m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64'/>\n<path d='M21 12c0 1-.16 1.97-.47 2.87'/>\n<path d='M21 3v5h-5'/>\n<path d='M22 22 2 2'/>\n</svg>\n")


(def
 phone-outgoing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 8 6-6'/>\n<path d='M22 8V2h-6'/>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 tally-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 4v16'/>\n</svg>\n")


(def
 arrow-up-from-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m5 9 7-7 7 7'/>\n<path d='M12 16V2'/>\n<circle r='1' cy='21' cx='12'/>\n</svg>\n")


(def
 candy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 7v10.9'/>\n<path d='M14 6.1V17'/>\n<path d='M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4'/>\n<path d='M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07'/>\n<path d='M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4'/>\n</svg>\n")


(def
 pocket
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 3a2 2 0 0 1 2 2v6a1 1 0 0 1-20 0V5a2 2 0 0 1 2-2z'/>\n<path d='m8 10 4 4 4-4'/>\n</svg>\n")


(def
 repeat-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 2 4 4-4 4'/>\n<path d='M3 11v-1a4 4 0 0 1 4-4h14'/>\n<path d='m7 22-4-4 4-4'/>\n<path d='M21 13v1a4 4 0 0 1-4 4H3'/>\n<path d='M11 10h1v4'/>\n</svg>\n")


(def
 magnet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 15 4 4'/>\n<path d='M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z'/>\n<path d='m5 8 4 4'/>\n</svg>\n")


(def
 circle-parking
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M9 17V7h4a3 3 0 0 1 0 6H9'/>\n</svg>\n")


(def parking-circle circle-parking)


(def
 mail
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7'/>\n<rect rx='2' height='16' width='20' y='4' x='2'/>\n</svg>\n")


(def
 school
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 21v-3a2 2 0 0 0-4 0v3'/>\n<path d='M18 5v16'/>\n<path d='m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6'/>\n<path d='m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11'/>\n<path d='M6 5v16'/>\n<circle r='2' cy='9' cx='12'/>\n</svg>\n")


(def
 chart-spline
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7'/>\n</svg>\n")


(def
 arrow-big-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 9a1 1 0 0 0 1-1V5.061a1 1 0 0 1 1.811-.75l6.836 6.836a1.207 1.207 0 0 1 0 1.707l-6.836 6.835a1 1 0 0 1-1.811-.75V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z'/>\n</svg>\n")


(def
 shield
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n</svg>\n")


(def
 download
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 15V3'/>\n<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/>\n<path d='m7 10 5 5 5-5'/>\n</svg>\n")


(def
 kanban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 5v11'/>\n<path d='M12 5v6'/>\n<path d='M18 5v14'/>\n</svg>\n")


(def
 file-volume
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 11a5 5 0 0 1 0 6'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M4 6.765V4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-.93-.23'/>\n<path d='M7 10.51a.5.5 0 0 0-.826-.38l-1.893 1.628A1 1 0 0 1 3.63 12H2.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1.129a1 1 0 0 1 .652.242l1.893 1.63a.5.5 0 0 0 .826-.38z'/>\n</svg>\n")


(def
 expand
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 15 6 6'/>\n<path d='m15 9 6-6'/>\n<path d='M21 16v5h-5'/>\n<path d='M21 8V3h-5'/>\n<path d='M3 16v5h5'/>\n<path d='m3 21 6-6'/>\n<path d='M3 8V3h5'/>\n<path d='M9 9 3 3'/>\n</svg>\n")


(def
 gallery-vertical-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 2h10'/>\n<path d='M5 6h14'/>\n<rect rx='2' y='10' x='3' height='12' width='18'/>\n</svg>\n")


(def
 file-warning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M12 9v4'/>\n<path d='M12 17h.01'/>\n</svg>\n")


(def
 disc-album
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<circle r='5' cy='12' cx='12'/>\n<path d='M12 12h.01'/>\n</svg>\n")


(def
 pin
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17v5'/>\n<path d='M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'/>\n</svg>\n")


(def
 arrow-up-a-z
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<path d='M20 8h-5'/>\n<path d='M15 10V6.5a2.5 2.5 0 0 1 5 0V10'/>\n<path d='M15 14h5l-5 6h5'/>\n</svg>\n")


(def arrow-up-az arrow-up-a-z)


(def
 bandage
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10.01h.01'/>\n<path d='M10 14.01h.01'/>\n<path d='M14 10.01h.01'/>\n<path d='M14 14.01h.01'/>\n<path d='M18 6v11.5'/>\n<path d='M6 6v12'/>\n<rect rx='2' height='12' width='20' y='6' x='2'/>\n</svg>\n")


(def
 square-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m9 12 2 2 4-4'/>\n</svg>\n")


(def check-square-2 square-check)


(def
 import
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v12'/>\n<path d='m8 11 4 4 4-4'/>\n<path d='M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4'/>\n</svg>\n")


(def
 webcam
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='10' cx='12'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='M7 22h10'/>\n<path d='M12 22v-4'/>\n</svg>\n")


(def
 phone-forwarded
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 6h8'/>\n<path d='m18 2 4 4-4 4'/>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 bell-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M15 8h6'/>\n<path d='M18 5v6'/>\n<path d='M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332'/>\n</svg>\n")


(def
 square-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<circle r='1' cy='12' cx='12'/>\n</svg>\n")


(def dot-square square-dot)


(def
 corner-right-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 15 5 5 5-5'/>\n<path d='M4 4h7a4 4 0 0 1 4 4v12'/>\n</svg>\n")


(def
 square-divide
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<line y2='12' y1='12' x2='16' x1='8'/>\n<line y2='16' y1='16' x2='12' x1='12'/>\n<line y2='8' y1='8' x2='12' x1='12'/>\n</svg>\n")


(def divide-square square-divide)


(def
 book-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v14'/>\n<path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/>\n</svg>\n")


(def
 forklift
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12H5a2 2 0 0 0-2 2v5'/>\n<circle r='2' cy='19' cx='13'/>\n<circle r='2' cy='19' cx='5'/>\n<path d='M8 19h3m5-17v17h6M6 12V7c0-1.1.9-2 2-2h3l5 5'/>\n</svg>\n")


(def
 calendar-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15.228 16.852-.923-.383'/>\n<path d='m15.228 19.148-.923.383'/>\n<path d='M16 2v4'/>\n<path d='m16.47 14.305.382.923'/>\n<path d='m16.852 20.772-.383.924'/>\n<path d='m19.148 15.228.383-.923'/>\n<path d='m19.53 21.696-.382-.924'/>\n<path d='m20.772 16.852.924-.383'/>\n<path d='m20.772 19.148.924.383'/>\n<path d='M21 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def
 castle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 5V3'/>\n<path d='M14 5V3'/>\n<path d='M15 21v-3a3 3 0 0 0-6 0v3'/>\n<path d='M18 3v8'/>\n<path d='M18 5H6'/>\n<path d='M22 11H2'/>\n<path d='M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9'/>\n<path d='M6 3v8'/>\n</svg>\n")


(def
 orbit
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.341 6.484A10 10 0 0 1 10.266 21.85'/>\n<path d='M3.659 17.516A10 10 0 0 1 13.74 2.152'/>\n<circle r='3' cy='12' cx='12'/>\n<circle r='2' cy='5' cx='19'/>\n<circle r='2' cy='19' cx='5'/>\n</svg>\n")


(def
 parentheses
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 21s-4-3-4-9 4-9 4-9'/>\n<path d='M16 3s4 3 4 9-4 9-4 9'/>\n</svg>\n")


(def
 projector
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 7 3 5'/>\n<path d='M9 6V3'/>\n<path d='m13 7 2-2'/>\n<circle r='3' cy='13' cx='9'/>\n<path d='M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17'/>\n<path d='M16 16h2'/>\n</svg>\n")


(def
 pilcrow-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 3v11'/>\n<path d='M10 9H7a1 1 0 0 1 0-6h8'/>\n<path d='M14 3v11'/>\n<path d='m18 14 4 4H2'/>\n<path d='m22 18-4 4'/>\n</svg>\n")


(def
 server
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='2' x='2' height='8' width='20'/>\n<rect ry='2' rx='2' y='14' x='2' height='8' width='20'/>\n<line y2='6' y1='6' x2='6.01' x1='6'/>\n<line y2='18' y1='18' x2='6.01' x1='6'/>\n</svg>\n")


(def
 user-round-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21a8 8 0 0 1 13.292-6'/>\n<circle r='5' cy='8' cx='10'/>\n<path d='m16 19 2 2 4-4'/>\n</svg>\n")


(def user-check-2 user-round-check)


(def
 bolt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>\n<circle r='4' cy='12' cx='12'/>\n</svg>\n")


(def
 tv
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 2-5 5-5-5'/>\n<rect rx='2' y='7' x='2' height='15' width='20'/>\n</svg>\n")


(def
 message-square-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 19h.01'/>\n<path d='M12 3h.01'/>\n<path d='M16 19h.01'/>\n<path d='M16 3h.01'/>\n<path d='M2 13h.01'/>\n<path d='M2 17v4.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H8'/>\n<path d='M2 5a2 2 0 0 1 2-2'/>\n<path d='M2 9h.01'/>\n<path d='M20 3a2 2 0 0 1 2 2'/>\n<path d='M22 13h.01'/>\n<path d='M22 17a2 2 0 0 1-2 2'/>\n<path d='M22 9h.01'/>\n<path d='M8 3h.01'/>\n</svg>\n")


(def
 droplets
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z'/>\n<path d='M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97'/>\n</svg>\n")


(def
 skip-forward
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 4v16'/>\n<path d='M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z'/>\n</svg>\n")


(def
 archive-restore
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='2' height='5' width='20'/>\n<path d='M4 8v11a2 2 0 0 0 2 2h2'/>\n<path d='M20 8v11a2 2 0 0 1-2 2h-2'/>\n<path d='m9 15 3-3 3 3'/>\n<path d='M12 12v9'/>\n</svg>\n")


(def
 volume
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/>\n</svg>\n")


(def
 lamp-wall-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.929 9.629A1 1 0 0 1 19 11H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 4h6a1 1 0 0 1 .928.629z'/>\n<path d='M6 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z'/>\n<path d='M8 18h4a2 2 0 0 0 2-2v-5'/>\n</svg>\n")


(def
 drumstick
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23'/>\n<path d='m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59'/>\n</svg>\n")


(def
 user-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='9'/>\n<line y2='14' y1='8' x2='19' x1='19'/>\n<line y2='11' y1='11' x2='16' x1='22'/>\n</svg>\n")


(def
 wifi-zero
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h.01'/>\n</svg>\n")


(def
 battery-medium
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 14v-4'/>\n<path d='M22 14v-4'/>\n<path d='M6 14v-4'/>\n<rect rx='2' height='12' width='16' y='6' x='2'/>\n</svg>\n")


(def
 book-a
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='m8 13 4-7 4 7'/>\n<path d='M9.1 11h5.7'/>\n</svg>\n")


(def
 battery-charging
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 7-3 5h4l-3 5'/>\n<path d='M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935'/>\n<path d='M22 14v-4'/>\n<path d='M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936'/>\n</svg>\n")


(def
 shapes
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z'/>\n<rect rx='1' height='7' width='7' y='14' x='3'/>\n<circle r='3.5' cy='17.5' cx='17.5'/>\n</svg>\n")


(def
 folders
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z'/>\n<path d='M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1'/>\n</svg>\n")


(def
 satellite
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5'/>\n<path d='M16.5 7.5 19 5'/>\n<path d='m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5'/>\n<path d='M9 21a6 6 0 0 0-6-6'/>\n<path d='M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z'/>\n</svg>\n")


(def
 list-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 12H3'/>\n<path d='M16 6H3'/>\n<path d='M16 18H3'/>\n<path d='M21 12h-6'/>\n</svg>\n")


(def
 circle-arrow-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m12 8-4 4 4 4'/>\n<path d='M16 12H8'/>\n</svg>\n")


(def arrow-left-circle circle-arrow-left)


(def
 bookmark-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'/>\n<line y2='10' y1='10' x2='9' x1='15'/>\n</svg>\n")


(def
 heater
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 8c2-3-2-3 0-6'/>\n<path d='M15.5 8c2-3-2-3 0-6'/>\n<path d='M6 10h.01'/>\n<path d='M6 14h.01'/>\n<path d='M10 16v-4'/>\n<path d='M14 16v-4'/>\n<path d='M18 16v-4'/>\n<path d='M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3'/>\n<path d='M5 20v2'/>\n<path d='M19 20v2'/>\n</svg>\n")


(def
 layers
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z'/>\n<path d='M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12'/>\n<path d='M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17'/>\n</svg>\n")


(def layers-3 layers)


(def
 earth-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 3.34V5a3 3 0 0 0 3 3'/>\n<path d='M11 21.95V18a2 2 0 0 0-2-2 2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05'/>\n<path d='M21.54 15H17a2 2 0 0 0-2 2v4.54'/>\n<path d='M12 2a10 10 0 1 0 9.54 13'/>\n<path d='M20 6V4a2 2 0 1 0-4 0v2'/>\n<rect rx='1' y='6' x='14' height='5' width='8'/>\n</svg>\n")


(def
 spool
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 13.44 4.442 17.082A2 2 0 0 0 4.982 21H19a2 2 0 0 0 .558-3.921l-1.115-.32A2 2 0 0 1 17 14.837V7.66'/>\n<path d='m7 10.56 12.558-3.642A2 2 0 0 0 19.018 3H5a2 2 0 0 0-.558 3.921l1.115.32A2 2 0 0 1 7 9.163v7.178'/>\n</svg>\n")


(def
 square-parking-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41'/>\n<path d='M3 8.7V19a2 2 0 0 0 2 2h10.3'/>\n<path d='m2 2 20 20'/>\n<path d='M13 13a3 3 0 1 0 0-6H9v2'/>\n<path d='M9 17v-2.3'/>\n</svg>\n")


(def parking-square-off square-parking-off)


(def
 dna
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 16 1.5 1.5'/>\n<path d='m14 8-1.5-1.5'/>\n<path d='M15 2c-1.798 1.998-2.518 3.995-2.807 5.993'/>\n<path d='m16.5 10.5 1 1'/>\n<path d='m17 6-2.891-2.891'/>\n<path d='M2 15c6.667-6 13.333 0 20-6'/>\n<path d='m20 9 .891.891'/>\n<path d='M3.109 14.109 4 15'/>\n<path d='m6.5 12.5 1 1'/>\n<path d='m7 18 2.891 2.891'/>\n<path d='M9 22c1.798-1.998 2.518-3.995 2.807-5.993'/>\n</svg>\n")


(def
 mouse-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v.343'/>\n<path d='M18.218 18.218A7 7 0 0 1 5 15V9a7 7 0 0 1 .782-3.218'/>\n<path d='M19 13.343V9A7 7 0 0 0 8.56 2.902'/>\n<path d='M22 22 2 2'/>\n</svg>\n")


(def
 file-check-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m3 15 2 2 4-4'/>\n</svg>\n")


(def
 slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 2 2 22'/>\n</svg>\n")


(def
 radio
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.247 7.761a6 6 0 0 1 0 8.478'/>\n<path d='M19.075 4.933a10 10 0 0 1 0 14.134'/>\n<path d='M4.925 19.067a10 10 0 0 1 0-14.134'/>\n<path d='M7.753 16.239a6 6 0 0 1 0-8.478'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 align-center-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v20'/>\n<path d='M8 10H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h4'/>\n<path d='M16 10h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4'/>\n<path d='M8 20H7a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h1'/>\n<path d='M16 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1'/>\n</svg>\n")


(def
 alarm-clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='13' cx='12'/>\n<path d='M12 9v4l2 2'/>\n<path d='M5 3 2 6'/>\n<path d='m22 6-3-3'/>\n<path d='M6.38 18.7 4 21'/>\n<path d='M17.64 18.67 20 21'/>\n</svg>\n")


(def
 alarm-clock-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6.87 6.87a8 8 0 1 0 11.26 11.26'/>\n<path d='M19.9 14.25a8 8 0 0 0-9.15-9.15'/>\n<path d='m22 6-3-3'/>\n<path d='M6.26 18.67 4 21'/>\n<path d='m2 2 20 20'/>\n<path d='M4 4 2 6'/>\n</svg>\n")


(def
 book
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n</svg>\n")


(def
 keyboard-music
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M6 8h4'/>\n<path d='M14 8h.01'/>\n<path d='M18 8h.01'/>\n<path d='M2 12h20'/>\n<path d='M6 12v4'/>\n<path d='M10 12v4'/>\n<path d='M14 12v4'/>\n<path d='M18 12v4'/>\n</svg>\n")


(def
 hotel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 22v-6.57'/>\n<path d='M12 11h.01'/>\n<path d='M12 7h.01'/>\n<path d='M14 15.43V22'/>\n<path d='M15 16a5 5 0 0 0-6 0'/>\n<path d='M16 11h.01'/>\n<path d='M16 7h.01'/>\n<path d='M8 11h.01'/>\n<path d='M8 7h.01'/>\n<rect rx='2' height='20' width='16' y='2' x='4'/>\n</svg>\n")


(def
 book-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M8 11h8'/>\n<path d='M8 7h6'/>\n</svg>\n")


(def
 variable
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 21s-4-3-4-9 4-9 4-9'/>\n<path d='M16 3s4 3 4 9-4 9-4 9'/>\n<line y2='15' y1='9' x2='9' x1='15'/>\n<line y2='15' y1='9' x2='15' x1='9'/>\n</svg>\n")


(def
 touchpad-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20v-6'/>\n<path d='M19.656 14H22'/>\n<path d='M2 14h12'/>\n<path d='m2 2 20 20'/>\n<path d='M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2'/>\n<path d='M9.656 4H20a2 2 0 0 1 2 2v10.344'/>\n</svg>\n")


(def
 bitcoin
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727'/>\n</svg>\n")


(def
 message-square-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='m14.5 8.5-5 5'/>\n<path d='m9.5 8.5 5 5'/>\n</svg>\n")


(def
 car-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8'/>\n<path d='M7 14h.01'/>\n<path d='M17 14h.01'/>\n<rect rx='2' y='10' x='3' height='8' width='18'/>\n<path d='M5 18v2'/>\n<path d='M19 18v2'/>\n</svg>\n")


(def
 alarm-smoke
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 21c0-2.5 2-2.5 2-5'/>\n<path d='M16 21c0-2.5 2-2.5 2-5'/>\n<path d='m19 8-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8'/>\n<path d='M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z'/>\n<path d='M6 21c0-2.5 2-2.5 2-5'/>\n</svg>\n")


(def
 dice-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M16 8h.01'/>\n<path d='M8 8h.01'/>\n<path d='M8 16h.01'/>\n<path d='M16 16h.01'/>\n</svg>\n")


(def
 skull
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12.5 17-.5-1-.5 1h1z'/>\n<path d='M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z'/>\n<circle r='1' cy='12' cx='15'/>\n<circle r='1' cy='12' cx='9'/>\n</svg>\n")


(def
 mail-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='M16 19h6'/>\n</svg>\n")


(def
 bot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 8V4H8'/>\n<rect rx='2' y='8' x='4' height='12' width='16'/>\n<path d='M2 14h2'/>\n<path d='M20 14h2'/>\n<path d='M15 13v2'/>\n<path d='M9 13v2'/>\n</svg>\n")


(def
 plug
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-5'/>\n<path d='M9 8V2'/>\n<path d='M15 8V2'/>\n<path d='M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z'/>\n</svg>\n")


(def
 shield-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='m14.5 9.5-5 5'/>\n<path d='m9.5 9.5 5 5'/>\n</svg>\n")


(def shield-close shield-x)


(def
 train-track
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 17 17 2'/>\n<path d='m2 14 8 8'/>\n<path d='m5 11 8 8'/>\n<path d='m8 8 8 8'/>\n<path d='m11 5 8 8'/>\n<path d='m14 2 8 8'/>\n<path d='M7 22 22 7'/>\n</svg>\n")


(def
 goal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13V2l8 4-8 4'/>\n<path d='M20.561 10.222a9 9 0 1 1-12.55-5.29'/>\n<path d='M8.002 9.997a5 5 0 1 0 8.9 2.02'/>\n</svg>\n")


(def
 square-chart-gantt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 8h7'/>\n<path d='M8 12h6'/>\n<path d='M11 16h5'/>\n</svg>\n")


(def gantt-chart-square square-chart-gantt)


(def square-gantt-chart square-chart-gantt)


(def
 file-chart-column
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 18v-1'/>\n<path d='M12 18v-6'/>\n<path d='M16 18v-3'/>\n</svg>\n")


(def file-bar-chart-2 file-chart-column)


(def
 folder-archive
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='19' cx='15'/>\n<path d='M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1'/>\n<path d='M15 11v-1'/>\n<path d='M15 17v-2'/>\n</svg>\n")


(def
 signal-high
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h.01'/>\n<path d='M7 20v-4'/>\n<path d='M12 20v-8'/>\n<path d='M17 20V8'/>\n</svg>\n")


(def
 user-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='9'/>\n<line y2='11' y1='11' x2='16' x1='22'/>\n</svg>\n")


(def
 plane-landing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 22h20'/>\n<path d='M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z'/>\n</svg>\n")


(def
 wallet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1'/>\n<path d='M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'/>\n</svg>\n")


(def
 circle-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m9 12 2 2 4-4'/>\n</svg>\n")


(def check-circle-2 circle-check)


(def
 tally-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 4v16'/>\n<path d='M9 4v16'/>\n<path d='M14 4v16'/>\n<path d='M19 4v16'/>\n</svg>\n")


(def
 file-image
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<circle r='2' cy='12' cx='10'/>\n<path d='m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22'/>\n</svg>\n")


(def
 square-dashed-bottom
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2'/>\n<path d='M9 21h1'/>\n<path d='M14 21h1'/>\n</svg>\n")


(def
 panel-top-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n<path d='m15 14-3 3-3-3'/>\n</svg>\n")


(def
 bell
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'/>\n</svg>\n")


(def
 git-branch
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='15' y1='3' x2='6' x1='6'/>\n<circle r='3' cy='6' cx='18'/>\n<circle r='3' cy='18' cx='6'/>\n<path d='M18 9a9 9 0 0 1-9 9'/>\n</svg>\n")


(def
 square-m
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 16V8l4 4 4-4v8'/>\n</svg>\n")


(def m-square square-m)


(def
 coffee
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v2'/>\n<path d='M14 2v2'/>\n<path d='M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1'/>\n<path d='M6 2v2'/>\n</svg>\n")


(def
 funnel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z'/>\n</svg>\n")


(def filter funnel)


(def
 panel-left-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 14v1'/>\n<path d='M9 19v2'/>\n<path d='M9 3v2'/>\n<path d='M9 9v1'/>\n</svg>\n")


(def panel-left-inactive panel-left-dashed)


(def
 code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 18 6-6-6-6'/>\n<path d='m8 6-6 6 6 6'/>\n</svg>\n")


(def
 rail-symbol
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 15h14'/>\n<path d='M5 9h14'/>\n<path d='m14 20-5-5 6-6-5-5'/>\n</svg>\n")


(def
 circle-divide
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='12' x2='16' x1='8'/>\n<line y2='16' y1='16' x2='12' x1='12'/>\n<line y2='8' y1='8' x2='12' x1='12'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def divide-circle circle-divide)


(def
 cake
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8'/>\n<path d='M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1'/>\n<path d='M2 21h20'/>\n<path d='M7 8v3'/>\n<path d='M12 8v3'/>\n<path d='M17 8v3'/>\n<path d='M7 4h.01'/>\n<path d='M12 4h.01'/>\n<path d='M17 4h.01'/>\n</svg>\n")


(def
 spell-check-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 16 6-12 6 12'/>\n<path d='M8 12h8'/>\n<path d='M4 21c1.1 0 1.1-1 2.3-1s1.1 1 2.3 1c1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1 1.1 0 1.1 1 2.3 1 1.1 0 1.1-1 2.3-1'/>\n</svg>\n")


(def
 shredder
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 22v-5'/>\n<path d='M14 19v-2'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M18 20v-3'/>\n<path d='M2 13h20'/>\n<path d='M20 13V7l-5-5H6a2 2 0 0 0-2 2v9'/>\n<path d='M6 20v-3'/>\n</svg>\n")


(def
 user-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='7' cx='10'/>\n<path d='M10.3 15H7a4 4 0 0 0-4 4v2'/>\n<path d='M15 15.5V14a2 2 0 0 1 4 0v1.5'/>\n<rect rx='.899' y='16' x='13' height='5' width='8'/>\n</svg>\n")


(def
 settings-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 17H5'/>\n<path d='M19 7h-9'/>\n<circle r='3' cy='17' cx='17'/>\n<circle r='3' cy='7' cx='7'/>\n</svg>\n")


(def
 tally-5
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 4v16'/>\n<path d='M9 4v16'/>\n<path d='M14 4v16'/>\n<path d='M19 4v16'/>\n<path d='M22 6 2 18'/>\n</svg>\n")


(def
 chart-bar-decreasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M7 11h8'/>\n<path d='M7 16h3'/>\n<path d='M7 6h12'/>\n</svg>\n")


(def
 message-circle-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.1 2.182a10 10 0 0 1 3.8 0'/>\n<path d='M13.9 21.818a10 10 0 0 1-3.8 0'/>\n<path d='M17.609 3.72a10 10 0 0 1 2.69 2.7'/>\n<path d='M2.182 13.9a10 10 0 0 1 0-3.8'/>\n<path d='M20.28 17.61a10 10 0 0 1-2.7 2.69'/>\n<path d='M21.818 10.1a10 10 0 0 1 0 3.8'/>\n<path d='M3.721 6.391a10 10 0 0 1 2.7-2.69'/>\n<path d='m6.163 21.117-2.906.85a1 1 0 0 1-1.236-1.169l.965-2.98'/>\n</svg>\n")


(def
 cloud-moon-rain
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 20v2'/>\n<path d='M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36'/>\n<path d='M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24'/>\n<path d='M7 19v2'/>\n</svg>\n")


(def
 radio-tower
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.9 16.1C1 12.2 1 5.8 4.9 1.9'/>\n<path d='M7.8 4.7a6.14 6.14 0 0 0-.8 7.5'/>\n<circle r='2' cy='9' cx='12'/>\n<path d='M16.2 4.8c2 2 2.26 5.11.8 7.47'/>\n<path d='M19.1 1.9a9.96 9.96 0 0 1 0 14.1'/>\n<path d='M9.5 18h5'/>\n<path d='m8 22 4-11 4 11'/>\n</svg>\n")


(def
 thermometer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z'/>\n</svg>\n")


(def
 cast
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6'/>\n<path d='M2 12a9 9 0 0 1 8 8'/>\n<path d='M2 16a5 5 0 0 1 4 4'/>\n<line y2='20' y1='20' x2='2.01' x1='2'/>\n</svg>\n")


(def
 milestone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13v8'/>\n<path d='M12 3v3'/>\n<path d='M4 6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h13a2 2 0 0 0 1.152-.365l3.424-2.317a1 1 0 0 0 0-1.635l-3.424-2.318A2 2 0 0 0 17 6z'/>\n</svg>\n")


(def
 move-3d
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 3v16h16'/>\n<path d='m5 19 6-6'/>\n<path d='m2 6 3-3 3 3'/>\n<path d='m18 16 3 3-3 3'/>\n</svg>\n")


(def move-3-d move-3d)


(def
 flag
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'/>\n</svg>\n")


(def
 podcast
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path fill='currentColor' d='M13 17a1 1 0 1 0-2 0l.5 4.5a0.5 0.5 0 0 0 1 0z'/>\n<path d='M16.85 18.58a9 9 0 1 0-9.7 0'/>\n<path d='M8 14a5 5 0 1 1 8 0'/>\n<circle fill='currentColor' r='1' cy='11' cx='12'/>\n</svg>\n")


(def
 tv-minimal-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z'/>\n<path d='M7 21h10'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n</svg>\n")


(def
 git-fork
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='18' cx='12'/>\n<circle r='3' cy='6' cx='6'/>\n<circle r='3' cy='6' cx='18'/>\n<path d='M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9'/>\n<path d='M12 12v3'/>\n</svg>\n")


(def
 eye-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49'/>\n<path d='M14.084 14.158a3 3 0 0 1-4.242-4.242'/>\n<path d='M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 dice-5
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M16 8h.01'/>\n<path d='M8 8h.01'/>\n<path d='M8 16h.01'/>\n<path d='M16 16h.01'/>\n<path d='M12 12h.01'/>\n</svg>\n")


(def
 tram-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='4' height='16' width='16'/>\n<path d='M4 11h16'/>\n<path d='M12 3v8'/>\n<path d='m8 19-2 3'/>\n<path d='m18 22-2-3'/>\n<path d='M8 15h.01'/>\n<path d='M16 15h.01'/>\n</svg>\n")


(def train tram-front)


(def
 battery
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M 22 14 L 22 10'/>\n<rect rx='2' height='12' width='16' y='6' x='2'/>\n</svg>\n")


(def
 blinds
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3h18'/>\n<path d='M20 7H8'/>\n<path d='M20 11H8'/>\n<path d='M10 19h10'/>\n<path d='M8 15h12'/>\n<path d='M4 3v14'/>\n<circle r='2' cy='19' cx='4'/>\n</svg>\n")


(def
 arrow-left-to-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 19V5'/>\n<path d='m13 6-6 6 6 6'/>\n<path d='M7 12h14'/>\n</svg>\n")


(def
 newspaper
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 18h-5'/>\n<path d='M18 14h-8'/>\n<path d='M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2'/>\n<rect rx='1' y='6' x='10' height='4' width='8'/>\n</svg>\n")


(def
 clipboard-pen-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5'/>\n<path d='M16 4h2a2 2 0 0 1 1.73 1'/>\n<path d='M8 18h1'/>\n<path d='M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n</svg>\n")


(def clipboard-signature clipboard-pen-line)


(def
 snowflake
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 20-1.25-2.5L6 18'/>\n<path d='M10 4 8.75 6.5 6 6'/>\n<path d='m14 20 1.25-2.5L18 18'/>\n<path d='m14 4 1.25 2.5L18 6'/>\n<path d='m17 21-3-6h-4'/>\n<path d='m17 3-3 6 1.5 3'/>\n<path d='M2 12h6.5L10 9'/>\n<path d='m20 10-1.5 2 1.5 2'/>\n<path d='M22 12h-6.5L14 15'/>\n<path d='m4 10 1.5 2L4 14'/>\n<path d='m7 21 3-6-1.5-3'/>\n<path d='m7 3 3 6h4'/>\n</svg>\n")


(def
 disc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='2' cy='12' cx='12'/>\n</svg>\n")


(def
 step-forward
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z'/>\n<path d='M3 4v16'/>\n</svg>\n")


(def
 bomb
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='9' cy='13' cx='11'/>\n<path d='M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95'/>\n<path d='m22 2-1.5 1.5'/>\n</svg>\n")


(def
 piano
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.5 8c-1.4 0-2.6-.8-3.2-2A6.87 6.87 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8'/>\n<path d='M2 14h20'/>\n<path d='M6 14v4'/>\n<path d='M10 14v4'/>\n<path d='M14 14v4'/>\n<path d='M18 14v4'/>\n</svg>\n")


(def
 book-copy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 7a2 2 0 0 0-2 2v11'/>\n<path d='M5.803 18H5a2 2 0 0 0 0 4h9.5a.5.5 0 0 0 .5-.5V21'/>\n<path d='M9 15V4a2 2 0 0 1 2-2h9.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H11a2 2 0 0 1 0-4h10'/>\n</svg>\n")


(def
 map-pin-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='M16 18h6'/>\n<path d='M19 15v6'/>\n</svg>\n")


(def
 arrow-up-0-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<rect ry='2' height='6' width='4' y='4' x='15'/>\n<path d='M17 20v-6h-2'/>\n<path d='M15 20h4'/>\n</svg>\n")


(def arrow-up-01 arrow-up-0-1)


(def
 database-zap
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<ellipse ry='3' rx='9' cy='5' cx='12'/>\n<path d='M3 5V19A9 3 0 0 0 15 21.84'/>\n<path d='M21 5V8'/>\n<path d='M21 12L18 17H22L19 22'/>\n<path d='M3 12A9 3 0 0 0 14.59 14.87'/>\n</svg>\n")


(def
 rotate-3d
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2'/>\n<path d='m15.194 13.707 3.814 1.86-1.86 3.814'/>\n<path d='M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4'/>\n</svg>\n")


(def rotate-3-d rotate-3d)


(def
 star-half
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2'/>\n</svg>\n")


(def
 switch-camera
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5'/>\n<path d='M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5'/>\n<circle r='3' cy='12' cx='12'/>\n<path d='m18 22-3-3 3-3'/>\n<path d='m6 2 3 3-3 3'/>\n</svg>\n")


(def
 image-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 5h6'/>\n<path d='M19 2v6'/>\n<path d='M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5'/>\n<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/>\n<circle r='2' cy='9' cx='9'/>\n</svg>\n")


(def
 square-round-corner
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 11a8 8 0 0 0-8-8'/>\n<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/>\n</svg>\n")


(def
 pencil-ruler
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13'/>\n<path d='m8 6 2-2'/>\n<path d='m18 16 2-2'/>\n<path d='m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17'/>\n<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>\n<path d='m15 5 4 4'/>\n</svg>\n")


(def
 container
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z'/>\n<path d='M10 21.9V14L2.1 9.1'/>\n<path d='m10 14 11.9-6.9'/>\n<path d='M14 19.8v-8.1'/>\n<path d='M18 17.5V9.4'/>\n</svg>\n")


(def
 ruler
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z'/>\n<path d='m14.5 12.5 2-2'/>\n<path d='m11.5 9.5 2-2'/>\n<path d='m8.5 6.5 2-2'/>\n<path d='m17.5 15.5 2-2'/>\n</svg>\n")


(def
 turtle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z'/>\n<path d='M4.82 7.9 8 10'/>\n<path d='M15.18 7.9 12 10'/>\n<path d='M16.93 10H20a2 2 0 0 1 0 4H2'/>\n</svg>\n")


(def
 frown
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M16 16s-1.5-2-4-2-4 2-4 2'/>\n<line y2='9' y1='9' x2='9.01' x1='9'/>\n<line y2='9' y1='9' x2='15.01' x1='15'/>\n</svg>\n")


(def
 tree-pine
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z'/>\n<path d='M12 22v-3'/>\n</svg>\n")


(def
 audio-lines
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 10v3'/>\n<path d='M6 6v11'/>\n<path d='M10 3v18'/>\n<path d='M14 8v7'/>\n<path d='M18 5v13'/>\n<path d='M22 10v3'/>\n</svg>\n")


(def
 circle-slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<line y2='9' y1='15' x2='15' x1='9'/>\n</svg>\n")


(def
 notebook-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 6h4'/>\n<path d='M2 10h4'/>\n<path d='M2 14h4'/>\n<path d='M2 18h4'/>\n<rect rx='2' y='2' x='4' height='20' width='16'/>\n<path d='M9.5 8h5'/>\n<path d='M9.5 12H16'/>\n<path d='M9.5 16H14'/>\n</svg>\n")


(def
 layout-dashboard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='9' width='7'/>\n<rect rx='1' y='3' x='14' height='5' width='7'/>\n<rect rx='1' y='12' x='14' height='9' width='7'/>\n<rect rx='1' y='16' x='3' height='5' width='7'/>\n</svg>\n")


(def
 cpu
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20v2'/>\n<path d='M12 2v2'/>\n<path d='M17 20v2'/>\n<path d='M17 2v2'/>\n<path d='M2 12h2'/>\n<path d='M2 17h2'/>\n<path d='M2 7h2'/>\n<path d='M20 12h2'/>\n<path d='M20 17h2'/>\n<path d='M20 7h2'/>\n<path d='M7 20v2'/>\n<path d='M7 2v2'/>\n<rect rx='2' height='16' width='16' y='4' x='4'/>\n<rect rx='1' height='8' width='8' y='8' x='8'/>\n</svg>\n")


(def
 align-end-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='4' height='16' width='6'/>\n<rect rx='2' y='9' x='14' height='9' width='6'/>\n<path d='M22 22H2'/>\n</svg>\n")


(def
 flame-kindling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z'/>\n<path d='m5 22 14-4'/>\n<path d='m5 18 14 4'/>\n</svg>\n")


(def
 cloud-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12v4'/>\n<path d='M12 20h.01'/>\n<path d='M17 18h.5a1 1 0 0 0 0-9h-1.79A7 7 0 1 0 7 17.708'/>\n</svg>\n")


(def
 clipboard-list
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='M12 11h4'/>\n<path d='M12 16h4'/>\n<path d='M8 11h.01'/>\n<path d='M8 16h.01'/>\n</svg>\n")


(def
 biohazard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='11.9' cx='12'/>\n<path d='M6.7 3.4c-.9 2.5 0 5.2 2.2 6.7C6.5 9 3.7 9.6 2 11.6'/>\n<path d='m8.9 10.1 1.4.8'/>\n<path d='M17.3 3.4c.9 2.5 0 5.2-2.2 6.7 2.4-1.2 5.2-.6 6.9 1.5'/>\n<path d='m15.1 10.1-1.4.8'/>\n<path d='M16.7 20.8c-2.6-.4-4.6-2.6-4.7-5.3-.2 2.6-2.1 4.8-4.7 5.2'/>\n<path d='M12 13.9v1.6'/>\n<path d='M13.5 5.4c-1-.2-2-.2-3 0'/>\n<path d='M17 16.4c.7-.7 1.2-1.6 1.5-2.5'/>\n<path d='M5.5 13.9c.3.9.8 1.8 1.5 2.5'/>\n</svg>\n")


(def
 letter-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 12h6'/>\n<path d='M15 6h6'/>\n<path d='m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13'/>\n<path d='M3 18h18'/>\n<path d='M3.92 11h6.16'/>\n</svg>\n")


(def
 folder-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='m9.5 10.5 5 5'/>\n<path d='m14.5 10.5-5 5'/>\n</svg>\n")


(def
 book-open-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 21V7'/>\n<path d='m16 12 2 2 4-4'/>\n<path d='M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3'/>\n</svg>\n")


(def
 list-ordered
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12h11'/>\n<path d='M10 18h11'/>\n<path d='M10 6h11'/>\n<path d='M4 10h2'/>\n<path d='M4 6h1v4'/>\n<path d='M6 18H4c0-1 2-2 2-3s-1-1.5-2-1'/>\n</svg>\n")


(def
 factory
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 16h.01'/>\n<path d='M16 16h.01'/>\n<path d='M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z'/>\n<path d='M8 16h.01'/>\n</svg>\n")


(def
 bold
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8'/>\n</svg>\n")


(def
 tablets
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='5' cy='7' cx='7'/>\n<circle r='5' cy='17' cx='17'/>\n<path d='M12 17h10'/>\n<path d='m3.46 10.54 7.08-7.08'/>\n</svg>\n")


(def
 wifi-low
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h.01'/>\n<path d='M8.5 16.429a5 5 0 0 1 7 0'/>\n</svg>\n")


(def
 fence
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z'/>\n<path d='M6 8h4'/>\n<path d='M6 18h4'/>\n<path d='m12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z'/>\n<path d='M14 8h4'/>\n<path d='M14 18h4'/>\n<path d='m20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z'/>\n</svg>\n")


(def
 trophy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978'/>\n<path d='M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978'/>\n<path d='M18 9h1.5a1 1 0 0 0 0-5H18'/>\n<path d='M4 22h16'/>\n<path d='M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z'/>\n<path d='M6 9H4.5a1 1 0 0 1 0-5H6'/>\n</svg>\n")


(def
 scan-qr-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 12v4a1 1 0 0 1-1 1h-4'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M17 8V7'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M7 17h.01'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<rect rx='1' height='5' width='5' y='7' x='7'/>\n</svg>\n")


(def
 hash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='9' y1='9' x2='20' x1='4'/>\n<line y2='15' y1='15' x2='20' x1='4'/>\n<line y2='21' y1='3' x2='8' x1='10'/>\n<line y2='21' y1='3' x2='14' x1='16'/>\n</svg>\n")


(def
 shield-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M9 12h6'/>\n</svg>\n")


(def
 link-2-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 17H7A5 5 0 0 1 7 7'/>\n<path d='M15 7h2a5 5 0 0 1 4 8'/>\n<line y2='12' y1='12' x2='12' x1='8'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 dam
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 11.31c1.17.56 1.54 1.69 3.5 1.69 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n<path d='M11.75 18c.35.5 1.45 1 2.75 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n<path d='M2 10h4'/>\n<path d='M2 14h4'/>\n<path d='M2 18h4'/>\n<path d='M2 6h4'/>\n<path d='M7 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1L10 4a1 1 0 0 0-1-1z'/>\n</svg>\n")


(def
 share-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='5' cx='18'/>\n<circle r='3' cy='12' cx='6'/>\n<circle r='3' cy='19' cx='18'/>\n<line y2='17.49' y1='13.51' x2='15.42' x1='8.59'/>\n<line y2='10.49' y1='6.51' x2='8.59' x1='15.41'/>\n</svg>\n")


(def
 battery-full
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10v4'/>\n<path d='M14 10v4'/>\n<path d='M22 14v-4'/>\n<path d='M6 10v4'/>\n<rect rx='2' height='12' width='16' y='6' x='2'/>\n</svg>\n")


(def
 plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 12h14'/>\n<path d='M12 5v14'/>\n</svg>\n")


(def
 monitor-stop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n<rect rx='2' height='14' width='20' y='3' x='2'/>\n<rect rx='1' height='6' width='6' y='7' x='9'/>\n</svg>\n")


(def
 panel-bottom
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 15h18'/>\n</svg>\n")


(def
 clipboard-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='M9 14h6'/>\n</svg>\n")


(def
 check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 6 9 17l-5-5'/>\n</svg>\n")


(def
 align-vertical-justify-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='12' x='5' height='6' width='14'/>\n<rect rx='2' y='2' x='7' height='6' width='10'/>\n<path d='M2 22h20'/>\n</svg>\n")


(def
 map-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V14'/>\n<path d='M15 5.764V14'/>\n<path d='M21 18h-6'/>\n<path d='M9 3.236v15'/>\n</svg>\n")


(def
 rabbit
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 16a3 3 0 0 1 2.24 5'/>\n<path d='M18 12h.01'/>\n<path d='M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3'/>\n<path d='M20 8.54V4a2 2 0 1 0-4 0v3'/>\n<path d='M7.612 12.524a3 3 0 1 0-1.6 4.3'/>\n</svg>\n")


(def
 plug-zap
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z'/>\n<path d='m2 22 3-3'/>\n<path d='M7.5 13.5 10 11'/>\n<path d='M10.5 16.5 13 14'/>\n<path d='m18 3-4 4h6l-4 4'/>\n</svg>\n")


(def plug-zap-2 plug-zap)


(def
 nut
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 4V2'/>\n<path d='M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4'/>\n<path d='M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z'/>\n</svg>\n")


(def
 mail-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='M19 16v6'/>\n<path d='M16 19h6'/>\n</svg>\n")


(def
 move-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 13V19H13'/>\n<path d='M5 5L19 19'/>\n</svg>\n")


(def
 rotate-ccw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/>\n<path d='M3 3v5h5'/>\n</svg>\n")


(def
 circle-star
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 heart-crack
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15'/>\n<path d='M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z'/>\n</svg>\n")


(def
 flip-horizontal-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 7 5 5-5 5V7'/>\n<path d='m21 7-5 5 5 5V7'/>\n<path d='M12 20v2'/>\n<path d='M12 14v2'/>\n<path d='M12 8v2'/>\n<path d='M12 2v2'/>\n</svg>\n")


(def
 hard-drive
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='12' x2='2' x1='22'/>\n<path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/>\n<line y2='16' y1='16' x2='6.01' x1='6'/>\n<line y2='16' y1='16' x2='10.01' x1='10'/>\n</svg>\n")


(def
 between-horizontal-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='7' width='13'/>\n<path d='m22 15-3-3 3-3'/>\n<rect rx='1' y='14' x='3' height='7' width='13'/>\n</svg>\n")


(def between-horizonal-end between-horizontal-end)


(def
 tent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.5 21 14 3'/>\n<path d='M20.5 21 10 3'/>\n<path d='M15.5 21 12 15l-3.5 6'/>\n<path d='M2 21h20'/>\n</svg>\n")


(def
 trending-up-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.828 14.828 21 21'/>\n<path d='M21 16v5h-5'/>\n<path d='m21 3-9 9-4-4-6 6'/>\n<path d='M21 8V3h-5'/>\n</svg>\n")


(def
 hard-drive-download
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v8'/>\n<path d='m16 6-4 4-4-4'/>\n<rect rx='2' y='14' x='2' height='8' width='20'/>\n<path d='M6 18h.01'/>\n<path d='M10 18h.01'/>\n</svg>\n")


(def
 circle-fading-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2a10 10 0 0 1 7.38 16.75'/>\n<path d='M12 8v8'/>\n<path d='M16 12H8'/>\n<path d='M2.5 8.875a10 10 0 0 0-.5 3'/>\n<path d='M2.83 16a10 10 0 0 0 2.43 3.4'/>\n<path d='M4.636 5.235a10 10 0 0 1 .891-.857'/>\n<path d='M8.644 21.42a10 10 0 0 0 7.631-.38'/>\n</svg>\n")


(def
 pen-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 21h8'/>\n<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>\n</svg>\n")


(def edit-3 pen-line)


(def
 align-vertical-space-around
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='9' x='7' height='6' width='10'/>\n<path d='M22 20H2'/>\n<path d='M22 4H2'/>\n</svg>\n")


(def
 hospital
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v4'/>\n<path d='M14 21v-3a2 2 0 0 0-4 0v3'/>\n<path d='M14 9h-4'/>\n<path d='M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2'/>\n<path d='M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16'/>\n</svg>\n")


(def
 case-sensitive
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'/>\n<path d='M22 9v7'/>\n<path d='M3.304 13h6.392'/>\n<circle r='3.5' cy='12.5' cx='18.5'/>\n</svg>\n")


(def
 focus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='12'/>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n</svg>\n")


(def
 bluetooth
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 7 10 10-5 5V2l5 5L7 17'/>\n</svg>\n")


(def
 align-end-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='6' width='16'/>\n<rect rx='2' y='14' x='9' height='6' width='9'/>\n<path d='M22 22V2'/>\n</svg>\n")


(def
 square-split-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3'/>\n<path d='M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3'/>\n<line y2='12' y1='12' x2='20' x1='4'/>\n</svg>\n")


(def split-square-vertical square-split-vertical)


(def
 headphones
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'/>\n</svg>\n")


(def
 map-pin-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.752 11.901A7.78 7.78 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 19 19 0 0 0 .09-.077'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='m21.5 15.5-5 5'/>\n<path d='m21.5 20.5-5-5'/>\n</svg>\n")


(def
 table-properties
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 3v18'/>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M21 9H3'/>\n<path d='M21 15H3'/>\n</svg>\n")


(def
 git-pull-request-create-arrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='5'/>\n<path d='M5 9v12'/>\n<path d='m15 9-3-3 3-3'/>\n<path d='M12 6h5a2 2 0 0 1 2 2v3'/>\n<path d='M19 15v6'/>\n<path d='M22 18h-6'/>\n</svg>\n")


(def
 folder-git-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5'/>\n<circle r='2' cy='12' cx='13'/>\n<path d='M18 19c-2.8 0-5-2.2-5-5v8'/>\n<circle r='2' cy='19' cx='20'/>\n</svg>\n")


(def
 book-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13h.01'/>\n<path d='M12 6v3'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n</svg>\n")


(def
 square-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m15 9-6 6'/>\n<path d='m9 9 6 6'/>\n</svg>\n")


(def x-square square-x)


(def
 square-asterisk
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 8v8'/>\n<path d='m8.5 14 7-4'/>\n<path d='m8.5 10 7 4'/>\n</svg>\n")


(def asterisk-square square-asterisk)


(def
 rss
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 11a9 9 0 0 1 9 9'/>\n<path d='M4 4a16 16 0 0 1 16 16'/>\n<circle r='1' cy='19' cx='5'/>\n</svg>\n")


(def
 table-cells-split
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 15V9'/>\n<path d='M3 15h18'/>\n<path d='M3 9h18'/>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n</svg>\n")


(def
 flower-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1'/>\n<circle r='2' cy='8' cx='12'/>\n<path d='M12 10v12'/>\n<path d='M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z'/>\n<path d='M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z'/>\n</svg>\n")


(def
 landmark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 18v-7'/>\n<path d='M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z'/>\n<path d='M14 18v-7'/>\n<path d='M18 18v-7'/>\n<path d='M3 22h18'/>\n<path d='M6 18v-7'/>\n</svg>\n")


(def
 wifi
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h.01'/>\n<path d='M2 8.82a15 15 0 0 1 20 0'/>\n<path d='M5 12.859a10 10 0 0 1 14 0'/>\n<path d='M8.5 16.429a5 5 0 0 1 7 0'/>\n</svg>\n")


(def
 corner-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20v-7a4 4 0 0 0-4-4H4'/>\n<path d='M9 14 4 9l5-5'/>\n</svg>\n")


(def
 file-archive
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12v-1'/>\n<path d='M10 18v-2'/>\n<path d='M10 7V6'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01'/>\n<circle r='2' cy='20' cx='10'/>\n</svg>\n")


(def
 square-arrow-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 16V8h8'/>\n<path d='M16 16 8 8'/>\n</svg>\n")


(def arrow-up-left-square square-arrow-up-left)


(def
 arrow-down-from-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 3H5'/>\n<path d='M12 21V7'/>\n<path d='m6 15 6 6 6-6'/>\n</svg>\n")


(def
 watch
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10v2.2l1.6 1'/>\n<path d='m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05'/>\n<path d='m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05'/>\n<circle r='6' cy='12' cx='12'/>\n</svg>\n")


(def
 square-arrow-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m8 8 8 8'/>\n<path d='M16 8v8H8'/>\n</svg>\n")


(def arrow-down-right-square square-arrow-down-right)


(def
 scale
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z'/>\n<path d='m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z'/>\n<path d='M7 21h10'/>\n<path d='M12 3v18'/>\n<path d='M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'/>\n</svg>\n")


(def
 dice-6
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M16 8h.01'/>\n<path d='M16 12h.01'/>\n<path d='M16 16h.01'/>\n<path d='M8 8h.01'/>\n<path d='M8 12h.01'/>\n<path d='M8 16h.01'/>\n</svg>\n")


(def
 message-square-more
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M12 11h.01'/>\n<path d='M16 11h.01'/>\n<path d='M8 11h.01'/>\n</svg>\n")


(def
 ampersand
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.5 12c0 4.4-3.6 8-8 8A4.5 4.5 0 0 1 5 15.5c0-6 8-4 8-8.5a3 3 0 1 0-6 0c0 3 2.5 8.5 12 13'/>\n<path d='M16 12h3'/>\n</svg>\n")


(def
 dna-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2c-1.35 1.5-2.092 3-2.5 4.5L14 8'/>\n<path d='m17 6-2.891-2.891'/>\n<path d='M2 15c3.333-3 6.667-3 10-3'/>\n<path d='m2 2 20 20'/>\n<path d='m20 9 .891.891'/>\n<path d='M22 9c-1.5 1.35-3 2.092-4.5 2.5l-1-1'/>\n<path d='M3.109 14.109 4 15'/>\n<path d='m6.5 12.5 1 1'/>\n<path d='m7 18 2.891 2.891'/>\n<path d='M9 22c1.35-1.5 2.092-3 2.5-4.5L10 16'/>\n</svg>\n")


(def
 square-arrow-out-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6'/>\n<path d='m21 3-9 9'/>\n<path d='M15 3h6v6'/>\n</svg>\n")


(def arrow-up-right-from-square square-arrow-out-up-right)


(def
 hand-coins
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17'/>\n<path d='m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9'/>\n<path d='m2 16 6 6'/>\n<circle r='2.9' cy='9' cx='16'/>\n<circle r='3' cy='5' cx='6'/>\n</svg>\n")


(def
 roller-coaster
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 19V5'/>\n<path d='M10 19V6.8'/>\n<path d='M14 19v-7.8'/>\n<path d='M18 5v4'/>\n<path d='M18 19v-6'/>\n<path d='M22 19V9'/>\n<path d='M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65'/>\n</svg>\n")


(def
 monitor-smartphone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8'/>\n<path d='M10 19v-3.96 3.15'/>\n<path d='M7 19h5'/>\n<rect rx='2' y='12' x='16' height='10' width='6'/>\n</svg>\n")


(def
 venus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 15v7'/>\n<path d='M9 19h6'/>\n<circle r='6' cy='9' cx='12'/>\n</svg>\n")


(def
 git-commit-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v6'/>\n<circle r='3' cy='12' cx='12'/>\n<path d='M12 15v6'/>\n</svg>\n")


(def
 soap-dispenser-droplet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 2v4'/>\n<path d='M14 2H7a2 2 0 0 0-2 2'/>\n<path d='M19.29 14.76A6.67 6.67 0 0 1 17 11a6.6 6.6 0 0 1-2.29 3.76c-1.15.92-1.71 2.04-1.71 3.19 0 2.22 1.8 4.05 4 4.05s4-1.83 4-4.05c0-1.16-.57-2.26-1.71-3.19'/>\n<path d='M9.607 21H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3'/>\n</svg>\n")


(def
 info
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M12 16v-4'/>\n<path d='M12 8h.01'/>\n</svg>\n")


(def
 blocks
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2'/>\n<rect rx='1' height='8' width='8' y='2' x='14'/>\n</svg>\n")


(def
 popcorn
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4'/>\n<path d='M10 22 9 8'/>\n<path d='m14 22 1-14'/>\n<path d='M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z'/>\n</svg>\n")


(def
 file-badge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.072'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m6.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88'/>\n<circle r='3' cy='14' cx='5'/>\n</svg>\n")


(def
 badge-dollar-sign
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8'/>\n<path d='M12 18V6'/>\n</svg>\n")


(def
 user-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='9'/>\n<line y2='13' y1='8' x2='22' x1='17'/>\n<line y2='13' y1='8' x2='17' x1='22'/>\n</svg>\n")


(def
 navigation-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8.43 8.43 3 11l8 2 2 8 2.57-5.43'/>\n<path d='M17.39 11.73 22 2l-9.73 4.61'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 key-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z'/>\n<path d='m14 7 3 3'/>\n<path d='m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814'/>\n</svg>\n")


(def
 ticket-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='M9 12h6'/>\n</svg>\n")


(def
 dog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.25 16.25h1.5L12 17z'/>\n<path d='M16 14v.5'/>\n<path d='M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309'/>\n<path d='M8 14v.5'/>\n<path d='M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5'/>\n</svg>\n")


(def
 layout-panel-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='18' width='7'/>\n<rect rx='1' y='3' x='14' height='7' width='7'/>\n<rect rx='1' y='14' x='14' height='7' width='7'/>\n</svg>\n")


(def
 fan
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z'/>\n<path d='M12 12v.01'/>\n</svg>\n")


(def
 radio-receiver
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 16v2'/>\n<path d='M19 16v2'/>\n<rect rx='2' y='8' x='2' height='8' width='20'/>\n<path d='M18 12h.01'/>\n</svg>\n")


(def
 loader
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v4'/>\n<path d='m16.2 7.8 2.9-2.9'/>\n<path d='M18 12h4'/>\n<path d='m16.2 16.2 2.9 2.9'/>\n<path d='M12 18v4'/>\n<path d='m4.9 19.1 2.9-2.9'/>\n<path d='M2 12h4'/>\n<path d='m4.9 4.9 2.9 2.9'/>\n</svg>\n")


(def
 palette
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z'/>\n<circle fill='currentColor' r='.5' cy='6.5' cx='13.5'/>\n<circle fill='currentColor' r='.5' cy='10.5' cx='17.5'/>\n<circle fill='currentColor' r='.5' cy='12.5' cx='6.5'/>\n<circle fill='currentColor' r='.5' cy='7.5' cx='8.5'/>\n</svg>\n")


(def
 pilcrow-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 3v11'/>\n<path d='M14 9h-3a3 3 0 0 1 0-6h9'/>\n<path d='M18 3v11'/>\n<path d='M22 18H2l4-4'/>\n<path d='m6 22-4-4'/>\n</svg>\n")


(def
 diamond-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 8v8'/>\n<path d='M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def
 circle-arrow-out-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 12a10 10 0 1 1 10 10'/>\n<path d='m2 22 10-10'/>\n<path d='M8 22H2v-6'/>\n</svg>\n")


(def arrow-down-left-from-circle circle-arrow-out-down-left)


(def
 receipt-swiss-franc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M10 17V7h5'/>\n<path d='M10 11h4'/>\n<path d='M8 15h5'/>\n</svg>\n")


(def
 package-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v6'/>\n<path d='M16.76 3a2 2 0 0 1 1.8 1.1l2.23 4.479a2 2 0 0 1 .21.891V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.472a2 2 0 0 1 .211-.894L5.45 4.1A2 2 0 0 1 7.24 3z'/>\n<path d='M3.054 9.013h17.893'/>\n</svg>\n")


(def
 chart-no-axes-combined
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 16v5'/>\n<path d='M16 14v7'/>\n<path d='M20 10v11'/>\n<path d='m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15'/>\n<path d='M4 18v3'/>\n<path d='M8 14v7'/>\n</svg>\n")


(def
 funnel-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473'/>\n<path d='m16.5 3.5 5 5'/>\n<path d='m21.5 3.5-5 5'/>\n</svg>\n")


(def filter-x funnel-x)


(def
 case-upper
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 11h4.5a1 1 0 0 1 0 5h-4a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3a1 1 0 0 1 0 5'/>\n<path d='m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'/>\n<path d='M3.304 13h6.392'/>\n</svg>\n")


(def
 volleyball
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.1 7.1a16.55 16.55 0 0 1 10.9 4'/>\n<path d='M12 12a12.6 12.6 0 0 1-8.7 5'/>\n<path d='M16.8 13.6a16.55 16.55 0 0 1-9 7.5'/>\n<path d='M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10'/>\n<path d='M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 id-card-lanyard
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.5 8h-3'/>\n<path d='m15 2-1 2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3'/>\n<path d='M16.899 22A5 5 0 0 0 7.1 22'/>\n<path d='m9 2 3 6'/>\n<circle r='3' cy='15' cx='12'/>\n</svg>\n")


(def
 refresh-ccw
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/>\n<path d='M3 3v5h5'/>\n<path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16'/>\n<path d='M16 16h5v5'/>\n</svg>\n")


(def
 cloud-fog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='M16 17H7'/>\n<path d='M17 21H9'/>\n</svg>\n")


(def
 git-branch-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 3v12'/>\n<path d='M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'/>\n<path d='M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'/>\n<path d='M15 6a9 9 0 0 0-9 9'/>\n<path d='M18 15v6'/>\n<path d='M21 18h-6'/>\n</svg>\n")


(def
 file-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m14.5 12.5-5 5'/>\n<path d='m9.5 12.5 5 5'/>\n</svg>\n")


(def
 heading-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n<path d='M12 18V6'/>\n<path d='m17 12 3-2v8'/>\n</svg>\n")


(def
 hop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.82 16.12c1.69.6 3.91.79 5.18.85.55.03 1-.42.97-.97-.06-1.27-.26-3.5-.85-5.18'/>\n<path d='M11.5 6.5c1.64 0 5-.38 6.71-1.07.52-.2.55-.82.12-1.17A10 10 0 0 0 4.26 18.33c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.88.88 0 0 0 .73-.74c.3-2.14-.15-3.5-.61-4.88'/>\n<path d='M15.62 16.95c.2.85.62 2.76.5 4.28a.77.77 0 0 1-.9.7 16.64 16.64 0 0 1-4.08-1.36'/>\n<path d='M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .96-.96 17.68 17.68 0 0 0-.9-4.87'/>\n<path d='M16.94 15.62c.86.2 2.77.62 4.29.5a.77.77 0 0 0 .7-.9 16.64 16.64 0 0 0-1.36-4.08'/>\n<path d='M17.99 5.52a20.82 20.82 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-2.33.2-5.3-.32-8.27-1.57'/>\n<path d='M4.93 4.93 3 3a.7.7 0 0 1 0-1'/>\n<path d='M9.58 12.18c1.24 2.98 1.77 5.95 1.57 8.28a.8.8 0 0 1-1.13.68 20.82 20.82 0 0 1-4.5-3.15'/>\n</svg>\n")


(def
 folder-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='M12 10v6'/>\n<path d='m9 13 3-3 3 3'/>\n</svg>\n")


(def
 soup
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z'/>\n<path d='M7 21h10'/>\n<path d='M19.5 12 22 6'/>\n<path d='M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62'/>\n<path d='M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62'/>\n<path d='M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62'/>\n</svg>\n")


(def
 folder-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10v6'/>\n<path d='M9 13h6'/>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n</svg>\n")


(def
 badge-russian-ruble
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M9 16h5'/>\n<path d='M9 12h5a2 2 0 1 0 0-4h-3v9'/>\n</svg>\n")


(def
 git-merge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='18' cx='18'/>\n<circle r='3' cy='6' cx='6'/>\n<path d='M6 21V9a9 9 0 0 0 9 9'/>\n</svg>\n")


(def
 japanese-yen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 9.5V21m0-11.5L6 3m6 6.5L18 3'/>\n<path d='M6 15h12'/>\n<path d='M6 11h12'/>\n</svg>\n")


(def
 grip-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='9' cx='12'/>\n<circle r='1' cy='9' cx='19'/>\n<circle r='1' cy='9' cx='5'/>\n<circle r='1' cy='15' cx='12'/>\n<circle r='1' cy='15' cx='19'/>\n<circle r='1' cy='15' cx='5'/>\n</svg>\n")


(def
 list-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 12H3'/>\n<path d='M16 6H3'/>\n<path d='M16 18H3'/>\n<path d='m19 10-4 4'/>\n<path d='m15 10 4 4'/>\n</svg>\n")


(def
 shield-half
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M12 22V2'/>\n</svg>\n")


(def
 mic
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 19v3'/>\n<path d='M19 10v2a7 7 0 0 1-14 0v-2'/>\n<rect rx='3' height='13' width='6' y='2' x='9'/>\n</svg>\n")


(def
 venetian-mask
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 11c-1.5 0-2.5.5-3 2'/>\n<path d='M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z'/>\n<path d='M6 11c1.5 0 2.5.5 3 2'/>\n</svg>\n")


(def
 rainbow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a10 10 0 0 0-20 0'/>\n<path d='M6 17a6 6 0 0 1 12 0'/>\n<path d='M10 17a2 2 0 0 1 4 0'/>\n</svg>\n")


(def
 git-pull-request-arrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='5'/>\n<path d='M5 9v12'/>\n<circle r='3' cy='18' cx='19'/>\n<path d='m15 9-3-3 3-3'/>\n<path d='M12 6h5a2 2 0 0 1 2 2v7'/>\n</svg>\n")


(def
 copy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 smile-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 11v1a10 10 0 1 1-9-10'/>\n<path d='M8 14s1.5 2 4 2 4-2 4-2'/>\n<line y2='9' y1='9' x2='9.01' x1='9'/>\n<line y2='9' y1='9' x2='15.01' x1='15'/>\n<path d='M16 5h6'/>\n<path d='M19 2v6'/>\n</svg>\n")


(def
 fish
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z'/>\n<path d='M18 12v.5'/>\n<path d='M16 17.93a9.77 9.77 0 0 1 0-11.86'/>\n<path d='M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33'/>\n<path d='M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4'/>\n<path d='m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98'/>\n</svg>\n")


(def
 move-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 11V5H11'/>\n<path d='M5 5L19 19'/>\n</svg>\n")


(def
 card-sim
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 14v4'/>\n<path d='M14.172 2a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 7.828V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'/>\n<path d='M8 14h8'/>\n<rect rx='1' height='8' width='8' y='10' x='8'/>\n</svg>\n")


(def
 list-tree
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12h-8'/>\n<path d='M21 6H8'/>\n<path d='M21 18h-8'/>\n<path d='M3 6v4c0 1.1.9 2 2 2h3'/>\n<path d='M3 10v6c0 1.1.9 2 2 2h3'/>\n</svg>\n")


(def
 zoom-in
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='11' cx='11'/>\n<line y2='16.65' y1='21' x2='16.65' x1='21'/>\n<line y2='14' y1='8' x2='11' x1='11'/>\n<line y2='11' y1='11' x2='14' x1='8'/>\n</svg>\n")


(def
 circle-chevron-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m8 14 4-4 4 4'/>\n</svg>\n")


(def chevron-up-circle circle-chevron-up)


(def
 circle-arrow-out-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22a10 10 0 1 1 10-10'/>\n<path d='M22 22 12 12'/>\n<path d='M22 16v6h-6'/>\n</svg>\n")


(def arrow-down-right-from-circle circle-arrow-out-down-right)


(def
 search-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m8 11 2 2 4-4'/>\n<circle r='8' cy='11' cx='11'/>\n<path d='m21 21-4.3-4.3'/>\n</svg>\n")


(def
 signature
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284'/>\n<path d='M3 21h18'/>\n</svg>\n")


(def
 arrow-down-to-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17V3'/>\n<path d='m6 11 6 6 6-6'/>\n<path d='M19 21H5'/>\n</svg>\n")


(def
 battery-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9v6'/>\n<path d='M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605'/>\n<path d='M22 14v-4'/>\n<path d='M7 12h6'/>\n<path d='M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606'/>\n</svg>\n")


(def
 glasses
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='15' cx='6'/>\n<circle r='4' cy='15' cx='18'/>\n<path d='M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2'/>\n<path d='M2.5 13 5 7c.7-1.3 1.4-2 3-2'/>\n<path d='M21.5 13 19 7c-.7-1.3-1.5-2-3-2'/>\n</svg>\n")


(def
 coins
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='6' cy='8' cx='8'/>\n<path d='M18.09 10.37A6 6 0 1 1 10.34 18'/>\n<path d='M7 6h1v4'/>\n<path d='m16.71 13.88.7.71-2.82 2.82'/>\n</svg>\n")


(def
 align-start-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='14' x='6' height='6' width='9'/>\n<rect rx='2' y='4' x='6' height='6' width='16'/>\n<path d='M2 2v20'/>\n</svg>\n")


(def
 arrows-up-from-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m4 6 3-3 3 3'/>\n<path d='M7 17V3'/>\n<path d='m14 6 3-3 3 3'/>\n<path d='M17 17V3'/>\n<path d='M4 21h16'/>\n</svg>\n")


(def
 user-star
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z'/>\n<path d='M8 15H7a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='10'/>\n</svg>\n")


(def
 snail
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0'/>\n<circle r='8' cy='13' cx='10'/>\n<path d='M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6'/>\n<path d='M18 3 19.1 5.2'/>\n<path d='M22 3 20.9 5.2'/>\n</svg>\n")


(def
 library-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='18' width='8'/>\n<path d='M7 3v18'/>\n<path d='M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z'/>\n</svg>\n")


(def
 bookmark-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z'/>\n<path d='m14.5 7.5-5 5'/>\n<path d='m9.5 7.5 5 5'/>\n</svg>\n")


(def
 book-key
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 3 1 1'/>\n<path d='m20 2-4.5 4.5'/>\n<path d='M20 7.898V21a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2h7.844'/>\n<circle r='2' cy='8' cx='14'/>\n</svg>\n")


(def
 panel-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 3v18'/>\n</svg>\n")


(def sidebar panel-left)


(def
 test-tube-diagonal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3'/>\n<path d='m16 2 6 6'/>\n<path d='M12 16H4'/>\n</svg>\n")


(def test-tube-2 test-tube-diagonal)


(def
 origami
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025'/>\n<path d='m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009'/>\n<path d='m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027'/>\n</svg>\n")


(def
 square-library
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 7v10'/>\n<path d='M11 7v10'/>\n<path d='m15 7 2 10'/>\n</svg>\n")


(def library-square square-library)


(def
 message-circle-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 20 20'/>\n<path d='M4.93 4.929a10 10 0 0 0-1.938 11.412 2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 0 0 11.302-1.989'/>\n<path d='M8.35 2.69A10 10 0 0 1 21.3 15.65'/>\n</svg>\n")


(def
 square-user-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 21a6 6 0 0 0-12 0'/>\n<circle r='4' cy='11' cx='12'/>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n</svg>\n")


(def user-square-2 square-user-round)


(def
 wand-sparkles
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72'/>\n<path d='m14 7 3 3'/>\n<path d='M5 6v4'/>\n<path d='M19 14v4'/>\n<path d='M10 2v2'/>\n<path d='M7 8H3'/>\n<path d='M21 16h-4'/>\n<path d='M11 3H9'/>\n</svg>\n")


(def wand-2 wand-sparkles)


(def
 file-type-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M2 13v-1h6v1'/>\n<path d='M5 12v6'/>\n<path d='M4 18h2'/>\n</svg>\n")


(def
 text-quote
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 6H3'/>\n<path d='M21 12H8'/>\n<path d='M21 18H8'/>\n<path d='M3 12v6'/>\n</svg>\n")


(def
 caravan
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2'/>\n<path d='M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2'/>\n<path d='M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9'/>\n<circle r='2' cy='19' cx='8'/>\n</svg>\n")


(def
 badge-cent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M12 7v10'/>\n<path d='M15.4 10a4 4 0 1 0 0 4'/>\n</svg>\n")


(def
 panel-top-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M14 9h1'/>\n<path d='M19 9h2'/>\n<path d='M3 9h2'/>\n<path d='M9 9h1'/>\n</svg>\n")


(def panel-top-inactive panel-top-dashed)


(def
 notebook-tabs
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 6h4'/>\n<path d='M2 10h4'/>\n<path d='M2 14h4'/>\n<path d='M2 18h4'/>\n<rect rx='2' y='2' x='4' height='20' width='16'/>\n<path d='M15 2v20'/>\n<path d='M15 7h5'/>\n<path d='M15 12h5'/>\n<path d='M15 17h5'/>\n</svg>\n")


(def
 text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 18H3'/>\n<path d='M17 6H3'/>\n<path d='M21 12H3'/>\n</svg>\n")


(def
 test-tubes
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2'/>\n<path d='M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2'/>\n<path d='M3 2h7'/>\n<path d='M14 2h7'/>\n<path d='M9 16H4'/>\n<path d='M20 16h-5'/>\n</svg>\n")


(def
 fire-extinguisher
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5'/>\n<path d='M9 18h8'/>\n<path d='M18 3h-3'/>\n<path d='M11 3a6 6 0 0 0-6 6v11'/>\n<path d='M5 13h4'/>\n<path d='M17 10a4 4 0 0 0-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2Z'/>\n</svg>\n")


(def
 egg-fried
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3.5' cy='12.5' cx='11.5'/>\n<path d='M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z'/>\n</svg>\n")


(def
 flag-triangle-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 22V2.8a.8.8 0 0 0-1.17-.71L5.45 7.78a.8.8 0 0 0 0 1.44L18 15.5'/>\n</svg>\n")


(def
 align-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12H9'/>\n<path d='M21 18H7'/>\n<path d='M21 6H3'/>\n</svg>\n")


(def
 text-cursor
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1'/>\n<path d='M7 22h1a4 4 0 0 0 4-4v-1'/>\n<path d='M7 2h1a4 4 0 0 1 4 4v1'/>\n</svg>\n")


(def
 image
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<circle r='2' cy='9' cx='9'/>\n<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/>\n</svg>\n")


(def
 file-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17h.01'/>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/>\n<path d='M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3'/>\n</svg>\n")


(def file-question file-question-mark)


(def
 panel-bottom-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 15h18'/>\n<path d='m9 10 3-3 3 3'/>\n</svg>\n")


(def
 maximize-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 3h6v6'/>\n<path d='m21 3-7 7'/>\n<path d='m3 21 7-7'/>\n<path d='M9 21H3v-6'/>\n</svg>\n")


(def
 vector-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.5 7a24 24 0 0 1 0 10'/>\n<path d='M4.5 7a24 24 0 0 0 0 10'/>\n<path d='M7 19.5a24 24 0 0 0 10 0'/>\n<path d='M7 4.5a24 24 0 0 1 10 0'/>\n<rect rx='1' height='5' width='5' y='17' x='17'/>\n<rect rx='1' height='5' width='5' y='2' x='17'/>\n<rect rx='1' height='5' width='5' y='17' x='2'/>\n<rect rx='1' height='5' width='5' y='2' x='2'/>\n</svg>\n")


(def
 lightbulb
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'/>\n<path d='M9 18h6'/>\n<path d='M10 22h4'/>\n</svg>\n")


(def
 server-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5'/>\n<path d='M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z'/>\n<path d='M22 17v-1a2 2 0 0 0-2-2h-1'/>\n<path d='M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z'/>\n<path d='M6 18h.01'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 arrow-big-left-dash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z'/>\n<path d='M20 9v6'/>\n</svg>\n")


(def
 image-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z'/>\n<path d='M21 12.17V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6'/>\n<path d='m6 21 5-5'/>\n<circle r='2' cy='9' cx='9'/>\n</svg>\n")


(def
 sunset
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10V2'/>\n<path d='m4.93 10.93 1.41 1.41'/>\n<path d='M2 18h2'/>\n<path d='M20 18h2'/>\n<path d='m19.07 10.93-1.41 1.41'/>\n<path d='M22 22H2'/>\n<path d='m16 6-4 4-4-4'/>\n<path d='M16 18a4 4 0 0 0-8 0'/>\n</svg>\n")


(def
 save
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'/>\n<path d='M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7'/>\n<path d='M7 3v4a1 1 0 0 0 1 1h7'/>\n</svg>\n")


(def
 smile
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M8 14s1.5 2 4 2 4-2 4-2'/>\n<line y2='9' y1='9' x2='9.01' x1='9'/>\n<line y2='9' y1='9' x2='15.01' x1='15'/>\n</svg>\n")


(def
 search-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13 13.5 2-2.5-2-2.5'/>\n<path d='m21 21-4.3-4.3'/>\n<path d='M9 8.5 7 11l2 2.5'/>\n<circle r='8' cy='11' cx='11'/>\n</svg>\n")


(def
 lamp
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12v6'/>\n<path d='M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z'/>\n<path d='M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z'/>\n</svg>\n")


(def
 siren
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 18v-6a5 5 0 1 1 10 0v6'/>\n<path d='M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z'/>\n<path d='M21 12h1'/>\n<path d='M18.5 4.5 18 5'/>\n<path d='M2 12h1'/>\n<path d='M12 2v1'/>\n<path d='m4.929 4.929.707.707'/>\n<path d='M12 12v6'/>\n</svg>\n")


(def
 images
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16'/>\n<path d='M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2'/>\n<circle fill='currentColor' r='1' cy='7' cx='13'/>\n<rect rx='2' height='14' width='14' y='2' x='8'/>\n</svg>\n")


(def
 scan
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n</svg>\n")


(def
 navigation
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polygon points='3 11 22 2 13 21 11 13 3 11'/>\n</svg>\n")


(def
 circle-pound-sterling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 16V9.5a1 1 0 0 1 5 0'/>\n<path d='M8 12h4'/>\n<path d='M8 16h7'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 cloud-lightning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973'/>\n<path d='m13 12-3 5h4l-3 5'/>\n</svg>\n")


(def
 turkish-lira
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 4 5 9'/>\n<path d='m15 8.5-10 5'/>\n<path d='M18 12a9 9 0 0 1-9 9V3'/>\n</svg>\n")


(def
 user-round-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21a8 8 0 0 1 10.821-7.487'/>\n<path d='M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n<circle r='5' cy='8' cx='10'/>\n</svg>\n")


(def
 square-dashed-top-solid
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 21h1'/>\n<path d='M21 14v1'/>\n<path d='M21 19a2 2 0 0 1-2 2'/>\n<path d='M21 9v1'/>\n<path d='M3 14v1'/>\n<path d='M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2'/>\n<path d='M3 9v1'/>\n<path d='M5 21a2 2 0 0 1-2-2'/>\n<path d='M9 21h1'/>\n</svg>\n")


(def
 citrus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z'/>\n<path d='M19.65 15.66A8 8 0 0 1 8.35 4.34'/>\n<path d='m14 10-5.5 5.5'/>\n<path d='M14 17.85V10H6.15'/>\n</svg>\n")


(def
 message-square-diff
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M10 15h4'/>\n<path d='M10 9h4'/>\n<path d='M12 7v4'/>\n</svg>\n")


(def
 bell-electric
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.518 17.347A7 7 0 0 1 14 19'/>\n<path d='M18.8 4A11 11 0 0 1 20 9'/>\n<path d='M9 9h.01'/>\n<circle r='2' cy='16' cx='20'/>\n<circle r='7' cy='9' cx='9'/>\n<rect rx='2' height='6' width='10' y='16' x='4'/>\n</svg>\n")


(def
 ham
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856'/>\n<path d='M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288'/>\n<path d='M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025'/>\n<path d='m8.5 16.5-1-1'/>\n</svg>\n")


(def
 square-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n<rect rx='1' height='8' width='8' y='8' x='8'/>\n</svg>\n")


(def
 monitor-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n<rect rx='2' height='14' width='20' y='3' x='2'/>\n</svg>\n")


(def
 barrel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 3a41 41 0 0 0 0 18'/>\n<path d='M14 3a41 41 0 0 1 0 18'/>\n<path d='M17 3a2 2 0 0 1 1.68.92 15.25 15.25 0 0 1 0 16.16A2 2 0 0 1 17 21H7a2 2 0 0 1-1.68-.92 15.25 15.25 0 0 1 0-16.16A2 2 0 0 1 7 3z'/>\n<path d='M3.84 17h16.32'/>\n<path d='M3.84 7h16.32'/>\n</svg>\n")


(def
 badge-pound-sterling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M8 12h4'/>\n<path d='M10 16V9.5a2.5 2.5 0 0 1 5 0'/>\n<path d='M8 16h7'/>\n</svg>\n")


(def
 hard-drive-upload
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 6-4-4-4 4'/>\n<path d='M12 2v8'/>\n<rect rx='2' y='14' x='2' height='8' width='20'/>\n<path d='M6 18h.01'/>\n<path d='M10 18h.01'/>\n</svg>\n")


(def
 app-window
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='16' width='20' y='4' x='2'/>\n<path d='M10 4v4'/>\n<path d='M2 8h20'/>\n<path d='M6 4v4'/>\n</svg>\n")


(def
 badge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n</svg>\n")


(def
 theater
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 10s3-3 3-8'/>\n<path d='M22 10s-3-3-3-8'/>\n<path d='M10 2c0 4.4-3.6 8-8 8'/>\n<path d='M14 2c0 4.4 3.6 8 8 8'/>\n<path d='M2 10s2 2 2 5'/>\n<path d='M22 10s-2 2-2 5'/>\n<path d='M8 15h8'/>\n<path d='M2 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1'/>\n<path d='M14 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1'/>\n</svg>\n")


(def
 paperclip
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551'/>\n</svg>\n")


(def
 wifi-sync
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5'/>\n<path d='M11.965 14.105h4'/>\n<path d='M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5'/>\n<path d='M2 8.82a15 15 0 0 1 20 0'/>\n<path d='M21.965 22.105v-4'/>\n<path d='M5 12.86a10 10 0 0 1 3-2.032'/>\n<path d='M8.5 16.429h.01'/>\n</svg>\n")


(def
 heading-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n<path d='M12 18V6'/>\n<path d='M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1'/>\n</svg>\n")


(def
 square-scissors
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='2' height='20' width='20'/>\n<circle r='2' cy='8' cx='8'/>\n<path d='M9.414 9.414 12 12'/>\n<path d='M14.8 14.8 18 18'/>\n<circle r='2' cy='16' cx='8'/>\n<path d='m18 6-8.586 8.586'/>\n</svg>\n")


(def scissors-square square-scissors)


(def
 fast-forward
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z'/>\n<path d='M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z'/>\n</svg>\n")


(def
 flag-triangle-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5'/>\n</svg>\n")


(def
 calendar-range
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M16 2v4'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n<path d='M17 14h-6'/>\n<path d='M13 18H7'/>\n<path d='M7 14h.01'/>\n<path d='M17 18h.01'/>\n</svg>\n")


(def
 contact-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 2v2'/>\n<path d='M17.915 22a6 6 0 0 0-12 0'/>\n<path d='M8 2v2'/>\n<circle r='4' cy='12' cx='12'/>\n<rect rx='2' height='18' width='18' y='4' x='3'/>\n</svg>\n")


(def contact-2 contact-round)


(def
 syringe
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 2 4 4'/>\n<path d='m17 7 3-3'/>\n<path d='M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5'/>\n<path d='m9 11 4 4'/>\n<path d='m5 19-3 3'/>\n<path d='m14 4 6 6'/>\n</svg>\n")


(def
 spotlight
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.295 19.562 16 22'/>\n<path d='m17 16 3.758 2.098'/>\n<path d='m19 12.5 3.026-.598'/>\n<path d='M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z'/>\n<path d='M8 9V2'/>\n</svg>\n")


(def
 search-slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13.5 8.5-5 5'/>\n<circle r='8' cy='11' cx='11'/>\n<path d='m21 21-4.3-4.3'/>\n</svg>\n")


(def
 sticker
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z'/>\n<path d='M14 3v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 13h.01'/>\n<path d='M16 13h.01'/>\n<path d='M10 16s.8 1 2 1c1.3 0 2-1 2-1'/>\n</svg>\n")


(def
 award
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526'/>\n<circle r='6' cy='8' cx='12'/>\n</svg>\n")


(def
 panel-right-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M15 14v1'/>\n<path d='M15 19v2'/>\n<path d='M15 3v2'/>\n<path d='M15 9v1'/>\n</svg>\n")


(def panel-right-inactive panel-right-dashed)


(def
 squares-exclude
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0'/>\n<path d='M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2'/>\n</svg>\n")


(def
 zoom-out
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='11' cx='11'/>\n<line y2='16.65' y1='21' x2='16.65' x1='21'/>\n<line y2='11' y1='11' x2='14' x1='8'/>\n</svg>\n")


(def
 square-arrow-out-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6'/>\n<path d='m3 3 9 9'/>\n<path d='M3 9V3h6'/>\n</svg>\n")


(def arrow-up-left-from-square square-arrow-out-up-left)


(def
 box
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'/>\n<path d='m3.3 7 8.7 5 8.7-5'/>\n<path d='M12 22V12'/>\n</svg>\n")


(def
 thumbs-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 10v12'/>\n<path d='M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z'/>\n</svg>\n")


(def
 superscript
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m4 19 8-8'/>\n<path d='m12 19-8-8'/>\n<path d='M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06'/>\n</svg>\n")


(def
 ticket-percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='M9 9h.01'/>\n<path d='m15 9-6 6'/>\n<path d='M15 15h.01'/>\n</svg>\n")


(def
 battery-low
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 14v-4'/>\n<path d='M6 14v-4'/>\n<rect rx='2' height='12' width='16' y='6' x='2'/>\n</svg>\n")


(def
 touchpad
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M2 14h20'/>\n<path d='M12 20v-6'/>\n</svg>\n")


(def
 speech
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20'/>\n<path d='M19.8 17.8a7.5 7.5 0 0 0 .003-10.603'/>\n<path d='M17 15a3.5 3.5 0 0 0-.025-4.975'/>\n</svg>\n")


(def
 percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='19' y1='5' x2='5' x1='19'/>\n<circle r='2.5' cy='6.5' cx='6.5'/>\n<circle r='2.5' cy='17.5' cx='17.5'/>\n</svg>\n")


(def
 square-chevron-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m16 10-4 4-4-4'/>\n</svg>\n")


(def chevron-down-square square-chevron-down)


(def
 square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n</svg>\n")


(def
 crown
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z'/>\n<path d='M5 21h14'/>\n</svg>\n")


(def
 bluetooth-searching
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 7 10 10-5 5V2l5 5L7 17'/>\n<path d='M20.83 14.83a4 4 0 0 0 0-5.66'/>\n<path d='M18 12h.01'/>\n</svg>\n")


(def
 timer-reset
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2h4'/>\n<path d='M12 14v-4'/>\n<path d='M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6'/>\n<path d='M9 17H4v5'/>\n</svg>\n")


(def
 stethoscope
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 2v2'/>\n<path d='M5 2v2'/>\n<path d='M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1'/>\n<path d='M8 15a6 6 0 0 0 12 0v-3'/>\n<circle r='2' cy='10' cx='20'/>\n</svg>\n")


(def
 eclipse
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M12 2a7 7 0 1 0 10 10'/>\n</svg>\n")


(def
 donut
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.5 10a2.5 2.5 0 0 1-2.4-3H18a2.95 2.95 0 0 1-2.6-4.4 10 10 0 1 0 6.3 7.1c-.3.2-.8.3-1.2.3'/>\n<circle r='3' cy='12' cx='12'/>\n</svg>\n")


(def
 candy-cane
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2Z'/>\n<path d='M17.75 7 15 2.1'/>\n<path d='M10.9 4.8 13 9'/>\n<path d='m7.9 9.7 2 4.4'/>\n<path d='M4.9 14.7 7 18.9'/>\n</svg>\n")


(def
 play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z'/>\n</svg>\n")


(def
 folder-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417'/>\n<path d='M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z'/>\n</svg>\n")


(def
 pen-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982'/>\n<path d='m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 file-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m9 15 2 2 4-4'/>\n</svg>\n")


(def
 leafy-green
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22'/>\n<path d='M2 22 17 7'/>\n</svg>\n")


(def
 circle-small
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='6' cy='12' cx='12'/>\n</svg>\n")


(def
 tangent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='4' cx='17'/>\n<path d='M15.59 5.41 5.41 15.59'/>\n<circle r='2' cy='17' cx='4'/>\n<path d='M12 22s-4-9-1.5-11.5S22 12 22 12'/>\n</svg>\n")


(def
 book-audio
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v7'/>\n<path d='M16 8v3'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M8 8v3'/>\n</svg>\n")


(def
 table
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v18'/>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n<path d='M3 15h18'/>\n</svg>\n")


(def
 split
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3h5v5'/>\n<path d='M8 3H3v5'/>\n<path d='M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3'/>\n<path d='m15 9 6-6'/>\n</svg>\n")


(def
 send
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z'/>\n<path d='m21.854 2.147-10.94 10.939'/>\n</svg>\n")


(def
 barcode
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 5v14'/>\n<path d='M8 5v14'/>\n<path d='M12 5v14'/>\n<path d='M17 5v14'/>\n<path d='M21 5v14'/>\n</svg>\n")


(def
 videotape
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M2 8h20'/>\n<circle r='2' cy='14' cx='8'/>\n<path d='M8 12h8'/>\n<circle r='2' cy='14' cx='16'/>\n</svg>\n")


(def
 scroll
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 17V5a2 2 0 0 0-2-2H4'/>\n<path d='M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'/>\n</svg>\n")


(def
 phone-call
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 2a9 9 0 0 1 9 9'/>\n<path d='M13 6a5 5 0 0 1 5 5'/>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 columns-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7.5 3v18'/>\n<path d='M12 3v18'/>\n<path d='M16.5 3v18'/>\n</svg>\n")


(def
 rectangle-goggles
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8l-1.6-2.13a1 1 0 0 0-1.6 0L9.6 17.2A2 2 0 0 1 8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z'/>\n</svg>\n")


(def
 baggage-claim
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2'/>\n<path d='M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10'/>\n<rect rx='1' y='6' x='8' height='8' width='13'/>\n<circle r='2' cy='20' cx='18'/>\n<circle r='2' cy='20' cx='9'/>\n</svg>\n")


(def
 message-square-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 8.5V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H10'/>\n<path d='M20 15v-2a2 2 0 0 0-4 0v2'/>\n<rect rx='1' height='5' width='8' y='15' x='14'/>\n</svg>\n")


(def
 circle-arrow-out-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 12A10 10 0 1 1 12 2'/>\n<path d='M22 2 12 12'/>\n<path d='M16 2h6v6'/>\n</svg>\n")


(def arrow-up-right-from-circle circle-arrow-out-up-right)


(def
 radiation
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12h.01'/>\n<path d='M14 15.4641a4 4 0 0 1-4 0L7.52786 19.74597 A 1 1 0 0 0 7.99303 21.16211 10 10 0 0 0 16.00697 21.16211 1 1 0 0 0 16.47214 19.74597z'/>\n<path d='M16 12a4 4 0 0 0-2-3.464l2.472-4.282a1 1 0 0 1 1.46-.305 10 10 0 0 1 4.006 6.94A1 1 0 0 1 21 12z'/>\n<path d='M8 12a4 4 0 0 1 2-3.464L7.528 4.254a1 1 0 0 0-1.46-.305 10 10 0 0 0-4.006 6.94A1 1 0 0 0 3 12z'/>\n</svg>\n")


(def
 speaker
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='4' height='20' width='16'/>\n<path d='M12 6h.01'/>\n<circle r='4' cy='14' cx='12'/>\n<path d='M12 14h.01'/>\n</svg>\n")


(def
 user-round-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='5' cy='8' cx='10'/>\n<path d='M2 21a8 8 0 0 1 10.434-7.62'/>\n<circle r='3' cy='18' cx='18'/>\n<path d='m22 22-1.9-1.9'/>\n</svg>\n")


(def
 undo-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 17a9 9 0 0 0-15-6.7L3 13'/>\n<path d='M3 7v6h6'/>\n<circle r='1' cy='17' cx='12'/>\n</svg>\n")


(def
 facebook
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'/>\n</svg>\n")


(def
 codesandbox
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>\n<polyline points='7.5 4.21 12 6.81 16.5 4.21'/>\n<polyline points='7.5 19.79 7.5 14.6 3 12'/>\n<polyline points='21 12 16.5 14.6 16.5 19.79'/>\n<polyline points='3.27 6.96 12 12.01 20.73 6.96'/>\n<line y2='12' y1='22.08' x2='12' x1='12'/>\n</svg>\n")


(def
 file-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M12 18v-6'/>\n<path d='m9 15 3 3 3-3'/>\n</svg>\n")


(def
 badge-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='m9 12 2 2 4-4'/>\n</svg>\n")


(def verified badge-check)


(def
 baby
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5'/>\n<path d='M15 12h.01'/>\n<path d='M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1'/>\n<path d='M9 12h.01'/>\n</svg>\n")


(def
 smartphone-charging
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='2' x='5' height='20' width='14'/>\n<path d='M12.667 8 10 12h4l-2.667 4'/>\n</svg>\n")


(def
 book-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v6'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M9 10h6'/>\n</svg>\n")


(def
 unplug
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 5 3-3'/>\n<path d='m2 22 3-3'/>\n<path d='M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z'/>\n<path d='M7.5 13.5 10 11'/>\n<path d='M10.5 16.5 13 14'/>\n<path d='m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z'/>\n</svg>\n")


(def
 heading-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n<path d='M12 18V6'/>\n<path d='M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2'/>\n<path d='M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2'/>\n</svg>\n")


(def
 circle-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/>\n<path d='M12 17h.01'/>\n</svg>\n")


(def help-circle circle-question-mark)


(def circle-help circle-question-mark)


(def
 folder-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10.5 8 13l2 2.5'/>\n<path d='m14 10.5 2 2.5-2 2.5'/>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z'/>\n</svg>\n")


(def
 bluetooth-connected
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 7 10 10-5 5V2l5 5L7 17'/>\n<line y2='12' y1='12' x2='21' x1='18'/>\n<line y2='12' y1='12' x2='6' x1='3'/>\n</svg>\n")


(def
 table-of-contents
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12H3'/>\n<path d='M16 18H3'/>\n<path d='M16 6H3'/>\n<path d='M21 12h.01'/>\n<path d='M21 18h.01'/>\n<path d='M21 6h.01'/>\n</svg>\n")


(def
 camera
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'/>\n<circle r='3' cy='13' cx='12'/>\n</svg>\n")


(def
 link-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 17H7A5 5 0 0 1 7 7h2'/>\n<path d='M15 7h2a5 5 0 1 1 0 10h-2'/>\n<line y2='12' y1='12' x2='16' x1='8'/>\n</svg>\n")


(def
 printer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/>\n<path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/>\n<rect rx='1' height='8' width='12' y='14' x='6'/>\n</svg>\n")


(def
 list-collapse
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12h11'/>\n<path d='M10 18h11'/>\n<path d='M10 6h11'/>\n<path d='m3 10 3-3-3-3'/>\n<path d='m3 20 3-3-3-3'/>\n</svg>\n")


(def
 workflow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='8' width='8'/>\n<path d='M7 11v4a2 2 0 0 0 2 2h4'/>\n<rect rx='2' y='13' x='13' height='8' width='8'/>\n</svg>\n")


(def
 trees
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z'/>\n<path d='M7 16v6'/>\n<path d='M13 19v3'/>\n<path d='M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5'/>\n</svg>\n")


(def
 panel-left-close
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 3v18'/>\n<path d='m16 15-3-3 3-3'/>\n</svg>\n")


(def sidebar-close panel-left-close)


(def
 git-graph
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='5'/>\n<path d='M5 9v6'/>\n<circle r='3' cy='18' cx='5'/>\n<path d='M12 3v18'/>\n<circle r='3' cy='6' cx='19'/>\n<path d='M16 15.7A9 9 0 0 0 19 9'/>\n</svg>\n")


(def
 redo
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 7v6h-6'/>\n<path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7'/>\n</svg>\n")


(def
 captions-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 5H19a2 2 0 0 1 2 2v8.5'/>\n<path d='M17 11h-.5'/>\n<path d='M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2'/>\n<path d='m2 2 20 20'/>\n<path d='M7 11h4'/>\n<path d='M7 15h2.5'/>\n</svg>\n")


(def
 club
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.28 9.05a5.5 5.5 0 1 0-10.56 0A5.5 5.5 0 1 0 12 17.66a5.5 5.5 0 1 0 5.28-8.6Z'/>\n<path d='M12 17.66L12 22'/>\n</svg>\n")


(def
 folder-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 13h6'/>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n</svg>\n")


(def
 move-diagonal-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 13v6h-6'/>\n<path d='M5 11V5h6'/>\n<path d='m5 5 14 14'/>\n</svg>\n")


(def
 combine
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 18H5a3 3 0 0 1-3-3v-1'/>\n<path d='M14 2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2'/>\n<path d='M20 2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2'/>\n<path d='m7 21 3-3-3-3'/>\n<rect rx='2' height='8' width='8' y='14' x='14'/>\n<rect rx='2' height='8' width='8' y='2' x='2'/>\n</svg>\n")


(def
 arrow-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 7h10v10'/>\n<path d='M7 17 17 7'/>\n</svg>\n")


(def
 truck
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'/>\n<path d='M15 18H9'/>\n<path d='M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14'/>\n<circle r='2' cy='18' cx='17'/>\n<circle r='2' cy='18' cx='7'/>\n</svg>\n")


(def
 layout-panel-top
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='7' width='18'/>\n<rect rx='1' y='14' x='3' height='7' width='7'/>\n<rect rx='1' y='14' x='14' height='7' width='7'/>\n</svg>\n")


(def
 life-buoy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m4.93 4.93 4.24 4.24'/>\n<path d='m14.83 9.17 4.24-4.24'/>\n<path d='m14.83 14.83 4.24 4.24'/>\n<path d='m9.17 14.83-4.24 4.24'/>\n<circle r='4' cy='12' cx='12'/>\n</svg>\n")


(def
 user-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='7' cx='10'/>\n<path d='M10.3 15H7a4 4 0 0 0-4 4v2'/>\n<circle r='3' cy='17' cx='17'/>\n<path d='m21 21-1.9-1.9'/>\n</svg>\n")


(def
 square-user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2'/>\n</svg>\n")


(def user-square square-user)


(def
 table-columns-split
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 14v2'/>\n<path d='M14 20v2'/>\n<path d='M14 2v2'/>\n<path d='M14 8v2'/>\n<path d='M2 15h8'/>\n<path d='M2 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2'/>\n<path d='M2 9h8'/>\n<path d='M22 15h-4'/>\n<path d='M22 3h-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2'/>\n<path d='M22 9h-4'/>\n<path d='M5 3v18'/>\n</svg>\n")


(def
 between-horizontal-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='8' height='7' width='13'/>\n<path d='m2 9 3 3-3 3'/>\n<rect rx='1' y='14' x='8' height='7' width='13'/>\n</svg>\n")


(def between-horizonal-start between-horizontal-start)


(def
 pickaxe
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999'/>\n<path d='M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024'/>\n<path d='M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069'/>\n<path d='M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z'/>\n</svg>\n")


(def
 map-pin-x-inside
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'/>\n<path d='m14.5 7.5-5 5'/>\n<path d='m9.5 7.5 5 5'/>\n</svg>\n")


(def
 package-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14'/>\n<path d='m7.5 4.27 9 5.15'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<line y2='12' y1='22' x2='12' x1='12'/>\n<path d='m17 13 5 5m-5 0 5-5'/>\n</svg>\n")


(def
 pen-tool
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z'/>\n<path d='m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18'/>\n<path d='m2.3 2.3 7.286 7.286'/>\n<circle r='2' cy='11' cx='11'/>\n</svg>\n")


(def
 alarm-clock-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='13' cx='12'/>\n<path d='M5 3 2 6'/>\n<path d='m22 6-3-3'/>\n<path d='M6.38 18.7 4 21'/>\n<path d='M17.64 18.67 20 21'/>\n<path d='M9 13h6'/>\n</svg>\n")


(def alarm-minus alarm-clock-minus)


(def
 panels-left-bottom
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 3v18'/>\n<path d='M9 15h12'/>\n</svg>\n")


(def
 circle-gauge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.6 2.7a10 10 0 1 0 5.7 5.7'/>\n<circle r='2' cy='12' cx='12'/>\n<path d='M13.4 10.6 19 5'/>\n</svg>\n")


(def gauge-circle circle-gauge)


(def
 folder-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3'/>\n<path d='m14.305 19.53.923-.382'/>\n<path d='m15.228 16.852-.923-.383'/>\n<path d='m16.852 15.228-.383-.923'/>\n<path d='m16.852 20.772-.383.924'/>\n<path d='m19.148 15.228.383-.923'/>\n<path d='m19.53 21.696-.382-.924'/>\n<path d='m20.772 16.852.924-.383'/>\n<path d='m20.772 19.148.924.383'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def folder-cog-2 folder-cog)


(def
 at-sign
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='12' cx='12'/>\n<path d='M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8'/>\n</svg>\n")


(def
 rotate-ccw-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 9V7a2 2 0 0 0-2-2h-6'/>\n<path d='m15 2-3 3 3 3'/>\n<path d='M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2'/>\n</svg>\n")


(def
 map-pin-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.97 9.304A8 8 0 0 0 2 10c0 4.69 4.887 9.562 7.022 11.468'/>\n<path d='M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n<circle r='3' cy='10' cx='10'/>\n</svg>\n")


(def location-edit map-pin-pen)


(def
 circle-arrow-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m12 16 4-4-4-4'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def arrow-right-circle circle-arrow-right)


(def
 shield-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M12 8v4'/>\n<path d='M12 16h.01'/>\n</svg>\n")


(def
 map-pin-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.75 7.09a3 3 0 0 1 2.16 2.16'/>\n<path d='M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568'/>\n<path d='m2 2 20 20'/>\n<path d='M8.475 2.818A8 8 0 0 1 20 10c0 1.183-.31 2.377-.81 3.533'/>\n<path d='M9.13 9.13a3 3 0 0 0 3.74 3.74'/>\n</svg>\n")


(def
 list-restart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 6H3'/>\n<path d='M7 12H3'/>\n<path d='M7 18H3'/>\n<path d='M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14'/>\n<path d='M11 10v4h4'/>\n</svg>\n")


(def
 house-wifi
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9.5 13.866a4 4 0 0 1 5 .01'/>\n<path d='M12 17h.01'/>\n<path d='M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/>\n<path d='M7 10.754a8 8 0 0 1 10 0'/>\n</svg>\n")


(def
 hand-metal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4'/>\n<path d='M14 11V9a2 2 0 1 0-4 0v2'/>\n<path d='M10 10.5V5a2 2 0 1 0-4 0v9'/>\n<path d='m7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5'/>\n</svg>\n")


(def
 egg
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12'/>\n</svg>\n")


(def
 car-taxi-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2h4'/>\n<path d='m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8'/>\n<path d='M7 14h.01'/>\n<path d='M17 14h.01'/>\n<rect rx='2' y='10' x='3' height='8' width='18'/>\n<path d='M5 18v2'/>\n<path d='M19 18v2'/>\n</svg>\n")


(def
 square-mouse-pointer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z'/>\n<path d='M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6'/>\n</svg>\n")


(def inspect square-mouse-pointer)


(def
 hand-fist
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0'/>\n<path d='M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5'/>\n<path d='M9 5A2 2 0 1 0 5 5V10'/>\n<path d='M9 7V4A2 2 0 1 1 13 4V7.268'/>\n</svg>\n")


(def
 brick-wall-shield
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 9v1.258'/>\n<path d='M16 3v5.46'/>\n<path d='M21 9.118V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.75'/>\n<path d='M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z'/>\n<path d='M3 15h7'/>\n<path d='M3 9h12.142'/>\n<path d='M8 15v6'/>\n<path d='M8 3v6'/>\n</svg>\n")


(def
 monitor-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.5 12.5-5-5'/>\n<path d='m9.5 12.5 5-5'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n</svg>\n")


(def
 square-terminal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 11 2-2-2-2'/>\n<path d='M11 13h4'/>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n</svg>\n")


(def terminal-square square-terminal)


(def
 grid-2x2-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3'/>\n<path d='m16 19 2 2 4-4'/>\n</svg>\n")


(def grid-2-x-2-check grid-2x2-check)


(def
 hat-glasses
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 18a2 2 0 0 0-4 0'/>\n<path d='m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11'/>\n<path d='M2 11h20'/>\n<circle r='3' cy='18' cx='17'/>\n<circle r='3' cy='18' cx='7'/>\n</svg>\n")


(def
 bus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 6v6'/>\n<path d='M15 6v6'/>\n<path d='M2 12h19.6'/>\n<path d='M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3'/>\n<circle r='2' cy='18' cx='7'/>\n<path d='M9 18h5'/>\n<circle r='2' cy='18' cx='16'/>\n</svg>\n")


(def
 file-pen-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2'/>\n<path d='M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n<path d='M8 18h1'/>\n</svg>\n")


(def file-signature file-pen-line)


(def
 book-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z'/>\n</svg>\n")


(def
 infinity
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8'/>\n</svg>\n")


(def
 gem
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 3 8 9l4 13 4-13-2.5-6'/>\n<path d='M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z'/>\n<path d='M2 9h20'/>\n</svg>\n")


(def
 git-compare
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='18' cx='18'/>\n<circle r='3' cy='6' cx='6'/>\n<path d='M13 6h3a2 2 0 0 1 2 2v7'/>\n<path d='M11 18H8a2 2 0 0 1-2-2V9'/>\n</svg>\n")


(def
 receipt-cent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M12 6.5v11'/>\n<path d='M15 9.4a4 4 0 1 0 0 5.2'/>\n</svg>\n")


(def
 feather
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z'/>\n<path d='M16 8 2 22'/>\n<path d='M17.5 15H9'/>\n</svg>\n")


(def
 webhook-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 17h-5c-1.09-.02-1.94.92-2.5 1.9A3 3 0 1 1 2.57 15'/>\n<path d='M9 3.4a4 4 0 0 1 6.52.66'/>\n<path d='m6 17 3.1-5.8a2.5 2.5 0 0 0 .057-2.05'/>\n<path d='M20.3 20.3a4 4 0 0 1-2.3.7'/>\n<path d='M18.6 13a4 4 0 0 1 3.357 3.414'/>\n<path d='m12 6 .6 1'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 trash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/>\n<path d='M3 6h18'/>\n<path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/>\n</svg>\n")


(def
 monitor-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17v4'/>\n<path d='m14.305 7.53.923-.382'/>\n<path d='m15.228 4.852-.923-.383'/>\n<path d='m16.852 3.228-.383-.924'/>\n<path d='m16.852 8.772-.383.923'/>\n<path d='m19.148 3.228.383-.924'/>\n<path d='m19.53 9.696-.382-.924'/>\n<path d='m20.772 4.852.924-.383'/>\n<path d='m20.772 7.148.924.383'/>\n<path d='M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7'/>\n<path d='M8 21h8'/>\n<circle r='3' cy='6' cx='18'/>\n</svg>\n")


(def
 squares-subtract
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 22a2 2 0 0 1-2-2'/>\n<path d='M16 22h-2'/>\n<path d='M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z'/>\n<path d='M20 8a2 2 0 0 1 2 2'/>\n<path d='M22 14v2'/>\n<path d='M22 20a2 2 0 0 1-2 2'/>\n</svg>\n")


(def
 tree-palm
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4'/>\n<path d='M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3'/>\n<path d='M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35'/>\n<path d='M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14'/>\n</svg>\n")


(def palmtree tree-palm)


(def
 chart-bar
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M7 16h8'/>\n<path d='M7 11h12'/>\n<path d='M7 6h3'/>\n</svg>\n")


(def bar-chart-horizontal chart-bar)


(def
 arrow-down-1-0
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<path d='M17 10V4h-2'/>\n<path d='M15 10h4'/>\n<rect ry='2' height='6' width='4' y='14' x='15'/>\n</svg>\n")


(def arrow-down-10 arrow-down-1-0)


(def
 database-backup
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<ellipse ry='3' rx='9' cy='5' cx='12'/>\n<path d='M3 12a9 3 0 0 0 5 2.69'/>\n<path d='M21 9.3V5'/>\n<path d='M3 5v14a9 3 0 0 0 6.47 2.88'/>\n<path d='M12 12v4h4'/>\n<path d='M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16'/>\n</svg>\n")


(def
 bubbles
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7.2 14.8a2 2 0 0 1 2 2'/>\n<circle r='3.5' cy='8.5' cx='18.5'/>\n<circle r='5.5' cy='16.5' cx='7.5'/>\n<circle r='2.5' cy='4.5' cx='7.5'/>\n</svg>\n")


(def
 armchair
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3'/>\n<path d='M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z'/>\n<path d='M5 18v2'/>\n<path d='M19 18v2'/>\n</svg>\n")


(def
 wifi-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h.01'/>\n<path d='M8.5 16.429a5 5 0 0 1 7 0'/>\n<path d='M5 12.859a10 10 0 0 1 5.17-2.69'/>\n<path d='M19 12.859a10 10 0 0 0-2.007-1.523'/>\n<path d='M2 8.82a15 15 0 0 1 4.177-2.643'/>\n<path d='M22 8.82a15 15 0 0 0-11.288-3.764'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 truck-electric
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 19V7a2 2 0 0 0-2-2H9'/>\n<path d='M15 19H9'/>\n<path d='M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14'/>\n<path d='M2 13v5a1 1 0 0 0 1 1h2'/>\n<path d='M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02'/>\n<circle r='2' cy='19' cx='17'/>\n<circle r='2' cy='19' cx='7'/>\n</svg>\n")


(def
 transgender
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 16v6'/>\n<path d='M14 20h-4'/>\n<path d='M18 2h4v4'/>\n<path d='m2 2 7.17 7.17'/>\n<path d='M2 5.355V2h3.357'/>\n<path d='m22 2-7.17 7.17'/>\n<path d='M8 5 5 8'/>\n<circle r='4' cy='12' cx='12'/>\n</svg>\n")


(def
 user-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='5' cy='8' cx='12'/>\n<path d='M20 21a8 8 0 0 0-16 0'/>\n</svg>\n")


(def user-2 user-round)


(def
 ungroup
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='4' x='5' height='6' width='8'/>\n<rect rx='1' y='14' x='11' height='6' width='8'/>\n</svg>\n")


(def
 toilet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18'/>\n<path d='M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8'/>\n</svg>\n")


(def
 book-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 6V4a2 2 0 1 0-4 0v2'/>\n<path d='M20 15v6a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H10'/>\n<rect rx='1' height='5' width='8' y='6' x='12'/>\n</svg>\n")


(def
 leaf
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/>\n<path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/>\n</svg>\n")


(def
 arrow-down-wide-narrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<path d='M11 4h10'/>\n<path d='M11 8h7'/>\n<path d='M11 12h4'/>\n</svg>\n")


(def sort-desc arrow-down-wide-narrow)


(def
 network
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' height='6' width='6' y='16' x='16'/>\n<rect rx='1' height='6' width='6' y='16' x='2'/>\n<rect rx='1' height='6' width='6' y='2' x='9'/>\n<path d='M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3'/>\n<path d='M12 12V8'/>\n</svg>\n")


(def
 file-lock-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<rect rx='1' y='13' x='2' height='5' width='8'/>\n<path d='M8 13v-2a2 2 0 1 0-4 0v2'/>\n</svg>\n")


(def
 app-window-mac
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='16' width='20'/>\n<path d='M6 8h.01'/>\n<path d='M10 8h.01'/>\n<path d='M14 8h.01'/>\n</svg>\n")


(def
 arrow-up-z-a
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n<path d='M15 4h5l-5 6h5'/>\n<path d='M15 20v-3.5a2.5 2.5 0 0 1 5 0V20'/>\n<path d='M20 18h-5'/>\n</svg>\n")


(def arrow-up-za arrow-up-z-a)


(def
 scan-barcode
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<path d='M8 7v10'/>\n<path d='M12 7v10'/>\n<path d='M17 7v10'/>\n</svg>\n")


(def
 house-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.662 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v2.475'/>\n<path d='M14.959 12.717A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8'/>\n<path d='M15 18h6'/>\n<path d='M18 15v6'/>\n</svg>\n")


(def
 corner-left-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 15-5 5-5-5'/>\n<path d='M20 4h-7a4 4 0 0 0-4 4v12'/>\n</svg>\n")


(def
 map-pin-minus-inside
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'/>\n<path d='M9 10h6'/>\n</svg>\n")


(def
 message-square-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='M12 8v6'/>\n<path d='M9 11h6'/>\n</svg>\n")


(def
 folder-clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 14v2.2l1.6 1'/>\n<path d='M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2'/>\n<circle r='6' cy='16' cx='16'/>\n</svg>\n")


(def
 map-pin-house
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z'/>\n<path d='M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2'/>\n<path d='M18 22v-3'/>\n<circle r='3' cy='10' cx='10'/>\n</svg>\n")


(def
 paintbrush-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v2'/>\n<path d='M14 2v4'/>\n<path d='M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z'/>\n<path d='M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1'/>\n</svg>\n")


(def paintbrush-2 paintbrush-vertical)


(def
 dollar-sign
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='22' y1='2' x2='12' x1='12'/>\n<path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>\n</svg>\n")


(def
 triangle-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z'/>\n</svg>\n")


(def
 indian-rupee
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 3h12'/>\n<path d='M6 8h12'/>\n<path d='m6 13 8.5 8'/>\n<path d='M6 13h3'/>\n<path d='M9 13c6.667 0 6.667-10 0-10'/>\n</svg>\n")


(def
 construction
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' height='8' width='20' y='6' x='2'/>\n<path d='M17 14v7'/>\n<path d='M7 14v7'/>\n<path d='M17 3v3'/>\n<path d='M7 3v3'/>\n<path d='M10 14 2.3 6.3'/>\n<path d='m14 6 7.7 7.7'/>\n<path d='m8 6 8 8'/>\n</svg>\n")


(def
 circle-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M8 12h8'/>\n<path d='M12 8v8'/>\n</svg>\n")


(def plus-circle circle-plus)


(def
 graduation-cap
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z'/>\n<path d='M22 10v6'/>\n<path d='M6 12.5V16a6 3 0 0 0 12 0v-3.5'/>\n</svg>\n")


(def
 scan-face
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7V5a2 2 0 0 1 2-2h2'/>\n<path d='M17 3h2a2 2 0 0 1 2 2v2'/>\n<path d='M21 17v2a2 2 0 0 1-2 2h-2'/>\n<path d='M7 21H5a2 2 0 0 1-2-2v-2'/>\n<path d='M8 14s1.5 2 4 2 4-2 4-2'/>\n<path d='M9 9h.01'/>\n<path d='M15 9h.01'/>\n</svg>\n")


(def
 fish-symbol
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 16s9-15 20-4C11 23 2 8 2 8'/>\n</svg>\n")


(def
 monitor-speaker
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5.5 20H8'/>\n<path d='M17 9h.01'/>\n<rect rx='2' y='4' x='12' height='16' width='10'/>\n<path d='M8 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4'/>\n<circle r='1' cy='15' cx='17'/>\n</svg>\n")


(def
 guitar
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11.9 12.1 4.514-4.514'/>\n<path d='M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z'/>\n<path d='m6 16 2 2'/>\n<path d='M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z'/>\n</svg>\n")


(def
 star
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'/>\n</svg>\n")


(def
 lock-keyhole-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='16' cx='12'/>\n<rect rx='2' y='10' x='3' height='12' width='18'/>\n<path d='M7 10V7a5 5 0 0 1 9.33-2.5'/>\n</svg>\n")


(def unlock-keyhole lock-keyhole-open)


(def
 monitor-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 10 2 2 4-4'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n</svg>\n")


(def
 sandwich
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777'/>\n<path d='M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25'/>\n<path d='M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9'/>\n<path d='m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2'/>\n<rect rx='1' y='11' x='2' height='4' width='20'/>\n</svg>\n")


(def
 chef-hat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z'/>\n<path d='M6 17h12'/>\n</svg>\n")


(def
 wifi-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 8.82a15 15 0 0 1 20 0'/>\n<path d='M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n<path d='M5 12.859a10 10 0 0 1 10.5-2.222'/>\n<path d='M8.5 16.429a5 5 0 0 1 3-1.406'/>\n</svg>\n")


(def
 heading-6
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n<path d='M12 18V6'/>\n<circle r='2' cy='16' cx='19'/>\n<path d='M20 10c-2 2-3 3.5-3 6'/>\n</svg>\n")


(def
 cloud-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 20 20'/>\n<path d='M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193'/>\n<path d='M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07'/>\n</svg>\n")


(def
 save-all
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v3a1 1 0 0 0 1 1h5'/>\n<path d='M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6'/>\n<path d='M18 22H4a2 2 0 0 1-2-2V6'/>\n<path d='M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z'/>\n</svg>\n")


(def
 file-user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M15 18a3 3 0 1 0-6 0'/>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/>\n<circle r='2' cy='13' cx='12'/>\n</svg>\n")


(def
 sun
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='12' cx='12'/>\n<path d='M12 2v2'/>\n<path d='M12 20v2'/>\n<path d='m4.93 4.93 1.41 1.41'/>\n<path d='m17.66 17.66 1.41 1.41'/>\n<path d='M2 12h2'/>\n<path d='M20 12h2'/>\n<path d='m6.34 17.66-1.41 1.41'/>\n<path d='m19.07 4.93-1.41 1.41'/>\n</svg>\n")


(def
 wrench
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z'/>\n</svg>\n")


(def
 signal-medium
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h.01'/>\n<path d='M7 20v-4'/>\n<path d='M12 20v-8'/>\n</svg>\n")


(def
 pyramid
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z'/>\n<path d='M12 2v20'/>\n</svg>\n")


(def
 book-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M9 10h6'/>\n</svg>\n")


(def
 gauge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 14 4-4'/>\n<path d='M3.34 19a10 10 0 1 1 17.32 0'/>\n</svg>\n")


(def
 chart-column
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M18 17V9'/>\n<path d='M13 17V5'/>\n<path d='M8 17v-3'/>\n</svg>\n")


(def bar-chart-3 chart-column)


(def
 message-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n</svg>\n")


(def
 bug-play
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 19.655A6 6 0 0 1 6 14v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 3.97'/>\n<path d='M14 15.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z'/>\n<path d='M14.12 3.88 16 2'/>\n<path d='M20.97 5c0 2.1-1.6 3.8-3.5 4'/>\n<path d='M3 21c0-2.1 1.7-3.9 3.8-4'/>\n<path d='M6 13H2'/>\n<path d='M6.53 9C4.6 8.8 3 7.1 3 5'/>\n<path d='m8 2 1.88 1.88'/>\n<path d='M9 7.13v-1a3 3 0 0 1 4.18-2.895 3 3 0 0 1 1.821 2.896v1'/>\n</svg>\n")


(def
 book-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.5 7-5 5'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='m9.5 7 5 5'/>\n</svg>\n")


(def
 heading-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 18V6'/>\n<path d='M17 10v3a1 1 0 0 0 1 1h3'/>\n<path d='M21 10v8'/>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n</svg>\n")


(def
 chart-column-increasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 17V9'/>\n<path d='M18 17V5'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M8 17v-3'/>\n</svg>\n")


(def bar-chart-4 chart-column-increasing)


(def
 pizza
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 14-1 1'/>\n<path d='m13.75 18.25-1.25 1.42'/>\n<path d='M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12'/>\n<path d='M18.8 9.3a1 1 0 0 0 2.1 7.7'/>\n<path d='M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z'/>\n</svg>\n")


(def
 unlink
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71'/>\n<path d='m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71'/>\n<line y2='5' y1='2' x2='8' x1='8'/>\n<line y2='8' y1='8' x2='5' x1='2'/>\n<line y2='22' y1='19' x2='16' x1='16'/>\n<line y2='16' y1='16' x2='22' x1='19'/>\n</svg>\n")


(def
 philippine-peso
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 11H4'/>\n<path d='M20 7H4'/>\n<path d='M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7'/>\n</svg>\n")


(def
 chevrons-down-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 20 5-5 5 5'/>\n<path d='m7 4 5 5 5-5'/>\n</svg>\n")


(def
 bone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z'/>\n</svg>\n")


(def
 flashlight-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 16v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4'/>\n<path d='M7 2h11v4c0 2-2 2-2 4v1'/>\n<line y2='6' y1='6' x2='18' x1='11'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 file-json-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1'/>\n<path d='M8 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1'/>\n</svg>\n")


(def
 grid-3x2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 3v18'/>\n<path d='M3 12h18'/>\n<path d='M9 3v18'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def
 anchor
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22V8'/>\n<path d='M5 12H2a10 10 0 0 0 20 0h-3'/>\n<circle r='3' cy='5' cx='12'/>\n</svg>\n")


(def
 hammer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9'/>\n<path d='m18 15 4-4'/>\n<path d='m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5'/>\n</svg>\n")


(def
 chevrons-left-right-ellipsis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12h.01'/>\n<path d='M16 12h.01'/>\n<path d='m17 7 5 5-5 5'/>\n<path d='m7 7-5 5 5 5'/>\n<path d='M8 12h.01'/>\n</svg>\n")


(def
 plug-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 2v6'/>\n<path d='M15 2v6'/>\n<path d='M12 17v5'/>\n<path d='M5 8h14'/>\n<path d='M6 11V8h12v3a6 6 0 1 1-12 0Z'/>\n</svg>\n")


(def
 notebook-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4'/>\n<path d='M2 6h4'/>\n<path d='M2 10h4'/>\n<path d='M2 14h4'/>\n<path d='M2 18h4'/>\n<path d='M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n</svg>\n")


(def
 chevrons-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m17 11-5-5-5 5'/>\n<path d='m17 18-5-5-5 5'/>\n</svg>\n")


(def
 columns-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 3v18'/>\n<path d='M15 3v18'/>\n</svg>\n")


(def panels-left-right columns-3)


(def
 move-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 8 4 4-4 4'/>\n<path d='M2 12h20'/>\n<path d='m6 8-4 4 4 4'/>\n</svg>\n")


(def
 highlighter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 11-6 6v3h9l3-3'/>\n<path d='m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4'/>\n</svg>\n")


(def
 square-arrow-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 8h8v8'/>\n<path d='m8 16 8-8'/>\n</svg>\n")


(def arrow-up-right-square square-arrow-up-right)


(def
 tablet-smartphone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='8' x='3' height='14' width='10'/>\n<path d='M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4'/>\n<path d='M8 18h.01'/>\n</svg>\n")


(def
 circle-stop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<rect rx='1' height='6' width='6' y='9' x='9'/>\n</svg>\n")


(def stop-circle circle-stop)


(def
 twitch
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7'/>\n</svg>\n")


(def
 chart-no-axes-column-decreasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20V10'/>\n<path d='M18 20v-4'/>\n<path d='M6 20V4'/>\n</svg>\n")


(def
 chart-pie
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z'/>\n<path d='M21.21 15.89A10 10 0 1 1 8 2.83'/>\n</svg>\n")


(def pie-chart chart-pie)


(def
 banana
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5'/>\n<path d='M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z'/>\n</svg>\n")


(def
 tree-deciduous
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z'/>\n<path d='M12 19v3'/>\n</svg>\n")


(def
 folder-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='17' x='14' height='5' width='8'/>\n<path d='M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5'/>\n<path d='M20 17v-2a2 2 0 1 0-4 0v2'/>\n</svg>\n")


(def
 locate
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='12' x2='5' x1='2'/>\n<line y2='12' y1='12' x2='22' x1='19'/>\n<line y2='5' y1='2' x2='12' x1='12'/>\n<line y2='22' y1='19' x2='12' x1='12'/>\n<circle r='7' cy='12' cx='12'/>\n</svg>\n")


(def
 list-music
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 15V6'/>\n<path d='M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'/>\n<path d='M12 12H3'/>\n<path d='M16 6H3'/>\n<path d='M12 18H3'/>\n</svg>\n")


(def
 bug
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m8 2 1.88 1.88'/>\n<path d='M14.12 3.88 16 2'/>\n<path d='M9 7.13v-1a3.003 3.003 0 1 1 6 0v1'/>\n<path d='M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6'/>\n<path d='M12 20v-9'/>\n<path d='M6.53 9C4.6 8.8 3 7.1 3 5'/>\n<path d='M6 13H2'/>\n<path d='M3 21c0-2.1 1.7-3.9 3.8-4'/>\n<path d='M20.97 5c0 2.1-1.6 3.8-3.5 4'/>\n<path d='M22 13h-4'/>\n<path d='M17.2 17c2.1.1 3.8 1.9 3.8 4'/>\n</svg>\n")


(def
 panel-top
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n</svg>\n")


(def
 message-square-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='m10 8-3 3 3 3'/>\n<path d='m14 14 3-3-3-3'/>\n</svg>\n")


(def
 mail-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z'/>\n<path d='m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10'/>\n</svg>\n")


(def
 youtube
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17'/>\n<path d='m10 15 5-3-5-3z'/>\n</svg>\n")


(def
 file-chart-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m16 13-3.5 3.5-2-2L8 17'/>\n</svg>\n")


(def file-line-chart file-chart-line)


(def
 shield-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3'/>\n<path d='M12 17h.01'/>\n</svg>\n")


(def shield-question shield-question-mark)


(def
 chevrons-left-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 7-5 5 5 5'/>\n<path d='m15 7 5 5-5 5'/>\n</svg>\n")


(def
 bookmark-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'/>\n<line y2='13' y1='7' x2='12' x1='12'/>\n<line y2='10' y1='10' x2='9' x1='15'/>\n</svg>\n")


(def
 a-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 11 4-4 4 4'/>\n<path d='M18 16V7'/>\n<path d='m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'/>\n<path d='M3.304 13h6.392'/>\n</svg>\n")


(def
 tower-control
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z'/>\n<path d='M8 13v9'/>\n<path d='M16 22v-9'/>\n<path d='m9 6 1 7'/>\n<path d='m15 6-1 7'/>\n<path d='M12 6V2'/>\n<path d='M13 2h-2'/>\n</svg>\n")


(def
 book-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13V7'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='m9 10 3-3 3 3'/>\n</svg>\n")


(def
 pocket-knife
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2'/>\n<path d='M18 6h.01'/>\n<path d='M6 18h.01'/>\n<path d='M20.83 8.83a4 4 0 0 0-5.66-5.66l-12 12a4 4 0 1 0 5.66 5.66Z'/>\n<path d='M18 11.66V22a4 4 0 0 0 4-4V6'/>\n</svg>\n")


(def
 shovel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z'/>\n<path d='M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z'/>\n<path d='m9 15 7.879-7.878'/>\n</svg>\n")


(def
 compass
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 file-minus-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M3 15h6'/>\n</svg>\n")


(def
 align-horizontal-justify-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='2' height='14' width='6'/>\n<rect rx='2' y='7' x='12' height='10' width='6'/>\n<path d='M22 2v20'/>\n</svg>\n")


(def
 server-crash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2'/>\n<path d='M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2'/>\n<path d='M6 6h.01'/>\n<path d='M6 18h.01'/>\n<path d='m13 6-4 6h6l-4 6'/>\n</svg>\n")


(def
 traffic-cone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.05 10.966a5 2.5 0 0 1-8.1 0'/>\n<path d='m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04'/>\n<path d='M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z'/>\n<path d='M9.194 6.57a5 2.5 0 0 0 5.61 0'/>\n</svg>\n")


(def
 triangle-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.17 4.193a2 2 0 0 1 3.666.013'/>\n<path d='M14 21h2'/>\n<path d='m15.874 7.743 1 1.732'/>\n<path d='m18.849 12.952 1 1.732'/>\n<path d='M21.824 18.18a2 2 0 0 1-1.835 2.824'/>\n<path d='M4.024 21a2 2 0 0 1-1.839-2.839'/>\n<path d='m5.136 12.952-1 1.732'/>\n<path d='M8 21h2'/>\n<path d='m8.102 7.743-1 1.732'/>\n</svg>\n")


(def
 plane-takeoff
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 22h20'/>\n<path d='M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z'/>\n</svg>\n")


(def
 house-plug
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12V8.964'/>\n<path d='M14 12V8.964'/>\n<path d='M15 12a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z'/>\n<path d='M8.5 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2'/>\n</svg>\n")


(def
 folder-kanban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'/>\n<path d='M8 10v4'/>\n<path d='M12 10v2'/>\n<path d='M16 10v6'/>\n</svg>\n")


(def
 mail-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h7.5'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'/>\n<circle r='3' cy='18' cx='18'/>\n<path d='m22 22-1.5-1.5'/>\n</svg>\n")


(def
 image-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21'/>\n<path d='m14 19.5 3-3 3 3'/>\n<path d='M17 22v-5.5'/>\n<circle r='2' cy='9' cx='9'/>\n</svg>\n")


(def
 cloud-moon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z'/>\n<path d='M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36'/>\n</svg>\n")


(def
 columns-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 3v18'/>\n</svg>\n")


(def columns columns-2)


(def
 warehouse
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11'/>\n<path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z'/>\n<path d='M6 13h12'/>\n<path d='M6 17h12'/>\n</svg>\n")


(def
 calendar-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 18 4-4 4 4'/>\n<path d='M16 2v4'/>\n<path d='M18 22v-8'/>\n<path d='M21 11.343V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 rotate-cw-square
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 5H6a2 2 0 0 0-2 2v3'/>\n<path d='m9 8 3-3-3-3'/>\n<path d='M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2'/>\n</svg>\n")


(def
 square-function
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3'/>\n<path d='M9 11.2h5.7'/>\n</svg>\n")


(def function-square square-function)


(def
 frame
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='6' y1='6' x2='2' x1='22'/>\n<line y2='18' y1='18' x2='2' x1='22'/>\n<line y2='22' y1='2' x2='6' x1='6'/>\n<line y2='22' y1='2' x2='18' x1='18'/>\n</svg>\n")


(def
 credit-card
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='2' height='14' width='20'/>\n<line y2='10' y1='10' x2='22' x1='2'/>\n</svg>\n")


(def
 circle-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M12 8v8'/>\n<path d='m8 12 4 4 4-4'/>\n</svg>\n")


(def arrow-down-circle circle-arrow-down)


(def
 table-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18'/>\n</svg>\n")


(def
 file-key-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v6'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<circle r='2' cy='16' cx='4'/>\n<path d='m10 10-4.5 4.5'/>\n<path d='m9 11 1 1'/>\n</svg>\n")


(def
 copyleft
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M9.17 14.83a4 4 0 1 0 0-5.66'/>\n</svg>\n")


(def
 grid-3x3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9h18'/>\n<path d='M3 15h18'/>\n<path d='M9 3v18'/>\n<path d='M15 3v18'/>\n</svg>\n")


(def grid grid-3x3)


(def grid-3-x-3 grid-3x3)


(def
 message-circle-question-mark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/>\n<path d='M12 17h.01'/>\n</svg>\n")


(def message-circle-question message-circle-question-mark)


(def
 ticket-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='m9.5 14.5 5-5'/>\n<path d='m9.5 9.5 5 5'/>\n</svg>\n")


(def
 align-vertical-justify-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='16' x='5' height='6' width='14'/>\n<rect rx='2' y='6' x='7' height='6' width='10'/>\n<path d='M2 2h20'/>\n</svg>\n")


(def
 heart-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 4.893a5.5 5.5 0 0 1 1.091.931.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 1.872-1.002 3.356-2.187 4.655'/>\n<path d='m16.967 16.967-3.459 3.346a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 2.747-4.761'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 cylinder
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<ellipse ry='3' rx='9' cy='5' cx='12'/>\n<path d='M3 5v14a9 3 0 0 0 18 0V5'/>\n</svg>\n")


(def
 computer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='5' height='8' width='14'/>\n<rect rx='2' y='14' x='2' height='8' width='20'/>\n<path d='M6 18h2'/>\n<path d='M12 18h6'/>\n</svg>\n")


(def
 book-type
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 13h4'/>\n<path d='M12 6v7'/>\n<path d='M16 8V6H8v2'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n</svg>\n")


(def
 pill-bottle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4'/>\n<path d='M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7'/>\n<rect rx='1' y='2' x='4' height='5' width='16'/>\n</svg>\n")


(def
 heading-5
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h8'/>\n<path d='M4 18V6'/>\n<path d='M12 18V6'/>\n<path d='M17 13v-3h4'/>\n<path d='M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17'/>\n</svg>\n")


(def
 thermometer-sun
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 9a4 4 0 0 0-2 7.5'/>\n<path d='M12 3v2'/>\n<path d='m6.6 18.4-1.4 1.4'/>\n<path d='M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z'/>\n<path d='M4 13H2'/>\n<path d='M6.34 7.34 4.93 5.93'/>\n</svg>\n")


(def
 locate-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 19v3'/>\n<path d='M12 2v3'/>\n<path d='M18.89 13.24a7 7 0 0 0-8.13-8.13'/>\n<path d='M19 12h3'/>\n<path d='M2 12h3'/>\n<path d='m2 2 20 20'/>\n<path d='M7.05 7.05a7 7 0 0 0 9.9 9.9'/>\n</svg>\n")


(def
 reply-all
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 17-5-5 5-5'/>\n<path d='M22 18v-2a4 4 0 0 0-4-4H7'/>\n<path d='m7 17-5-5 5-5'/>\n</svg>\n")


(def
 pencil
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>\n<path d='m15 5 4 4'/>\n</svg>\n")


(def
 cloud-rain
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='M16 14v6'/>\n<path d='M8 14v6'/>\n<path d='M12 16v6'/>\n</svg>\n")


(def
 mars-stroke
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 6 4 4'/>\n<path d='M17 3h4v4'/>\n<path d='m21 3-7.75 7.75'/>\n<circle r='6' cy='15' cx='9'/>\n</svg>\n")


(def
 send-to-back
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='8' width='8' y='14' x='14'/>\n<rect rx='2' height='8' width='8' y='2' x='2'/>\n<path d='M7 14v1a2 2 0 0 0 2 2h1'/>\n<path d='M14 7h1a2 2 0 0 1 2 2v1'/>\n</svg>\n")


(def
 git-pull-request-closed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='6'/>\n<path d='M6 9v12'/>\n<path d='m21 3-6 6'/>\n<path d='m21 9-6-6'/>\n<path d='M18 11.5V15'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def
 arrow-big-right-dash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 9a1 1 0 0 0 1-1V5.061a1 1 0 0 1 1.811-.75l6.836 6.836a1.207 1.207 0 0 1 0 1.707l-6.836 6.835a1 1 0 0 1-1.811-.75V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z'/>\n<path d='M4 9v6'/>\n</svg>\n")


(def
 wind-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 2v8'/>\n<path d='M12.8 21.6A2 2 0 1 0 14 18H2'/>\n<path d='M17.5 10a2.5 2.5 0 1 1 2 4H2'/>\n<path d='m6 6 4 4 4-4'/>\n</svg>\n")


(def
 align-vertical-distribute-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='14' x='5' height='6' width='14'/>\n<rect rx='2' y='4' x='7' height='6' width='10'/>\n<path d='M2 14h20'/>\n<path d='M2 4h20'/>\n</svg>\n")


(def
 book-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13V7'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='m9 10 3 3 3-3'/>\n</svg>\n")


(def
 pound-sterling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 7c0-5.333-8-5.333-8 0'/>\n<path d='M10 7v14'/>\n<path d='M6 21h12'/>\n<path d='M6 13h10'/>\n</svg>\n")


(def
 monitor-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m9 10 3-3 3 3'/>\n<path d='M12 13V7'/>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<path d='M12 17v4'/>\n<path d='M8 21h8'/>\n</svg>\n")


(def
 bean-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 9.9-4.1'/>\n<path d='M10.75 5.093A6 6 0 0 1 22 8c0 2.411-.61 4.68-1.683 6.66'/>\n<path d='M5.341 10.62a4 4 0 0 0 6.487 1.208M10.62 5.341a4.015 4.015 0 0 1 2.039 2.04'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 trash-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 11v6'/>\n<path d='M14 11v6'/>\n<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/>\n<path d='M3 6h18'/>\n<path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/>\n</svg>\n")


(def
 circle-user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662'/>\n</svg>\n")


(def user-circle circle-user)


(def
 skip-back
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z'/>\n<path d='M3 20V4'/>\n</svg>\n")


(def
 file-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M9 15h6'/>\n<path d='M12 18v-6'/>\n</svg>\n")


(def
 scroll-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 12h-5'/>\n<path d='M15 8h-5'/>\n<path d='M19 17V5a2 2 0 0 0-2-2H4'/>\n<path d='M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'/>\n</svg>\n")


(def
 diamond
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z'/>\n</svg>\n")


(def
 delete
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z'/>\n<path d='m12 9 6 6'/>\n<path d='m18 9-6 6'/>\n</svg>\n")


(def
 command
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3'/>\n</svg>\n")


(def
 package-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 16 2 2 4-4'/>\n<path d='M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14'/>\n<path d='m7.5 4.27 9 5.15'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<line y2='12' y1='22' x2='12' x1='12'/>\n</svg>\n")


(def
 align-center-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 12h20'/>\n<path d='M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4'/>\n<path d='M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4'/>\n<path d='M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1'/>\n<path d='M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1'/>\n</svg>\n")


(def
 clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l4 2'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 bell-ring
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M22 8c0-2.3-.8-4.3-2-6'/>\n<path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'/>\n<path d='M4 2C2.8 3.7 2 5.7 2 8'/>\n</svg>\n")


(def
 remove-formatting
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 7V4h16v3'/>\n<path d='M5 20h6'/>\n<path d='M13 4 8 20'/>\n<path d='m15 15 5 5'/>\n<path d='m20 15-5 5'/>\n</svg>\n")


(def
 router
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='14' x='2' height='8' width='20'/>\n<path d='M6.01 18H6'/>\n<path d='M10.01 18H10'/>\n<path d='M15 10v4'/>\n<path d='M17.84 7.17a4 4 0 0 0-5.66 0'/>\n<path d='M20.66 4.34a8 8 0 0 0-11.31 0'/>\n</svg>\n")


(def
 footprints
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z'/>\n<path d='M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z'/>\n<path d='M16 17h4'/>\n<path d='M4 13h4'/>\n</svg>\n")


(def
 octagon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z'/>\n</svg>\n")


(def
 arrow-big-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z'/>\n</svg>\n")


(def
 table-rows-split
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 10h2'/>\n<path d='M15 22v-8'/>\n<path d='M15 2v4'/>\n<path d='M2 10h2'/>\n<path d='M20 10h2'/>\n<path d='M3 19h18'/>\n<path d='M3 22v-6a2 2 135 0 1 2-2h14a2 2 45 0 1 2 2v6'/>\n<path d='M3 2v2a2 2 45 0 0 2 2h14a2 2 135 0 0 2-2V2'/>\n<path d='M8 10h2'/>\n<path d='M9 22v-8'/>\n<path d='M9 2v4'/>\n</svg>\n")


(def
 phone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 circle-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m15 9-6 6'/>\n<path d='m9 9 6 6'/>\n</svg>\n")


(def x-circle circle-x)


(def
 land-plot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 8 6-3-6-3v10'/>\n<path d='m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12'/>\n<path d='m6.49 12.85 11.02 6.3'/>\n<path d='M17.51 12.85 6.5 19.15'/>\n</svg>\n")


(def
 align-horizontal-justify-center
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='2' height='14' width='6'/>\n<rect rx='2' y='7' x='16' height='10' width='6'/>\n<path d='M12 2v20'/>\n</svg>\n")


(def
 sun-snow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 21v-1'/>\n<path d='M10 4V3'/>\n<path d='M10 9a3 3 0 0 0 0 6'/>\n<path d='m14 20 1.25-2.5L18 18'/>\n<path d='m14 4 1.25 2.5L18 6'/>\n<path d='m17 21-3-6 1.5-3H22'/>\n<path d='m17 3-3 6 1.5 3'/>\n<path d='M2 12h1'/>\n<path d='m20 10-1.5 2 1.5 2'/>\n<path d='m3.64 18.36.7-.7'/>\n<path d='m4.34 6.34-.7-.7'/>\n</svg>\n")


(def
 chart-bar-increasing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M7 11h8'/>\n<path d='M7 16h12'/>\n<path d='M7 6h3'/>\n</svg>\n")


(def
 image-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='22' y1='2' x2='22' x1='2'/>\n<path d='M10.41 10.41a2 2 0 1 1-2.83-2.83'/>\n<line y2='21' y1='13.5' x2='6' x1='13.5'/>\n<line y2='15' y1='12' x2='21' x1='18'/>\n<path d='M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59'/>\n<path d='M21 15V5a2 2 0 0 0-2-2H9'/>\n</svg>\n")


(def
 clock-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l4 2'/>\n<path d='M20 12v5'/>\n<path d='M20 21h.01'/>\n<path d='M21.25 8.2A10 10 0 1 0 16 21.16'/>\n</svg>\n")


(def
 umbrella-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v1'/>\n<path d='M15.5 21a1.85 1.85 0 0 1-3.5-1v-8H2a10 10 0 0 1 3.428-6.575'/>\n<path d='M17.5 12H22A10 10 0 0 0 9.004 3.455'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 arrow-down-a-z
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<path d='M20 8h-5'/>\n<path d='M15 10V6.5a2.5 2.5 0 0 1 5 0V10'/>\n<path d='M15 14h5l-5 6h5'/>\n</svg>\n")


(def arrow-down-az arrow-down-a-z)


(def
 panel-left-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M9 3v18'/>\n<path d='m14 9 3 3-3 3'/>\n</svg>\n")


(def sidebar-open panel-left-open)


(def
 brain-circuit
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z'/>\n<path d='M9 13a4.5 4.5 0 0 0 3-4'/>\n<path d='M6.003 5.125A3 3 0 0 0 6.401 6.5'/>\n<path d='M3.477 10.896a4 4 0 0 1 .585-.396'/>\n<path d='M6 18a4 4 0 0 1-1.967-.516'/>\n<path d='M12 13h4'/>\n<path d='M12 18h6a2 2 0 0 1 2 2v1'/>\n<path d='M12 8h8'/>\n<path d='M16 8V5a2 2 0 0 1 2-2'/>\n<circle r='.5' cy='13' cx='16'/>\n<circle r='.5' cy='3' cx='18'/>\n<circle r='.5' cy='21' cx='20'/>\n<circle r='.5' cy='8' cx='20'/>\n</svg>\n")


(def
 move-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v20'/>\n<path d='m8 18 4 4 4-4'/>\n<path d='m8 6 4-4 4 4'/>\n</svg>\n")


(def
 users-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 21a8 8 0 0 0-16 0'/>\n<circle r='5' cy='8' cx='10'/>\n<path d='M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3'/>\n</svg>\n")


(def users-2 users-round)


(def
 salad
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 21h10'/>\n<path d='M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z'/>\n<path d='M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1'/>\n<path d='m13 12 4-4'/>\n<path d='M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2'/>\n</svg>\n")


(def
 dumbbell
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z'/>\n<path d='m2.5 21.5 1.4-1.4'/>\n<path d='m20.1 3.9 1.4-1.4'/>\n<path d='M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z'/>\n<path d='m9.6 14.4 4.8-4.8'/>\n</svg>\n")


(def
 tractor
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20'/>\n<path d='M16 18h-5'/>\n<path d='M18 5a1 1 0 0 0-1 1v5.573'/>\n<path d='M3 4h8.129a1 1 0 0 1 .99.863L13 11.246'/>\n<path d='M4 11V4'/>\n<path d='M7 15h.01'/>\n<path d='M8 10.1V4'/>\n<circle r='2' cy='18' cx='18'/>\n<circle r='5' cy='15' cx='7'/>\n</svg>\n")


(def
 waves
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n<path d='M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n<path d='M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n</svg>\n")


(def
 folder-closed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='M2 10h20'/>\n</svg>\n")


(def
 eye
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'/>\n<circle r='3' cy='12' cx='12'/>\n</svg>\n")


(def
 user-round-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.305 19.53.923-.382'/>\n<path d='m15.228 16.852-.923-.383'/>\n<path d='m16.852 15.228-.383-.923'/>\n<path d='m16.852 20.772-.383.924'/>\n<path d='m19.148 15.228.383-.923'/>\n<path d='m19.53 21.696-.382-.924'/>\n<path d='M2 21a8 8 0 0 1 10.434-7.62'/>\n<path d='m20.772 16.852.924-.383'/>\n<path d='m20.772 19.148.924.383'/>\n<circle r='5' cy='8' cx='10'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def user-cog-2 user-round-cog)


(def
 indent-increase
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12H11'/>\n<path d='M21 18H11'/>\n<path d='M21 6H11'/>\n<path d='m3 8 4 4-4 4'/>\n</svg>\n")


(def indent indent-increase)


(def
 mouse-pointer-ban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.034 2.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.944L8.204 7.545a1 1 0 0 0-.66.66l-1.066 3.443a.5.5 0 0 1-.944.033z'/>\n<circle r='6' cy='16' cx='16'/>\n<path d='m11.8 11.8 8.4 8.4'/>\n</svg>\n")


(def
 drone
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10 7 7'/>\n<path d='m10 14-3 3'/>\n<path d='m14 10 3-3'/>\n<path d='m14 14 3 3'/>\n<path d='M14.205 4.139a4 4 0 1 1 5.439 5.863'/>\n<path d='M19.637 14a4 4 0 1 1-5.432 5.868'/>\n<path d='M4.367 10a4 4 0 1 1 5.438-5.862'/>\n<path d='M9.795 19.862a4 4 0 1 1-5.429-5.873'/>\n<rect rx='1' height='8' width='4' y='8' x='10'/>\n</svg>\n")


(def
 headphone-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 14h-1.343'/>\n<path d='M9.128 3.47A9 9 0 0 1 21 12v3.343'/>\n<path d='m2 2 20 20'/>\n<path d='M20.414 20.414A2 2 0 0 1 19 21h-1a2 2 0 0 1-2-2v-3'/>\n<path d='M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.636-6.364'/>\n</svg>\n")


(def
 badge-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<line y2='12' y1='8' x2='12' x1='12'/>\n<line y2='16' y1='16' x2='12.01' x1='12'/>\n</svg>\n")


(def
 server-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10.852 14.772-.383.923'/>\n<path d='M13.148 14.772a3 3 0 1 0-2.296-5.544l-.383-.923'/>\n<path d='m13.148 9.228.383-.923'/>\n<path d='m13.53 15.696-.382-.924a3 3 0 1 1-2.296-5.544'/>\n<path d='m14.772 10.852.923-.383'/>\n<path d='m14.772 13.148.923.383'/>\n<path d='M4.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5'/>\n<path d='M4.5 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-.5'/>\n<path d='M6 18h.01'/>\n<path d='M6 6h.01'/>\n<path d='m9.228 10.852-.923-.383'/>\n<path d='m9.228 13.148-.923.383'/>\n</svg>\n")


(def
 pipette
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12'/>\n<path d='m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z'/>\n<path d='m2 22 .414-.414'/>\n</svg>\n")


(def
 phone-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272'/>\n<path d='M22 2 2 22'/>\n<path d='M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473'/>\n</svg>\n")


(def
 flower
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='12'/>\n<path d='M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5'/>\n<path d='M12 7.5V9'/>\n<path d='M7.5 12H9'/>\n<path d='M16.5 12H15'/>\n<path d='M12 16.5V15'/>\n<path d='m8 8 1.88 1.88'/>\n<path d='M14.12 9.88 16 8'/>\n<path d='m8 16 1.88-1.88'/>\n<path d='M14.12 14.12 16 16'/>\n</svg>\n")


(def
 banknote
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='6' x='2' height='12' width='20'/>\n<circle r='2' cy='12' cx='12'/>\n<path d='M6 12h.01M18 12h.01'/>\n</svg>\n")


(def
 ruler-dimension-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 15v-3.014'/>\n<path d='M16 15v-3.014'/>\n<path d='M20 6H4'/>\n<path d='M20 8V4'/>\n<path d='M4 8V4'/>\n<path d='M8 15v-3.014'/>\n<rect rx='1' height='7' width='18' y='12' x='3'/>\n</svg>\n")


(def
 sprout
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3'/>\n<path d='M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4'/>\n<path d='M5 21h14'/>\n</svg>\n")


(def
 brick-wall
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 9v6'/>\n<path d='M16 15v6'/>\n<path d='M16 3v6'/>\n<path d='M3 15h18'/>\n<path d='M3 9h18'/>\n<path d='M8 15v6'/>\n<path d='M8 3v6'/>\n</svg>\n")


(def
 copy-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 15 2 2 4-4'/>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 rectangle-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='6' height='20' width='12'/>\n</svg>\n")


(def
 pill
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z'/>\n<path d='m8.5 8.5 7 7'/>\n</svg>\n")


(def
 codepen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polygon points='12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2'/>\n<line y2='15.5' y1='22' x2='12' x1='12'/>\n<polyline points='22 8.5 12 15.5 2 8.5'/>\n<polyline points='2 15.5 12 8.5 22 15.5'/>\n<line y2='8.5' y1='2' x2='12' x1='12'/>\n</svg>\n")


(def
 dribbble
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94'/>\n<path d='M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32'/>\n<path d='M8.56 2.75c4.37 6 6 9.42 8 17.72'/>\n</svg>\n")


(def
 chart-bar-big
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<rect rx='1' height='4' width='9' y='13' x='7'/>\n<rect rx='1' height='4' width='12' y='5' x='7'/>\n</svg>\n")


(def bar-chart-horizontal-big chart-bar-big)


(def
 message-circle-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='M8 12h8'/>\n<path d='M12 8v8'/>\n</svg>\n")


(def
 axe
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9'/>\n<path d='M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z'/>\n</svg>\n")


(def
 square-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 12h8'/>\n<path d='M12 8v8'/>\n</svg>\n")


(def plus-square square-plus)


(def
 gift
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' height='4' width='18' y='8' x='3'/>\n<path d='M12 8v13'/>\n<path d='M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7'/>\n<path d='M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5'/>\n</svg>\n")


(def
 receipt-russian-ruble
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M8 15h5'/>\n<path d='M8 11h5a2 2 0 1 0 0-4h-3v10'/>\n</svg>\n")


(def
 package-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 16h6'/>\n<path d='M19 13v6'/>\n<path d='M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14'/>\n<path d='m7.5 4.27 9 5.15'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<line y2='12' y1='22' x2='12' x1='12'/>\n</svg>\n")


(def
 external-link
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 3h6v6'/>\n<path d='M10 14 21 3'/>\n<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/>\n</svg>\n")


(def
 currency
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='12' cx='12'/>\n<line y2='6' y1='3' x2='6' x1='3'/>\n<line y2='6' y1='3' x2='18' x1='21'/>\n<line y2='18' y1='21' x2='6' x1='3'/>\n<line y2='18' y1='21' x2='18' x1='21'/>\n</svg>\n")


(def
 wand
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 4V2'/>\n<path d='M15 16v-2'/>\n<path d='M8 9h2'/>\n<path d='M20 9h2'/>\n<path d='M17.8 11.8 19 13'/>\n<path d='M15 9h.01'/>\n<path d='M17.8 6.2 19 5'/>\n<path d='m3 21 9-9'/>\n<path d='M12.2 6.2 11 5'/>\n</svg>\n")


(def
 file-music
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v8.4'/>\n<path d='M8 18v-7.7L16 9v7'/>\n<circle r='2' cy='16' cx='14'/>\n<circle r='2' cy='18' cx='6'/>\n</svg>\n")


(def
 car
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2'/>\n<circle r='2' cy='17' cx='7'/>\n<path d='M9 17h6'/>\n<circle r='2' cy='17' cx='17'/>\n</svg>\n")


(def
 zap
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'/>\n</svg>\n")


(def
 trello
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<rect y='7' x='7' height='9' width='3'/>\n<rect y='7' x='14' height='5' width='3'/>\n</svg>\n")


(def
 list-checks
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 17 2 2 4-4'/>\n<path d='m3 7 2 2 4-4'/>\n<path d='M13 6h8'/>\n<path d='M13 12h8'/>\n<path d='M13 18h8'/>\n</svg>\n")


(def
 square-pause
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<line y2='9' y1='15' x2='10' x1='10'/>\n<line y2='9' y1='15' x2='14' x1='14'/>\n</svg>\n")


(def
 message-square-reply
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'/>\n<path d='m10 8-3 3 3 3'/>\n<path d='M17 14v-1a2 2 0 0 0-2-2H7'/>\n</svg>\n")


(def
 badge-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<line y2='15' y1='9' x2='9' x1='15'/>\n<line y2='15' y1='9' x2='15' x1='9'/>\n</svg>\n")


(def
 building-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/>\n<path d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/>\n<path d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/>\n<path d='M10 6h4'/>\n<path d='M10 10h4'/>\n<path d='M10 14h4'/>\n<path d='M10 18h4'/>\n</svg>\n")


(def
 chart-no-axes-gantt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 6h10'/>\n<path d='M6 12h9'/>\n<path d='M11 18h7'/>\n</svg>\n")


(def gantt-chart chart-no-axes-gantt)


(def
 moon-star
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 5h4'/>\n<path d='M20 3v4'/>\n<path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'/>\n</svg>\n")


(def
 clock-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l2-4'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 cigarette-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13'/>\n<path d='M18 8c0-2.5-2-2.5-2-5'/>\n<path d='m2 2 20 20'/>\n<path d='M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866'/>\n<path d='M22 8c0-2.5-2-2.5-2-5'/>\n<path d='M7 12v4'/>\n</svg>\n")


(def
 binary
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' height='6' width='4' y='14' x='14'/>\n<rect rx='2' height='6' width='4' y='4' x='6'/>\n<path d='M6 20h4'/>\n<path d='M14 10h4'/>\n<path d='M6 14h2v6'/>\n<path d='M14 4h2v6'/>\n</svg>\n")


(def
 chevron-last
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 18 6-6-6-6'/>\n<path d='M17 6v12'/>\n</svg>\n")


(def
 pointer-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 4.5V4a2 2 0 0 0-2.41-1.957'/>\n<path d='M13.9 8.4a2 2 0 0 0-1.26-1.295'/>\n<path d='M21.7 16.2A8 8 0 0 0 22 14v-3a2 2 0 1 0-4 0v-1a2 2 0 0 0-3.63-1.158'/>\n<path d='m7 15-1.8-1.8a2 2 0 0 0-2.79 2.86L6 19.7a7.74 7.74 0 0 0 6 2.3h2a8 8 0 0 0 5.657-2.343'/>\n<path d='M6 6v8'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 mouse-pointer-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z'/>\n</svg>\n")


(def
 package-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14'/>\n<path d='m7.5 4.27 9 5.15'/>\n<polyline points='3.29 7 12 12 20.71 7'/>\n<line y2='12' y1='22' x2='12' x1='12'/>\n<circle r='2.5' cy='15.5' cx='18.5'/>\n<path d='M20.27 17.27 22 19'/>\n</svg>\n")


(def
 mic-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 19v3'/>\n<path d='M15 9.34V5a3 3 0 0 0-5.68-1.33'/>\n<path d='M16.95 16.95A7 7 0 0 1 5 12v-2'/>\n<path d='M18.89 13.23A7 7 0 0 0 19 12v-2'/>\n<path d='m2 2 20 20'/>\n<path d='M9 9v3a3 3 0 0 0 5.12 2.12'/>\n</svg>\n")


(def
 lamp-desk
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414z'/>\n<path d='m14.207 4.793-3.414 3.414'/>\n<path d='M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z'/>\n<path d='m9.086 6.5-4.793 4.793a1 1 0 0 0-.18 1.17L7 18'/>\n</svg>\n")


(def
 share
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v13'/>\n<path d='m16 6-4-4-4 4'/>\n<path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'/>\n</svg>\n")


(def
 circle-parking-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.656 7H13a3 3 0 0 1 2.984 3.307'/>\n<path d='M13 13H9'/>\n<path d='M19.071 19.071A1 1 0 0 1 4.93 4.93'/>\n<path d='m2 2 20 20'/>\n<path d='M8.357 2.687a10 10 0 0 1 12.956 12.956'/>\n<path d='M9 17V9'/>\n</svg>\n")


(def parking-circle-off circle-parking-off)


(def
 tags
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z'/>\n<path d='M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193'/>\n<circle fill='currentColor' r='.5' cy='6.5' cx='10.5'/>\n</svg>\n")


(def
 square-bottom-dashed-scissors
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2'/>\n<path d='M10 22H8'/>\n<path d='M16 22h-2'/>\n<circle r='2' cy='8' cx='8'/>\n<path d='M9.414 9.414 12 12'/>\n<path d='M14.8 14.8 18 18'/>\n<circle r='2' cy='16' cx='8'/>\n<path d='m18 6-8.586 8.586'/>\n</svg>\n")


(def scissors-square-dashed-bottom square-bottom-dashed-scissors)


(def
 album
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='3' x='3' height='18' width='18'/>\n<polyline points='11 3 11 11 14 8 17 11 17 3'/>\n</svg>\n")


(def
 key-round
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'/>\n<circle fill='currentColor' r='.5' cy='7.5' cx='16.5'/>\n</svg>\n")


(def
 square-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 9-3 3 3 3'/>\n<path d='m14 15 3-3-3-3'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def code-square square-code)


(def
 folder-search-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2.5' cy='12.5' cx='11.5'/>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='M13.3 14.3 15 16'/>\n</svg>\n")


(def
 arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m5 12 7-7 7 7'/>\n<path d='M12 19V5'/>\n</svg>\n")


(def
 circle-arrow-out-up-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 8V2h6'/>\n<path d='m2 2 10 10'/>\n<path d='M12 2A10 10 0 1 1 2 12'/>\n</svg>\n")


(def arrow-up-left-from-circle circle-arrow-out-up-left)


(def
 wifi-high
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 20h.01'/>\n<path d='M5 12.859a10 10 0 0 1 14 0'/>\n<path d='M8.5 16.429a5 5 0 0 1 7 0'/>\n</svg>\n")


(def
 microscope
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 18h8'/>\n<path d='M3 22h18'/>\n<path d='M14 22a7 7 0 1 0 0-14h-1'/>\n<path d='M9 14h2'/>\n<path d='M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z'/>\n<path d='M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3'/>\n</svg>\n")


(def
 test-tube
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2'/>\n<path d='M8.5 2h7'/>\n<path d='M14.5 16h-5'/>\n</svg>\n")


(def
 bell-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742'/>\n<path d='m2 2 20 20'/>\n<path d='M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05'/>\n</svg>\n")


(def
 linkedin
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z'/>\n<rect y='9' x='2' height='12' width='4'/>\n<circle r='2' cy='4' cx='4'/>\n</svg>\n")


(def
 arrow-down-narrow-wide
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<path d='M11 4h4'/>\n<path d='M11 8h7'/>\n<path d='M11 12h10'/>\n</svg>\n")


(def
 clock-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6h4'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 panel-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M15 3v18'/>\n</svg>\n")


(def
 drum
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 8 8'/>\n<path d='m22 2-8 8'/>\n<ellipse ry='5' rx='10' cy='9' cx='12'/>\n<path d='M7 13.4v7.9'/>\n<path d='M12 14v8'/>\n<path d='M17 13.4v7.9'/>\n<path d='M2 9v8a10 5 0 0 0 20 0V9'/>\n</svg>\n")


(def
 view
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2'/>\n<path d='M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2'/>\n<circle r='1' cy='12' cx='12'/>\n<path d='M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0'/>\n</svg>\n")


(def
 music-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='18' cx='8'/>\n<path d='M12 18V2l7 4'/>\n</svg>\n")


(def
 wrap-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 16-2 2 2 2'/>\n<path d='M3 12h15a3 3 0 1 1 0 6h-4'/>\n<path d='M3 18h7'/>\n<path d='M3 6h18'/>\n</svg>\n")


(def
 git-compare-arrows
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='5'/>\n<path d='M12 6h5a2 2 0 0 1 2 2v7'/>\n<path d='m15 9-3-3 3-3'/>\n<circle r='3' cy='18' cx='19'/>\n<path d='M12 18H7a2 2 0 0 1-2-2V9'/>\n<path d='m9 15 3 3-3 3'/>\n</svg>\n")


(def
 calendar-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 19h6'/>\n<path d='M16 2v4'/>\n<path d='M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 book-image
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m20 13.7-2.1-2.1a2 2 0 0 0-2.8 0L9.7 17'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<circle r='2' cy='8' cx='10'/>\n</svg>\n")


(def
 file-volume-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M8 15h.01'/>\n<path d='M11.5 13.5a2.5 2.5 0 0 1 0 3'/>\n<path d='M15 12a5 5 0 0 1 0 6'/>\n</svg>\n")


(def
 user-round-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21a8 8 0 0 1 11.873-7'/>\n<circle r='5' cy='8' cx='10'/>\n<path d='m17 17 5 5'/>\n<path d='m22 17-5 5'/>\n</svg>\n")


(def user-x-2 user-round-x)


(def
 undo
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 7v6h6'/>\n<path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'/>\n</svg>\n")


(def
 video
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5'/>\n<rect rx='2' height='12' width='14' y='6' x='2'/>\n</svg>\n")


(def
 circle-ellipsis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M17 12h.01'/>\n<path d='M12 12h.01'/>\n<path d='M7 12h.01'/>\n</svg>\n")


(def
 id-card
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 10h2'/>\n<path d='M16 14h2'/>\n<path d='M6.17 15a3 3 0 0 1 5.66 0'/>\n<circle r='2' cy='11' cx='9'/>\n<rect rx='2' height='14' width='20' y='5' x='2'/>\n</svg>\n")


(def
 activity
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2'/>\n</svg>\n")


(def
 pencil-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 21h8'/>\n<path d='m15 5 4 4'/>\n<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>\n</svg>\n")


(def
 square-stop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<rect rx='1' height='6' width='6' y='9' x='9'/>\n</svg>\n")


(def
 person-standing
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='5' cx='12'/>\n<path d='m9 20 3-6 3 6'/>\n<path d='m6 8 6 2 6-2'/>\n<path d='M12 10v4'/>\n</svg>\n")


(def
 twitter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z'/>\n</svg>\n")


(def
 map-pin
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'/>\n<circle r='3' cy='10' cx='12'/>\n</svg>\n")


(def
 folder-input
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1'/>\n<path d='M2 13h10'/>\n<path d='m9 16 3-3-3-3'/>\n</svg>\n")


(def
 brush-cleaning
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 22-1-4'/>\n<path d='M19 13.99a1 1 0 0 0 1-1V12a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v.99a1 1 0 0 0 1 1'/>\n<path d='M5 14h14l1.973 6.767A1 1 0 0 1 20 22H4a1 1 0 0 1-.973-1.233z'/>\n<path d='m8 22 1-4'/>\n</svg>\n")


(def
 clock-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l1.56.78'/>\n<path d='M13.227 21.925a10 10 0 1 1 8.767-9.588'/>\n<path d='m14 18 4-4 4 4'/>\n<path d='M18 22v-8'/>\n</svg>\n")


(def
 lightbulb-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5'/>\n<path d='m2 2 20 20'/>\n<path d='M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5'/>\n<path d='M9 18h6'/>\n<path d='M10 22h4'/>\n</svg>\n")


(def
 phone-incoming
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 2v6h6'/>\n<path d='m22 2-6 6'/>\n<path d='M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384'/>\n</svg>\n")


(def
 refrigerator
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z'/>\n<path d='M5 10h14'/>\n<path d='M15 7v6'/>\n</svg>\n")


(def
 italic
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='4' y1='4' x2='10' x1='19'/>\n<line y2='20' y1='20' x2='5' x1='14'/>\n<line y2='20' y1='4' x2='9' x1='15'/>\n</svg>\n")


(def
 list-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 12H3'/>\n<path d='M16 6H3'/>\n<path d='M10 18H3'/>\n<path d='M21 6v10a2 2 0 0 1-2 2h-5'/>\n<path d='m16 16-2 2 2 2'/>\n</svg>\n")


(def
 handshake
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 17 2 2a1 1 0 1 0 3-3'/>\n<path d='m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4'/>\n<path d='m21 3 1 11h-2'/>\n<path d='M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3'/>\n<path d='M3 4h8'/>\n</svg>\n")


(def
 map-pin-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728'/>\n<circle r='3' cy='10' cx='12'/>\n<path d='m16 18 2 2 4-4'/>\n</svg>\n")


(def
 chevrons-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 17-5-5 5-5'/>\n<path d='m18 17-5-5 5-5'/>\n</svg>\n")


(def
 rows-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 12h18'/>\n</svg>\n")


(def rows rows-2)


(def
 mail-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='m17 17 4 4'/>\n<path d='m21 17-4 4'/>\n</svg>\n")


(def
 medal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15'/>\n<path d='M11 12 5.12 2.2'/>\n<path d='m13 12 5.88-9.8'/>\n<path d='M8 7h8'/>\n<circle r='5' cy='17' cx='12'/>\n<path d='M12 18v-2h-.5'/>\n</svg>\n")


(def
 message-circle-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10 9-3 3 3 3'/>\n<path d='m14 15 3-3-3-3'/>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n</svg>\n")


(def
 calendar
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n</svg>\n")


(def
 inspection-panel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 7h.01'/>\n<path d='M17 7h.01'/>\n<path d='M7 17h.01'/>\n<path d='M17 17h.01'/>\n</svg>\n")


(def
 notepad-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M12 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='4' height='18' width='16'/>\n<path d='M8 10h6'/>\n<path d='M8 14h8'/>\n<path d='M8 18h5'/>\n</svg>\n")


(def
 message-circle-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='m15 9-6 6'/>\n<path d='m9 9 6 6'/>\n</svg>\n")


(def
 arrow-right-from-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 5v14'/>\n<path d='M21 12H7'/>\n<path d='m15 18 6-6-6-6'/>\n</svg>\n")


(def
 tool-case
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 15h4'/>\n<path d='m14.817 10.995-.971-1.45 1.034-1.232a2 2 0 0 0-2.025-3.238l-1.82.364L9.91 3.885a2 2 0 0 0-3.625.748L6.141 6.55l-1.725.426a2 2 0 0 0-.19 3.756l.657.27'/>\n<path d='m18.822 10.995 2.26-5.38a1 1 0 0 0-.557-1.318L16.954 2.9a1 1 0 0 0-1.281.533l-.924 2.122'/>\n<path d='M4 12.006A1 1 0 0 1 4.994 11H19a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'/>\n</svg>\n")


(def
 globe
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/>\n<path d='M2 12h20'/>\n</svg>\n")


(def
 arrow-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12 19-7-7 7-7'/>\n<path d='M19 12H5'/>\n</svg>\n")


(def
 paintbrush
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.622 17.897-10.68-2.913'/>\n<path d='M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z'/>\n<path d='M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15'/>\n</svg>\n")


(def
 rows-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M21 9H3'/>\n<path d='M21 15H3'/>\n</svg>\n")


(def panels-top-bottom rows-3)


(def
 align-center
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 12H7'/>\n<path d='M19 18H5'/>\n<path d='M21 6H3'/>\n</svg>\n")


(def
 badge-swiss-franc
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/>\n<path d='M11 17V8h4'/>\n<path d='M11 12h3'/>\n<path d='M9 16h4'/>\n</svg>\n")


(def
 cross
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z'/>\n</svg>\n")


(def
 square-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def minus-square square-minus)


(def
 university
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 21v-3a2 2 0 0 0-4 0v3'/>\n<path d='M18 12h.01'/>\n<path d='M18 16h.01'/>\n<path d='M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z'/>\n<path d='M6 12h.01'/>\n<path d='M6 16h.01'/>\n<circle r='2' cy='10' cx='12'/>\n</svg>\n")


(def school-2 university)


(def
 route
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='19' cx='6'/>\n<path d='M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'/>\n<circle r='3' cy='5' cx='18'/>\n</svg>\n")


(def
 circle-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m16 12-4-4-4 4'/>\n<path d='M12 16V8'/>\n</svg>\n")


(def arrow-up-circle circle-arrow-up)


(def
 diameter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='19' cx='19'/>\n<circle r='2' cy='5' cx='5'/>\n<path d='M6.48 3.66a10 10 0 0 1 13.86 13.86'/>\n<path d='m6.41 6.41 11.18 11.18'/>\n<path d='M3.66 6.48a10 10 0 0 0 13.86 13.86'/>\n</svg>\n")


(def
 pc-case
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='5' height='20' width='14'/>\n<path d='M15 14h.01'/>\n<path d='M9 6h6'/>\n<path d='M9 10h6'/>\n</svg>\n")


(def
 ellipsis
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='12' cx='12'/>\n<circle r='1' cy='12' cx='19'/>\n<circle r='1' cy='12' cx='5'/>\n</svg>\n")


(def more-horizontal ellipsis)


(def
 calendar-heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.127 22H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.125'/>\n<path d='M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z'/>\n<path d='M16 2v4'/>\n<path d='M3 10h18'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 book-headphones
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M8 12v-2a4 4 0 0 1 8 0v2'/>\n<circle r='1' cy='12' cx='15'/>\n<circle r='1' cy='12' cx='9'/>\n</svg>\n")


(def
 microchip
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 12h2'/>\n<path d='M18 16h2'/>\n<path d='M18 20h2'/>\n<path d='M18 4h2'/>\n<path d='M18 8h2'/>\n<path d='M4 12h2'/>\n<path d='M4 16h2'/>\n<path d='M4 20h2'/>\n<path d='M4 4h2'/>\n<path d='M4 8h2'/>\n<path d='M8 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-1.5c-.276 0-.494.227-.562.495a2 2 0 0 1-3.876 0C9.994 2.227 9.776 2 9.5 2z'/>\n</svg>\n")


(def
 bottle-wine
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a6 6 0 0 0 1.2 3.6l.6.8A6 6 0 0 1 17 13v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a6 6 0 0 1 1.2-3.6l.6-.8A6 6 0 0 0 10 5z'/>\n<path d='M17 13h-4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4'/>\n</svg>\n")


(def
 arrow-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m7 7 10 10'/>\n<path d='M17 7v10H7'/>\n</svg>\n")


(def
 file-box
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M3 13.1a2 2 0 0 0-1 1.76v3.24a2 2 0 0 0 .97 1.78L6 21.7a2 2 0 0 0 2.03.01L11 19.9a2 2 0 0 0 1-1.76V14.9a2 2 0 0 0-.97-1.78L8 11.3a2 2 0 0 0-2.03-.01Z'/>\n<path d='M7 17v5'/>\n<path d='M11.7 14.2 7 17l-4.7-2.8'/>\n</svg>\n")


(def
 paw-print
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='4' cx='11'/>\n<circle r='2' cy='8' cx='18'/>\n<circle r='2' cy='16' cx='20'/>\n<path d='M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z'/>\n</svg>\n")


(def
 laptop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z'/>\n<path d='M20.054 15.987H3.946'/>\n</svg>\n")


(def
 power-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18.36 6.64A9 9 0 0 1 20.77 15'/>\n<path d='M6.16 6.16a9 9 0 1 0 12.68 12.68'/>\n<path d='M12 2v4'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 redo-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='17' cx='12'/>\n<path d='M21 7v6h-6'/>\n<path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7'/>\n</svg>\n")


(def
 axis-3d
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.5 10.5 15 9'/>\n<path d='M4 4v15a1 1 0 0 0 1 1h15'/>\n<path d='M4.293 19.707 6 18'/>\n<path d='m9 15 1.5-1.5'/>\n</svg>\n")


(def axis-3-d axis-3d)


(def
 chart-area
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<path d='M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z'/>\n</svg>\n")


(def area-chart chart-area)


(def
 arrow-big-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z'/>\n</svg>\n")


(def
 framer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 16V9h14V2H5l14 14h-7m-7 0 7 7v-7m-7 0h7'/>\n</svg>\n")


(def
 keyboard-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M 20 4 A2 2 0 0 1 22 6'/>\n<path d='M 22 6 L 22 16.41'/>\n<path d='M 7 16 L 16 16'/>\n<path d='M 9.69 4 L 20 4'/>\n<path d='M14 8h.01'/>\n<path d='M18 8h.01'/>\n<path d='m2 2 20 20'/>\n<path d='M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2'/>\n<path d='M6 8h.01'/>\n<path d='M8 12h.01'/>\n</svg>\n")


(def
 map-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12'/>\n<path d='M15 5.764V12'/>\n<path d='M18 15v6'/>\n<path d='M21 18h-6'/>\n<path d='M9 3.236v15'/>\n</svg>\n")


(def
 mountain
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m8 3 4 8 5-5 5 15H2L8 3z'/>\n</svg>\n")


(def
 stretch-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='4' x='2' height='6' width='20'/>\n<rect rx='2' y='14' x='2' height='6' width='20'/>\n</svg>\n")


(def
 bell-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.268 21a2 2 0 0 0 3.464 0'/>\n<path d='M13.916 2.314A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.74 7.327A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673 9 9 0 0 1-.585-.665'/>\n<circle r='3' cy='8' cx='18'/>\n</svg>\n")


(def
 clipboard-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='m15 11-6 6'/>\n<path d='m9 11 6 6'/>\n</svg>\n")


(def
 folder-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='M12 10v6'/>\n<path d='m15 13-3 3-3-3'/>\n</svg>\n")


(def
 panel-bottom-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M14 15h1'/>\n<path d='M19 15h2'/>\n<path d='M3 15h2'/>\n<path d='M9 15h1'/>\n</svg>\n")


(def panel-bottom-inactive panel-bottom-dashed)


(def
 volume-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/>\n<line y2='15' y1='9' x2='16' x1='22'/>\n<line y2='15' y1='9' x2='22' x1='16'/>\n</svg>\n")


(def
 music-3
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='4' cy='18' cx='12'/>\n<path d='M16 18V2'/>\n</svg>\n")


(def
 copy-slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='18' x2='18' x1='12'/>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 file-code
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 12.5 8 15l2 2.5'/>\n<path d='m14 12.5 2 2.5-2 2.5'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/>\n</svg>\n")


(def
 save-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 13H8a1 1 0 0 0-1 1v7'/>\n<path d='M14 8h1'/>\n<path d='M17 21v-4'/>\n<path d='m2 2 20 20'/>\n<path d='M20.41 20.41A2 2 0 0 1 19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .59-1.41'/>\n<path d='M29.5 11.5s5 5 4 5'/>\n<path d='M9 3h6.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V15'/>\n</svg>\n")


(def
 move-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 8L2 12L6 16'/>\n<path d='M2 12H22'/>\n</svg>\n")


(def
 slack
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1.5' y='2' x='13' height='8' width='3'/>\n<path d='M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5'/>\n<rect rx='1.5' y='14' x='8' height='8' width='3'/>\n<path d='M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5'/>\n<rect rx='1.5' y='13' x='14' height='3' width='8'/>\n<path d='M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5'/>\n<rect rx='1.5' y='8' x='2' height='3' width='8'/>\n<path d='M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5'/>\n</svg>\n")


(def
 circle-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.1 2.182a10 10 0 0 1 3.8 0'/>\n<path d='M13.9 21.818a10 10 0 0 1-3.8 0'/>\n<path d='M17.609 3.721a10 10 0 0 1 2.69 2.7'/>\n<path d='M2.182 13.9a10 10 0 0 1 0-3.8'/>\n<path d='M20.279 17.609a10 10 0 0 1-2.7 2.69'/>\n<path d='M21.818 10.1a10 10 0 0 1 0 3.8'/>\n<path d='M3.721 6.391a10 10 0 0 1 2.7-2.69'/>\n<path d='M6.391 20.279a10 10 0 0 1-2.69-2.7'/>\n</svg>\n")


(def
 clock-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l4-2'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 user-round-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 21a8 8 0 0 1 13.292-6'/>\n<circle r='5' cy='8' cx='10'/>\n<path d='M22 19h-6'/>\n</svg>\n")


(def user-minus-2 user-round-minus)


(def
 scissors-line-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5.42 9.42 8 12'/>\n<circle r='2' cy='8' cx='4'/>\n<path d='m14 6-8.58 8.58'/>\n<circle r='2' cy='16' cx='4'/>\n<path d='M10.8 14.8 14 18'/>\n<path d='M16 12h-2'/>\n<path d='M22 12h-2'/>\n</svg>\n")


(def
 file-output
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M4 7V4a2 2 0 0 1 2-2 2 2 0 0 0-2 2'/>\n<path d='M4.063 20.999a2 2 0 0 0 2 1L18 22a2 2 0 0 0 2-2V7l-5-5H6'/>\n<path d='m5 11-3 3'/>\n<path d='m5 17-3-3h10'/>\n</svg>\n")


(def
 cloud
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'/>\n</svg>\n")


(def
 hop-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.82 16.12c1.69.6 3.91.79 5.18.85.28.01.53-.09.7-.27'/>\n<path d='M11.14 20.57c.52.24 2.44 1.12 4.08 1.37.46.06.86-.25.9-.71.12-1.52-.3-3.43-.5-4.28'/>\n<path d='M16.13 21.05c1.65.63 3.68.84 4.87.91a.9.9 0 0 0 .7-.26'/>\n<path d='M17.99 5.52a20.83 20.83 0 0 1 3.15 4.5.8.8 0 0 1-.68 1.13c-1.17.1-2.5.02-3.9-.25'/>\n<path d='M20.57 11.14c.24.52 1.12 2.44 1.37 4.08.04.3-.08.59-.31.75'/>\n<path d='M4.93 4.93a10 10 0 0 0-.67 13.4c.35.43.96.4 1.17-.12.69-1.71 1.07-5.07 1.07-6.71 1.34.45 3.1.9 4.88.62a.85.85 0 0 0 .48-.24'/>\n<path d='M5.52 17.99c1.05.95 2.91 2.42 4.5 3.15a.8.8 0 0 0 1.13-.68c.2-2.34-.33-5.3-1.57-8.28'/>\n<path d='M8.35 2.68a10 10 0 0 1 9.98 1.58c.43.35.4.96-.12 1.17-1.5.6-4.3.98-6.07 1.05'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 clock-11
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l-2-4'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 shuffle
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 14 4 4-4 4'/>\n<path d='m18 2 4 4-4 4'/>\n<path d='M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22'/>\n<path d='M2 6h1.972a4 4 0 0 1 3.6 2.2'/>\n<path d='M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45'/>\n</svg>\n")


(def
 quote
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z'/>\n<path d='M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z'/>\n</svg>\n")


(def
 anvil
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4'/>\n<path d='M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z'/>\n<path d='M9 12v5'/>\n<path d='M15 12v5'/>\n<path d='M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1'/>\n</svg>\n")


(def
 washing-machine
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 6h3'/>\n<path d='M17 6h.01'/>\n<rect rx='2' y='2' x='3' height='20' width='18'/>\n<circle r='5' cy='13' cx='12'/>\n<path d='M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5'/>\n</svg>\n")


(def
 grip-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='12' cx='9'/>\n<circle r='1' cy='5' cx='9'/>\n<circle r='1' cy='19' cx='9'/>\n<circle r='1' cy='12' cx='15'/>\n<circle r='1' cy='5' cx='15'/>\n<circle r='1' cy='19' cx='15'/>\n</svg>\n")


(def
 clock-6
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v10'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 drill
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z'/>\n<path d='M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8'/>\n<path d='M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3'/>\n<path d='M18 6h4'/>\n<path d='m5 10-2 8'/>\n<path d='m7 18 2-8'/>\n</svg>\n")


(def
 align-horizontal-distribute-start
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='4' height='14' width='6'/>\n<rect rx='2' y='7' x='14' height='10' width='6'/>\n<path d='M4 2v20'/>\n<path d='M14 2v20'/>\n</svg>\n")


(def
 list-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 18H3'/>\n<path d='m15 18 2 2 4-4'/>\n<path d='M16 12H3'/>\n<path d='M16 6H3'/>\n</svg>\n")


(def
 file-type
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M9 13v-1h6v1'/>\n<path d='M12 12v6'/>\n<path d='M11 18h2'/>\n</svg>\n")


(def
 rewind
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z'/>\n<path d='M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z'/>\n</svg>\n")


(def
 wine-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 22h8'/>\n<path d='M7 10h3m7 0h-1.343'/>\n<path d='M12 15v7'/>\n<path d='M7.307 7.307A12.33 12.33 0 0 0 7 10a5 5 0 0 0 7.391 4.391M8.638 2.981C8.75 2.668 8.872 2.34 9 2h6c1.5 4 2 6 2 8 0 .407-.05.809-.145 1.198'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 circle-fading-arrow-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2a10 10 0 0 1 7.38 16.75'/>\n<path d='m16 12-4-4-4 4'/>\n<path d='M12 16V8'/>\n<path d='M2.5 8.875a10 10 0 0 0-.5 3'/>\n<path d='M2.83 16a10 10 0 0 0 2.43 3.4'/>\n<path d='M4.636 5.235a10 10 0 0 1 .891-.857'/>\n<path d='M8.644 21.42a10 10 0 0 0 7.631-.38'/>\n</svg>\n")


(def
 upload
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v12'/>\n<path d='m17 8-5-5-5 5'/>\n<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/>\n</svg>\n")


(def
 trending-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 17h6v-6'/>\n<path d='m22 17-8.5-8.5-5 5L2 7'/>\n</svg>\n")


(def
 bookmark-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z'/>\n<path d='m9 10 2 2 4-4'/>\n</svg>\n")


(def
 fold-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 22v-6'/>\n<path d='M12 8V2'/>\n<path d='M4 12H2'/>\n<path d='M10 12H8'/>\n<path d='M16 12h-2'/>\n<path d='M22 12h-2'/>\n<path d='m15 19-3-3-3 3'/>\n<path d='m15 5-3 3-3-3'/>\n</svg>\n")


(def
 calendar-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n<path d='m14 14-4 4'/>\n<path d='m10 14 4 4'/>\n</svg>\n")


(def
 closed-caption
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 9.17a3 3 0 1 0 0 5.66'/>\n<path d='M17 9.17a3 3 0 1 0 0 5.66'/>\n<rect rx='2' height='14' width='20' y='5' x='2'/>\n</svg>\n")


(def
 pause
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' height='18' width='5' y='3' x='14'/>\n<rect rx='1' height='18' width='5' y='3' x='5'/>\n</svg>\n")


(def
 radical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12h3.28a1 1 0 0 1 .948.684l2.298 7.934a.5.5 0 0 0 .96-.044L13.82 4.771A1 1 0 0 1 14.792 4H21'/>\n</svg>\n")


(def
 arrow-big-up-dash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z'/>\n<path d='M9 20h6'/>\n</svg>\n")


(def
 squircle-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.77 3.043a34 34 0 0 0-3.54 0'/>\n<path d='M13.771 20.956a33 33 0 0 1-3.541.001'/>\n<path d='M20.18 17.74c-.51 1.15-1.29 1.93-2.439 2.44'/>\n<path d='M20.18 6.259c-.51-1.148-1.291-1.929-2.44-2.438'/>\n<path d='M20.957 10.23a33 33 0 0 1 0 3.54'/>\n<path d='M3.043 10.23a34 34 0 0 0 .001 3.541'/>\n<path d='M6.26 20.179c-1.15-.508-1.93-1.29-2.44-2.438'/>\n<path d='M6.26 3.82c-1.149.51-1.93 1.291-2.44 2.44'/>\n</svg>\n")


(def
 folder-key
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='20' cx='16'/>\n<path d='M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2'/>\n<path d='m22 14-4.5 4.5'/>\n<path d='m21 15 1 1'/>\n</svg>\n")


(def
 grid-2x2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v18'/>\n<path d='M3 12h18'/>\n<rect rx='2' height='18' width='18' y='3' x='3'/>\n</svg>\n")


(def grid-2-x-2 grid-2x2)


(def
 cloud-hail
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'/>\n<path d='M16 14v2'/>\n<path d='M8 14v2'/>\n<path d='M16 20h.01'/>\n<path d='M8 20h.01'/>\n<path d='M12 16v2'/>\n<path d='M12 22h.01'/>\n</svg>\n")


(def
 search-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m13.5 8.5-5 5'/>\n<path d='m8.5 8.5 5 5'/>\n<circle r='8' cy='11' cx='11'/>\n<path d='m21 21-4.3-4.3'/>\n</svg>\n")


(def
 cloudy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17.5 21H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'/>\n<path d='M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5'/>\n</svg>\n")


(def
 replace
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 4a2 2 0 0 1 2-2'/>\n<path d='M16 10a2 2 0 0 1-2-2'/>\n<path d='M20 2a2 2 0 0 1 2 2'/>\n<path d='M22 8a2 2 0 0 1-2 2'/>\n<path d='m3 7 3 3 3-3'/>\n<path d='M6 10V5a3 3 0 0 1 3-3h1'/>\n<rect rx='2' height='8' width='8' y='14' x='2'/>\n</svg>\n")


(def
 forward
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 17 5-5-5-5'/>\n<path d='M4 18v-2a4 4 0 0 1 4-4h12'/>\n</svg>\n")


(def
 mountain-snow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m8 3 4 8 5-5 5 15H2L8 3z'/>\n<path d='M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19'/>\n</svg>\n")


(def
 indent-decrease
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 12H11'/>\n<path d='M21 18H11'/>\n<path d='M21 6H11'/>\n<path d='m7 8-4 4 4 4'/>\n</svg>\n")


(def outdent indent-decrease)


(def
 circle-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def minus-circle circle-minus)


(def
 dices
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='10' x='2' height='12' width='12'/>\n<path d='m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6'/>\n<path d='M6 18h.01'/>\n<path d='M10 14h.01'/>\n<path d='M15 6h.01'/>\n<path d='M18 9h.01'/>\n</svg>\n")


(def
 blend
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='7' cy='9' cx='9'/>\n<circle r='7' cy='15' cx='15'/>\n</svg>\n")


(def
 bookmark
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'/>\n</svg>\n")


(def
 funnel-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348'/>\n<path d='M16 6h6'/>\n<path d='M19 3v6'/>\n</svg>\n")


(def
 braces
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1'/>\n<path d='M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1'/>\n</svg>\n")


(def curly-braces braces)


(def
 rocket
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'/>\n<path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'/>\n<path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'/>\n<path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'/>\n</svg>\n")


(def
 circle-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='1' cy='12' cx='12'/>\n</svg>\n")


(def
 move-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 8L22 12L18 16'/>\n<path d='M2 12H22'/>\n</svg>\n")


(def
 drama
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 11h.01'/>\n<path d='M14 6h.01'/>\n<path d='M18 6h.01'/>\n<path d='M6.5 13.1h.01'/>\n<path d='M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3'/>\n<path d='M17.4 9.9c-.8.8-2 .8-2.8 0'/>\n<path d='M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7'/>\n<path d='M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4'/>\n</svg>\n")


(def
 asterisk
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v12'/>\n<path d='M17.196 9 6.804 15'/>\n<path d='m6.804 9 10.392 6'/>\n</svg>\n")


(def
 user-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 11 2 2 4-4'/>\n<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>\n<circle r='4' cy='7' cx='9'/>\n</svg>\n")


(def
 calendar-clock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 14v2.2l1.6 1'/>\n<path d='M16 2v4'/>\n<path d='M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5'/>\n<path d='M3 10h5'/>\n<path d='M8 2v4'/>\n<circle r='6' cy='16' cx='16'/>\n</svg>\n")


(def
 fish-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 12.47v.03m0-.5v.47m-.475 5.056A6.744 6.744 0 0 1 15 18c-3.56 0-7.56-2.53-8.5-6 .348-1.28 1.114-2.433 2.121-3.38m3.444-2.088A8.802 8.802 0 0 1 15 6c3.56 0 6.06 2.54 7 6-.309 1.14-.786 2.177-1.413 3.058'/>\n<path d='M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33m7.48-4.372A9.77 9.77 0 0 1 16 6.07m0 11.86a9.77 9.77 0 0 1-1.728-3.618'/>\n<path d='m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98M8.53 3h5.27a2 2 0 0 1 1.98 1.67l.23 1.4M2 2l20 20'/>\n</svg>\n")


(def
 folder-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1'/>\n<path d='m21 21-1.9-1.9'/>\n<circle r='3' cy='17' cx='17'/>\n</svg>\n")


(def
 folder-pen
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5'/>\n<path d='M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'/>\n</svg>\n")


(def folder-edit folder-pen)


(def
 cloud-sun-rain
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v2'/>\n<path d='m4.93 4.93 1.41 1.41'/>\n<path d='M20 12h2'/>\n<path d='m19.07 4.93-1.41 1.41'/>\n<path d='M15.947 12.65a4 4 0 0 0-5.925-4.128'/>\n<path d='M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24'/>\n<path d='M11 20v2'/>\n<path d='M7 19v2'/>\n</svg>\n")


(def
 file-chart-pie
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.5'/>\n<path d='M4.017 11.512a6 6 0 1 0 8.466 8.475'/>\n<path d='M9 16a1 1 0 0 1-1-1v-4c0-.552.45-1.008.995-.917a6 6 0 0 1 4.922 4.922c.091.544-.365.995-.917.995z'/>\n</svg>\n")


(def file-pie-chart file-chart-pie)


(def
 git-pull-request-create
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='6' cx='6'/>\n<path d='M6 9v12'/>\n<path d='M13 6h3a2 2 0 0 1 2 2v3'/>\n<path d='M18 15v6'/>\n<path d='M21 18h-6'/>\n</svg>\n")


(def
 tablet
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='2' x='4' height='20' width='16'/>\n<line y2='18' y1='18' x2='12.01' x1='12'/>\n</svg>\n")


(def
 mail-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8'/>\n<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>\n<path d='m16 19 2 2 4-4'/>\n</svg>\n")


(def
 align-vertical-justify-center
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='16' x='5' height='6' width='14'/>\n<rect rx='2' y='2' x='7' height='6' width='10'/>\n<path d='M2 12h20'/>\n</svg>\n")


(def
 file-diff
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M9 10h6'/>\n<path d='M12 13V7'/>\n<path d='M9 17h6'/>\n</svg>\n")


(def
 monitor-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17v4'/>\n<path d='M22 12.307V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693'/>\n<path d='M8 21h8'/>\n<circle r='3' cy='6' cx='19'/>\n</svg>\n")


(def
 ticket-slash
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='m9.5 14.5 5-5'/>\n</svg>\n")


(def
 align-horizontal-space-between
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='3' height='14' width='6'/>\n<rect rx='2' y='7' x='15' height='10' width='6'/>\n<path d='M3 2v20'/>\n<path d='M21 2v20'/>\n</svg>\n")


(def
 webhook
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2'/>\n<path d='m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06'/>\n<path d='m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8'/>\n</svg>\n")


(def
 briefcase-conveyor-belt
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 20v2'/>\n<path d='M14 20v2'/>\n<path d='M18 20v2'/>\n<path d='M21 20H3'/>\n<path d='M6 20v2'/>\n<path d='M8 16V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12'/>\n<rect rx='2' height='10' width='16' y='6' x='4'/>\n</svg>\n")


(def
 diamond-percent
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z'/>\n<path d='M9.2 9.2h.01'/>\n<path d='m14.5 9.5-5 5'/>\n<path d='M14.7 14.8h.01'/>\n</svg>\n")


(def percent-diamond diamond-percent)


(def
 folder-open-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2'/>\n<circle r='1' cy='15' cx='14'/>\n</svg>\n")


(def
 arrow-left-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3 4 7l4 4'/>\n<path d='M4 7h16'/>\n<path d='m16 21 4-4-4-4'/>\n<path d='M20 17H4'/>\n</svg>\n")


(def
 code-xml
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m18 16 4-4-4-4'/>\n<path d='m6 8-4 4 4 4'/>\n<path d='m14.5 4-5 16'/>\n</svg>\n")


(def code-2 code-xml)


(def
 cloud-download
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13v8l-4-4'/>\n<path d='m12 21 4-4'/>\n<path d='M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284'/>\n</svg>\n")


(def download-cloud cloud-download)


(def
 utility-pole
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v20'/>\n<path d='M2 5h20'/>\n<path d='M3 3v2'/>\n<path d='M7 3v2'/>\n<path d='M17 3v2'/>\n<path d='M21 3v2'/>\n<path d='m19 5-7 7-7-7'/>\n</svg>\n")


(def
 square-dashed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 3a2 2 0 0 0-2 2'/>\n<path d='M19 3a2 2 0 0 1 2 2'/>\n<path d='M21 19a2 2 0 0 1-2 2'/>\n<path d='M5 21a2 2 0 0 1-2-2'/>\n<path d='M9 3h1'/>\n<path d='M9 21h1'/>\n<path d='M14 3h1'/>\n<path d='M14 21h1'/>\n<path d='M3 9v1'/>\n<path d='M21 9v1'/>\n<path d='M3 14v1'/>\n<path d='M21 14v1'/>\n</svg>\n")


(def box-select square-dashed)


(def
 signal-zero
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20h.01'/>\n</svg>\n")


(def
 squares-unite
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z'/>\n</svg>\n")


(def
 book-up-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 13V7'/>\n<path d='M18 2h1a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2'/>\n<path d='m9 10 3-3 3 3'/>\n<path d='m9 5 3-3 3 3'/>\n</svg>\n")


(def
 monitor-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 17H4a2 2 0 0 1-2-2V5c0-1.5 1-2 1-2'/>\n<path d='M22 15V5a2 2 0 0 0-2-2H9'/>\n<path d='M8 21h8'/>\n<path d='M12 17v4'/>\n<path d='m2 2 20 20'/>\n</svg>\n")


(def
 ear
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0'/>\n<path d='M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4'/>\n</svg>\n")


(def
 spell-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m6 16 6-12 6 12'/>\n<path d='M8 12h8'/>\n<path d='m16 20 2 2 4-4'/>\n</svg>\n")


(def
 file-terminal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m8 16 2-2-2-2'/>\n<path d='M12 18h4'/>\n</svg>\n")


(def
 flame
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/>\n</svg>\n")


(def
 gallery-horizontal-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 7v10'/>\n<path d='M6 5v14'/>\n<rect rx='2' y='3' x='10' height='18' width='12'/>\n</svg>\n")


(def
 nut-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 4V2'/>\n<path d='M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592a7.01 7.01 0 0 0 4.125-2.939'/>\n<path d='M19 10v3.343'/>\n<path d='M12 12c-1.349-.573-1.905-1.005-2.5-2-.546.902-1.048 1.353-2.5 2-1.018-.644-1.46-1.08-2-2-1.028.71-1.69.918-3 1 1.081-1.048 1.757-2.03 2-3 .194-.776.84-1.551 1.79-2.21m11.654 5.997c.887-.457 1.28-.891 1.556-1.787 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4-.74 0-1.461.068-2.15.192'/>\n<line y2='22' y1='2' x2='22' x1='2'/>\n</svg>\n")


(def
 component
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z'/>\n<path d='M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z'/>\n<path d='M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z'/>\n<path d='M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z'/>\n</svg>\n")


(def
 wifi-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.305 19.53.923-.382'/>\n<path d='m15.228 16.852-.923-.383'/>\n<path d='m16.852 15.228-.383-.923'/>\n<path d='m16.852 20.772-.383.924'/>\n<path d='m19.148 15.228.383-.923'/>\n<path d='m19.53 21.696-.382-.924'/>\n<path d='M2 7.82a15 15 0 0 1 20 0'/>\n<path d='m20.772 16.852.924-.383'/>\n<path d='m20.772 19.148.924.383'/>\n<path d='M5 11.858a10 10 0 0 1 11.5-1.785'/>\n<path d='M8.5 15.429a5 5 0 0 1 2.413-1.31'/>\n<circle r='3' cy='18' cx='18'/>\n</svg>\n")


(def
 circle-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 20 20'/>\n<path d='M8.35 2.69A10 10 0 0 1 21.3 15.65'/>\n<path d='M19.08 19.08A10 10 0 1 1 4.92 4.92'/>\n</svg>\n")


(def
 file-search-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<circle r='2.5' cy='14.5' cx='11.5'/>\n<path d='M13.3 16.3 15 18'/>\n</svg>\n")


(def
 align-start-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='6' x='4' height='16' width='6'/>\n<rect rx='2' y='6' x='14' height='9' width='6'/>\n<path d='M22 2H2'/>\n</svg>\n")


(def
 locate-fixed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='12' x2='5' x1='2'/>\n<line y2='12' y1='12' x2='22' x1='19'/>\n<line y2='5' y1='2' x2='12' x1='12'/>\n<line y2='22' y1='19' x2='12' x1='12'/>\n<circle r='7' cy='12' cx='12'/>\n<circle r='3' cy='12' cx='12'/>\n</svg>\n")


(def
 lock-open
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='11' x='3' height='11' width='18'/>\n<path d='M7 11V7a5 5 0 0 1 9.9-1'/>\n</svg>\n")


(def unlock lock-open)


(def
 loader-pinwheel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0'/>\n<path d='M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6'/>\n<path d='M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 atom
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='12' cx='12'/>\n<path d='M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z'/>\n<path d='M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z'/>\n</svg>\n")


(def
 cat
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z'/>\n<path d='M8 14v.5'/>\n<path d='M16 14v.5'/>\n<path d='M11.25 16.25h1.5L12 17l-.75-.75Z'/>\n</svg>\n")


(def
 cloud-cog
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m10.852 19.772-.383.924'/>\n<path d='m13.148 14.228.383-.923'/>\n<path d='M13.148 19.772a3 3 0 1 0-2.296-5.544l-.383-.923'/>\n<path d='m13.53 20.696-.382-.924a3 3 0 1 1-2.296-5.544'/>\n<path d='m14.772 15.852.923-.383'/>\n<path d='m14.772 18.148.923.383'/>\n<path d='M4.2 15.1a7 7 0 1 1 9.93-9.858A7 7 0 0 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2'/>\n<path d='m9.228 15.852-.923-.383'/>\n<path d='m9.228 18.148-.923.383'/>\n</svg>\n")


(def
 sword
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/>\n<line y2='13' y1='19' x2='19' x1='13'/>\n<line y2='20' y1='16' x2='20' x1='16'/>\n<line y2='19' y1='21' x2='21' x1='19'/>\n</svg>\n")


(def
 square-pilcrow
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M12 12H9.5a2.5 2.5 0 0 1 0-5H17'/>\n<path d='M12 7v10'/>\n<path d='M16 7v10'/>\n</svg>\n")


(def pilcrow-square square-pilcrow)


(def
 squirrel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15.236 22a3 3 0 0 0-2.2-5'/>\n<path d='M16 20a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4V4'/>\n<path d='M18 13h.01'/>\n<path d='M18 6a4 4 0 0 0-4 4 7 7 0 0 0-7 7c0-5 4-5 4-10.5a4.5 4.5 0 1 0-9 0 2.5 2.5 0 0 0 5 0C7 10 3 11 3 17c0 2.8 2.2 5 5 5h10'/>\n</svg>\n")


(def
 menu
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 12h16'/>\n<path d='M4 18h16'/>\n<path d='M4 6h16'/>\n</svg>\n")


(def
 pin-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 17v5'/>\n<path d='M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89'/>\n<path d='m2 2 20 20'/>\n<path d='M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11'/>\n</svg>\n")


(def
 venus-and-mars
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 20h4'/>\n<path d='M12 16v6'/>\n<path d='M17 2h4v4'/>\n<path d='m21 2-5.46 5.46'/>\n<circle r='5' cy='11' cx='12'/>\n</svg>\n")


(def
 lamp-ceiling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v5'/>\n<path d='M14.829 15.998a3 3 0 1 1-5.658 0'/>\n<path d='M20.92 14.606A1 1 0 0 1 20 16H4a1 1 0 0 1-.92-1.394l3-7A1 1 0 0 1 7 7h10a1 1 0 0 1 .92.606z'/>\n</svg>\n")


(def
 folder-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'/>\n<circle r='1' cy='13' cx='12'/>\n</svg>\n")


(def
 utensils-crossed
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8'/>\n<path d='M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7'/>\n<path d='m2.1 21.8 6.4-6.3'/>\n<path d='m19 5-7 7'/>\n</svg>\n")


(def fork-knife-crossed utensils-crossed)


(def
 georgian-lari
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11.5 21a7.5 7.5 0 1 1 7.35-9'/>\n<path d='M13 12V3'/>\n<path d='M4 21h16'/>\n<path d='M9 12V3'/>\n</svg>\n")


(def
 ratio
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='6' height='20' width='12'/>\n<rect rx='2' y='6' x='2' height='12' width='20'/>\n</svg>\n")


(def
 square-arrow-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m16 8-8 8'/>\n<path d='M16 16H8V8'/>\n</svg>\n")


(def arrow-down-left-square square-arrow-down-left)


(def
 grid-2x2-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3'/>\n<path d='m16 16 5 5'/>\n<path d='m16 21 5-5'/>\n</svg>\n")


(def grid-2-x-2-x grid-2x2-x)


(def
 octagon-alert
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 16h.01'/>\n<path d='M12 8v4'/>\n<path d='M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z'/>\n</svg>\n")


(def alert-octagon octagon-alert)


(def
 gallery-vertical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 2h18'/>\n<rect rx='2' y='6' x='3' height='12' width='18'/>\n<path d='M3 22h18'/>\n</svg>\n")


(def
 image-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7'/>\n<line y2='5' y1='5' x2='22' x1='16'/>\n<circle r='2' cy='9' cx='9'/>\n<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/>\n</svg>\n")


(def
 clock-7
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l-2 4'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 arrow-right-to-line
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 12H3'/>\n<path d='m11 18 6-6-6-6'/>\n<path d='M21 5v14'/>\n</svg>\n")


(def
 a-arrow-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 12 4 4 4-4'/>\n<path d='M18 16V7'/>\n<path d='m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16'/>\n<path d='M3.304 13h6.392'/>\n</svg>\n")


(def
 merge
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m8 6 4-4 4 4'/>\n<path d='M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22'/>\n<path d='m20 22-5-5'/>\n</svg>\n")


(def
 map-pinned
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0'/>\n<circle r='2' cy='8' cx='12'/>\n<path d='M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712'/>\n</svg>\n")


(def
 square-pi
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 7h10'/>\n<path d='M10 7v10'/>\n<path d='M16 17a2 2 0 0 1-2-2V7'/>\n</svg>\n")


(def pi-square square-pi)


(def
 align-horizontal-space-around
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='7' x='9' height='10' width='6'/>\n<path d='M4 22V2'/>\n<path d='M20 22V2'/>\n</svg>\n")


(def
 chrome
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<circle r='4' cy='12' cx='12'/>\n<line y2='8' y1='8' x2='12' x1='21.17'/>\n<line y2='14' y1='6.06' x2='8.54' x1='3.95'/>\n<line y2='14' y1='21.94' x2='15.46' x1='10.88'/>\n</svg>\n")


(def
 sticky-note
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z'/>\n<path d='M15 3v4a2 2 0 0 0 2 2h4'/>\n</svg>\n")


(def
 ticket-plus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='M9 12h6'/>\n<path d='M12 9v6'/>\n</svg>\n")


(def
 shopping-cart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='21' cx='8'/>\n<circle r='1' cy='21' cx='19'/>\n<path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/>\n</svg>\n")


(def
 copy-x
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='18' y1='12' x2='18' x1='12'/>\n<line y2='12' y1='18' x2='18' x1='12'/>\n<rect ry='2' rx='2' y='8' x='8' height='14' width='14'/>\n<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>\n</svg>\n")


(def
 calculator
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='2' x='4' height='20' width='16'/>\n<line y2='6' y1='6' x2='16' x1='8'/>\n<line y2='18' y1='14' x2='16' x1='16'/>\n<path d='M16 10h.01'/>\n<path d='M12 10h.01'/>\n<path d='M8 10h.01'/>\n<path d='M12 14h.01'/>\n<path d='M8 14h.01'/>\n<path d='M12 18h.01'/>\n<path d='M8 18h.01'/>\n</svg>\n")


(def
 clock-10
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l-4-2'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 train-front-tunnel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 22V12a10 10 0 1 1 20 0v10'/>\n<path d='M15 6.8v1.4a3 2.8 0 1 1-6 0V6.8'/>\n<path d='M10 15h.01'/>\n<path d='M14 15h.01'/>\n<path d='M10 19a4 4 0 0 1-4-4v-3a6 6 0 1 1 12 0v3a4 4 0 0 1-4 4Z'/>\n<path d='m9 19-2 3'/>\n<path d='m15 19 2 3'/>\n</svg>\n")


(def
 clock-12
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 apple
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6.528V3a1 1 0 0 1 1-1h0'/>\n<path d='M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21'/>\n</svg>\n")


(def
 circle-chevron-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='m14 16-4-4 4-4'/>\n</svg>\n")


(def chevron-left-circle circle-chevron-left)


(def
 mouse
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='7' height='20' width='14' y='2' x='5'/>\n<path d='M12 6v4'/>\n</svg>\n")


(def
 flask-conical
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2'/>\n<path d='M6.453 15h11.094'/>\n<path d='M8.5 2h7'/>\n</svg>\n")


(def
 picture-in-picture-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4'/>\n<rect rx='2' y='13' x='12' height='7' width='10'/>\n</svg>\n")


(def
 pentagon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z'/>\n</svg>\n")


(def
 diamond-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z'/>\n<path d='M8 12h8'/>\n</svg>\n")


(def
 waves-ladder
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19 5a2 2 0 0 0-2 2v11'/>\n<path d='M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>\n<path d='M7 13h10'/>\n<path d='M7 9h10'/>\n<path d='M9 5a2 2 0 0 0-2 2v11'/>\n</svg>\n")


(def
 shield-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='m9 12 2 2 4-4'/>\n</svg>\n")


(def
 arrow-down-0-1
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m3 16 4 4 4-4'/>\n<path d='M7 20V4'/>\n<rect ry='2' height='6' width='4' y='4' x='15'/>\n<path d='M17 20v-6h-2'/>\n<path d='M15 20h4'/>\n</svg>\n")


(def arrow-down-01 arrow-down-0-1)


(def
 message-circle-reply
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719'/>\n<path d='m10 15-3-3 3-3'/>\n<path d='M7 12h8a2 2 0 0 1 2 2v1'/>\n</svg>\n")


(def
 circle-pause
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<line y2='9' y1='15' x2='10' x1='10'/>\n<line y2='9' y1='15' x2='14' x1='14'/>\n</svg>\n")


(def pause-circle circle-pause)


(def
 mails
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732'/>\n<path d='m22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5'/>\n<rect rx='2' height='12' width='15' y='3' x='7'/>\n</svg>\n")


(def
 clock-5
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l2 4'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 rectangle-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='6' x='2' height='12' width='20'/>\n</svg>\n")


(def
 shopping-basket
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 11-1 9'/>\n<path d='m19 11-4-7'/>\n<path d='M2 11h20'/>\n<path d='m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4'/>\n<path d='M4.5 15.5h15'/>\n<path d='m5 11 4-7'/>\n<path d='m9 11 1 9'/>\n</svg>\n")


(def
 list-filter
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 6h18'/>\n<path d='M7 12h10'/>\n<path d='M10 18h4'/>\n</svg>\n")


(def
 receipt-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z'/>\n<path d='M14 8H8'/>\n<path d='M16 12H8'/>\n<path d='M13 16H8'/>\n</svg>\n")


(def
 music-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M9 18V5l12-2v13'/>\n<path d='m9 9 12-2'/>\n<circle r='3' cy='18' cx='6'/>\n<circle r='3' cy='16' cx='18'/>\n</svg>\n")


(def
 book-user
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 13a3 3 0 1 0-6 0'/>\n<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>\n<circle r='2' cy='8' cx='12'/>\n</svg>\n")


(def
 shield-ban
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>\n<path d='m4.243 5.21 14.39 12.472'/>\n</svg>\n")


(def
 arrow-down-to-dot
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 2v14'/>\n<path d='m19 9-7 7-7-7'/>\n<circle r='1' cy='21' cx='12'/>\n</svg>\n")


(def
 building
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='2' rx='2' y='2' x='4' height='20' width='16'/>\n<path d='M9 22v-4h6v4'/>\n<path d='M8 6h.01'/>\n<path d='M16 6h.01'/>\n<path d='M12 6h.01'/>\n<path d='M12 10h.01'/>\n<path d='M12 14h.01'/>\n<path d='M16 10h.01'/>\n<path d='M16 14h.01'/>\n<path d='M8 10h.01'/>\n<path d='M8 14h.01'/>\n</svg>\n")


(def
 clipboard-copy
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v4'/>\n<path d='M21 14H11'/>\n<path d='m15 10-4 4 4 4'/>\n</svg>\n")


(def
 binoculars
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M10 10h4'/>\n<path d='M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3'/>\n<path d='M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z'/>\n<path d='M 22 16 L 2 16'/>\n<path d='M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z'/>\n<path d='M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3'/>\n</svg>\n")


(def
 angry
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='10' cy='12' cx='12'/>\n<path d='M16 16s-1.5-2-4-2-4 2-4 2'/>\n<path d='M7.5 8 10 9'/>\n<path d='m14 9 2.5-1'/>\n<path d='M9 10h.01'/>\n<path d='M15 10h.01'/>\n</svg>\n")


(def
 lollipop
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='8' cy='11' cx='11'/>\n<path d='m21 21-4.3-4.3'/>\n<path d='M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0'/>\n</svg>\n")


(def
 between-vertical-end
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='1' y='3' x='3' height='13' width='7'/>\n<path d='m9 22 3-3 3 3'/>\n<rect rx='1' y='3' x='14' height='13' width='7'/>\n</svg>\n")


(def
 history
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/>\n<path d='M3 3v5h5'/>\n<path d='M12 7v5l4 2'/>\n</svg>\n")


(def
 gavel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381'/>\n<path d='m16 16 6-6'/>\n<path d='m21.5 10.5-8-8'/>\n<path d='m8 8 6-6'/>\n<path d='m8.5 7.5 8 8'/>\n</svg>\n")


(def
 folder
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n</svg>\n")


(def
 drafting-compass
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m12.99 6.74 1.93 3.44'/>\n<path d='M19.136 12a10 10 0 0 1-14.271 0'/>\n<path d='m21 21-2.16-3.84'/>\n<path d='m3 21 8.02-14.26'/>\n<circle r='2' cy='5' cx='12'/>\n</svg>\n")


(def
 align-horizontal-distribute-center
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='5' x='4' height='14' width='6'/>\n<rect rx='2' y='7' x='14' height='10' width='6'/>\n<path d='M17 22v-5'/>\n<path d='M17 7V2'/>\n<path d='M7 22v-3'/>\n<path d='M7 5V2'/>\n</svg>\n")


(def
 file-lock
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<rect rx='1' y='12' x='8' height='6' width='8'/>\n<path d='M10 12v-2a2 2 0 1 1 4 0v2'/>\n</svg>\n")


(def
 layers-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z'/>\n<path d='m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845'/>\n</svg>\n")


(def
 users
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>\n<path d='M16 3.128a4 4 0 0 1 0 7.744'/>\n<path d='M22 21v-2a4 4 0 0 0-3-3.87'/>\n<circle r='4' cy='7' cx='9'/>\n</svg>\n")


(def
 chart-column-stacked
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 13H7'/>\n<path d='M19 9h-4'/>\n<path d='M3 3v16a2 2 0 0 0 2 2h16'/>\n<rect rx='1' height='12' width='4' y='5' x='15'/>\n<rect rx='1' height='9' width='4' y='8' x='7'/>\n</svg>\n")


(def
 boom-box
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4'/>\n<path d='M8 8v1'/>\n<path d='M12 8v1'/>\n<path d='M16 8v1'/>\n<rect rx='2' y='9' x='2' height='12' width='20'/>\n<circle r='2' cy='15' cx='8'/>\n<circle r='2' cy='15' cx='16'/>\n</svg>\n")


(def
 slice
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 16.586V19a1 1 0 0 1-1 1H2L18.37 3.63a1 1 0 1 1 3 3l-9.663 9.663a1 1 0 0 1-1.414 0L8 14'/>\n</svg>\n")


(def
 folder-git
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='13' cx='12'/>\n<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>\n<path d='M14 13h3'/>\n<path d='M7 13h3'/>\n</svg>\n")


(def
 fingerprint
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4'/>\n<path d='M14 13.12c0 2.38 0 6.38-1 8.88'/>\n<path d='M17.29 21.02c.12-.6.43-2.3.5-3.02'/>\n<path d='M2 12a10 10 0 0 1 18-6'/>\n<path d='M2 16h.01'/>\n<path d='M21.8 16c.2-2 .131-5.354 0-6'/>\n<path d='M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2'/>\n<path d='M8.65 22c.21-.66.45-1.32.57-2'/>\n<path d='M9 6.8a6 6 0 0 1 9 5.2v2'/>\n</svg>\n")


(def
 flag-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'/>\n<path d='m2 2 20 20'/>\n<path d='M4 22V4'/>\n<path d='M7.656 2H8c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10.347'/>\n</svg>\n")


(def
 mic-vocal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12'/>\n<path d='M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5'/>\n<circle r='5' cy='7' cx='16'/>\n</svg>\n")


(def mic-2 mic-vocal)


(def
 heart-minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572'/>\n<path d='M15 15h6'/>\n</svg>\n")


(def
 corner-down-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 4v7a4 4 0 0 1-4 4H4'/>\n<path d='m9 10-5 5 5 5'/>\n</svg>\n")


(def
 file-axis-3d
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='m8 18 4-4'/>\n<path d='M8 10v8h8'/>\n</svg>\n")


(def file-axis-3-d file-axis-3d)


(def
 book-open-text
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 7v14'/>\n<path d='M16 12h2'/>\n<path d='M16 8h2'/>\n<path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/>\n<path d='M6 12h2'/>\n<path d='M6 8h2'/>\n</svg>\n")


(def
 timer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='2' y1='2' x2='14' x1='10'/>\n<line y2='11' y1='14' x2='15' x1='12'/>\n<circle r='8' cy='14' cx='12'/>\n</svg>\n")


(def
 gamepad
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<line y2='12' y1='12' x2='10' x1='6'/>\n<line y2='14' y1='10' x2='8' x1='8'/>\n<line y2='13' y1='13' x2='15.01' x1='15'/>\n<line y2='11' y1='11' x2='18.01' x1='18'/>\n<rect rx='2' y='6' x='2' height='12' width='20'/>\n</svg>\n")


(def
 git-commit-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='12' cx='12'/>\n<line y2='12' y1='12' x2='9' x1='3'/>\n<line y2='12' y1='12' x2='21' x1='15'/>\n</svg>\n")


(def git-commit git-commit-horizontal)


(def
 monitor
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='2' height='14' width='20'/>\n<line y2='21' y1='21' x2='16' x1='8'/>\n<line y2='21' y1='17' x2='12' x1='12'/>\n</svg>\n")


(def
 clipboard-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect ry='1' rx='1' y='2' x='8' height='4' width='8'/>\n<path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>\n<path d='m9 14 2 2 4-4'/>\n</svg>\n")


(def
 unlink-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7A5 5 0 0 1 7 7h2'/>\n</svg>\n")


(def
 square-arrow-out-down-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6'/>\n<path d='m21 21-9-9'/>\n<path d='M21 15v6h-6'/>\n</svg>\n")


(def arrow-down-right-from-square square-arrow-out-down-right)


(def
 minus
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M5 12h14'/>\n</svg>\n")


(def
 heart-pulse
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5'/>\n<path d='M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27'/>\n</svg>\n")


(def
 rows-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M21 7.5H3'/>\n<path d='M21 12H3'/>\n<path d='M21 16.5H3'/>\n</svg>\n")


(def
 heart-handshake
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762'/>\n</svg>\n")


(def
 bed-double
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8'/>\n<path d='M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4'/>\n<path d='M12 4v6'/>\n<path d='M2 18h20'/>\n</svg>\n")


(def
 text-search
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M21 6H3'/>\n<path d='M10 12H3'/>\n<path d='M10 18H3'/>\n<circle r='3' cy='15' cx='17'/>\n<path d='m21 19-1.9-1.9'/>\n</svg>\n")


(def
 audio-waveform
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2'/>\n</svg>\n")


(def
 navigation-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<polygon points='12 2 19 21 12 17 5 21 12 2'/>\n</svg>\n")


(def
 paint-bucket
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/>\n<path d='m5 2 5 5'/>\n<path d='M2 13h15'/>\n<path d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z'/>\n</svg>\n")


(def
 chevron-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m15 18-6-6 6-6'/>\n</svg>\n")


(def
 move-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 6L12 2L16 6'/>\n<path d='M12 2V22'/>\n</svg>\n")


(def
 film
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M7 3v18'/>\n<path d='M3 7.5h4'/>\n<path d='M3 12h18'/>\n<path d='M3 16.5h4'/>\n<path d='M17 3v18'/>\n<path d='M17 7.5h4'/>\n<path d='M17 16.5h4'/>\n</svg>\n")


(def
 moon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'/>\n</svg>\n")


(def
 square-arrow-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='m12 8-4 4 4 4'/>\n<path d='M16 12H8'/>\n</svg>\n")


(def arrow-left-square square-arrow-left)


(def
 panel-bottom-close
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 15h18'/>\n<path d='m15 8-3 3-3-3'/>\n</svg>\n")


(def
 weight
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='3' cy='5' cx='12'/>\n<path d='M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z'/>\n</svg>\n")


(def
 shield-off
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m2 2 20 20'/>\n<path d='M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71'/>\n<path d='M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264'/>\n</svg>\n")


(def
 scaling
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/>\n<path d='M14 15H9v-5'/>\n<path d='M16 3h5v5'/>\n<path d='M21 3 9 15'/>\n</svg>\n")


(def
 cable
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z'/>\n<path d='M17 21v-2'/>\n<path d='M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10'/>\n<path d='M21 21v-2'/>\n<path d='M3 5V3'/>\n<path d='M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z'/>\n<path d='M7 5V3'/>\n</svg>\n")


(def
 accessibility
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='1' cy='4' cx='16'/>\n<path d='m18 19 1-7-6 1'/>\n<path d='m5 8 3-3 5.5 3-2.36 3.5'/>\n<path d='M4.24 14.5a5 5 0 0 0 6.88 6'/>\n<path d='M13.76 17.5a5 5 0 0 0-6.88-6'/>\n</svg>\n")


(def
 move-up-right
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 5H19V11'/>\n<path d='M19 5L5 19'/>\n</svg>\n")


(def
 wallet-cards
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<rect rx='2' y='3' x='3' height='18' width='18'/>\n<path d='M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2'/>\n<path d='M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21'/>\n</svg>\n")


(def
 calendar-sync
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M11 10v4h4'/>\n<path d='m11 14 1.535-1.605a5 5 0 0 1 8 1.5'/>\n<path d='M16 2v4'/>\n<path d='m21 18-1.535 1.605a5 5 0 0 1-8-1.5'/>\n<path d='M21 22v-4h-4'/>\n<path d='M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.3'/>\n<path d='M3 10h4'/>\n<path d='M8 2v4'/>\n</svg>\n")


(def
 bus-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 6 2 7'/>\n<path d='M10 6h4'/>\n<path d='m22 7-2-1'/>\n<rect rx='2' y='3' x='4' height='16' width='16'/>\n<path d='M4 11h16'/>\n<path d='M8 15h.01'/>\n<path d='M16 15h.01'/>\n<path d='M6 19v2'/>\n<path d='M18 21v-2'/>\n</svg>\n")


(def
 lamp-wall-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M19.929 18.629A1 1 0 0 1 19 20H9a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 11 13h6a1 1 0 0 1 .928.629z'/>\n<path d='M6 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'/>\n<path d='M8 6h4a2 2 0 0 1 2 2v5'/>\n</svg>\n")


(def
 mouse-pointer
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12.586 12.586 19 19'/>\n<path d='M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z'/>\n</svg>\n")


(def
 file-json
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/>\n<path d='M14 2v4a2 2 0 0 0 2 2h4'/>\n<path d='M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1'/>\n<path d='M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1'/>\n</svg>\n")


(def
 train-front
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3.1V7a4 4 0 0 0 8 0V3.1'/>\n<path d='m9 15-1-1'/>\n<path d='m15 15 1-1'/>\n<path d='M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z'/>\n<path d='m8 19-2 3'/>\n<path d='m16 19 2 3'/>\n</svg>\n")


(def
 calendar-minus-2
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n<path d='M10 16h4'/>\n</svg>\n")


(def
 ribbon
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22'/>\n<path d='m12 18 2.57-3.5'/>\n<path d='M6.243 9.016a7 7 0 0 1 11.507-.009'/>\n<path d='M9.35 14.53 12 11.22'/>\n<path d='M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z'/>\n</svg>\n")


(def
 square-stack
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2'/>\n<path d='M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2'/>\n<rect rx='2' y='14' x='14' height='8' width='8'/>\n</svg>\n")


(def
 flip-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3'/>\n<path d='M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3'/>\n<path d='M12 20v2'/>\n<path d='M12 14v2'/>\n<path d='M12 8v2'/>\n<path d='M12 2v2'/>\n</svg>\n")


(def
 map-pin-check-inside
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'/>\n<path d='m9 10 2 2 4-4'/>\n</svg>\n")


(def
 gallery-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 3v18'/>\n<rect rx='2' y='3' x='6' height='18' width='12'/>\n<path d='M22 3v18'/>\n</svg>\n")


(def
 notebook
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 6h4'/>\n<path d='M2 10h4'/>\n<path d='M2 14h4'/>\n<path d='M2 18h4'/>\n<rect rx='2' y='2' x='4' height='20' width='16'/>\n<path d='M16 2v20'/>\n</svg>\n")


(def
 stamp
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13'/>\n<path d='M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z'/>\n<path d='M5 22h14'/>\n</svg>\n")


(def
 square-split-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3'/>\n<path d='M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3'/>\n<line y2='20' y1='4' x2='12' x1='12'/>\n</svg>\n")


(def split-square-horizontal square-split-horizontal)


(def
 arrow-up-down
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m21 16-4 4-4-4'/>\n<path d='M17 20V4'/>\n<path d='m3 8 4-4 4 4'/>\n<path d='M7 4v16'/>\n</svg>\n")


(def
 screen-share
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3'/>\n<path d='M8 21h8'/>\n<path d='M12 17v4'/>\n<path d='m17 8 5-5'/>\n<path d='M17 3h5v5'/>\n</svg>\n")


(def
 calendar-days
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M8 2v4'/>\n<path d='M16 2v4'/>\n<rect rx='2' y='4' x='3' height='18' width='18'/>\n<path d='M3 10h18'/>\n<path d='M8 14h.01'/>\n<path d='M12 14h.01'/>\n<path d='M16 14h.01'/>\n<path d='M8 18h.01'/>\n<path d='M12 18h.01'/>\n<path d='M16 18h.01'/>\n</svg>\n")


(def
 align-left
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M15 12H3'/>\n<path d='M17 18H3'/>\n<path d='M21 6H3'/>\n</svg>\n")


(def
 separator-horizontal
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='m16 16-4 4-4-4'/>\n<path d='M3 12h18'/>\n<path d='m8 8 4-4 4 4'/>\n</svg>\n")


(def
 ferris-wheel
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<circle r='2' cy='12' cx='12'/>\n<path d='M12 2v4'/>\n<path d='m6.8 15-3.5 2'/>\n<path d='m20.7 7-3.5 2'/>\n<path d='M6.8 9 3.3 7'/>\n<path d='m20.7 17-3.5-2'/>\n<path d='m9 22 3-8 3 8'/>\n<path d='M8 22h8'/>\n<path d='M18 18.7a9 9 0 1 0-12 0'/>\n</svg>\n")


(def
 sofa
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3'/>\n<path d='M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z'/>\n<path d='M4 18v2'/>\n<path d='M20 18v2'/>\n<path d='M12 4v9'/>\n</svg>\n")


(def
 clock-4
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M12 6v6l4 2'/>\n<circle r='10' cy='12' cx='12'/>\n</svg>\n")


(def
 ticket-check
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z'/>\n<path d='m9 12 2 2 4-4'/>\n</svg>\n")


(def
 cherry
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z'/>\n<path d='M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z'/>\n<path d='M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12'/>\n<path d='M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z'/>\n</svg>\n")


(def
 heart
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5'/>\n</svg>\n")


(def
 trending-up
 "<?xml version='1.0' encoding='UTF-8'?>\n<svg stroke='currentColor' fill='none' stroke-linejoin='round' width='24' xmlns='http://www.w3.org/2000/svg' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24' height='24'>\n<path d='M16 7h6v6'/>\n<path d='m22 7-8.5 8.5-5-5L2 17'/>\n</svg>\n")
