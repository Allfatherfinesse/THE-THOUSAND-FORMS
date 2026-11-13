(()=>{var Qh=Math.PI*2,Ca=1/120;var rc=(r,e)=>(r-e+Math.PI*3)%Qh-Math.PI,er=r=>r.state==="idle"||r.state==="guard",Xt=(r,e,t,n,i,s,a,o,l,c=.25)=>({name:r,windup:e,active:t,recovery:n,cost:i,damage:s,posture:a,range:o,arc:l,lunge:c,sweep:!1}),mi=[{id:"muay-thai",name:"Muay Thai",color:"#efb66a",description:"Pressure \xB7 posture damage",light:Xt("Ember palm",.14,.13,.24,12,14,24,1.85,1.65,.42),heavy:Xt("Mountain elbow",.34,.18,.38,24,27,43,2.05,1.85,.56)},{id:"wing-chun",name:"Wing Chun",color:"#72d6c9",description:"Quick hands \xB7 wider deflect window",light:Xt("River palm",.09,.1,.17,9,10,14,1.7,1.45,.32),heavy:Xt("Unbroken line",.25,.14,.28,20,21,30,1.85,1.4,.52)},{id:"taekwondo",name:"Taekwondo",color:"#a8a2f2",description:"Long reach \xB7 mobile footwork",light:Xt("Crescent kick",.22,.14,.29,15,18,19,2.55,1.7,.3),heavy:Xt("Falling star",.43,.18,.43,27,32,34,2.85,1.6,.38)}],eu={sparring:[{...Xt("Measured palm",.72,.16,.62,10,10,17,2,1.55,.3),kind:"light",style:1},{...Xt("Rising step",.94,.2,.8,16,18,27,2.45,1.6,.35),kind:"heavy",style:2},{...Xt("Measured palm",.72,.16,.62,10,10,17,2,1.55,.3),kind:"light",style:1}],boss:[{...Xt("Sweeping crescent",.95,.24,.88,15,18,27,2.8,Math.PI*1.65,.15),kind:"sweep",style:2,sweep:!0},{...Xt("Falling bell",1.05,.2,.95,18,25,38,2.65,1.3,.55),kind:"heavy",style:0},{...Xt("Ashen step",.68,.16,.55,12,13,20,2.25,1.55,.4),kind:"light",style:1}]};function sc(r,e,t,n,i,s){return{id:r,x:e,z:t,yaw:r==="player"?Math.PI:0,radius:.42,health:n,maxHealth:n,stamina:100,maxStamina:100,posture:0,maxPosture:i,style:s,hybridStyle:(s+1)%3,state:"idle",stateTime:0,stateDuration:0,attack:null,attackTime:0,attackDuration:0,invulnerable:!1,armored:!1,guardHeld:!1,guardEligible:!1,guardCooldown:0,staminaDelay:0,postureDelay:0,buffer:null,attackSequence:0,hitTargets:new Set,dodgeX:0,dodgeZ:0,pendingStyle:s}}var jr=class{constructor(e="sparring"){this.reset(e)}reset(e=this.mode??"sparring"){return this.mode=e==="boss"?"boss":"sparring",this.player=sc("player",0,3,100,100,0),this.enemy=sc("enemy",0,-3,this.mode==="boss"?250:100,this.mode==="boss"?120:85,this.mode==="boss"?2:1),this.arenaRadius=9,this.result="playing",this.phase=1,this.time=0,this.events=[],this.aiEnabled=!0,this._accumulator=0,this._aiCooldown=1,this._aiStep=0,this._input={x:0,z:0},this}drainEvents(){return this.events.splice(0)}action(e,t){if(this.result!=="playing"||this.player.state==="dead"||!["light","heavy","evade","style","hybrid"].includes(e))return!1;let n=this.player,i=e==="style"?Number.isInteger(t)?t:((n.state==="switch"?n.pendingStyle:n.style)+1)%3:void 0;return e==="style"&&(i<0||i>2||i===n.style)?!1:er(n)?this._startAction(n,e,i):n.state==="stun"||n.state==="broken"?!1:(n.buffer={name:e,targetStyle:i,expires:this.time+.24},!0)}setGuard(e){let t=this.player;t.guardHeld=!!e&&this.result==="playing",t.guardHeld&&t.state==="idle"&&this._enter(t,"guard"),!t.guardHeld&&t.state==="guard"&&this._enter(t,"idle")}setHybridStyle(e){Number.isInteger(e)&&e>=0&&e<3&&(this.player.hybridStyle=e)}update(e,t={}){if(!(!Number.isFinite(e)||e<=0||this.result!=="playing"))for(this._input={x:Number.isFinite(t.x)?t.x:0,z:Number.isFinite(t.z)?t.z:0,aimX:Number.isFinite(t.aimX)?t.aimX:void 0,aimZ:Number.isFinite(t.aimZ)?t.aimZ:void 0},this._accumulator+=Math.min(e,.1);this._accumulator+1e-9>=Ca&&this.result==="playing";)this._accumulator-=Ca,this._step(Ca)}_event(e,t,n={}){this.events.push({type:e,actor:t.id,x:t.x,z:t.z,...n})}_enter(e,t,n=0){e.state=t,e.stateTime=0,e.stateDuration=n,e.invulnerable=!1,e.armored=this.mode==="boss"&&e.id==="enemy"&&(t==="windup"||t==="active"),t==="guard"&&(e.guardEligible=e.guardCooldown<=0,e.guardEligible&&(e.guardCooldown=.38)),(t==="idle"||t==="guard")&&(e.attack=null,e.attackTime=0,e.attackDuration=0)}_spend(e,t){e.stamina=Math.max(0,e.stamina-t),e.staminaDelay=.5}_startAction(e,t,n){if(t==="style")return e.stamina<5||n===e.style?!1:(this._spend(e,5),e.pendingStyle=n,this._enter(e,"switch",.14),!0);if(t==="evade"){if(e.stamina<18)return!1;this._spend(e,18);let a=Math.hypot(this._input.x,this._input.z);return e.dodgeX=a>.1?this._input.x/a:-Math.sin(e.yaw),e.dodgeZ=a>.1?this._input.z/a:-Math.cos(e.yaw),this._enter(e,"evade",.44),this._event("evade",e),!0}let i=t==="hybrid"?e.hybridStyle:e.style,s={...mi[i][t==="light"?"light":"heavy"],kind:t,style:i};return t==="hybrid"&&(s.cost+=5,s.recovery+=.08,s.name=`Borrowed ${s.name.toLowerCase()}`),this._beginAttack(e,s)}_beginAttack(e,t){return e.stamina<t.cost?!1:(this._spend(e,t.cost),e.attack={...t},e.attackTime=0,e.attackDuration=t.windup+t.active+t.recovery,e.hitTargets.clear(),e.attackSequence++,this._enter(e,"windup",t.windup),this._event("attack",e,{kind:t.kind,style:t.style,name:t.name}),!0)}_finish(e){let t=e.state;if(t==="windup"){this._enter(e,"active",e.attack.active),this._event("strike",e,{kind:e.attack.kind,style:e.attack.style});return}if(t==="active"){this._enter(e,"recovery",e.attack.recovery);return}t==="switch"&&(e.style=e.pendingStyle,this._event("style",e,{style:e.style})),t==="broken"&&(e.posture=e.maxPosture*.3),this._enter(e,"idle");let n=e.buffer;e.buffer=null,n&&n.expires>this.time&&this._startAction(e,n.name,n.targetStyle),e.state==="idle"&&e.guardHeld&&this._enter(e,"guard")}_tickFighter(e,t){if(e.state!=="dead"){if(e.guardCooldown=Math.max(0,e.guardCooldown-t),e.staminaDelay=Math.max(0,e.staminaDelay-t),e.postureDelay=Math.max(0,e.postureDelay-t),e.buffer&&e.buffer.expires<=this.time&&(e.buffer=null),er(e)||e.state==="recovery"){if(e.staminaDelay<=0){let n=e.state==="guard"?13:32;e.stamina=Math.min(100,e.stamina+n*t)}e.postureDelay<=0&&e.state!=="guard"&&(e.posture=Math.max(0,e.posture-15*t))}e.stateTime+=t,e.attack&&(e.attackTime+=t),e.stateDuration>0&&e.stateTime+1e-9>=e.stateDuration&&this._finish(e),e.invulnerable=e.state==="evade"&&e.stateTime>=.025&&e.stateTime<.3}}_move(e,t,n,i,s){e.x+=t*i*s,e.z+=n*i*s,this._confine(e)}_confine(e){let t=Math.hypot(e.x,e.z),n=this.arenaRadius-e.radius;t>n&&(e.x*=n/t,e.z*=n/t)}_movePlayer(e){let t=this.player;if(["dead","stun","broken","switch"].includes(t.state))return;if(t.state==="evade"){this._move(t,t.dodgeX,t.dodgeZ,t.stateTime<.29?8:3.5,e);return}let n=Math.hypot(this._input.x,this._input.z),i=Math.min(n,1),s=1;if(t.state==="guard"?s=.45:t.state==="windup"?s=.28:t.state==="active"?s=.12:t.state==="recovery"&&(s=.55),n>0&&this._move(t,this._input.x/n,this._input.z/n,(t.style===2?4.65:4.3)*i*s,e),er(t)||t.state==="windup"&&t.stateTime<t.stateDuration*.65){let a=this._input.aimX,o=this._input.aimZ;(a===void 0||o===void 0||Math.hypot(a,o)<.01)&&(a=this.enemy.x-t.x,o=this.enemy.z-t.z),Math.hypot(a,o)>.01&&(t.yaw=Math.atan2(a,o))}}_updateAI(e){if(!this.aiEnabled||this.enemy.state==="dead")return;let t=this.enemy,n=this.player.x-t.x,i=this.player.z-t.z,s=Math.hypot(n,i);if((er(t)||t.state==="windup"&&t.stateTime<t.stateDuration*.65)&&(t.yaw=Math.atan2(n,i)),!er(t))return;this._aiCooldown-=e;let a=eu[this.mode],o={...a[this._aiStep%a.length]};if(this.phase===2&&(o.windup-=.1,o.recovery-=.06),s>o.range*.78){s>.01&&this._move(t,n/s,i/s,this.mode==="boss"?2.25:1.9,e);return}this._aiCooldown<=0&&this._beginAttack(t,o)&&(this._aiStep++,this._aiCooldown=this.mode==="boss"?this.phase===2?.28:.48:.65)}_separate(){let e=this.enemy.x-this.player.x,t=this.enemy.z-this.player.z,n=Math.hypot(e,t),i=this.enemy.radius+this.player.radius;if(n>=i)return;let s=n>.001?e/n:1,a=n>.001?t/n:0,o=(i-n)/2;this.player.x-=s*o,this.player.z-=a*o,this.enemy.x+=s*o,this.enemy.z+=a*o,this._confine(this.player),this._confine(this.enemy)}_hitCandidate(e,t){if(e.state!=="active"||e.hitTargets.has(t.id)||t.state==="dead")return null;let n=t.x-e.x,i=t.z-e.z;return Math.hypot(n,i)>e.attack.range+t.radius*.35||Math.abs(rc(Math.atan2(n,i),e.yaw))>e.attack.arc/2?null:(e.hitTargets.add(t.id),{source:e,target:t,spec:{...e.attack}})}_break(e){e.posture=e.maxPosture,e.buffer=null,this._enter(e,"broken",e.id==="enemy"?1.45:1.05),this._event("break",e)}_receive({source:e,target:t,spec:n}){if(t.invulnerable){this._event("miss",e,{target:t.id,reason:"evade"});return}let i=Math.atan2(e.x-t.x,e.z-t.z),s=Math.abs(rc(i,t.yaw))<Math.PI*.48;if(t.state==="guard"&&s){if(t.guardEligible&&t.stateTime<(t.style===1?.24:.17)&&t.stamina>=3){this._spend(t,3),t.posture=Math.max(0,t.posture-12),e.posture=Math.min(e.maxPosture,e.posture+32),e.postureDelay=1,e.buffer=null,e.posture>=e.maxPosture?this._break(e):this._enter(e,"stun",.72),this._event("deflect",t,{target:e.id});return}this._spend(t,n.posture*.48),t.posture=Math.min(t.maxPosture,t.posture+n.posture),t.postureDelay=1,this._event("block",t,{target:e.id}),(t.stamina<=0||t.posture>=t.maxPosture)&&this._break(t);return}let a=t.state==="broken",o=n.damage*(a?1.35:1);t.health=Math.max(0,t.health-o),t.posture=Math.min(t.maxPosture,t.posture+n.posture*.72),t.postureDelay=1,t.buffer=null,t.health<=0?this._enter(t,"dead"):!a&&t.posture>=t.maxPosture?this._break(t):!a&&!t.armored&&this._enter(t,"stun",t.id==="enemy"?.25:.26),this._event("hit",e,{target:t.id,x:t.x,z:t.z,damage:o,kind:n.kind,style:n.style,armored:t.armored})}_step(e){this.time+=e,this._movePlayer(e),this._updateAI(e),this._tickFighter(this.player,e),this._tickFighter(this.enemy,e);for(let n of[this.player,this.enemy])n.state==="active"&&this._move(n,Math.sin(n.yaw),Math.cos(n.yaw),n.attack.lunge/n.attack.active,e);this._separate();let t=[this._hitCandidate(this.player,this.enemy),this._hitCandidate(this.enemy,this.player)];for(let n of t)n&&this._receive(n);if(this.player.health<=0||this.enemy.health<=0){this.result=this.player.health<=0?"lost":"won",this._event(this.result==="won"?"win":"lose",this.player);return}this.mode==="boss"&&this.phase===1&&this.enemy.health<=this.enemy.maxHealth*.5&&(this.phase=2,this._aiCooldown=1.2,this._event("phase",this.enemy,{phase:2}))}};var xh=2;var tu=0,nu=1,ca=2;var ha=2;var ii=100,iu=101,ru=102;var su=200,au=201,ou=202,lu=203,mo=204,fo=205,cu=206,hu=207,uu=208,du=209,pu=210,mu=211,fu=212,gu=213,vu=214,_u=0,yu=1,xu=2,Mu=3,Su=4,bu=5,Eu=6,wu=7;var Mh=4;var Sh=300,Di=301,Ni=302,go=303,vo=304,ua=306,_o=1e3,gr=1001,yo=1002,tn=1003,Tu=1004;var qr=1005;var Sn=1006,Pa=1007;var Pi=1008;var Bn=1009,bh=1010,Eh=1011,vr=1012,Hl=1013,ai=1014,hn=1015,Or=1016,Gl=1017,Vl=1018,Oi=1020,wh=35902,Th=1021,Ah=1022,un=1023,Rh=1024,Ch=1025,_r=1026,Fi=1027,Wl=1028,Xl=1029,Ph=1030,jl=1031;var ql=1033,Ts=33776,As=33777,Rs=33778,Cs=33779,xo=35840,Mo=35841,So=35842,bo=35843,Eo=36196,wo=37492,To=37496,Ao=37808,Ro=37809,Co=37810,Po=37811,Io=37812,Lo=37813,Uo=37814,Do=37815,No=37816,Oo=37817,Fo=37818,Bo=37819,zo=37820,ko=37821,Ps=36492,Ho=36494,Go=36495,Ih=36283,Vo=36284,Wo=36285,Xo=36286;var Ls=2300,jo=2301,Ia=2302,ac=2400,oc=2401,lc=2402;var Ci="",Dt="srgb",Yi="srgb-linear",da="linear",it="srgb";var fi=7680;var Au=512,Ru=513,Cu=514,Pu=515,Iu=516,Lu=517,Uu=518,Du=519,cc=35044;var hc="300 es",Bi=2e3,Us=2001,zn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let i=n.indexOf(t);i!==-1&&n.splice(i,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let i=0,s=n.length;i<s;i++)n[i].call(this,e);e.target=null}}},Rt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Is=Math.PI/180,qo=180/Math.PI;function Zi(){let r=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0;return(Rt[255&r]+Rt[r>>8&255]+Rt[r>>16&255]+Rt[r>>24&255]+"-"+Rt[255&e]+Rt[e>>8&255]+"-"+Rt[e>>16&15|64]+Rt[e>>24&255]+"-"+Rt[63&t|128]+Rt[t>>8&255]+"-"+Rt[t>>16&255]+Rt[t>>24&255]+Rt[255&n]+Rt[n>>8&255]+Rt[n>>16&255]+Rt[n>>24&255]).toLowerCase()}function wt(r,e,t){return Math.max(e,Math.min(t,r))}function Nu(r,e){return(r%e+e)%e}function La(r,e,t){return(1-t)*r+t*e}function tr(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function Ut(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("Invalid component type.")}}var ce=class r{constructor(e=0,t=0){r.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(wt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ke=class r{constructor(e,t,n,i,s,a,o,l,c){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],f=n[8],y=i[0],m=i[3],g=i[6],v=i[1],_=i[4],x=i[7],T=i[2],A=i[5],I=i[8];return s[0]=a*y+o*v+l*T,s[3]=a*m+o*_+l*A,s[6]=a*g+o*x+l*I,s[1]=c*y+h*v+d*T,s[4]=c*m+h*_+d*A,s[7]=c*g+h*x+d*I,s[2]=u*y+p*v+f*T,s[5]=u*m+p*_+f*A,s[8]=u*g+p*x+f*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*s,p=c*s-a*l,f=t*d+n*u+i*p;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/f;return e[0]=d*y,e[1]=(i*c-h*n)*y,e[2]=(o*n-i*a)*y,e[3]=u*y,e[4]=(h*t-i*l)*y,e[5]=(i*s-o*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*s)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ua.makeScale(e,t)),this}rotate(e){return this.premultiply(Ua.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ua.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ua=new ke;function Lh(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Ds(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Ou(){let r=Ds("canvas");return r.style.display="block",r}var uc={};function dr(r){r in uc||(uc[r]=!0,console.warn(r))}var Ze={enabled:!0,workingColorSpace:Yi,spaces:{},convert:function(r,e,t){return this.enabled!==!1&&e!==t&&e&&t&&(this.spaces[e].transfer===it&&(r.r=bn(r.r),r.g=bn(r.g),r.b=bn(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===it&&(r.r=Li(r.r),r.g=Li(r.g),r.b=Li(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ci?da:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function bn(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function Li(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}var dc=[.64,.33,.3,.6,.15,.06],pc=[.2126,.7152,.0722],mc=[.3127,.329],fc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gc=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715),gi;Ze.define({[Yi]:{primaries:dc,whitePoint:mc,transfer:da,toXYZ:fc,fromXYZ:gc,luminanceCoefficients:pc,workingColorSpaceConfig:{unpackColorSpace:Dt},outputColorSpaceConfig:{drawingBufferColorSpace:Dt}},[Dt]:{primaries:dc,whitePoint:mc,transfer:it,toXYZ:fc,fromXYZ:gc,luminanceCoefficients:pc,outputColorSpaceConfig:{drawingBufferColorSpace:Dt}}});var Yo=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{gi===void 0&&(gi=Ds("canvas")),gi.width=e.width,gi.height=e.height;let n=gi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=gi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ds("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=255*bn(s[a]/255);return n.putImageData(i,0,0),t}if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(255*bn(t[n]/255)):t[n]=bn(t[n]);return{data:t,width:e.width,height:e.height}}return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Fu=0,Ns=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Fu++}),this.uuid=Zi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Da(i[a].image)):s.push(Da(i[a]))}else s=Da(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function Da(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Yo.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Bu=0,kt=class r extends zn{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,n=1001,i=1001,s=1006,a=1008,o=1023,l=1009,c=r.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Bu++}),this.uuid=Zi(),this.name="",this.source=new Ns(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Sh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case _o:e.x=e.x-Math.floor(e.x);break;case gr:e.x=e.x<0?0:1;break;case yo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case _o:e.y=e.y-Math.floor(e.y);break;case gr:e.y=e.y<0?0:1;break;case yo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};kt.DEFAULT_IMAGE=null,kt.DEFAULT_MAPPING=Sh,kt.DEFAULT_ANISOTROPY=1;var $e=class r{constructor(e=0,t=0,n=0,i=1){r.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],f=l[9],y=l[2],m=l[6],g=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(f-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(f+m)<.1&&Math.abs(c+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,x=(p+1)/2,T=(g+1)/2,A=(h+u)/4,I=(d+y)/4,N=(f+m)/4;return _>x&&_>T?_<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(_),i=A/n,s=I/n):x>T?x<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(x),n=A/i,s=N/i):T<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(T),n=I/s,i=N/s),this.set(n,i,s,t),this}let v=Math.sqrt((m-f)*(m-f)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(v)<.001&&(v=1),this.x=(m-f)/v,this.y=(d-y)/v,this.z=(u-h)/v,this.w=Math.acos((c+p+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Zo=class extends zn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new $e(0,0,e,t),this.scissorTest=!1,this.viewport=new $e(0,0,e,t);let i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let s=new kt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Ns(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},En=class extends Zo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Os=class extends kt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=tn,this.minFilter=tn,this.wrapR=gr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Jo=class extends kt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=tn,this.minFilter=tn,this.wrapR=gr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var dn=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],d=n[i+3],u=s[a+0],p=s[a+1],f=s[a+2],y=s[a+3];if(o===0)return e[t+0]=l,e[t+1]=c,e[t+2]=h,void(e[t+3]=d);if(o===1)return e[t+0]=u,e[t+1]=p,e[t+2]=f,void(e[t+3]=y);if(d!==y||l!==u||c!==p||h!==f){let m=1-o,g=l*u+c*p+h*f+d*y,v=g>=0?1:-1,_=1-g*g;if(_>Number.EPSILON){let T=Math.sqrt(_),A=Math.atan2(T,g*v);m=Math.sin(m*A)/T,o=Math.sin(o*A)/T}let x=o*v;if(l=l*m+u*x,c=c*m+p*x,h=h*m+f*x,d=d*m+y*x,m===1-o){let T=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=T,c*=T,h*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,i,s,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],d=s[a],u=s[a+1],p=s[a+2],f=s[a+3];return e[t]=o*f+h*d+l*p-c*u,e[t+1]=l*f+h*u+c*d-o*p,e[t+2]=c*f+h*p+o*u-l*d,e[t+3]=h*f-o*d-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),d=o(s/2),u=l(n/2),p=l(i/2),f=l(s/2);switch(a){case"XYZ":this._x=u*h*d+c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d-u*p*f;break;case"YXZ":this._x=u*h*d+c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d+u*p*f;break;case"ZXY":this._x=u*h*d-c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d-u*p*f;break;case"ZYX":this._x=u*h*d-c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d+u*p*f;break;case"YZX":this._x=u*h*d+c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d-u*p*f;break;case"XZY":this._x=u*h*d-c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d+u*p*f;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+o+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(s-c)*p,this._z=(a-i)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(s+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(s-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-i)/p,this._x=(s+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(wt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),d=Math.sin((1-t)*h)/c,u=Math.sin(t*h)/c;return this._w=a*d+this._w*u,this._x=n*d+this._x*u,this._y=i*d+this._y*u,this._z=s*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class r{constructor(e=0,t=0,n=0){r.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(vc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(vc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),d=2*(s*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-s*d,this.z=i+l*d+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Na.copy(this).projectOnVector(e),this.sub(Na)}reflect(e){return this.sub(Na.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(wt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Na=new w,vc=new dn,rn=class{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Kt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Kt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Kt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Kt):Kt.fromBufferAttribute(s,a),Kt.applyMatrix4(e.matrixWorld),this.expandByPoint(Kt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Yr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Yr.copy(n.boundingBox)),Yr.applyMatrix4(e.matrixWorld),this.union(Yr)}let i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Kt),Kt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(nr),Zr.subVectors(this.max,nr),vi.subVectors(e.a,nr),_i.subVectors(e.b,nr),yi.subVectors(e.c,nr),Pn.subVectors(_i,vi),In.subVectors(yi,_i),Jn.subVectors(vi,yi);let t=[0,-Pn.z,Pn.y,0,-In.z,In.y,0,-Jn.z,Jn.y,Pn.z,0,-Pn.x,In.z,0,-In.x,Jn.z,0,-Jn.x,-Pn.y,Pn.x,0,-In.y,In.x,0,-Jn.y,Jn.x,0];return!!Oa(t,vi,_i,yi,Zr)&&(t=[1,0,0,0,1,0,0,0,1],!!Oa(t,vi,_i,yi,Zr)&&(Jr.crossVectors(Pn,In),t=[Jr.x,Jr.y,Jr.z],Oa(t,vi,_i,yi,Zr)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Kt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(Kt).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(vn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},vn=[new w,new w,new w,new w,new w,new w,new w,new w],Kt=new w,Yr=new rn,vi=new w,_i=new w,yi=new w,Pn=new w,In=new w,Jn=new w,nr=new w,Zr=new w,Jr=new w,Kn=new w;function Oa(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Kn.fromArray(r,s);let o=i.x*Math.abs(Kn.x)+i.y*Math.abs(Kn.y)+i.z*Math.abs(Kn.z),l=e.dot(Kn),c=t.dot(Kn),h=n.dot(Kn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var zu=new rn,ir=new w,Fa=new w,sn=class{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):zu.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ir.subVectors(e,this.center);let t=ir.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=.5*(n-this.radius);this.center.addScaledVector(ir,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Fa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ir.copy(e.center).add(Fa)),this.expandByPoint(ir.copy(e.center).sub(Fa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},_n=new w,Ba=new w,Kr=new w,Ln=new w,za=new w,$r=new w,ka=new w,oi=class{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=_n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_n.copy(this.origin).addScaledVector(this.direction,t),_n.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Ba.copy(e).add(t).multiplyScalar(.5),Kr.copy(t).sub(e).normalize(),Ln.copy(this.origin).sub(Ba);let s=.5*e.distanceTo(t),a=-this.direction.dot(Kr),o=Ln.dot(this.direction),l=-Ln.dot(Kr),c=Ln.lengthSq(),h=Math.abs(1-a*a),d,u,p,f;if(h>0)if(d=a*l-o,u=a*o-l,f=s*h,d>=0)if(u>=-f)if(u<=f){let y=1/h;d*=y,u*=y,p=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u=-s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u<=-f?(d=Math.max(0,-(-a*s+o)),u=d>0?-s:Math.min(Math.max(-s,-l),s),p=-d*d+u*(u+2*l)+c):u<=f?(d=0,u=Math.min(Math.max(-s,-l),s),p=u*(u+2*l)+c):(d=Math.max(0,-(a*s+o)),u=d>0?s:Math.min(Math.max(-s,-l),s),p=-d*d+u*(u+2*l)+c);else u=a>0?-s:s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(Ba).addScaledVector(Kr,u),p}intersectSphere(e,t){_n.subVectors(e.center,this.origin);let n=_n.dot(this.direction),i=_n.dot(_n)-n*n,s=e.radius*e.radius;if(i>s)return null;let a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,i=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,i=(e.min.x-u.x)*c),h>=0?(s=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(s=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||s>i?null:((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||o>i?null:((o>n||n!=n)&&(n=o),(l<i||i!=i)&&(i=l),i<0?null:this.at(n>=0?n:i,t)))}intersectsBox(e){return this.intersectBox(e,_n)!==null}intersectTriangle(e,t,n,i,s){za.subVectors(t,e),$r.subVectors(n,e),ka.crossVectors(za,$r);let a,o=this.direction.dot(ka);if(o>0){if(i)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}Ln.subVectors(this.origin,e);let l=a*this.direction.dot($r.crossVectors(Ln,$r));if(l<0)return null;let c=a*this.direction.dot(za.cross(Ln));if(c<0||l+c>o)return null;let h=-a*Ln.dot(ka);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Xe=class r{constructor(e,t,n,i,s,a,o,l,c,h,d,u,p,f,y,m){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,d,u,p,f,y,m)}set(e,t,n,i,s,a,o,l,c,h,d,u,p,f,y,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=i,g[1]=s,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=d,g[14]=u,g[3]=p,g[7]=f,g[11]=y,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/xi.setFromMatrixColumn(e,0).length(),s=1/xi.setFromMatrixColumn(e,1).length(),a=1/xi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let u=a*h,p=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=p+f*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=f+p*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,p=l*d,f=c*h,y=c*d;t[0]=u+y*o,t[4]=f*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=p*o-f,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,p=l*d,f=c*h,y=c*d;t[0]=u-y*o,t[4]=-a*d,t[8]=f+p*o,t[1]=p+f*o,t[5]=a*h,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,p=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=f*c-p,t[8]=u*c+y,t[1]=l*d,t[5]=y*c+u,t[9]=p*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,p=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=y-u*d,t[8]=f*d+p,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*d+f,t[10]=u-y*d}else if(e.order==="XZY"){let u=a*l,p=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+y,t[5]=a*h,t[9]=p*d-f,t[2]=f*d-p,t[6]=o*h,t[10]=y*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ku,e,Hu)}lookAt(e,t,n){let i=this.elements;return Bt.subVectors(e,t),Bt.lengthSq()===0&&(Bt.z=1),Bt.normalize(),Un.crossVectors(n,Bt),Un.lengthSq()===0&&(Math.abs(n.z)===1?Bt.x+=1e-4:Bt.z+=1e-4,Bt.normalize(),Un.crossVectors(n,Bt)),Un.normalize(),Qr.crossVectors(Bt,Un),i[0]=Un.x,i[4]=Qr.x,i[8]=Bt.x,i[1]=Un.y,i[5]=Qr.y,i[9]=Bt.y,i[2]=Un.z,i[6]=Qr.z,i[10]=Bt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],f=n[2],y=n[6],m=n[10],g=n[14],v=n[3],_=n[7],x=n[11],T=n[15],A=i[0],I=i[4],N=i[8],F=i[12],H=i[1],j=i[5],V=i[9],q=i[13],W=i[2],te=i[6],Q=i[10],he=i[14],oe=i[3],Ee=i[7],we=i[11],Z=i[15];return s[0]=a*A+o*H+l*W+c*oe,s[4]=a*I+o*j+l*te+c*Ee,s[8]=a*N+o*V+l*Q+c*we,s[12]=a*F+o*q+l*he+c*Z,s[1]=h*A+d*H+u*W+p*oe,s[5]=h*I+d*j+u*te+p*Ee,s[9]=h*N+d*V+u*Q+p*we,s[13]=h*F+d*q+u*he+p*Z,s[2]=f*A+y*H+m*W+g*oe,s[6]=f*I+y*j+m*te+g*Ee,s[10]=f*N+y*V+m*Q+g*we,s[14]=f*F+y*q+m*he+g*Z,s[3]=v*A+_*H+x*W+T*oe,s[7]=v*I+_*j+x*te+T*Ee,s[11]=v*N+_*V+x*Q+T*we,s[15]=v*F+_*q+x*he+T*Z,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],p=e[14];return e[3]*(+s*l*d-i*c*d-s*o*u+n*c*u+i*o*p-n*l*p)+e[7]*(+t*l*p-t*c*u+s*a*u-i*a*p+i*c*h-s*l*h)+e[11]*(+t*c*d-t*o*p-s*a*d+n*a*p+s*o*h-n*c*h)+e[15]*(-i*o*h-t*l*d+t*o*u+i*a*d-n*a*u+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],p=e[11],f=e[12],y=e[13],m=e[14],g=e[15],v=d*m*c-y*u*c+y*l*p-o*m*p-d*l*g+o*u*g,_=f*u*c-h*m*c-f*l*p+a*m*p+h*l*g-a*u*g,x=h*y*c-f*d*c+f*o*p-a*y*p-h*o*g+a*d*g,T=f*d*l-h*y*l-f*o*u+a*y*u+h*o*m-a*d*m,A=t*v+n*_+i*x+s*T;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/A;return e[0]=v*I,e[1]=(y*u*s-d*m*s-y*i*p+n*m*p+d*i*g-n*u*g)*I,e[2]=(o*m*s-y*l*s+y*i*c-n*m*c-o*i*g+n*l*g)*I,e[3]=(d*l*s-o*u*s-d*i*c+n*u*c+o*i*p-n*l*p)*I,e[4]=_*I,e[5]=(h*m*s-f*u*s+f*i*p-t*m*p-h*i*g+t*u*g)*I,e[6]=(f*l*s-a*m*s-f*i*c+t*m*c+a*i*g-t*l*g)*I,e[7]=(a*u*s-h*l*s+h*i*c-t*u*c-a*i*p+t*l*p)*I,e[8]=x*I,e[9]=(f*d*s-h*y*s-f*n*p+t*y*p+h*n*g-t*d*g)*I,e[10]=(a*y*s-f*o*s+f*n*c-t*y*c-a*n*g+t*o*g)*I,e[11]=(h*o*s-a*d*s-h*n*c+t*d*c+a*n*p-t*o*p)*I,e[12]=T*I,e[13]=(h*y*i-f*d*i+f*n*u-t*y*u-h*n*m+t*d*m)*I,e[14]=(f*o*i-a*y*i-f*n*l+t*y*l+a*n*m-t*o*m)*I,e[15]=(a*d*i-h*o*i+h*n*l-t*d*l-a*n*u+t*o*u)*I,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,d=o+o,u=s*c,p=s*h,f=s*d,y=a*h,m=a*d,g=o*d,v=l*c,_=l*h,x=l*d,T=n.x,A=n.y,I=n.z;return i[0]=(1-(y+g))*T,i[1]=(p+x)*T,i[2]=(f-_)*T,i[3]=0,i[4]=(p-x)*A,i[5]=(1-(u+g))*A,i[6]=(m+v)*A,i[7]=0,i[8]=(f+_)*I,i[9]=(m-v)*I,i[10]=(1-(u+y))*I,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=xi.set(i[0],i[1],i[2]).length(),a=xi.set(i[4],i[5],i[6]).length(),o=xi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],$t.copy(this);let l=1/s,c=1/a,h=1/o;return $t.elements[0]*=l,$t.elements[1]*=l,$t.elements[2]*=l,$t.elements[4]*=c,$t.elements[5]*=c,$t.elements[6]*=c,$t.elements[8]*=h,$t.elements[9]*=h,$t.elements[10]*=h,t.setFromRotationMatrix($t),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=2e3){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),d=(t+e)/(t-e),u=(n+i)/(n-i),p,f;if(o===Bi)p=-(a+s)/(a-s),f=-2*a*s/(a-s);else{if(o!==Us)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);p=-a/(a-s),f=-a*s/(a-s)}return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=f,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=2e3){let l=this.elements,c=1/(t-e),h=1/(n-i),d=1/(a-s),u=(t+e)*c,p=(n+i)*h,f,y;if(o===Bi)f=(a+s)*d,y=-2*d;else{if(o!==Us)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);f=s*d,y=-1*d}return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-f,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},xi=new w,$t=new Xe,ku=new w(0,0,0),Hu=new w(1,1,1),Un=new w,Qr=new w,Bt=new w,_c=new Xe,yc=new dn,pn=class r{constructor(e=0,t=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],d=i[2],u=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(wt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-wt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(wt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-wt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(wt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-wt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return _c.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_c,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return yc.setFromEuler(this),this.setFromQuaternion(yc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pn.DEFAULT_ORDER="XYZ";var yr=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return!!(this.mask&e.mask)}isEnabled(e){return!!(this.mask&1<<e)}},Gu=0,xc=new w,Mi=new dn,yn=new Xe,es=new w,rr=new w,Vu=new w,Wu=new dn,Mc=new w(1,0,0),Sc=new w(0,1,0),bc=new w(0,0,1),Ec={type:"added"},Xu={type:"removed"},Si={type:"childadded",child:null},Ha={type:"childremoved",child:null},Tt=class r extends zn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=Zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new w,t=new pn,n=new dn,i=new w(1,1,1);t._onChange((function(){n.setFromEuler(t,!1)})),n._onChange((function(){t.setFromQuaternion(n,void 0,!1)})),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Xe},normalMatrix:{value:new ke}}),this.matrix=new Xe,this.matrixWorld=new Xe,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Mi.setFromAxisAngle(e,t),this.quaternion.multiply(Mi),this}rotateOnWorldAxis(e,t){return Mi.setFromAxisAngle(e,t),this.quaternion.premultiply(Mi),this}rotateX(e){return this.rotateOnAxis(Mc,e)}rotateY(e){return this.rotateOnAxis(Sc,e)}rotateZ(e){return this.rotateOnAxis(bc,e)}translateOnAxis(e,t){return xc.copy(e).applyQuaternion(this.quaternion),this.position.add(xc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Mc,e)}translateY(e){return this.translateOnAxis(Sc,e)}translateZ(e){return this.translateOnAxis(bc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?es.copy(e):es.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),rr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yn.lookAt(rr,es,this.up):yn.lookAt(es,rr,this.up),this.quaternion.setFromRotationMatrix(yn),i&&(yn.extractRotation(i.matrixWorld),Mi.setFromRotationMatrix(yn),this.quaternion.premultiply(Mi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ec),Si.child=e,this.dispatchEvent(Si),Si.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Xu),Ha.child=e,this.dispatchEvent(Ha),Ha.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yn.multiply(e.parent.matrixWorld)),e.applyMatrix4(yn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ec),Si.child=e,this.dispatchEvent(Si),Si.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let s=this.children[n].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rr,e,Vu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rr,Wu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map((o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()}))),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()})),this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),p=a(e.animations),f=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),f.length>0&&(n.nodes=f)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};Tt.DEFAULT_UP=new w(0,1,0),Tt.DEFAULT_MATRIX_AUTO_UPDATE=!0,Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qt=new w,xn=new w,Ga=new w,Mn=new w,bi=new w,Ei=new w,wc=new w,Va=new w,Wa=new w,Xa=new w,ja=new $e,qa=new $e,Ya=new $e,On=class r{constructor(e=new w,t=new w,n=new w){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Qt.subVectors(e,t),i.cross(Qt);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Qt.subVectors(i,t),xn.subVectors(n,t),Ga.subVectors(e,t);let a=Qt.dot(Qt),o=Qt.dot(xn),l=Qt.dot(Ga),c=xn.dot(xn),h=xn.dot(Ga),d=a*c-o*o;if(d===0)return s.set(0,0,0),null;let u=1/d,p=(c*l-o*h)*u,f=(a*h-o*l)*u;return s.set(1-p-f,f,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Mn)!==null&&Mn.x>=0&&Mn.y>=0&&Mn.x+Mn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,Mn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Mn.x),l.addScaledVector(a,Mn.y),l.addScaledVector(o,Mn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return ja.setScalar(0),qa.setScalar(0),Ya.setScalar(0),ja.fromBufferAttribute(e,t),qa.fromBufferAttribute(e,n),Ya.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(ja,s.x),a.addScaledVector(qa,s.y),a.addScaledVector(Ya,s.z),a}static isFrontFacing(e,t,n,i){return Qt.subVectors(n,t),xn.subVectors(e,t),Qt.cross(xn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qt.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),.5*Qt.cross(xn).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return r.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,a,o;bi.subVectors(i,n),Ei.subVectors(s,n),Va.subVectors(e,n);let l=bi.dot(Va),c=Ei.dot(Va);if(l<=0&&c<=0)return t.copy(n);Wa.subVectors(e,i);let h=bi.dot(Wa),d=Ei.dot(Wa);if(h>=0&&d<=h)return t.copy(i);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(bi,a);Xa.subVectors(e,s);let p=bi.dot(Xa),f=Ei.dot(Xa);if(f>=0&&p<=f)return t.copy(s);let y=p*c-l*f;if(y<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(Ei,o);let m=h*f-p*d;if(m<=0&&d-h>=0&&p-f>=0)return wc.subVectors(s,i),o=(d-h)/(d-h+(p-f)),t.copy(i).addScaledVector(wc,o);let g=1/(m+y+u);return a=y*g,o=u*g,t.copy(n).addScaledVector(bi,a).addScaledVector(Ei,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Uh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},ts={h:0,s:0,l:0};function Za(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(e-r)*t:t<.5?e:t<2/3?r+6*(e-r)*(2/3-t):r}var Be=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,Ze.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=Ze.workingColorSpace){if(e=Nu(e,1),t=wt(t,0,1),n=wt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Za(a,s,e+1/3),this.g=Za(a,s,e),this.b=Za(a,s,e-1/3)}return Ze.toWorkingColorSpace(this,i),this}setStyle(e,t=Dt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dt){let n=Uh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bn(e.r),this.g=bn(e.g),this.b=bn(e.b),this}copyLinearToSRGB(e){return this.r=Li(e.r),this.g=Li(e.g),this.b=Li(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dt){return Ze.fromWorkingColorSpace(Ct.copy(this),e),65536*Math.round(wt(255*Ct.r,0,255))+256*Math.round(wt(255*Ct.g,0,255))+Math.round(wt(255*Ct.b,0,255))}getHexString(e=Dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.fromWorkingColorSpace(Ct.copy(this),t);let n=Ct.r,i=Ct.g,s=Ct.b,a=Math.max(n,i,s),o=Math.min(n,i,s),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(i-s)/d+(i<s?6:0);break;case i:l=(s-n)/d+2;break;case s:l=(n-i)/d+4}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(Ct.copy(this),t),e.r=Ct.r,e.g=Ct.g,e.b=Ct.b,e}getStyle(e=Dt){Ze.fromWorkingColorSpace(Ct.copy(this),e);let t=Ct.r,n=Ct.g,i=Ct.b;return e!==Dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*n)},${Math.round(255*i)})`}offsetHSL(e,t,n){return this.getHSL(Dn),this.setHSL(Dn.h+e,Dn.s+t,Dn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Dn),e.getHSL(ts);let n=La(Dn.h,ts.h,t),i=La(Dn.s,ts.s,t),s=La(Dn.l,ts.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ct=new Be;Be.NAMES=Uh;var ju=0,wn=class extends zn{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=Zi(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mo,this.blendDst=fo,this.blendEquation=ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fi,this.stencilZFail=fi,this.stencilZPass=fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];i!==void 0?i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n:console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};function i(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==mo&&(n.blendSrc=this.blendSrc),this.blendDst!==fo&&(n.blendDst=this.blendDst),this.blendEquation!==ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData),t){let s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},zi=class extends wn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Jp=qu();function qu(){let r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[256|l]=32768,i[l]=24,i[256|l]=24):c<-14?(n[l]=1024>>-c-14,n[256|l]=1024>>-c-14|32768,i[l]=-c-1,i[256|l]=-c-1):c<=15?(n[l]=c+15<<10,n[256|l]=c+15<<10|32768,i[l]=13,i[256|l]=13):c<128?(n[l]=31744,n[256|l]=64512,i[l]=24,i[256|l]=24):(n[l]=31744,n[256|l]=64512,i[l]=13,i[256|l]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(8388608&c);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}var yt=new w,ns=new ce,Mt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=cc,this.updateRanges=[],this.gpuType=hn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ns.fromBufferAttribute(this,t),ns.applyMatrix3(e),this.setXY(t,ns.x,ns.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix3(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix4(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyNormalMatrix(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.transformDirection(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=tr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ut(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=tr(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=tr(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=tr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=tr(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array),i=Ut(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array),i=Ut(i,this.array),s=Ut(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==cc&&(e.usage=this.usage),e}};var Fs=class extends Mt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Bs=class extends Mt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ue=class extends Mt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Yu=0,jt=new Xe,Ja=new Tt,wi=new w,zt=new rn,sr=new rn,Et=new w,rt=class r extends zn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=Zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Lh(e)?Bs:Fs)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new ke().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return jt.makeRotationFromQuaternion(e),this.applyMatrix4(jt),this}rotateX(e){return jt.makeRotationX(e),this.applyMatrix4(jt),this}rotateY(e){return jt.makeRotationY(e),this.applyMatrix4(jt),this}rotateZ(e){return jt.makeRotationZ(e),this.applyMatrix4(jt),this}translate(e,t,n){return jt.makeTranslation(e,t,n),this.applyMatrix4(jt),this}scale(e,t,n){return jt.makeScale(e,t,n),this.applyMatrix4(jt),this}lookAt(e){return Ja.lookAt(e),Ja.updateMatrix(),this.applyMatrix4(Ja.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,s=e.length;i<s;i++){let a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ue(n,3))}else{for(let n=0,i=t.count;n<i;n++){let s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Et.addVectors(this.boundingBox.min,zt.min),this.boundingBox.expandByPoint(Et),Et.addVectors(this.boundingBox.max,zt.max),this.boundingBox.expandByPoint(Et)):(this.boundingBox.expandByPoint(zt.min),this.boundingBox.expandByPoint(zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new w,1/0);if(e){let n=this.boundingSphere.center;if(zt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];sr.setFromBufferAttribute(o),this.morphTargetsRelative?(Et.addVectors(zt.min,sr.min),zt.expandByPoint(Et),Et.addVectors(zt.max,sr.max),zt.expandByPoint(Et)):(zt.expandByPoint(sr.min),zt.expandByPoint(sr.max))}zt.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Et.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Et));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Et.fromBufferAttribute(o,c),l&&(wi.fromBufferAttribute(e,c),Et.add(wi)),i=Math.max(i,n.distanceToSquared(Et))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Mt(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let N=0;N<n.count;N++)o[N]=new w,l[N]=new w;let c=new w,h=new w,d=new w,u=new ce,p=new ce,f=new ce,y=new w,m=new w;function g(N,F,H){c.fromBufferAttribute(n,N),h.fromBufferAttribute(n,F),d.fromBufferAttribute(n,H),u.fromBufferAttribute(s,N),p.fromBufferAttribute(s,F),f.fromBufferAttribute(s,H),h.sub(c),d.sub(c),p.sub(u),f.sub(u);let j=1/(p.x*f.y-f.x*p.y);isFinite(j)&&(y.copy(h).multiplyScalar(f.y).addScaledVector(d,-p.y).multiplyScalar(j),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-f.x).multiplyScalar(j),o[N].add(y),o[F].add(y),o[H].add(y),l[N].add(m),l[F].add(m),l[H].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let N=0,F=v.length;N<F;++N){let H=v[N],j=H.start;for(let V=j,q=j+H.count;V<q;V+=3)g(e.getX(V+0),e.getX(V+1),e.getX(V+2))}let _=new w,x=new w,T=new w,A=new w;function I(N){T.fromBufferAttribute(i,N),A.copy(T);let F=o[N];_.copy(F),_.sub(T.multiplyScalar(T.dot(F))).normalize(),x.crossVectors(A,F);let H=x.dot(l[N])<0?-1:1;a.setXYZW(N,_.x,_.y,_.z,H)}for(let N=0,F=v.length;N<F;++N){let H=v[N],j=H.start;for(let V=j,q=j+H.count;V<q;V+=3)I(e.getX(V+0)),I(e.getX(V+1)),I(e.getX(V+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Mt(new Float32Array(3*t.count),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let i=new w,s=new w,a=new w,o=new w,l=new w,c=new w,h=new w,d=new w;if(e)for(let u=0,p=e.count;u<p;u+=3){let f=e.getX(u+0),y=e.getX(u+1),m=e.getX(u+2);i.fromBufferAttribute(t,f),s.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),h.subVectors(a,s),d.subVectors(i,s),h.cross(d),o.fromBufferAttribute(n,f),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,s),d.subVectors(i,s),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Et.fromBufferAttribute(e,t),Et.normalize(),e.setXYZ(t,Et.x,Et.y,Et.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),p=0,f=0;for(let y=0,m=l.length;y<m;y++){p=o.isInterleavedBufferAttribute?l[y]*o.data.stride+o.offset:l[y]*h;for(let g=0;g<h;g++)u[f++]=c[p++]}return new Mt(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,n=this.index.array,i=this.attributes;for(let o in i){let l=e(i[o],n);t.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let l=[],c=s[o];for(let h=0,d=c.length;h<d;h++){let u=e(c[h],n);l.push(u)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],d=s[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Tc=new Xe,$n=new oi,is=new sn,Ac=new w,rs=new w,ss=new w,as=new w,Ka=new w,os=new w,Rc=new w,ls=new w,Pt=class extends Tt{constructor(e=new rt,t=new zi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(s&&o){os.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=o[l],d=s[l];h!==0&&(Ka.fromBufferAttribute(d,e),a?os.addScaledVector(Ka,h):os.addScaledVector(Ka.sub(t),h))}t.add(os)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i!==void 0){if(n.boundingSphere===null&&n.computeBoundingSphere(),is.copy(n.boundingSphere),is.applyMatrix4(s),$n.copy(e.ray).recast(e.near),is.containsPoint($n.origin)===!1&&($n.intersectSphere(is,Ac)===null||$n.origin.distanceToSquared(Ac)>(e.far-e.near)**2))return;Tc.copy(s).invert(),$n.copy(e.ray).applyMatrix4(Tc),n.boundingBox!==null&&$n.intersectsBox(n.boundingBox)===!1||this._computeIntersections(e,t,$n)}}_computeIntersections(e,t,n){let i,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let m=u[f],g=a[m.materialIndex];for(let v=Math.max(m.start,p.start),_=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));v<_;v+=3)i=cs(this,g,e,n,c,h,d,o.getX(v),o.getX(v+1),o.getX(v+2)),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}else for(let f=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);f<y;f+=3)i=cs(this,a,e,n,c,h,d,o.getX(f),o.getX(f+1),o.getX(f+2)),i&&(i.faceIndex=Math.floor(f/3),t.push(i));else if(l!==void 0)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let m=u[f],g=a[m.materialIndex];for(let v=Math.max(m.start,p.start),_=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));v<_;v+=3)i=cs(this,g,e,n,c,h,d,v,v+1,v+2),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}else for(let f=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);f<y;f+=3)i=cs(this,a,e,n,c,h,d,f,f+1,f+2),i&&(i.faceIndex=Math.floor(f/3),t.push(i))}};function cs(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,rs),r.getVertexPosition(l,ss),r.getVertexPosition(c,as);let h=(function(d,u,p,f,y,m,g,v){let _;if(_=u.side===1?f.intersectTriangle(g,m,y,!0,v):f.intersectTriangle(y,m,g,u.side===0,v),_===null)return null;ls.copy(v),ls.applyMatrix4(d.matrixWorld);let x=p.ray.origin.distanceTo(ls);return x<p.near||x>p.far?null:{distance:x,point:ls.clone(),object:d}})(r,e,t,n,rs,ss,as,Rc);if(h){let d=new w;On.getBarycoord(Rc,rs,ss,as,d),i&&(h.uv=On.getInterpolatedAttribute(i,o,l,c,d,new ce)),s&&(h.uv1=On.getInterpolatedAttribute(s,o,l,c,d,new ce)),a&&(h.normal=On.getInterpolatedAttribute(a,o,l,c,d,new w),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new w,materialIndex:0};On.getNormal(rs,ss,as,u.normal),h.face=u,h.barycoord=d}return h}var kn=class r extends rt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};let o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,p=0;function f(y,m,g,v,_,x,T,A,I,N,F){let H=x/I,j=T/N,V=x/2,q=T/2,W=A/2,te=I+1,Q=N+1,he=0,oe=0,Ee=new w;for(let we=0;we<Q;we++){let Z=we*j-q;for(let le=0;le<te;le++){let ye=le*H-V;Ee[y]=ye*v,Ee[m]=Z*_,Ee[g]=W,c.push(Ee.x,Ee.y,Ee.z),Ee[y]=0,Ee[m]=0,Ee[g]=A>0?1:-1,h.push(Ee.x,Ee.y,Ee.z),d.push(le/I),d.push(1-we/N),he+=1}}for(let we=0;we<N;we++)for(let Z=0;Z<I;Z++){let le=u+Z+te*we,ye=u+Z+te*(we+1),ve=u+(Z+1)+te*(we+1),fe=u+(Z+1)+te*we;l.push(le,ye,fe),l.push(ye,ve,fe),oe+=6}o.addGroup(p,oe,F),p+=oe,u+=he}f("z","y","x",-1,-1,n,t,e,a,s,0),f("z","y","x",1,-1,n,t,-e,a,s,1),f("x","z","y",1,1,e,n,t,i,a,2),f("x","z","y",1,-1,e,n,-t,i,a,3),f("x","y","z",1,-1,e,t,n,i,s,4),f("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Ue(c,3)),this.setAttribute("normal",new Ue(h,3)),this.setAttribute("uv",new Ue(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ki(r){let e={};for(let t in r){e[t]={};for(let n in r[t]){let i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Lt(r){let e={};for(let t=0;t<r.length;t++){let n=ki(r[t]);for(let i in n)e[i]=n[i]}return e}function Dh(r){let e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}var Zu={clone:ki,merge:Lt},mn=class extends wn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ki(e.uniforms),this.uniformsGroups=(function(t){let n=[];for(let i=0;i<t.length;i++)n.push(t[i].clone());return n})(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let s=this.uniforms[i].value;s&&s.isTexture?t.uniforms[i]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[i]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[i]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[i]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[i]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[i]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[i]={type:"m4",value:s.toArray()}:t.uniforms[i]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},xr=class extends Tt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xe,this.projectionMatrix=new Xe,this.projectionMatrixInverse=new Xe,this.coordinateSystem=Bi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Nn=new w,Cc=new ce,Pc=new ce,Nt=class extends xr{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=2*qo*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(.5*Is*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*qo*Math.atan(Math.tan(.5*Is*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Nn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z),Nn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z)}getViewSize(e,t){return this.getViewBounds(e,Cc,Pc),t.subVectors(Pc,Cc)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(.5*Is*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ti=-90,Ko=class extends Tt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Nt(Ti,1,e,t);i.layers=this.layers,this.add(i);let s=new Nt(Ti,1,e,t);s.layers=this.layers,this.add(s);let a=new Nt(Ti,1,e,t);a.layers=this.layers,this.add(a);let o=new Nt(Ti,1,e,t);o.layers=this.layers,this.add(o);let l=new Nt(Ti,1,e,t);l.layers=this.layers,this.add(l);let c=new Nt(Ti,1,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(let c of t)this.remove(c);if(e===Bi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else{if(e!==Us)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1)}for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(d,u,p),e.xr.enabled=f,n.texture.needsPMREMUpdate=!0}},zs=class extends kt{constructor(e,t,n,i,s,a,o,l,c,h){super(e=e!==void 0?e:[],t=t!==void 0?t:Di,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},$o=class extends En{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new zs(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Sn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new kn(5,5,5),s=new mn({name:"CubemapFromEquirect",uniforms:ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;let a=new Pt(i,s),o=t.minFilter;return t.minFilter===Pi&&(t.minFilter=Sn),new Ko(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}},$a=new w,Ju=new w,Ku=new ke,en=class{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=$a.subVectors(n,t).cross(Ju.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta($a),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ku.getNormalMatrix(e),i=this.coplanarPoint($a).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Qn=new sn,hs=new w,Hi=class{constructor(e=new en,t=new en,n=new en,i=new en,s=new en,a=new en){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2e3){let n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],d=i[6],u=i[7],p=i[8],f=i[9],y=i[10],m=i[11],g=i[12],v=i[13],_=i[14],x=i[15];if(n[0].setComponents(l-s,u-c,m-p,x-g).normalize(),n[1].setComponents(l+s,u+c,m+p,x+g).normalize(),n[2].setComponents(l+a,u+h,m+f,x+v).normalize(),n[3].setComponents(l-a,u-h,m-f,x-v).normalize(),n[4].setComponents(l-o,u-d,m-y,x-_).normalize(),t===Bi)n[5].setComponents(l+o,u+d,m+y,x+_).normalize();else{if(t!==Us)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);n[5].setComponents(o,d,y,_).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Qn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Qn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Qn)}intersectsSprite(e){return Qn.center.set(0,0,0),Qn.radius=.7071067811865476,Qn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Qn)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(hs.x=i.normal.x>0?e.max.x:e.min.x,hs.y=i.normal.y>0?e.max.y:e.min.y,hs.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(hs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Nh(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function $u(r){let e=new WeakMap;return{get:function(t){return t.isInterleavedBufferAttribute&&(t=t.data),e.get(t)},remove:function(t){t.isInterleavedBufferAttribute&&(t=t.data);let n=e.get(t);n&&(r.deleteBuffer(n.buffer),e.delete(t))},update:function(t,n){if(t.isInterleavedBufferAttribute&&(t=t.data),t.isGLBufferAttribute){let s=e.get(t);return void((!s||s.version<t.version)&&e.set(t,{buffer:t.buffer,type:t.type,bytesPerElement:t.elementSize,version:t.version}))}let i=e.get(t);if(i===void 0)e.set(t,(function(s,a){let o=s.array,l=s.usage,c=o.byteLength,h=r.createBuffer(),d;if(r.bindBuffer(a,h),r.bufferData(a,o,l),s.onUploadCallback(),o instanceof Float32Array)d=r.FLOAT;else if(o instanceof Uint16Array)d=s.isFloat16BufferAttribute?r.HALF_FLOAT:r.UNSIGNED_SHORT;else if(o instanceof Int16Array)d=r.SHORT;else if(o instanceof Uint32Array)d=r.UNSIGNED_INT;else if(o instanceof Int32Array)d=r.INT;else if(o instanceof Int8Array)d=r.BYTE;else if(o instanceof Uint8Array)d=r.UNSIGNED_BYTE;else{if(!(o instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);d=r.UNSIGNED_BYTE}return{buffer:h,type:d,bytesPerElement:o.BYTES_PER_ELEMENT,version:s.version,size:c}})(t,n));else if(i.version<t.version){if(i.size!==t.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(s,a,o){let l=a.array,c=a.updateRanges;if(r.bindBuffer(o,s),c.length===0)r.bufferSubData(o,0,l);else{c.sort(((d,u)=>d.start-u.start));let h=0;for(let d=1;d<c.length;d++){let u=c[h],p=c[d];p.start<=u.start+u.count+1?u.count=Math.max(u.count,p.start+p.count-u.start):(++h,c[h]=p)}c.length=h+1;for(let d=0,u=c.length;d<u;d++){let p=c[d];r.bufferSubData(o,p.start*l.BYTES_PER_ELEMENT,l,p.start,p.count)}a.clearUpdateRanges()}a.onUploadCallback()})(i.buffer,t,n),i.version=t.version}}}}var Hn=class r extends rt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,d=e/o,u=t/l,p=[],f=[],y=[],m=[];for(let g=0;g<h;g++){let v=g*u-a;for(let _=0;_<c;_++){let x=_*d-s;f.push(x,-v,0),y.push(0,0,1),m.push(_/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let v=0;v<o;v++){let _=v+c*g,x=v+c*(g+1),T=v+1+c*(g+1),A=v+1+c*g;p.push(_,x,A),p.push(x,T,A)}this.setIndex(p),this.setAttribute("position",new Ue(f,3)),this.setAttribute("normal",new Ue(y,3)),this.setAttribute("uv",new Ue(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},We={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},cn={basic:{uniforms:Lt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Lt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Lt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Lt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Lt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Lt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Lt([pe.points,pe.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Lt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Lt([pe.common,pe.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Lt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Lt([pe.sprite,pe.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distanceRGBA:{uniforms:Lt([pe.common,pe.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distanceRGBA_vert,fragmentShader:We.distanceRGBA_frag},shadow:{uniforms:Lt([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};cn.physical={uniforms:Lt([cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var us={r:0,b:0,g:0},ei=new pn,Qu=new Xe;function ed(r,e,t,n,i,s,a){let o=new Be(0),l,c,h=s===!0?0:1,d=null,u=0,p=null;function f(m){let g=m.isScene===!0?m.background:null;return g&&g.isTexture&&(g=(m.backgroundBlurriness>0?t:e).get(g)),g}function y(m,g){m.getRGB(us,Dh(r)),n.buffers.color.setClear(us.r,us.g,us.b,g,a)}return{getClearColor:function(){return o},setClearColor:function(m,g=1){o.set(m),h=g,y(o,h)},getClearAlpha:function(){return h},setClearAlpha:function(m){h=m,y(o,h)},render:function(m){let g=!1,v=f(m);v===null?y(o,h):v&&v.isColor&&(y(v,1),g=!0);let _=r.xr.getEnvironmentBlendMode();_==="additive"?n.buffers.color.setClear(0,0,0,1,a):_==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||g)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))},addToRenderList:function(m,g){let v=f(g);v&&(v.isCubeTexture||v.mapping===ua)?(c===void 0&&(c=new Pt(new kn(1,1,1),new mn({name:"BackgroundCubeMaterial",uniforms:ki(cn.backgroundCube.uniforms),vertexShader:cn.backgroundCube.vertexShader,fragmentShader:cn.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(_,x,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),ei.copy(g.backgroundRotation),ei.x*=-1,ei.y*=-1,ei.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),c.material.uniforms.envMap.value=v,c.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Qu.makeRotationFromEuler(ei)),c.material.toneMapped=Ze.getTransfer(v.colorSpace)!==it,d===v&&u===v.version&&p===r.toneMapping||(c.material.needsUpdate=!0,d=v,u=v.version,p=r.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Pt(new Hn(2,2),new mn({name:"BackgroundMaterial",uniforms:ki(cn.background.uniforms),vertexShader:cn.background.vertexShader,fragmentShader:cn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,l.material.toneMapped=Ze.getTransfer(v.colorSpace)!==it,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),d===v&&u===v.version&&p===r.toneMapping||(l.material.needsUpdate=!0,d=v,u=v.version,p=r.toneMapping),l.layers.enableAll(),m.unshift(l,l.geometry,l.material,0,0,null))}}}function td(r,e){let t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=c(null),s=i,a=!1;function o(g){return r.bindVertexArray(g)}function l(g){return r.deleteVertexArray(g)}function c(g){let v=[],_=[],x=[];for(let T=0;T<t;T++)v[T]=0,_[T]=0,x[T]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:v,enabledAttributes:_,attributeDivisors:x,object:g,attributes:{},index:null}}function h(){let g=s.newAttributes;for(let v=0,_=g.length;v<_;v++)g[v]=0}function d(g){u(g,0)}function u(g,v){let _=s.newAttributes,x=s.enabledAttributes,T=s.attributeDivisors;_[g]=1,x[g]===0&&(r.enableVertexAttribArray(g),x[g]=1),T[g]!==v&&(r.vertexAttribDivisor(g,v),T[g]=v)}function p(){let g=s.newAttributes,v=s.enabledAttributes;for(let _=0,x=v.length;_<x;_++)v[_]!==g[_]&&(r.disableVertexAttribArray(_),v[_]=0)}function f(g,v,_,x,T,A,I){I===!0?r.vertexAttribIPointer(g,v,_,T,A):r.vertexAttribPointer(g,v,_,x,T,A)}function y(){m(),a=!0,s!==i&&(s=i,o(s.object))}function m(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:function(g,v,_,x,T){let A=!1,I=(function(N,F,H){let j=H.wireframe===!0,V=n[N.id];V===void 0&&(V={},n[N.id]=V);let q=V[F.id];q===void 0&&(q={},V[F.id]=q);let W=q[j];return W===void 0&&(W=c(r.createVertexArray()),q[j]=W),W})(x,_,v);s!==I&&(s=I,o(s.object)),A=(function(N,F,H,j){let V=s.attributes,q=F.attributes,W=0,te=H.getAttributes();for(let Q in te)if(te[Q].location>=0){let he=V[Q],oe=q[Q];if(oe===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(oe=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(oe=N.instanceColor)),he===void 0||he.attribute!==oe||oe&&he.data!==oe.data)return!0;W++}return s.attributesNum!==W||s.index!==j})(g,x,_,T),A&&(function(N,F,H,j){let V={},q=F.attributes,W=0,te=H.getAttributes();for(let Q in te)if(te[Q].location>=0){let he=q[Q];he===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(he=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(he=N.instanceColor));let oe={};oe.attribute=he,he&&he.data&&(oe.data=he.data),V[Q]=oe,W++}s.attributes=V,s.attributesNum=W,s.index=j})(g,x,_,T),T!==null&&e.update(T,r.ELEMENT_ARRAY_BUFFER),(A||a)&&(a=!1,(function(N,F,H,j){h();let V=j.attributes,q=H.getAttributes(),W=F.defaultAttributeValues;for(let te in q){let Q=q[te];if(Q.location>=0){let he=V[te];if(he===void 0&&(te==="instanceMatrix"&&N.instanceMatrix&&(he=N.instanceMatrix),te==="instanceColor"&&N.instanceColor&&(he=N.instanceColor)),he!==void 0){let oe=he.normalized,Ee=he.itemSize,we=e.get(he);if(we===void 0)continue;let Z=we.buffer,le=we.type,ye=we.bytesPerElement,ve=le===r.INT||le===r.UNSIGNED_INT||he.gpuType===Hl;if(he.isInterleavedBufferAttribute){let fe=he.data,E=fe.stride,b=he.offset;if(fe.isInstancedInterleavedBuffer){for(let D=0;D<Q.locationSize;D++)u(Q.location+D,fe.meshPerAttribute);N.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let D=0;D<Q.locationSize;D++)d(Q.location+D);r.bindBuffer(r.ARRAY_BUFFER,Z);for(let D=0;D<Q.locationSize;D++)f(Q.location+D,Ee/Q.locationSize,le,oe,E*ye,(b+Ee/Q.locationSize*D)*ye,ve)}else{if(he.isInstancedBufferAttribute){for(let fe=0;fe<Q.locationSize;fe++)u(Q.location+fe,he.meshPerAttribute);N.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let fe=0;fe<Q.locationSize;fe++)d(Q.location+fe);r.bindBuffer(r.ARRAY_BUFFER,Z);for(let fe=0;fe<Q.locationSize;fe++)f(Q.location+fe,Ee/Q.locationSize,le,oe,Ee*ye,Ee/Q.locationSize*fe*ye,ve)}}else if(W!==void 0){let oe=W[te];if(oe!==void 0)switch(oe.length){case 2:r.vertexAttrib2fv(Q.location,oe);break;case 3:r.vertexAttrib3fv(Q.location,oe);break;case 4:r.vertexAttrib4fv(Q.location,oe);break;default:r.vertexAttrib1fv(Q.location,oe)}}}}p()})(g,v,_,x),T!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(T).buffer))},reset:y,resetDefaultState:m,dispose:function(){y();for(let g in n){let v=n[g];for(let _ in v){let x=v[_];for(let T in x)l(x[T].object),delete x[T];delete v[_]}delete n[g]}},releaseStatesOfGeometry:function(g){if(n[g.id]===void 0)return;let v=n[g.id];for(let _ in v){let x=v[_];for(let T in x)l(x[T].object),delete x[T];delete v[_]}delete n[g.id]},releaseStatesOfProgram:function(g){for(let v in n){let _=n[v];if(_[g.id]===void 0)continue;let x=_[g.id];for(let T in x)l(x[T].object),delete x[T];delete _[g.id]}},initAttributes:h,enableAttribute:d,disableUnusedAttributes:p}}function nd(r,e,t){let n;function i(s,a,o){o!==0&&(r.drawArraysInstanced(n,s,a,o),t.update(a,n,o))}this.setMode=function(s){n=s},this.render=function(s,a){r.drawArrays(n,s,a),t.update(a,n,1)},this.renderInstances=i,this.renderMultiDraw=function(s,a,o){if(o===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,s,0,a,0,o);let l=0;for(let c=0;c<o;c++)l+=a[c];t.update(l,n,1)},this.renderMultiDrawInstances=function(s,a,o,l){if(o===0)return;let c=e.get("WEBGL_multi_draw");if(c===null)for(let h=0;h<s.length;h++)i(s[h],a[h],l[h]);else{c.multiDrawArraysInstancedWEBGL(n,s,0,a,0,l,0,o);let h=0;for(let d=0;d<o;d++)h+=a[d]*l[d];t.update(h,n,1)}}}function id(r,e,t,n){let i;function s(u){if(u==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";u="mediump"}return u==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=t.precision!==void 0?t.precision:"highp",o=s(a);o!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);let l=t.logarithmicDepthBuffer===!0,c=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),h=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),d=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS);return{isWebGL2:!0,getMaxAnisotropy:function(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let u=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(u.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i},getMaxPrecision:s,textureFormatReadable:function(u){return u===un||n.convert(u)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)},textureTypeReadable:function(u){let p=u===Or&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(u!==Bn&&n.convert(u)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&u!==hn&&!p)},precision:a,logarithmicDepthBuffer:l,reverseDepthBuffer:c,maxTextures:h,maxVertexTextures:d,maxTextureSize:r.getParameter(r.MAX_TEXTURE_SIZE),maxCubemapSize:r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),maxAttributes:r.getParameter(r.MAX_VERTEX_ATTRIBS),maxVertexUniforms:r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),maxVaryings:r.getParameter(r.MAX_VARYING_VECTORS),maxFragmentUniforms:r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),vertexTextures:d>0,maxSamples:r.getParameter(r.MAX_SAMPLES)}}function rd(r){let e=this,t=null,n=0,i=!1,s=!1,a=new en,o=new ke,l={value:null,needsUpdate:!1};function c(h,d,u,p){let f=h!==null?h.length:0,y=null;if(f!==0){if(y=l.value,p!==!0||y===null){let m=u+4*f,g=d.matrixWorldInverse;o.getNormalMatrix(g),(y===null||y.length<m)&&(y=new Float32Array(m));for(let v=0,_=u;v!==f;++v,_+=4)a.copy(h[v]).applyMatrix4(g,o),a.normal.toArray(y,_),y[_+3]=a.constant}l.value=y,l.needsUpdate=!0}return e.numPlanes=f,e.numIntersection=0,y}this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let u=h.length!==0||d||n!==0||i;return i=d,n=h.length,u},this.beginShadows=function(){s=!0,c(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=c(h,d,0)},this.setState=function(h,d,u){let p=h.clippingPlanes,f=h.clipIntersection,y=h.clipShadows,m=r.get(h);if(!i||p===null||p.length===0||s&&!y)s?c(null):(function(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0})();else{let g=s?0:n,v=4*g,_=m.clippingState||null;l.value=_,_=c(p,d,v,u);for(let x=0;x!==v;++x)_[x]=t[x];m.clippingState=_,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=g}}}function sd(r){let e=new WeakMap;function t(i,s){return s===go?i.mapping=Di:s===vo&&(i.mapping=Ni),i}function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping;if(s===go||s===vo){if(e.has(i))return t(e.get(i).texture,i.mapping);{let a=i.image;if(a&&a.height>0){let o=new $o(a.height);return o.fromEquirectangularTexture(r,i),e.set(i,o),i.addEventListener("dispose",n),t(o.texture,i.mapping)}return null}}}return i},dispose:function(){e=new WeakMap}}}var Gi=class extends xr{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ic=[.125,.215,.35,.446,.526,.582],ar=20,Qa=new Gi,Lc=new Be,eo=null,to=0,no=0,io=!1,ni=(1+Math.sqrt(5))/2,Ai=1/ni,Uc=[new w(-ni,Ai,0),new w(ni,Ai,0),new w(-Ai,0,ni),new w(Ai,0,ni),new w(0,ni,-Ai),new w(0,ni,Ai),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],ks=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){eo=this._renderer.getRenderTarget(),to=this._renderer.getActiveCubeFace(),no=this._renderer.getActiveMipmapLevel(),io=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Oc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Nc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(eo,to,no),this._renderer.xr.enabled=io,e.scissorTest=!1,ds(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Di||e.mapping===Ni?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),eo=this._renderer.getRenderTarget(),to=this._renderer.getActiveCubeFace(),no=this._renderer.getActiveMipmapLevel(),io=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Sn,minFilter:Sn,generateMipmaps:!1,type:Or,format:un,colorSpace:Yi,depthBuffer:!1},i=Dc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=(function(a){let o=[],l=[],c=[],h=a,d=a-4+1+Ic.length;for(let u=0;u<d;u++){let p=Math.pow(2,h);l.push(p);let f=1/p;u>a-4?f=Ic[u-a+4-1]:u===0&&(f=0),c.push(f);let y=1/(p-2),m=-y,g=1+y,v=[m,m,g,m,g,g,m,m,g,g,m,g],_=6,x=6,T=3,A=2,I=1,N=new Float32Array(T*x*_),F=new Float32Array(A*x*_),H=new Float32Array(I*x*_);for(let V=0;V<_;V++){let q=V%3*2/3-1,W=V>2?0:-1,te=[q,W,0,q+2/3,W,0,q+2/3,W+1,0,q,W,0,q+2/3,W+1,0,q,W+1,0];N.set(te,T*x*V),F.set(v,A*x*V);let Q=[V,V,V,V,V,V];H.set(Q,I*x*V)}let j=new rt;j.setAttribute("position",new Mt(N,T)),j.setAttribute("uv",new Mt(F,A)),j.setAttribute("faceIndex",new Mt(H,I)),o.push(j),h>4&&h--}return{lodPlanes:o,sizeLods:l,sigmas:c}})(s)),this._blurMaterial=(function(a,o,l){let c=new Float32Array(ar),h=new w(0,1,0);return new mn({name:"SphericalGaussianBlur",defines:{n:ar,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/l,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:c},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:h}},vertexShader:Yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})})(s,e,t)}return i}_compileMaterial(e){let t=new Pt(this._lodPlanes[0],e);this._renderer.compile(t,Qa)}_sceneToCubeUV(e,t,n,i){let s=new Nt(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(Lc),l.toneMapping=0,l.autoClear=!1;let d=new zi({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),u=new Pt(new kn,d),p=!1,f=e.background;f?f.isColor&&(d.color.copy(f),e.background=null,p=!0):(d.color.copy(Lc),p=!0);for(let y=0;y<6;y++){let m=y%3;m===0?(s.up.set(0,a[y],0),s.lookAt(o[y],0,0)):m===1?(s.up.set(0,0,a[y]),s.lookAt(0,o[y],0)):(s.up.set(0,a[y],0),s.lookAt(0,0,o[y]));let g=this._cubeSize;ds(i,m*g,y>2?g:0,g,g),l.setRenderTarget(i),p&&l.render(u,s),l.render(e,s)}u.geometry.dispose(),u.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=f}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===Di||e.mapping===Ni;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Oc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Nc());let s=i?this._cubemapMaterial:this._equirectMaterial,a=new Pt(this._lodPlanes[0],s);s.uniforms.envMap.value=e;let o=this._cubeSize;ds(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(a,Qa)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let s=1;s<i;s++){let a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Uc[(i-s-1)%Uc.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=new Pt(this._lodPlanes[i],c),d=c.uniforms,u=this._sizeLods[n]-1,p=isFinite(s)?Math.PI/(2*u):2*Math.PI/39,f=s/p,y=isFinite(s)?1+Math.floor(3*f):ar;y>ar&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${y} samples when the maximum is set to 20`);let m=[],g=0;for(let x=0;x<ar;++x){let T=x/f,A=Math.exp(-T*T/2);m.push(A),x===0?g+=A:x<y&&(g+=2*A)}for(let x=0;x<m.length;x++)m[x]=m[x]/g;d.envMap.value=e.texture,d.samples.value=y,d.weights.value=m,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:v}=this;d.dTheta.value=p,d.mipInt.value=v-n;let _=this._sizeLods[i];ds(t,3*_*(i>v-4?i-v+4:0),4*(this._cubeSize-_),3*_,2*_),l.setRenderTarget(t),l.render(h,Qa)}};function Dc(r,e,t){let n=new En(r,e,t);return n.texture.mapping=ua,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ds(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function Nc(){return new mn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oc(){return new mn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Yl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ad(r){let e=new WeakMap,t=null;function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping,a=s===go||s===vo,o=s===Di||s===Ni;if(a||o){let l=e.get(i),c=l!==void 0?l.texture.pmremVersion:0;if(i.isRenderTargetTexture&&i.pmremVersion!==c)return t===null&&(t=new ks(r)),l=a?t.fromEquirectangular(i,l):t.fromCubemap(i,l),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),l.texture;if(l!==void 0)return l.texture;{let h=i.image;return a&&h&&h.height>0||o&&h&&(function(d){let u=0,p=6;for(let f=0;f<p;f++)d[f]!==void 0&&u++;return u===p})(h)?(t===null&&(t=new ks(r)),l=a?t.fromEquirectangular(i):t.fromCubemap(i),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),i.addEventListener("dispose",n),l.texture):null}}}return i},dispose:function(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}}}function od(r){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&dr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function ld(r,e,t,n){let i={},s=new WeakMap;function a(l){let c=l.target;c.index!==null&&e.remove(c.index);for(let d in c.attributes)e.remove(c.attributes[d]);for(let d in c.morphAttributes){let u=c.morphAttributes[d];for(let p=0,f=u.length;p<f;p++)e.remove(u[p])}c.removeEventListener("dispose",a),delete i[c.id];let h=s.get(c);h&&(e.remove(h),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function o(l){let c=[],h=l.index,d=l.attributes.position,u=0;if(h!==null){let y=h.array;u=h.version;for(let m=0,g=y.length;m<g;m+=3){let v=y[m+0],_=y[m+1],x=y[m+2];c.push(v,_,_,x,x,v)}}else{if(d===void 0)return;{let y=d.array;u=d.version;for(let m=0,g=y.length/3-1;m<g;m+=3){let v=m+0,_=m+1,x=m+2;c.push(v,_,_,x,x,v)}}}let p=new(Lh(c)?Bs:Fs)(c,1);p.version=u;let f=s.get(l);f&&e.remove(f),s.set(l,p)}return{get:function(l,c){return i[c.id]===!0||(c.addEventListener("dispose",a),i[c.id]=!0,t.memory.geometries++),c},update:function(l){let c=l.attributes;for(let d in c)e.update(c[d],r.ARRAY_BUFFER);let h=l.morphAttributes;for(let d in h){let u=h[d];for(let p=0,f=u.length;p<f;p++)e.update(u[p],r.ARRAY_BUFFER)}},getWireframeAttribute:function(l){let c=s.get(l);if(c){let h=l.index;h!==null&&c.version<h.version&&o(l)}else o(l);return s.get(l)}}}function cd(r,e,t){let n,i,s;function a(o,l,c){c!==0&&(r.drawElementsInstanced(n,l,i,o*s,c),t.update(l,n,c))}this.setMode=function(o){n=o},this.setIndex=function(o){i=o.type,s=o.bytesPerElement},this.render=function(o,l){r.drawElements(n,l,i,o*s),t.update(l,n,1)},this.renderInstances=a,this.renderMultiDraw=function(o,l,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,l,0,i,o,0,c);let h=0;for(let d=0;d<c;d++)h+=l[d];t.update(h,n,1)},this.renderMultiDrawInstances=function(o,l,c,h){if(c===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let u=0;u<o.length;u++)a(o[u]/s,l[u],h[u]);else{d.multiDrawElementsInstancedWEBGL(n,l,0,i,o,0,h,0,c);let u=0;for(let p=0;p<c;p++)u+=l[p]*h[p];t.update(u,n,1)}}}function hd(r){let e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,n,i){switch(e.calls++,n){case r.TRIANGLES:e.triangles+=i*(t/3);break;case r.LINES:e.lines+=i*(t/2);break;case r.LINE_STRIP:e.lines+=i*(t-1);break;case r.LINE_LOOP:e.lines+=i*t;break;case r.POINTS:e.points+=i*t;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",n)}}}}function ud(r,e,t){let n=new WeakMap,i=new $e;return{update:function(s,a,o){let l=s.morphTargetInfluences,c=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=c!==void 0?c.length:0,d=n.get(a);if(d===void 0||d.count!==h){let N=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",N)};d!==void 0&&d.texture.dispose();let u=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,f=a.morphAttributes.color!==void 0,y=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],g=a.morphAttributes.color||[],v=0;u===!0&&(v=1),p===!0&&(v=2),f===!0&&(v=3);let _=a.attributes.position.count*v,x=1;_>e.maxTextureSize&&(x=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);let T=new Float32Array(_*x*4*h),A=new Os(T,_,x,h);A.type=hn,A.needsUpdate=!0;let I=4*v;for(let F=0;F<h;F++){let H=y[F],j=m[F],V=g[F],q=_*x*4*F;for(let W=0;W<H.count;W++){let te=W*I;u===!0&&(i.fromBufferAttribute(H,W),T[q+te+0]=i.x,T[q+te+1]=i.y,T[q+te+2]=i.z,T[q+te+3]=0),p===!0&&(i.fromBufferAttribute(j,W),T[q+te+4]=i.x,T[q+te+5]=i.y,T[q+te+6]=i.z,T[q+te+7]=0),f===!0&&(i.fromBufferAttribute(V,W),T[q+te+8]=i.x,T[q+te+9]=i.y,T[q+te+10]=i.z,T[q+te+11]=V.itemSize===4?i.w:1)}}d={count:h,texture:A,size:new ce(_,x)},n.set(a,d),a.addEventListener("dispose",N)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)o.getUniforms().setValue(r,"morphTexture",s.morphTexture,t);else{let u=0;for(let f=0;f<l.length;f++)u+=l[f];let p=a.morphTargetsRelative?1:1-u;o.getUniforms().setValue(r,"morphTargetBaseInfluence",p),o.getUniforms().setValue(r,"morphTargetInfluences",l)}o.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),o.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}}}function dd(r,e,t,n){let i=new WeakMap;function s(a){let o=a.target;o.removeEventListener("dispose",s),t.remove(o.instanceMatrix),o.instanceColor!==null&&t.remove(o.instanceColor)}return{update:function(a){let o=n.render.frame,l=a.geometry,c=e.get(a,l);if(i.get(c)!==o&&(e.update(c),i.set(c,o)),a.isInstancedMesh&&(a.hasEventListener("dispose",s)===!1&&a.addEventListener("dispose",s),i.get(a)!==o&&(t.update(a.instanceMatrix,r.ARRAY_BUFFER),a.instanceColor!==null&&t.update(a.instanceColor,r.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let h=a.skeleton;i.get(h)!==o&&(h.update(),i.set(h,o))}return c},dispose:function(){i=new WeakMap}}}var Hs=class extends kt{constructor(e,t,n,i,s,a,o,l,c,h=1026){if(h!==_r&&h!==Fi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===_r&&(n=ai),n===void 0&&h===Fi&&(n=Oi),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:tn,this.minFilter=l!==void 0?l:tn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Oh=new kt,Fc=new Hs(1,1),Fh=new Os,Bh=new Jo,zh=new zs,Bc=[],zc=[],kc=new Float32Array(16),Hc=new Float32Array(9),Gc=new Float32Array(4);function Ji(r,e,t){let n=r[0];if(n<=0||n>0)return r;let i=e*t,s=Bc[i];if(s===void 0&&(s=new Float32Array(i),Bc[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function St(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function bt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function pa(r,e){let t=zc[e];t===void 0&&(t=new Int32Array(e),zc[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function pd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function md(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;r.uniform2fv(this.addr,e),bt(t,e)}}function fd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(St(t,e))return;r.uniform3fv(this.addr,e),bt(t,e)}}function gd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;r.uniform4fv(this.addr,e),bt(t,e)}}function vd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;Gc.set(n),r.uniformMatrix2fv(this.addr,!1,Gc),bt(t,n)}}function _d(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;Hc.set(n),r.uniformMatrix3fv(this.addr,!1,Hc),bt(t,n)}}function yd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;kc.set(n),r.uniformMatrix4fv(this.addr,!1,kc),bt(t,n)}}function xd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Md(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;r.uniform2iv(this.addr,e),bt(t,e)}}function Sd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;r.uniform3iv(this.addr,e),bt(t,e)}}function bd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;r.uniform4iv(this.addr,e),bt(t,e)}}function Ed(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function wd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;r.uniform2uiv(this.addr,e),bt(t,e)}}function Td(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;r.uniform3uiv(this.addr,e),bt(t,e)}}function Ad(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;r.uniform4uiv(this.addr,e),bt(t,e)}}function Rd(r,e,t){let n=this.cache,i=t.allocateTextureUnit(),s;n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),this.type===r.SAMPLER_2D_SHADOW?(Fc.compareFunction=515,s=Fc):s=Oh,t.setTexture2D(e||s,i)}function Cd(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Bh,i)}function Pd(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||zh,i)}function Id(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Fh,i)}function Ld(r,e){r.uniform1fv(this.addr,e)}function Ud(r,e){let t=Ji(e,this.size,2);r.uniform2fv(this.addr,t)}function Dd(r,e){let t=Ji(e,this.size,3);r.uniform3fv(this.addr,t)}function Nd(r,e){let t=Ji(e,this.size,4);r.uniform4fv(this.addr,t)}function Od(r,e){let t=Ji(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function Fd(r,e){let t=Ji(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Bd(r,e){let t=Ji(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function zd(r,e){r.uniform1iv(this.addr,e)}function kd(r,e){r.uniform2iv(this.addr,e)}function Hd(r,e){r.uniform3iv(this.addr,e)}function Gd(r,e){r.uniform4iv(this.addr,e)}function Vd(r,e){r.uniform1uiv(this.addr,e)}function Wd(r,e){r.uniform2uiv(this.addr,e)}function Xd(r,e){r.uniform3uiv(this.addr,e)}function jd(r,e){r.uniform4uiv(this.addr,e)}function qd(r,e,t){let n=this.cache,i=e.length,s=pa(t,i);St(n,s)||(r.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Oh,s[a])}function Yd(r,e,t){let n=this.cache,i=e.length,s=pa(t,i);St(n,s)||(r.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Bh,s[a])}function Zd(r,e,t){let n=this.cache,i=e.length,s=pa(t,i);St(n,s)||(r.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||zh,s[a])}function Jd(r,e,t){let n=this.cache,i=e.length,s=pa(t,i);St(n,s)||(r.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Fh,s[a])}var Qo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=(function(i){switch(i){case 5126:return pd;case 35664:return md;case 35665:return fd;case 35666:return gd;case 35674:return vd;case 35675:return _d;case 35676:return yd;case 5124:case 35670:return xd;case 35667:case 35671:return Md;case 35668:case 35672:return Sd;case 35669:case 35673:return bd;case 5125:return Ed;case 36294:return wd;case 36295:return Td;case 36296:return Ad;case 35678:case 36198:case 36298:case 36306:case 35682:return Rd;case 35679:case 36299:case 36307:return Cd;case 35680:case 36300:case 36308:case 36293:return Pd;case 36289:case 36303:case 36311:case 36292:return Id}})(t.type)}},el=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=(function(i){switch(i){case 5126:return Ld;case 35664:return Ud;case 35665:return Dd;case 35666:return Nd;case 35674:return Od;case 35675:return Fd;case 35676:return Bd;case 5124:case 35670:return zd;case 35667:case 35671:return kd;case 35668:case 35672:return Hd;case 35669:case 35673:return Gd;case 5125:return Vd;case 36294:return Wd;case 36295:return Xd;case 36296:return jd;case 35678:case 36198:case 36298:case 36306:case 35682:return qd;case 35679:case 36299:case 36307:return Yd;case 35680:case 36300:case 36308:case 36293:return Zd;case 36289:case 36303:case 36311:case 36292:return Jd}})(t.type)}},tl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,a=i.length;s!==a;++s){let o=i[s];o.setValue(e,t[o.id],n)}}},ro=/(\w+)(\])?(\[|\.)?/g;function Vc(r,e){r.seq.push(e),r.map[e.id]=e}function Kd(r,e,t){let n=r.name,i=n.length;for(ro.lastIndex=0;;){let s=ro.exec(n),a=ro.lastIndex,o=s[1],l=s[2]==="]",c=s[3];if(l&&(o|=0),c===void 0||c==="["&&a+2===i){Vc(t,c===void 0?new Qo(o,r,e):new el(o,r,e));break}{let h=t.map[o];h===void 0&&(h=new tl(o),Vc(t,h)),t=h}}}var Ui=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i);Kd(s,e.getUniformLocation(t,s.name),this)}}setValue(e,t,n,i){let s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function Wc(r,e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var $d=0,Xc=new ke;function jc(r,e,t){let n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+(function(o,l){let c=o.split(`
`),h=[],d=Math.max(l-6,0),u=Math.min(l+6,c.length);for(let p=d;p<u;p++){let f=p+1;h.push(`${f===l?">":" "} ${f}: ${c[p]}`)}return h.join(`
`)})(r.getShaderSource(e),a)}return i}function Qd(r,e){let t=(function(n){Ze._getMatrix(Xc,Ze.workingColorSpace,n);let i=`mat3( ${Xc.elements.map((s=>s.toFixed(4)))} )`;switch(Ze.getTransfer(n)){case da:return[i,"LinearTransferOETF"];case it:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[i,"LinearTransferOETF"]}})(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function ep(r,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ps=new w;function tp(){return Ze.getLuminanceCoefficients(ps),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${ps.x.toFixed(4)}, ${ps.y.toFixed(4)}, ${ps.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function or(r){return r!==""}function qc(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Yc(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var np=/^[ \t]*#include +<([\w\d./]+)>/gm;function nl(r){return r.replace(np,rp)}var ip=new Map;function rp(r,e){let t=We[e];if(t===void 0){let n=ip.get(e);if(n===void 0)throw new Error("Can not resolve #include <"+e+">");t=We[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n)}return nl(t)}var sp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Zc(r){return r.replace(sp,ap)}function ap(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Jc(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function op(r,e,t,n){let i=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=(function(j){let V="SHADOWMAP_TYPE_BASIC";return j.shadowMapType===1?V="SHADOWMAP_TYPE_PCF":j.shadowMapType===2?V="SHADOWMAP_TYPE_PCF_SOFT":j.shadowMapType===3&&(V="SHADOWMAP_TYPE_VSM"),V})(t),c=(function(j){let V="ENVMAP_TYPE_CUBE";if(j.envMap)switch(j.envMapMode){case Di:case Ni:V="ENVMAP_TYPE_CUBE";break;case ua:V="ENVMAP_TYPE_CUBE_UV"}return V})(t),h=(function(j){let V="ENVMAP_MODE_REFLECTION";return j.envMap&&j.envMapMode===Ni&&(V="ENVMAP_MODE_REFRACTION"),V})(t),d=(function(j){let V="ENVMAP_BLENDING_NONE";if(j.envMap)switch(j.combine){case 0:V="ENVMAP_BLENDING_MULTIPLY";break;case 1:V="ENVMAP_BLENDING_MIX";break;case 2:V="ENVMAP_BLENDING_ADD"}return V})(t),u=(function(j){let V=j.envMapCubeUVHeight;if(V===null)return null;let q=Math.log2(V)-2,W=1/V;return{texelWidth:1/(3*Math.max(Math.pow(2,q),112)),texelHeight:W,maxMip:q}})(t),p=(function(j){return[j.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",j.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(or).join(`
`)})(t),f=(function(j){let V=[];for(let q in j){let W=j[q];W!==!1&&V.push("#define "+q+" "+W)}return V.join(`
`)})(s),y=i.createProgram(),m,g,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(or).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(or).join(`
`),g.length>0&&(g+=`
`)):(m=[Jc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(or).join(`
`),g=[Jc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?We.tonemapping_pars_fragment:"",t.toneMapping!==0?ep("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,Qd("linearToOutputTexel",t.outputColorSpace),tp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(or).join(`
`)),a=nl(a),a=qc(a,t),a=Yc(a,t),o=nl(o),o=qc(o,t),o=Yc(o,t),a=Zc(a),o=Zc(o),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===hc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===hc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let _=v+m+a,x=v+g+o,T=Wc(i,i.VERTEX_SHADER,_),A=Wc(i,i.FRAGMENT_SHADER,x);function I(j){if(r.debug.checkShaderErrors){let V=i.getProgramInfoLog(y).trim(),q=i.getShaderInfoLog(T).trim(),W=i.getShaderInfoLog(A).trim(),te=!0,Q=!0;if(i.getProgramParameter(y,i.LINK_STATUS)===!1)if(te=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,y,T,A);else{let he=jc(i,T,"vertex"),oe=jc(i,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(y,i.VALIDATE_STATUS)+`

Material Name: `+j.name+`
Material Type: `+j.type+`

Program Info Log: `+V+`
`+he+`
`+oe)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):q!==""&&W!==""||(Q=!1);Q&&(j.diagnostics={runnable:te,programLog:V,vertexShader:{log:q,prefix:m},fragmentShader:{log:W,prefix:g}})}i.deleteShader(T),i.deleteShader(A),N=new Ui(i,y),F=(function(V,q){let W={},te=V.getProgramParameter(q,V.ACTIVE_ATTRIBUTES);for(let Q=0;Q<te;Q++){let he=V.getActiveAttrib(q,Q),oe=he.name,Ee=1;he.type===V.FLOAT_MAT2&&(Ee=2),he.type===V.FLOAT_MAT3&&(Ee=3),he.type===V.FLOAT_MAT4&&(Ee=4),W[oe]={type:he.type,location:V.getAttribLocation(q,oe),locationSize:Ee}}return W})(i,y)}let N,F;i.attachShader(y,T),i.attachShader(y,A),t.index0AttributeName!==void 0?i.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(y,0,"position"),i.linkProgram(y),this.getUniforms=function(){return N===void 0&&I(this),N},this.getAttributes=function(){return F===void 0&&I(this),F};let H=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return H===!1&&(H=i.getProgramParameter(y,37297)),H},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$d++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=A,this}var lp=0,il=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new rl(e),t.set(e,n)),n}},rl=class{constructor(e){this.id=lp++,this.code=e,this.usedTimes=0}};function cp(r,e,t,n,i,s,a){let o=new yr,l=new il,c=new Set,h=[],d=i.logarithmicDepthBuffer,u=i.vertexTextures,p=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(m){return c.add(m),m===0?"uv":`uv${m}`}return{getParameters:function(m,g,v,_,x){let T=_.fog,A=x.geometry,I=m.isMeshStandardMaterial?_.environment:null,N=(m.isMeshStandardMaterial?t:e).get(m.envMap||I),F=N&&N.mapping===ua?N.image.height:null,H=f[m.type];m.precision!==null&&(p=i.getMaxPrecision(m.precision),p!==m.precision&&console.warn("THREE.WebGLProgram.getParameters:",m.precision,"not supported, using",p,"instead."));let j=A.morphAttributes.position||A.morphAttributes.normal||A.morphAttributes.color,V=j!==void 0?j.length:0,q,W,te,Q,he=0;if(A.morphAttributes.position!==void 0&&(he=1),A.morphAttributes.normal!==void 0&&(he=2),A.morphAttributes.color!==void 0&&(he=3),H){let jn=cn[H];q=jn.vertexShader,W=jn.fragmentShader}else q=m.vertexShader,W=m.fragmentShader,l.update(m),te=l.getVertexShaderID(m),Q=l.getFragmentShaderID(m);let oe=r.getRenderTarget(),Ee=r.state.buffers.depth.getReversed(),we=x.isInstancedMesh===!0,Z=x.isBatchedMesh===!0,le=!!m.map,ye=!!m.matcap,ve=!!N,fe=!!m.aoMap,E=!!m.lightMap,b=!!m.bumpMap,D=!!m.normalMap,U=!!m.displacementMap,R=!!m.emissiveMap,L=!!m.metalnessMap,S=!!m.roughnessMap,P=m.anisotropy>0,z=m.clearcoat>0,ne=m.dispersion>0,O=m.iridescence>0,ee=m.sheen>0,$=m.transmission>0,ie=P&&!!m.anisotropyMap,_e=z&&!!m.clearcoatMap,ge=z&&!!m.clearcoatNormalMap,Te=z&&!!m.clearcoatRoughnessMap,Pe=O&&!!m.iridescenceMap,je=O&&!!m.iridescenceThicknessMap,He=ee&&!!m.sheenColorMap,Me=ee&&!!m.sheenRoughnessMap,Ge=!!m.specularMap,Je=!!m.specularColorMap,at=!!m.specularIntensityMap,xe=$&&!!m.transmissionMap,qe=$&&!!m.thicknessMap,Ke=!!m.gradientMap,An=!!m.alphaMap,di=m.alphaTest>0,Ot=!!m.alphaHash,Vt=!!m.extensions,on=0;m.toneMapped&&(oe!==null&&oe.isXRRenderTarget!==!0||(on=r.toneMapping));let k={shaderID:H,shaderType:m.type,shaderName:m.name,vertexShader:q,fragmentShader:W,defines:m.defines,customVertexShaderID:te,customFragmentShaderID:Q,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:p,batching:Z,batchingColor:Z&&x._colorsTexture!==null,instancing:we,instancingColor:we&&x.instanceColor!==null,instancingMorph:we&&x.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:oe===null?r.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:Yi,alphaToCoverage:!!m.alphaToCoverage,map:le,matcap:ye,envMap:ve,envMapMode:ve&&N.mapping,envMapCubeUVHeight:F,aoMap:fe,lightMap:E,bumpMap:b,normalMap:D,displacementMap:u&&U,emissiveMap:R,normalMapObjectSpace:D&&m.normalMapType===1,normalMapTangentSpace:D&&m.normalMapType===0,metalnessMap:L,roughnessMap:S,anisotropy:P,anisotropyMap:ie,clearcoat:z,clearcoatMap:_e,clearcoatNormalMap:ge,clearcoatRoughnessMap:Te,dispersion:ne,iridescence:O,iridescenceMap:Pe,iridescenceThicknessMap:je,sheen:ee,sheenColorMap:He,sheenRoughnessMap:Me,specularMap:Ge,specularColorMap:Je,specularIntensityMap:at,transmission:$,transmissionMap:xe,thicknessMap:qe,gradientMap:Ke,opaque:m.transparent===!1&&m.blending===1&&m.alphaToCoverage===!1,alphaMap:An,alphaTest:di,alphaHash:Ot,combine:m.combine,mapUv:le&&y(m.map.channel),aoMapUv:fe&&y(m.aoMap.channel),lightMapUv:E&&y(m.lightMap.channel),bumpMapUv:b&&y(m.bumpMap.channel),normalMapUv:D&&y(m.normalMap.channel),displacementMapUv:U&&y(m.displacementMap.channel),emissiveMapUv:R&&y(m.emissiveMap.channel),metalnessMapUv:L&&y(m.metalnessMap.channel),roughnessMapUv:S&&y(m.roughnessMap.channel),anisotropyMapUv:ie&&y(m.anisotropyMap.channel),clearcoatMapUv:_e&&y(m.clearcoatMap.channel),clearcoatNormalMapUv:ge&&y(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&y(m.clearcoatRoughnessMap.channel),iridescenceMapUv:Pe&&y(m.iridescenceMap.channel),iridescenceThicknessMapUv:je&&y(m.iridescenceThicknessMap.channel),sheenColorMapUv:He&&y(m.sheenColorMap.channel),sheenRoughnessMapUv:Me&&y(m.sheenRoughnessMap.channel),specularMapUv:Ge&&y(m.specularMap.channel),specularColorMapUv:Je&&y(m.specularColorMap.channel),specularIntensityMapUv:at&&y(m.specularIntensityMap.channel),transmissionMapUv:xe&&y(m.transmissionMap.channel),thicknessMapUv:qe&&y(m.thicknessMap.channel),alphaMapUv:An&&y(m.alphaMap.channel),vertexTangents:!!A.attributes.tangent&&(D||P),vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!A.attributes.color&&A.attributes.color.itemSize===4,pointsUvs:x.isPoints===!0&&!!A.attributes.uv&&(le||An),fog:!!T,useFog:m.fog===!0,fogExp2:!!T&&T.isFogExp2,flatShading:m.flatShading===!0,sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Ee,skinning:x.isSkinnedMesh===!0,morphTargets:A.morphAttributes.position!==void 0,morphNormals:A.morphAttributes.normal!==void 0,morphColors:A.morphAttributes.color!==void 0,morphTargetsCount:V,morphTextureStride:he,numDirLights:g.directional.length,numPointLights:g.point.length,numSpotLights:g.spot.length,numSpotLightMaps:g.spotLightMap.length,numRectAreaLights:g.rectArea.length,numHemiLights:g.hemi.length,numDirLightShadows:g.directionalShadowMap.length,numPointLightShadows:g.pointShadowMap.length,numSpotLightShadows:g.spotShadowMap.length,numSpotLightShadowsWithMaps:g.numSpotLightShadowsWithMaps,numLightProbes:g.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:m.dithering,shadowMapEnabled:r.shadowMap.enabled&&v.length>0,shadowMapType:r.shadowMap.type,toneMapping:on,decodeVideoTexture:le&&m.map.isVideoTexture===!0&&Ze.getTransfer(m.map.colorSpace)===it,decodeVideoTextureEmissive:R&&m.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(m.emissiveMap.colorSpace)===it,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===2,flipSided:m.side===1,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:Vt&&m.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Vt&&m.extensions.multiDraw===!0||Z)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};return k.vertexUv1s=c.has(1),k.vertexUv2s=c.has(2),k.vertexUv3s=c.has(3),c.clear(),k},getProgramCacheKey:function(m){let g=[];if(m.shaderID?g.push(m.shaderID):(g.push(m.customVertexShaderID),g.push(m.customFragmentShaderID)),m.defines!==void 0)for(let v in m.defines)g.push(v),g.push(m.defines[v]);return m.isRawShaderMaterial===!1&&((function(v,_){v.push(_.precision),v.push(_.outputColorSpace),v.push(_.envMapMode),v.push(_.envMapCubeUVHeight),v.push(_.mapUv),v.push(_.alphaMapUv),v.push(_.lightMapUv),v.push(_.aoMapUv),v.push(_.bumpMapUv),v.push(_.normalMapUv),v.push(_.displacementMapUv),v.push(_.emissiveMapUv),v.push(_.metalnessMapUv),v.push(_.roughnessMapUv),v.push(_.anisotropyMapUv),v.push(_.clearcoatMapUv),v.push(_.clearcoatNormalMapUv),v.push(_.clearcoatRoughnessMapUv),v.push(_.iridescenceMapUv),v.push(_.iridescenceThicknessMapUv),v.push(_.sheenColorMapUv),v.push(_.sheenRoughnessMapUv),v.push(_.specularMapUv),v.push(_.specularColorMapUv),v.push(_.specularIntensityMapUv),v.push(_.transmissionMapUv),v.push(_.thicknessMapUv),v.push(_.combine),v.push(_.fogExp2),v.push(_.sizeAttenuation),v.push(_.morphTargetsCount),v.push(_.morphAttributeCount),v.push(_.numDirLights),v.push(_.numPointLights),v.push(_.numSpotLights),v.push(_.numSpotLightMaps),v.push(_.numHemiLights),v.push(_.numRectAreaLights),v.push(_.numDirLightShadows),v.push(_.numPointLightShadows),v.push(_.numSpotLightShadows),v.push(_.numSpotLightShadowsWithMaps),v.push(_.numLightProbes),v.push(_.shadowMapType),v.push(_.toneMapping),v.push(_.numClippingPlanes),v.push(_.numClipIntersection),v.push(_.depthPacking)})(g,m),(function(v,_){o.disableAll(),_.supportsVertexTextures&&o.enable(0),_.instancing&&o.enable(1),_.instancingColor&&o.enable(2),_.instancingMorph&&o.enable(3),_.matcap&&o.enable(4),_.envMap&&o.enable(5),_.normalMapObjectSpace&&o.enable(6),_.normalMapTangentSpace&&o.enable(7),_.clearcoat&&o.enable(8),_.iridescence&&o.enable(9),_.alphaTest&&o.enable(10),_.vertexColors&&o.enable(11),_.vertexAlphas&&o.enable(12),_.vertexUv1s&&o.enable(13),_.vertexUv2s&&o.enable(14),_.vertexUv3s&&o.enable(15),_.vertexTangents&&o.enable(16),_.anisotropy&&o.enable(17),_.alphaHash&&o.enable(18),_.batching&&o.enable(19),_.dispersion&&o.enable(20),_.batchingColor&&o.enable(21),v.push(o.mask),o.disableAll(),_.fog&&o.enable(0),_.useFog&&o.enable(1),_.flatShading&&o.enable(2),_.logarithmicDepthBuffer&&o.enable(3),_.reverseDepthBuffer&&o.enable(4),_.skinning&&o.enable(5),_.morphTargets&&o.enable(6),_.morphNormals&&o.enable(7),_.morphColors&&o.enable(8),_.premultipliedAlpha&&o.enable(9),_.shadowMapEnabled&&o.enable(10),_.doubleSided&&o.enable(11),_.flipSided&&o.enable(12),_.useDepthPacking&&o.enable(13),_.dithering&&o.enable(14),_.transmission&&o.enable(15),_.sheen&&o.enable(16),_.opaque&&o.enable(17),_.pointsUvs&&o.enable(18),_.decodeVideoTexture&&o.enable(19),_.decodeVideoTextureEmissive&&o.enable(20),_.alphaToCoverage&&o.enable(21),v.push(o.mask)})(g,m),g.push(r.outputColorSpace)),g.push(m.customProgramCacheKey),g.join()},getUniforms:function(m){let g=f[m.type],v;if(g){let _=cn[g];v=Zu.clone(_.uniforms)}else v=m.uniforms;return v},acquireProgram:function(m,g){let v;for(let _=0,x=h.length;_<x;_++){let T=h[_];if(T.cacheKey===g){v=T,++v.usedTimes;break}}return v===void 0&&(v=new op(r,g,m,s),h.push(v)),v},releaseProgram:function(m){if(--m.usedTimes==0){let g=h.indexOf(m);h[g]=h[h.length-1],h.pop(),m.destroy()}},releaseShaderCache:function(m){l.remove(m)},programs:h,dispose:function(){l.dispose()}}}function hp(){let r=new WeakMap;return{has:function(e){return r.has(e)},get:function(e){let t=r.get(e);return t===void 0&&(t={},r.set(e,t)),t},remove:function(e){r.delete(e)},update:function(e,t,n){r.get(e)[t]=n},dispose:function(){r=new WeakMap}}}function up(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function Kc(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function $c(){let r=[],e=0,t=[],n=[],i=[];function s(a,o,l,c,h,d){let u=r[e];return u===void 0?(u={id:a.id,object:a,geometry:o,material:l,groupOrder:c,renderOrder:a.renderOrder,z:h,group:d},r[e]=u):(u.id=a.id,u.object=a,u.geometry=o,u.material=l,u.groupOrder=c,u.renderOrder=a.renderOrder,u.z=h,u.group=d),e++,u}return{opaque:t,transmissive:n,transparent:i,init:function(){e=0,t.length=0,n.length=0,i.length=0},push:function(a,o,l,c,h,d){let u=s(a,o,l,c,h,d);l.transmission>0?n.push(u):l.transparent===!0?i.push(u):t.push(u)},unshift:function(a,o,l,c,h,d){let u=s(a,o,l,c,h,d);l.transmission>0?n.unshift(u):l.transparent===!0?i.unshift(u):t.unshift(u)},finish:function(){for(let a=e,o=r.length;a<o;a++){let l=r[a];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(a,o){t.length>1&&t.sort(a||up),n.length>1&&n.sort(o||Kc),i.length>1&&i.sort(o||Kc)}}}function dp(){let r=new WeakMap;return{get:function(e,t){let n=r.get(e),i;return n===void 0?(i=new $c,r.set(e,[i])):t>=n.length?(i=new $c,n.push(i)):i=n[t],i},dispose:function(){r=new WeakMap}}}function pp(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new Be};break;case"SpotLight":t={position:new w,direction:new w,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new w,halfWidth:new w,halfHeight:new w}}return r[e.id]=t,t}}}var mp=0;function fp(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function gp(r){let e=new pp,t=(function(){let o={};return{get:function(l){if(o[l.id]!==void 0)return o[l.id];let c;switch(l.type){case"DirectionalLight":case"SpotLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3}}return o[l.id]=c,c}}})(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)n.probe.push(new w);let i=new w,s=new Xe,a=new Xe;return{setup:function(o){let l=0,c=0,h=0;for(let I=0;I<9;I++)n.probe[I].set(0,0,0);let d=0,u=0,p=0,f=0,y=0,m=0,g=0,v=0,_=0,x=0,T=0;o.sort(fp);for(let I=0,N=o.length;I<N;I++){let F=o[I],H=F.color,j=F.intensity,V=F.distance,q=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)l+=H.r*j,c+=H.g*j,h+=H.b*j;else if(F.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(F.sh.coefficients[W],j);T++}else if(F.isDirectionalLight){let W=e.get(F);if(W.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){let te=F.shadow,Q=t.get(F);Q.shadowIntensity=te.intensity,Q.shadowBias=te.bias,Q.shadowNormalBias=te.normalBias,Q.shadowRadius=te.radius,Q.shadowMapSize=te.mapSize,n.directionalShadow[d]=Q,n.directionalShadowMap[d]=q,n.directionalShadowMatrix[d]=F.shadow.matrix,m++}n.directional[d]=W,d++}else if(F.isSpotLight){let W=e.get(F);W.position.setFromMatrixPosition(F.matrixWorld),W.color.copy(H).multiplyScalar(j),W.distance=V,W.coneCos=Math.cos(F.angle),W.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),W.decay=F.decay,n.spot[p]=W;let te=F.shadow;if(F.map&&(n.spotLightMap[_]=F.map,_++,te.updateMatrices(F),F.castShadow&&x++),n.spotLightMatrix[p]=te.matrix,F.castShadow){let Q=t.get(F);Q.shadowIntensity=te.intensity,Q.shadowBias=te.bias,Q.shadowNormalBias=te.normalBias,Q.shadowRadius=te.radius,Q.shadowMapSize=te.mapSize,n.spotShadow[p]=Q,n.spotShadowMap[p]=q,v++}p++}else if(F.isRectAreaLight){let W=e.get(F);W.color.copy(H).multiplyScalar(j),W.halfWidth.set(.5*F.width,0,0),W.halfHeight.set(0,.5*F.height,0),n.rectArea[f]=W,f++}else if(F.isPointLight){let W=e.get(F);if(W.color.copy(F.color).multiplyScalar(F.intensity),W.distance=F.distance,W.decay=F.decay,F.castShadow){let te=F.shadow,Q=t.get(F);Q.shadowIntensity=te.intensity,Q.shadowBias=te.bias,Q.shadowNormalBias=te.normalBias,Q.shadowRadius=te.radius,Q.shadowMapSize=te.mapSize,Q.shadowCameraNear=te.camera.near,Q.shadowCameraFar=te.camera.far,n.pointShadow[u]=Q,n.pointShadowMap[u]=q,n.pointShadowMatrix[u]=F.shadow.matrix,g++}n.point[u]=W,u++}else if(F.isHemisphereLight){let W=e.get(F);W.skyColor.copy(F.color).multiplyScalar(j),W.groundColor.copy(F.groundColor).multiplyScalar(j),n.hemi[y]=W,y++}}f>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=l,n.ambient[1]=c,n.ambient[2]=h;let A=n.hash;A.directionalLength===d&&A.pointLength===u&&A.spotLength===p&&A.rectAreaLength===f&&A.hemiLength===y&&A.numDirectionalShadows===m&&A.numPointShadows===g&&A.numSpotShadows===v&&A.numSpotMaps===_&&A.numLightProbes===T||(n.directional.length=d,n.spot.length=p,n.rectArea.length=f,n.point.length=u,n.hemi.length=y,n.directionalShadow.length=m,n.directionalShadowMap.length=m,n.pointShadow.length=g,n.pointShadowMap.length=g,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=m,n.pointShadowMatrix.length=g,n.spotLightMatrix.length=v+_-x,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=x,n.numLightProbes=T,A.directionalLength=d,A.pointLength=u,A.spotLength=p,A.rectAreaLength=f,A.hemiLength=y,A.numDirectionalShadows=m,A.numPointShadows=g,A.numSpotShadows=v,A.numSpotMaps=_,A.numLightProbes=T,n.version=mp++)},setupView:function(o,l){let c=0,h=0,d=0,u=0,p=0,f=l.matrixWorldInverse;for(let y=0,m=o.length;y<m;y++){let g=o[y];if(g.isDirectionalLight){let v=n.directional[c];v.direction.setFromMatrixPosition(g.matrixWorld),i.setFromMatrixPosition(g.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(f),c++}else if(g.isSpotLight){let v=n.spot[d];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),v.direction.setFromMatrixPosition(g.matrixWorld),i.setFromMatrixPosition(g.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(f),d++}else if(g.isRectAreaLight){let v=n.rectArea[u];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),a.identity(),s.copy(g.matrixWorld),s.premultiply(f),a.extractRotation(s),v.halfWidth.set(.5*g.width,0,0),v.halfHeight.set(0,.5*g.height,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),u++}else if(g.isPointLight){let v=n.point[h];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),h++}else if(g.isHemisphereLight){let v=n.hemi[p];v.direction.setFromMatrixPosition(g.matrixWorld),v.direction.transformDirection(f),p++}}},state:n}}function Qc(r){let e=new gp(r),t=[],n=[],i={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:function(s){i.camera=s,t.length=0,n.length=0},state:i,setupLights:function(){e.setup(t)},setupLightsView:function(s){e.setupView(t,s)},pushLight:function(s){t.push(s)},pushShadow:function(s){n.push(s)}}}function vp(r){let e=new WeakMap;return{get:function(t,n=0){let i=e.get(t),s;return i===void 0?(s=new Qc(r),e.set(t,[s])):n>=i.length?(s=new Qc(r),i.push(s)):s=i[n],s},dispose:function(){e=new WeakMap}}}var sl=class extends wn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},al=class extends wn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function _p(r,e,t){let n=new Hi,i=new ce,s=new ce,a=new $e,o=new sl({depthPacking:3201}),l=new al,c={},h=t.maxTextureSize,d={[tu]:1,[nu]:0,[ca]:2},u=new mn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let f=new rt;f.setAttribute("position",new Mt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Pt(f,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let g=this.type;function v(A,I){let N=e.update(y);u.defines.VSM_SAMPLES!==A.blurSamples&&(u.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new En(i.x,i.y)),u.uniforms.shadow_pass.value=A.map.texture,u.uniforms.resolution.value=A.mapSize,u.uniforms.radius.value=A.radius,r.setRenderTarget(A.mapPass),r.clear(),r.renderBufferDirect(I,null,N,u,y,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,r.setRenderTarget(A.map),r.clear(),r.renderBufferDirect(I,null,N,p,y,null)}function _(A,I,N,F){let H=null,j=N.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(j!==void 0)H=j;else if(H=N.isPointLight===!0?l:o,r.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){let V=H.uuid,q=I.uuid,W=c[V];W===void 0&&(W={},c[V]=W);let te=W[q];te===void 0&&(te=H.clone(),W[q]=te,I.addEventListener("dispose",T)),H=te}return H.visible=I.visible,H.wireframe=I.wireframe,H.side=F===3?I.shadowSide!==null?I.shadowSide:I.side:I.shadowSide!==null?I.shadowSide:d[I.side],H.alphaMap=I.alphaMap,H.alphaTest=I.alphaTest,H.map=I.map,H.clipShadows=I.clipShadows,H.clippingPlanes=I.clippingPlanes,H.clipIntersection=I.clipIntersection,H.displacementMap=I.displacementMap,H.displacementScale=I.displacementScale,H.displacementBias=I.displacementBias,H.wireframeLinewidth=I.wireframeLinewidth,H.linewidth=I.linewidth,N.isPointLight===!0&&H.isMeshDistanceMaterial===!0&&(r.properties.get(H).light=N),H}function x(A,I,N,F,H){if(A.visible===!1)return;if(A.layers.test(I.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&H===3)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,A.matrixWorld);let V=e.update(A),q=A.material;if(Array.isArray(q)){let W=V.groups;for(let te=0,Q=W.length;te<Q;te++){let he=W[te],oe=q[he.materialIndex];if(oe&&oe.visible){let Ee=_(A,oe,F,H);A.onBeforeShadow(r,A,I,N,V,Ee,he),r.renderBufferDirect(N,null,V,Ee,A,he),A.onAfterShadow(r,A,I,N,V,Ee,he)}}}else if(q.visible){let W=_(A,q,F,H);A.onBeforeShadow(r,A,I,N,V,W,null),r.renderBufferDirect(N,null,V,W,A,null),A.onAfterShadow(r,A,I,N,V,W,null)}}let j=A.children;for(let V=0,q=j.length;V<q;V++)x(j[V],I,N,F,H)}function T(A){A.target.removeEventListener("dispose",T);for(let I in c){let N=c[I],F=A.target.uuid;F in N&&(N[F].dispose(),delete N[F])}}this.render=function(A,I,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let F=r.getRenderTarget(),H=r.getActiveCubeFace(),j=r.getActiveMipmapLevel(),V=r.state;V.setBlending(0),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let q=g!==3&&this.type===3,W=g===3&&this.type!==3;for(let te=0,Q=A.length;te<Q;te++){let he=A[te],oe=he.shadow;if(oe===void 0){console.warn("THREE.WebGLShadowMap:",he,"has no shadow.");continue}if(oe.autoUpdate===!1&&oe.needsUpdate===!1)continue;i.copy(oe.mapSize);let Ee=oe.getFrameExtents();if(i.multiply(Ee),s.copy(oe.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/Ee.x),i.x=s.x*Ee.x,oe.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/Ee.y),i.y=s.y*Ee.y,oe.mapSize.y=s.y)),oe.map===null||q===!0||W===!0){let Z=this.type!==3?{minFilter:tn,magFilter:tn}:{};oe.map!==null&&oe.map.dispose(),oe.map=new En(i.x,i.y,Z),oe.map.texture.name=he.name+".shadowMap",oe.camera.updateProjectionMatrix()}r.setRenderTarget(oe.map),r.clear();let we=oe.getViewportCount();for(let Z=0;Z<we;Z++){let le=oe.getViewport(Z);a.set(s.x*le.x,s.y*le.y,s.x*le.z,s.y*le.w),V.viewport(a),oe.updateMatrices(he,Z),n=oe.getFrustum(),x(I,N,oe.camera,he,this.type)}oe.isPointLightShadow!==!0&&this.type===3&&v(oe,N),oe.needsUpdate=!1}g=this.type,m.needsUpdate=!1,r.setRenderTarget(F,H,j)}}var yp={[_u]:1,[xu]:6,[Su]:7,[Mu]:5,[yu]:0,[Eu]:2,[wu]:4,[bu]:3};function xp(r,e){let t=new function(){let S=!1,P=new $e,z=null,ne=new $e(0,0,0,0);return{setMask:function(O){z===O||S||(r.colorMask(O,O,O,O),z=O)},setLocked:function(O){S=O},setClear:function(O,ee,$,ie,_e){_e===!0&&(O*=ie,ee*=ie,$*=ie),P.set(O,ee,$,ie),ne.equals(P)===!1&&(r.clearColor(O,ee,$,ie),ne.copy(P))},reset:function(){S=!1,z=null,ne.set(-1,0,0,0)}}},n=new function(){let S=!1,P=!1,z=null,ne=null,O=null;return{setReversed:function(ee){if(P!==ee){let $=e.get("EXT_clip_control");P?$.clipControlEXT($.LOWER_LEFT_EXT,$.ZERO_TO_ONE_EXT):$.clipControlEXT($.LOWER_LEFT_EXT,$.NEGATIVE_ONE_TO_ONE_EXT);let ie=O;O=null,this.setClear(ie)}P=ee},getReversed:function(){return P},setTest:function(ee){ee?ve(r.DEPTH_TEST):fe(r.DEPTH_TEST)},setMask:function(ee){z===ee||S||(r.depthMask(ee),z=ee)},setFunc:function(ee){if(P&&(ee=yp[ee]),ne!==ee){switch(ee){case 0:r.depthFunc(r.NEVER);break;case 1:r.depthFunc(r.ALWAYS);break;case 2:r.depthFunc(r.LESS);break;case 3:default:r.depthFunc(r.LEQUAL);break;case 4:r.depthFunc(r.EQUAL);break;case 5:r.depthFunc(r.GEQUAL);break;case 6:r.depthFunc(r.GREATER);break;case 7:r.depthFunc(r.NOTEQUAL)}ne=ee}},setLocked:function(ee){S=ee},setClear:function(ee){O!==ee&&(P&&(ee=1-ee),r.clearDepth(ee),O=ee)},reset:function(){S=!1,z=null,ne=null,O=null,P=!1}}},i=new function(){let S=!1,P=null,z=null,ne=null,O=null,ee=null,$=null,ie=null,_e=null;return{setTest:function(ge){S||(ge?ve(r.STENCIL_TEST):fe(r.STENCIL_TEST))},setMask:function(ge){P===ge||S||(r.stencilMask(ge),P=ge)},setFunc:function(ge,Te,Pe){z===ge&&ne===Te&&O===Pe||(r.stencilFunc(ge,Te,Pe),z=ge,ne=Te,O=Pe)},setOp:function(ge,Te,Pe){ee===ge&&$===Te&&ie===Pe||(r.stencilOp(ge,Te,Pe),ee=ge,$=Te,ie=Pe)},setLocked:function(ge){S=ge},setClear:function(ge){_e!==ge&&(r.clearStencil(ge),_e=ge)},reset:function(){S=!1,P=null,z=null,ne=null,O=null,ee=null,$=null,ie=null,_e=null}}},s=new WeakMap,a=new WeakMap,o={},l={},c=new WeakMap,h=[],d=null,u=!1,p=null,f=null,y=null,m=null,g=null,v=null,_=null,x=new Be(0,0,0),T=0,A=!1,I=null,N=null,F=null,H=null,j=null,V=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,W=0,te=r.getParameter(r.VERSION);te.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(te)[1]),q=W>=1):te.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),q=W>=2);let Q=null,he={},oe=r.getParameter(r.SCISSOR_BOX),Ee=r.getParameter(r.VIEWPORT),we=new $e().fromArray(oe),Z=new $e().fromArray(Ee);function le(S,P,z,ne){let O=new Uint8Array(4),ee=r.createTexture();r.bindTexture(S,ee),r.texParameteri(S,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(S,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let $=0;$<z;$++)S===r.TEXTURE_3D||S===r.TEXTURE_2D_ARRAY?r.texImage3D(P,0,r.RGBA,1,1,ne,0,r.RGBA,r.UNSIGNED_BYTE,O):r.texImage2D(P+$,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,O);return ee}let ye={};function ve(S){o[S]!==!0&&(r.enable(S),o[S]=!0)}function fe(S){o[S]!==!1&&(r.disable(S),o[S]=!1)}ye[r.TEXTURE_2D]=le(r.TEXTURE_2D,r.TEXTURE_2D,1),ye[r.TEXTURE_CUBE_MAP]=le(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),ye[r.TEXTURE_2D_ARRAY]=le(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),ye[r.TEXTURE_3D]=le(r.TEXTURE_3D,r.TEXTURE_3D,1,1),t.setClear(0,0,0,1),n.setClear(1),i.setClear(0),ve(r.DEPTH_TEST),n.setFunc(3),U(!1),R(1),ve(r.CULL_FACE),D(0);let E={[ii]:r.FUNC_ADD,[iu]:r.FUNC_SUBTRACT,[ru]:r.FUNC_REVERSE_SUBTRACT};E[103]=r.MIN,E[104]=r.MAX;let b={[su]:r.ZERO,[au]:r.ONE,[ou]:r.SRC_COLOR,[mo]:r.SRC_ALPHA,[pu]:r.SRC_ALPHA_SATURATE,[uu]:r.DST_COLOR,[cu]:r.DST_ALPHA,[lu]:r.ONE_MINUS_SRC_COLOR,[fo]:r.ONE_MINUS_SRC_ALPHA,[du]:r.ONE_MINUS_DST_COLOR,[hu]:r.ONE_MINUS_DST_ALPHA,[mu]:r.CONSTANT_COLOR,[fu]:r.ONE_MINUS_CONSTANT_COLOR,[gu]:r.CONSTANT_ALPHA,[vu]:r.ONE_MINUS_CONSTANT_ALPHA};function D(S,P,z,ne,O,ee,$,ie,_e,ge){if(S!==0){if(u===!1&&(ve(r.BLEND),u=!0),S===5)O=O||P,ee=ee||z,$=$||ne,P===f&&O===g||(r.blendEquationSeparate(E[P],E[O]),f=P,g=O),z===y&&ne===m&&ee===v&&$===_||(r.blendFuncSeparate(b[z],b[ne],b[ee],b[$]),y=z,m=ne,v=ee,_=$),ie.equals(x)!==!1&&_e===T||(r.blendColor(ie.r,ie.g,ie.b,_e),x.copy(ie),T=_e),p=S,A=!1;else if(S!==p||ge!==A){if(f===ii&&g===ii||(r.blendEquation(r.FUNC_ADD),f=ii,g=ii),ge)switch(S){case 1:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.ONE,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",S)}else switch(S){case 1:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",S)}y=null,m=null,v=null,_=null,x.set(0,0,0),T=0,p=S,A=ge}}else u===!0&&(fe(r.BLEND),u=!1)}function U(S){I!==S&&(S?r.frontFace(r.CW):r.frontFace(r.CCW),I=S)}function R(S){S!==0?(ve(r.CULL_FACE),S!==N&&(S===1?r.cullFace(r.BACK):S===2?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):fe(r.CULL_FACE),N=S}function L(S,P,z){S?(ve(r.POLYGON_OFFSET_FILL),H===P&&j===z||(r.polygonOffset(P,z),H=P,j=z)):fe(r.POLYGON_OFFSET_FILL)}return{buffers:{color:t,depth:n,stencil:i},enable:ve,disable:fe,bindFramebuffer:function(S,P){return l[S]!==P&&(r.bindFramebuffer(S,P),l[S]=P,S===r.DRAW_FRAMEBUFFER&&(l[r.FRAMEBUFFER]=P),S===r.FRAMEBUFFER&&(l[r.DRAW_FRAMEBUFFER]=P),!0)},drawBuffers:function(S,P){let z=h,ne=!1;if(S){z=c.get(P),z===void 0&&(z=[],c.set(P,z));let O=S.textures;if(z.length!==O.length||z[0]!==r.COLOR_ATTACHMENT0){for(let ee=0,$=O.length;ee<$;ee++)z[ee]=r.COLOR_ATTACHMENT0+ee;z.length=O.length,ne=!0}}else z[0]!==r.BACK&&(z[0]=r.BACK,ne=!0);ne&&r.drawBuffers(z)},useProgram:function(S){return d!==S&&(r.useProgram(S),d=S,!0)},setBlending:D,setMaterial:function(S,P){S.side===2?fe(r.CULL_FACE):ve(r.CULL_FACE);let z=S.side===1;P&&(z=!z),U(z),S.blending===1&&S.transparent===!1?D(0):D(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),n.setFunc(S.depthFunc),n.setTest(S.depthTest),n.setMask(S.depthWrite),t.setMask(S.colorWrite);let ne=S.stencilWrite;i.setTest(ne),ne&&(i.setMask(S.stencilWriteMask),i.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),i.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass)),L(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?ve(r.SAMPLE_ALPHA_TO_COVERAGE):fe(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:U,setCullFace:R,setLineWidth:function(S){S!==F&&(q&&r.lineWidth(S),F=S)},setPolygonOffset:L,setScissorTest:function(S){S?ve(r.SCISSOR_TEST):fe(r.SCISSOR_TEST)},activeTexture:function(S){S===void 0&&(S=r.TEXTURE0+V-1),Q!==S&&(r.activeTexture(S),Q=S)},bindTexture:function(S,P,z){z===void 0&&(z=Q===null?r.TEXTURE0+V-1:Q);let ne=he[z];ne===void 0&&(ne={type:void 0,texture:void 0},he[z]=ne),ne.type===S&&ne.texture===P||(Q!==z&&(r.activeTexture(z),Q=z),r.bindTexture(S,P||ye[S]),ne.type=S,ne.texture=P)},unbindTexture:function(){let S=he[Q];S!==void 0&&S.type!==void 0&&(r.bindTexture(S.type,null),S.type=void 0,S.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},compressedTexImage3D:function(){try{r.compressedTexImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},texImage2D:function(){try{r.texImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},texImage3D:function(){try{r.texImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},updateUBOMapping:function(S,P){let z=a.get(P);z===void 0&&(z=new WeakMap,a.set(P,z));let ne=z.get(S);ne===void 0&&(ne=r.getUniformBlockIndex(P,S.name),z.set(S,ne))},uniformBlockBinding:function(S,P){let z=a.get(P).get(S);s.get(P)!==z&&(r.uniformBlockBinding(P,z,S.__bindingPointIndex),s.set(P,z))},texStorage2D:function(){try{r.texStorage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},texStorage3D:function(){try{r.texStorage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},texSubImage2D:function(){try{r.texSubImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},texSubImage3D:function(){try{r.texSubImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}},scissor:function(S){we.equals(S)===!1&&(r.scissor(S.x,S.y,S.z,S.w),we.copy(S))},viewport:function(S){Z.equals(S)===!1&&(r.viewport(S.x,S.y,S.z,S.w),Z.copy(S))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),n.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),o={},Q=null,he={},l={},c=new WeakMap,h=[],d=null,u=!1,p=null,f=null,y=null,m=null,g=null,v=null,_=null,x=new Be(0,0,0),T=0,A=!1,I=null,N=null,F=null,H=null,j=null,we.set(0,0,r.canvas.width,r.canvas.height),Z.set(0,0,r.canvas.width,r.canvas.height),t.reset(),n.reset(),i.reset()}}}function eh(r,e,t,n){let i=(function(s){switch(s){case Bn:case bh:return{byteLength:1,components:1};case vr:case Eh:case Or:return{byteLength:2,components:1};case Gl:case Vl:return{byteLength:2,components:4};case ai:case Hl:case hn:return{byteLength:4,components:1};case wh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)})(n);switch(t){case Th:case Rh:return r*e;case Ch:return r*e*2;case Wl:case Xl:return r*e/i.components*i.byteLength;case Ph:case jl:return r*e*2/i.components*i.byteLength;case Ah:return r*e*3/i.components*i.byteLength;case un:case ql:return r*e*4/i.components*i.byteLength;case Ts:case As:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Rs:case Cs:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Mo:case bo:return Math.max(r,16)*Math.max(e,8)/4;case xo:case So:return Math.max(r,8)*Math.max(e,8)/2;case Eo:case wo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case To:case Ao:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ro:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Co:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Po:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Io:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Lo:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Uo:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Do:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case No:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Bo:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case zo:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case ko:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Ps:case Ho:case Go:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Ih:case Vo:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Wo:case Xo:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Mp(r,e,t,n,i,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),c=new ce,h=new WeakMap,d,u=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function f(E,b){return p?new OffscreenCanvas(E,b):Ds("canvas")}function y(E,b,D){let U=1,R=fe(E);if((R.width>D||R.height>D)&&(U=D/Math.max(R.width,R.height)),U<1){if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let L=Math.floor(U*R.width),S=Math.floor(U*R.height);d===void 0&&(d=f(L,S));let P=b?f(L,S):d;return P.width=L,P.height=S,P.getContext("2d").drawImage(E,0,0,L,S),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+R.width+"x"+R.height+") to ("+L+"x"+S+")."),P}return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+R.width+"x"+R.height+")."),E}return E}function m(E){return E.generateMipmaps}function g(E){r.generateMipmap(E)}function v(E){return E.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?r.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function _(E,b,D,U,R=!1){if(E!==null){if(r[E]!==void 0)return r[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let L=b;if(b===r.RED&&(D===r.FLOAT&&(L=r.R32F),D===r.HALF_FLOAT&&(L=r.R16F),D===r.UNSIGNED_BYTE&&(L=r.R8)),b===r.RED_INTEGER&&(D===r.UNSIGNED_BYTE&&(L=r.R8UI),D===r.UNSIGNED_SHORT&&(L=r.R16UI),D===r.UNSIGNED_INT&&(L=r.R32UI),D===r.BYTE&&(L=r.R8I),D===r.SHORT&&(L=r.R16I),D===r.INT&&(L=r.R32I)),b===r.RG&&(D===r.FLOAT&&(L=r.RG32F),D===r.HALF_FLOAT&&(L=r.RG16F),D===r.UNSIGNED_BYTE&&(L=r.RG8)),b===r.RG_INTEGER&&(D===r.UNSIGNED_BYTE&&(L=r.RG8UI),D===r.UNSIGNED_SHORT&&(L=r.RG16UI),D===r.UNSIGNED_INT&&(L=r.RG32UI),D===r.BYTE&&(L=r.RG8I),D===r.SHORT&&(L=r.RG16I),D===r.INT&&(L=r.RG32I)),b===r.RGB_INTEGER&&(D===r.UNSIGNED_BYTE&&(L=r.RGB8UI),D===r.UNSIGNED_SHORT&&(L=r.RGB16UI),D===r.UNSIGNED_INT&&(L=r.RGB32UI),D===r.BYTE&&(L=r.RGB8I),D===r.SHORT&&(L=r.RGB16I),D===r.INT&&(L=r.RGB32I)),b===r.RGBA_INTEGER&&(D===r.UNSIGNED_BYTE&&(L=r.RGBA8UI),D===r.UNSIGNED_SHORT&&(L=r.RGBA16UI),D===r.UNSIGNED_INT&&(L=r.RGBA32UI),D===r.BYTE&&(L=r.RGBA8I),D===r.SHORT&&(L=r.RGBA16I),D===r.INT&&(L=r.RGBA32I)),b===r.RGB&&D===r.UNSIGNED_INT_5_9_9_9_REV&&(L=r.RGB9_E5),b===r.RGBA){let S=R?da:Ze.getTransfer(U);D===r.FLOAT&&(L=r.RGBA32F),D===r.HALF_FLOAT&&(L=r.RGBA16F),D===r.UNSIGNED_BYTE&&(L=S===it?r.SRGB8_ALPHA8:r.RGBA8),D===r.UNSIGNED_SHORT_4_4_4_4&&(L=r.RGBA4),D===r.UNSIGNED_SHORT_5_5_5_1&&(L=r.RGB5_A1)}return L!==r.R16F&&L!==r.R32F&&L!==r.RG16F&&L!==r.RG32F&&L!==r.RGBA16F&&L!==r.RGBA32F||e.get("EXT_color_buffer_float"),L}function x(E,b){let D;return E?b===null||b===ai||b===Oi?D=r.DEPTH24_STENCIL8:b===hn?D=r.DEPTH32F_STENCIL8:b===vr&&(D=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===ai||b===Oi?D=r.DEPTH_COMPONENT24:b===hn?D=r.DEPTH_COMPONENT32F:b===vr&&(D=r.DEPTH_COMPONENT16),D}function T(E,b){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==tn&&E.minFilter!==Sn?Math.log2(Math.max(b.width,b.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?b.mipmaps.length:1}function A(E){let b=E.target;b.removeEventListener("dispose",A),(function(D){let U=n.get(D);if(U.__webglInit===void 0)return;let R=D.source,L=u.get(R);if(L){let S=L[U.__cacheKey];S.usedTimes--,S.usedTimes===0&&N(D),Object.keys(L).length===0&&u.delete(R)}n.remove(D)})(b),b.isVideoTexture&&h.delete(b)}function I(E){let b=E.target;b.removeEventListener("dispose",I),(function(D){let U=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let L=0;L<6;L++){if(Array.isArray(U.__webglFramebuffer[L]))for(let S=0;S<U.__webglFramebuffer[L].length;S++)r.deleteFramebuffer(U.__webglFramebuffer[L][S]);else r.deleteFramebuffer(U.__webglFramebuffer[L]);U.__webglDepthbuffer&&r.deleteRenderbuffer(U.__webglDepthbuffer[L])}else{if(Array.isArray(U.__webglFramebuffer))for(let L=0;L<U.__webglFramebuffer.length;L++)r.deleteFramebuffer(U.__webglFramebuffer[L]);else r.deleteFramebuffer(U.__webglFramebuffer);if(U.__webglDepthbuffer&&r.deleteRenderbuffer(U.__webglDepthbuffer),U.__webglMultisampledFramebuffer&&r.deleteFramebuffer(U.__webglMultisampledFramebuffer),U.__webglColorRenderbuffer)for(let L=0;L<U.__webglColorRenderbuffer.length;L++)U.__webglColorRenderbuffer[L]&&r.deleteRenderbuffer(U.__webglColorRenderbuffer[L]);U.__webglDepthRenderbuffer&&r.deleteRenderbuffer(U.__webglDepthRenderbuffer)}let R=D.textures;for(let L=0,S=R.length;L<S;L++){let P=n.get(R[L]);P.__webglTexture&&(r.deleteTexture(P.__webglTexture),a.memory.textures--),n.remove(R[L])}n.remove(D)})(b)}function N(E){let b=n.get(E);r.deleteTexture(b.__webglTexture);let D=E.source;delete u.get(D)[b.__cacheKey],a.memory.textures--}let F=0;function H(E,b){let D=n.get(E);if(E.isVideoTexture&&(function(U){let R=a.render.frame;h.get(U)!==R&&(h.set(U,R),U.update())})(E),E.isRenderTargetTexture===!1&&E.version>0&&D.__version!==E.version){let U=E.image;if(U===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else{if(U.complete!==!1)return void Q(D,E,b);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete")}}t.bindTexture(r.TEXTURE_2D,D.__webglTexture,r.TEXTURE0+b)}let j={[_o]:r.REPEAT,[gr]:r.CLAMP_TO_EDGE,[yo]:r.MIRRORED_REPEAT},V={[tn]:r.NEAREST,[Tu]:r.NEAREST_MIPMAP_NEAREST,[qr]:r.NEAREST_MIPMAP_LINEAR,[Sn]:r.LINEAR,[Pa]:r.LINEAR_MIPMAP_NEAREST,[Pi]:r.LINEAR_MIPMAP_LINEAR},q={[Au]:r.NEVER,[Du]:r.ALWAYS,[Ru]:r.LESS,[Pu]:r.LEQUAL,[Cu]:r.EQUAL,[Uu]:r.GEQUAL,[Iu]:r.GREATER,[Lu]:r.NOTEQUAL};function W(E,b){if(b.type!==hn||e.has("OES_texture_float_linear")!==!1||b.magFilter!==Sn&&b.magFilter!==Pa&&b.magFilter!==qr&&b.magFilter!==Pi&&b.minFilter!==Sn&&b.minFilter!==Pa&&b.minFilter!==qr&&b.minFilter!==Pi||console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(E,r.TEXTURE_WRAP_S,j[b.wrapS]),r.texParameteri(E,r.TEXTURE_WRAP_T,j[b.wrapT]),E!==r.TEXTURE_3D&&E!==r.TEXTURE_2D_ARRAY||r.texParameteri(E,r.TEXTURE_WRAP_R,j[b.wrapR]),r.texParameteri(E,r.TEXTURE_MAG_FILTER,V[b.magFilter]),r.texParameteri(E,r.TEXTURE_MIN_FILTER,V[b.minFilter]),b.compareFunction&&(r.texParameteri(E,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(E,r.TEXTURE_COMPARE_FUNC,q[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===tn||b.minFilter!==qr&&b.minFilter!==Pi||b.type===hn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let D=e.get("EXT_texture_filter_anisotropic");r.texParameterf(E,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function te(E,b){let D=!1;E.__webglInit===void 0&&(E.__webglInit=!0,b.addEventListener("dispose",A));let U=b.source,R=u.get(U);R===void 0&&(R={},u.set(U,R));let L=(function(S){let P=[];return P.push(S.wrapS),P.push(S.wrapT),P.push(S.wrapR||0),P.push(S.magFilter),P.push(S.minFilter),P.push(S.anisotropy),P.push(S.internalFormat),P.push(S.format),P.push(S.type),P.push(S.generateMipmaps),P.push(S.premultiplyAlpha),P.push(S.flipY),P.push(S.unpackAlignment),P.push(S.colorSpace),P.join()})(b);if(L!==E.__cacheKey){R[L]===void 0&&(R[L]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,D=!0),R[L].usedTimes++;let S=R[E.__cacheKey];S!==void 0&&(R[E.__cacheKey].usedTimes--,S.usedTimes===0&&N(b)),E.__cacheKey=L,E.__webglTexture=R[L].texture}return D}function Q(E,b,D){let U=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(U=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(U=r.TEXTURE_3D);let R=te(E,b),L=b.source;t.bindTexture(U,E.__webglTexture,r.TEXTURE0+D);let S=n.get(L);if(L.version!==S.__version||R===!0){t.activeTexture(r.TEXTURE0+D);let P=Ze.getPrimaries(Ze.workingColorSpace),z=b.colorSpace===Ci?null:Ze.getPrimaries(b.colorSpace),ne=b.colorSpace===Ci||P===z?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let O=y(b.image,!1,i.maxTextureSize);O=ve(b,O);let ee=s.convert(b.format,b.colorSpace),$=s.convert(b.type),ie,_e=_(b.internalFormat,ee,$,b.colorSpace,b.isVideoTexture);W(U,b);let ge=b.mipmaps,Te=b.isVideoTexture!==!0,Pe=S.__version===void 0||R===!0,je=L.dataReady,He=T(b,O);if(b.isDepthTexture)_e=x(b.format===Fi,b.type),Pe&&(Te?t.texStorage2D(r.TEXTURE_2D,1,_e,O.width,O.height):t.texImage2D(r.TEXTURE_2D,0,_e,O.width,O.height,0,ee,$,null));else if(b.isDataTexture)if(ge.length>0){Te&&Pe&&t.texStorage2D(r.TEXTURE_2D,He,_e,ge[0].width,ge[0].height);for(let Me=0,Ge=ge.length;Me<Ge;Me++)ie=ge[Me],Te?je&&t.texSubImage2D(r.TEXTURE_2D,Me,0,0,ie.width,ie.height,ee,$,ie.data):t.texImage2D(r.TEXTURE_2D,Me,_e,ie.width,ie.height,0,ee,$,ie.data);b.generateMipmaps=!1}else Te?(Pe&&t.texStorage2D(r.TEXTURE_2D,He,_e,O.width,O.height),je&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,O.width,O.height,ee,$,O.data)):t.texImage2D(r.TEXTURE_2D,0,_e,O.width,O.height,0,ee,$,O.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Te&&Pe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,He,_e,ge[0].width,ge[0].height,O.depth);for(let Me=0,Ge=ge.length;Me<Ge;Me++)if(ie=ge[Me],b.format!==un)if(ee!==null)if(Te){if(je)if(b.layerUpdates.size>0){let Je=eh(ie.width,ie.height,b.format,b.type);for(let at of b.layerUpdates){let xe=ie.data.subarray(at*Je/ie.data.BYTES_PER_ELEMENT,(at+1)*Je/ie.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Me,0,0,at,ie.width,ie.height,1,ee,xe)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Me,0,0,0,ie.width,ie.height,O.depth,ee,ie.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Me,_e,ie.width,ie.height,O.depth,0,ie.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Te?je&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,Me,0,0,0,ie.width,ie.height,O.depth,ee,$,ie.data):t.texImage3D(r.TEXTURE_2D_ARRAY,Me,_e,ie.width,ie.height,O.depth,0,ee,$,ie.data)}else{Te&&Pe&&t.texStorage2D(r.TEXTURE_2D,He,_e,ge[0].width,ge[0].height);for(let Me=0,Ge=ge.length;Me<Ge;Me++)ie=ge[Me],b.format!==un?ee!==null?Te?je&&t.compressedTexSubImage2D(r.TEXTURE_2D,Me,0,0,ie.width,ie.height,ee,ie.data):t.compressedTexImage2D(r.TEXTURE_2D,Me,_e,ie.width,ie.height,0,ie.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Te?je&&t.texSubImage2D(r.TEXTURE_2D,Me,0,0,ie.width,ie.height,ee,$,ie.data):t.texImage2D(r.TEXTURE_2D,Me,_e,ie.width,ie.height,0,ee,$,ie.data)}else if(b.isDataArrayTexture)if(Te){if(Pe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,He,_e,O.width,O.height,O.depth),je)if(b.layerUpdates.size>0){let Me=eh(O.width,O.height,b.format,b.type);for(let Ge of b.layerUpdates){let Je=O.data.subarray(Ge*Me/O.data.BYTES_PER_ELEMENT,(Ge+1)*Me/O.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,Ge,O.width,O.height,1,ee,$,Je)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,O.width,O.height,O.depth,ee,$,O.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,_e,O.width,O.height,O.depth,0,ee,$,O.data);else if(b.isData3DTexture)Te?(Pe&&t.texStorage3D(r.TEXTURE_3D,He,_e,O.width,O.height,O.depth),je&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,O.width,O.height,O.depth,ee,$,O.data)):t.texImage3D(r.TEXTURE_3D,0,_e,O.width,O.height,O.depth,0,ee,$,O.data);else if(b.isFramebufferTexture){if(Pe)if(Te)t.texStorage2D(r.TEXTURE_2D,He,_e,O.width,O.height);else{let Me=O.width,Ge=O.height;for(let Je=0;Je<He;Je++)t.texImage2D(r.TEXTURE_2D,Je,_e,Me,Ge,0,ee,$,null),Me>>=1,Ge>>=1}}else if(ge.length>0){if(Te&&Pe){let Me=fe(ge[0]);t.texStorage2D(r.TEXTURE_2D,He,_e,Me.width,Me.height)}for(let Me=0,Ge=ge.length;Me<Ge;Me++)ie=ge[Me],Te?je&&t.texSubImage2D(r.TEXTURE_2D,Me,0,0,ee,$,ie):t.texImage2D(r.TEXTURE_2D,Me,_e,ee,$,ie);b.generateMipmaps=!1}else if(Te){if(Pe){let Me=fe(O);t.texStorage2D(r.TEXTURE_2D,He,_e,Me.width,Me.height)}je&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ee,$,O)}else t.texImage2D(r.TEXTURE_2D,0,_e,ee,$,O);m(b)&&g(U),S.__version=L.version,b.onUpdate&&b.onUpdate(b)}E.__version=b.version}function he(E,b,D,U,R,L){let S=s.convert(D.format,D.colorSpace),P=s.convert(D.type),z=_(D.internalFormat,S,P,D.colorSpace),ne=n.get(b),O=n.get(D);if(O.__renderTarget=b,!ne.__hasExternalTextures){let ee=Math.max(1,b.width>>L),$=Math.max(1,b.height>>L);R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY?t.texImage3D(R,L,z,ee,$,b.depth,0,S,P,null):t.texImage2D(R,L,z,ee,$,0,S,P,null)}t.bindFramebuffer(r.FRAMEBUFFER,E),ye(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,U,R,O.__webglTexture,0,le(b)):(R===r.TEXTURE_2D||R>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&R<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,U,R,O.__webglTexture,L),t.bindFramebuffer(r.FRAMEBUFFER,null)}function oe(E,b,D){if(r.bindRenderbuffer(r.RENDERBUFFER,E),b.depthBuffer){let U=b.depthTexture,R=U&&U.isDepthTexture?U.type:null,L=x(b.stencilBuffer,R),S=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,P=le(b);ye(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,P,L,b.width,b.height):D?r.renderbufferStorageMultisample(r.RENDERBUFFER,P,L,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,L,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,S,r.RENDERBUFFER,E)}else{let U=b.textures;for(let R=0;R<U.length;R++){let L=U[R],S=s.convert(L.format,L.colorSpace),P=s.convert(L.type),z=_(L.internalFormat,S,P,L.colorSpace),ne=le(b);D&&ye(b)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,ne,z,b.width,b.height):ye(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ne,z,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,z,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Ee(E){let b=n.get(E),D=E.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==E.depthTexture){let U=E.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),U){let R=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,U.removeEventListener("dispose",R)};U.addEventListener("dispose",R),b.__depthDisposeCallback=R}b.__boundDepthTexture=U}if(E.depthTexture&&!b.__autoAllocateDepthBuffer){if(D)throw new Error("target.depthTexture not supported in Cube render targets");(function(U,R){if(R&&R.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,U),!R.depthTexture||!R.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let L=n.get(R.depthTexture);L.__renderTarget=R,L.__webglTexture&&R.depthTexture.image.width===R.width&&R.depthTexture.image.height===R.height||(R.depthTexture.image.width=R.width,R.depthTexture.image.height=R.height,R.depthTexture.needsUpdate=!0),H(R.depthTexture,0);let S=L.__webglTexture,P=le(R);if(R.depthTexture.format===_r)ye(R)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,S,0,P):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,S,0);else{if(R.depthTexture.format!==Fi)throw new Error("Unknown depthTexture format");ye(R)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,S,0,P):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,S,0)}})(b.__webglFramebuffer,E)}else if(D){b.__webglDepthbuffer=[];for(let U=0;U<6;U++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[U]),b.__webglDepthbuffer[U]===void 0)b.__webglDepthbuffer[U]=r.createRenderbuffer(),oe(b.__webglDepthbuffer[U],E,!1);else{let R=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,L=b.__webglDepthbuffer[U];r.bindRenderbuffer(r.RENDERBUFFER,L),r.framebufferRenderbuffer(r.FRAMEBUFFER,R,r.RENDERBUFFER,L)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),oe(b.__webglDepthbuffer,E,!1);else{let U=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,R=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,R),r.framebufferRenderbuffer(r.FRAMEBUFFER,U,r.RENDERBUFFER,R)}t.bindFramebuffer(r.FRAMEBUFFER,null)}let we=[],Z=[];function le(E){return Math.min(i.maxSamples,E.samples)}function ye(E){let b=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function ve(E,b){let D=E.colorSpace,U=E.format,R=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||D!==Yi&&D!==Ci&&(Ze.getTransfer(D)===it?U===un&&R===Bn||console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",D)),b}function fe(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=function(){let E=F;return E>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+i.maxTextures),F+=1,E},this.resetTextureUnits=function(){F=0},this.setTexture2D=H,this.setTexture2DArray=function(E,b){let D=n.get(E);E.version>0&&D.__version!==E.version?Q(D,E,b):t.bindTexture(r.TEXTURE_2D_ARRAY,D.__webglTexture,r.TEXTURE0+b)},this.setTexture3D=function(E,b){let D=n.get(E);E.version>0&&D.__version!==E.version?Q(D,E,b):t.bindTexture(r.TEXTURE_3D,D.__webglTexture,r.TEXTURE0+b)},this.setTextureCube=function(E,b){let D=n.get(E);E.version>0&&D.__version!==E.version?(function(U,R,L){if(R.image.length!==6)return;let S=te(U,R),P=R.source;t.bindTexture(r.TEXTURE_CUBE_MAP,U.__webglTexture,r.TEXTURE0+L);let z=n.get(P);if(P.version!==z.__version||S===!0){t.activeTexture(r.TEXTURE0+L);let ne=Ze.getPrimaries(Ze.workingColorSpace),O=R.colorSpace===Ci?null:Ze.getPrimaries(R.colorSpace),ee=R.colorSpace===Ci||ne===O?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,R.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,R.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);let $=R.isCompressedTexture||R.image[0].isCompressedTexture,ie=R.image[0]&&R.image[0].isDataTexture,_e=[];for(let xe=0;xe<6;xe++)_e[xe]=$||ie?ie?R.image[xe].image:R.image[xe]:y(R.image[xe],!0,i.maxCubemapSize),_e[xe]=ve(R,_e[xe]);let ge=_e[0],Te=s.convert(R.format,R.colorSpace),Pe=s.convert(R.type),je=_(R.internalFormat,Te,Pe,R.colorSpace),He=R.isVideoTexture!==!0,Me=z.__version===void 0||S===!0,Ge=P.dataReady,Je,at=T(R,ge);if(W(r.TEXTURE_CUBE_MAP,R),$){He&&Me&&t.texStorage2D(r.TEXTURE_CUBE_MAP,at,je,ge.width,ge.height);for(let xe=0;xe<6;xe++){Je=_e[xe].mipmaps;for(let qe=0;qe<Je.length;qe++){let Ke=Je[qe];R.format!==un?Te!==null?He?Ge&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe,0,0,Ke.width,Ke.height,Te,Ke.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe,je,Ke.width,Ke.height,0,Ke.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):He?Ge&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe,0,0,Ke.width,Ke.height,Te,Pe,Ke.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe,je,Ke.width,Ke.height,0,Te,Pe,Ke.data)}}}else{if(Je=R.mipmaps,He&&Me){Je.length>0&&at++;let xe=fe(_e[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,at,je,xe.width,xe.height)}for(let xe=0;xe<6;xe++)if(ie){He?Ge&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,_e[xe].width,_e[xe].height,Te,Pe,_e[xe].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,je,_e[xe].width,_e[xe].height,0,Te,Pe,_e[xe].data);for(let qe=0;qe<Je.length;qe++){let Ke=Je[qe].image[xe].image;He?Ge&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe+1,0,0,Ke.width,Ke.height,Te,Pe,Ke.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe+1,je,Ke.width,Ke.height,0,Te,Pe,Ke.data)}}else{He?Ge&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,Te,Pe,_e[xe]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,je,Te,Pe,_e[xe]);for(let qe=0;qe<Je.length;qe++){let Ke=Je[qe];He?Ge&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe+1,0,0,Te,Pe,Ke.image[xe]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+xe,qe+1,je,Te,Pe,Ke.image[xe])}}}m(R)&&g(r.TEXTURE_CUBE_MAP),z.__version=P.version,R.onUpdate&&R.onUpdate(R)}U.__version=R.version})(D,E,b):t.bindTexture(r.TEXTURE_CUBE_MAP,D.__webglTexture,r.TEXTURE0+b)},this.rebindTextures=function(E,b,D){let U=n.get(E);b!==void 0&&he(U.__webglFramebuffer,E,E.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),D!==void 0&&Ee(E)},this.setupRenderTarget=function(E){let b=E.texture,D=n.get(E),U=n.get(b);E.addEventListener("dispose",I);let R=E.textures,L=E.isWebGLCubeRenderTarget===!0,S=R.length>1;if(S||(U.__webglTexture===void 0&&(U.__webglTexture=r.createTexture()),U.__version=b.version,a.memory.textures++),L){D.__webglFramebuffer=[];for(let P=0;P<6;P++)if(b.mipmaps&&b.mipmaps.length>0){D.__webglFramebuffer[P]=[];for(let z=0;z<b.mipmaps.length;z++)D.__webglFramebuffer[P][z]=r.createFramebuffer()}else D.__webglFramebuffer[P]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){D.__webglFramebuffer=[];for(let P=0;P<b.mipmaps.length;P++)D.__webglFramebuffer[P]=r.createFramebuffer()}else D.__webglFramebuffer=r.createFramebuffer();if(S)for(let P=0,z=R.length;P<z;P++){let ne=n.get(R[P]);ne.__webglTexture===void 0&&(ne.__webglTexture=r.createTexture(),a.memory.textures++)}if(E.samples>0&&ye(E)===!1){D.__webglMultisampledFramebuffer=r.createFramebuffer(),D.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let P=0;P<R.length;P++){let z=R[P];D.__webglColorRenderbuffer[P]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,D.__webglColorRenderbuffer[P]);let ne=s.convert(z.format,z.colorSpace),O=s.convert(z.type),ee=_(z.internalFormat,ne,O,z.colorSpace,E.isXRRenderTarget===!0),$=le(E);r.renderbufferStorageMultisample(r.RENDERBUFFER,$,ee,E.width,E.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+P,r.RENDERBUFFER,D.__webglColorRenderbuffer[P])}r.bindRenderbuffer(r.RENDERBUFFER,null),E.depthBuffer&&(D.__webglDepthRenderbuffer=r.createRenderbuffer(),oe(D.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(L){t.bindTexture(r.TEXTURE_CUBE_MAP,U.__webglTexture),W(r.TEXTURE_CUBE_MAP,b);for(let P=0;P<6;P++)if(b.mipmaps&&b.mipmaps.length>0)for(let z=0;z<b.mipmaps.length;z++)he(D.__webglFramebuffer[P][z],E,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+P,z);else he(D.__webglFramebuffer[P],E,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+P,0);m(b)&&g(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(S){for(let P=0,z=R.length;P<z;P++){let ne=R[P],O=n.get(ne);t.bindTexture(r.TEXTURE_2D,O.__webglTexture),W(r.TEXTURE_2D,ne),he(D.__webglFramebuffer,E,ne,r.COLOR_ATTACHMENT0+P,r.TEXTURE_2D,0),m(ne)&&g(r.TEXTURE_2D)}t.unbindTexture()}else{let P=r.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(P=E.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(P,U.__webglTexture),W(P,b),b.mipmaps&&b.mipmaps.length>0)for(let z=0;z<b.mipmaps.length;z++)he(D.__webglFramebuffer[z],E,b,r.COLOR_ATTACHMENT0,P,z);else he(D.__webglFramebuffer,E,b,r.COLOR_ATTACHMENT0,P,0);m(b)&&g(P),t.unbindTexture()}E.depthBuffer&&Ee(E)},this.updateRenderTargetMipmap=function(E){let b=E.textures;for(let D=0,U=b.length;D<U;D++){let R=b[D];if(m(R)){let L=v(E),S=n.get(R).__webglTexture;t.bindTexture(L,S),g(L),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(E){if(E.samples>0){if(ye(E)===!1){let b=E.textures,D=E.width,U=E.height,R=r.COLOR_BUFFER_BIT,L=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,S=n.get(E),P=b.length>1;if(P)for(let z=0;z<b.length;z++)t.bindFramebuffer(r.FRAMEBUFFER,S.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+z,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+z,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,S.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,S.__webglFramebuffer);for(let z=0;z<b.length;z++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(R|=r.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(R|=r.STENCIL_BUFFER_BIT)),P){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,S.__webglColorRenderbuffer[z]);let ne=n.get(b[z]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,ne,0)}r.blitFramebuffer(0,0,D,U,0,0,D,U,R,r.NEAREST),l===!0&&(we.length=0,Z.length=0,we.push(r.COLOR_ATTACHMENT0+z),E.depthBuffer&&E.resolveDepthBuffer===!1&&(we.push(L),Z.push(L),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Z)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,we))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),P)for(let z=0;z<b.length;z++){t.bindFramebuffer(r.FRAMEBUFFER,S.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+z,r.RENDERBUFFER,S.__webglColorRenderbuffer[z]);let ne=n.get(b[z]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+z,r.TEXTURE_2D,ne,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,S.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){let b=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}},this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=he,this.useMultisampledRTT=ye}function Sp(r,e){return{convert:function(t,n=""){let i,s=Ze.getTransfer(n);if(t===Bn)return r.UNSIGNED_BYTE;if(t===Gl)return r.UNSIGNED_SHORT_4_4_4_4;if(t===Vl)return r.UNSIGNED_SHORT_5_5_5_1;if(t===wh)return r.UNSIGNED_INT_5_9_9_9_REV;if(t===bh)return r.BYTE;if(t===Eh)return r.SHORT;if(t===vr)return r.UNSIGNED_SHORT;if(t===Hl)return r.INT;if(t===ai)return r.UNSIGNED_INT;if(t===hn)return r.FLOAT;if(t===Or)return r.HALF_FLOAT;if(t===Th)return r.ALPHA;if(t===Ah)return r.RGB;if(t===un)return r.RGBA;if(t===Rh)return r.LUMINANCE;if(t===Ch)return r.LUMINANCE_ALPHA;if(t===_r)return r.DEPTH_COMPONENT;if(t===Fi)return r.DEPTH_STENCIL;if(t===Wl)return r.RED;if(t===Xl)return r.RED_INTEGER;if(t===Ph)return r.RG;if(t===jl)return r.RG_INTEGER;if(t===ql)return r.RGBA_INTEGER;if(t===Ts||t===As||t===Rs||t===Cs)if(s===it){if(i=e.get("WEBGL_compressed_texture_s3tc_srgb"),i===null)return null;if(t===Ts)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(t===As)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(t===Rs)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(t===Cs)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(i=e.get("WEBGL_compressed_texture_s3tc"),i===null)return null;if(t===Ts)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(t===As)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(t===Rs)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(t===Cs)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(t===xo||t===Mo||t===So||t===bo){if(i=e.get("WEBGL_compressed_texture_pvrtc"),i===null)return null;if(t===xo)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(t===Mo)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(t===So)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(t===bo)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(t===Eo||t===wo||t===To){if(i=e.get("WEBGL_compressed_texture_etc"),i===null)return null;if(t===Eo||t===wo)return s===it?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(t===To)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}if(t===Ao||t===Ro||t===Co||t===Po||t===Io||t===Lo||t===Uo||t===Do||t===No||t===Oo||t===Fo||t===Bo||t===zo||t===ko){if(i=e.get("WEBGL_compressed_texture_astc"),i===null)return null;if(t===Ao)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(t===Ro)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(t===Co)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(t===Po)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(t===Io)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(t===Lo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(t===Uo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(t===Do)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(t===No)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(t===Oo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(t===Fo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(t===Bo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(t===zo)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(t===ko)return s===it?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}if(t===Ps||t===Ho||t===Go){if(i=e.get("EXT_texture_compression_bptc"),i===null)return null;if(t===Ps)return s===it?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(t===Ho)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(t===Go)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(t===Ih||t===Vo||t===Wo||t===Xo){if(i=e.get("EXT_texture_compression_rgtc"),i===null)return null;if(t===Ps)return i.COMPRESSED_RED_RGTC1_EXT;if(t===Vo)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(t===Wo)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(t===Xo)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return t===Oi?r.UNSIGNED_INT_24_8:r[t]!==void 0?r[t]:null}}}var ol=class extends Nt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},ft=class extends Tt{constructor(){super(),this.isGroup=!0,this.type="Group"}},bp={type:"move"},pr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ft,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ft,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ft,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),g=this._getHandJoint(c,y);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,f=.005;c.inputState.pinching&&u>p+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(bp)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new ft;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ll=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let i=new kt;e.properties.get(i).__webglTexture=t.texture,t.depthNear==n.depthNear&&t.depthFar==n.depthFar||(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new mn({vertexShader:`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fragmentShader:`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pt(new Hn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},cl=class extends zn{constructor(e,t){super();let n=this,i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,f=null,y=new ll,m=t.getContextAttributes(),g=null,v=null,_=[],x=[],T=new ce,A=null,I=new Nt;I.viewport=new $e;let N=new Nt;N.viewport=new $e;let F=[I,N],H=new ol,j=null,V=null;function q(Z){let le=x.indexOf(Z.inputSource);if(le===-1)return;let ye=_[le];ye!==void 0&&(ye.update(Z.inputSource,Z.frame,c||a),ye.dispatchEvent({type:Z.type,data:Z.inputSource}))}function W(){i.removeEventListener("select",q),i.removeEventListener("selectstart",q),i.removeEventListener("selectend",q),i.removeEventListener("squeeze",q),i.removeEventListener("squeezestart",q),i.removeEventListener("squeezeend",q),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",te);for(let Z=0;Z<_.length;Z++){let le=x[Z];le!==null&&(x[Z]=null,_[Z].disconnect(le))}j=null,V=null,y.reset(),e.setRenderTarget(g),p=null,u=null,d=null,i=null,v=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}function te(Z){for(let le=0;le<Z.removed.length;le++){let ye=Z.removed[le],ve=x.indexOf(ye);ve>=0&&(x[ve]=null,_[ve].disconnect(ye))}for(let le=0;le<Z.added.length;le++){let ye=Z.added[le],ve=x.indexOf(ye);if(ve===-1){for(let E=0;E<_.length;E++){if(E>=x.length){x.push(ye),ve=E;break}if(x[E]===null){x[E]=ye,ve=E;break}}if(ve===-1)break}let fe=_[ve];fe&&fe.connect(ye)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let le=_[Z];return le===void 0&&(le=new pr,_[Z]=le),le.getTargetRaySpace()},this.getControllerGrip=function(Z){let le=_[Z];return le===void 0&&(le=new pr,_[Z]=le),le.getGripSpace()},this.getHand=function(Z){let le=_[Z];return le===void 0&&(le=new pr,_[Z]=le),le.getHandSpace()},this.setFramebufferScaleFactor=function(Z){s=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d},this.getFrame=function(){return f},this.getSession=function(){return i},this.setSession=async function(Z){if(i=Z,i!==null){if(g=e.getRenderTarget(),i.addEventListener("select",q),i.addEventListener("selectstart",q),i.addEventListener("selectend",q),i.addEventListener("squeeze",q),i.addEventListener("squeezestart",q),i.addEventListener("squeezeend",q),i.addEventListener("end",W),i.addEventListener("inputsourceschange",te),m.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(T),i.renderState.layers===void 0){let le={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(i,t,le),i.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new En(p.framebufferWidth,p.framebufferHeight,{format:un,type:Bn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let le=null,ye=null,ve=null;m.depth&&(ve=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=m.stencil?Fi:_r,ye=m.stencil?Oi:ai);let fe={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:s};d=new XRWebGLBinding(i,t),u=d.createProjectionLayer(fe),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new En(u.textureWidth,u.textureHeight,{format:un,type:Bn,depthTexture:new Hs(u.textureWidth,u.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),we.setContext(i),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};let Q=new w,he=new w;function oe(Z,le){le===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(le.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(i===null)return;let le=Z.near,ye=Z.far;y.texture!==null&&(y.depthNear>0&&(le=y.depthNear),y.depthFar>0&&(ye=y.depthFar)),H.near=N.near=I.near=le,H.far=N.far=I.far=ye,j===H.near&&V===H.far||(i.updateRenderState({depthNear:H.near,depthFar:H.far}),j=H.near,V=H.far),I.layers.mask=2|Z.layers.mask,N.layers.mask=4|Z.layers.mask,H.layers.mask=I.layers.mask|N.layers.mask;let ve=Z.parent,fe=H.cameras;oe(H,ve);for(let E=0;E<fe.length;E++)oe(fe[E],ve);fe.length===2?(function(E,b,D){Q.setFromMatrixPosition(b.matrixWorld),he.setFromMatrixPosition(D.matrixWorld);let U=Q.distanceTo(he),R=b.projectionMatrix.elements,L=D.projectionMatrix.elements,S=R[14]/(R[10]-1),P=R[14]/(R[10]+1),z=(R[9]+1)/R[5],ne=(R[9]-1)/R[5],O=(R[8]-1)/R[0],ee=(L[8]+1)/L[0],$=S*O,ie=S*ee,_e=U/(-O+ee),ge=_e*-O;if(b.matrixWorld.decompose(E.position,E.quaternion,E.scale),E.translateX(ge),E.translateZ(_e),E.matrixWorld.compose(E.position,E.quaternion,E.scale),E.matrixWorldInverse.copy(E.matrixWorld).invert(),R[10]===-1)E.projectionMatrix.copy(b.projectionMatrix),E.projectionMatrixInverse.copy(b.projectionMatrixInverse);else{let Te=S+_e,Pe=P+_e,je=$-ge,He=ie+(U-ge),Me=z*P/Pe*Te,Ge=ne*P/Pe*Te;E.projectionMatrix.makePerspective(je,He,Me,Ge,Te,Pe),E.projectionMatrixInverse.copy(E.projectionMatrix).invert()}})(H,I,N):H.projectionMatrix.copy(I.projectionMatrix),(function(E,b,D){D===null?E.matrix.copy(b.matrixWorld):(E.matrix.copy(D.matrixWorld),E.matrix.invert(),E.matrix.multiply(b.matrixWorld)),E.matrix.decompose(E.position,E.quaternion,E.scale),E.updateMatrixWorld(!0),E.projectionMatrix.copy(b.projectionMatrix),E.projectionMatrixInverse.copy(b.projectionMatrixInverse),E.isPerspectiveCamera&&(E.fov=2*qo*Math.atan(1/E.projectionMatrix.elements[5]),E.zoom=1)})(Z,H,ve)},this.getCamera=function(){return H},this.getFoveation=function(){if(u!==null||p!==null)return l},this.setFoveation=function(Z){l=Z,u!==null&&(u.fixedFoveation=Z),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Z)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(H)};let Ee=null,we=new Nh;we.setAnimationLoop((function(Z,le){if(h=le.getViewerPose(c||a),f=le,h!==null){let ye=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let ve=!1;ye.length!==H.cameras.length&&(H.cameras.length=0,ve=!0);for(let E=0;E<ye.length;E++){let b=ye[E],D=null;if(p!==null)D=p.getViewport(b);else{let R=d.getViewSubImage(u,b);D=R.viewport,E===0&&(e.setRenderTargetTextures(v,R.colorTexture,u.ignoreDepthValues?void 0:R.depthStencilTexture),e.setRenderTarget(v))}let U=F[E];U===void 0&&(U=new Nt,U.layers.enable(E),U.viewport=new $e,F[E]=U),U.matrix.fromArray(b.transform.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale),U.projectionMatrix.fromArray(b.projectionMatrix),U.projectionMatrixInverse.copy(U.projectionMatrix).invert(),U.viewport.set(D.x,D.y,D.width,D.height),E===0&&(H.matrix.copy(U.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),ve===!0&&H.cameras.push(U)}let fe=i.enabledFeatures;if(fe&&fe.includes("depth-sensing")){let E=d.getDepthInformation(ye[0]);E&&E.isValid&&E.texture&&y.init(e,E,i.renderState)}}for(let ye=0;ye<_.length;ye++){let ve=x[ye],fe=_[ye];ve!==null&&fe!==void 0&&fe.update(ve,le,c||a)}Ee&&Ee(Z,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),f=null})),this.setAnimationLoop=function(Z){Ee=Z},this.dispose=function(){}}},ti=new pn,Ep=new Xe;function wp(r,e){function t(i,s){i.matrixAutoUpdate===!0&&i.updateMatrix(),s.value.copy(i.matrix)}function n(i,s){i.opacity.value=s.opacity,s.color&&i.diffuse.value.copy(s.color),s.emissive&&i.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(i.map.value=s.map,t(s.map,i.mapTransform)),s.alphaMap&&(i.alphaMap.value=s.alphaMap,t(s.alphaMap,i.alphaMapTransform)),s.bumpMap&&(i.bumpMap.value=s.bumpMap,t(s.bumpMap,i.bumpMapTransform),i.bumpScale.value=s.bumpScale,s.side===1&&(i.bumpScale.value*=-1)),s.normalMap&&(i.normalMap.value=s.normalMap,t(s.normalMap,i.normalMapTransform),i.normalScale.value.copy(s.normalScale),s.side===1&&i.normalScale.value.negate()),s.displacementMap&&(i.displacementMap.value=s.displacementMap,t(s.displacementMap,i.displacementMapTransform),i.displacementScale.value=s.displacementScale,i.displacementBias.value=s.displacementBias),s.emissiveMap&&(i.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,i.emissiveMapTransform)),s.specularMap&&(i.specularMap.value=s.specularMap,t(s.specularMap,i.specularMapTransform)),s.alphaTest>0&&(i.alphaTest.value=s.alphaTest);let a=e.get(s),o=a.envMap,l=a.envMapRotation;o&&(i.envMap.value=o,ti.copy(l),ti.x*=-1,ti.y*=-1,ti.z*=-1,o.isCubeTexture&&o.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),i.envMapRotation.value.setFromMatrix4(Ep.makeRotationFromEuler(ti)),i.flipEnvMap.value=o.isCubeTexture&&o.isRenderTargetTexture===!1?-1:1,i.reflectivity.value=s.reflectivity,i.ior.value=s.ior,i.refractionRatio.value=s.refractionRatio),s.lightMap&&(i.lightMap.value=s.lightMap,i.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,i.lightMapTransform)),s.aoMap&&(i.aoMap.value=s.aoMap,i.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,i.aoMapTransform))}return{refreshFogUniforms:function(i,s){s.color.getRGB(i.fogColor.value,Dh(r)),s.isFog?(i.fogNear.value=s.near,i.fogFar.value=s.far):s.isFogExp2&&(i.fogDensity.value=s.density)},refreshMaterialUniforms:function(i,s,a,o,l){s.isMeshBasicMaterial||s.isMeshLambertMaterial?n(i,s):s.isMeshToonMaterial?(n(i,s),(function(c,h){h.gradientMap&&(c.gradientMap.value=h.gradientMap)})(i,s)):s.isMeshPhongMaterial?(n(i,s),(function(c,h){c.specular.value.copy(h.specular),c.shininess.value=Math.max(h.shininess,1e-4)})(i,s)):s.isMeshStandardMaterial?(n(i,s),(function(c,h){c.metalness.value=h.metalness,h.metalnessMap&&(c.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,c.metalnessMapTransform)),c.roughness.value=h.roughness,h.roughnessMap&&(c.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,c.roughnessMapTransform)),h.envMap&&(c.envMapIntensity.value=h.envMapIntensity)})(i,s),s.isMeshPhysicalMaterial&&(function(c,h,d){c.ior.value=h.ior,h.sheen>0&&(c.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),c.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(c.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,c.sheenColorMapTransform)),h.sheenRoughnessMap&&(c.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,c.sheenRoughnessMapTransform))),h.clearcoat>0&&(c.clearcoat.value=h.clearcoat,c.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(c.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,c.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(c.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===1&&c.clearcoatNormalScale.value.negate())),h.dispersion>0&&(c.dispersion.value=h.dispersion),h.iridescence>0&&(c.iridescence.value=h.iridescence,c.iridescenceIOR.value=h.iridescenceIOR,c.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(c.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,c.iridescenceMapTransform)),h.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),h.transmission>0&&(c.transmission.value=h.transmission,c.transmissionSamplerMap.value=d.texture,c.transmissionSamplerSize.value.set(d.width,d.height),h.transmissionMap&&(c.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,c.transmissionMapTransform)),c.thickness.value=h.thickness,h.thicknessMap&&(c.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=h.attenuationDistance,c.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(c.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(c.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=h.specularIntensity,c.specularColor.value.copy(h.specularColor),h.specularColorMap&&(c.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,c.specularColorMapTransform)),h.specularIntensityMap&&(c.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,c.specularIntensityMapTransform))})(i,s,l)):s.isMeshMatcapMaterial?(n(i,s),(function(c,h){h.matcap&&(c.matcap.value=h.matcap)})(i,s)):s.isMeshDepthMaterial?n(i,s):s.isMeshDistanceMaterial?(n(i,s),(function(c,h){let d=e.get(h).light;c.referencePosition.value.setFromMatrixPosition(d.matrixWorld),c.nearDistance.value=d.shadow.camera.near,c.farDistance.value=d.shadow.camera.far})(i,s)):s.isMeshNormalMaterial?n(i,s):s.isLineBasicMaterial?((function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform))})(i,s),s.isLineDashedMaterial&&(function(c,h){c.dashSize.value=h.dashSize,c.totalSize.value=h.dashSize+h.gapSize,c.scale.value=h.scale})(i,s)):s.isPointsMaterial?(function(c,h,d,u){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.size.value=h.size*d,c.scale.value=.5*u,h.map&&(c.map.value=h.map,t(h.map,c.uvTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)})(i,s,a,o):s.isSpriteMaterial?(function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.rotation.value=h.rotation,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)})(i,s):s.isShadowMaterial?(i.color.value.copy(s.color),i.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}}}function Tp(r,e,t,n){let i={},s={},a=[],o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(d,u,p,f){let y=d.value,m=u+"_"+p;if(f[m]===void 0)return f[m]=typeof y=="number"||typeof y=="boolean"?y:y.clone(),!0;{let g=f[m];if(typeof y=="number"||typeof y=="boolean"){if(g!==y)return f[m]=y,!0}else if(g.equals(y)===!1)return g.copy(y),!0}return!1}function c(d){let u={boundary:0,storage:0};return typeof d=="number"||typeof d=="boolean"?(u.boundary=4,u.storage=4):d.isVector2?(u.boundary=8,u.storage=8):d.isVector3||d.isColor?(u.boundary=16,u.storage=12):d.isVector4?(u.boundary=16,u.storage=16):d.isMatrix3?(u.boundary=48,u.storage=48):d.isMatrix4?(u.boundary=64,u.storage=64):d.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",d),u}function h(d){let u=d.target;u.removeEventListener("dispose",h);let p=a.indexOf(u.__bindingPointIndex);a.splice(p,1),r.deleteBuffer(i[u.id]),delete i[u.id],delete s[u.id]}return{bind:function(d,u){let p=u.program;n.uniformBlockBinding(d,p)},update:function(d,u){let p=i[d.id];p===void 0&&((function(m){let g=m.uniforms,v=0,_=16;for(let T=0,A=g.length;T<A;T++){let I=Array.isArray(g[T])?g[T]:[g[T]];for(let N=0,F=I.length;N<F;N++){let H=I[N],j=Array.isArray(H.value)?H.value:[H.value];for(let V=0,q=j.length;V<q;V++){let W=c(j[V]),te=v%_,Q=te%W.boundary,he=te+Q;v+=Q,he!==0&&_-he<W.storage&&(v+=_-he),H.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=v,v+=W.storage}}}let x=v%_;x>0&&(v+=_-x),m.__size=v,m.__cache={}})(d),p=(function(m){let g=(function(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0})();m.__bindingPointIndex=g;let v=r.createBuffer(),_=m.__size,x=m.usage;return r.bindBuffer(r.UNIFORM_BUFFER,v),r.bufferData(r.UNIFORM_BUFFER,_,x),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,g,v),v})(d),i[d.id]=p,d.addEventListener("dispose",h));let f=u.program;n.updateUBOMapping(d,f);let y=e.render.frame;s[d.id]!==y&&((function(m){let g=i[m.id],v=m.uniforms,_=m.__cache;r.bindBuffer(r.UNIFORM_BUFFER,g);for(let x=0,T=v.length;x<T;x++){let A=Array.isArray(v[x])?v[x]:[v[x]];for(let I=0,N=A.length;I<N;I++){let F=A[I];if(l(F,x,I,_)===!0){let H=F.__offset,j=Array.isArray(F.value)?F.value:[F.value],V=0;for(let q=0;q<j.length;q++){let W=j[q],te=c(W);typeof W=="number"||typeof W=="boolean"?(F.__data[0]=W,r.bufferSubData(r.UNIFORM_BUFFER,H+V,F.__data)):W.isMatrix3?(F.__data[0]=W.elements[0],F.__data[1]=W.elements[1],F.__data[2]=W.elements[2],F.__data[3]=0,F.__data[4]=W.elements[3],F.__data[5]=W.elements[4],F.__data[6]=W.elements[5],F.__data[7]=0,F.__data[8]=W.elements[6],F.__data[9]=W.elements[7],F.__data[10]=W.elements[8],F.__data[11]=0):(W.toArray(F.__data,V),V+=te.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,H,F.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)})(d),s[d.id]=y)},dispose:function(){for(let d in i)r.deleteBuffer(i[d]);a=[],i={},s={}}}}var Gs=class{constructor(e={}){let{canvas:t=Ou(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:u=!1}=e,p;if(this.isWebGLRenderer=!0,n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let f=new Uint32Array(4),y=new Int32Array(4),m=null,g=null,v=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Dt,this.toneMapping=0,this.toneMappingExposure=1;let x=this,T=!1,A=0,I=0,N=null,F=-1,H=null,j=new $e,V=new $e,q=null,W=new Be(0),te=0,Q=t.width,he=t.height,oe=1,Ee=null,we=null,Z=new $e(0,0,Q,he),le=new $e(0,0,Q,he),ye=!1,ve=new Hi,fe=!1,E=!1,b=new Xe,D=new Xe,U=new w,R=new $e,L={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},S=!1;function P(){return N===null?oe:1}let z,ne,O,ee,$,ie,_e,ge,Te,Pe,je,He,Me,Ge,Je,at,xe,qe,Ke,An,di,Ot,Vt,on,k=n;function jn(M,G){return t.getContext(M,G)}try{let M={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",Sa,!1),t.addEventListener("webglcontextrestored",C,!1),t.addEventListener("webglcontextcreationerror",B,!1),k===null){let G="webgl2";if(k=jn(G,M),k===null)throw jn(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}function Xr(){z=new od(k),z.init(),Ot=new Sp(k,z),ne=new id(k,z,e,Ot),O=new xp(k,z),ne.reverseDepthBuffer&&u&&O.buffers.depth.setReversed(!0),ee=new hd(k),$=new hp,ie=new Mp(k,z,O,$,ne,Ot,ee),_e=new sd(x),ge=new ad(x),Te=new $u(k),Vt=new td(k,Te),Pe=new ld(k,Te,ee,Vt),je=new dd(k,Pe,Te,ee),Ke=new ud(k,ne,ie),at=new rd($),He=new cp(x,_e,ge,z,ne,Vt,at),Me=new wp(x,$),Ge=new dp,Je=new vp(z),qe=new ed(x,_e,ge,O,je,p,l),xe=new _p(x,je,ne),on=new Tp(k,ee,ne,O),An=new nd(k,z,ee),di=new cd(k,z,ee),ee.programs=He.programs,x.capabilities=ne,x.extensions=z,x.properties=$,x.renderLists=Ge,x.shadowMap=xe,x.state=O,x.info=ee}Xr();let gt=new cl(x,k);function Sa(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function C(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;let M=ee.autoReset,G=xe.enabled,Y=xe.autoUpdate,K=xe.needsUpdate,X=xe.type;Xr(),ee.autoReset=M,xe.enabled=G,xe.autoUpdate=Y,xe.needsUpdate=K,xe.type=X}function B(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function re(M){let G=M.target;G.removeEventListener("dispose",re),(function(Y){(function(K){let X=$.get(K).programs;X!==void 0&&(X.forEach((function(ae){He.releaseProgram(ae)})),K.isShaderMaterial&&He.releaseShaderCache(K))})(Y),$.remove(Y)})(G)}function Se(M,G,Y){M.transparent===!0&&M.side===2&&M.forceSinglePass===!1?(M.side=1,M.needsUpdate=!0,_t(M,G,Y),M.side=0,M.needsUpdate=!0,_t(M,G,Y),M.side=2):_t(M,G,Y)}this.xr=gt,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){let M=z.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=z.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(M){M!==void 0&&(oe=M,this.setSize(Q,he,!1))},this.getSize=function(M){return M.set(Q,he)},this.setSize=function(M,G,Y=!0){gt.isPresenting?console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting."):(Q=M,he=G,t.width=Math.floor(M*oe),t.height=Math.floor(G*oe),Y===!0&&(t.style.width=M+"px",t.style.height=G+"px"),this.setViewport(0,0,M,G))},this.getDrawingBufferSize=function(M){return M.set(Q*oe,he*oe).floor()},this.setDrawingBufferSize=function(M,G,Y){Q=M,he=G,oe=Y,t.width=Math.floor(M*Y),t.height=Math.floor(G*Y),this.setViewport(0,0,M,G)},this.getCurrentViewport=function(M){return M.copy(j)},this.getViewport=function(M){return M.copy(Z)},this.setViewport=function(M,G,Y,K){M.isVector4?Z.set(M.x,M.y,M.z,M.w):Z.set(M,G,Y,K),O.viewport(j.copy(Z).multiplyScalar(oe).round())},this.getScissor=function(M){return M.copy(le)},this.setScissor=function(M,G,Y,K){M.isVector4?le.set(M.x,M.y,M.z,M.w):le.set(M,G,Y,K),O.scissor(V.copy(le).multiplyScalar(oe).round())},this.getScissorTest=function(){return ye},this.setScissorTest=function(M){O.setScissorTest(ye=M)},this.setOpaqueSort=function(M){Ee=M},this.setTransparentSort=function(M){we=M},this.getClearColor=function(M){return M.copy(qe.getClearColor())},this.setClearColor=function(){qe.setClearColor.apply(qe,arguments)},this.getClearAlpha=function(){return qe.getClearAlpha()},this.setClearAlpha=function(){qe.setClearAlpha.apply(qe,arguments)},this.clear=function(M=!0,G=!0,Y=!0){let K=0;if(M){let X=!1;if(N!==null){let ae=N.texture.format;X=ae===ql||ae===jl||ae===Xl}if(X){let ae=N.texture.type,de=ae===Bn||ae===ai||ae===vr||ae===Oi||ae===Gl||ae===Vl,me=qe.getClearColor(),Ae=qe.getClearAlpha(),Ce=me.r,Oe=me.g,Re=me.b;de?(f[0]=Ce,f[1]=Oe,f[2]=Re,f[3]=Ae,k.clearBufferuiv(k.COLOR,0,f)):(y[0]=Ce,y[1]=Oe,y[2]=Re,y[3]=Ae,k.clearBufferiv(k.COLOR,0,y))}else K|=k.COLOR_BUFFER_BIT}G&&(K|=k.DEPTH_BUFFER_BIT),Y&&(K|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Sa,!1),t.removeEventListener("webglcontextrestored",C,!1),t.removeEventListener("webglcontextcreationerror",B,!1),Ge.dispose(),Je.dispose(),$.dispose(),_e.dispose(),ge.dispose(),je.dispose(),Vt.dispose(),on.dispose(),He.dispose(),gt.dispose(),gt.removeEventListener("sessionstart",ue),gt.removeEventListener("sessionend",se),Le.stop()},this.renderBufferDirect=function(M,G,Y,K,X,ae){G===null&&(G=L);let de=X.isMesh&&X.matrixWorld.determinant()<0,me=(function(Ve,xt,pt,De,Ne){xt.isScene!==!0&&(xt=L),ie.resetTextureUnits();let Ft=xt.fog,ba=De.isMeshStandardMaterial?xt.environment:null,$i=N===null?x.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:Yi,pi=(De.isMeshStandardMaterial?ge:_e).get(De.envMap||ba),Ea=De.vertexColors===!0&&!!pt.attributes.color&&pt.attributes.color.itemSize===4,wa=!!pt.attributes.tangent&&(!!De.normalMap||De.anisotropy>0),Ta=!!pt.morphAttributes.position,Rn=!!pt.morphAttributes.normal,Jh=!!pt.morphAttributes.color,ec=0;De.toneMapped&&(N!==null&&N.isXRRenderTarget!==!0||(ec=x.toneMapping));let tc=pt.morphAttributes.position||pt.morphAttributes.normal||pt.morphAttributes.color,Kh=tc!==void 0?tc.length:0,Ye=$.get(De),$h=g.state.lights;if(fe===!0&&(E===!0||Ve!==H)){let Wt=Ve===H&&De.id===F;at.setState(De,Ve,Wt)}let Zt=!1;De.version===Ye.__version?Ye.needsLights&&Ye.lightsStateVersion!==$h.state.version||Ye.outputColorSpace!==$i||Ne.isBatchedMesh&&Ye.batching===!1?Zt=!0:Ne.isBatchedMesh||Ye.batching!==!0?Ne.isBatchedMesh&&Ye.batchingColor===!0&&Ne.colorTexture===null||Ne.isBatchedMesh&&Ye.batchingColor===!1&&Ne.colorTexture!==null||Ne.isInstancedMesh&&Ye.instancing===!1?Zt=!0:Ne.isInstancedMesh||Ye.instancing!==!0?Ne.isSkinnedMesh&&Ye.skinning===!1?Zt=!0:Ne.isSkinnedMesh||Ye.skinning!==!0?Ne.isInstancedMesh&&Ye.instancingColor===!0&&Ne.instanceColor===null||Ne.isInstancedMesh&&Ye.instancingColor===!1&&Ne.instanceColor!==null||Ne.isInstancedMesh&&Ye.instancingMorph===!0&&Ne.morphTexture===null||Ne.isInstancedMesh&&Ye.instancingMorph===!1&&Ne.morphTexture!==null||Ye.envMap!==pi||De.fog===!0&&Ye.fog!==Ft?Zt=!0:Ye.numClippingPlanes===void 0||Ye.numClippingPlanes===at.numPlanes&&Ye.numIntersection===at.numIntersection?(Ye.vertexAlphas!==Ea||Ye.vertexTangents!==wa||Ye.morphTargets!==Ta||Ye.morphNormals!==Rn||Ye.morphColors!==Jh||Ye.toneMapping!==ec||Ye.morphTargetsCount!==Kh)&&(Zt=!0):Zt=!0:Zt=!0:Zt=!0:Zt=!0:(Zt=!0,Ye.__version=De.version);let Yn=Ye.currentProgram;Zt===!0&&(Yn=_t(De,xt,Ne));let nc=!1,Qi=!1,Aa=!1,mt=Yn.getUniforms(),Cn=Ye.uniforms;if(O.useProgram(Yn.program)&&(nc=!0,Qi=!0,Aa=!0),De.id!==F&&(F=De.id,Qi=!0),nc||H!==Ve){O.buffers.depth.getReversed()?(b.copy(Ve.projectionMatrix),(function(Zn){let ot=Zn.elements;ot[2]=.5*ot[2]+.5*ot[3],ot[6]=.5*ot[6]+.5*ot[7],ot[10]=.5*ot[10]+.5*ot[11],ot[14]=.5*ot[14]+.5*ot[15]})(b),(function(Zn){let ot=Zn.elements;ot[11]===-1?(ot[10]=-ot[10]-1,ot[14]=-ot[14]):(ot[10]=-ot[10],ot[14]=1-ot[14])})(b),mt.setValue(k,"projectionMatrix",b)):mt.setValue(k,"projectionMatrix",Ve.projectionMatrix),mt.setValue(k,"viewMatrix",Ve.matrixWorldInverse);let Wt=mt.map.cameraPosition;Wt!==void 0&&Wt.setValue(k,U.setFromMatrixPosition(Ve.matrixWorld)),ne.logarithmicDepthBuffer&&mt.setValue(k,"logDepthBufFC",2/(Math.log(Ve.far+1)/Math.LN2)),(De.isMeshPhongMaterial||De.isMeshToonMaterial||De.isMeshLambertMaterial||De.isMeshBasicMaterial||De.isMeshStandardMaterial||De.isShaderMaterial)&&mt.setValue(k,"isOrthographic",Ve.isOrthographicCamera===!0),H!==Ve&&(H=Ve,Qi=!0,Aa=!0)}if(Ne.isSkinnedMesh){mt.setOptional(k,Ne,"bindMatrix"),mt.setOptional(k,Ne,"bindMatrixInverse");let Wt=Ne.skeleton;Wt&&(Wt.boneTexture===null&&Wt.computeBoneTexture(),mt.setValue(k,"boneTexture",Wt.boneTexture,ie))}Ne.isBatchedMesh&&(mt.setOptional(k,Ne,"batchingTexture"),mt.setValue(k,"batchingTexture",Ne._matricesTexture,ie),mt.setOptional(k,Ne,"batchingIdTexture"),mt.setValue(k,"batchingIdTexture",Ne._indirectTexture,ie),mt.setOptional(k,Ne,"batchingColorTexture"),Ne._colorsTexture!==null&&mt.setValue(k,"batchingColorTexture",Ne._colorsTexture,ie));let Ra=pt.morphAttributes;Ra.position===void 0&&Ra.normal===void 0&&Ra.color===void 0||Ke.update(Ne,pt,Yn),(Qi||Ye.receiveShadow!==Ne.receiveShadow)&&(Ye.receiveShadow=Ne.receiveShadow,mt.setValue(k,"receiveShadow",Ne.receiveShadow)),De.isMeshGouraudMaterial&&De.envMap!==null&&(Cn.envMap.value=pi,Cn.flipEnvMap.value=pi.isCubeTexture&&pi.isRenderTargetTexture===!1?-1:1),De.isMeshStandardMaterial&&De.envMap===null&&xt.environment!==null&&(Cn.envMapIntensity.value=xt.environmentIntensity),Qi&&(mt.setValue(k,"toneMappingExposure",x.toneMappingExposure),Ye.needsLights&&(Jt=Aa,(ln=Cn).ambientLightColor.needsUpdate=Jt,ln.lightProbe.needsUpdate=Jt,ln.directionalLights.needsUpdate=Jt,ln.directionalLightShadows.needsUpdate=Jt,ln.pointLights.needsUpdate=Jt,ln.pointLightShadows.needsUpdate=Jt,ln.spotLights.needsUpdate=Jt,ln.spotLightShadows.needsUpdate=Jt,ln.rectAreaLights.needsUpdate=Jt,ln.hemisphereLights.needsUpdate=Jt),Ft&&De.fog===!0&&Me.refreshFogUniforms(Cn,Ft),Me.refreshMaterialUniforms(Cn,De,oe,he,g.state.transmissionRenderTarget[Ve.id]),Ui.upload(k,J(Ye),Cn,ie));var ln,Jt;if(De.isShaderMaterial&&De.uniformsNeedUpdate===!0&&(Ui.upload(k,J(Ye),Cn,ie),De.uniformsNeedUpdate=!1),De.isSpriteMaterial&&mt.setValue(k,"center",Ne.center),mt.setValue(k,"modelViewMatrix",Ne.modelViewMatrix),mt.setValue(k,"normalMatrix",Ne.normalMatrix),mt.setValue(k,"modelMatrix",Ne.matrixWorld),De.isShaderMaterial||De.isRawShaderMaterial){let Wt=De.uniformsGroups;for(let Zn=0,ot=Wt.length;Zn<ot;Zn++){let ic=Wt[Zn];on.update(ic,Yn),on.bind(ic,Yn)}}return Yn})(M,G,Y,K,X);O.setMaterial(K,de);let Ae=Y.index,Ce=1;if(K.wireframe===!0){if(Ae=Pe.getWireframeAttribute(Y),Ae===void 0)return;Ce=2}let Oe=Y.drawRange,Re=Y.attributes.position,Fe=Oe.start*Ce,st=(Oe.start+Oe.count)*Ce;ae!==null&&(Fe=Math.max(Fe,ae.start*Ce),st=Math.min(st,(ae.start+ae.count)*Ce)),Ae!==null?(Fe=Math.max(Fe,0),st=Math.min(st,Ae.count)):Re!=null&&(Fe=Math.max(Fe,0),st=Math.min(st,Re.count));let Qe=st-Fe;if(Qe<0||Qe===1/0)return;let dt;Vt.setup(X,K,me,Y,Ae);let nt=An;if(Ae!==null&&(dt=Te.get(Ae),nt=di,nt.setIndex(dt)),X.isMesh)K.wireframe===!0?(O.setLineWidth(K.wireframeLinewidth*P()),nt.setMode(k.LINES)):nt.setMode(k.TRIANGLES);else if(X.isLine){let Ve=K.linewidth;Ve===void 0&&(Ve=1),O.setLineWidth(Ve*P()),X.isLineSegments?nt.setMode(k.LINES):X.isLineLoop?nt.setMode(k.LINE_LOOP):nt.setMode(k.LINE_STRIP)}else X.isPoints?nt.setMode(k.POINTS):X.isSprite&&nt.setMode(k.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)nt.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(z.get("WEBGL_multi_draw"))nt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Ve=X._multiDrawStarts,xt=X._multiDrawCounts,pt=X._multiDrawCount,De=Ae?Te.get(Ae).bytesPerElement:1,Ne=$.get(K).currentProgram.getUniforms();for(let Ft=0;Ft<pt;Ft++)Ne.setValue(k,"_gl_DrawID",Ft),nt.render(Ve[Ft]/De,xt[Ft])}else if(X.isInstancedMesh)nt.renderInstances(Fe,Qe,X.count);else if(Y.isInstancedBufferGeometry){let Ve=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,xt=Math.min(Y.instanceCount,Ve);nt.renderInstances(Fe,Qe,xt)}else nt.render(Fe,Qe)},this.compile=function(M,G,Y=null){Y===null&&(Y=M),g=Je.get(Y),g.init(G),_.push(g),Y.traverseVisible((function(X){X.isLight&&X.layers.test(G.layers)&&(g.pushLight(X),X.castShadow&&g.pushShadow(X))})),M!==Y&&M.traverseVisible((function(X){X.isLight&&X.layers.test(G.layers)&&(g.pushLight(X),X.castShadow&&g.pushShadow(X))})),g.setupLights();let K=new Set;return M.traverse((function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let ae=X.material;if(ae)if(Array.isArray(ae))for(let de=0;de<ae.length;de++){let me=ae[de];Se(me,Y,X),K.add(me)}else Se(ae,Y,X),K.add(ae)})),_.pop(),g=null,K},this.compileAsync=function(M,G,Y=null){let K=this.compile(M,G,Y);return new Promise((X=>{function ae(){K.forEach((function(de){$.get(de).currentProgram.isReady()&&K.delete(de)})),K.size!==0?setTimeout(ae,10):X(M)}z.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)}))};let be=null;function ue(){Le.stop()}function se(){Le.start()}let Le=new Nh;function ut(M,G,Y,K){if(M.visible===!1)return;if(M.layers.test(G.layers)){if(M.isGroup)Y=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(G);else if(M.isLight)g.pushLight(M),M.castShadow&&g.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||ve.intersectsSprite(M)){K&&R.setFromMatrixPosition(M.matrixWorld).applyMatrix4(D);let ae=je.update(M),de=M.material;de.visible&&m.push(M,ae,de,Y,R.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||ve.intersectsObject(M))){let ae=je.update(M),de=M.material;if(K&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),R.copy(M.boundingSphere.center)):(ae.boundingSphere===null&&ae.computeBoundingSphere(),R.copy(ae.boundingSphere.center)),R.applyMatrix4(M.matrixWorld).applyMatrix4(D)),Array.isArray(de)){let me=ae.groups;for(let Ae=0,Ce=me.length;Ae<Ce;Ae++){let Oe=me[Ae],Re=de[Oe.materialIndex];Re&&Re.visible&&m.push(M,ae,Re,Y,R.z,Oe)}}else de.visible&&m.push(M,ae,de,Y,R.z,null)}}let X=M.children;for(let ae=0,de=X.length;ae<de;ae++)ut(X[ae],G,Y,K)}function et(M,G,Y,K){let X=M.opaque,ae=M.transmissive,de=M.transparent;g.setupLightsView(Y),fe===!0&&at.setGlobalState(x.clippingPlanes,Y),K&&O.viewport(j.copy(K)),X.length>0&&ht(X,G,Y),ae.length>0&&ht(ae,G,Y),de.length>0&&ht(de,G,Y),O.buffers.depth.setTest(!0),O.buffers.depth.setMask(!0),O.buffers.color.setMask(!0),O.setPolygonOffset(!1)}function tt(M,G,Y,K){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[K.id]===void 0&&(g.state.transmissionRenderTarget[K.id]=new En(1,1,{generateMipmaps:!0,type:z.has("EXT_color_buffer_half_float")||z.has("EXT_color_buffer_float")?Or:Bn,minFilter:Pi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));let X=g.state.transmissionRenderTarget[K.id],ae=K.viewport||j;X.setSize(ae.z,ae.w);let de=x.getRenderTarget();x.setRenderTarget(X),x.getClearColor(W),te=x.getClearAlpha(),te<1&&x.setClearColor(16777215,.5),x.clear(),S&&qe.render(Y);let me=x.toneMapping;x.toneMapping=0;let Ae=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),g.setupLightsView(K),fe===!0&&at.setGlobalState(x.clippingPlanes,K),ht(M,Y,K),ie.updateMultisampleRenderTarget(X),ie.updateRenderTargetMipmap(X),z.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let Oe=0,Re=G.length;Oe<Re;Oe++){let Fe=G[Oe],st=Fe.object,Qe=Fe.geometry,dt=Fe.material,nt=Fe.group;if(dt.side===2&&st.layers.test(K.layers)){let Ve=dt.side;dt.side=1,dt.needsUpdate=!0,vt(st,Y,K,Qe,dt,nt),dt.side=Ve,dt.needsUpdate=!0,Ce=!0}}Ce===!0&&(ie.updateMultisampleRenderTarget(X),ie.updateRenderTargetMipmap(X))}x.setRenderTarget(de),x.setClearColor(W,te),Ae!==void 0&&(K.viewport=Ae),x.toneMapping=me}function ht(M,G,Y){let K=G.isScene===!0?G.overrideMaterial:null;for(let X=0,ae=M.length;X<ae;X++){let de=M[X],me=de.object,Ae=de.geometry,Ce=K===null?de.material:K,Oe=de.group;me.layers.test(Y.layers)&&vt(me,G,Y,Ae,Ce,Oe)}}function vt(M,G,Y,K,X,ae){M.onBeforeRender(x,G,Y,K,X,ae),M.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),X.onBeforeRender(x,G,Y,K,M,ae),X.transparent===!0&&X.side===2&&X.forceSinglePass===!1?(X.side=1,X.needsUpdate=!0,x.renderBufferDirect(Y,G,K,X,M,ae),X.side=0,X.needsUpdate=!0,x.renderBufferDirect(Y,G,K,X,M,ae),X.side=2):x.renderBufferDirect(Y,G,K,X,M,ae),M.onAfterRender(x,G,Y,K,X,ae)}function _t(M,G,Y){G.isScene!==!0&&(G=L);let K=$.get(M),X=g.state.lights,ae=g.state.shadowsArray,de=X.state.version,me=He.getParameters(M,X.state,ae,G,Y),Ae=He.getProgramCacheKey(me),Ce=K.programs;K.environment=M.isMeshStandardMaterial?G.environment:null,K.fog=G.fog,K.envMap=(M.isMeshStandardMaterial?ge:_e).get(M.envMap||K.environment),K.envMapRotation=K.environment!==null&&M.envMap===null?G.environmentRotation:M.envMapRotation,Ce===void 0&&(M.addEventListener("dispose",re),Ce=new Map,K.programs=Ce);let Oe=Ce.get(Ae);if(Oe!==void 0){if(K.currentProgram===Oe&&K.lightsStateVersion===de)return qn(M,me),Oe}else me.uniforms=He.getUniforms(M),M.onBeforeCompile(me,x),Oe=He.acquireProgram(me,Ae),Ce.set(Ae,Oe),K.uniforms=me.uniforms;let Re=K.uniforms;return(M.isShaderMaterial||M.isRawShaderMaterial)&&M.clipping!==!0||(Re.clippingPlanes=at.uniform),qn(M,me),K.needsLights=(function(Fe){return Fe.isMeshLambertMaterial||Fe.isMeshToonMaterial||Fe.isMeshPhongMaterial||Fe.isMeshStandardMaterial||Fe.isShadowMaterial||Fe.isShaderMaterial&&Fe.lights===!0})(M),K.lightsStateVersion=de,K.needsLights&&(Re.ambientLightColor.value=X.state.ambient,Re.lightProbe.value=X.state.probe,Re.directionalLights.value=X.state.directional,Re.directionalLightShadows.value=X.state.directionalShadow,Re.spotLights.value=X.state.spot,Re.spotLightShadows.value=X.state.spotShadow,Re.rectAreaLights.value=X.state.rectArea,Re.ltc_1.value=X.state.rectAreaLTC1,Re.ltc_2.value=X.state.rectAreaLTC2,Re.pointLights.value=X.state.point,Re.pointLightShadows.value=X.state.pointShadow,Re.hemisphereLights.value=X.state.hemi,Re.directionalShadowMap.value=X.state.directionalShadowMap,Re.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Re.spotShadowMap.value=X.state.spotShadowMap,Re.spotLightMatrix.value=X.state.spotLightMatrix,Re.spotLightMap.value=X.state.spotLightMap,Re.pointShadowMap.value=X.state.pointShadowMap,Re.pointShadowMatrix.value=X.state.pointShadowMatrix),K.currentProgram=Oe,K.uniformsList=null,Oe}function J(M){if(M.uniformsList===null){let G=M.currentProgram.getUniforms();M.uniformsList=Ui.seqWithValue(G.seq,M.uniforms)}return M.uniformsList}function qn(M,G){let Y=$.get(M);Y.outputColorSpace=G.outputColorSpace,Y.batching=G.batching,Y.batchingColor=G.batchingColor,Y.instancing=G.instancing,Y.instancingColor=G.instancingColor,Y.instancingMorph=G.instancingMorph,Y.skinning=G.skinning,Y.morphTargets=G.morphTargets,Y.morphNormals=G.morphNormals,Y.morphColors=G.morphColors,Y.morphTargetsCount=G.morphTargetsCount,Y.numClippingPlanes=G.numClippingPlanes,Y.numIntersection=G.numClipIntersection,Y.vertexAlphas=G.vertexAlphas,Y.vertexTangents=G.vertexTangents,Y.toneMapping=G.toneMapping}Le.setAnimationLoop((function(M){be&&be(M)})),typeof self<"u"&&Le.setContext(self),this.setAnimationLoop=function(M){be=M,gt.setAnimationLoop(M),M===null?Le.stop():Le.start()},gt.addEventListener("sessionstart",ue),gt.addEventListener("sessionend",se),this.render=function(M,G){if(G!==void 0&&G.isCamera!==!0)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(T===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),gt.enabled===!0&&gt.isPresenting===!0&&(gt.cameraAutoUpdate===!0&&gt.updateCamera(G),G=gt.getCamera()),M.isScene===!0&&M.onBeforeRender(x,M,G,N),g=Je.get(M,_.length),g.init(G),_.push(g),D.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),ve.setFromProjectionMatrix(D),E=this.localClippingEnabled,fe=at.init(this.clippingPlanes,E),m=Ge.get(M,v.length),m.init(),v.push(m),gt.enabled===!0&&gt.isPresenting===!0){let ae=x.xr.getDepthSensingMesh();ae!==null&&ut(ae,G,-1/0,x.sortObjects)}ut(M,G,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(Ee,we),S=gt.enabled===!1||gt.isPresenting===!1||gt.hasDepthSensing()===!1,S&&qe.addToRenderList(m,M),this.info.render.frame++,fe===!0&&at.beginShadows();let Y=g.state.shadowsArray;xe.render(Y,M,G),fe===!0&&at.endShadows(),this.info.autoReset===!0&&this.info.reset();let K=m.opaque,X=m.transmissive;if(g.setupLights(),G.isArrayCamera){let ae=G.cameras;if(X.length>0)for(let de=0,me=ae.length;de<me;de++)tt(K,X,M,ae[de]);S&&qe.render(M);for(let de=0,me=ae.length;de<me;de++){let Ae=ae[de];et(m,M,Ae,Ae.viewport)}}else X.length>0&&tt(K,X,M,G),S&&qe.render(M),et(m,M,G);N!==null&&(ie.updateMultisampleRenderTarget(N),ie.updateRenderTargetMipmap(N)),M.isScene===!0&&M.onAfterRender(x,M,G),Vt.resetDefaultState(),F=-1,H=null,_.pop(),_.length>0?(g=_[_.length-1],fe===!0&&at.setGlobalState(x.clippingPlanes,g.state.camera)):g=null,v.pop(),m=v.length>0?v[v.length-1]:null},this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(M,G,Y){$.get(M.texture).__webglTexture=G,$.get(M.depthTexture).__webglTexture=Y;let K=$.get(M);K.__hasExternalTextures=!0,K.__autoAllocateDepthBuffer=Y===void 0,K.__autoAllocateDepthBuffer||z.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),K.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,G){let Y=$.get(M);Y.__webglFramebuffer=G,Y.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(M,G=0,Y=0){N=M,A=G,I=Y;let K=!0,X=null,ae=!1,de=!1;if(M){let me=$.get(M);if(me.__useDefaultFramebuffer!==void 0)O.bindFramebuffer(k.FRAMEBUFFER,null),K=!1;else if(me.__webglFramebuffer===void 0)ie.setupRenderTarget(M);else if(me.__hasExternalTextures)ie.rebindTextures(M,$.get(M.texture).__webglTexture,$.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Oe=M.depthTexture;if(me.__boundDepthTexture!==Oe){if(Oe!==null&&$.has(Oe)&&(M.width!==Oe.image.width||M.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ie.setupDepthRenderbuffer(M)}}let Ae=M.texture;(Ae.isData3DTexture||Ae.isDataArrayTexture||Ae.isCompressedArrayTexture)&&(de=!0);let Ce=$.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(X=Array.isArray(Ce[G])?Ce[G][Y]:Ce[G],ae=!0):X=M.samples>0&&ie.useMultisampledRTT(M)===!1?$.get(M).__webglMultisampledFramebuffer:Array.isArray(Ce)?Ce[Y]:Ce,j.copy(M.viewport),V.copy(M.scissor),q=M.scissorTest}else j.copy(Z).multiplyScalar(oe).floor(),V.copy(le).multiplyScalar(oe).floor(),q=ye;if(O.bindFramebuffer(k.FRAMEBUFFER,X)&&K&&O.drawBuffers(M,X),O.viewport(j),O.scissor(V),O.setScissorTest(q),ae){let me=$.get(M.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+G,me.__webglTexture,Y)}else if(de){let me=$.get(M.texture),Ae=G||0;k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,me.__webglTexture,Y||0,Ae)}F=-1},this.readRenderTargetPixels=function(M,G,Y,K,X,ae,de){if(!M||!M.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=$.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&de!==void 0&&(me=me[de]),me){O.bindFramebuffer(k.FRAMEBUFFER,me);try{let Ae=M.texture,Ce=Ae.format,Oe=Ae.type;if(!ne.textureFormatReadable(Ce))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!ne.textureTypeReadable(Oe))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");G>=0&&G<=M.width-K&&Y>=0&&Y<=M.height-X&&k.readPixels(G,Y,K,X,Ot.convert(Ce),Ot.convert(Oe),ae)}finally{let Ae=N!==null?$.get(N).__webglFramebuffer:null;O.bindFramebuffer(k.FRAMEBUFFER,Ae)}}},this.readRenderTargetPixelsAsync=async function(M,G,Y,K,X,ae,de){if(!M||!M.isWebGLRenderTarget)throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=$.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&de!==void 0&&(me=me[de]),me){let Ae=M.texture,Ce=Ae.format,Oe=Ae.type;if(!ne.textureFormatReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ne.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=M.width-K&&Y>=0&&Y<=M.height-X){O.bindFramebuffer(k.FRAMEBUFFER,me);let Re=k.createBuffer();k.bindBuffer(k.PIXEL_PACK_BUFFER,Re),k.bufferData(k.PIXEL_PACK_BUFFER,ae.byteLength,k.STREAM_READ),k.readPixels(G,Y,K,X,Ot.convert(Ce),Ot.convert(Oe),0);let Fe=N!==null?$.get(N).__webglFramebuffer:null;O.bindFramebuffer(k.FRAMEBUFFER,Fe);let st=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);return k.flush(),await(function(Qe,dt,nt){return new Promise((function(Ve,xt){setTimeout((function pt(){switch(Qe.clientWaitSync(dt,Qe.SYNC_FLUSH_COMMANDS_BIT,0)){case Qe.WAIT_FAILED:xt();break;case Qe.TIMEOUT_EXPIRED:setTimeout(pt,nt);break;default:Ve()}}),nt)}))})(k,st,4),k.bindBuffer(k.PIXEL_PACK_BUFFER,Re),k.getBufferSubData(k.PIXEL_PACK_BUFFER,0,ae),k.deleteBuffer(Re),k.deleteSync(st),ae}throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,G=null,Y=0){M.isTexture!==!0&&(dr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,M=arguments[1]);let K=Math.pow(2,-Y),X=Math.floor(M.image.width*K),ae=Math.floor(M.image.height*K),de=G!==null?G.x:0,me=G!==null?G.y:0;ie.setTexture2D(M,0),k.copyTexSubImage2D(k.TEXTURE_2D,Y,0,0,de,me,X,ae),O.unbindTexture()},this.copyTextureToTexture=function(M,G,Y=null,K=null,X=0){let ae,de,me,Ae,Ce,Oe,Re,Fe,st;M.isTexture!==!0&&(dr("WebGLRenderer: copyTextureToTexture function signature has changed."),K=arguments[0]||null,M=arguments[1],G=arguments[2],X=arguments[3]||0,Y=null);let Qe=M.isCompressedTexture?M.mipmaps[X]:M.image;Y!==null?(ae=Y.max.x-Y.min.x,de=Y.max.y-Y.min.y,me=Y.isBox3?Y.max.z-Y.min.z:1,Ae=Y.min.x,Ce=Y.min.y,Oe=Y.isBox3?Y.min.z:0):(ae=Qe.width,de=Qe.height,me=Qe.depth||1,Ae=0,Ce=0,Oe=0),K!==null?(Re=K.x,Fe=K.y,st=K.z):(Re=0,Fe=0,st=0);let dt=Ot.convert(G.format),nt=Ot.convert(G.type),Ve;G.isData3DTexture?(ie.setTexture3D(G,0),Ve=k.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(ie.setTexture2DArray(G,0),Ve=k.TEXTURE_2D_ARRAY):(ie.setTexture2D(G,0),Ve=k.TEXTURE_2D),k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,G.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,G.unpackAlignment);let xt=k.getParameter(k.UNPACK_ROW_LENGTH),pt=k.getParameter(k.UNPACK_IMAGE_HEIGHT),De=k.getParameter(k.UNPACK_SKIP_PIXELS),Ne=k.getParameter(k.UNPACK_SKIP_ROWS),Ft=k.getParameter(k.UNPACK_SKIP_IMAGES);k.pixelStorei(k.UNPACK_ROW_LENGTH,Qe.width),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,Qe.height),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Ae),k.pixelStorei(k.UNPACK_SKIP_ROWS,Ce),k.pixelStorei(k.UNPACK_SKIP_IMAGES,Oe);let ba=M.isDataArrayTexture||M.isData3DTexture,$i=G.isDataArrayTexture||G.isData3DTexture;if(M.isRenderTargetTexture||M.isDepthTexture){let pi=$.get(M),Ea=$.get(G),wa=$.get(pi.__renderTarget),Ta=$.get(Ea.__renderTarget);O.bindFramebuffer(k.READ_FRAMEBUFFER,wa.__webglFramebuffer),O.bindFramebuffer(k.DRAW_FRAMEBUFFER,Ta.__webglFramebuffer);for(let Rn=0;Rn<me;Rn++)ba&&k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,$.get(M).__webglTexture,X,Oe+Rn),M.isDepthTexture?($i&&k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,$.get(G).__webglTexture,X,st+Rn),k.blitFramebuffer(Ae,Ce,ae,de,Re,Fe,ae,de,k.DEPTH_BUFFER_BIT,k.NEAREST)):$i?k.copyTexSubImage3D(Ve,X,Re,Fe,st+Rn,Ae,Ce,ae,de):k.copyTexSubImage2D(Ve,X,Re,Fe,st+Rn,Ae,Ce,ae,de);O.bindFramebuffer(k.READ_FRAMEBUFFER,null),O.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else $i?M.isDataTexture||M.isData3DTexture?k.texSubImage3D(Ve,X,Re,Fe,st,ae,de,me,dt,nt,Qe.data):G.isCompressedArrayTexture?k.compressedTexSubImage3D(Ve,X,Re,Fe,st,ae,de,me,dt,Qe.data):k.texSubImage3D(Ve,X,Re,Fe,st,ae,de,me,dt,nt,Qe):M.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,X,Re,Fe,ae,de,dt,nt,Qe.data):M.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,X,Re,Fe,Qe.width,Qe.height,dt,Qe.data):k.texSubImage2D(k.TEXTURE_2D,X,Re,Fe,ae,de,dt,nt,Qe);k.pixelStorei(k.UNPACK_ROW_LENGTH,xt),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,pt),k.pixelStorei(k.UNPACK_SKIP_PIXELS,De),k.pixelStorei(k.UNPACK_SKIP_ROWS,Ne),k.pixelStorei(k.UNPACK_SKIP_IMAGES,Ft),X===0&&G.generateMipmaps&&k.generateMipmap(Ve),O.unbindTexture()},this.copyTextureToTexture3D=function(M,G,Y=null,K=null,X=0){return M.isTexture!==!0&&(dr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Y=arguments[0]||null,K=arguments[1]||null,M=arguments[2],G=arguments[3],X=arguments[4]||0),dr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,G,Y,K,X)},this.initRenderTarget=function(M){$.get(M).__webglFramebuffer===void 0&&ie.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?ie.setTextureCube(M,0):M.isData3DTexture?ie.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?ie.setTexture2DArray(M,0):ie.setTexture2D(M,0),O.unbindTexture()},this.resetState=function(){A=0,I=0,N=null,O.reset(),Vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Bi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}},Vs=class r{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Be(e),this.density=t}clone(){return new r(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Ws=class extends Tt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Kp=new w;var $p=new w,Qp=new w,em=new w,tm=new ce,nm=new ce,im=new Xe,rm=new w,sm=new w,am=new w,om=new ce,lm=new ce,cm=new ce;var hm=new w,um=new w;var dm=new w,pm=new $e,mm=new $e,fm=new w,gm=new Xe,vm=new w,_m=new sn,ym=new Xe,xm=new oi;var hl=class extends kt{constructor(e=null,t=1,n=1,i,s,a,o,l,c=1003,h=1003,d,u){super(null,a,o,l,c,h,i,s,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Mm=new Xe,Sm=new Xe;var Xs=class extends Mt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ri=new Xe,th=new Xe,ms=[],nh=new rn,Ap=new Xe,lr=new Pt,cr=new sn,js=class extends Pt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Xs(new Float32Array(16*n),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Ap)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new rn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ri),nh.copy(e.boundingBox).applyMatrix4(Ri),this.boundingBox.union(nh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new sn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ri),cr.copy(e.boundingSphere).applyMatrix4(Ri),this.boundingSphere.union(cr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,3*e)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,16*e)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=e*(n.length+1)+1;for(let a=0;a<n.length;a++)n[a]=i[s+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(lr.geometry=this.geometry,lr.material=this.material,lr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),cr.copy(this.boundingSphere),cr.applyMatrix4(n),e.ray.intersectsSphere(cr)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Ri),th.multiplyMatrices(n,Ri),lr.matrixWorld=th,lr.raycast(e,ms);for(let a=0,o=ms.length;a<o;a++){let l=ms[a];l.instanceId=s,l.object=this,t.push(l)}ms.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Xs(new Float32Array(3*this.instanceMatrix.count).fill(1),3)),t.toArray(this.instanceColor.array,3*e)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,16*e)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new hl(new Float32Array(i*this.count),i,this.count,Wl,hn));let s=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var ul=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,i){let s=this.pool,a=this.list;this.index>=s.length&&s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=n,o.index=i}reset(){this.list.length=0,this.index=0}},bm=new Xe,Em=new Be(1,1,1),wm=new Hi,Tm=new rn,Am=new sn,Rm=new w,Cm=new w,Pm=new w,Im=new ul,Lm=new Pt;var Vi=class extends wn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},qs=new w,Ys=new w,ih=new Xe,hr=new oi,fs=new sn,so=new w,rh=new w,Mr=class extends Tt{constructor(e=new rt,t=new Vi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)qs.fromBufferAttribute(t,i-1),Ys.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=qs.distanceTo(Ys);e.setAttribute("lineDistance",new Ue(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fs.copy(n.boundingSphere),fs.applyMatrix4(i),fs.radius+=s,e.ray.intersectsSphere(fs)===!1)return;ih.copy(i).invert(),hr.copy(e.ray).applyMatrix4(ih);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let u=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let f=u,y=p-1;f<y;f+=c){let m=h.getX(f),g=h.getX(f+1),v=gs(this,e,hr,l,m,g);v&&t.push(v)}if(this.isLineLoop){let f=h.getX(p-1),y=h.getX(u),m=gs(this,e,hr,l,f,y);m&&t.push(m)}}else{let u=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let f=u,y=p-1;f<y;f+=c){let m=gs(this,e,hr,l,f,f+1);m&&t.push(m)}if(this.isLineLoop){let f=gs(this,e,hr,l,p-1,u);f&&t.push(f)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}};function gs(r,e,t,n,i,s){let a=r.geometry.attributes.position;if(qs.fromBufferAttribute(a,i),Ys.fromBufferAttribute(a,s),t.distanceSqToSegment(qs,Ys,so,rh)>n)return;so.applyMatrix4(r.matrixWorld);let o=e.ray.origin.distanceTo(so);return o<e.near||o>e.far?void 0:{distance:o,point:rh.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}var sh=new w,ah=new w,Zs=class extends Mr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)sh.fromBufferAttribute(t,i),ah.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+sh.distanceTo(ah);e.setAttribute("lineDistance",new Ue(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Wi=class extends wn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Be(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},oh=new Xe,dl=new oi,vs=new sn,_s=new w,Sr=class extends Tt{constructor(e=new rt,t=new Wi){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vs.copy(n.boundingSphere),vs.applyMatrix4(i),vs.radius+=s,e.ray.intersectsSphere(vs)===!1)return;oh.copy(i).invert(),dl.copy(e.ray).applyMatrix4(oh);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null)for(let d=Math.max(0,a.start),u=Math.min(c.count,a.start+a.count);d<u;d++){let p=c.getX(d);_s.fromBufferAttribute(h,p),lh(_s,p,l,i,e,t,this)}else for(let d=Math.max(0,a.start),u=Math.min(h.count,a.start+a.count);d<u;d++)_s.fromBufferAttribute(h,d),lh(_s,d,l,i,e,t,this)}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}};function lh(r,e,t,n,i,s,a){let o=dl.distanceSqToPoint(r);if(o<t){let l=new w;dl.closestPointToPoint(r,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var qt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),i=0,s=n.length,a;a=t||e*n[s-1];let o,l=0,c=s-1;for(;l<=c;)if(i=Math.floor(l+(c-l)/2),o=n[i]-a,o<0)l=i+1;else{if(!(o>0)){c=i;break}c=i-1}if(i=c,n[i]===a)return i/(s-1);let h=n[i];return(i+(a-h)/(n[i+1]-h))/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);let a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new ce:new w);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new w,i=[],s=[],a=[],o=new w,l=new Xe;for(let p=0;p<=e;p++){let f=p/e;i[p]=this.getTangentAt(f,new w)}s[0]=new w,a[0]=new w;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),d=Math.abs(i[0].y),u=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(i[p-1],i[p]),o.length()>Number.EPSILON){o.normalize();let f=Math.acos(wt(i[p-1].dot(i[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(o,f))}a[p].crossVectors(i[p],s[p])}if(t===!0){let p=Math.acos(wt(s[0].dot(s[e]),-1,1));p/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(p=-p);for(let f=1;f<=e;f++)s[f].applyMatrix4(l.makeRotationAxis(i[f],p*f)),a[f].crossVectors(i[f],s[f])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},br=class extends qt{constructor(e=0,t=0,n=1,i=1,s=0,a=2*Math.PI,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ce){let n=t,i=2*Math.PI,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(s=a?0:i),this.aClockwise!==!0||a||(s===i?s=-i:s-=i);let o=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,p=c-this.aY;l=u*h-p*d+this.aX,c=u*d+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},pl=class extends br{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Zl(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,d){let u=(a-s)/c-(o-s)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,p*=h,i(a,o,u,p)},calc:function(s){let a=s*s;return r+e*s+t*a+n*(a*s)}}}var ys=new w,ao=new Zl,oo=new Zl,lo=new Zl,ml=class extends qt{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new w){let n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e,o,l,c=Math.floor(a),h=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/s)+1)*s:h===0&&c===s-1&&(c=s-2,h=1),this.closed||c>0?o=i[(c-1)%s]:(ys.subVectors(i[0],i[1]).add(i[0]),o=ys);let d=i[c%s],u=i[(c+1)%s];if(this.closed||c+2<s?l=i[(c+2)%s]:(ys.subVectors(i[s-1],i[s-2]).add(i[s-1]),l=ys),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,f=Math.pow(o.distanceToSquared(d),p),y=Math.pow(d.distanceToSquared(u),p),m=Math.pow(u.distanceToSquared(l),p);y<1e-4&&(y=1),f<1e-4&&(f=y),m<1e-4&&(m=y),ao.initNonuniformCatmullRom(o.x,d.x,u.x,l.x,f,y,m),oo.initNonuniformCatmullRom(o.y,d.y,u.y,l.y,f,y,m),lo.initNonuniformCatmullRom(o.z,d.z,u.z,l.z,f,y,m)}else this.curveType==="catmullrom"&&(ao.initCatmullRom(o.x,d.x,u.x,l.x,this.tension),oo.initCatmullRom(o.y,d.y,u.y,l.y,this.tension),lo.initCatmullRom(o.z,d.z,u.z,l.z,this.tension));return n.set(ao.calc(h),oo.calc(h),lo.calc(h)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new w().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ch(r,e,t,n,i){let s=.5*(n-e),a=.5*(i-t),o=r*r;return(2*t-2*n+s+a)*(r*o)+(-3*t+3*n-2*s-a)*o+s*r+t}function mr(r,e,t,n){return(function(i,s){let a=1-i;return a*a*s})(r,e)+(function(i,s){return 2*(1-i)*i*s})(r,t)+(function(i,s){return i*i*s})(r,n)}function fr(r,e,t,n,i){return(function(s,a){let o=1-s;return o*o*o*a})(r,e)+(function(s,a){let o=1-s;return 3*o*o*s*a})(r,t)+(function(s,a){return 3*(1-s)*s*s*a})(r,n)+(function(s,a){return s*s*s*a})(r,i)}var Js=class extends qt{constructor(e=new ce,t=new ce,n=new ce,i=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new ce){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(fr(e,i.x,s.x,a.x,o.x),fr(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},fl=class extends qt{constructor(e=new w,t=new w,n=new w,i=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new w){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(fr(e,i.x,s.x,a.x,o.x),fr(e,i.y,s.y,a.y,o.y),fr(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ks=class extends qt{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},gl=class extends qt{constructor(e=new w,t=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new w){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new w){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},$s=class extends qt{constructor(e=new ce,t=new ce,n=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ce){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(mr(e,i.x,s.x,a.x),mr(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qs=class extends qt{constructor(e=new w,t=new w,n=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new w){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(mr(e,i.x,s.x,a.x),mr(e,i.y,s.y,a.y),mr(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ea=class extends qt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){let n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],d=i[a>i.length-3?i.length-1:a+2];return n.set(ch(o,l.x,c.x,h.x,d.x),ch(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new ce().fromArray(i))}return this}},ta=Object.freeze({__proto__:null,ArcCurve:pl,CatmullRomCurve3:ml,CubicBezierCurve:Js,CubicBezierCurve3:fl,EllipseCurve:br,LineCurve:Ks,LineCurve3:gl,QuadraticBezierCurve:$s,QuadraticBezierCurve3:Qs,SplineCurve:ea}),vl=class extends qt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ta[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),s=0;for(;s<i.length;){if(i[s]>=n){let a=i[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,s=this.curves;i<s.length;i++){let a=s[i],o=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new ta[i.type]().fromJSON(i))}return this}},Er=class extends vl{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ks(this.currentPoint.clone(),new ce(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let s=new $s(this.currentPoint.clone(),new ce(e,t),new ce(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,a){let o=new Js(this.currentPoint.clone(),new ce(e,t),new ce(n,i),new ce(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ea(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,s,a),this}absarc(e,t,n,i,s,a){return this.absellipse(e,t,n,n,i,s,a),this}ellipse(e,t,n,i,s,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,s,a,o,l),this}absellipse(e,t,n,i,s,a,o,l){let c=new br(e,t,n,i,s,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},na=class r extends rt{constructor(e=[new ce(0,-.5),new ce(.5,0),new ce(0,.5)],t=12,n=0,i=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=wt(i,0,2*Math.PI);let s=[],a=[],o=[],l=[],c=[],h=1/t,d=new w,u=new ce,p=new w,f=new w,y=new w,m=0,g=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,g=e[v+1].y-e[v].y,p.x=1*g,p.y=-m,p.z=0*g,y.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[v+1].x-e[v].x,g=e[v+1].y-e[v].y,p.x=1*g,p.y=-m,p.z=0*g,f.copy(p),p.x+=y.x,p.y+=y.y,p.z+=y.z,p.normalize(),l.push(p.x,p.y,p.z),y.copy(f)}for(let v=0;v<=t;v++){let _=n+v*h*i,x=Math.sin(_),T=Math.cos(_);for(let A=0;A<=e.length-1;A++){d.x=e[A].x*x,d.y=e[A].y,d.z=e[A].x*T,a.push(d.x,d.y,d.z),u.x=v/t,u.y=A/(e.length-1),o.push(u.x,u.y);let I=l[3*A+0]*x,N=l[3*A+1],F=l[3*A+0]*T;c.push(I,N,F)}}for(let v=0;v<t;v++)for(let _=0;_<e.length-1;_++){let x=_+v*e.length,T=x,A=x+e.length,I=x+e.length+1,N=x+1;s.push(T,A,N),s.push(I,N,A)}this.setIndex(s),this.setAttribute("position",new Ue(a,3)),this.setAttribute("uv",new Ue(o,2)),this.setAttribute("normal",new Ue(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.points,e.segments,e.phiStart,e.phiLength)}},_l=class r extends na{constructor(e=1,t=1,n=4,i=8){let s=new Er;s.absarc(0,-t/2,e,1.5*Math.PI,0),s.absarc(0,t/2,e,0,.5*Math.PI),super(s.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:i}}static fromJSON(e){return new r(e.radius,e.length,e.capSegments,e.radialSegments)}},wr=class r extends rt{constructor(e=1,t=32,n=0,i=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let s=[],a=[],o=[],l=[],c=new w,h=new ce;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=t;d++,u+=3){let p=n+d/t*i;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/e+1)/2,h.y=(a[u+1]/e+1)/2,l.push(h.x,h.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new Ue(a,3)),this.setAttribute("normal",new Ue(o,3)),this.setAttribute("uv",new Ue(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Yt=class r extends rt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),s=Math.floor(s);let h=[],d=[],u=[],p=[],f=0,y=[],m=n/2,g=0;function v(_){let x=f,T=new ce,A=new w,I=0,N=_===!0?e:t,F=_===!0?1:-1;for(let j=1;j<=i;j++)d.push(0,m*F,0),u.push(0,F,0),p.push(.5,.5),f++;let H=f;for(let j=0;j<=i;j++){let V=j/i*l+o,q=Math.cos(V),W=Math.sin(V);A.x=N*W,A.y=m*F,A.z=N*q,d.push(A.x,A.y,A.z),u.push(0,F,0),T.x=.5*q+.5,T.y=.5*W*F+.5,p.push(T.x,T.y),f++}for(let j=0;j<i;j++){let V=x+j,q=H+j;_===!0?h.push(q,q+1,V):h.push(q+1,q,V),I+=3}c.addGroup(g,I,_===!0?1:2),g+=I}(function(){let _=new w,x=new w,T=0,A=(t-e)/n;for(let I=0;I<=s;I++){let N=[],F=I/s,H=F*(t-e)+e;for(let j=0;j<=i;j++){let V=j/i,q=V*l+o,W=Math.sin(q),te=Math.cos(q);x.x=H*W,x.y=-F*n+m,x.z=H*te,d.push(x.x,x.y,x.z),_.set(W,A,te).normalize(),u.push(_.x,_.y,_.z),p.push(V,1-F),N.push(f++)}y.push(N)}for(let I=0;I<i;I++)for(let N=0;N<s;N++){let F=y[N][I],H=y[N+1][I],j=y[N+1][I+1],V=y[N][I+1];(e>0||N!==0)&&(h.push(F,H,V),T+=3),(t>0||N!==s-1)&&(h.push(H,j,V),T+=3)}c.addGroup(g,T,0),g+=T})(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new Ue(d,3)),this.setAttribute("normal",new Ue(u,3)),this.setAttribute("uv",new Ue(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Xi=class r extends Yt{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,o=2*Math.PI){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},li=class r extends rt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let s=[],a=[];function o(u,p,f,y){let m=y+1,g=[];for(let v=0;v<=m;v++){g[v]=[];let _=u.clone().lerp(f,v/m),x=p.clone().lerp(f,v/m),T=m-v;for(let A=0;A<=T;A++)g[v][A]=A===0&&v===m?_:_.clone().lerp(x,A/T)}for(let v=0;v<m;v++)for(let _=0;_<2*(m-v)-1;_++){let x=Math.floor(_/2);_%2==0?(l(g[v][x+1]),l(g[v+1][x]),l(g[v][x])):(l(g[v][x+1]),l(g[v+1][x+1]),l(g[v+1][x]))}}function l(u){s.push(u.x,u.y,u.z)}function c(u,p){let f=3*u;p.x=e[f+0],p.y=e[f+1],p.z=e[f+2]}function h(u,p,f,y){y<0&&u.x===1&&(a[p]=u.x-1),f.x===0&&f.z===0&&(a[p]=y/2/Math.PI+.5)}function d(u){return Math.atan2(u.z,-u.x)}(function(u){let p=new w,f=new w,y=new w;for(let m=0;m<t.length;m+=3)c(t[m+0],p),c(t[m+1],f),c(t[m+2],y),o(p,f,y,u)})(i),(function(u){let p=new w;for(let f=0;f<s.length;f+=3)p.x=s[f+0],p.y=s[f+1],p.z=s[f+2],p.normalize().multiplyScalar(u),s[f+0]=p.x,s[f+1]=p.y,s[f+2]=p.z})(n),(function(){let u=new w;for(let f=0;f<s.length;f+=3){u.x=s[f+0],u.y=s[f+1],u.z=s[f+2];let y=d(u)/2/Math.PI+.5,m=(p=u,Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))/Math.PI+.5);a.push(y,1-m)}var p;(function(){let f=new w,y=new w,m=new w,g=new w,v=new ce,_=new ce,x=new ce;for(let T=0,A=0;T<s.length;T+=9,A+=6){f.set(s[T+0],s[T+1],s[T+2]),y.set(s[T+3],s[T+4],s[T+5]),m.set(s[T+6],s[T+7],s[T+8]),v.set(a[A+0],a[A+1]),_.set(a[A+2],a[A+3]),x.set(a[A+4],a[A+5]),g.copy(f).add(y).add(m).divideScalar(3);let I=d(g);h(v,A+0,f,I),h(_,A+2,y,I),h(x,A+4,m,I)}})(),(function(){for(let f=0;f<a.length;f+=6){let y=a[f+0],m=a[f+2],g=a[f+4],v=Math.max(y,m,g),_=Math.min(y,m,g);v>.9&&_<.1&&(y<.2&&(a[f+0]+=1),m<.2&&(a[f+2]+=1),g<.2&&(a[f+4]+=1))}})()})(),this.setAttribute("position",new Ue(s,3)),this.setAttribute("normal",new Ue(s.slice(),3)),this.setAttribute("uv",new Ue(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.details)}},yl=class r extends li{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},xs=new w,Ms=new w,co=new w,Ss=new On,xl=class extends rt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let i=Math.pow(10,4),s=Math.cos(Is*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},p=[];for(let f=0;f<l;f+=3){a?(c[0]=a.getX(f),c[1]=a.getX(f+1),c[2]=a.getX(f+2)):(c[0]=f,c[1]=f+1,c[2]=f+2);let{a:y,b:m,c:g}=Ss;if(y.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),g.fromBufferAttribute(o,c[2]),Ss.getNormal(co),d[0]=`${Math.round(y.x*i)},${Math.round(y.y*i)},${Math.round(y.z*i)}`,d[1]=`${Math.round(m.x*i)},${Math.round(m.y*i)},${Math.round(m.z*i)}`,d[2]=`${Math.round(g.x*i)},${Math.round(g.y*i)},${Math.round(g.z*i)}`,d[0]!==d[1]&&d[1]!==d[2]&&d[2]!==d[0])for(let v=0;v<3;v++){let _=(v+1)%3,x=d[v],T=d[_],A=Ss[h[v]],I=Ss[h[_]],N=`${x}_${T}`,F=`${T}_${x}`;F in u&&u[F]?(co.dot(u[F].normal)<=s&&(p.push(A.x,A.y,A.z),p.push(I.x,I.y,I.z)),u[F]=null):N in u||(u[N]={index0:c[v],index1:c[_],normal:co.clone()})}}for(let f in u)if(u[f]){let{index0:y,index1:m}=u[f];xs.fromBufferAttribute(o,y),Ms.fromBufferAttribute(o,m),p.push(xs.x,xs.y,xs.z),p.push(Ms.x,Ms.y,Ms.z)}this.setAttribute("position",new Ue(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},ji=class extends Er{constructor(e){super(e),this.uuid=Zi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Er().fromJSON(i))}return this}},Rp=function(r,e,t=2){let n=e&&e.length,i=n?e[0]*t:r.length,s=hh(r,0,i,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,l,c,h,d,u,p;if(n&&(s=(function(f,y,m,g){let v=[],_,x,T,A,I;for(_=0,x=y.length;_<x;_++)T=y[_]*g,A=_<x-1?y[_+1]*g:f.length,I=hh(f,T,A,g,!1),I===I.next&&(I.steiner=!0),v.push(Op(I));for(v.sort(Up),_=0;_<v.length;_++)m=Dp(v[_],m);return m})(r,e,s,t)),r.length>80*t){o=c=r[0],l=h=r[1];for(let f=t;f<i;f+=t)d=r[f],u=r[f+1],d<o&&(o=d),u<l&&(l=u),d>c&&(c=d),u>h&&(h=u);p=Math.max(c-o,h-l),p=p!==0?32767/p:0}return Tr(s,a,t,o,l,p,0),a};function hh(r,e,t,n,i){let s,a;if(i===(function(o,l,c,h){let d=0;for(let u=l,p=c-h;u<c;u+=h)d+=(o[p]-o[u])*(o[u+1]+o[p+1]),p=u;return d})(r,e,t,n)>0)for(s=e;s<t;s+=n)a=uh(s,r[s],r[s+1],a);else for(s=t-n;s>=e;s-=n)a=uh(s,r[s],r[s+1],a);return a&&ma(a,a.next)&&(Rr(a),a=a.next),a}function ci(r,e){if(!r)return r;e||(e=r);let t,n=r;do if(t=!1,n.steiner||!ma(n,n.next)&&ct(n.prev,n,n.next)!==0)n=n.next;else{if(Rr(n),n=e=n.prev,n===n.next)break;t=!0}while(t||n!==e);return e}function Tr(r,e,t,n,i,s,a){if(!r)return;!a&&s&&(function(h,d,u,p){let f=h;do f.z===0&&(f.z=Ml(f.x,f.y,d,u,p)),f.prevZ=f.prev,f.nextZ=f.next,f=f.next;while(f!==h);f.prevZ.nextZ=null,f.prevZ=null,(function(y){let m,g,v,_,x,T,A,I,N=1;do{for(g=y,y=null,x=null,T=0;g;){for(T++,v=g,A=0,m=0;m<N&&(A++,v=v.nextZ,v);m++);for(I=N;A>0||I>0&&v;)A!==0&&(I===0||!v||g.z<=v.z)?(_=g,g=g.nextZ,A--):(_=v,v=v.nextZ,I--),x?x.nextZ=_:y=_,_.prevZ=x,x=_;g=v}x.nextZ=null,N*=2}while(T>1)})(f)})(r,n,i,s);let o,l,c=r;for(;r.prev!==r.next;)if(o=r.prev,l=r.next,s?Pp(r,n,i,s):Cp(r))e.push(o.i/t|0),e.push(r.i/t|0),e.push(l.i/t|0),Rr(r),r=l.next,c=l.next;else if((r=l)===c){a?a===1?Tr(r=Ip(ci(r),e,t),e,t,n,i,s,2):a===2&&Lp(r,e,t,n,i,s):Tr(ci(r),e,t,n,i,s,1);break}}function Cp(r){let e=r.prev,t=r,n=r.next;if(ct(e,t,n)>=0)return!1;let i=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=i<s?i<a?i:a:s<a?s:a,d=o<l?o<c?o:c:l<c?l:c,u=i>s?i>a?i:a:s>a?s:a,p=o>l?o>c?o:c:l>c?l:c,f=n.next;for(;f!==e;){if(f.x>=h&&f.x<=u&&f.y>=d&&f.y<=p&&Ii(i,o,s,l,a,c,f.x,f.y)&&ct(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function Pp(r,e,t,n){let i=r.prev,s=r,a=r.next;if(ct(i,s,a)>=0)return!1;let o=i.x,l=s.x,c=a.x,h=i.y,d=s.y,u=a.y,p=o<l?o<c?o:c:l<c?l:c,f=h<d?h<u?h:u:d<u?d:u,y=o>l?o>c?o:c:l>c?l:c,m=h>d?h>u?h:u:d>u?d:u,g=Ml(p,f,e,t,n),v=Ml(y,m,e,t,n),_=r.prevZ,x=r.nextZ;for(;_&&_.z>=g&&x&&x.z<=v;){if(_.x>=p&&_.x<=y&&_.y>=f&&_.y<=m&&_!==i&&_!==a&&Ii(o,h,l,d,c,u,_.x,_.y)&&ct(_.prev,_,_.next)>=0||(_=_.prevZ,x.x>=p&&x.x<=y&&x.y>=f&&x.y<=m&&x!==i&&x!==a&&Ii(o,h,l,d,c,u,x.x,x.y)&&ct(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;_&&_.z>=g;){if(_.x>=p&&_.x<=y&&_.y>=f&&_.y<=m&&_!==i&&_!==a&&Ii(o,h,l,d,c,u,_.x,_.y)&&ct(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;x&&x.z<=v;){if(x.x>=p&&x.x<=y&&x.y>=f&&x.y<=m&&x!==i&&x!==a&&Ii(o,h,l,d,c,u,x.x,x.y)&&ct(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Ip(r,e,t){let n=r;do{let i=n.prev,s=n.next.next;!ma(i,s)&&kh(i,n,n.next,s)&&Ar(i,s)&&Ar(s,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),Rr(n),Rr(n.next),n=r=s),n=n.next}while(n!==r);return ci(n)}function Lp(r,e,t,n,i,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Fp(a,o)){let l=Hh(a,o);return a=ci(a,a.next),l=ci(l,l.next),Tr(a,e,t,n,i,s,0),void Tr(l,e,t,n,i,s,0)}o=o.next}a=a.next}while(a!==r)}function Up(r,e){return r.x-e.x}function Dp(r,e){let t=(function(i,s){let a,o=s,l=-1/0,c=i.x,h=i.y;do{if(h<=o.y&&h>=o.next.y&&o.next.y!==o.y){let m=o.x+(h-o.y)*(o.next.x-o.x)/(o.next.y-o.y);if(m<=c&&m>l&&(l=m,a=o.x<o.next.x?o:o.next,m===c))return a}o=o.next}while(o!==s);if(!a)return null;let d=a,u=a.x,p=a.y,f,y=1/0;o=a;do c>=o.x&&o.x>=u&&c!==o.x&&Ii(h<p?c:l,h,u,p,h<p?l:c,h,o.x,o.y)&&(f=Math.abs(h-o.y)/(c-o.x),Ar(o,i)&&(f<y||f===y&&(o.x>a.x||o.x===a.x&&Np(a,o)))&&(a=o,y=f)),o=o.next;while(o!==d);return a})(r,e);if(!t)return e;let n=Hh(t,r);return ci(n,n.next),ci(t,t.next)}function Np(r,e){return ct(r.prev,r,e.prev)<0&&ct(e.next,r,r.next)<0}function Ml(r,e,t,n,i){return(r=1431655765&((r=858993459&((r=252645135&((r=16711935&((r=(r-t)*i|0)|r<<8))|r<<4))|r<<2))|r<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-n)*i|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function Op(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function Ii(r,e,t,n,i,s,a,o){return(i-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(i-a)*(n-o)}function Fp(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!(function(t,n){let i=t;do{if(i.i!==t.i&&i.next.i!==t.i&&i.i!==n.i&&i.next.i!==n.i&&kh(i,i.next,t,n))return!0;i=i.next}while(i!==t);return!1})(r,e)&&(Ar(r,e)&&Ar(e,r)&&(function(t,n){let i=t,s=!1,a=(t.x+n.x)/2,o=(t.y+n.y)/2;do i.y>o!=i.next.y>o&&i.next.y!==i.y&&a<(i.next.x-i.x)*(o-i.y)/(i.next.y-i.y)+i.x&&(s=!s),i=i.next;while(i!==t);return s})(r,e)&&(ct(r.prev,r,e.prev)||ct(r,e.prev,e))||ma(r,e)&&ct(r.prev,r,r.next)>0&&ct(e.prev,e,e.next)>0)}function ct(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function ma(r,e){return r.x===e.x&&r.y===e.y}function kh(r,e,t,n){let i=Es(ct(r,e,t)),s=Es(ct(r,e,n)),a=Es(ct(t,n,r)),o=Es(ct(t,n,e));return i!==s&&a!==o||!(i!==0||!bs(r,t,e))||!(s!==0||!bs(r,n,e))||!(a!==0||!bs(t,r,n))||!(o!==0||!bs(t,e,n))}function bs(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Es(r){return r>0?1:r<0?-1:0}function Ar(r,e){return ct(r.prev,r,r.next)<0?ct(r,e,r.next)>=0&&ct(r,r.prev,e)>=0:ct(r,e,r.prev)<0||ct(r,r.next,e)<0}function Hh(r,e){let t=new Sl(r.i,r.x,r.y),n=new Sl(e.i,e.x,e.y),i=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function uh(r,e,t,n){let i=new Sl(r,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Rr(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function Sl(r,e,t){this.i=r,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}var Fn=class r{static area(e){let t=e.length,n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return .5*n}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let n=[],i=[],s=[];dh(e),ph(n,e);let a=e.length;t.forEach(dh);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,ph(n,t[l]);let o=Rp(n,i);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}};function dh(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function ph(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var Cr=class r extends rt{constructor(e=new ji([new ce(.5,.5),new ce(-.5,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],s=[];for(let o=0,l=e.length;o<l;o++)a(e[o]);function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled===void 0||t.bevelEnabled,p=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:p-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:Bp,_,x,T,A,I,N=!1;g&&(_=g.getSpacedPoints(h),N=!0,u=!1,x=g.computeFrenetFrames(h,!1),T=new w,A=new w,I=new w),u||(m=0,p=0,f=0,y=0);let F=o.extractPoints(c),H=F.shape,j=F.holes;if(!Fn.isClockWise(H)){H=H.reverse();for(let U=0,R=j.length;U<R;U++){let L=j[U];Fn.isClockWise(L)&&(j[U]=L.reverse())}}let V=Fn.triangulateShape(H,j),q=H;for(let U=0,R=j.length;U<R;U++){let L=j[U];H=H.concat(L)}function W(U,R,L){return R||console.error("THREE.ExtrudeGeometry: vec does not exist"),U.clone().addScaledVector(R,L)}let te=H.length,Q=V.length;function he(U,R,L){let S,P,z,ne=U.x-R.x,O=U.y-R.y,ee=L.x-U.x,$=L.y-U.y,ie=ne*ne+O*O,_e=ne*$-O*ee;if(Math.abs(_e)>Number.EPSILON){let ge=Math.sqrt(ie),Te=Math.sqrt(ee*ee+$*$),Pe=R.x-O/ge,je=R.y+ne/ge,He=((L.x-$/Te-Pe)*$-(L.y+ee/Te-je)*ee)/(ne*$-O*ee);S=Pe+ne*He-U.x,P=je+O*He-U.y;let Me=S*S+P*P;if(Me<=2)return new ce(S,P);z=Math.sqrt(Me/2)}else{let ge=!1;ne>Number.EPSILON?ee>Number.EPSILON&&(ge=!0):ne<-Number.EPSILON?ee<-Number.EPSILON&&(ge=!0):Math.sign(O)===Math.sign($)&&(ge=!0),ge?(S=-O,P=ne,z=Math.sqrt(ie)):(S=ne,P=O,z=Math.sqrt(ie/2))}return new ce(S/z,P/z)}let oe=[];for(let U=0,R=q.length,L=R-1,S=U+1;U<R;U++,L++,S++)L===R&&(L=0),S===R&&(S=0),oe[U]=he(q[U],q[L],q[S]);let Ee=[],we,Z=oe.concat();for(let U=0,R=j.length;U<R;U++){let L=j[U];we=[];for(let S=0,P=L.length,z=P-1,ne=S+1;S<P;S++,z++,ne++)z===P&&(z=0),ne===P&&(ne=0),we[S]=he(L[S],L[z],L[ne]);Ee.push(we),Z=Z.concat(we)}for(let U=0;U<m;U++){let R=U/m,L=p*Math.cos(R*Math.PI/2),S=f*Math.sin(R*Math.PI/2)+y;for(let P=0,z=q.length;P<z;P++){let ne=W(q[P],oe[P],S);ve(ne.x,ne.y,-L)}for(let P=0,z=j.length;P<z;P++){let ne=j[P];we=Ee[P];for(let O=0,ee=ne.length;O<ee;O++){let $=W(ne[O],we[O],S);ve($.x,$.y,-L)}}}let le=f+y;for(let U=0;U<te;U++){let R=u?W(H[U],Z[U],le):H[U];N?(A.copy(x.normals[0]).multiplyScalar(R.x),T.copy(x.binormals[0]).multiplyScalar(R.y),I.copy(_[0]).add(A).add(T),ve(I.x,I.y,I.z)):ve(R.x,R.y,0)}for(let U=1;U<=h;U++)for(let R=0;R<te;R++){let L=u?W(H[R],Z[R],le):H[R];N?(A.copy(x.normals[U]).multiplyScalar(L.x),T.copy(x.binormals[U]).multiplyScalar(L.y),I.copy(_[U]).add(A).add(T),ve(I.x,I.y,I.z)):ve(L.x,L.y,d/h*U)}for(let U=m-1;U>=0;U--){let R=U/m,L=p*Math.cos(R*Math.PI/2),S=f*Math.sin(R*Math.PI/2)+y;for(let P=0,z=q.length;P<z;P++){let ne=W(q[P],oe[P],S);ve(ne.x,ne.y,d+L)}for(let P=0,z=j.length;P<z;P++){let ne=j[P];we=Ee[P];for(let O=0,ee=ne.length;O<ee;O++){let $=W(ne[O],we[O],S);N?ve($.x,$.y+_[h-1].y,_[h-1].x+L):ve($.x,$.y,d+L)}}}function ye(U,R){let L=U.length;for(;--L>=0;){let S=L,P=L-1;P<0&&(P=U.length-1);for(let z=0,ne=h+2*m;z<ne;z++){let O=te*z,ee=te*(z+1);E(R+S+O,R+P+O,R+P+ee,R+S+ee)}}}function ve(U,R,L){l.push(U),l.push(R),l.push(L)}function fe(U,R,L){b(U),b(R),b(L);let S=i.length/3,P=v.generateTopUV(n,i,S-3,S-2,S-1);D(P[0]),D(P[1]),D(P[2])}function E(U,R,L,S){b(U),b(R),b(S),b(R),b(L),b(S);let P=i.length/3,z=v.generateSideWallUV(n,i,P-6,P-3,P-2,P-1);D(z[0]),D(z[1]),D(z[3]),D(z[1]),D(z[2]),D(z[3])}function b(U){i.push(l[3*U+0]),i.push(l[3*U+1]),i.push(l[3*U+2])}function D(U){s.push(U.x),s.push(U.y)}(function(){let U=i.length/3;if(u){let R=0,L=te*R;for(let S=0;S<Q;S++){let P=V[S];fe(P[2]+L,P[1]+L,P[0]+L)}R=h+2*m,L=te*R;for(let S=0;S<Q;S++){let P=V[S];fe(P[0]+L,P[1]+L,P[2]+L)}}else{for(let R=0;R<Q;R++){let L=V[R];fe(L[2],L[1],L[0])}for(let R=0;R<Q;R++){let L=V[R];fe(L[0]+te*h,L[1]+te*h,L[2]+te*h)}}n.addGroup(U,i.length/3-U,0)})(),(function(){let U=i.length/3,R=0;ye(q,R),R+=q.length;for(let L=0,S=j.length;L<S;L++){let P=j[L];ye(P,R),R+=P.length}n.addGroup(U,i.length/3-U,1)})()}this.setAttribute("position",new Ue(i,3)),this.setAttribute("uv",new Ue(s,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n,i){if(i.shapes=[],Array.isArray(t))for(let s=0,a=t.length;s<a;s++){let o=t[s];i.shapes.push(o.uuid)}else i.shapes.push(t.uuid);return i.options=Object.assign({},n),n.extrudePath!==void 0&&(i.options.extrudePath=n.extrudePath.toJSON()),i})(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];n.push(o)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new ta[i.type]().fromJSON(i)),new r(n,e.options)}},Bp={generateTopUV:function(r,e,t,n,i){let s=e[3*t],a=e[3*t+1],o=e[3*n],l=e[3*n+1],c=e[3*i],h=e[3*i+1];return[new ce(s,a),new ce(o,l),new ce(c,h)]},generateSideWallUV:function(r,e,t,n,i,s){let a=e[3*t],o=e[3*t+1],l=e[3*t+2],c=e[3*n],h=e[3*n+1],d=e[3*n+2],u=e[3*i],p=e[3*i+1],f=e[3*i+2],y=e[3*s],m=e[3*s+1],g=e[3*s+2];return Math.abs(o-h)<Math.abs(a-c)?[new ce(a,1-l),new ce(c,1-d),new ce(u,1-f),new ce(y,1-g)]:[new ce(o,1-l),new ce(h,1-d),new ce(p,1-f),new ce(m,1-g)]}},Pr=class r extends li{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2;super([-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},bl=class r extends li{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Ir=class r extends rt{constructor(e=.5,t=1,n=32,i=1,s=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n);let o=[],l=[],c=[],h=[],d=e,u=(t-e)/(i=Math.max(1,i)),p=new w,f=new ce;for(let y=0;y<=i;y++){for(let m=0;m<=n;m++){let g=s+m/n*a;p.x=d*Math.cos(g),p.y=d*Math.sin(g),l.push(p.x,p.y,p.z),c.push(0,0,1),f.x=(p.x/t+1)/2,f.y=(p.y/t+1)/2,h.push(f.x,f.y)}d+=u}for(let y=0;y<i;y++){let m=y*(n+1);for(let g=0;g<n;g++){let v=g+m,_=v,x=v+n+1,T=v+n+2,A=v+1;o.push(_,x,A),o.push(x,T,A)}}this.setIndex(o),this.setAttribute("position",new Ue(l,3)),this.setAttribute("normal",new Ue(c,3)),this.setAttribute("uv",new Ue(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},El=class r extends rt{constructor(e=new ji([new ce(0,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],s=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(o,l,h),o+=l,l=0;function c(h){let d=i.length/3,u=h.extractPoints(t),p=u.shape,f=u.holes;Fn.isClockWise(p)===!1&&(p=p.reverse());for(let m=0,g=f.length;m<g;m++){let v=f[m];Fn.isClockWise(v)===!0&&(f[m]=v.reverse())}let y=Fn.triangulateShape(p,f);for(let m=0,g=f.length;m<g;m++){let v=f[m];p=p.concat(v)}for(let m=0,g=p.length;m<g;m++){let v=p[m];i.push(v.x,v.y,0),s.push(0,0,1),a.push(v.x,v.y)}for(let m=0,g=y.length;m<g;m++){let v=y[m],_=v[0]+d,x=v[1]+d,T=v[2]+d;n.push(_,x,T),l+=3}}this.setIndex(n),this.setAttribute("position",new Ue(i,3)),this.setAttribute("normal",new Ue(s,3)),this.setAttribute("uv",new Ue(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n){if(n.shapes=[],Array.isArray(t))for(let i=0,s=t.length;i<s;i++){let a=t[i];n.shapes.push(a.uuid)}else n.shapes.push(t.uuid);return n})(this.parameters.shapes,e)}static fromJSON(e,t){let n=[];for(let i=0,s=e.shapes.length;i<s;i++){let a=t[e.shapes[i]];n.push(a)}return new r(n,e.curveSegments)}},Lr=class r extends rt{constructor(e=1,t=32,n=16,i=0,s=2*Math.PI,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new w,u=new w,p=[],f=[],y=[],m=[];for(let g=0;g<=n;g++){let v=[],_=g/n,x=0;g===0&&a===0?x=.5/t:g===n&&l===Math.PI&&(x=-.5/t);for(let T=0;T<=t;T++){let A=T/t;d.x=-e*Math.cos(i+A*s)*Math.sin(a+_*o),d.y=e*Math.cos(a+_*o),d.z=e*Math.sin(i+A*s)*Math.sin(a+_*o),f.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),m.push(A+x,1-_),v.push(c++)}h.push(v)}for(let g=0;g<n;g++)for(let v=0;v<t;v++){let _=h[g][v+1],x=h[g][v],T=h[g+1][v],A=h[g+1][v+1];(g!==0||a>0)&&p.push(_,x,A),(g!==n-1||l<Math.PI)&&p.push(x,T,A)}this.setIndex(p),this.setAttribute("position",new Ue(f,3)),this.setAttribute("normal",new Ue(y,3)),this.setAttribute("uv",new Ue(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},wl=class r extends li{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Ur=class r extends rt{constructor(e=1,t=.4,n=12,i=48,s=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);let a=[],o=[],l=[],c=[],h=new w,d=new w,u=new w;for(let p=0;p<=n;p++)for(let f=0;f<=i;f++){let y=f/i*s,m=p/n*Math.PI*2;d.x=(e+t*Math.cos(m))*Math.cos(y),d.y=(e+t*Math.cos(m))*Math.sin(y),d.z=t*Math.sin(m),o.push(d.x,d.y,d.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),u.subVectors(d,h).normalize(),l.push(u.x,u.y,u.z),c.push(f/i),c.push(p/n)}for(let p=1;p<=n;p++)for(let f=1;f<=i;f++){let y=(i+1)*p+f-1,m=(i+1)*(p-1)+f-1,g=(i+1)*(p-1)+f,v=(i+1)*p+f;a.push(y,m,v),a.push(m,g,v)}this.setIndex(a),this.setAttribute("position",new Ue(o,3)),this.setAttribute("normal",new Ue(l,3)),this.setAttribute("uv",new Ue(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},Tl=class r extends rt{constructor(e=1,t=.4,n=64,i=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:s,q:a},n=Math.floor(n),i=Math.floor(i);let o=[],l=[],c=[],h=[],d=new w,u=new w,p=new w,f=new w,y=new w,m=new w,g=new w;for(let _=0;_<=n;++_){let x=_/n*s*Math.PI*2;v(x,s,a,e,p),v(x+.01,s,a,e,f),m.subVectors(f,p),g.addVectors(f,p),y.crossVectors(m,g),g.crossVectors(y,m),y.normalize(),g.normalize();for(let T=0;T<=i;++T){let A=T/i*Math.PI*2,I=-t*Math.cos(A),N=t*Math.sin(A);d.x=p.x+(I*g.x+N*y.x),d.y=p.y+(I*g.y+N*y.y),d.z=p.z+(I*g.z+N*y.z),l.push(d.x,d.y,d.z),u.subVectors(d,p).normalize(),c.push(u.x,u.y,u.z),h.push(_/n),h.push(T/i)}}for(let _=1;_<=n;_++)for(let x=1;x<=i;x++){let T=(i+1)*(_-1)+(x-1),A=(i+1)*_+(x-1),I=(i+1)*_+x,N=(i+1)*(_-1)+x;o.push(T,A,N),o.push(A,I,N)}function v(_,x,T,A,I){let N=Math.cos(_),F=Math.sin(_),H=T/x*_,j=Math.cos(H);I.x=A*(2+j)*.5*N,I.y=A*(2+j)*F*.5,I.z=A*Math.sin(H)*.5}this.setIndex(o),this.setAttribute("position",new Ue(l,3)),this.setAttribute("normal",new Ue(c,3)),this.setAttribute("uv",new Ue(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},Al=class r extends rt{constructor(e=new Qs(new w(-1,-1,0),new w(-1,1,0),new w(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};let a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new w,l=new w,c=new ce,h=new w,d=[],u=[],p=[],f=[];function y(m){h=e.getPointAt(m/t,h);let g=a.normals[m],v=a.binormals[m];for(let _=0;_<=i;_++){let x=_/i*Math.PI*2,T=Math.sin(x),A=-Math.cos(x);l.x=A*g.x+T*v.x,l.y=A*g.y+T*v.y,l.z=A*g.z+T*v.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,d.push(o.x,o.y,o.z)}}(function(){for(let m=0;m<t;m++)y(m);y(s===!1?t:0),(function(){for(let m=0;m<=t;m++)for(let g=0;g<=i;g++)c.x=m/t,c.y=g/i,p.push(c.x,c.y)})(),(function(){for(let m=1;m<=t;m++)for(let g=1;g<=i;g++){let v=(i+1)*(m-1)+(g-1),_=(i+1)*m+(g-1),x=(i+1)*m+g,T=(i+1)*(m-1)+g;f.push(v,_,T),f.push(_,x,T)}})()})(),this.setIndex(f),this.setAttribute("position",new Ue(d,3)),this.setAttribute("normal",new Ue(u,3)),this.setAttribute("uv",new Ue(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new r(new ta[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},Rl=class extends rt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,i=new w,s=new w;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let d=l[c],u=d.start;for(let p=u,f=u+d.count;p<f;p+=3)for(let y=0;y<3;y++){let m=o.getX(p+y),g=o.getX(p+(y+1)%3);i.fromBufferAttribute(a,m),s.fromBufferAttribute(a,g),mh(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,d=3*o+(c+1)%3;i.fromBufferAttribute(a,h),s.fromBufferAttribute(a,d),mh(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Ue(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function mh(r,e,t){let n=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,i=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(n)!==!0&&t.has(i)!==!0&&(t.add(n),t.add(i),!0)}var Um=Object.freeze({__proto__:null,BoxGeometry:kn,CapsuleGeometry:_l,CircleGeometry:wr,ConeGeometry:Xi,CylinderGeometry:Yt,DodecahedronGeometry:yl,EdgesGeometry:xl,ExtrudeGeometry:Cr,IcosahedronGeometry:Pr,LatheGeometry:na,OctahedronGeometry:bl,PlaneGeometry:Hn,PolyhedronGeometry:li,RingGeometry:Ir,ShapeGeometry:El,SphereGeometry:Lr,TetrahedronGeometry:wl,TorusGeometry:Ur,TorusKnotGeometry:Tl,TubeGeometry:Al,WireframeGeometry:Rl});var ia=class extends wn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function ws(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function zp(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}var qi=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];t:{e:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break e}a=t.length;break n}if(e>=s)break t;{let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break e}a=n,n=0}}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Cl=class extends qi{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ac,endingEnd:ac}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case oc:s=e,o=2*t-n;break;case lc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case oc:a=e,l=2*n-t;break;case lc:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}let c=.5*(n-t),h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,f=(n-t)/(i-t),y=f*f,m=y*f,g=-u*m+2*u*y-u*f,v=(1+u)*m+(-1.5-2*u)*y+(-.5+u)*f+1,_=(-1-p)*m+(1.5+p)*y+.5*f,x=p*m-p*y;for(let T=0;T!==o;++T)s[T]=g*a[h+T]+v*a[c+T]+_*a[l+T]+x*a[d+T];return s}},Pl=class extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),d=1-h;for(let u=0;u!==o;++u)s[u]=a[c+u]*d+a[l+u]*h;return s}},Il=class extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},nn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ws(t,this.TimeBufferType),this.values=ws(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ws(e.times,Array),values:ws(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Il(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Cl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ls:t=this.InterpolantFactoryMethodDiscrete;break;case jo:t=this.InterpolantFactoryMethodLinear;break;case Ia:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(n);this.setInterpolation(this.DefaultInterpolation)}return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ls;case this.InterpolantFactoryMethodLinear:return jo;case this.InterpolantFactoryMethodSmooth:return Ia}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!=0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&zp(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Ia,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o];if(c!==e[o+1]&&(o!==1||c!==e[0]))if(i)l=!0;else{let h=o*n,d=h-n,u=h+n;for(let p=0;p!==n;++p){let f=t[h+p];if(f!==t[d+p]||f!==t[u+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,d=a*n;for(let u=0;u!==n;++u)t[d+u]=t[h+u]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=new this.constructor(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}};nn.prototype.TimeBufferType=Float32Array,nn.prototype.ValueBufferType=Float32Array,nn.prototype.DefaultInterpolation=jo;var ri=class extends nn{constructor(e,t,n){super(e,t,n)}};ri.prototype.ValueTypeName="bool",ri.prototype.ValueBufferType=Array,ri.prototype.DefaultInterpolation=Ls,ri.prototype.InterpolantFactoryMethodLinear=void 0,ri.prototype.InterpolantFactoryMethodSmooth=void 0;var Ll=class extends nn{};Ll.prototype.ValueTypeName="color";var Ul=class extends nn{};Ul.prototype.ValueTypeName="number";var Dl=class extends qi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t),c=e*o;for(let h=c+o;c!==h;c+=4)dn.slerpFlat(s,0,a,c-o,a,c,l);return s}},ra=class extends nn{InterpolantFactoryMethodLinear(e){return new Dl(this.times,this.values,this.getValueSize(),e)}};ra.prototype.ValueTypeName="quaternion",ra.prototype.InterpolantFactoryMethodSmooth=void 0;var si=class extends nn{constructor(e,t,n){super(e,t,n)}};si.prototype.ValueTypeName="string",si.prototype.ValueBufferType=Array,si.prototype.DefaultInterpolation=Ls,si.prototype.InterpolantFactoryMethodLinear=void 0,si.prototype.InterpolantFactoryMethodSmooth=void 0;var Nl=class extends nn{};Nl.prototype.ValueTypeName="vector";var Ol=class{constructor(e,t,n){let i=this,s,a=!1,o=0,l=0,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){l++,a===!1&&i.onStart!==void 0&&i.onStart(h,o,l),a=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,l),o===l&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return s?s(h):h},this.setURLModifier=function(h){return s=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],f=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return f}return null}}},kp=new Ol,Fl=class{constructor(e){this.manager=e!==void 0?e:kp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise((function(i,s){n.load(e,i,t,s)}))}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Fl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Dr=class extends Tt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},sa=class extends Dr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},ho=new Xe,fh=new w,gh=new w,aa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.map=null,this.mapPass=null,this.matrix=new Xe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Hi,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;fh.setFromMatrixPosition(e.matrixWorld),t.position.copy(fh),gh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(gh),t.updateMatrixWorld(),ho.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ho),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ho)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var vh=new Xe,ur=new w,uo=new w,Bl=class extends aa{constructor(){super(new Nt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ce(4,2),this._viewportCount=6,this._viewports=[new $e(2,1,1,1),new $e(0,1,1,1),new $e(3,1,1,1),new $e(1,1,1,1),new $e(3,0,1,1),new $e(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),ur.setFromMatrixPosition(e.matrixWorld),n.position.copy(ur),uo.copy(n.position),uo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(uo),n.updateMatrixWorld(),i.makeTranslation(-ur.x,-ur.y,-ur.z),vh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vh)}},oa=class extends Dr{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Bl}get power(){return 4*this.intensity*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},zl=class extends aa{constructor(){super(new Gi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Nr=class extends Dr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.shadow=new zl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Dm=new Xe,Nm=new Xe,Om=new Xe;var Fm=new w,Bm=new dn,zm=new w,km=new w;var Hm=new w,Gm=new dn,Vm=new w,Wm=new w;var Jl="\\[\\]\\.:\\/",Hp=new RegExp("["+Jl+"]","g"),po="[^"+Jl+"]",Gp="[^"+Jl.replace("\\.","")+"]",Vp=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",po)+/(WCOD+)?/.source.replace("WCOD",Gp)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",po)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",po)+"$"),Wp=["material","materials","bones","map"],lt=class r{constructor(e,t,n){this.path=t,this.parsedPath=n||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,n):new r(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Hp,"")}static parseTrackName(e){let t=Vp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);Wp.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[n]===void 0)return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[n]}if(c!==void 0){if(e[c]===void 0)return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[c]}}let a=e[i];if(a===void 0){let c=t.nodeName;return void console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e)}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};lt.Composite=class{constructor(r,e,t){let n=t||lt.parseTrackName(e);this._targetGroup=r,this._bindings=r.subscribe_(e,n)}getValue(r,e){this.bind();let t=this._targetGroup.nCachedObjects_,n=this._bindings[t];n!==void 0&&n.getValue(r,e)}setValue(r,e){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].setValue(r,e)}bind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].bind()}unbind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].unbind()}},lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},lt.prototype.GetterByBindingType=[lt.prototype._getValue_direct,lt.prototype._getValue_array,lt.prototype._getValue_arrayElement,lt.prototype._getValue_toArray],lt.prototype.SetterByBindingTypeAndVersioning=[[lt.prototype._setValue_direct,lt.prototype._setValue_direct_setNeedsUpdate,lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_array,lt.prototype._setValue_array_setNeedsUpdate,lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_arrayElement,lt.prototype._setValue_arrayElement_setNeedsUpdate,lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_fromArray,lt.prototype._setValue_fromArray_setNeedsUpdate,lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Xm=new Float32Array(1);var _h=new Xe,la=class{constructor(e,t,n=0,i=1/0){this.ray=new oi(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new yr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return _h.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(_h),this}intersectObject(e,t=!0,n=[]){return kl(e,this,n,t),n.sort(yh),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)kl(e[i],this,n,t);return n.sort(yh),n}};function yh(r,e){return r.distance-e.distance}function kl(r,e,t,n){let i=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){let s=r.children;for(let a=0,o=s.length;a<o;a++)kl(s[a],e,t,!0)}}var jm=new ce;var qm=new w,Ym=new w;var Zm=new w;var Jm=new w,Km=new Xe,$m=new Xe;var Qm=new w,ef=new Be,tf=new Be;var nf=new w,rf=new w,sf=new w;var af=new w,of=new xr;var lf=new rn;var cf=new w;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var Ht=Math.PI*2,Fr=[14989680,10345430,12366061],Ki=(r,e,t)=>Math.max(e,Math.min(t,r)),Kl=r=>(r=Ki(r,0,1),r*r*(3-2*r));function Gh(r){let e=new Gs({canvas:r,antialias:!0,alpha:!1,powerPreference:"high-performance"});e.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),e.outputColorSpace=Dt,e.toneMapping=Mh,e.toneMappingExposure=1.26,e.shadowMap.enabled=!0,e.shadowMap.type=xh;let t=new Ws;t.background=new Be(725530),t.fog=new Vs(725530,.019);let n=new Gi(-16,16,11,-11,.1,110);n.position.set(12,16,14),n.lookAt(0,.25,0);let i=new la,s=new ce,a=new en(new w(0,1,0),0),o=new w,l=new Map,c=new Set,h=[],d=[],u={},p=1,f=1,y=null,m=null;function g(C,B){return l.has(C)||l.set(C,B()),l.get(C)}function v(C,B={}){let re=new ia({color:C,roughness:.85,metalness:.06,...B});return c.add(re),re}function _(C,B={}){let re=new zi({color:C,...B});return c.add(re),re}function x(C,B,re,Se=[0,0,0],be=[1,1,1],ue=!0){let se=new Pt(B,re);return se.position.set(...Se),se.scale.set(...be),se.castShadow=ue,se.receiveShadow=ue,C.add(se),se}let T=g("box",()=>new kn(1,1,1)),A=g("cylinder",()=>new Yt(1,1,1,12)),I=g("tapered",()=>new Yt(.85,1,1,10)),N=g("sphere",()=>new Lr(1,12,9)),F=g("octa",()=>new Pr(1,0)),H=[4868939,5592144,4738640,5264207,4540489,5854800].map(C=>v(C)),j=v(3554882),V=v(2107952),q=v(12098146,{roughness:.54,metalness:.48}),W=v(10323547,{roughness:.7,metalness:.22}),te=v(2566697),Q=v(1581092),he=_(16759910,{transparent:!0,opacity:.85}),oe=_(16770467),Ee=_(15561523,{transparent:!0,opacity:.62,depthWrite:!1,blending:ha}),we=4817;function Z(){return we=we*16807%2147483647,(we-1)/2147483646}function le(C,B,re,Se,be=.035,ue=96){let se=x(C,g(`ring:${B}:${re}:${ue}`,()=>new Ur(B,re,5,ue)),Se,[0,be,0],[1,1,1],!1);return se.rotation.x=Math.PI/2,se}function ye(C,B,re){return g(`tile:${C}:${B}:${re}`,()=>{let be=Ht/re,ue=new ji;ue.absarc(0,0,B,.012,be-.012,!1),ue.lineTo(Math.cos(be-.012)*C,Math.sin(be-.012)*C),ue.absarc(0,0,C,be-.012,.012,!0),ue.closePath();let se=new Cr(ue,{depth:.075,bevelEnabled:!1,curveSegments:3});return se.rotateX(-Math.PI/2),se})}t.add(new sa(10994387,4798762,1.95));let ve=new Nr(11982318,2.35);ve.position.set(-8,16,-12),ve.castShadow=!0,ve.shadow.mapSize.set(1024,1024),Object.assign(ve.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:48}),ve.shadow.bias=-8e-4,ve.shadow.normalBias=.035,t.add(ve);let fe=new Nr(15119997,.95);fe.position.set(7,5,10),t.add(fe),x(t,g("land",()=>new Yt(20,22,.6,64)),v(1449765),[0,-.7,0],[1,1,1]),x(t,g("foundation",()=>new Yt(9.75,10.15,.58,96)),j,[0,-.32,0]),x(t,g("floor",()=>new Yt(9.25,9.25,.16,96)),V,[0,-.09,0]),[[1.7,3.28,24],[3.34,5.1,32],[5.16,6.86,40],[6.92,8.7,48]].forEach(([C,B,re],Se)=>{let be=ye(C,B,re);for(let ue=0;ue<re;ue++){let se=x(t,be,H[Math.floor(Z()*H.length)],[0,-.05+Z()*.014,0]);se.rotation.y=ue*Ht/re+(Se%2?.075:0),se.castShadow=!1}}),x(t,g("centerdisc",()=>new Yt(1.64,1.64,.08,64)),H[3],[0,-.007,0]),[1.7,3.3,5.12,6.9,8.74,9.13].forEach((C,B)=>le(t,C,B===5?.035:.014,B>3?q:W)),le(t,.82,.016,W,.045,64),le(t,1.48,.018,q,.045,64);for(let C=0;C<8;C++){let B=new ft;B.rotation.y=C*Ht/8;let re=x(B,T,W,[0,.042,.95],[.018,.008,.85],!1);re.rotation.y=.32;let Se=x(B,T,W,[0,.042,.95],[.018,.008,.85],!1);Se.rotation.y=-.32,t.add(B)}for(let C=0;C<24;C++){let B=new ft,re=C*Ht/24;B.position.set(Math.sin(re)*7.82,.046,Math.cos(re)*7.82),B.rotation.y=re,x(B,T,W,[0,0,0],[.025,.008,.32],!1),x(B,T,W,[.085,0,-.04],[.18,.008,.022],!1),x(B,T,W,[-.07,0,.09],[.13,.008,.022],!1),C%2===0&&x(B,T,W,[.08,0,.13],[.02,.008,.12],!1),t.add(B)}for(let C=0;C<48;C++){let B=Ht*C/48,re=x(t,T,C%3?j:H[1],[Math.sin(B)*9.27,.09,Math.cos(B)*9.27],[1.17,.23,.48]);re.rotation.y=B}let E=[];for(let C=0;C<30;C++){let B=Z()*Ht,re=2+Z()*6.4,Se=Math.sin(B)*re,be=Math.cos(B)*re;E.push(Se,.041,be,Se+.15+Z()*.25,.041,be+.08+Z()*.24)}let b=g("cracks",()=>new rt().setAttribute("position",new Ue(E,3))),D=new Vi({color:2370350,transparent:!0,opacity:.75});c.add(D),t.add(new Zs(b,D));function U(C,B,re,Se=0,be=!1){let ue=new ft;ue.position.set(C,0,B),ue.rotation.y=Se,x(ue,T,H[1],[0,.15,0],[.95,.3,.95]),x(ue,T,j,[0,.38,0],[.72,.18,.72]);let se=Math.ceil(re/.62);for(let Le=0;Le<se;Le++){let ut=x(ue,I,H[Le%H.length],[0,.53+Le*.58,0],[.3,.58,.3]);ut.rotation.y=Le*.04,be&&Le===se-1&&(ut.rotation.z=.12)}if(!be){let Le=.52+se*.58;x(ue,T,j,[0,Le,0],[.7,.18,.7]),x(ue,T,H[1],[0,Le+.15,0],[.9,.18,.9]),x(ue,T,q,[0,Le+.27,0],[.73,.06,.73])}return t.add(ue),ue}[-1.08,-.63,-.23,.22,.68,1.12,1.68,2.55].forEach((C,B)=>{U(Math.sin(C)*10.25,-Math.cos(C)*10.25,B%3===0?2.1:3.4,C,B%3===0)});for(let C=0;C<18;C++){let B=Z()*Ht,re=10.3+Z()*1.8;x(t,T,H[C%H.length],[Math.sin(B)*re,-.1+Z()*.16,Math.cos(B)*re],[.25+Z()*.6,.22+Z()*.35,.25+Z()*.5]).rotation.set(Z()*.3,Z()*Ht,Z()*.4)}let R=new ft;R.position.set(0,0,-10.8),[-3,3].forEach(C=>{x(R,T,j,[C,2.3,0],[.8,4.6,.85]),x(R,T,q,[C,1,.01],[.84,.08,.9]),x(R,T,q,[C,4.25,.01],[.84,.09,.9]),x(R,T,H[2],[C,.2,0],[1.25,.4,1.25])}),x(R,T,H[2],[0,4.64,0],[7.1,.68,1.12]),x(R,T,q,[0,4.98,.08],[7.45,.06,1.3]),x(R,T,Q,[0,5.18,0],[8.1,.3,1.7]),[-1,1].forEach(C=>{let B=x(R,T,Q,[C*4.1,5.35,0],[1,.24,1.7]);B.rotation.z=C*.25}),x(R,T,V,[0,4.6,.59],[2,.44,.08]);for(let C=0;C<4;C++)x(R,T,q,[-.57+C*.38,4.63,.644],[.045,.22,.015],!1);t.add(R);let L=v(1121574,{roughness:1}),S=new ft;S.position.set(-.8,0,-20),[0,1,2].forEach(C=>{let B=1.4+C*2.05;x(S,T,L,[0,B,0],[7.5-C*1.8,1.85,3.6-C*.5],!1),x(S,T,Q,[0,B+1.02,0],[10.2-C*2.1,.3,5-C*.7],!1);for(let re of[-1,1]){let Se=x(S,T,Q,[re*(4.8-C*1),B+1.14,0],[1.2,.24,5-C*.7],!1);Se.rotation.z=re*.27}}),x(S,A,q,[0,7.3,0],[.07,1.2,.07],!1),t.add(S);let P=g("mountain",()=>new Xi(1,1,5));for(let C=0;C<17;C++){let B=Math.PI*(.52+C*.062),re=x(t,P,L,[Math.cos(B)*27,2.5+Z()*2,-18-Z()*12],[5+Z()*7,8+Z()*13,4+Z()*7],!1);re.rotation.y=Z()*Ht}let z=x(t,N,_(13818053),[-8,11,-26],[1.45,1.45,1.45],!1);x(t,g("moonhalo",()=>new Ir(1.6,1.64,96)),_(8557203,{transparent:!0,opacity:.2,side:ca}),[-8,11,-26],[1,1,1],!1).quaternion.copy(n.quaternion);function O(C,B,re){let Se=new ft;Se.position.set(C,0,B),x(Se,A,j,[0,.16,0],[.44,.32,.44]),x(Se,A,V,[0,.63,0],[.16,.8,.16]),x(Se,g("bowl",()=>new Yt(.36,.22,.25,10)),q,[0,1.03,0]);let be=x(Se,F,Ee,[0,1.43,0],[.23,.52,.23],!1),ue=x(Se,F,oe,[.015,1.34,0],[.12,.3,.12],!1),se=new oa(16753489,8.5,7,2);se.position.set(0,1.6,0),Se.add(se),d.push({outer:be,inner:ue,light:se,phase:re,x:C,z:B}),t.add(Se)}O(-7.8,-5.3,.5),O(7.8,-5.3,2.3),O(-6.5,7.2,4.5),O(6.5,7.2,7.1);let ee=100,$=new Float32Array(ee*3),ie=[];for(let C=0;C<ee;C++){let B=Z()*Ht,re=2+Z()*11;ie.push({x:Math.sin(B)*re,z:Math.cos(B)*re,y:Z()*5.5,speed:.12+Z()*.25,phase:Z()*Ht})}let _e=g("dust",()=>new rt().setAttribute("position",new Mt($,3))),ge=new Wi({color:13806706,size:.025,transparent:!0,opacity:.52,depthWrite:!1,blending:ha});c.add(ge),t.add(new Sr(_e,ge)),t.updateMatrixWorld(!0);let Te=new Set(d.flatMap(C=>[C.outer,C.inner])),Pe=new Map;t.traverse(C=>{if(!C.isMesh||Te.has(C))return;let B=`${C.geometry.uuid}:${C.material.uuid}:${C.castShadow}:${C.receiveShadow}`;Pe.has(B)||Pe.set(B,[]),Pe.get(B).push(C)});for(let C of Pe.values()){if(C.length<2)continue;let B=C[0],re=new js(B.geometry,B.material,C.length);re.castShadow=B.castShadow,re.receiveShadow=B.receiveShadow,C.forEach((Se,be)=>{re.setMatrixAt(be,Se.matrixWorld),Se.removeFromParent()}),re.instanceMatrix.needsUpdate=!0,re.computeBoundingSphere(),t.add(re),h.push(re)}function je(C,B,re,Se,be,ue,se,Le,ut,et=!1){let tt=new ft;tt.position.set(B,re,Se),C.add(tt),x(tt,I,Le,[0,-be/2,0],[et?.135:.087,be,et?.135:.087]);let ht=new ft;ht.position.y=-be,tt.add(ht),x(ht,I,et?Le:se,[0,-ue/2,0],[et?.105:.071,ue,et?.105:.071]);for(let vt=0;vt<3;vt++)x(ht,A,ut,[0,-ue+.045+vt*.035,0],[et?.109:.079,.026,et?.109:.079]);return et?x(ht,T,Le,[0,-ue+.005,.07],[.19,.105,.32]):x(ht,N,se,[0,-ue-.027,.025],[.088,.095,.09]),{pivot:tt,joint:ht}}function He(C){let B=C==="enemy",re=new ft,Se=v(B?11111029:13015922,{roughness:.78}),be=v(B?5325132:3560283),ue=v(B?3683390:3162954),se=v(B?10065288:15062456,{roughness:1}),Le=v(B?9588285:Fr[0]),ut=v(B?11119267:2107175),et=_(B?15312227:15128498),tt=new ft;tt.position.y=1.05,re.add(tt),x(tt,I,be,[0,.13,0],[.285,.55,.195]);let ht=x(tt,T,se,[-.115,.16,.17],[.065,.48,.028]);ht.rotation.z=-.18;let vt=x(tt,T,be,[.105,.13,.18],[.12,.5,.035]);vt.rotation.z=.2,x(tt,A,Se,[0,.45,0],[.085,.13,.085]);let _t=new ft;_t.position.set(0,.59,0),tt.add(_t),x(_t,N,Se,[0,.025,0],[.165,.205,.154]),x(_t,N,ut,[0,.102,-.04],[.173,.145,.148]),x(_t,N,ut,[0,.235,-.055],[.08,.078,.075]),x(_t,T,be,[0,.055,.142],[.285,.055,.04]),[-.07,.07].forEach(De=>x(_t,T,et,[De,.058,.164],[.042,.012,.008],!1)),x(re,I,ue,[0,.87,0],[.255,.22,.185]),x(re,A,Le,[0,.96,0],[.265,.095,.2]);let J=x(re,T,Le,[-.13,.69,.17],[.13,.49,.035]);J.rotation.z=-.14;let qn=x(re,T,Le,[.095,.72,.17],[.09,.4,.03]);qn.rotation.z=.16;let M=je(tt,-.31,.34,0,.29,.29,Se,be,se),G=je(tt,.31,.34,0,.29,.29,Se,be,se),Y=je(re,-.15,.87,0,.37,.38,Se,ue,se,!0),K=je(re,.15,.87,0,.37,.38,Se,ue,se,!0),X=new ft;[-1,1].forEach(De=>{let Ne=x(X,I,V,[De*.28,.38,-.045],[.14,.16,.21]);Ne.rotation.z=De*.45;let Ft=x(X,F,q,[De*.3,.52,-.08],[.055,.24,.06]);Ft.rotation.z=De*-.4}),tt.add(X),X.visible=!1,t.add(re);let ae=new ft,de=_(B?13268563:Fr[0],{transparent:!0,opacity:.65,depthWrite:!1});le(ae,.49,.012,de,.052,48),le(ae,.55,.006,de,.052,48);let me=x(ae,g("direction",()=>new Xi(.065,.15,3)),de,[0,.05,.68],[1,1,1],!1);me.rotation.x=Math.PI/2,t.add(ae);let Ae=x(t,g("shadow",()=>new wr(.48,32)),_(527118,{transparent:!0,opacity:.3,depthWrite:!1}),[0,.04,0],[1,1,1],!1);Ae.rotation.x=-Math.PI/2;let Ce=new ft,Oe=x(Ce,g("healthback",()=>new Hn(.85,.052)),_(725013,{transparent:!0,opacity:.8,depthTest:!1}),[0,0,0],[1,1,1],!1),Re=x(Ce,g("healthfill",()=>new Hn(.81,.025)),_(B?14652778:12963758,{depthTest:!1}),[0,0,.002],[1,1,1],!1);Oe.renderOrder=5,Re.renderOrder=6,t.add(Ce);let Fe=new Float32Array(360),st=new rt;st.setAttribute("position",new Mt(Fe,3)),l.set(`${C}:cone`,st);let Qe=_(B?15379812:14146489,{transparent:!0,opacity:.15,side:ca,depthWrite:!1}),dt=x(t,st,Qe,[0,.063,0],[1,1,1],!1),nt=new Float32Array(129),Ve=new rt;Ve.setAttribute("position",new Mt(nt,3)),l.set(`${C}:arc`,Ve);let xt=new Vi({color:B?16762233:16050635,transparent:!0,opacity:.7,depthWrite:!1});c.add(xt);let pt=new Mr(Ve,xt);return pt.position.y=.075,t.add(pt),{root:re,body:tt,head:_t,leftArm:M,rightArm:G,leftLeg:Y,rightLeg:K,sash:J,sash2:qn,belt:Le,footMat:de,footprint:ae,shadow:Ae,indicator:Ce,healthFill:Re,cone:dt,coneGeo:st,coneMat:Qe,conePositions:Fe,arc:pt,arcGeo:Ve,arcMat:xt,arcPositions:nt,mantle:X,lastX:null,lastZ:null,walkPhase:0,attackIndex:0,oldState:null,modeScale:1}}u.player=He("player"),u.enemy=He("enemy");let Me=180,Ge=new Float32Array(Me*3).fill(-99),Je=new Float32Array(Me*3),at=Array.from({length:Me},()=>({life:0,duration:1,vx:0,vy:0,vz:0,r:1,g:1,b:1})),xe=g("particles",()=>new rt().setAttribute("position",new Mt(Ge,3)).setAttribute("color",new Mt(Je,3))),qe=new Wi({size:.065,vertexColors:!0,transparent:!0,opacity:.95,depthWrite:!1,blending:ha});c.add(qe),t.add(new Sr(xe,qe));let Ke=Array.from({length:8},()=>{let C=_(16767126,{transparent:!0,opacity:0,depthWrite:!1}),B=le(t,1,.018,C,.08,64);return B.visible=!1,{item:B,mat:C,life:0,duration:.5,radius:1}}),An=0,di=0;function Ot(C){if(!C||!Number.isFinite(C.x)||!Number.isFinite(C.z))return;let B=C.type;if(!["hit","block","deflect","break","style","phase","win","evade","strike"].includes(B))return;let re=new Be(B==="deflect"?14219007:B==="style"?Fr[C.style??0]:B==="break"||B==="phase"?15301198:16764548),Se=B==="strike"||B==="evade"?5:B==="deflect"||B==="break"?28:B==="win"?48:14;for(let be=0;be<Se;be++){let ue=An++%Me,se=at[ue],Le=Z()*Ht,ut=.8+Z()*2.8;se.life=se.duration=.22+Z()*.42,se.vx=Math.sin(Le)*ut,se.vz=Math.cos(Le)*ut,se.vy=1.2+Z()*2.2,se.r=re.r,se.g=re.g,se.b=re.b,Ge[ue*3]=C.x,Ge[ue*3+1]=B==="style"||B==="evade"?.1:.8+Z()*.35,Ge[ue*3+2]=C.z}if(["deflect","break","style","phase","win"].includes(B)){let be=Ke[di++%Ke.length];be.life=be.duration=B==="phase"||B==="win"?.8:.4,be.radius=B==="phase"||B==="win"?3.8:1.35,be.item.position.set(C.x,.09,C.z),be.mat.color.copy(re),be.item.visible=!0}}function Vt(C,B,re){let Se=String(B.state||"idle").toLowerCase(),be=B.attack,ue=be&&(Se==="windup"||Se==="active")&&(re||Se==="active");if(C.cone.visible=C.arc.visible=!!ue,!ue)return;let se=be.range||1.7,Le=Ki(be.arc||1.4,.1,Ht);for(let et=0;et<40;et++){let tt=-Le/2+Le*et/40,ht=-Le/2+Le*(et+1)/40,vt=et*9;C.conePositions[vt]=0,C.conePositions[vt+1]=0,C.conePositions[vt+2]=0,C.conePositions[vt+3]=Math.sin(tt)*se,C.conePositions[vt+4]=0,C.conePositions[vt+5]=Math.cos(tt)*se,C.conePositions[vt+6]=Math.sin(ht)*se,C.conePositions[vt+7]=0,C.conePositions[vt+8]=Math.cos(ht)*se}C.arcPositions[0]=0,C.arcPositions[1]=0,C.arcPositions[2]=0;for(let et=0;et<=40;et++){let tt=-Le/2+Le*et/40;C.arcPositions[(et+1)*3]=Math.sin(tt)*se,C.arcPositions[(et+1)*3+1]=0,C.arcPositions[(et+1)*3+2]=Math.cos(tt)*se}C.arcPositions[126]=C.arcPositions[127]=C.arcPositions[128]=0,C.coneGeo.attributes.position.needsUpdate=!0,C.arcGeo.attributes.position.needsUpdate=!0,C.coneGeo.computeBoundingSphere(),C.arcGeo.computeBoundingSphere(),C.cone.position.set(B.x,.063,B.z),C.arc.position.set(B.x,.078,B.z),C.cone.rotation.y=C.arc.rotation.y=B.yaw||0;let ut=Ki((B.stateTime||0)/(B.stateDuration||be.windup||1),0,1);C.coneMat.opacity=re?Se==="active"?.27:.075+.14*ut:.1,C.arcMat.opacity=Se==="active"?.95:.35+.55*ut,C.coneMat.color.setHex(Se==="active"?re?15499339:15129792:be.sweep?13991528:15314276)}function on(C,B,re,Se,be,ue){if(!B){C.root.visible=C.footprint.visible=C.shadow.visible=C.indicator.visible=!1;return}C.root.visible=C.footprint.visible=C.shadow.visible=!0;let se=String(B.state||"idle").toLowerCase(),Le=Ki(B.style||0,0,2),ut=be&&ue==="boss"?1.15:1;C.modeScale=ut,C.root.scale.setScalar(ut),C.mantle.visible=be&&ue==="boss",C.belt.color.setHex(be?ue==="boss"?11031612:8491405:Fr[Le]),C.footMat.color.setHex(B.invulnerable?14742760:be?14518632:Fr[Le]);let et=C.lastX==null?0:B.x-C.lastX,tt=C.lastZ==null?0:B.z-C.lastZ,ht=re>0?Math.min(Math.hypot(et,tt)/re,8):0;C.lastX=B.x,C.lastZ=B.z,C.walkPhase+=Math.min(ht,5)*re*5.2,se==="windup"&&C.oldState!==se&&C.attackIndex++,C.oldState=se;let vt=se==="idle"&&ht>.15,_t=Math.sin(C.walkPhase),J={la:.16,ra:.18,laz:.15,raz:-.15,le:-1.5,re:-1.45,ll:-.1,rl:.1,llz:.06,rlz:-.06,lk:.12,rk:.12,bx:0,by:0,bz:0,rootY:0,lean:0,fall:0};if(Le===1&&(J.la=-.3,J.ra=-.05,J.le=-1.3,J.re=-1.7,J.by=-.12),Le===2&&(J.la=.25,J.ra=-.15,J.le=-1.25,J.re=-1.4,J.ll=-.25,J.rl=.19,J.by=-.22,J.laz=.25),vt&&(J.ll=_t*.55,J.rl=-_t*.55,J.lk=.16+Math.max(0,-_t)*.55,J.rk=.16+Math.max(0,_t)*.55,J.la+=-_t*.15,J.ra+=_t*.15,J.rootY=Math.abs(Math.cos(C.walkPhase))*.035,J.bx=.07),["windup","active","recovery"].includes(se)&&B.attack){let K=B.attack,X=se==="windup"?Kl((B.stateTime||0)/(B.stateDuration||K.windup||.2)):1,ae=se==="recovery"?1-Kl((B.stateTime||0)/(B.stateDuration||K.recovery||.3)):1,de=se==="windup"?0:ae,me=X*ae,Ae=K.style??Le,Ce=K.kind!=="light";if(J.by=-.3*me+.65*de,J.bx=.08*de,Ae===2||K.sweep)J.rl=-1*me-.5*de,J.rk=1.45*me-1.35*de,J.rlz=Ce?-.65*de:-.07,J.bx=-.22*me,J.la=-.3,J.ra=.5,J.laz=.5*me,J.raz=-.6*me,J.le=-.7,J.re=-.8,J.by=Ce?-.7*me+1.3*de:-.13,J.lk=.22,J.rootY=.05*de;else if(Ae===0&&Ce)J.rl=-.25-.95*de,J.rk=.35+1.55*me,J.la=-.5*me,J.ra=-.65*me,J.le=-1.6+.7*de,J.re=-1.6+.7*de,J.bx=-.1+.2*de,J.rootY=.04*de;else{let Oe=Ae===1&&C.attackIndex%2===0,Re=.25*me-1.8*de,Fe=-1.65*me+1.58*de;Oe?(J.la=Re,J.le=Fe,J.laz=-.06):(J.ra=Re,J.re=Fe,J.raz=.06),Ae===1&&Ce&&(J.la=Re,J.le=Fe,J.laz=.02),J.ll=-.26*de,J.rl=.22*de,J.lean=.08*de}}if((se==="guard"||se==="guarding")&&(J.la=J.ra=-.45,J.le=J.re=-1.95,J.laz=-.17,J.raz=.17,J.bx=.06,J.lk=J.rk=.22),(se==="evade"||se==="evading")&&(J.rootY=-.26,J.bx=.48,J.ll=-.55,J.rl=-.9,J.lk=1.25,J.rk=1.45,J.la=-.7,J.ra=-.8,J.le=J.re=-.7),se==="switch"||se==="switching"){let K=Kl((B.stateTime||0)/(B.stateDuration||.22));J.by=Math.sin(K*Math.PI)*.55,J.la=-.7,J.ra=-.7,J.le=-1.35,J.re=-1.35}(se==="stun"||se==="hitstun")&&(J.bx=-.25,J.bz=Math.sin(Se*30)*.055,J.la=.3,J.ra=.4,J.le=-.5,J.re=-.4,J.rootY=-.055),(se==="broken"||se==="posturebroken")&&(J.rootY=-.35,J.bx=.48,J.ll=J.rl=-.6,J.lk=J.rk=1.4,J.la=.15,J.ra=.2,J.le=J.re=-.3),se==="dead"&&(J.fall=1.45,J.rootY=.12,J.la=-.6,J.ra=.3,J.le=-.2,J.re=-.3,J.ll=.2,J.rl=-.3,J.lk=.3,J.rk=.4);let qn=1-Math.exp(-re*(se==="active"?40:19)),M=(K,X,ae)=>{K[X]+=(ae-K[X])*qn},G=se==="idle"?Math.sin(Se*2.5+(be?1.5:0))*.009:0;C.root.position.set(B.x+Math.sin(B.yaw||0)*J.lean,J.rootY+G,B.z+Math.cos(B.yaw||0)*J.lean),C.root.rotation.y=B.yaw||0,M(C.root.rotation,"z",J.fall),M(C.body.rotation,"x",J.bx),M(C.body.rotation,"y",J.by),M(C.body.rotation,"z",J.bz),M(C.leftArm.pivot.rotation,"x",J.la),M(C.rightArm.pivot.rotation,"x",J.ra),M(C.leftArm.pivot.rotation,"z",J.laz),M(C.rightArm.pivot.rotation,"z",J.raz),M(C.leftArm.joint.rotation,"x",J.le),M(C.rightArm.joint.rotation,"x",J.re),M(C.leftLeg.pivot.rotation,"x",J.ll),M(C.rightLeg.pivot.rotation,"x",J.rl),M(C.leftLeg.pivot.rotation,"z",J.llz),M(C.rightLeg.pivot.rotation,"z",J.rlz),M(C.leftLeg.joint.rotation,"x",J.lk),M(C.rightLeg.joint.rotation,"x",J.rk),C.sash.rotation.x=Math.sin(Se*4+C.walkPhase)*(.04+ht*.035),C.sash2.rotation.x=-Math.sin(Se*3.4+C.walkPhase)*(.035+ht*.03),C.footprint.position.set(B.x,0,B.z),C.footprint.rotation.y=B.yaw||0,C.footMat.opacity=se==="dead"?.2:.65,C.shadow.position.set(B.x,.04,B.z),C.indicator.visible=B.health>0&&(be||B.health<B.maxHealth),C.indicator.position.set(B.x,ut*2.15,B.z),C.indicator.quaternion.copy(n.quaternion);let Y=Ki(B.health/(B.maxHealth||100),0,1);C.healthFill.scale.x=Math.max(.001,Y),C.healthFill.position.x=-(1-Y)*.405,Vt(C,B,be)}function k(){let C=r.getBoundingClientRect();p=Math.max(1,C.width),f=Math.max(1,C.height),e.setSize(p,f,!1);let B=p/f,re=B<1.05?12.1/B:11.5;n.left=-re*B,n.right=re*B,n.top=re,n.bottom=-re,n.updateProjectionMatrix()}function jn(C,B=1/60,re=0){if(B=Ki(B||0,0,.1),re=Number.isFinite(re)?re:C.elapsed||0,y!==C.mode||m&&m!=="playing"&&C.result==="playing"){for(let ue of Object.values(u))ue.lastX=null,ue.lastZ=null,ue.root.rotation.z=0;y=C.mode}m=C.result;let Se=C.presentationPlaying?1.14:1,be=1-Math.exp(-Math.max(B,.008)*5);Math.abs(n.zoom-Se)>1e-4&&(n.zoom+=(Se-n.zoom)*be,n.updateProjectionMatrix()),on(u.player,C.player,B,re,!1,C.mode),on(u.enemy,C.enemy,B,re,!0,C.mode),d.forEach(ue=>{let se=1+Math.sin(re*8.5+ue.phase)*.12+Math.sin(re*17+ue.phase)*.05;ue.outer.scale.set(.23*(2-se),.52*se,.23*(2-se)),ue.outer.rotation.y=re*.6+ue.phase,ue.inner.scale.y=.3*se,ue.light.intensity=8.5*se});for(let ue=0;ue<ee;ue++){let se=ie[ue];$[ue*3]=se.x+Math.sin(re*.25+se.phase)*.28,$[ue*3+1]=(se.y+re*se.speed)%5.5,$[ue*3+2]=se.z+Math.cos(re*.2+se.phase)*.15}_e.attributes.position.needsUpdate=!0;for(let ue=0;ue<Me;ue++){let se=at[ue];if(se.life<=0){Ge[ue*3+1]=-99;continue}se.life-=B,se.vy-=B*5,Ge[ue*3]+=se.vx*B,Ge[ue*3+1]+=se.vy*B,Ge[ue*3+2]+=se.vz*B;let Le=Math.max(0,se.life/se.duration);Je[ue*3]=se.r*Le,Je[ue*3+1]=se.g*Le,Je[ue*3+2]=se.b*Le}xe.attributes.position.needsUpdate=!0,xe.attributes.color.needsUpdate=!0,xe.boundingSphere=null;for(let ue of Ke){if(ue.life<=0){ue.item.visible=!1;continue}ue.life-=B;let se=1-ue.life/ue.duration;ue.item.scale.setScalar(.25+se*ue.radius),ue.mat.opacity=(1-se)*.7}e.render(t,n)}function Xr(C,B){let re=r.getBoundingClientRect();if(!re.width||!re.height)return null;s.set((C-re.left)/re.width*2-1,-(B-re.top)/re.height*2+1),i.setFromCamera(s,n);let Se=i.ray.intersectPlane(a,o);return Se?{x:Se.x,z:Se.z}:null}function gt(){h.forEach(C=>C.dispose()),l.forEach(C=>C.dispose()),c.forEach(C=>C.dispose()),ve.shadow.map?.dispose(),ve.shadow.mapPass?.dispose(),e.dispose()}return k(),{render:jn,resize:k,projectPointer:Xr,burst:Ot,dispose:gt,stats:()=>({calls:e.info.render.calls,triangles:e.info.render.triangles,geometries:e.info.memory.geometries,staticBatches:h.length})}}function Vh(){let r,e,t=!0,n,i=()=>(r||(r=new(window.AudioContext||window.webkitAudioContext),e=r.createGain(),e.gain.value=t?.32:0,e.connect(r.destination)),r);function s(o,l=.2,c=.18,h="sine",d=o){if(!t||!r||r.state!=="running")return;let u=r.currentTime,p=r.createOscillator(),f=r.createGain();p.type=h,p.frequency.setValueAtTime(o,u),p.frequency.exponentialRampToValueAtTime(Math.max(20,d),u+l),f.gain.setValueAtTime(.001,u),f.gain.exponentialRampToValueAtTime(c,u+.008),f.gain.exponentialRampToValueAtTime(.001,u+l),p.connect(f),f.connect(e),p.start(u),p.stop(u+l+.02),p.onended=()=>{p.disconnect(),f.disconnect()}}function a(o=.12,l=.16,c=1200){if(!t||!r||r.state!=="running")return;let h=r.createBuffer(1,Math.ceil(r.sampleRate*o),r.sampleRate),d=h.getChannelData(0);for(let y=0;y<d.length;y++)d[y]=(Math.random()*2-1)*(1-y/d.length);let u=r.createBufferSource(),p=r.createBiquadFilter(),f=r.createGain();u.buffer=h,p.type="lowpass",p.frequency.value=c,f.gain.value=l,u.connect(p),p.connect(f),f.connect(e),u.start(),u.onended=()=>{u.disconnect(),p.disconnect(),f.disconnect()}}return{async unlock(){try{await i().resume(),n||(n=setInterval(()=>{document.hidden||s([110,146.83,164.81,220][Math.floor(Math.random()*4)],2.5,.022)},2800))}catch{}},setEnabled(o){t=o,e&&e.gain.setTargetAtTime(o?.32:0,r.currentTime,.05)},event(o){switch(o.type){case"strike":a(.12,.1,1800);break;case"hit":a(.13,.55,700),s(105,.16,.55,"sine",38);break;case"block":a(.07,.26,1400),s(180,.12,.2,"triangle",75);break;case"deflect":s(980,.5,.14,"sine",600),s(1470,.35,.06);break;case"evade":a(.18,.12,2600);break;case"style":s(440,.18,.08),s(660,.3,.05);break;case"break":a(.3,.4,400),s(75,.4,.35,"triangle",30);break;case"phase":s(75,1.4,.3,"sine",45);break;case"win":[220,330,440].forEach((l,c)=>setTimeout(()=>s(l,1.2,.13),c*160));break;case"lose":s(110,1.6,.15,"sine",45);break}},dispose(){clearInterval(n),r?.close()}}}function Wh({root:r,button:e,onReset:t,onChange:n,onNotice:i}){let s=()=>document.fullscreenElement===r||document.webkitFullscreenElement===r,a=!1,o=s();function l(){let h=s();document.body.classList.toggle("is-fullscreen",h),e.setAttribute("aria-pressed",String(h)),e.setAttribute("aria-label",h?"Exit full screen":"Enter full screen"),e.title=h?"Exit full screen":"Enter full screen";let d=o;o=h,t(),n({enabled:h,exited:d&&!h})}async function c(){if(!a){a=!0,t();try{if(s()){let h=document.exitFullscreen||document.webkitExitFullscreen;h&&await h.call(document)}else{let h=r.requestFullscreen||r.webkitRequestFullscreen;if(!h)throw new Error("Fullscreen unavailable");await h.call(r)}}catch{i("Use the app\u2019s expand control, or open this game in your browser for full screen.",4),n({enabled:s(),exited:!1})}finally{a=!1}}}return e.addEventListener("click",c),document.addEventListener("fullscreenchange",l),document.addEventListener("webkitfullscreenchange",l),e.setAttribute("aria-pressed",String(s())),{active:s,toggle:c,get busy(){return a}}}var ze=r=>document.getElementById(r),an=ze("arena"),Ie=new jr("sparring"),fa=Vh(),Xn;try{Xn=Gh(an)}catch(r){let e=document.createElement("div");e.className="browser-error",e.textContent="The courtyard needs WebGL 2. Try a current Chrome, Edge, Firefox or Safari with hardware acceleration enabled.",document.body.append(e),console.error(r)}var At=!1,It=!1,kr="sparring",ga=0,Gn=!1,Br=!0,va=performance.now(),zr=0,Hr=null,jh=0,xa=!1,Gr=0,_a=-1,Xh="",Wn=null,Vn=null,Gt=new Set,Tn={x:0,z:0},hi={hits:0,deflects:0,start:0};function fn(r,e=1.4){ze("combat-message").classList.remove("app-notice"),ze("combat-message").textContent=r,ze("combat-message").classList.add("visible"),jh=zr+e}function ui(){Gt.clear(),Tn.x=0,Tn.z=0,Ie.setGuard(!1),Ie.player.buffer=null,Hr=null;let r=Wn,e=Vn;Wn=null,Vn=null;let t=ze("joystick");r!==null&&t?.hasPointerCapture(r)&&t.releasePointerCapture(r),e?.element.hasPointerCapture(e.id)&&e.element.releasePointerCapture(e.id),ze("joystick-nub")&&(ze("joystick-nub").style.transform="translate(-50%, -50%)")}var ya=Wh({root:document.querySelector(".game-shell"),button:ze("fullscreen-toggle"),onReset:ui,onChange({exited:r}){va=performance.now(),Xn?.resize(),r?gn(!0):At&&!It&&Ie.result==="playing"&&an.focus({preventScroll:!0})},onNotice(r,e){fn(r,e),ze("combat-message").classList.add("app-notice")}}),$l=()=>{ui(),va=performance.now(),Xn?.resize()},jp=new ResizeObserver($l);jp.observe(document.querySelector(".game-shell"));function Ql(r=kr){Xn&&(kr=r,Ie.reset(r),Ie.presentationPlaying=!0,Ie.player.style=ga,Ie.player.hybridStyle=(ga+1)%mi.length,Ie.drainEvents(),At=!0,It=!1,xa=!1,Br=!0,Gr=0,ui(),hi.hits=0,hi.deflects=0,hi.start=zr,ze("start-overlay").hidden=!0,ze("pause-overlay").hidden=!0,ze("result-overlay").hidden=!0,document.body.classList.add("is-playing"),document.body.classList.remove("is-paused"),ze("pause-toggle").setAttribute("aria-pressed","false"),ze("pause-toggle").setAttribute("aria-label","Pause game"),an.focus({preventScroll:!0}),fa.unlock(),fn(r==="boss"?"THE FRACTURED MASTER \xB7 Read the tell. Find your opening.":"SPARRING \xB7 Watch the amber tell, then counter.",3.5),_a=-1,Ma())}function gn(r=!It){!At||Ie.result!=="playing"||(It=r,ui(),ze("pause-overlay").hidden=!r,document.body.classList.toggle("is-paused",r),ze("pause-toggle").setAttribute("aria-pressed",String(r)),ze("pause-toggle").setAttribute("aria-label",r?"Resume game":"Pause game"),r?document.querySelector("[data-resume]")?.focus():an.focus({preventScroll:!0}))}function qh(){At=!1,It=!1,xa=!1,ui(),Ie.reset(kr),Ie.presentationPlaying=!1,ze("start-overlay").hidden=!1,ze("pause-overlay").hidden=!0,ze("result-overlay").hidden=!0,document.body.classList.remove("is-playing","is-paused"),document.querySelector("[data-start]")?.focus()}function Vr(r,e){!At||It||Ie.result!=="playing"||(r==="hybrid"&&Ie.setHybridStyle((Ie.player.style+1)%mi.length),!Ie.action(r,e)&&Ie.player.stamina<25&&fn("CATCH YOUR BREATH",.7))}document.querySelectorAll("[data-start]").forEach(r=>r.addEventListener("click",()=>Ql()));document.querySelectorAll("[data-restart]").forEach(r=>r.addEventListener("click",()=>Ql()));document.querySelectorAll("[data-return]").forEach(r=>r.addEventListener("click",qh));document.querySelectorAll("[data-resume]").forEach(r=>r.addEventListener("click",()=>gn(!1)));document.querySelectorAll("[data-mode]").forEach(r=>r.addEventListener("click",()=>{kr=r.dataset.mode,document.querySelectorAll("[data-mode]").forEach(e=>e.setAttribute("aria-pressed",String(e===r))),At||Ie.reset(kr)}));document.querySelectorAll("[data-style]").forEach(r=>r.addEventListener("click",()=>{let e=Number(r.dataset.style);At?(Vr("style",e),It||an.focus({preventScroll:!0})):(ga=e,Ie.player.style=e,_a=-1,Ma())}));ze("pause-toggle").addEventListener("click",()=>gn());ze("sound-toggle").addEventListener("click",r=>{Gn=!Gn,fa.setEnabled(!Gn),Gn||fa.unlock(),ze("sound-toggle").setAttribute("aria-pressed",String(!Gn)),ze("sound-toggle").setAttribute("aria-label",Gn?"Enable sound":"Mute sound"),ze("sound-toggle").classList.toggle("muted",Gn),fn(Gn?"SOUND OFF":"SOUND ON",.8),r.detail>0&&At&&!It&&an.focus({preventScroll:!0})});ze("help-toggle")?.addEventListener("click",()=>{At&&!It?gn(!0):At?gn(!1):document.querySelector(".controls-guide")?.classList.toggle("expanded")});window.addEventListener("keydown",r=>{if(!At)return;if(r.code==="Escape"||r.code==="KeyP"){r.preventDefault(),r.repeat||(r.code==="Escape"&&ya.active()?(gn(!0),ya.toggle()):gn());return}if(It||Ie.result!=="playing"||r.target instanceof Element&&r.target.closest('button, a, input, select, textarea, [contenteditable="true"]')||!["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowLeft","ArrowDown","ArrowRight","Space","KeyF","KeyJ","KeyK","KeyQ","KeyE","KeyR","Digit1","Digit2","Digit3","Tab"].includes(r.code)||(r.preventDefault(),Gt.add(r.code),r.repeat))return;let t={KeyJ:"light",KeyK:"heavy",Space:"evade",KeyQ:"style",KeyE:"hybrid"};t[r.code]&&Vr(t[r.code]),r.code==="KeyF"&&Ie.setGuard(!0),r.code==="KeyR"&&Ql(),r.code.startsWith("Digit")&&Vr("style",Number(r.code.slice(-1))-1),r.code==="Tab"&&(Br=!Br,fn(Br?"FOCUS \xB7 Facing your opponent":"FREE AIM \xB7 Follow the cursor",1.4))});window.addEventListener("keyup",r=>{Gt.delete(r.code),r.code==="KeyF"&&Ie.setGuard(Vn!==null)});window.addEventListener("blur",()=>{At&&!It&&!ya.busy&&gn(!0),ui()});document.addEventListener("visibilitychange",()=>{document.hidden&&At&&gn(!0)});an.addEventListener("contextmenu",r=>r.preventDefault());an.addEventListener("pointermove",r=>{Hr=Xn?.projectPointer(r.clientX,r.clientY)});an.addEventListener("pointerdown",r=>{r.pointerType!=="touch"&&(an.focus({preventScroll:!0}),Hr=Xn?.projectPointer(r.clientX,r.clientY),Vr(r.button===2?"heavy":"light"))});document.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("pointerdown",e=>{e.preventDefault(),Vr(r.dataset.action)})});document.querySelectorAll("[data-guard]").forEach(r=>{r.addEventListener("pointerdown",e=>{e.preventDefault(),!(!At||It||Vn!==null||Ie.result!=="playing")&&(Vn={id:e.pointerId,element:r},r.setPointerCapture(e.pointerId),Ie.setGuard(!0))});for(let e of["pointerup","pointercancel","lostpointercapture"])r.addEventListener(e,t=>{Vn?.id===t.pointerId&&(Vn=null,Ie.setGuard(Gt.has("KeyF")))})});var Wr=ze("joystick");function Yh(r){let e=Wr.getBoundingClientRect(),t=(r.clientX-e.left-e.width/2)/(e.width*.32),n=(r.clientY-e.top-e.height/2)/(e.height*.32),i=Math.hypot(t,n);i>1&&(t/=i,n/=i),Tn.x=t,Tn.z=n,ze("joystick-nub").style.transform=`translate(calc(-50% + ${t*e.width*.25}px), calc(-50% + ${n*e.height*.25}px))`}Wr?.addEventListener("pointerdown",r=>{r.preventDefault(),!(!At||It||Wn!==null||Ie.result!=="playing")&&(Wn=r.pointerId,Wr.setPointerCapture(r.pointerId),Yh(r))});Wr?.addEventListener("pointermove",r=>{r.pointerId===Wn&&Yh(r)});for(let r of["pointerup","pointercancel","lostpointercapture"])Wr?.addEventListener(r,e=>{Wn===e.pointerId&&(Tn.x=Tn.z=0,Wn=null,ze("joystick-nub").style.transform="translate(-50%, -50%)")});function Ma(){let r=Ie.player,e=Ie.enemy,t=(i,s,a)=>{ze(i)&&(ze(i).style.width=`${Math.max(0,Math.min(100,s/a*100))}%`)};t("player-health",r.health,r.maxHealth),t("player-stamina",r.stamina,100),t("player-posture",r.posture,r.maxPosture),t("enemy-health",e.health,e.maxHealth),t("enemy-posture",e.posture,e.maxPosture),ze("health-value")&&(ze("health-value").textContent=Math.ceil(r.health)),ze("stamina-value")&&(ze("stamina-value").textContent=Math.ceil(r.stamina)),ze("enemy-name").textContent=Ie.mode==="boss"?"THE FRACTURED MASTER":"THE SILENT DISCIPLE";let n=e.state==="windup"?`${e.attack?.name||"Attack"} \xB7 Incoming`:e.state==="broken"?"Posture broken \xB7 Strike now":e.state==="recovery"?"An opening":Ie.phase>1?"Phase II \xB7 Unbound":Ie.mode==="boss"?"Guardian of the ashen courtyard":"Read the rhythm. Find your form.";if(n!==Xh&&(ze("enemy-intent").textContent=n,Xh=n),ze("enemy-intent").classList.toggle("danger",e.state==="windup"),document.body.classList.toggle("low-health",r.health<r.maxHealth*.25&&r.health>0),r.style!==_a){_a=r.style,ga=r.style;let i=mi[r.style];ze("style-description").textContent=i.description,document.querySelectorAll("[data-style]").forEach(s=>s.setAttribute("aria-pressed",String(Number(s.dataset.style)===r.style))),document.documentElement.style.setProperty("--style-color",i.color)}}function qp(){for(let r of Ie.drainEvents())Xn?.burst(r),fa.event(r),r.type==="hit"&&(Gr=.04,r.actor==="player"&&hi.hits++),r.type==="deflect"&&(Gr=.065,hi.deflects++,fn("PERFECT DEFLECT",1)),r.type==="break"&&fn(r.actor==="player"?"YOUR POSTURE IS BROKEN":"POSTURE BROKEN \xB7 STRIKE",1.4),r.type==="phase"&&fn("PHASE II \xB7 THE MASTER UNBOUND",2.5),r.type==="style"&&fn(mi[Ie.player.style].name.toUpperCase(),.8)}function Yp(){xa=!0,ui();let r=Ie.result==="won";ze("result-title").textContent=r?"A form remembered.":"Rise. And try again.";let e=Math.floor(Ie.time);ze("result-detail").textContent=r?`${Ie.mode==="boss"?"The master yields.":"The disciple bows."} ${hi.hits} strikes \xB7 ${hi.deflects} deflects \xB7 ${e}s`:"Every defeat has something to teach. Watch the amber tell, evade the strike, and punish the recovery.",ze("result-overlay").hidden=!1,document.querySelector("[data-restart]")?.focus()}function Zh(r){let e=Math.min((r-va)/1e3,.05);if(va=r,zr+=e,At&&!It&&Ie.result==="playing"){let t=(Gt.has("KeyD")||Gt.has("ArrowRight")?1:0)-(Gt.has("KeyA")||Gt.has("ArrowLeft")?1:0)+Tn.x,n=(Gt.has("KeyW")||Gt.has("ArrowUp")?1:0)-(Gt.has("KeyS")||Gt.has("ArrowDown")?1:0)-Tn.z,i=t*.759-n*.651,s=-t*.651-n*.759,a=Math.hypot(i,s);a>1&&(i/=a,s/=a);let o=!Br&&Hr?Hr:Ie.enemy,l={x:i,z:s,aimX:o.x-Ie.player.x,aimZ:o.z-Ie.player.z};Gr>0?Gr-=e:Ie.update(e,l),qp(),Ma(),Ie.result!=="playing"&&!xa&&Yp()}zr>jh&&ze("combat-message").classList.remove("visible"),Xn?.render(Ie,It?0:e,zr),requestAnimationFrame(Zh)}window.addEventListener("resize",$l);window.visualViewport?.addEventListener("resize",$l);an.addEventListener("webglcontextlost",r=>{r.preventDefault(),gn(!0),fn("Graphics paused. Reload the game to reconnect.",30)});document.querySelector(".brand")?.addEventListener("click",r=>{r.preventDefault(),qh()});Ma();requestAnimationFrame(Zh);Object.defineProperty(window,"__THOUSAND_FORMS__",{value:{snapshot:()=>({started:At,paused:It,fullscreen:ya.active(),keys:[...Gt],joystick:{...Tn},joystickPointer:Wn,touchGuard:Vn?.id??null,mode:Ie.mode,result:Ie.result,phase:Ie.phase,player:{...Ie.player},enemy:{...Ie.enemy},time:Ie.time})},writable:!1});})();
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
