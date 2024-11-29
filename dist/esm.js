var e={COMP_A:"A",COMP_F:"F",ID:"container",ID_FQN:"TeqFw_Di_Container$",LIFE_I:"I",LIFE_S:"S",isClass(e){const t=Object.getOwnPropertyDescriptor(e,"prototype");return t&&!t.writable}};const t=/(function)*\s*\w*\s*\(\s*\{([^\}]*)\}/s,o=/constructor\s*\(\s*\{([^\}]*)\}/s;function s(e){const t=[];try{const o=new Function(`{${e}}`,"return");o(new Proxy({},{get:(e,o)=>t.push(o)}))}catch(t){throw new Error(`Cannot analyze the deps specification:${e}\n\nPlease, be sure that spec does not contain extra ')' in a comments.\n\nError: ${t}`)}return t}function n(n){return"function"==typeof n?e.isClass(n)?function(e){const t=[],n=e.toString(),r=o.exec(n);return r&&t.push(...s(r[1])),t}(n):function(e){const o=[],n=e.toString(),r=t.exec(n);return r&&o.push(...s(r[2])),o}(n):[]}class r{constructor(){let t=!1;this.create=async function(o,s,r,i){if(r.includes(o.value))throw new Error(`Circular dependency for '${o.value}'. Parents are: ${JSON.stringify(r)}`);if(o.exportName){const a=[...r,o.value],{[o.exportName]:u}=s;if(o.composition===e.COMP_F){if("function"==typeof u){const s=n(u);s.length&&(c=`Deps for object '${o.value}' are: ${JSON.stringify(s)}`,t&&console.log(c));const r={};for(const e of s)r[e]=await i.compose(e,a);const l=e.isClass(u)?new u(r):u(r);return l instanceof Promise?await l:l}return Object.assign({},u)}return u}return s;var c},this.setDebug=function(e){t=e}}}class i{exportName;composition;life;moduleName;value;wrappers=[]}const c=/^((([A-Z])[A-Za-z0-9_]*)((\.)?([A-Za-z0-9_]*)((\$)?(\$)?)?)?(\(([A-Za-z0-9_,]*)\))?)$/;class a{canParse(e){return!0}parse(t){const o=new i;o.value=t;const s=c.exec(t);if(s&&(o.moduleName=s[2],"."===s[5]?"$"===s[7]||"$$"===s[7]?(o.composition=e.COMP_F,o.exportName=s[6],o.life="$"===s[7]?e.LIFE_S:e.LIFE_I):(o.composition=e.COMP_A,o.life=e.LIFE_S,o.exportName=""!==s[6]?s[6]:"default"):"$"===s[7]||"$$"===s[7]?(o.composition=e.COMP_F,o.exportName="default",o.life="$"===s[7]?e.LIFE_S:e.LIFE_I):(o.composition=void 0,o.exportName=void 0,o.life=void 0),s[11]&&(o.wrappers=s[11].split(","))),o.composition===e.COMP_A&&o.life===e.LIFE_I)throw new Error(`Export is not a function and should be used as a singleton only: '${o.value}'.`);return o}}class u{constructor(){let e=new a;const t=[];this.addChunk=function(e){t.push(e)},this.parse=function(o){let s;for(const e of t)if(e.canParse(o)){s=e.parse(o);break}return s||(s=e?.parse(o)),s},this.setDefaultChunk=function(t){e=t}}}class l{constructor(){const e=[];this.addChunk=function(t){e.push(t)},this.modify=function(t,o){let s=t;for(const n of e)s=n.modify(s,t,o);return s}}}class f{constructor(){const e=[];this.addChunk=function(t){e.push(t)},this.modify=async function(t,o,s){let n=t;for(const t of e)n=t.modify(n,o,s),n instanceof Promise&&(n=await n);return n}}}const p="root";class m{constructor(){const e={};let t=!1,o=[],s="/";this.addNamespaceRoot=function(s,n,r){const i=(t?n.replace(/^\\/,""):n).replace(/\\/g,"/"),c=t?`file://${i}`:i;e[s]={ext:r??"js",ns:s,[p]:c},o=Object.keys(e).sort(((e,t)=>t.localeCompare(e)))},this.resolve=function(t){let n,r,i;for(i of o)if(t.startsWith(i)){n=e[i][p],r=e[i].ext;break}if(n&&r){let e=t.replace(i,"");0===e.indexOf("_")&&(e=e.replace("_",""));const o=e.replaceAll("_",s);return`${n}${s}${o}.${r}`}return t},this.setWindowsEnv=function(e=!0){t=e,s=e?"\\":"/"}}}function d(e){return`${e.moduleName}#${e.exportName}`}class h{constructor(){let t=new r,o=!1,s=new u,n=new l,i=new f;const c={},a={};let p=new m;function h(){o&&console.log(...arguments)}this.get=async function(e,t=[]){return this.compose(e,t)},this.compose=async function(o,r=[]){if(h(`Object '${o}' is requested.`),o===e.ID||o===e.ID_FQN)return h("Container itself is returned."),a[e.ID];const u=s.parse(o),l=n.modify(u,r);if(l.life===e.LIFE_S){const e=d(l);if(a[e])return h(`Existing singleton '${e}' is returned.`),a[e]}let f;c[l.moduleName]||(h(`ES6 module '${l.moduleName}' is not resolved yet`),c[l.moduleName]=p.resolve(l.moduleName));const m=c[l.moduleName];try{f=await import(m),h(`ES6 module '${l.moduleName}' is loaded from '${m}'.`)}catch(e){throw console.error(e?.message,`Object key: "${o}".`,`Path: "${m}".`,`Stack: ${JSON.stringify(r)}`),e}let $=await t.create(l,f,r,this);if($=await i.modify($,l,r),h(`Object '${o}' is created.`),l.life===e.LIFE_S){const e=d(l);a[e]=$,h(`Object '${o}' is saved as singleton.`)}return $},this.getParser=()=>s,this.getPreProcessor=()=>n,this.getPostProcessor=()=>i,this.getResolver=()=>p,this.setDebug=function(e){o=e,t.setDebug(e)},this.setParser=e=>s=e,this.setPreProcessor=e=>n=e,this.setPostProcessor=e=>i=e,this.setResolver=e=>p=e,a[e.ID]=this}}export{h as default};
