/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t;const e=window,s=e.trustedTypes,i=s?s.createPolicy("lit-html",{createHTML:t=>t}):void 0,n=`lit$${(Math.random()+"").slice(9)}$`,r="?"+n,o=`<${r}>`,l=document,h=(t="")=>l.createComment(t),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,d=Array.isArray,a=t=>d(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),u=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$=/-->/g,_=/>/g,v=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),A=/'/g,p=/"/g,f=/^(?:script|style|textarea|title)$/i,g=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),m=new WeakMap,C=l.createTreeWalker(l,129,null,!1),x=(t,e)=>{const s=t.length-1,r=[];let l,h=2===e?"<svg>":"",c=u;for(let e=0;e<s;e++){const s=t[e];let i,d,a=-1,g=0;for(;g<s.length&&(c.lastIndex=g,d=c.exec(s),null!==d);)g=c.lastIndex,c===u?"!--"===d[1]?c=$:void 0!==d[1]?c=_:void 0!==d[2]?(f.test(d[2])&&(l=RegExp("</"+d[2],"g")),c=v):void 0!==d[3]&&(c=v):c===v?">"===d[0]?(c=null!=l?l:u,a=-1):void 0===d[1]?a=-2:(a=c.lastIndex-d[2].length,i=d[1],c=void 0===d[3]?v:'"'===d[3]?p:A):c===p||c===A?c=v:c===$||c===_?c=u:(c=v,l=void 0);const y=c===v&&t[e+1].startsWith("/>")?" ":"";h+=c===u?s+o:a>=0?(r.push(i),s.slice(0,a)+"$lit$"+s.slice(a)+n+y):s+n+(-2===a?(r.push(void 0),e):y)}const d=h+(t[s]||"<?>")+(2===e?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==i?i.createHTML(d):d,r]};class w{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let l=0,c=0;const d=t.length-1,a=this.parts,[u,$]=x(t,e);if(this.el=w.createElement(u,i),C.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(o=C.nextNode())&&a.length<d;){if(1===o.nodeType){if(o.hasAttributes()){const t=[];for(const e of o.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(n)){const s=$[c++];if(t.push(e),void 0!==s){const t=o.getAttribute(s.toLowerCase()+"$lit$").split(n),e=/([.?@])?(.*)/.exec(s);a.push({type:1,index:l,name:e[2],strings:t,ctor:"."===e[1]?T:"?"===e[1]?E:"@"===e[1]?U:M})}else a.push({type:6,index:l})}for(const e of t)o.removeAttribute(e)}if(f.test(o.tagName)){const t=o.textContent.split(n),e=t.length-1;if(e>0){o.textContent=s?s.emptyScript:"";for(let s=0;s<e;s++)o.append(t[s],h()),C.nextNode(),a.push({type:2,index:++l});o.append(t[e],h())}}}else if(8===o.nodeType)if(o.data===r)a.push({type:2,index:l});else{let t=-1;for(;-1!==(t=o.data.indexOf(n,t+1));)a.push({type:7,index:l}),t+=n.length-1}l++}}static createElement(t,e){const s=l.createElement("template");return s.innerHTML=t,s}}function b(t,e,s=t,i){var n,r,o,l;if(e===g)return e;let h=void 0!==i?null===(n=s._$Co)||void 0===n?void 0:n[i]:s._$Cl;const d=c(e)?void 0:e._$litDirective$;return(null==h?void 0:h.constructor)!==d&&(null===(r=null==h?void 0:h._$AO)||void 0===r||r.call(h,!1),void 0===d?h=void 0:(h=new d(t),h._$AT(t,s,i)),void 0!==i?(null!==(o=(l=s)._$Co)&&void 0!==o?o:l._$Co=[])[i]=h:s._$Cl=h),void 0!==h&&(e=b(t,h._$AS(t,e.values),h,i)),e}class H{constructor(t,e){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var e;const{el:{content:s},parts:i}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:l).importNode(s,!0);C.currentNode=n;let r=C.nextNode(),o=0,h=0,c=i[0];for(;void 0!==c;){if(o===c.index){let e;2===c.type?e=new N(r,r.nextSibling,this,t):1===c.type?e=new c.ctor(r,c.name,c.strings,this,t):6===c.type&&(e=new I(r,this,t)),this.u.push(e),c=i[++h]}o!==(null==c?void 0:c.index)&&(r=C.nextNode(),o++)}return n}p(t){let e=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class N{constructor(t,e,s,i){var n;this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cm=null===(n=null==i?void 0:i.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=b(this,t,e),c(t)?t===y||null==t||""===t?(this._$AH!==y&&this._$AR(),this._$AH=y):t!==this._$AH&&t!==g&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):a(t)?this.k(t):this.g(t)}O(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}g(t){this._$AH!==y&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t}$(t){var e;const{values:s,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=w.createElement(i.h,this.options)),i);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.p(s);else{const t=new H(n,this),e=t.v(this.options);t.p(s),this.T(e),this._$AH=t}}_$AC(t){let e=m.get(t.strings);return void 0===e&&m.set(t.strings,e=new w(t)),e}k(t){d(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new N(this.O(h()),this.O(h()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cm=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class M{constructor(t,e,s,i,n){this.type=1,this._$AH=y,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=y}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,i){const n=this.strings;let r=!1;if(void 0===n)t=b(this,t,e,0),r=!c(t)||t!==this._$AH&&t!==g,r&&(this._$AH=t);else{const i=t;let o,l;for(t=n[0],o=0;o<n.length-1;o++)l=b(this,i[s+o],e,o),l===g&&(l=this._$AH[o]),r||(r=!c(l)||l!==this._$AH[o]),l===y?t=y:t!==y&&(t+=(null!=l?l:"")+n[o+1]),this._$AH[o]=l}r&&!i&&this.j(t)}j(t){t===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class T extends M{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===y?void 0:t}}const S=s?s.emptyScript:"";class E extends M{constructor(){super(...arguments),this.type=4}j(t){t&&t!==y?this.element.setAttribute(this.name,S):this.element.removeAttribute(this.name)}}class U extends M{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){var s;if((t=null!==(s=b(this,t,e,0))&&void 0!==s?s:y)===g)return;const i=this._$AH,n=t===y&&i!==y||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==y&&(i===y||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t)}}class I{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){b(this,t)}}const P={P:"$lit$",A:n,M:r,C:1,L:x,R:H,D:a,V:b,I:N,H:M,N:E,U:U,B:T,F:I},B=e.litHtmlPolyfillSupport;null==B||B(w,N),(null!==(t=e.litHtmlVersions)&&void 0!==t?t:e.litHtmlVersions=[]).push("2.4.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const L=1,O=2,k=3,j=4,D=t=>(...e)=>({_$litDirective$:t,values:e});class R{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z=D(class extends R{constructor(t){var e;if(super(t),t.type!==L||"class"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){var s,i;if(void 0===this.nt){this.nt=new Set,void 0!==t.strings&&(this.st=new Set(t.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in e)e[t]&&!(null===(s=this.st)||void 0===s?void 0:s.has(t))&&this.nt.add(t);return this.render(e)}const n=t.element.classList;this.nt.forEach((t=>{t in e||(n.remove(t),this.nt.delete(t))}));for(const t in e){const s=!!e[t];s===this.nt.has(t)||(null===(i=this.st)||void 0===i?void 0:i.has(t))||(s?(n.add(t),this.nt.add(t)):(n.remove(t),this.nt.delete(t)))}return g}}),z=t=>null!=t?t:y
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{I:V}=P,W=t=>void 0===t.strings,q=()=>document.createComment(""),K=(t,e,s)=>{var i;const n=t._$AA.parentNode,r=void 0===e?t._$AB:e._$AA;if(void 0===s){const e=n.insertBefore(q(),r),i=n.insertBefore(q(),r);s=new V(e,i,t,t.options)}else{const e=s._$AB.nextSibling,o=s._$AM,l=o!==t;if(l){let e;null===(i=s._$AQ)||void 0===i||i.call(s,t),s._$AM=t,void 0!==s._$AP&&(e=t._$AU)!==o._$AU&&s._$AP(e)}if(e!==r||l){let t=s._$AA;for(;t!==e;){const e=t.nextSibling;n.insertBefore(t,r),t=e}}}return s},X=(t,e,s=t)=>(t._$AI(e,s),t),Y={},Q=(t,e=Y)=>t._$AH=e,F=t=>{var e;null===(e=t._$AP)||void 0===e||e.call(t,!1,!0);let s=t._$AA;const i=t._$AB.nextSibling;for(;s!==i;){const t=s.nextSibling;s.remove(),s=t}},G=D(class extends R{constructor(t){if(super(t),t.type!==k&&t.type!==L&&t.type!==j)throw Error("The `live` directive is not allowed on child or event bindings");if(!W(t))throw Error("`live` bindings can only contain a single expression")}render(t){return t}update(t,[e]){if(e===g||e===y)return e;const s=t.element,i=t.name;if(t.type===k){if(e===s[i])return g}else if(t.type===j){if(!!e===s.hasAttribute(i))return g}else if(t.type===L&&s.getAttribute(i)===e+"")return g;return Q(t),e}}),J=(t,e,s)=>{const i=new Map;for(let n=e;n<=s;n++)i.set(t[n],n);return i},tt=D(class extends R{constructor(t){if(super(t),t.type!==O)throw Error("repeat() can only be used in text expressions")}ht(t,e,s){let i;void 0===s?s=e:void 0!==e&&(i=e);const n=[],r=[];let o=0;for(const e of t)n[o]=i?i(e,o):o,r[o]=s(e,o),o++;return{values:r,keys:n}}render(t,e,s){return this.ht(t,e,s).values}update(t,[e,s,i]){var n;const r=(t=>t._$AH)(t),{values:o,keys:l}=this.ht(e,s,i);if(!Array.isArray(r))return this.ut=l,o;const h=null!==(n=this.ut)&&void 0!==n?n:this.ut=[],c=[];let d,a,u=0,$=r.length-1,_=0,v=o.length-1;for(;u<=$&&_<=v;)if(null===r[u])u++;else if(null===r[$])$--;else if(h[u]===l[_])c[_]=X(r[u],o[_]),u++,_++;else if(h[$]===l[v])c[v]=X(r[$],o[v]),$--,v--;else if(h[u]===l[v])c[v]=X(r[u],o[v]),K(t,c[v+1],r[u]),u++,v--;else if(h[$]===l[_])c[_]=X(r[$],o[_]),K(t,r[u],r[$]),$--,_++;else if(void 0===d&&(d=J(l,_,v),a=J(h,u,$)),d.has(h[u]))if(d.has(h[$])){const e=a.get(l[_]),s=void 0!==e?r[e]:null;if(null===s){const e=K(t,r[u]);X(e,o[_]),c[_]=e}else c[_]=X(s,o[_]),K(t,r[u],s),r[e]=null;_++}else F(r[$]),$--;else F(r[u]),u++;for(;_<=v;){const e=K(t,c[v+1]);X(e,o[_]),c[_++]=e}for(;u<=$;){const t=r[u++];null!==t&&F(t)}return this.ut=l,Q(t,c),g}}),et=D(class extends R{constructor(t){var e;if(super(t),t.type!==L||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,s)=>{const i=t[s];return null==i?e:e+`${s=s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`}),"")}update(t,[e]){const{style:s}=t.element;if(void 0===this.vt){this.vt=new Set;for(const t in e)this.vt.add(t);return this.render(e)}this.vt.forEach((t=>{null==e[t]&&(this.vt.delete(t),t.includes("-")?s.removeProperty(t):s[t]="")}));for(const t in e){const i=e[t];null!=i&&(this.vt.add(t),t.includes("-")?s.setProperty(t,i):s[t]=i)}return g}});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class st extends R{constructor(t){if(super(t),this.it=y,t.type!==O)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===y||null==t)return this._t=void 0,this.it=t;if(t===g)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}st.directiveName="unsafeHTML",st.resultType=1;const it=D(st),nt=(t,e)=>{var s,i;const n=t._$AN;if(void 0===n)return!1;for(const t of n)null===(i=(s=t)._$AO)||void 0===i||i.call(s,e,!1),nt(t,e);return!0},rt=t=>{let e,s;do{if(void 0===(e=t._$AM))break;s=e._$AN,s.delete(t),t=e}while(0===(null==s?void 0:s.size))},ot=t=>{for(let e;e=t._$AM;t=e){let s=e._$AN;if(void 0===s)e._$AN=s=new Set;else if(s.has(t))break;s.add(t),ct(e)}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function lt(t){void 0!==this._$AN?(rt(this),this._$AM=t,ot(this)):this._$AM=t}function ht(t,e=!1,s=0){const i=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(e)if(Array.isArray(i))for(let t=s;t<i.length;t++)nt(i[t],!1),rt(i[t]);else null!=i&&(nt(i,!1),rt(i));else nt(this,t)}const ct=t=>{var e,s,i,n;t.type==O&&(null!==(e=(i=t)._$AP)&&void 0!==e||(i._$AP=ht),null!==(s=(n=t)._$AQ)&&void 0!==s||(n._$AQ=lt))};class dt extends R{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,s){super._$AT(t,e,s),ot(this),this.isConnected=t._$AU}_$AO(t,e=!0){var s,i;t!==this.isConnected&&(this.isConnected=t,t?null===(s=this.reconnected)||void 0===s||s.call(this):null===(i=this.disconnected)||void 0===i||i.call(this)),e&&(nt(this,t),rt(this))}setValue(t){if(W(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class at{constructor(t){this.Y=t}disconnect(){this.Y=void 0}reconnect(t){this.Y=t}deref(){return this.Y}}class ut{constructor(){this.Z=void 0,this.q=void 0}get(){return this.Z}pause(){var t;null!==(t=this.Z)&&void 0!==t||(this.Z=new Promise((t=>this.q=t)))}resume(){var t;null===(t=this.q)||void 0===t||t.call(this),this.Z=this.q=void 0}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $t=t=>!(t=>null===t||"object"!=typeof t&&"function"!=typeof t)(t)&&"function"==typeof t.then;class _t extends dt{constructor(){super(...arguments),this._$Cwt=1073741823,this._$Cyt=[],this._$CK=new at(this),this._$CX=new ut}render(...t){var e;return null!==(e=t.find((t=>!$t(t))))&&void 0!==e?e:g}update(t,e){const s=this._$Cyt;let i=s.length;this._$Cyt=e;const n=this._$CK,r=this._$CX;this.isConnected||this.disconnected();for(let t=0;t<e.length&&!(t>this._$Cwt);t++){const o=e[t];if(!$t(o))return this._$Cwt=t,o;t<i&&o===s[t]||(this._$Cwt=1073741823,i=0,Promise.resolve(o).then((async t=>{for(;r.get();)await r.get();const e=n.deref();if(void 0!==e){const s=e._$Cyt.indexOf(o);s>-1&&s<e._$Cwt&&(e._$Cwt=s,e.setValue(t))}})))}return g}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const vt=D(_t);export{st as UnsafeHTMLDirective,_t as UntilDirective,Z as classMap,z as ifDefined,G as live,tt as repeat,et as styleMap,it as unsafeHTML,vt as until};
//# sourceMappingURL=directives.js.map
