(this["webpackJsonpasi-teaser"]=this["webpackJsonpasi-teaser"]||[]).push([[0],[,,,,,,,,,function(e,a,t){e.exports=t(21)},,,,,function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},,,function(e,a,t){},function(e,a,t){"use strict";t.r(a);var c=t(0),n=t.n(c),r=t(7),o=t.n(r),s=(t(14),t(15),t(16),t(17),t(3)),l=t(8),i=t(1),m=t(4),u=t.n(m),d=function(e){var a=e.color,t=Object(l.a)(e,["color"]);return n.a.createElement("div",Object.assign({className:u()("asi-tile",Object(s.a)({},"asi-tile-".concat(a),a))},t))},b=function(e){var a=e.className,t=e.name,c=e.height,r=void 0===c?1:c,o=e.colors,l=void 0===o?{}:o,m=e.onToggleKeyword;return n.a.createElement("div",{className:u()("asi-layer",a,Object(s.a)({},"as-layer-".concat(t),t))},n.a.createElement("div",{className:"asi-layer-face asi-layer-face-top"},Object(i.range)(0,9).map((function(e){return n.a.createElement(d,{key:"tile-".concat(e),color:l.top,onMouseEnter:m})}))),n.a.createElement("div",{className:"asi-layer-face asi-layer-face-right"},Object(i.range)(0,3*r).map((function(e){return n.a.createElement(d,{key:"tile-".concat(e),color:l.right,onMouseEnter:m})}))),n.a.createElement("div",{className:"asi-layer-face asi-layer-face-left"},Object(i.range)(0,3*r).map((function(e){return n.a.createElement(d,{key:"tile-".concat(e),color:l.left,onMouseEnter:m})}))))},f=function(e){var a=e.onToggleKeyword;return n.a.createElement("div",{className:"asi-cube-ex"},n.a.createElement("div",{className:"asi-cube-ex-parts"},n.a.createElement("div",{className:"asi-cube-ex-part asi-cube-ex-roof"},n.a.createElement(b,{colors:{top:"orange",left:"blue",right:"red"},onToggleKeyword:a})),n.a.createElement("div",{className:"asi-cube-ex-part asi-cube-ex-base"},n.a.createElement(b,{height:2,colors:{top:"green",left:"blue",right:"red"},onToggleKeyword:a}))))},g=(t(20),t(2)),E=t(5),v=["helm","kustomize","kubernetes","aws","gcp","azure","terraform","docker","shell","vault","istio"],p=Math.floor(.7*v.length),h=function(){var e=Object(c.useState)(Object(i.sampleSize)(v,3)),a=Object(E.a)(e,2),t=a[0],r=a[1],o=Object(c.useState)(t),s=Object(E.a)(o,2),l=s[0],m=s[1],u=Object(c.useCallback)(Object(i.debounce)((function(){var e=Object(i.sample)(Object(i.difference)(v,[].concat(Object(g.a)(l),Object(g.a)(t))));m([e].concat(Object(g.a)(l)).slice(0,p));var a=t.slice(),c=Object(i.random)(2);a.splice(c,1,e),r(a)}),100),[t,l,v,r,m,p,3]);return n.a.createElement("div",{className:"asi-teaser"},n.a.createElement("h1",null,"Agile",n.a.createElement("span",{className:"asi-teaser-stacks"},"Stacks")),n.a.createElement("div",{className:"asi-teaser-keywords"},t.map((function(e){return n.a.createElement("h2",{key:e,className:"asi-teaser-keyword"},e)}))),n.a.createElement("div",null,"with no pain"),n.a.createElement(f,{onToggleKeyword:u}))};var y=function(){return n.a.createElement("div",{className:"App"},n.a.createElement("header",{className:"App-header"},n.a.createElement(h,null)))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(n.a.createElement(y,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}],[[9,1,2]]]);
//# sourceMappingURL=main.d8185038.chunk.js.map