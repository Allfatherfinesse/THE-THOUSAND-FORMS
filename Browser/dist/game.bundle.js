(()=>{var Su=Math.PI*2,Ja=1/120,Ka=(r,e,t)=>Math.max(e,Math.min(t,r)),xs=(r,e)=>(r-e+Math.PI*3)%Su-Math.PI,Di=r=>{let e=Ka(r,0,1);return e*e*(3-2*e)},ni=r=>r.state==="idle"||r.state==="guard",yc=r=>["windup","active","recovery"].includes(r.state),bu=r=>["light","heavy","hybrid"].includes(r),Gt=(r,e,t,n,i,s,a,o,l,c=.25)=>({name:r,windup:e,active:t,recovery:n,cost:i,damage:s,posture:a,range:o,arc:l,lunge:c,sweep:!1}),Ni=[{id:"muay-thai",name:"Muay Thai",color:"#efb66a",description:"Pressure \xB7 posture damage",light:Gt("Ember palm",.14,.13,.24,12,14,24,1.85,1.65,.42),heavy:Gt("Mountain elbow",.34,.18,.38,24,27,43,2.05,1.85,.56)},{id:"wing-chun",name:"Wing Chun",color:"#72d6c9",description:"Quick hands \xB7 wider deflect window",light:Gt("River palm",.09,.1,.17,9,10,14,1.7,1.45,.32),heavy:Gt("Unbroken line",.25,.14,.28,20,21,30,1.85,1.4,.52)},{id:"taekwondo",name:"Taekwondo",color:"#a8a2f2",description:"Long reach \xB7 mobile footwork",light:Gt("Crescent kick",.22,.14,.29,15,18,19,2.55,1.7,.3),heavy:Gt("Falling star",.43,.18,.43,27,32,34,2.85,1.6,.38)}],Eu={sparring:[{...Gt("Measured palm",.72,.16,.62,10,10,17,2,1.55,.3),kind:"light",style:1},{...Gt("Rising step",.94,.2,.8,16,18,27,2.45,1.6,.35),kind:"heavy",style:2},{...Gt("Measured palm",.72,.16,.62,10,10,17,2,1.55,.3),kind:"light",style:1}],boss:[{...Gt("Sweeping crescent",.95,.24,.88,15,18,27,2.8,Math.PI*1.65,.15),kind:"sweep",style:2,sweep:!0},{...Gt("Falling bell",1.05,.2,.95,18,25,38,2.65,1.3,.55),kind:"heavy",style:0},{...Gt("Ashen step",.68,.16,.55,12,13,20,2.25,1.55,.4),kind:"light",style:1}]};function xc(r,e,t,n,i,s){return{id:r,x:e,z:t,yaw:r==="player"?Math.PI:0,radius:.42,health:n,maxHealth:n,stamina:100,maxStamina:100,posture:0,maxPosture:i,style:s,hybridStyle:(s+1)%3,state:"idle",stateTime:0,stateDuration:0,attack:null,attackTime:0,attackDuration:0,invulnerable:!1,armored:!1,guardHeld:!1,guardEligible:!1,guardCooldown:0,staminaDelay:0,postureDelay:0,buffer:null,attackSequence:0,hitTargets:new Set,dodgeX:0,dodgeZ:0,pendingStyle:s,vx:0,vz:0,speed:0,movePhase:0,weightShift:0,comboIndex:0,footwork:"idle",_motorX:0,_motorZ:0,_driveProgress:0,_comboUntil:0}}var Ms=class{constructor(e="sparring"){this.reset(e)}reset(e=this.mode??"sparring"){return this.mode=e==="boss"?"boss":"sparring",this.player=xc("player",0,3,100,100,0),this.enemy=xc("enemy",0,-3,this.mode==="boss"?250:100,this.mode==="boss"?120:85,this.mode==="boss"?2:1),this.arenaRadius=9,this.result="playing",this.phase=1,this.time=0,this.events=[],this.aiEnabled=!0,this._accumulator=0,this._aiCooldown=1,this._aiStep=0,this._input={x:0,z:0},this}drainEvents(){return this.events.splice(0)}action(e,t){if(this.result!=="playing"||this.player.state==="dead"||!["light","heavy","evade","style","hybrid"].includes(e))return!1;let n=this.player,i=e==="style"?Number.isInteger(t)?t:((n.state==="switch"?n.pendingStyle:n.style)+1)%3:void 0;return e==="style"&&(i<0||i>2||i===n.style)?!1:ni(n)?this._startAction(n,e,i):n.state==="broken"||n.state==="stun"&&n.stateDuration-n.stateTime>.18?!1:(n.buffer={name:e,targetStyle:i,expires:this.time+.32},!0)}setGuard(e){let t=this.player;t.guardHeld=!!e&&this.result==="playing",t.guardHeld&&t.state==="idle"&&this._enter(t,"guard"),!t.guardHeld&&t.state==="guard"&&this._enter(t,"idle")}setHybridStyle(e){Number.isInteger(e)&&e>=0&&e<3&&(this.player.hybridStyle=e)}setInput(e={}){this._input={x:Number.isFinite(e.x)?e.x:0,z:Number.isFinite(e.z)?e.z:0,aimX:Number.isFinite(e.aimX)?e.aimX:void 0,aimZ:Number.isFinite(e.aimZ)?e.aimZ:void 0}}update(e,t={}){if(!(!Number.isFinite(e)||e<=0||this.result!=="playing"))for(this.setInput(t),this._accumulator+=Math.min(e,.1);this._accumulator+1e-9>=Ja&&this.result==="playing";)this._accumulator-=Ja,this._step(Ja)}_event(e,t,n={}){this.events.push({type:e,actor:t.id,x:t.x,z:t.z,...n})}_enter(e,t,n=0){e.state=t,e.stateTime=0,e.stateDuration=n,e.invulnerable=!1,e.armored=this.mode==="boss"&&e.id==="enemy"&&(t==="windup"||t==="active"),t==="windup"?e.footwork="plant":t==="active"||t==="evade"?e.footwork="attack":t==="recovery"&&(e.footwork="plant"),["stun","broken","dead","evade","switch"].includes(t)&&(e._comboUntil=0,e.comboIndex=0,e.weightShift=0,e._motorX=0,e._motorZ=0),t==="guard"&&(e.guardEligible=e.guardCooldown<=0,e.guardEligible&&(e.guardCooldown=.38)),(t==="idle"||t==="guard")&&(e.attack=null,e.attackTime=0,e.attackDuration=0,e.weightShift=0)}_spend(e,t){e.stamina=Math.max(0,e.stamina-t),e.staminaDelay=.5}_startAction(e,t,n){if(t==="style")return e.stamina<5||n===e.style?!1:(this._spend(e,5),e.pendingStyle=n,this._enter(e,"switch",.14),!0);if(t==="evade"){if(e.stamina<18)return!1;this._spend(e,18);let a=Math.hypot(this._input.x,this._input.z);return e.dodgeX=a>.1?this._input.x/a:-Math.sin(e.yaw),e.dodgeZ=a>.1?this._input.z/a:-Math.cos(e.yaw),this._enter(e,"evade",.44),this._event("evade",e),!0}let i=t==="hybrid"?e.hybridStyle:e.style,s={...Ni[i][t==="light"?"light":"heavy"],kind:t,style:i};return t==="hybrid"&&(s.cost+=5,s.recovery+=.08,s.name=`Borrowed ${s.name.toLowerCase()}`),this._beginAttack(e,s)}_beginAttack(e,t){return e.stamina<t.cost?!1:(this._spend(e,t.cost),e.comboIndex=e.attackSequence>0&&this.time<e._comboUntil?(e.comboIndex+1)%3:0,e.attack={...t,comboIndex:e.comboIndex},e.attackTime=0,e.attackDuration=t.windup+t.active+t.recovery,e._comboUntil=this.time+e.attackDuration+.32,e._driveProgress=0,e._motorX*=.22,e._motorZ*=.22,e.hitTargets.clear(),e.attackSequence++,this._enter(e,"windup",t.windup),this._event("attack",e,{kind:t.kind,style:t.style,name:t.name,comboIndex:e.comboIndex}),!0)}_finish(e){let t=e.state;if(t==="windup"){this._enter(e,"active",e.attack.active),this._event("strike",e,{kind:e.attack.kind,style:e.attack.style,comboIndex:e.comboIndex});return}if(t==="active"){this._enter(e,"recovery",e.attack.recovery);return}t==="switch"&&(e.style=e.pendingStyle,this._event("style",e,{style:e.style})),t==="broken"&&(e.posture=e.maxPosture*.3),this._enter(e,"idle");let n=e.buffer;e.buffer=null,n&&n.expires>this.time&&this._startAction(e,n.name,n.targetStyle),e.state==="idle"&&e.guardHeld&&this._enter(e,"guard")}_tickFighter(e,t){if(e.state!=="dead"){if(e.guardCooldown=Math.max(0,e.guardCooldown-t),e.staminaDelay=Math.max(0,e.staminaDelay-t),e.postureDelay=Math.max(0,e.postureDelay-t),e.buffer&&e.buffer.expires<=this.time&&(e.buffer=null),ni(e)&&this.time>=e._comboUntil&&(e.comboIndex=0),ni(e)||e.state==="recovery"){if(e.staminaDelay<=0){let n=e.state==="guard"?13:32;e.stamina=Math.min(100,e.stamina+n*t)}e.postureDelay<=0&&e.state!=="guard"&&(e.posture=Math.max(0,e.posture-15*t))}if(e.stateTime+=t,e.attack&&(e.attackTime+=t),e.id==="player"&&e.state==="recovery"){let n=e.buffer,i=e.stateTime/e.stateDuration,s=n&&bu(n.name)?.72:.84;n&&i>=s?(e.buffer=null,this._startAction(e,n.name,n.targetStyle)):!n&&e.guardHeld&&i>=.84&&this._enter(e,"guard")}e.stateDuration>0&&e.stateTime+1e-9>=e.stateDuration&&this._finish(e),e.invulnerable=e.state==="evade"&&e.stateTime>=.025&&e.stateTime<.3}}_move(e,t,n,i,s){e.x+=t*i*s,e.z+=n*i*s,this._confine(e)}_steer(e,t,n,i,s,a=!1){let o=t-e._motorX,l=n-e._motorZ,c=Math.hypot(o,l),h=Math.min(1,i*s/Math.max(c,1e-8));e._motorX+=o*h,e._motorZ+=l*h;let u=e.x,d=e.z;this._move(e,e._motorX,e._motorZ,1,s),a&&(e.movePhase+=Math.hypot(e.x-u,e.z-d)*4)}_face(e,t,n,i,s){if(Math.hypot(t,n)<.01)return;let o=xs(Math.atan2(t,n),e.yaw)*(1-Math.exp(-i*s));e.yaw+=Ka(o,-24*s,24*s),e.yaw=Math.atan2(Math.sin(e.yaw),Math.cos(e.yaw))}_confine(e){let t=Math.hypot(e.x,e.z),n=this.arenaRadius-e.radius;if(t>n){e.x*=n/t,e.z*=n/t;let i=e.x/n,s=e.z/n,a=e._motorX*i+e._motorZ*s;a>0&&(e._motorX-=a*i,e._motorZ-=a*s)}}_movePlayer(e){let t=this.player;if(["dead","stun","broken","switch"].includes(t.state)){t.footwork="idle";return}if(t.state==="evade"){let u=8*(1-.75*Di((t.stateTime-.22)/.22));this._move(t,t.dodgeX,t.dodgeZ,u,e);return}let n=Math.hypot(this._input.x,this._input.z),i=Math.min(n,1),s=1;t.state==="guard"?s=.45:t.state==="windup"?s=.18*(1-Di(t.stateTime/(t.stateDuration*.55))):t.state==="active"?s=0:t.state==="recovery"&&(s=.65*Di((t.stateTime/t.stateDuration-.45)/.55));let a=(t.style===2?4.65:4.3)*i*s,o=n>0?this._input.x/n*a:0,l=n>0?this._input.z/n*a:0,c=a<Math.hypot(t._motorX,t._motorZ)||o*t._motorX+l*t._motorZ<0,h=ni(t)||t.state==="recovery"&&s>.15;if(this._steer(t,o,l,yc(t)?65:c?55:42,e,h),h&&(t.footwork=a<.05?"idle":o*Math.sin(t.yaw)+l*Math.cos(t.yaw)<-.2?"retreat":"approach"),ni(t)||t.state==="windup"&&t.stateTime<t.stateDuration*.65){let u=this._input.aimX,d=this._input.aimZ;(u===void 0||d===void 0||Math.hypot(u,d)<.01)&&(u=this.enemy.x-t.x,d=this.enemy.z-t.z),this._face(t,u,d,30,e)}}_updateAI(e){let t=this.enemy;if(!this.aiEnabled||t.state==="dead"){this._steer(t,0,0,22,e);return}let n=this.player.x-t.x,i=this.player.z-t.z,s=Math.hypot(n,i);if((ni(t)||t.state==="windup"&&t.stateTime<t.stateDuration*.65)&&this._face(t,n,i,12,e),!ni(t)){let _=0;t.state==="recovery"&&t.stateTime/t.stateDuration>.68&&s<1.2&&(_=-.7),this._steer(t,s>.01?n/s*_:0,s>.01?i/s*_:0,22,e,_!==0),_!==0&&(t.footwork="retreat");return}this._aiCooldown-=e;let a=Eu[this.mode],o={...a[this._aiStep%a.length]};this.phase===2&&(o.windup-=.1,o.recovery-=.06);let l=o.range*.78,c=s-l,h=Ka(c*3.5,-1.15,this.mode==="boss"?2.25:1.9),u=Math.abs(c)<.6&&this._aiCooldown>.16?(this._aiStep%2?-1:1)*.65:0,d=s>.01?n/s:0,p=s>.01?i/s:1,f=this._aiCooldown<=0&&s<o.range*.93&&Math.abs(xs(Math.atan2(n,i),t.yaw))<.2;this._steer(t,f?0:d*h-p*u,f?0:p*h+d*u,10,e,!f),t.footwork=f?"plant":c>.3?"approach":c<-.2?"retreat":u?"circle":"idle",f&&this._beginAttack(t,o)&&(this._aiStep++,this._aiCooldown=this.mode==="boss"?this.phase===2?.28:.48:.65)}_driveAttack(e){if(!yc(e)||!e.attack){e.weightShift=0;return}let t=e.attack,n=t.windup*.6,i=t.windup+t.active*.78,s=Di((e.attackTime-n)/(i-n)),a=Math.max(0,s-e._driveProgress)*t.lunge;e._driveProgress=s;let o=Math.sin(e.yaw),l=Math.cos(e.yaw),c=e.id==="player"?this.enemy:this.player,h=c.x-e.x,u=c.z-e.z,d=h*o+u*l,p=Math.abs(h*l-u*o),f=e.radius+c.radius+.06;d>0&&p<f&&(a=Math.min(a,Math.max(0,d-f))),this._move(e,o,l,a,1),e.weightShift=e.state==="windup"?Di((e.stateTime/e.stateDuration-.6)/.4):e.state==="active"?1:1-Di(e.stateTime/e.stateDuration)}_separate(){let e=this.enemy.x-this.player.x,t=this.enemy.z-this.player.z,n=Math.hypot(e,t),i=this.enemy.radius+this.player.radius;if(n>=i)return;let s=n>.001?e/n:1,a=n>.001?t/n:0,o=(i-n)/2;this.player.x-=s*o,this.player.z-=a*o,this.enemy.x+=s*o,this.enemy.z+=a*o,this._confine(this.player),this._confine(this.enemy)}_hitCandidate(e,t){if(e.state!=="active"||e.hitTargets.has(t.id)||t.state==="dead")return null;let n=t.x-e.x,i=t.z-e.z;return Math.hypot(n,i)>e.attack.range+t.radius*.35||Math.abs(xs(Math.atan2(n,i),e.yaw))>e.attack.arc/2?null:(e.hitTargets.add(t.id),{source:e,target:t,spec:{...e.attack}})}_break(e){e.posture=e.maxPosture,e.buffer=null,this._enter(e,"broken",e.id==="enemy"?1.45:1.05),this._event("break",e)}_receive({source:e,target:t,spec:n}){if(t.invulnerable){this._event("miss",e,{target:t.id,reason:"evade"});return}let i=Math.atan2(e.x-t.x,e.z-t.z),s=Math.abs(xs(i,t.yaw))<Math.PI*.48;if(t.state==="guard"&&s){if(t.guardEligible&&t.stateTime<(t.style===1?.24:.17)&&t.stamina>=3){this._spend(t,3),t.posture=Math.max(0,t.posture-12),e.posture=Math.min(e.maxPosture,e.posture+32),e.postureDelay=1,e.buffer=null,e.posture>=e.maxPosture?this._break(e):this._enter(e,"stun",.72),this._event("deflect",t,{target:e.id});return}this._spend(t,n.posture*.48),t.posture=Math.min(t.maxPosture,t.posture+n.posture),t.postureDelay=1,this._event("block",t,{target:e.id}),(t.stamina<=0||t.posture>=t.maxPosture)&&this._break(t);return}let a=t.state==="broken",o=n.damage*(a?1.35:1);t.health=Math.max(0,t.health-o),t.posture=Math.min(t.maxPosture,t.posture+n.posture*.72),t.postureDelay=1,t.buffer=null,t.health<=0?this._enter(t,"dead"):!a&&t.posture>=t.maxPosture?this._break(t):!a&&!t.armored&&this._enter(t,"stun",t.id==="enemy"?.25:.26),this._event("hit",e,{target:t.id,x:t.x,z:t.z,damage:o,kind:n.kind,style:n.style,armored:t.armored})}_step(e){this.time+=e;let t=[this.player,this.enemy].map(i=>({x:i.x,z:i.z}));this._movePlayer(e),this._updateAI(e),this._tickFighter(this.player,e),this._tickFighter(this.enemy,e);for(let i of[this.player,this.enemy])this._driveAttack(i);this._separate();let n=[this._hitCandidate(this.player,this.enemy),this._hitCandidate(this.enemy,this.player)];for(let i of n)i&&this._receive(i);if([this.player,this.enemy].forEach((i,s)=>{i.vx=(i.x-t[s].x)/e,i.vz=(i.z-t[s].z)/e,i.speed=Math.hypot(i.vx,i.vz)}),this.player.health<=0||this.enemy.health<=0){this.result=this.player.health<=0?"lost":"won",this._event(this.result==="won"?"win":"lose",this.player);return}this.mode==="boss"&&this.phase===1&&this.enemy.health<=this.enemy.maxHealth*.5&&(this.phase=2,this._aiCooldown=1.2,this._event("phase",this.enemy,{phase:2}))}};var Uh=2;var Tu=0,wu=1,dr=2;var pr=2;var hi=100,Au=101,Ru=102;var Cu=200,Pu=201,Iu=202,Lu=203,Oo=204,Fo=205,Uu=206,Du=207,Nu=208,Ou=209,Fu=210,Bu=211,zu=212,ku=213,Hu=214,Gu=0,Vu=1,Wu=2,Xu=3,ju=4,qu=5,Yu=6,Zu=7;var Dh=4;var Nh=300,er=301,tr=302,Hr=303,Bo=304,Fa=306,Gr=1e3,Vr=1001,zo=1002,Qt=1003,Ju=1004;var Ss=1005;var Tn=1006,$a=1007;var Ji=1008;var Wn=1009,Oh=1010,Fh=1011,Wr=1012,rc=1013,pi=1014,cn=1015,as=1016,sc=1017,ac=1018,nr=1020,Bh=35902,zh=1021,kh=1022,hn=1023,Hh=1024,Gh=1025,Xr=1026,ir=1027,oc=1028,lc=1029,Vh=1030,cc=1031;var hc=1033,ta=33776,na=33777,ia=33778,ra=33779,ko=35840,Ho=35841,Go=35842,Vo=35843,Wo=36196,Xo=37492,jo=37496,qo=37808,Yo=37809,Zo=37810,Jo=37811,Ko=37812,$o=37813,Qo=37814,el=37815,tl=37816,nl=37817,il=37818,rl=37819,sl=37820,al=37821,sa=36492,ol=36494,ll=36495,Wh=36283,cl=36284,hl=36285,ul=36286;var oa=2300,dl=2301,Qa=2302,Mc=2400,Sc=2401,bc=2402;var Hn="",vt="srgb",mr="srgb-linear",Ba="linear",Qe="srgb";var Oi=7680;var Ku=512,$u=513,Qu=514,ed=515,td=516,nd=517,id=518,rd=519,Ec=35044,Xh=35048;var Tc="300 es",rr=2e3,la=2001,Xn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let i=n.indexOf(t);i!==-1&&n.splice(i,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let i=0,s=n.length;i<s;i++)n[i].call(this,e);e.target=null}}},Mt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var aa=Math.PI/180,pl=180/Math.PI;function fr(){let r=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0;return(Mt[255&r]+Mt[r>>8&255]+Mt[r>>16&255]+Mt[r>>24&255]+"-"+Mt[255&e]+Mt[e>>8&255]+"-"+Mt[e>>16&15|64]+Mt[e>>24&255]+"-"+Mt[63&t|128]+Mt[t>>8&255]+"-"+Mt[t>>16&255]+Mt[t>>24&255]+Mt[255&n]+Mt[n>>8&255]+Mt[n>>16&255]+Mt[n>>24&255]).toLowerCase()}function _t(r,e,t){return Math.max(e,Math.min(t,r))}function sd(r,e){return(r%e+e)%e}function eo(r,e,t){return(1-t)*r+t*e}function wr(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function It(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("Invalid component type.")}}var fe=class r{constructor(e=0,t=0){r.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(_t(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ve=class r{constructor(e,t,n,i,s,a,o,l,c){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],f=n[8],_=i[0],m=i[3],g=i[6],v=i[1],y=i[4],M=i[7],I=i[2],C=i[5],L=i[8];return s[0]=a*_+o*v+l*I,s[3]=a*m+o*y+l*C,s[6]=a*g+o*M+l*L,s[1]=c*_+h*v+u*I,s[4]=c*m+h*y+u*C,s[7]=c*g+h*M+u*L,s[2]=d*_+p*v+f*I,s[5]=d*m+p*y+f*C,s[8]=d*g+p*M+f*L,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*s,p=c*s-a*l,f=t*u+n*d+i*p;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/f;return e[0]=u*_,e[1]=(i*c-h*n)*_,e[2]=(o*n-i*a)*_,e[3]=d*_,e[4]=(h*t-i*l)*_,e[5]=(i*s-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(to.makeScale(e,t)),this}rotate(e){return this.premultiply(to.makeRotation(-e)),this}translate(e,t){return this.premultiply(to.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},to=new Ve;function jh(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function ca(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function ad(){let r=ca("canvas");return r.style.display="block",r}var wc={};function Fr(r){r in wc||(wc[r]=!0,console.warn(r))}var Ye={enabled:!0,workingColorSpace:mr,spaces:{},convert:function(r,e,t){return this.enabled!==!1&&e!==t&&e&&t&&(this.spaces[e].transfer===Qe&&(r.r=wn(r.r),r.g=wn(r.g),r.b=wn(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Qe&&(r.r=$i(r.r),r.g=$i(r.g),r.b=$i(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Hn?Ba:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function wn(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function $i(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}var Ac=[.64,.33,.3,.6,.15,.06],Rc=[.2126,.7152,.0722],Cc=[.3127,.329],Pc=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ic=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715),Fi;Ye.define({[mr]:{primaries:Ac,whitePoint:Cc,transfer:Ba,toXYZ:Pc,fromXYZ:Ic,luminanceCoefficients:Rc,workingColorSpaceConfig:{unpackColorSpace:vt},outputColorSpaceConfig:{drawingBufferColorSpace:vt}},[vt]:{primaries:Ac,whitePoint:Cc,transfer:Qe,toXYZ:Pc,fromXYZ:Ic,luminanceCoefficients:Rc,outputColorSpaceConfig:{drawingBufferColorSpace:vt}}});var ml=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Fi===void 0&&(Fi=ca("canvas")),Fi.width=e.width,Fi.height=e.height;let n=Fi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Fi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ca("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=255*wn(s[a]/255);return n.putImageData(i,0,0),t}if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(255*wn(t[n]/255)):t[n]=wn(t[n]);return{data:t,width:e.width,height:e.height}}return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},od=0,ha=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:od++}),this.uuid=fr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(no(i[a].image)):s.push(no(i[a]))}else s=no(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function no(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?ml.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var ld=0,Lt=class r extends Xn{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,n=1001,i=1001,s=1006,a=1008,o=1023,l=1009,c=r.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ld++}),this.uuid=fr(),this.name="",this.source=new ha(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new fe(0,0),this.repeat=new fe(1,1),this.center=new fe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Nh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Gr:e.x=e.x-Math.floor(e.x);break;case Vr:e.x=e.x<0?0:1;break;case zo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Gr:e.y=e.y-Math.floor(e.y);break;case Vr:e.y=e.y<0?0:1;break;case zo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null,Lt.DEFAULT_MAPPING=Nh,Lt.DEFAULT_ANISOTROPY=1;var Ze=class r{constructor(e=0,t=0,n=0,i=1){r.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],f=l[9],_=l[2],m=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(f-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(f+m)<.1&&Math.abs(c+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let y=(c+1)/2,M=(p+1)/2,I=(g+1)/2,C=(h+d)/4,L=(u+_)/4,F=(f+m)/4;return y>M&&y>I?y<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(y),i=C/n,s=L/n):M>I?M<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(M),n=C/i,s=F/i):I<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(I),n=L/s,i=F/s),this.set(n,i,s,t),this}let v=Math.sqrt((m-f)*(m-f)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(v)<.001&&(v=1),this.x=(m-f)/v,this.y=(u-_)/v,this.z=(d-h)/v,this.w=Math.acos((c+p+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},fl=class extends Xn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Ze(0,0,e,t),this.scissorTest=!1,this.viewport=new Ze(0,0,e,t);let i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let s=new Lt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new ha(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},An=class extends fl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ua=class extends Lt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=Vr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var gl=class extends Lt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=Vr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var un=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=s[a+0],p=s[a+1],f=s[a+2],_=s[a+3];if(o===0)return e[t+0]=l,e[t+1]=c,e[t+2]=h,void(e[t+3]=u);if(o===1)return e[t+0]=d,e[t+1]=p,e[t+2]=f,void(e[t+3]=_);if(u!==_||l!==d||c!==p||h!==f){let m=1-o,g=l*d+c*p+h*f+u*_,v=g>=0?1:-1,y=1-g*g;if(y>Number.EPSILON){let I=Math.sqrt(y),C=Math.atan2(I,g*v);m=Math.sin(m*C)/I,o=Math.sin(o*C)/I}let M=o*v;if(l=l*m+d*M,c=c*m+p*M,h=h*m+f*M,u=u*m+_*M,m===1-o){let I=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=I,c*=I,h*=I,u*=I}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[a],d=s[a+1],p=s[a+2],f=s[a+3];return e[t]=o*f+h*u+l*p-c*d,e[t+1]=l*f+h*d+c*u-o*p,e[t+2]=c*f+h*p+o*d-l*u,e[t+3]=h*f-o*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(s/2),d=l(n/2),p=l(i/2),f=l(s/2);switch(a){case"XYZ":this._x=d*h*u+c*p*f,this._y=c*p*u-d*h*f,this._z=c*h*f+d*p*u,this._w=c*h*u-d*p*f;break;case"YXZ":this._x=d*h*u+c*p*f,this._y=c*p*u-d*h*f,this._z=c*h*f-d*p*u,this._w=c*h*u+d*p*f;break;case"ZXY":this._x=d*h*u-c*p*f,this._y=c*p*u+d*h*f,this._z=c*h*f+d*p*u,this._w=c*h*u-d*p*f;break;case"ZYX":this._x=d*h*u-c*p*f,this._y=c*p*u+d*h*f,this._z=c*h*f-d*p*u,this._w=c*h*u+d*p*f;break;case"YZX":this._x=d*h*u+c*p*f,this._y=c*p*u+d*h*f,this._z=c*h*f-d*p*u,this._w=c*h*u-d*p*f;break;case"XZY":this._x=d*h*u-c*p*f,this._y=c*p*u-d*h*f,this._z=c*h*f+d*p*u,this._w=c*h*u+d*p*f;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(s-c)*p,this._z=(a-i)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(s+c)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(s-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-i)/p,this._x=(s+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(_t(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class r{constructor(e=0,t=0,n=0){r.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Lc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Lc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=i+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return io.copy(this).projectOnVector(e),this.sub(io)}reflect(e){return this.sub(io.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(_t(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},io=new R,Lc=new un,Ft=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Jt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Jt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Jt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Jt):Jt.fromBufferAttribute(s,a),Jt.applyMatrix4(e.matrixWorld),this.expandByPoint(Jt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),bs.copy(n.boundingBox)),bs.applyMatrix4(e.matrixWorld),this.union(bs)}let i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Jt),Jt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ar),Es.subVectors(this.max,Ar),Bi.subVectors(e.a,Ar),zi.subVectors(e.b,Ar),ki.subVectors(e.c,Ar),Nn.subVectors(zi,Bi),On.subVectors(ki,zi),ii.subVectors(Bi,ki);let t=[0,-Nn.z,Nn.y,0,-On.z,On.y,0,-ii.z,ii.y,Nn.z,0,-Nn.x,On.z,0,-On.x,ii.z,0,-ii.x,-Nn.y,Nn.x,0,-On.y,On.x,0,-ii.y,ii.x,0];return!!ro(t,Bi,zi,ki,Es)&&(t=[1,0,0,0,1,0,0,0,1],!!ro(t,Bi,zi,ki,Es)&&(Ts.crossVectors(Nn,On),t=[Ts.x,Ts.y,Ts.z],ro(t,Bi,zi,ki,Es)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(Jt).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(yn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},yn=[new R,new R,new R,new R,new R,new R,new R,new R],Jt=new R,bs=new Ft,Bi=new R,zi=new R,ki=new R,Nn=new R,On=new R,ii=new R,Ar=new R,Es=new R,Ts=new R,ri=new R;function ro(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){ri.fromArray(r,s);let o=i.x*Math.abs(ri.x)+i.y*Math.abs(ri.y)+i.z*Math.abs(ri.z),l=e.dot(ri),c=t.dot(ri),h=n.dot(ri);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var cd=new Ft,Rr=new R,so=new R,tn=class{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):cd.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Rr.subVectors(e,this.center);let t=Rr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=.5*(n-this.radius);this.center.addScaledVector(Rr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(so.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Rr.copy(e.center).add(so)),this.expandByPoint(Rr.copy(e.center).sub(so))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},xn=new R,ao=new R,ws=new R,Fn=new R,oo=new R,As=new R,lo=new R,jn=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=xn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xn.copy(this.origin).addScaledVector(this.direction,t),xn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){ao.copy(e).add(t).multiplyScalar(.5),ws.copy(t).sub(e).normalize(),Fn.copy(this.origin).sub(ao);let s=.5*e.distanceTo(t),a=-this.direction.dot(ws),o=Fn.dot(this.direction),l=-Fn.dot(ws),c=Fn.lengthSq(),h=Math.abs(1-a*a),u,d,p,f;if(h>0)if(u=a*l-o,d=a*o-l,f=s*h,u>=0)if(d>=-f)if(d<=f){let _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=s,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-f?(u=Math.max(0,-(-a*s+o)),d=u>0?-s:Math.min(Math.max(-s,-l),s),p=-u*u+d*(d+2*l)+c):d<=f?(u=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(u=Math.max(0,-(a*s+o)),d=u>0?s:Math.min(Math.max(-s,-l),s),p=-u*u+d*(d+2*l)+c);else d=a>0?-s:s,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(ao).addScaledVector(ws,d),p}intersectSphere(e,t){xn.subVectors(e.center,this.origin);let n=xn.dot(this.direction),i=xn.dot(xn)-n*n,s=e.radius*e.radius;if(i>s)return null;let a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(s=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(s=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||s>i?null:((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>i?null:((o>n||n!=n)&&(n=o),(l<i||i!=i)&&(i=l),i<0?null:this.at(n>=0?n:i,t)))}intersectsBox(e){return this.intersectBox(e,xn)!==null}intersectTriangle(e,t,n,i,s){oo.subVectors(t,e),As.subVectors(n,e),lo.crossVectors(oo,As);let a,o=this.direction.dot(lo);if(o>0){if(i)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}Fn.subVectors(this.origin,e);let l=a*this.direction.dot(As.crossVectors(Fn,As));if(l<0)return null;let c=a*this.direction.dot(oo.cross(Fn));if(c<0||l+c>o)return null;let h=-a*Fn.dot(lo);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},je=class r{constructor(e,t,n,i,s,a,o,l,c,h,u,d,p,f,_,m){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,u,d,p,f,_,m)}set(e,t,n,i,s,a,o,l,c,h,u,d,p,f,_,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=i,g[1]=s,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=p,g[7]=f,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/Hi.setFromMatrixColumn(e,0).length(),s=1/Hi.setFromMatrixColumn(e,1).length(),a=1/Hi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){let d=a*h,p=a*u,f=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+f*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=f+p*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,f=c*h,_=c*u;t[0]=d+_*o,t[4]=f*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-f,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,f=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=f+p*o,t[1]=p+f*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,p=a*u,f=o*h,_=o*u;t[0]=l*h,t[4]=f*c-p,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=p*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,p=a*c,f=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=f*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+f,t[10]=d-_*u}else if(e.order==="XZY"){let d=a*l,p=a*c,f=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=p*u-f,t[2]=f*u-p,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(hd,e,ud)}lookAt(e,t,n){let i=this.elements;return Nt.subVectors(e,t),Nt.lengthSq()===0&&(Nt.z=1),Nt.normalize(),Bn.crossVectors(n,Nt),Bn.lengthSq()===0&&(Math.abs(n.z)===1?Nt.x+=1e-4:Nt.z+=1e-4,Nt.normalize(),Bn.crossVectors(n,Nt)),Bn.normalize(),Rs.crossVectors(Nt,Bn),i[0]=Bn.x,i[4]=Rs.x,i[8]=Nt.x,i[1]=Bn.y,i[5]=Rs.y,i[9]=Nt.y,i[2]=Bn.z,i[6]=Rs.z,i[10]=Nt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],f=n[2],_=n[6],m=n[10],g=n[14],v=n[3],y=n[7],M=n[11],I=n[15],C=i[0],L=i[4],F=i[8],G=i[12],q=i[1],Z=i[5],j=i[9],H=i[13],z=i[2],se=i[6],ee=i[10],pe=i[14],me=i[3],Ae=i[7],Ce=i[11],ue=i[15];return s[0]=a*C+o*q+l*z+c*me,s[4]=a*L+o*Z+l*se+c*Ae,s[8]=a*F+o*j+l*ee+c*Ce,s[12]=a*G+o*H+l*pe+c*ue,s[1]=h*C+u*q+d*z+p*me,s[5]=h*L+u*Z+d*se+p*Ae,s[9]=h*F+u*j+d*ee+p*Ce,s[13]=h*G+u*H+d*pe+p*ue,s[2]=f*C+_*q+m*z+g*me,s[6]=f*L+_*Z+m*se+g*Ae,s[10]=f*F+_*j+m*ee+g*Ce,s[14]=f*G+_*H+m*pe+g*ue,s[3]=v*C+y*q+M*z+I*me,s[7]=v*L+y*Z+M*se+I*Ae,s[11]=v*F+y*j+M*ee+I*Ce,s[15]=v*G+y*H+M*pe+I*ue,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14];return e[3]*(+s*l*u-i*c*u-s*o*d+n*c*d+i*o*p-n*l*p)+e[7]*(+t*l*p-t*c*d+s*a*d-i*a*p+i*c*h-s*l*h)+e[11]*(+t*c*u-t*o*p-s*a*u+n*a*p+s*o*h-n*c*h)+e[15]*(-i*o*h-t*l*u+t*o*d+i*a*u-n*a*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],f=e[12],_=e[13],m=e[14],g=e[15],v=u*m*c-_*d*c+_*l*p-o*m*p-u*l*g+o*d*g,y=f*d*c-h*m*c-f*l*p+a*m*p+h*l*g-a*d*g,M=h*_*c-f*u*c+f*o*p-a*_*p-h*o*g+a*u*g,I=f*u*l-h*_*l-f*o*d+a*_*d+h*o*m-a*u*m,C=t*v+n*y+i*M+s*I;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/C;return e[0]=v*L,e[1]=(_*d*s-u*m*s-_*i*p+n*m*p+u*i*g-n*d*g)*L,e[2]=(o*m*s-_*l*s+_*i*c-n*m*c-o*i*g+n*l*g)*L,e[3]=(u*l*s-o*d*s-u*i*c+n*d*c+o*i*p-n*l*p)*L,e[4]=y*L,e[5]=(h*m*s-f*d*s+f*i*p-t*m*p-h*i*g+t*d*g)*L,e[6]=(f*l*s-a*m*s-f*i*c+t*m*c+a*i*g-t*l*g)*L,e[7]=(a*d*s-h*l*s+h*i*c-t*d*c-a*i*p+t*l*p)*L,e[8]=M*L,e[9]=(f*u*s-h*_*s-f*n*p+t*_*p+h*n*g-t*u*g)*L,e[10]=(a*_*s-f*o*s+f*n*c-t*_*c-a*n*g+t*o*g)*L,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*p-t*o*p)*L,e[12]=I*L,e[13]=(h*_*i-f*u*i+f*n*d-t*_*d-h*n*m+t*u*m)*L,e[14]=(f*o*i-a*_*i-f*n*l+t*_*l+a*n*m-t*o*m)*L,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*d+t*o*d)*L,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,d=s*c,p=s*h,f=s*u,_=a*h,m=a*u,g=o*u,v=l*c,y=l*h,M=l*u,I=n.x,C=n.y,L=n.z;return i[0]=(1-(_+g))*I,i[1]=(p+M)*I,i[2]=(f-y)*I,i[3]=0,i[4]=(p-M)*C,i[5]=(1-(d+g))*C,i[6]=(m+v)*C,i[7]=0,i[8]=(f+y)*L,i[9]=(m-v)*L,i[10]=(1-(d+_))*L,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=Hi.set(i[0],i[1],i[2]).length(),a=Hi.set(i[4],i[5],i[6]).length(),o=Hi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],Kt.copy(this);let l=1/s,c=1/a,h=1/o;return Kt.elements[0]*=l,Kt.elements[1]*=l,Kt.elements[2]*=l,Kt.elements[4]*=c,Kt.elements[5]*=c,Kt.elements[6]*=c,Kt.elements[8]*=h,Kt.elements[9]*=h,Kt.elements[10]*=h,t.setFromRotationMatrix(Kt),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=2e3){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i),p,f;if(o===rr)p=-(a+s)/(a-s),f=-2*a*s/(a-s);else{if(o!==la)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);p=-a/(a-s),f=-a*s/(a-s)}return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=f,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=2e3){let l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),d=(t+e)*c,p=(n+i)*h,f,_;if(o===rr)f=(a+s)*u,_=-2*u;else{if(o!==la)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);f=s*u,_=-1*u}return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-f,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Hi=new R,Kt=new je,hd=new R(0,0,0),ud=new R(1,1,1),Bn=new R,Rs=new R,Nt=new R,Uc=new je,Dc=new un,dn=class r{constructor(e=0,t=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(_t(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-_t(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(_t(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-_t(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(_t(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-_t(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Uc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Uc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Dc.setFromEuler(this),this.setFromQuaternion(Dc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};dn.DEFAULT_ORDER="XYZ";var da=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return!!(this.mask&e.mask)}isEnabled(e){return!!(this.mask&1<<e)}},dd=0,Nc=new R,Gi=new un,Mn=new je,Cs=new R,Cr=new R,pd=new R,md=new un,Oc=new R(1,0,0),Fc=new R(0,1,0),Bc=new R(0,0,1),zc={type:"added"},fd={type:"removed"},Vi={type:"childadded",child:null},co={type:"childremoved",child:null},yt=class r extends Xn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=fr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new R,t=new dn,n=new un,i=new R(1,1,1);t._onChange((function(){n.setFromEuler(t,!1)})),n._onChange((function(){t.setFromQuaternion(n,void 0,!1)})),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new je},normalMatrix:{value:new Ve}}),this.matrix=new je,this.matrixWorld=new je,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new da,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Gi.setFromAxisAngle(e,t),this.quaternion.multiply(Gi),this}rotateOnWorldAxis(e,t){return Gi.setFromAxisAngle(e,t),this.quaternion.premultiply(Gi),this}rotateX(e){return this.rotateOnAxis(Oc,e)}rotateY(e){return this.rotateOnAxis(Fc,e)}rotateZ(e){return this.rotateOnAxis(Bc,e)}translateOnAxis(e,t){return Nc.copy(e).applyQuaternion(this.quaternion),this.position.add(Nc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Oc,e)}translateY(e){return this.translateOnAxis(Fc,e)}translateZ(e){return this.translateOnAxis(Bc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Cs.copy(e):Cs.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Cr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Mn.lookAt(Cr,Cs,this.up):Mn.lookAt(Cs,Cr,this.up),this.quaternion.setFromRotationMatrix(Mn),i&&(Mn.extractRotation(i.matrixWorld),Gi.setFromRotationMatrix(Mn),this.quaternion.premultiply(Gi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(zc),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(fd),co.child=e,this.dispatchEvent(co),co.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(zc),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let s=this.children[n].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cr,e,pd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cr,md,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map((o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()}))),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()})),this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations),f=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),f.length>0&&(n.nodes=f)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};yt.DEFAULT_UP=new R(0,1,0),yt.DEFAULT_MATRIX_AUTO_UPDATE=!0,yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var $t=new R,Sn=new R,ho=new R,bn=new R,Wi=new R,Xi=new R,kc=new R,uo=new R,po=new R,mo=new R,fo=new Ze,go=new Ze,vo=new Ze,Gn=class r{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),$t.subVectors(e,t),i.cross($t);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){$t.subVectors(i,t),Sn.subVectors(n,t),ho.subVectors(e,t);let a=$t.dot($t),o=$t.dot(Sn),l=$t.dot(ho),c=Sn.dot(Sn),h=Sn.dot(ho),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;let d=1/u,p=(c*l-o*h)*d,f=(a*h-o*l)*d;return s.set(1-p-f,f,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,bn)!==null&&bn.x>=0&&bn.y>=0&&bn.x+bn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,bn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,bn.x),l.addScaledVector(a,bn.y),l.addScaledVector(o,bn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return fo.setScalar(0),go.setScalar(0),vo.setScalar(0),fo.fromBufferAttribute(e,t),go.fromBufferAttribute(e,n),vo.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(fo,s.x),a.addScaledVector(go,s.y),a.addScaledVector(vo,s.z),a}static isFrontFacing(e,t,n,i){return $t.subVectors(n,t),Sn.subVectors(e,t),$t.cross(Sn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return $t.subVectors(this.c,this.b),Sn.subVectors(this.a,this.b),.5*$t.cross(Sn).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return r.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,a,o;Wi.subVectors(i,n),Xi.subVectors(s,n),uo.subVectors(e,n);let l=Wi.dot(uo),c=Xi.dot(uo);if(l<=0&&c<=0)return t.copy(n);po.subVectors(e,i);let h=Wi.dot(po),u=Xi.dot(po);if(h>=0&&u<=h)return t.copy(i);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Wi,a);mo.subVectors(e,s);let p=Wi.dot(mo),f=Xi.dot(mo);if(f>=0&&p<=f)return t.copy(s);let _=p*c-l*f;if(_<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(Xi,o);let m=h*f-p*u;if(m<=0&&u-h>=0&&p-f>=0)return kc.subVectors(s,i),o=(u-h)/(u-h+(p-f)),t.copy(i).addScaledVector(kc,o);let g=1/(m+_+d);return a=_*g,o=d*g,t.copy(n).addScaledVector(Wi,a).addScaledVector(Xi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},zn={h:0,s:0,l:0},Ps={h:0,s:0,l:0};function _o(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(e-r)*t:t<.5?e:t<2/3?r+6*(e-r)*(2/3-t):r}var ze=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=vt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,Ye.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=Ye.workingColorSpace){if(e=sd(e,1),t=_t(t,0,1),n=_t(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=_o(a,s,e+1/3),this.g=_o(a,s,e),this.b=_o(a,s,e-1/3)}return Ye.toWorkingColorSpace(this,i),this}setStyle(e,t=vt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=vt){let n=qh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=wn(e.r),this.g=wn(e.g),this.b=wn(e.b),this}copyLinearToSRGB(e){return this.r=$i(e.r),this.g=$i(e.g),this.b=$i(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=vt){return Ye.fromWorkingColorSpace(St.copy(this),e),65536*Math.round(_t(255*St.r,0,255))+256*Math.round(_t(255*St.g,0,255))+Math.round(_t(255*St.b,0,255))}getHexString(e=vt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.fromWorkingColorSpace(St.copy(this),t);let n=St.r,i=St.g,s=St.b,a=Math.max(n,i,s),o=Math.min(n,i,s),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.fromWorkingColorSpace(St.copy(this),t),e.r=St.r,e.g=St.g,e.b=St.b,e}getStyle(e=vt){Ye.fromWorkingColorSpace(St.copy(this),e);let t=St.r,n=St.g,i=St.b;return e!==vt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*n)},${Math.round(255*i)})`}offsetHSL(e,t,n){return this.getHSL(zn),this.setHSL(zn.h+e,zn.s+t,zn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(zn),e.getHSL(Ps);let n=eo(zn.h,Ps.h,t),i=eo(zn.s,Ps.s,t),s=eo(zn.l,Ps.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},St=new ze;ze.NAMES=qh;var gd=0,Rn=class extends Xn{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=fr(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Oo,this.blendDst=Fo,this.blendEquation=hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ze(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Oi,this.stencilZFail=Oi,this.stencilZPass=Oi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];i!==void 0?i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n:console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};function i(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Oo&&(n.blendSrc=this.blendSrc),this.blendDst!==Fo&&(n.blendDst=this.blendDst),this.blendEquation!==hi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Oi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Oi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Oi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData),t){let s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},sr=class extends Rn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},bm=vd();function vd(){let r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[256|l]=32768,i[l]=24,i[256|l]=24):c<-14?(n[l]=1024>>-c-14,n[256|l]=1024>>-c-14|32768,i[l]=-c-1,i[256|l]=-c-1):c<=15?(n[l]=c+15<<10,n[256|l]=c+15<<10|32768,i[l]=13,i[256|l]=13):c<128?(n[l]=31744,n[256|l]=64512,i[l]=24,i[256|l]=24):(n[l]=31744,n[256|l]=64512,i[l]=13,i[256|l]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(8388608&c);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}var lt=new R,Is=new fe,ht=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ec,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Is.fromBufferAttribute(this,t),Is.applyMatrix3(e),this.setXY(t,Is.x,Is.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)lt.fromBufferAttribute(this,t),lt.applyMatrix3(e),this.setXYZ(t,lt.x,lt.y,lt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)lt.fromBufferAttribute(this,t),lt.applyMatrix4(e),this.setXYZ(t,lt.x,lt.y,lt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)lt.fromBufferAttribute(this,t),lt.applyNormalMatrix(e),this.setXYZ(t,lt.x,lt.y,lt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)lt.fromBufferAttribute(this,t),lt.transformDirection(e),this.setXYZ(t,lt.x,lt.y,lt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=wr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wr(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wr(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wr(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),i=It(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),i=It(i,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ec&&(e.usage=this.usage),e}};var pa=class extends ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ma=class extends ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var De=class extends ht{constructor(e,t,n){super(new Float32Array(e),t,n)}},_d=0,Vt=new je,yo=new yt,ji=new R,Ot=new Ft,Pr=new Ft,ft=new R,Je=class r extends Xn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=fr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jh(e)?ma:pa)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Ve().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Vt.makeRotationFromQuaternion(e),this.applyMatrix4(Vt),this}rotateX(e){return Vt.makeRotationX(e),this.applyMatrix4(Vt),this}rotateY(e){return Vt.makeRotationY(e),this.applyMatrix4(Vt),this}rotateZ(e){return Vt.makeRotationZ(e),this.applyMatrix4(Vt),this}translate(e,t,n){return Vt.makeTranslation(e,t,n),this.applyMatrix4(Vt),this}scale(e,t,n){return Vt.makeScale(e,t,n),this.applyMatrix4(Vt),this}lookAt(e){return yo.lookAt(e),yo.updateMatrix(),this.applyMatrix4(yo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ji).negate(),this.translate(ji.x,ji.y,ji.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,s=e.length;i<s;i++){let a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new De(n,3))}else{for(let n=0,i=t.count;n<i;n++){let s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ft);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];Ot.setFromBufferAttribute(s),this.morphTargetsRelative?(ft.addVectors(this.boundingBox.min,Ot.min),this.boundingBox.expandByPoint(ft),ft.addVectors(this.boundingBox.max,Ot.max),this.boundingBox.expandByPoint(ft)):(this.boundingBox.expandByPoint(Ot.min),this.boundingBox.expandByPoint(Ot.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new R,1/0);if(e){let n=this.boundingSphere.center;if(Ot.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Pr.setFromBufferAttribute(o),this.morphTargetsRelative?(ft.addVectors(Ot.min,Pr.min),Ot.expandByPoint(ft),ft.addVectors(Ot.max,Pr.max),Ot.expandByPoint(ft)):(Ot.expandByPoint(Pr.min),Ot.expandByPoint(Pr.max))}Ot.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)ft.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(ft));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ft.fromBufferAttribute(o,c),l&&(ji.fromBufferAttribute(e,c),ft.add(ji)),i=Math.max(i,n.distanceToSquared(ft))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ht(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let F=0;F<n.count;F++)o[F]=new R,l[F]=new R;let c=new R,h=new R,u=new R,d=new fe,p=new fe,f=new fe,_=new R,m=new R;function g(F,G,q){c.fromBufferAttribute(n,F),h.fromBufferAttribute(n,G),u.fromBufferAttribute(n,q),d.fromBufferAttribute(s,F),p.fromBufferAttribute(s,G),f.fromBufferAttribute(s,q),h.sub(c),u.sub(c),p.sub(d),f.sub(d);let Z=1/(p.x*f.y-f.x*p.y);isFinite(Z)&&(_.copy(h).multiplyScalar(f.y).addScaledVector(u,-p.y).multiplyScalar(Z),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-f.x).multiplyScalar(Z),o[F].add(_),o[G].add(_),o[q].add(_),l[F].add(m),l[G].add(m),l[q].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let F=0,G=v.length;F<G;++F){let q=v[F],Z=q.start;for(let j=Z,H=Z+q.count;j<H;j+=3)g(e.getX(j+0),e.getX(j+1),e.getX(j+2))}let y=new R,M=new R,I=new R,C=new R;function L(F){I.fromBufferAttribute(i,F),C.copy(I);let G=o[F];y.copy(G),y.sub(I.multiplyScalar(I.dot(G))).normalize(),M.crossVectors(C,G);let q=M.dot(l[F])<0?-1:1;a.setXYZW(F,y.x,y.y,y.z,q)}for(let F=0,G=v.length;F<G;++F){let q=v[F],Z=q.start;for(let j=Z,H=Z+q.count;j<H;j+=3)L(e.getX(j+0)),L(e.getX(j+1)),L(e.getX(j+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ht(new Float32Array(3*t.count),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let i=new R,s=new R,a=new R,o=new R,l=new R,c=new R,h=new R,u=new R;if(e)for(let d=0,p=e.count;d<p;d+=3){let f=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,f),s.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),o.fromBufferAttribute(n,f),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ft.fromBufferAttribute(e,t),ft.normalize(),e.setXYZ(t,ft.x,ft.y,ft.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),p=0,f=0;for(let _=0,m=l.length;_<m;_++){p=o.isInterleavedBufferAttribute?l[_]*o.data.stride+o.offset:l[_]*h;for(let g=0;g<h;g++)d[f++]=c[p++]}return new ht(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,n=this.index.array,i=this.attributes;for(let o in i){let l=e(i[o],n);t.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){let d=e(c[h],n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],u=s[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Hc=new je,si=new jn,Ls=new tn,Gc=new R,Us=new R,Ds=new R,Ns=new R,xo=new R,Os=new R,Vc=new R,Fs=new R,Et=class extends yt{constructor(e=new Je,t=new sr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(s&&o){Os.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=o[l],u=s[l];h!==0&&(xo.fromBufferAttribute(u,e),a?Os.addScaledVector(xo,h):Os.addScaledVector(xo.sub(t),h))}t.add(Os)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i!==void 0){if(n.boundingSphere===null&&n.computeBoundingSphere(),Ls.copy(n.boundingSphere),Ls.applyMatrix4(s),si.copy(e.ray).recast(e.near),Ls.containsPoint(si.origin)===!1&&(si.intersectSphere(Ls,Gc)===null||si.origin.distanceToSquared(Gc)>(e.far-e.near)**2))return;Hc.copy(s).invert(),si.copy(e.ray).applyMatrix4(Hc),n.boundingBox!==null&&si.intersectsBox(n.boundingBox)===!1||this._computeIntersections(e,t,si)}}_computeIntersections(e,t,n){let i,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,_=d.length;f<_;f++){let m=d[f],g=a[m.materialIndex];for(let v=Math.max(m.start,p.start),y=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));v<y;v+=3)i=Bs(this,g,e,n,c,h,u,o.getX(v),o.getX(v+1),o.getX(v+2)),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}else for(let f=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);f<_;f+=3)i=Bs(this,a,e,n,c,h,u,o.getX(f),o.getX(f+1),o.getX(f+2)),i&&(i.faceIndex=Math.floor(f/3),t.push(i));else if(l!==void 0)if(Array.isArray(a))for(let f=0,_=d.length;f<_;f++){let m=d[f],g=a[m.materialIndex];for(let v=Math.max(m.start,p.start),y=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));v<y;v+=3)i=Bs(this,g,e,n,c,h,u,v,v+1,v+2),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}else for(let f=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);f<_;f+=3)i=Bs(this,a,e,n,c,h,u,f,f+1,f+2),i&&(i.faceIndex=Math.floor(f/3),t.push(i))}};function Bs(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,Us),r.getVertexPosition(l,Ds),r.getVertexPosition(c,Ns);let h=(function(u,d,p,f,_,m,g,v){let y;if(y=d.side===1?f.intersectTriangle(g,m,_,!0,v):f.intersectTriangle(_,m,g,d.side===0,v),y===null)return null;Fs.copy(v),Fs.applyMatrix4(u.matrixWorld);let M=p.ray.origin.distanceTo(Fs);return M<p.near||M>p.far?null:{distance:M,point:Fs.clone(),object:u}})(r,e,t,n,Us,Ds,Ns,Vc);if(h){let u=new R;Gn.getBarycoord(Vc,Us,Ds,Ns,u),i&&(h.uv=Gn.getInterpolatedAttribute(i,o,l,c,u,new fe)),s&&(h.uv1=Gn.getInterpolatedAttribute(s,o,l,c,u,new fe)),a&&(h.normal=Gn.getInterpolatedAttribute(a,o,l,c,u,new R),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new R,materialIndex:0};Gn.getNormal(Us,Ds,Ns,d.normal),h.face=d,h.barycoord=u}return h}var pn=class r extends Je{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};let o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,p=0;function f(_,m,g,v,y,M,I,C,L,F,G){let q=M/L,Z=I/F,j=M/2,H=I/2,z=C/2,se=L+1,ee=F+1,pe=0,me=0,Ae=new R;for(let Ce=0;Ce<ee;Ce++){let ue=Ce*Z-H;for(let le=0;le<se;le++){let xe=le*q-j;Ae[_]=xe*v,Ae[m]=ue*y,Ae[g]=z,c.push(Ae.x,Ae.y,Ae.z),Ae[_]=0,Ae[m]=0,Ae[g]=C>0?1:-1,h.push(Ae.x,Ae.y,Ae.z),u.push(le/L),u.push(1-Ce/F),pe+=1}}for(let Ce=0;Ce<F;Ce++)for(let ue=0;ue<L;ue++){let le=d+ue+se*Ce,xe=d+ue+se*(Ce+1),we=d+(ue+1)+se*(Ce+1),te=d+(ue+1)+se*Ce;l.push(le,xe,te),l.push(xe,we,te),me+=6}o.addGroup(p,me,G),p+=me,d+=pe}f("z","y","x",-1,-1,n,t,e,a,s,0),f("z","y","x",1,-1,n,t,-e,a,s,1),f("x","z","y",1,1,e,n,t,i,a,2),f("x","z","y",1,-1,e,n,-t,i,a,3),f("x","y","z",1,-1,e,t,n,i,s,4),f("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new De(c,3)),this.setAttribute("normal",new De(h,3)),this.setAttribute("uv",new De(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ar(r){let e={};for(let t in r){e[t]={};for(let n in r[t]){let i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function wt(r){let e={};for(let t=0;t<r.length;t++){let n=ar(r[t]);for(let i in n)e[i]=n[i]}return e}function Yh(r){let e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var yd={clone:ar,merge:wt},mn=class extends Rn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ar(e.uniforms),this.uniformsGroups=(function(t){let n=[];for(let i=0;i<t.length;i++)n.push(t[i].clone());return n})(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let s=this.uniforms[i].value;s&&s.isTexture?t.uniforms[i]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[i]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[i]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[i]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[i]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[i]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[i]={type:"m4",value:s.toArray()}:t.uniforms[i]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},jr=class extends yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new je,this.projectionMatrix=new je,this.projectionMatrixInverse=new je,this.coordinateSystem=rr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},kn=new R,Wc=new fe,Xc=new fe,bt=class extends jr{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=2*pl*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(.5*aa*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*pl*Math.atan(Math.tan(.5*aa*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){kn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(kn.x,kn.y).multiplyScalar(-e/kn.z),kn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(kn.x,kn.y).multiplyScalar(-e/kn.z)}getViewSize(e,t){return this.getViewBounds(e,Wc,Xc),t.subVectors(Xc,Wc)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(.5*aa*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},qi=-90,vl=class extends yt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new bt(qi,1,e,t);i.layers=this.layers,this.add(i);let s=new bt(qi,1,e,t);s.layers=this.layers,this.add(s);let a=new bt(qi,1,e,t);a.layers=this.layers,this.add(a);let o=new bt(qi,1,e,t);o.layers=this.layers,this.add(o);let l=new bt(qi,1,e,t);l.layers=this.layers,this.add(l);let c=new bt(qi,1,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(let c of t)this.remove(c);if(e===rr)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else{if(e!==la)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1)}for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=f,n.texture.needsPMREMUpdate=!0}},fa=class extends Lt{constructor(e,t,n,i,s,a,o,l,c,h){super(e=e!==void 0?e:[],t=t!==void 0?t:er,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},_l=class extends An{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new fa(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Tn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new pn(5,5,5),s=new mn({name:"CubemapFromEquirect",uniforms:ar(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;let a=new Et(i,s),o=t.minFilter;return t.minFilter===Ji&&(t.minFilter=Tn),new vl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}},Mo=new R,xd=new R,Md=new Ve,En=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Mo.subVectors(n,t).cross(xd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Mo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Md.getNormalMatrix(e),i=this.coplanarPoint(Mo).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ai=new tn,zs=new R,or=class{constructor(e=new En,t=new En,n=new En,i=new En,s=new En,a=new En){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2e3){let n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],p=i[8],f=i[9],_=i[10],m=i[11],g=i[12],v=i[13],y=i[14],M=i[15];if(n[0].setComponents(l-s,d-c,m-p,M-g).normalize(),n[1].setComponents(l+s,d+c,m+p,M+g).normalize(),n[2].setComponents(l+a,d+h,m+f,M+v).normalize(),n[3].setComponents(l-a,d-h,m-f,M-v).normalize(),n[4].setComponents(l-o,d-u,m-_,M-y).normalize(),t===rr)n[5].setComponents(l+o,d+u,m+_,M+y).normalize();else{if(t!==la)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);n[5].setComponents(o,u,_,y).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ai)}intersectsSprite(e){return ai.center.set(0,0,0),ai.radius=.7071067811865476,ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(ai)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(zs.x=i.normal.x>0?e.max.x:e.min.x,zs.y=i.normal.y>0?e.max.y:e.min.y,zs.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(zs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Zh(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Sd(r){let e=new WeakMap;return{get:function(t){return t.isInterleavedBufferAttribute&&(t=t.data),e.get(t)},remove:function(t){t.isInterleavedBufferAttribute&&(t=t.data);let n=e.get(t);n&&(r.deleteBuffer(n.buffer),e.delete(t))},update:function(t,n){if(t.isInterleavedBufferAttribute&&(t=t.data),t.isGLBufferAttribute){let s=e.get(t);return void((!s||s.version<t.version)&&e.set(t,{buffer:t.buffer,type:t.type,bytesPerElement:t.elementSize,version:t.version}))}let i=e.get(t);if(i===void 0)e.set(t,(function(s,a){let o=s.array,l=s.usage,c=o.byteLength,h=r.createBuffer(),u;if(r.bindBuffer(a,h),r.bufferData(a,o,l),s.onUploadCallback(),o instanceof Float32Array)u=r.FLOAT;else if(o instanceof Uint16Array)u=s.isFloat16BufferAttribute?r.HALF_FLOAT:r.UNSIGNED_SHORT;else if(o instanceof Int16Array)u=r.SHORT;else if(o instanceof Uint32Array)u=r.UNSIGNED_INT;else if(o instanceof Int32Array)u=r.INT;else if(o instanceof Int8Array)u=r.BYTE;else if(o instanceof Uint8Array)u=r.UNSIGNED_BYTE;else{if(!(o instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);u=r.UNSIGNED_BYTE}return{buffer:h,type:u,bytesPerElement:o.BYTES_PER_ELEMENT,version:s.version,size:c}})(t,n));else if(i.version<t.version){if(i.size!==t.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(s,a,o){let l=a.array,c=a.updateRanges;if(r.bindBuffer(o,s),c.length===0)r.bufferSubData(o,0,l);else{c.sort(((u,d)=>u.start-d.start));let h=0;for(let u=1;u<c.length;u++){let d=c[h],p=c[u];p.start<=d.start+d.count+1?d.count=Math.max(d.count,p.start+p.count-d.start):(++h,c[h]=p)}c.length=h+1;for(let u=0,d=c.length;u<d;u++){let p=c[u];r.bufferSubData(o,p.start*l.BYTES_PER_ELEMENT,l,p.start,p.count)}a.clearUpdateRanges()}a.onUploadCallback()})(i.buffer,t,n),i.version=t.version}}}}var nn=class r extends Je{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,d=t/l,p=[],f=[],_=[],m=[];for(let g=0;g<h;g++){let v=g*d-a;for(let y=0;y<c;y++){let M=y*u-s;f.push(M,-v,0),_.push(0,0,1),m.push(y/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let v=0;v<o;v++){let y=v+c*g,M=v+c*(g+1),I=v+1+c*(g+1),C=v+1+c*g;p.push(y,M,C),p.push(M,I,C)}this.setIndex(p),this.setAttribute("position",new De(f,3)),this.setAttribute("normal",new De(_,3)),this.setAttribute("uv",new De(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},Xe={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},be={common:{diffuse:{value:new ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new fe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ze(16777215)},opacity:{value:1},center:{value:new fe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},ln={basic:{uniforms:wt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:wt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ze(0)}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:wt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ze(0)},specular:{value:new ze(1118481)},shininess:{value:30}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:wt([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:wt([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new ze(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:wt([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:wt([be.points,be.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:wt([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:wt([be.common,be.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:wt([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:wt([be.sprite,be.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distanceRGBA:{uniforms:wt([be.common,be.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distanceRGBA_vert,fragmentShader:Xe.distanceRGBA_frag},shadow:{uniforms:wt([be.lights,be.fog,{color:{value:new ze(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};ln.physical={uniforms:wt([ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new fe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new fe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ze(0)},specularColor:{value:new ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new fe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var ks={r:0,b:0,g:0},oi=new dn,bd=new je;function Ed(r,e,t,n,i,s,a){let o=new ze(0),l,c,h=s===!0?0:1,u=null,d=0,p=null;function f(m){let g=m.isScene===!0?m.background:null;return g&&g.isTexture&&(g=(m.backgroundBlurriness>0?t:e).get(g)),g}function _(m,g){m.getRGB(ks,Yh(r)),n.buffers.color.setClear(ks.r,ks.g,ks.b,g,a)}return{getClearColor:function(){return o},setClearColor:function(m,g=1){o.set(m),h=g,_(o,h)},getClearAlpha:function(){return h},setClearAlpha:function(m){h=m,_(o,h)},render:function(m){let g=!1,v=f(m);v===null?_(o,h):v&&v.isColor&&(_(v,1),g=!0);let y=r.xr.getEnvironmentBlendMode();y==="additive"?n.buffers.color.setClear(0,0,0,1,a):y==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||g)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))},addToRenderList:function(m,g){let v=f(g);v&&(v.isCubeTexture||v.mapping===Fa)?(c===void 0&&(c=new Et(new pn(1,1,1),new mn({name:"BackgroundCubeMaterial",uniforms:ar(ln.backgroundCube.uniforms),vertexShader:ln.backgroundCube.vertexShader,fragmentShader:ln.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(y,M,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),oi.copy(g.backgroundRotation),oi.x*=-1,oi.y*=-1,oi.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(oi.y*=-1,oi.z*=-1),c.material.uniforms.envMap.value=v,c.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(bd.makeRotationFromEuler(oi)),c.material.toneMapped=Ye.getTransfer(v.colorSpace)!==Qe,u===v&&d===v.version&&p===r.toneMapping||(c.material.needsUpdate=!0,u=v,d=v.version,p=r.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Et(new nn(2,2),new mn({name:"BackgroundMaterial",uniforms:ar(ln.background.uniforms),vertexShader:ln.background.vertexShader,fragmentShader:ln.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(v.colorSpace)!==Qe,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),u===v&&d===v.version&&p===r.toneMapping||(l.material.needsUpdate=!0,u=v,d=v.version,p=r.toneMapping),l.layers.enableAll(),m.unshift(l,l.geometry,l.material,0,0,null))}}}function Td(r,e){let t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=c(null),s=i,a=!1;function o(g){return r.bindVertexArray(g)}function l(g){return r.deleteVertexArray(g)}function c(g){let v=[],y=[],M=[];for(let I=0;I<t;I++)v[I]=0,y[I]=0,M[I]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:v,enabledAttributes:y,attributeDivisors:M,object:g,attributes:{},index:null}}function h(){let g=s.newAttributes;for(let v=0,y=g.length;v<y;v++)g[v]=0}function u(g){d(g,0)}function d(g,v){let y=s.newAttributes,M=s.enabledAttributes,I=s.attributeDivisors;y[g]=1,M[g]===0&&(r.enableVertexAttribArray(g),M[g]=1),I[g]!==v&&(r.vertexAttribDivisor(g,v),I[g]=v)}function p(){let g=s.newAttributes,v=s.enabledAttributes;for(let y=0,M=v.length;y<M;y++)v[y]!==g[y]&&(r.disableVertexAttribArray(y),v[y]=0)}function f(g,v,y,M,I,C,L){L===!0?r.vertexAttribIPointer(g,v,y,I,C):r.vertexAttribPointer(g,v,y,M,I,C)}function _(){m(),a=!0,s!==i&&(s=i,o(s.object))}function m(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:function(g,v,y,M,I){let C=!1,L=(function(F,G,q){let Z=q.wireframe===!0,j=n[F.id];j===void 0&&(j={},n[F.id]=j);let H=j[G.id];H===void 0&&(H={},j[G.id]=H);let z=H[Z];return z===void 0&&(z=c(r.createVertexArray()),H[Z]=z),z})(M,y,v);s!==L&&(s=L,o(s.object)),C=(function(F,G,q,Z){let j=s.attributes,H=G.attributes,z=0,se=q.getAttributes();for(let ee in se)if(se[ee].location>=0){let pe=j[ee],me=H[ee];if(me===void 0&&(ee==="instanceMatrix"&&F.instanceMatrix&&(me=F.instanceMatrix),ee==="instanceColor"&&F.instanceColor&&(me=F.instanceColor)),pe===void 0||pe.attribute!==me||me&&pe.data!==me.data)return!0;z++}return s.attributesNum!==z||s.index!==Z})(g,M,y,I),C&&(function(F,G,q,Z){let j={},H=G.attributes,z=0,se=q.getAttributes();for(let ee in se)if(se[ee].location>=0){let pe=H[ee];pe===void 0&&(ee==="instanceMatrix"&&F.instanceMatrix&&(pe=F.instanceMatrix),ee==="instanceColor"&&F.instanceColor&&(pe=F.instanceColor));let me={};me.attribute=pe,pe&&pe.data&&(me.data=pe.data),j[ee]=me,z++}s.attributes=j,s.attributesNum=z,s.index=Z})(g,M,y,I),I!==null&&e.update(I,r.ELEMENT_ARRAY_BUFFER),(C||a)&&(a=!1,(function(F,G,q,Z){h();let j=Z.attributes,H=q.getAttributes(),z=G.defaultAttributeValues;for(let se in H){let ee=H[se];if(ee.location>=0){let pe=j[se];if(pe===void 0&&(se==="instanceMatrix"&&F.instanceMatrix&&(pe=F.instanceMatrix),se==="instanceColor"&&F.instanceColor&&(pe=F.instanceColor)),pe!==void 0){let me=pe.normalized,Ae=pe.itemSize,Ce=e.get(pe);if(Ce===void 0)continue;let ue=Ce.buffer,le=Ce.type,xe=Ce.bytesPerElement,we=le===r.INT||le===r.UNSIGNED_INT||pe.gpuType===rc;if(pe.isInterleavedBufferAttribute){let te=pe.data,E=te.stride,A=pe.offset;if(te.isInstancedInterleavedBuffer){for(let O=0;O<ee.locationSize;O++)d(ee.location+O,te.meshPerAttribute);F.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let O=0;O<ee.locationSize;O++)u(ee.location+O);r.bindBuffer(r.ARRAY_BUFFER,ue);for(let O=0;O<ee.locationSize;O++)f(ee.location+O,Ae/ee.locationSize,le,me,E*xe,(A+Ae/ee.locationSize*O)*xe,we)}else{if(pe.isInstancedBufferAttribute){for(let te=0;te<ee.locationSize;te++)d(ee.location+te,pe.meshPerAttribute);F.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=pe.meshPerAttribute*pe.count)}else for(let te=0;te<ee.locationSize;te++)u(ee.location+te);r.bindBuffer(r.ARRAY_BUFFER,ue);for(let te=0;te<ee.locationSize;te++)f(ee.location+te,Ae/ee.locationSize,le,me,Ae*xe,Ae/ee.locationSize*te*xe,we)}}else if(z!==void 0){let me=z[se];if(me!==void 0)switch(me.length){case 2:r.vertexAttrib2fv(ee.location,me);break;case 3:r.vertexAttrib3fv(ee.location,me);break;case 4:r.vertexAttrib4fv(ee.location,me);break;default:r.vertexAttrib1fv(ee.location,me)}}}}p()})(g,v,y,M),I!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(I).buffer))},reset:_,resetDefaultState:m,dispose:function(){_();for(let g in n){let v=n[g];for(let y in v){let M=v[y];for(let I in M)l(M[I].object),delete M[I];delete v[y]}delete n[g]}},releaseStatesOfGeometry:function(g){if(n[g.id]===void 0)return;let v=n[g.id];for(let y in v){let M=v[y];for(let I in M)l(M[I].object),delete M[I];delete v[y]}delete n[g.id]},releaseStatesOfProgram:function(g){for(let v in n){let y=n[v];if(y[g.id]===void 0)continue;let M=y[g.id];for(let I in M)l(M[I].object),delete M[I];delete y[g.id]}},initAttributes:h,enableAttribute:u,disableUnusedAttributes:p}}function wd(r,e,t){let n;function i(s,a,o){o!==0&&(r.drawArraysInstanced(n,s,a,o),t.update(a,n,o))}this.setMode=function(s){n=s},this.render=function(s,a){r.drawArrays(n,s,a),t.update(a,n,1)},this.renderInstances=i,this.renderMultiDraw=function(s,a,o){if(o===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,s,0,a,0,o);let l=0;for(let c=0;c<o;c++)l+=a[c];t.update(l,n,1)},this.renderMultiDrawInstances=function(s,a,o,l){if(o===0)return;let c=e.get("WEBGL_multi_draw");if(c===null)for(let h=0;h<s.length;h++)i(s[h],a[h],l[h]);else{c.multiDrawArraysInstancedWEBGL(n,s,0,a,0,l,0,o);let h=0;for(let u=0;u<o;u++)h+=a[u]*l[u];t.update(h,n,1)}}}function Ad(r,e,t,n){let i;function s(d){if(d==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";d="mediump"}return d==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=t.precision!==void 0?t.precision:"highp",o=s(a);o!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);let l=t.logarithmicDepthBuffer===!0,c=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),h=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),u=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS);return{isWebGL2:!0,getMaxAnisotropy:function(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let d=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(d.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i},getMaxPrecision:s,textureFormatReadable:function(d){return d===hn||n.convert(d)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)},textureTypeReadable:function(d){let p=d===as&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(d!==Wn&&n.convert(d)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&d!==cn&&!p)},precision:a,logarithmicDepthBuffer:l,reverseDepthBuffer:c,maxTextures:h,maxVertexTextures:u,maxTextureSize:r.getParameter(r.MAX_TEXTURE_SIZE),maxCubemapSize:r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),maxAttributes:r.getParameter(r.MAX_VERTEX_ATTRIBS),maxVertexUniforms:r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),maxVaryings:r.getParameter(r.MAX_VARYING_VECTORS),maxFragmentUniforms:r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),vertexTextures:u>0,maxSamples:r.getParameter(r.MAX_SAMPLES)}}function Rd(r){let e=this,t=null,n=0,i=!1,s=!1,a=new En,o=new Ve,l={value:null,needsUpdate:!1};function c(h,u,d,p){let f=h!==null?h.length:0,_=null;if(f!==0){if(_=l.value,p!==!0||_===null){let m=d+4*f,g=u.matrixWorldInverse;o.getNormalMatrix(g),(_===null||_.length<m)&&(_=new Float32Array(m));for(let v=0,y=d;v!==f;++v,y+=4)a.copy(h[v]).applyMatrix4(g,o),a.normal.toArray(_,y),_[y+3]=a.constant}l.value=_,l.needsUpdate=!0}return e.numPlanes=f,e.numIntersection=0,_}this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){let d=h.length!==0||u||n!==0||i;return i=u,n=h.length,d},this.beginShadows=function(){s=!0,c(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,u){t=c(h,u,0)},this.setState=function(h,u,d){let p=h.clippingPlanes,f=h.clipIntersection,_=h.clipShadows,m=r.get(h);if(!i||p===null||p.length===0||s&&!_)s?c(null):(function(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0})();else{let g=s?0:n,v=4*g,y=m.clippingState||null;l.value=y,y=c(p,u,v,d);for(let M=0;M!==v;++M)y[M]=t[M];m.clippingState=y,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=g}}}function Cd(r){let e=new WeakMap;function t(i,s){return s===Hr?i.mapping=er:s===Bo&&(i.mapping=tr),i}function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping;if(s===Hr||s===Bo){if(e.has(i))return t(e.get(i).texture,i.mapping);{let a=i.image;if(a&&a.height>0){let o=new _l(a.height);return o.fromEquirectangularTexture(r,i),e.set(i,o),i.addEventListener("dispose",n),t(o.texture,i.mapping)}return null}}}return i},dispose:function(){e=new WeakMap}}}var ga=class extends jr{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},jc=[.125,.215,.35,.446,.526,.582],Ir=20,So=new ga,qc=new ze,bo=null,Eo=0,To=0,wo=!1,ci=(1+Math.sqrt(5))/2,Yi=1/ci,Yc=[new R(-ci,Yi,0),new R(ci,Yi,0),new R(-Yi,0,ci),new R(Yi,0,ci),new R(0,ci,-Yi),new R(0,ci,Yi),new R(-1,1,-1),new R(1,1,-1),new R(-1,1,1),new R(1,1,1)],va=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){bo=this._renderer.getRenderTarget(),Eo=this._renderer.getActiveCubeFace(),To=this._renderer.getActiveMipmapLevel(),wo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Jc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(bo,Eo,To),this._renderer.xr.enabled=wo,e.scissorTest=!1,Hs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===er||e.mapping===tr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bo=this._renderer.getRenderTarget(),Eo=this._renderer.getActiveCubeFace(),To=this._renderer.getActiveMipmapLevel(),wo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tn,minFilter:Tn,generateMipmaps:!1,type:as,format:hn,colorSpace:mr,depthBuffer:!1},i=Zc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=(function(a){let o=[],l=[],c=[],h=a,u=a-4+1+jc.length;for(let d=0;d<u;d++){let p=Math.pow(2,h);l.push(p);let f=1/p;d>a-4?f=jc[d-a+4-1]:d===0&&(f=0),c.push(f);let _=1/(p-2),m=-_,g=1+_,v=[m,m,g,m,g,g,m,m,g,g,m,g],y=6,M=6,I=3,C=2,L=1,F=new Float32Array(I*M*y),G=new Float32Array(C*M*y),q=new Float32Array(L*M*y);for(let j=0;j<y;j++){let H=j%3*2/3-1,z=j>2?0:-1,se=[H,z,0,H+2/3,z,0,H+2/3,z+1,0,H,z,0,H+2/3,z+1,0,H,z+1,0];F.set(se,I*M*j),G.set(v,C*M*j);let ee=[j,j,j,j,j,j];q.set(ee,L*M*j)}let Z=new Je;Z.setAttribute("position",new ht(F,I)),Z.setAttribute("uv",new ht(G,C)),Z.setAttribute("faceIndex",new ht(q,L)),o.push(Z),h>4&&h--}return{lodPlanes:o,sizeLods:l,sigmas:c}})(s)),this._blurMaterial=(function(a,o,l){let c=new Float32Array(Ir),h=new R(0,1,0);return new mn({name:"SphericalGaussianBlur",defines:{n:Ir,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/l,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:c},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:h}},vertexShader:uc(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})})(s,e,t)}return i}_compileMaterial(e){let t=new Et(this._lodPlanes[0],e);this._renderer.compile(t,So)}_sceneToCubeUV(e,t,n,i){let s=new bt(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(qc),l.toneMapping=0,l.autoClear=!1;let u=new sr({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),d=new Et(new pn,u),p=!1,f=e.background;f?f.isColor&&(u.color.copy(f),e.background=null,p=!0):(u.color.copy(qc),p=!0);for(let _=0;_<6;_++){let m=_%3;m===0?(s.up.set(0,a[_],0),s.lookAt(o[_],0,0)):m===1?(s.up.set(0,0,a[_]),s.lookAt(0,o[_],0)):(s.up.set(0,a[_],0),s.lookAt(0,0,o[_]));let g=this._cubeSize;Hs(i,m*g,_>2?g:0,g,g),l.setRenderTarget(i),p&&l.render(d,s),l.render(e,s)}d.geometry.dispose(),d.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=f}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===er||e.mapping===tr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Kc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Jc());let s=i?this._cubemapMaterial:this._equirectMaterial,a=new Et(this._lodPlanes[0],s);s.uniforms.envMap.value=e;let o=this._cubeSize;Hs(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(a,So)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let s=1;s<i;s++){let a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Yc[(i-s-1)%Yc.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=new Et(this._lodPlanes[i],c),u=c.uniforms,d=this._sizeLods[n]-1,p=isFinite(s)?Math.PI/(2*d):2*Math.PI/39,f=s/p,_=isFinite(s)?1+Math.floor(3*f):Ir;_>Ir&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${_} samples when the maximum is set to 20`);let m=[],g=0;for(let M=0;M<Ir;++M){let I=M/f,C=Math.exp(-I*I/2);m.push(C),M===0?g+=C:M<_&&(g+=2*C)}for(let M=0;M<m.length;M++)m[M]=m[M]/g;u.envMap.value=e.texture,u.samples.value=_,u.weights.value=m,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:v}=this;u.dTheta.value=p,u.mipInt.value=v-n;let y=this._sizeLods[i];Hs(t,3*y*(i>v-4?i-v+4:0),4*(this._cubeSize-y),3*y,2*y),l.setRenderTarget(t),l.render(h,So)}};function Zc(r,e,t){let n=new An(r,e,t);return n.texture.mapping=Fa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Hs(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function Jc(){return new mn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:uc(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Kc(){return new mn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:uc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function uc(){return`

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
	`}function Pd(r){let e=new WeakMap,t=null;function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping,a=s===Hr||s===Bo,o=s===er||s===tr;if(a||o){let l=e.get(i),c=l!==void 0?l.texture.pmremVersion:0;if(i.isRenderTargetTexture&&i.pmremVersion!==c)return t===null&&(t=new va(r)),l=a?t.fromEquirectangular(i,l):t.fromCubemap(i,l),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),l.texture;if(l!==void 0)return l.texture;{let h=i.image;return a&&h&&h.height>0||o&&h&&(function(u){let d=0,p=6;for(let f=0;f<p;f++)u[f]!==void 0&&d++;return d===p})(h)?(t===null&&(t=new va(r)),l=a?t.fromEquirectangular(i):t.fromCubemap(i),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),i.addEventListener("dispose",n),l.texture):null}}}return i},dispose:function(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}}}function Id(r){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&Fr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Ld(r,e,t,n){let i={},s=new WeakMap;function a(l){let c=l.target;c.index!==null&&e.remove(c.index);for(let u in c.attributes)e.remove(c.attributes[u]);for(let u in c.morphAttributes){let d=c.morphAttributes[u];for(let p=0,f=d.length;p<f;p++)e.remove(d[p])}c.removeEventListener("dispose",a),delete i[c.id];let h=s.get(c);h&&(e.remove(h),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function o(l){let c=[],h=l.index,u=l.attributes.position,d=0;if(h!==null){let _=h.array;d=h.version;for(let m=0,g=_.length;m<g;m+=3){let v=_[m+0],y=_[m+1],M=_[m+2];c.push(v,y,y,M,M,v)}}else{if(u===void 0)return;{let _=u.array;d=u.version;for(let m=0,g=_.length/3-1;m<g;m+=3){let v=m+0,y=m+1,M=m+2;c.push(v,y,y,M,M,v)}}}let p=new(jh(c)?ma:pa)(c,1);p.version=d;let f=s.get(l);f&&e.remove(f),s.set(l,p)}return{get:function(l,c){return i[c.id]===!0||(c.addEventListener("dispose",a),i[c.id]=!0,t.memory.geometries++),c},update:function(l){let c=l.attributes;for(let u in c)e.update(c[u],r.ARRAY_BUFFER);let h=l.morphAttributes;for(let u in h){let d=h[u];for(let p=0,f=d.length;p<f;p++)e.update(d[p],r.ARRAY_BUFFER)}},getWireframeAttribute:function(l){let c=s.get(l);if(c){let h=l.index;h!==null&&c.version<h.version&&o(l)}else o(l);return s.get(l)}}}function Ud(r,e,t){let n,i,s;function a(o,l,c){c!==0&&(r.drawElementsInstanced(n,l,i,o*s,c),t.update(l,n,c))}this.setMode=function(o){n=o},this.setIndex=function(o){i=o.type,s=o.bytesPerElement},this.render=function(o,l){r.drawElements(n,l,i,o*s),t.update(l,n,1)},this.renderInstances=a,this.renderMultiDraw=function(o,l,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,l,0,i,o,0,c);let h=0;for(let u=0;u<c;u++)h+=l[u];t.update(h,n,1)},this.renderMultiDrawInstances=function(o,l,c,h){if(c===0)return;let u=e.get("WEBGL_multi_draw");if(u===null)for(let d=0;d<o.length;d++)a(o[d]/s,l[d],h[d]);else{u.multiDrawElementsInstancedWEBGL(n,l,0,i,o,0,h,0,c);let d=0;for(let p=0;p<c;p++)d+=l[p]*h[p];t.update(d,n,1)}}}function Dd(r){let e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,n,i){switch(e.calls++,n){case r.TRIANGLES:e.triangles+=i*(t/3);break;case r.LINES:e.lines+=i*(t/2);break;case r.LINE_STRIP:e.lines+=i*(t-1);break;case r.LINE_LOOP:e.lines+=i*t;break;case r.POINTS:e.points+=i*t;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",n)}}}}function Nd(r,e,t){let n=new WeakMap,i=new Ze;return{update:function(s,a,o){let l=s.morphTargetInfluences,c=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=c!==void 0?c.length:0,u=n.get(a);if(u===void 0||u.count!==h){let F=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",F)};u!==void 0&&u.texture.dispose();let d=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,f=a.morphAttributes.color!==void 0,_=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],g=a.morphAttributes.color||[],v=0;d===!0&&(v=1),p===!0&&(v=2),f===!0&&(v=3);let y=a.attributes.position.count*v,M=1;y>e.maxTextureSize&&(M=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let I=new Float32Array(y*M*4*h),C=new ua(I,y,M,h);C.type=cn,C.needsUpdate=!0;let L=4*v;for(let G=0;G<h;G++){let q=_[G],Z=m[G],j=g[G],H=y*M*4*G;for(let z=0;z<q.count;z++){let se=z*L;d===!0&&(i.fromBufferAttribute(q,z),I[H+se+0]=i.x,I[H+se+1]=i.y,I[H+se+2]=i.z,I[H+se+3]=0),p===!0&&(i.fromBufferAttribute(Z,z),I[H+se+4]=i.x,I[H+se+5]=i.y,I[H+se+6]=i.z,I[H+se+7]=0),f===!0&&(i.fromBufferAttribute(j,z),I[H+se+8]=i.x,I[H+se+9]=i.y,I[H+se+10]=i.z,I[H+se+11]=j.itemSize===4?i.w:1)}}u={count:h,texture:C,size:new fe(y,M)},n.set(a,u),a.addEventListener("dispose",F)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)o.getUniforms().setValue(r,"morphTexture",s.morphTexture,t);else{let d=0;for(let f=0;f<l.length;f++)d+=l[f];let p=a.morphTargetsRelative?1:1-d;o.getUniforms().setValue(r,"morphTargetBaseInfluence",p),o.getUniforms().setValue(r,"morphTargetInfluences",l)}o.getUniforms().setValue(r,"morphTargetsTexture",u.texture,t),o.getUniforms().setValue(r,"morphTargetsTextureSize",u.size)}}}function Od(r,e,t,n){let i=new WeakMap;function s(a){let o=a.target;o.removeEventListener("dispose",s),t.remove(o.instanceMatrix),o.instanceColor!==null&&t.remove(o.instanceColor)}return{update:function(a){let o=n.render.frame,l=a.geometry,c=e.get(a,l);if(i.get(c)!==o&&(e.update(c),i.set(c,o)),a.isInstancedMesh&&(a.hasEventListener("dispose",s)===!1&&a.addEventListener("dispose",s),i.get(a)!==o&&(t.update(a.instanceMatrix,r.ARRAY_BUFFER),a.instanceColor!==null&&t.update(a.instanceColor,r.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let h=a.skeleton;i.get(h)!==o&&(h.update(),i.set(h,o))}return c},dispose:function(){i=new WeakMap}}}var _a=class extends Lt{constructor(e,t,n,i,s,a,o,l,c,h=1026){if(h!==Xr&&h!==ir)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Xr&&(n=pi),n===void 0&&h===ir&&(n=nr),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Qt,this.minFilter=l!==void 0?l:Qt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Jh=new Lt,$c=new _a(1,1),Kh=new ua,$h=new gl,Qh=new fa,Qc=[],eh=[],th=new Float32Array(16),nh=new Float32Array(9),ih=new Float32Array(4);function gr(r,e,t){let n=r[0];if(n<=0||n>0)return r;let i=e*t,s=Qc[i];if(s===void 0&&(s=new Float32Array(i),Qc[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function ut(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function dt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function za(r,e){let t=eh[e];t===void 0&&(t=new Int32Array(e),eh[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Fd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Bd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ut(t,e))return;r.uniform2fv(this.addr,e),dt(t,e)}}function zd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ut(t,e))return;r.uniform3fv(this.addr,e),dt(t,e)}}function kd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ut(t,e))return;r.uniform4fv(this.addr,e),dt(t,e)}}function Hd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(ut(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),dt(t,e)}else{if(ut(t,n))return;ih.set(n),r.uniformMatrix2fv(this.addr,!1,ih),dt(t,n)}}function Gd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(ut(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),dt(t,e)}else{if(ut(t,n))return;nh.set(n),r.uniformMatrix3fv(this.addr,!1,nh),dt(t,n)}}function Vd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(ut(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),dt(t,e)}else{if(ut(t,n))return;th.set(n),r.uniformMatrix4fv(this.addr,!1,th),dt(t,n)}}function Wd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Xd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ut(t,e))return;r.uniform2iv(this.addr,e),dt(t,e)}}function jd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ut(t,e))return;r.uniform3iv(this.addr,e),dt(t,e)}}function qd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ut(t,e))return;r.uniform4iv(this.addr,e),dt(t,e)}}function Yd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Zd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ut(t,e))return;r.uniform2uiv(this.addr,e),dt(t,e)}}function Jd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ut(t,e))return;r.uniform3uiv(this.addr,e),dt(t,e)}}function Kd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ut(t,e))return;r.uniform4uiv(this.addr,e),dt(t,e)}}function $d(r,e,t){let n=this.cache,i=t.allocateTextureUnit(),s;n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),this.type===r.SAMPLER_2D_SHADOW?($c.compareFunction=515,s=$c):s=Jh,t.setTexture2D(e||s,i)}function Qd(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||$h,i)}function ep(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Qh,i)}function tp(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Kh,i)}function np(r,e){r.uniform1fv(this.addr,e)}function ip(r,e){let t=gr(e,this.size,2);r.uniform2fv(this.addr,t)}function rp(r,e){let t=gr(e,this.size,3);r.uniform3fv(this.addr,t)}function sp(r,e){let t=gr(e,this.size,4);r.uniform4fv(this.addr,t)}function ap(r,e){let t=gr(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function op(r,e){let t=gr(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function lp(r,e){let t=gr(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function cp(r,e){r.uniform1iv(this.addr,e)}function hp(r,e){r.uniform2iv(this.addr,e)}function up(r,e){r.uniform3iv(this.addr,e)}function dp(r,e){r.uniform4iv(this.addr,e)}function pp(r,e){r.uniform1uiv(this.addr,e)}function mp(r,e){r.uniform2uiv(this.addr,e)}function fp(r,e){r.uniform3uiv(this.addr,e)}function gp(r,e){r.uniform4uiv(this.addr,e)}function vp(r,e,t){let n=this.cache,i=e.length,s=za(t,i);ut(n,s)||(r.uniform1iv(this.addr,s),dt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Jh,s[a])}function _p(r,e,t){let n=this.cache,i=e.length,s=za(t,i);ut(n,s)||(r.uniform1iv(this.addr,s),dt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||$h,s[a])}function yp(r,e,t){let n=this.cache,i=e.length,s=za(t,i);ut(n,s)||(r.uniform1iv(this.addr,s),dt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Qh,s[a])}function xp(r,e,t){let n=this.cache,i=e.length,s=za(t,i);ut(n,s)||(r.uniform1iv(this.addr,s),dt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Kh,s[a])}var yl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=(function(i){switch(i){case 5126:return Fd;case 35664:return Bd;case 35665:return zd;case 35666:return kd;case 35674:return Hd;case 35675:return Gd;case 35676:return Vd;case 5124:case 35670:return Wd;case 35667:case 35671:return Xd;case 35668:case 35672:return jd;case 35669:case 35673:return qd;case 5125:return Yd;case 36294:return Zd;case 36295:return Jd;case 36296:return Kd;case 35678:case 36198:case 36298:case 36306:case 35682:return $d;case 35679:case 36299:case 36307:return Qd;case 35680:case 36300:case 36308:case 36293:return ep;case 36289:case 36303:case 36311:case 36292:return tp}})(t.type)}},xl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=(function(i){switch(i){case 5126:return np;case 35664:return ip;case 35665:return rp;case 35666:return sp;case 35674:return ap;case 35675:return op;case 35676:return lp;case 5124:case 35670:return cp;case 35667:case 35671:return hp;case 35668:case 35672:return up;case 35669:case 35673:return dp;case 5125:return pp;case 36294:return mp;case 36295:return fp;case 36296:return gp;case 35678:case 36198:case 36298:case 36306:case 35682:return vp;case 35679:case 36299:case 36307:return _p;case 35680:case 36300:case 36308:case 36293:return yp;case 36289:case 36303:case 36311:case 36292:return xp}})(t.type)}},Ml=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,a=i.length;s!==a;++s){let o=i[s];o.setValue(e,t[o.id],n)}}},Ao=/(\w+)(\])?(\[|\.)?/g;function rh(r,e){r.seq.push(e),r.map[e.id]=e}function Mp(r,e,t){let n=r.name,i=n.length;for(Ao.lastIndex=0;;){let s=Ao.exec(n),a=Ao.lastIndex,o=s[1],l=s[2]==="]",c=s[3];if(l&&(o|=0),c===void 0||c==="["&&a+2===i){rh(t,c===void 0?new yl(o,r,e):new xl(o,r,e));break}{let h=t.map[o];h===void 0&&(h=new Ml(o),rh(t,h)),t=h}}}var Qi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i);Mp(s,e.getUniformLocation(t,s.name),this)}}setValue(e,t,n,i){let s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function sh(r,e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var Sp=0,ah=new Ve;function oh(r,e,t){let n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+(function(o,l){let c=o.split(`
`),h=[],u=Math.max(l-6,0),d=Math.min(l+6,c.length);for(let p=u;p<d;p++){let f=p+1;h.push(`${f===l?">":" "} ${f}: ${c[p]}`)}return h.join(`
`)})(r.getShaderSource(e),a)}return i}function bp(r,e){let t=(function(n){Ye._getMatrix(ah,Ye.workingColorSpace,n);let i=`mat3( ${ah.elements.map((s=>s.toFixed(4)))} )`;switch(Ye.getTransfer(n)){case Ba:return[i,"LinearTransferOETF"];case Qe:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[i,"LinearTransferOETF"]}})(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Ep(r,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Gs=new R;function Tp(){return Ye.getLuminanceCoefficients(Gs),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${Gs.x.toFixed(4)}, ${Gs.y.toFixed(4)}, ${Gs.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Lr(r){return r!==""}function lh(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ch(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var wp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sl(r){return r.replace(wp,Rp)}var Ap=new Map;function Rp(r,e){let t=Xe[e];if(t===void 0){let n=Ap.get(e);if(n===void 0)throw new Error("Can not resolve #include <"+e+">");t=Xe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n)}return Sl(t)}var Cp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hh(r){return r.replace(Cp,Pp)}function Pp(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function uh(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}function Ip(r,e,t,n){let i=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=(function(Z){let j="SHADOWMAP_TYPE_BASIC";return Z.shadowMapType===1?j="SHADOWMAP_TYPE_PCF":Z.shadowMapType===2?j="SHADOWMAP_TYPE_PCF_SOFT":Z.shadowMapType===3&&(j="SHADOWMAP_TYPE_VSM"),j})(t),c=(function(Z){let j="ENVMAP_TYPE_CUBE";if(Z.envMap)switch(Z.envMapMode){case er:case tr:j="ENVMAP_TYPE_CUBE";break;case Fa:j="ENVMAP_TYPE_CUBE_UV"}return j})(t),h=(function(Z){let j="ENVMAP_MODE_REFLECTION";return Z.envMap&&Z.envMapMode===tr&&(j="ENVMAP_MODE_REFRACTION"),j})(t),u=(function(Z){let j="ENVMAP_BLENDING_NONE";if(Z.envMap)switch(Z.combine){case 0:j="ENVMAP_BLENDING_MULTIPLY";break;case 1:j="ENVMAP_BLENDING_MIX";break;case 2:j="ENVMAP_BLENDING_ADD"}return j})(t),d=(function(Z){let j=Z.envMapCubeUVHeight;if(j===null)return null;let H=Math.log2(j)-2,z=1/j;return{texelWidth:1/(3*Math.max(Math.pow(2,H),112)),texelHeight:z,maxMip:H}})(t),p=(function(Z){return[Z.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",Z.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Lr).join(`
`)})(t),f=(function(Z){let j=[];for(let H in Z){let z=Z[H];z!==!1&&j.push("#define "+H+" "+z)}return j.join(`
`)})(s),_=i.createProgram(),m,g,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Lr).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Lr).join(`
`),g.length>0&&(g+=`
`)):(m=[uh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Lr).join(`
`),g=[uh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?Xe.tonemapping_pars_fragment:"",t.toneMapping!==0?Ep("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,bp("linearToOutputTexel",t.outputColorSpace),Tp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Lr).join(`
`)),a=Sl(a),a=lh(a,t),a=ch(a,t),o=Sl(o),o=lh(o,t),o=ch(o,t),a=hh(a),o=hh(o),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===Tc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Tc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let y=v+m+a,M=v+g+o,I=sh(i,i.VERTEX_SHADER,y),C=sh(i,i.FRAGMENT_SHADER,M);function L(Z){if(r.debug.checkShaderErrors){let j=i.getProgramInfoLog(_).trim(),H=i.getShaderInfoLog(I).trim(),z=i.getShaderInfoLog(C).trim(),se=!0,ee=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(se=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,_,I,C);else{let pe=oh(i,I,"vertex"),me=oh(i,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+Z.name+`
Material Type: `+Z.type+`

Program Info Log: `+j+`
`+pe+`
`+me)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):H!==""&&z!==""||(ee=!1);ee&&(Z.diagnostics={runnable:se,programLog:j,vertexShader:{log:H,prefix:m},fragmentShader:{log:z,prefix:g}})}i.deleteShader(I),i.deleteShader(C),F=new Qi(i,_),G=(function(j,H){let z={},se=j.getProgramParameter(H,j.ACTIVE_ATTRIBUTES);for(let ee=0;ee<se;ee++){let pe=j.getActiveAttrib(H,ee),me=pe.name,Ae=1;pe.type===j.FLOAT_MAT2&&(Ae=2),pe.type===j.FLOAT_MAT3&&(Ae=3),pe.type===j.FLOAT_MAT4&&(Ae=4),z[me]={type:pe.type,location:j.getAttribLocation(H,me),locationSize:Ae}}return z})(i,_)}let F,G;i.attachShader(_,I),i.attachShader(_,C),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_),this.getUniforms=function(){return F===void 0&&L(this),F},this.getAttributes=function(){return G===void 0&&L(this),G};let q=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return q===!1&&(q=i.getProgramParameter(_,37297)),q},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Sp++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=I,this.fragmentShader=C,this}var Lp=0,bl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new El(e),t.set(e,n)),n}},El=class{constructor(e){this.id=Lp++,this.code=e,this.usedTimes=0}};function Up(r,e,t,n,i,s,a){let o=new da,l=new bl,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures,p=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(m){return c.add(m),m===0?"uv":`uv${m}`}return{getParameters:function(m,g,v,y,M){let I=y.fog,C=M.geometry,L=m.isMeshStandardMaterial?y.environment:null,F=(m.isMeshStandardMaterial?t:e).get(m.envMap||L),G=F&&F.mapping===Fa?F.image.height:null,q=f[m.type];m.precision!==null&&(p=i.getMaxPrecision(m.precision),p!==m.precision&&console.warn("THREE.WebGLProgram.getParameters:",m.precision,"not supported, using",p,"instead."));let Z=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,j=Z!==void 0?Z.length:0,H,z,se,ee,pe=0;if(C.morphAttributes.position!==void 0&&(pe=1),C.morphAttributes.normal!==void 0&&(pe=2),C.morphAttributes.color!==void 0&&(pe=3),q){let jt=ln[q];H=jt.vertexShader,z=jt.fragmentShader}else H=m.vertexShader,z=m.fragmentShader,l.update(m),se=l.getVertexShaderID(m),ee=l.getFragmentShaderID(m);let me=r.getRenderTarget(),Ae=r.state.buffers.depth.getReversed(),Ce=M.isInstancedMesh===!0,ue=M.isBatchedMesh===!0,le=!!m.map,xe=!!m.matcap,we=!!F,te=!!m.aoMap,E=!!m.lightMap,A=!!m.bumpMap,O=!!m.normalMap,N=!!m.displacementMap,P=!!m.emissiveMap,D=!!m.metalnessMap,T=!!m.roughnessMap,U=m.anisotropy>0,X=m.clearcoat>0,he=m.dispersion>0,W=m.iridescence>0,oe=m.sheen>0,ce=m.transmission>0,b=U&&!!m.anisotropyMap,V=X&&!!m.clearcoatMap,k=X&&!!m.clearcoatNormalMap,J=X&&!!m.clearcoatRoughnessMap,$=W&&!!m.iridescenceMap,_e=W&&!!m.iridescenceThicknessMap,ve=oe&&!!m.sheenColorMap,ge=oe&&!!m.sheenRoughnessMap,Se=!!m.specularMap,Ee=!!m.specularColorMap,Ie=!!m.specularIntensityMap,ye=ce&&!!m.transmissionMap,Re=ce&&!!m.thicknessMap,We=!!m.gradientMap,Rt=!!m.alphaMap,In=m.alphaTest>0,mt=!!m.alphaHash,ot=!!m.extensions,sn=0;m.toneMapped&&(me!==null&&me.isXRRenderTarget!==!0||(sn=r.toneMapping));let Y={shaderID:q,shaderType:m.type,shaderName:m.name,vertexShader:H,fragmentShader:z,defines:m.defines,customVertexShaderID:se,customFragmentShaderID:ee,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:p,batching:ue,batchingColor:ue&&M._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&M.instanceColor!==null,instancingMorph:Ce&&M.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:me===null?r.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:mr,alphaToCoverage:!!m.alphaToCoverage,map:le,matcap:xe,envMap:we,envMapMode:we&&F.mapping,envMapCubeUVHeight:G,aoMap:te,lightMap:E,bumpMap:A,normalMap:O,displacementMap:d&&N,emissiveMap:P,normalMapObjectSpace:O&&m.normalMapType===1,normalMapTangentSpace:O&&m.normalMapType===0,metalnessMap:D,roughnessMap:T,anisotropy:U,anisotropyMap:b,clearcoat:X,clearcoatMap:V,clearcoatNormalMap:k,clearcoatRoughnessMap:J,dispersion:he,iridescence:W,iridescenceMap:$,iridescenceThicknessMap:_e,sheen:oe,sheenColorMap:ve,sheenRoughnessMap:ge,specularMap:Se,specularColorMap:Ee,specularIntensityMap:Ie,transmission:ce,transmissionMap:ye,thicknessMap:Re,gradientMap:We,opaque:m.transparent===!1&&m.blending===1&&m.alphaToCoverage===!1,alphaMap:Rt,alphaTest:In,alphaHash:mt,combine:m.combine,mapUv:le&&_(m.map.channel),aoMapUv:te&&_(m.aoMap.channel),lightMapUv:E&&_(m.lightMap.channel),bumpMapUv:A&&_(m.bumpMap.channel),normalMapUv:O&&_(m.normalMap.channel),displacementMapUv:N&&_(m.displacementMap.channel),emissiveMapUv:P&&_(m.emissiveMap.channel),metalnessMapUv:D&&_(m.metalnessMap.channel),roughnessMapUv:T&&_(m.roughnessMap.channel),anisotropyMapUv:b&&_(m.anisotropyMap.channel),clearcoatMapUv:V&&_(m.clearcoatMap.channel),clearcoatNormalMapUv:k&&_(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&_(m.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&_(m.iridescenceMap.channel),iridescenceThicknessMapUv:_e&&_(m.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&_(m.sheenColorMap.channel),sheenRoughnessMapUv:ge&&_(m.sheenRoughnessMap.channel),specularMapUv:Se&&_(m.specularMap.channel),specularColorMapUv:Ee&&_(m.specularColorMap.channel),specularIntensityMapUv:Ie&&_(m.specularIntensityMap.channel),transmissionMapUv:ye&&_(m.transmissionMap.channel),thicknessMapUv:Re&&_(m.thicknessMap.channel),alphaMapUv:Rt&&_(m.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(O||U),vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:M.isPoints===!0&&!!C.attributes.uv&&(le||Rt),fog:!!I,useFog:m.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:m.flatShading===!0,sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Ae,skinning:M.isSkinnedMesh===!0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:j,morphTextureStride:pe,numDirLights:g.directional.length,numPointLights:g.point.length,numSpotLights:g.spot.length,numSpotLightMaps:g.spotLightMap.length,numRectAreaLights:g.rectArea.length,numHemiLights:g.hemi.length,numDirLightShadows:g.directionalShadowMap.length,numPointLightShadows:g.pointShadowMap.length,numSpotLightShadows:g.spotShadowMap.length,numSpotLightShadowsWithMaps:g.numSpotLightShadowsWithMaps,numLightProbes:g.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:m.dithering,shadowMapEnabled:r.shadowMap.enabled&&v.length>0,shadowMapType:r.shadowMap.type,toneMapping:sn,decodeVideoTexture:le&&m.map.isVideoTexture===!0&&Ye.getTransfer(m.map.colorSpace)===Qe,decodeVideoTextureEmissive:P&&m.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(m.emissiveMap.colorSpace)===Qe,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===2,flipSided:m.side===1,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:ot&&m.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ot&&m.extensions.multiDraw===!0||ue)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};return Y.vertexUv1s=c.has(1),Y.vertexUv2s=c.has(2),Y.vertexUv3s=c.has(3),c.clear(),Y},getProgramCacheKey:function(m){let g=[];if(m.shaderID?g.push(m.shaderID):(g.push(m.customVertexShaderID),g.push(m.customFragmentShaderID)),m.defines!==void 0)for(let v in m.defines)g.push(v),g.push(m.defines[v]);return m.isRawShaderMaterial===!1&&((function(v,y){v.push(y.precision),v.push(y.outputColorSpace),v.push(y.envMapMode),v.push(y.envMapCubeUVHeight),v.push(y.mapUv),v.push(y.alphaMapUv),v.push(y.lightMapUv),v.push(y.aoMapUv),v.push(y.bumpMapUv),v.push(y.normalMapUv),v.push(y.displacementMapUv),v.push(y.emissiveMapUv),v.push(y.metalnessMapUv),v.push(y.roughnessMapUv),v.push(y.anisotropyMapUv),v.push(y.clearcoatMapUv),v.push(y.clearcoatNormalMapUv),v.push(y.clearcoatRoughnessMapUv),v.push(y.iridescenceMapUv),v.push(y.iridescenceThicknessMapUv),v.push(y.sheenColorMapUv),v.push(y.sheenRoughnessMapUv),v.push(y.specularMapUv),v.push(y.specularColorMapUv),v.push(y.specularIntensityMapUv),v.push(y.transmissionMapUv),v.push(y.thicknessMapUv),v.push(y.combine),v.push(y.fogExp2),v.push(y.sizeAttenuation),v.push(y.morphTargetsCount),v.push(y.morphAttributeCount),v.push(y.numDirLights),v.push(y.numPointLights),v.push(y.numSpotLights),v.push(y.numSpotLightMaps),v.push(y.numHemiLights),v.push(y.numRectAreaLights),v.push(y.numDirLightShadows),v.push(y.numPointLightShadows),v.push(y.numSpotLightShadows),v.push(y.numSpotLightShadowsWithMaps),v.push(y.numLightProbes),v.push(y.shadowMapType),v.push(y.toneMapping),v.push(y.numClippingPlanes),v.push(y.numClipIntersection),v.push(y.depthPacking)})(g,m),(function(v,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),v.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reverseDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),v.push(o.mask)})(g,m),g.push(r.outputColorSpace)),g.push(m.customProgramCacheKey),g.join()},getUniforms:function(m){let g=f[m.type],v;if(g){let y=ln[g];v=yd.clone(y.uniforms)}else v=m.uniforms;return v},acquireProgram:function(m,g){let v;for(let y=0,M=h.length;y<M;y++){let I=h[y];if(I.cacheKey===g){v=I,++v.usedTimes;break}}return v===void 0&&(v=new Ip(r,g,m,s),h.push(v)),v},releaseProgram:function(m){if(--m.usedTimes==0){let g=h.indexOf(m);h[g]=h[h.length-1],h.pop(),m.destroy()}},releaseShaderCache:function(m){l.remove(m)},programs:h,dispose:function(){l.dispose()}}}function Dp(){let r=new WeakMap;return{has:function(e){return r.has(e)},get:function(e){let t=r.get(e);return t===void 0&&(t={},r.set(e,t)),t},remove:function(e){r.delete(e)},update:function(e,t,n){r.get(e)[t]=n},dispose:function(){r=new WeakMap}}}function Np(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function dh(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function ph(){let r=[],e=0,t=[],n=[],i=[];function s(a,o,l,c,h,u){let d=r[e];return d===void 0?(d={id:a.id,object:a,geometry:o,material:l,groupOrder:c,renderOrder:a.renderOrder,z:h,group:u},r[e]=d):(d.id=a.id,d.object=a,d.geometry=o,d.material=l,d.groupOrder=c,d.renderOrder=a.renderOrder,d.z=h,d.group=u),e++,d}return{opaque:t,transmissive:n,transparent:i,init:function(){e=0,t.length=0,n.length=0,i.length=0},push:function(a,o,l,c,h,u){let d=s(a,o,l,c,h,u);l.transmission>0?n.push(d):l.transparent===!0?i.push(d):t.push(d)},unshift:function(a,o,l,c,h,u){let d=s(a,o,l,c,h,u);l.transmission>0?n.unshift(d):l.transparent===!0?i.unshift(d):t.unshift(d)},finish:function(){for(let a=e,o=r.length;a<o;a++){let l=r[a];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(a,o){t.length>1&&t.sort(a||Np),n.length>1&&n.sort(o||dh),i.length>1&&i.sort(o||dh)}}}function Op(){let r=new WeakMap;return{get:function(e,t){let n=r.get(e),i;return n===void 0?(i=new ph,r.set(e,[i])):t>=n.length?(i=new ph,n.push(i)):i=n[t],i},dispose:function(){r=new WeakMap}}}function Fp(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new ze};break;case"SpotLight":t={position:new R,direction:new R,color:new ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new ze,groundColor:new ze};break;case"RectAreaLight":t={color:new ze,position:new R,halfWidth:new R,halfHeight:new R}}return r[e.id]=t,t}}}var Bp=0;function zp(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function kp(r){let e=new Fp,t=(function(){let o={};return{get:function(l){if(o[l.id]!==void 0)return o[l.id];let c;switch(l.type){case"DirectionalLight":case"SpotLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe};break;case"PointLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe,shadowCameraNear:1,shadowCameraFar:1e3}}return o[l.id]=c,c}}})(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)n.probe.push(new R);let i=new R,s=new je,a=new je;return{setup:function(o){let l=0,c=0,h=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let u=0,d=0,p=0,f=0,_=0,m=0,g=0,v=0,y=0,M=0,I=0;o.sort(zp);for(let L=0,F=o.length;L<F;L++){let G=o[L],q=G.color,Z=G.intensity,j=G.distance,H=G.shadow&&G.shadow.map?G.shadow.map.texture:null;if(G.isAmbientLight)l+=q.r*Z,c+=q.g*Z,h+=q.b*Z;else if(G.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(G.sh.coefficients[z],Z);I++}else if(G.isDirectionalLight){let z=e.get(G);if(z.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let se=G.shadow,ee=t.get(G);ee.shadowIntensity=se.intensity,ee.shadowBias=se.bias,ee.shadowNormalBias=se.normalBias,ee.shadowRadius=se.radius,ee.shadowMapSize=se.mapSize,n.directionalShadow[u]=ee,n.directionalShadowMap[u]=H,n.directionalShadowMatrix[u]=G.shadow.matrix,m++}n.directional[u]=z,u++}else if(G.isSpotLight){let z=e.get(G);z.position.setFromMatrixPosition(G.matrixWorld),z.color.copy(q).multiplyScalar(Z),z.distance=j,z.coneCos=Math.cos(G.angle),z.penumbraCos=Math.cos(G.angle*(1-G.penumbra)),z.decay=G.decay,n.spot[p]=z;let se=G.shadow;if(G.map&&(n.spotLightMap[y]=G.map,y++,se.updateMatrices(G),G.castShadow&&M++),n.spotLightMatrix[p]=se.matrix,G.castShadow){let ee=t.get(G);ee.shadowIntensity=se.intensity,ee.shadowBias=se.bias,ee.shadowNormalBias=se.normalBias,ee.shadowRadius=se.radius,ee.shadowMapSize=se.mapSize,n.spotShadow[p]=ee,n.spotShadowMap[p]=H,v++}p++}else if(G.isRectAreaLight){let z=e.get(G);z.color.copy(q).multiplyScalar(Z),z.halfWidth.set(.5*G.width,0,0),z.halfHeight.set(0,.5*G.height,0),n.rectArea[f]=z,f++}else if(G.isPointLight){let z=e.get(G);if(z.color.copy(G.color).multiplyScalar(G.intensity),z.distance=G.distance,z.decay=G.decay,G.castShadow){let se=G.shadow,ee=t.get(G);ee.shadowIntensity=se.intensity,ee.shadowBias=se.bias,ee.shadowNormalBias=se.normalBias,ee.shadowRadius=se.radius,ee.shadowMapSize=se.mapSize,ee.shadowCameraNear=se.camera.near,ee.shadowCameraFar=se.camera.far,n.pointShadow[d]=ee,n.pointShadowMap[d]=H,n.pointShadowMatrix[d]=G.shadow.matrix,g++}n.point[d]=z,d++}else if(G.isHemisphereLight){let z=e.get(G);z.skyColor.copy(G.color).multiplyScalar(Z),z.groundColor.copy(G.groundColor).multiplyScalar(Z),n.hemi[_]=z,_++}}f>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=be.LTC_FLOAT_1,n.rectAreaLTC2=be.LTC_FLOAT_2):(n.rectAreaLTC1=be.LTC_HALF_1,n.rectAreaLTC2=be.LTC_HALF_2)),n.ambient[0]=l,n.ambient[1]=c,n.ambient[2]=h;let C=n.hash;C.directionalLength===u&&C.pointLength===d&&C.spotLength===p&&C.rectAreaLength===f&&C.hemiLength===_&&C.numDirectionalShadows===m&&C.numPointShadows===g&&C.numSpotShadows===v&&C.numSpotMaps===y&&C.numLightProbes===I||(n.directional.length=u,n.spot.length=p,n.rectArea.length=f,n.point.length=d,n.hemi.length=_,n.directionalShadow.length=m,n.directionalShadowMap.length=m,n.pointShadow.length=g,n.pointShadowMap.length=g,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=m,n.pointShadowMatrix.length=g,n.spotLightMatrix.length=v+y-M,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=M,n.numLightProbes=I,C.directionalLength=u,C.pointLength=d,C.spotLength=p,C.rectAreaLength=f,C.hemiLength=_,C.numDirectionalShadows=m,C.numPointShadows=g,C.numSpotShadows=v,C.numSpotMaps=y,C.numLightProbes=I,n.version=Bp++)},setupView:function(o,l){let c=0,h=0,u=0,d=0,p=0,f=l.matrixWorldInverse;for(let _=0,m=o.length;_<m;_++){let g=o[_];if(g.isDirectionalLight){let v=n.directional[c];v.direction.setFromMatrixPosition(g.matrixWorld),i.setFromMatrixPosition(g.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(f),c++}else if(g.isSpotLight){let v=n.spot[u];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),v.direction.setFromMatrixPosition(g.matrixWorld),i.setFromMatrixPosition(g.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(f),u++}else if(g.isRectAreaLight){let v=n.rectArea[d];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),a.identity(),s.copy(g.matrixWorld),s.premultiply(f),a.extractRotation(s),v.halfWidth.set(.5*g.width,0,0),v.halfHeight.set(0,.5*g.height,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),d++}else if(g.isPointLight){let v=n.point[h];v.position.setFromMatrixPosition(g.matrixWorld),v.position.applyMatrix4(f),h++}else if(g.isHemisphereLight){let v=n.hemi[p];v.direction.setFromMatrixPosition(g.matrixWorld),v.direction.transformDirection(f),p++}}},state:n}}function mh(r){let e=new kp(r),t=[],n=[],i={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:function(s){i.camera=s,t.length=0,n.length=0},state:i,setupLights:function(){e.setup(t)},setupLightsView:function(s){e.setupView(t,s)},pushLight:function(s){t.push(s)},pushShadow:function(s){n.push(s)}}}function Hp(r){let e=new WeakMap;return{get:function(t,n=0){let i=e.get(t),s;return i===void 0?(s=new mh(r),e.set(t,[s])):n>=i.length?(s=new mh(r),i.push(s)):s=i[n],s},dispose:function(){e=new WeakMap}}}var Tl=class extends Rn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},wl=class extends Rn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Gp(r,e,t){let n=new or,i=new fe,s=new fe,a=new Ze,o=new Tl({depthPacking:3201}),l=new wl,c={},h=t.maxTextureSize,u={[Tu]:1,[wu]:0,[dr]:2},d=new mn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new fe},radius:{value:4}},vertexShader:`void main() {
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
}`}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let f=new Je;f.setAttribute("position",new ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Et(f,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let g=this.type;function v(C,L){let F=e.update(_);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new An(i.x,i.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,r.setRenderTarget(C.mapPass),r.clear(),r.renderBufferDirect(L,null,F,d,_,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,r.setRenderTarget(C.map),r.clear(),r.renderBufferDirect(L,null,F,p,_,null)}function y(C,L,F,G){let q=null,Z=F.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(Z!==void 0)q=Z;else if(q=F.isPointLight===!0?l:o,r.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0){let j=q.uuid,H=L.uuid,z=c[j];z===void 0&&(z={},c[j]=z);let se=z[H];se===void 0&&(se=q.clone(),z[H]=se,L.addEventListener("dispose",I)),q=se}return q.visible=L.visible,q.wireframe=L.wireframe,q.side=G===3?L.shadowSide!==null?L.shadowSide:L.side:L.shadowSide!==null?L.shadowSide:u[L.side],q.alphaMap=L.alphaMap,q.alphaTest=L.alphaTest,q.map=L.map,q.clipShadows=L.clipShadows,q.clippingPlanes=L.clippingPlanes,q.clipIntersection=L.clipIntersection,q.displacementMap=L.displacementMap,q.displacementScale=L.displacementScale,q.displacementBias=L.displacementBias,q.wireframeLinewidth=L.wireframeLinewidth,q.linewidth=L.linewidth,F.isPointLight===!0&&q.isMeshDistanceMaterial===!0&&(r.properties.get(q).light=F),q}function M(C,L,F,G,q){if(C.visible===!1)return;if(C.layers.test(L.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&q===3)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,C.matrixWorld);let j=e.update(C),H=C.material;if(Array.isArray(H)){let z=j.groups;for(let se=0,ee=z.length;se<ee;se++){let pe=z[se],me=H[pe.materialIndex];if(me&&me.visible){let Ae=y(C,me,G,q);C.onBeforeShadow(r,C,L,F,j,Ae,pe),r.renderBufferDirect(F,null,j,Ae,C,pe),C.onAfterShadow(r,C,L,F,j,Ae,pe)}}}else if(H.visible){let z=y(C,H,G,q);C.onBeforeShadow(r,C,L,F,j,z,null),r.renderBufferDirect(F,null,j,z,C,null),C.onAfterShadow(r,C,L,F,j,z,null)}}let Z=C.children;for(let j=0,H=Z.length;j<H;j++)M(Z[j],L,F,G,q)}function I(C){C.target.removeEventListener("dispose",I);for(let L in c){let F=c[L],G=C.target.uuid;G in F&&(F[G].dispose(),delete F[G])}}this.render=function(C,L,F){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;let G=r.getRenderTarget(),q=r.getActiveCubeFace(),Z=r.getActiveMipmapLevel(),j=r.state;j.setBlending(0),j.buffers.color.setClear(1,1,1,1),j.buffers.depth.setTest(!0),j.setScissorTest(!1);let H=g!==3&&this.type===3,z=g===3&&this.type!==3;for(let se=0,ee=C.length;se<ee;se++){let pe=C[se],me=pe.shadow;if(me===void 0){console.warn("THREE.WebGLShadowMap:",pe,"has no shadow.");continue}if(me.autoUpdate===!1&&me.needsUpdate===!1)continue;i.copy(me.mapSize);let Ae=me.getFrameExtents();if(i.multiply(Ae),s.copy(me.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/Ae.x),i.x=s.x*Ae.x,me.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/Ae.y),i.y=s.y*Ae.y,me.mapSize.y=s.y)),me.map===null||H===!0||z===!0){let ue=this.type!==3?{minFilter:Qt,magFilter:Qt}:{};me.map!==null&&me.map.dispose(),me.map=new An(i.x,i.y,ue),me.map.texture.name=pe.name+".shadowMap",me.camera.updateProjectionMatrix()}r.setRenderTarget(me.map),r.clear();let Ce=me.getViewportCount();for(let ue=0;ue<Ce;ue++){let le=me.getViewport(ue);a.set(s.x*le.x,s.y*le.y,s.x*le.z,s.y*le.w),j.viewport(a),me.updateMatrices(pe,ue),n=me.getFrustum(),M(L,F,me.camera,pe,this.type)}me.isPointLightShadow!==!0&&this.type===3&&v(me,F),me.needsUpdate=!1}g=this.type,m.needsUpdate=!1,r.setRenderTarget(G,q,Z)}}var Vp={[Gu]:1,[Wu]:6,[ju]:7,[Xu]:5,[Vu]:0,[Yu]:2,[Zu]:4,[qu]:3};function Wp(r,e){let t=new function(){let T=!1,U=new Ze,X=null,he=new Ze(0,0,0,0);return{setMask:function(W){X===W||T||(r.colorMask(W,W,W,W),X=W)},setLocked:function(W){T=W},setClear:function(W,oe,ce,b,V){V===!0&&(W*=b,oe*=b,ce*=b),U.set(W,oe,ce,b),he.equals(U)===!1&&(r.clearColor(W,oe,ce,b),he.copy(U))},reset:function(){T=!1,X=null,he.set(-1,0,0,0)}}},n=new function(){let T=!1,U=!1,X=null,he=null,W=null;return{setReversed:function(oe){if(U!==oe){let ce=e.get("EXT_clip_control");U?ce.clipControlEXT(ce.LOWER_LEFT_EXT,ce.ZERO_TO_ONE_EXT):ce.clipControlEXT(ce.LOWER_LEFT_EXT,ce.NEGATIVE_ONE_TO_ONE_EXT);let b=W;W=null,this.setClear(b)}U=oe},getReversed:function(){return U},setTest:function(oe){oe?we(r.DEPTH_TEST):te(r.DEPTH_TEST)},setMask:function(oe){X===oe||T||(r.depthMask(oe),X=oe)},setFunc:function(oe){if(U&&(oe=Vp[oe]),he!==oe){switch(oe){case 0:r.depthFunc(r.NEVER);break;case 1:r.depthFunc(r.ALWAYS);break;case 2:r.depthFunc(r.LESS);break;case 3:default:r.depthFunc(r.LEQUAL);break;case 4:r.depthFunc(r.EQUAL);break;case 5:r.depthFunc(r.GEQUAL);break;case 6:r.depthFunc(r.GREATER);break;case 7:r.depthFunc(r.NOTEQUAL)}he=oe}},setLocked:function(oe){T=oe},setClear:function(oe){W!==oe&&(U&&(oe=1-oe),r.clearDepth(oe),W=oe)},reset:function(){T=!1,X=null,he=null,W=null,U=!1}}},i=new function(){let T=!1,U=null,X=null,he=null,W=null,oe=null,ce=null,b=null,V=null;return{setTest:function(k){T||(k?we(r.STENCIL_TEST):te(r.STENCIL_TEST))},setMask:function(k){U===k||T||(r.stencilMask(k),U=k)},setFunc:function(k,J,$){X===k&&he===J&&W===$||(r.stencilFunc(k,J,$),X=k,he=J,W=$)},setOp:function(k,J,$){oe===k&&ce===J&&b===$||(r.stencilOp(k,J,$),oe=k,ce=J,b=$)},setLocked:function(k){T=k},setClear:function(k){V!==k&&(r.clearStencil(k),V=k)},reset:function(){T=!1,U=null,X=null,he=null,W=null,oe=null,ce=null,b=null,V=null}}},s=new WeakMap,a=new WeakMap,o={},l={},c=new WeakMap,h=[],u=null,d=!1,p=null,f=null,_=null,m=null,g=null,v=null,y=null,M=new ze(0,0,0),I=0,C=!1,L=null,F=null,G=null,q=null,Z=null,j=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,z=0,se=r.getParameter(r.VERSION);se.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(se)[1]),H=z>=1):se.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(se)[1]),H=z>=2);let ee=null,pe={},me=r.getParameter(r.SCISSOR_BOX),Ae=r.getParameter(r.VIEWPORT),Ce=new Ze().fromArray(me),ue=new Ze().fromArray(Ae);function le(T,U,X,he){let W=new Uint8Array(4),oe=r.createTexture();r.bindTexture(T,oe),r.texParameteri(T,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(T,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ce=0;ce<X;ce++)T===r.TEXTURE_3D||T===r.TEXTURE_2D_ARRAY?r.texImage3D(U,0,r.RGBA,1,1,he,0,r.RGBA,r.UNSIGNED_BYTE,W):r.texImage2D(U+ce,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,W);return oe}let xe={};function we(T){o[T]!==!0&&(r.enable(T),o[T]=!0)}function te(T){o[T]!==!1&&(r.disable(T),o[T]=!1)}xe[r.TEXTURE_2D]=le(r.TEXTURE_2D,r.TEXTURE_2D,1),xe[r.TEXTURE_CUBE_MAP]=le(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),xe[r.TEXTURE_2D_ARRAY]=le(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),xe[r.TEXTURE_3D]=le(r.TEXTURE_3D,r.TEXTURE_3D,1,1),t.setClear(0,0,0,1),n.setClear(1),i.setClear(0),we(r.DEPTH_TEST),n.setFunc(3),N(!1),P(1),we(r.CULL_FACE),O(0);let E={[hi]:r.FUNC_ADD,[Au]:r.FUNC_SUBTRACT,[Ru]:r.FUNC_REVERSE_SUBTRACT};E[103]=r.MIN,E[104]=r.MAX;let A={[Cu]:r.ZERO,[Pu]:r.ONE,[Iu]:r.SRC_COLOR,[Oo]:r.SRC_ALPHA,[Fu]:r.SRC_ALPHA_SATURATE,[Nu]:r.DST_COLOR,[Uu]:r.DST_ALPHA,[Lu]:r.ONE_MINUS_SRC_COLOR,[Fo]:r.ONE_MINUS_SRC_ALPHA,[Ou]:r.ONE_MINUS_DST_COLOR,[Du]:r.ONE_MINUS_DST_ALPHA,[Bu]:r.CONSTANT_COLOR,[zu]:r.ONE_MINUS_CONSTANT_COLOR,[ku]:r.CONSTANT_ALPHA,[Hu]:r.ONE_MINUS_CONSTANT_ALPHA};function O(T,U,X,he,W,oe,ce,b,V,k){if(T!==0){if(d===!1&&(we(r.BLEND),d=!0),T===5)W=W||U,oe=oe||X,ce=ce||he,U===f&&W===g||(r.blendEquationSeparate(E[U],E[W]),f=U,g=W),X===_&&he===m&&oe===v&&ce===y||(r.blendFuncSeparate(A[X],A[he],A[oe],A[ce]),_=X,m=he,v=oe,y=ce),b.equals(M)!==!1&&V===I||(r.blendColor(b.r,b.g,b.b,V),M.copy(b),I=V),p=T,C=!1;else if(T!==p||k!==C){if(f===hi&&g===hi||(r.blendEquation(r.FUNC_ADD),f=hi,g=hi),k)switch(T){case 1:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.ONE,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",T)}else switch(T){case 1:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",T)}_=null,m=null,v=null,y=null,M.set(0,0,0),I=0,p=T,C=k}}else d===!0&&(te(r.BLEND),d=!1)}function N(T){L!==T&&(T?r.frontFace(r.CW):r.frontFace(r.CCW),L=T)}function P(T){T!==0?(we(r.CULL_FACE),T!==F&&(T===1?r.cullFace(r.BACK):T===2?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):te(r.CULL_FACE),F=T}function D(T,U,X){T?(we(r.POLYGON_OFFSET_FILL),q===U&&Z===X||(r.polygonOffset(U,X),q=U,Z=X)):te(r.POLYGON_OFFSET_FILL)}return{buffers:{color:t,depth:n,stencil:i},enable:we,disable:te,bindFramebuffer:function(T,U){return l[T]!==U&&(r.bindFramebuffer(T,U),l[T]=U,T===r.DRAW_FRAMEBUFFER&&(l[r.FRAMEBUFFER]=U),T===r.FRAMEBUFFER&&(l[r.DRAW_FRAMEBUFFER]=U),!0)},drawBuffers:function(T,U){let X=h,he=!1;if(T){X=c.get(U),X===void 0&&(X=[],c.set(U,X));let W=T.textures;if(X.length!==W.length||X[0]!==r.COLOR_ATTACHMENT0){for(let oe=0,ce=W.length;oe<ce;oe++)X[oe]=r.COLOR_ATTACHMENT0+oe;X.length=W.length,he=!0}}else X[0]!==r.BACK&&(X[0]=r.BACK,he=!0);he&&r.drawBuffers(X)},useProgram:function(T){return u!==T&&(r.useProgram(T),u=T,!0)},setBlending:O,setMaterial:function(T,U){T.side===2?te(r.CULL_FACE):we(r.CULL_FACE);let X=T.side===1;U&&(X=!X),N(X),T.blending===1&&T.transparent===!1?O(0):O(T.blending,T.blendEquation,T.blendSrc,T.blendDst,T.blendEquationAlpha,T.blendSrcAlpha,T.blendDstAlpha,T.blendColor,T.blendAlpha,T.premultipliedAlpha),n.setFunc(T.depthFunc),n.setTest(T.depthTest),n.setMask(T.depthWrite),t.setMask(T.colorWrite);let he=T.stencilWrite;i.setTest(he),he&&(i.setMask(T.stencilWriteMask),i.setFunc(T.stencilFunc,T.stencilRef,T.stencilFuncMask),i.setOp(T.stencilFail,T.stencilZFail,T.stencilZPass)),D(T.polygonOffset,T.polygonOffsetFactor,T.polygonOffsetUnits),T.alphaToCoverage===!0?we(r.SAMPLE_ALPHA_TO_COVERAGE):te(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:N,setCullFace:P,setLineWidth:function(T){T!==G&&(H&&r.lineWidth(T),G=T)},setPolygonOffset:D,setScissorTest:function(T){T?we(r.SCISSOR_TEST):te(r.SCISSOR_TEST)},activeTexture:function(T){T===void 0&&(T=r.TEXTURE0+j-1),ee!==T&&(r.activeTexture(T),ee=T)},bindTexture:function(T,U,X){X===void 0&&(X=ee===null?r.TEXTURE0+j-1:ee);let he=pe[X];he===void 0&&(he={type:void 0,texture:void 0},pe[X]=he),he.type===T&&he.texture===U||(ee!==X&&(r.activeTexture(X),ee=X),r.bindTexture(T,U||xe[T]),he.type=T,he.texture=U)},unbindTexture:function(){let T=pe[ee];T!==void 0&&T.type!==void 0&&(r.bindTexture(T.type,null),T.type=void 0,T.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},compressedTexImage3D:function(){try{r.compressedTexImage3D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},texImage2D:function(){try{r.texImage2D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},texImage3D:function(){try{r.texImage3D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},updateUBOMapping:function(T,U){let X=a.get(U);X===void 0&&(X=new WeakMap,a.set(U,X));let he=X.get(T);he===void 0&&(he=r.getUniformBlockIndex(U,T.name),X.set(T,he))},uniformBlockBinding:function(T,U){let X=a.get(U).get(T);s.get(U)!==X&&(r.uniformBlockBinding(U,X,T.__bindingPointIndex),s.set(U,X))},texStorage2D:function(){try{r.texStorage2D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},texStorage3D:function(){try{r.texStorage3D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},texSubImage2D:function(){try{r.texSubImage2D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},texSubImage3D:function(){try{r.texSubImage3D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(T){console.error("THREE.WebGLState:",T)}},scissor:function(T){Ce.equals(T)===!1&&(r.scissor(T.x,T.y,T.z,T.w),Ce.copy(T))},viewport:function(T){ue.equals(T)===!1&&(r.viewport(T.x,T.y,T.z,T.w),ue.copy(T))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),n.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),o={},ee=null,pe={},l={},c=new WeakMap,h=[],u=null,d=!1,p=null,f=null,_=null,m=null,g=null,v=null,y=null,M=new ze(0,0,0),I=0,C=!1,L=null,F=null,G=null,q=null,Z=null,Ce.set(0,0,r.canvas.width,r.canvas.height),ue.set(0,0,r.canvas.width,r.canvas.height),t.reset(),n.reset(),i.reset()}}}function fh(r,e,t,n){let i=(function(s){switch(s){case Wn:case Oh:return{byteLength:1,components:1};case Wr:case Fh:case as:return{byteLength:2,components:1};case sc:case ac:return{byteLength:2,components:4};case pi:case rc:case cn:return{byteLength:4,components:1};case Bh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)})(n);switch(t){case zh:case Hh:return r*e;case Gh:return r*e*2;case oc:case lc:return r*e/i.components*i.byteLength;case Vh:case cc:return r*e*2/i.components*i.byteLength;case kh:return r*e*3/i.components*i.byteLength;case hn:case hc:return r*e*4/i.components*i.byteLength;case ta:case na:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case ia:case ra:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ho:case Vo:return Math.max(r,16)*Math.max(e,8)/4;case ko:case Go:return Math.max(r,8)*Math.max(e,8)/2;case Wo:case Xo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case jo:case qo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Yo:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Zo:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Jo:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Ko:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case $o:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Qo:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case el:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case tl:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case nl:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case il:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case rl:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case sl:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case al:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case sa:case ol:case ll:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Wh:case cl:return Math.ceil(r/4)*Math.ceil(e/4)*8;case hl:case ul:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Xp(r,e,t,n,i,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),c=new fe,h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function f(E,A){return p?new OffscreenCanvas(E,A):ca("canvas")}function _(E,A,O){let N=1,P=te(E);if((P.width>O||P.height>O)&&(N=O/Math.max(P.width,P.height)),N<1){if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let D=Math.floor(N*P.width),T=Math.floor(N*P.height);u===void 0&&(u=f(D,T));let U=A?f(D,T):u;return U.width=D,U.height=T,U.getContext("2d").drawImage(E,0,0,D,T),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+P.width+"x"+P.height+") to ("+D+"x"+T+")."),U}return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+P.width+"x"+P.height+")."),E}return E}function m(E){return E.generateMipmaps}function g(E){r.generateMipmap(E)}function v(E){return E.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?r.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function y(E,A,O,N,P=!1){if(E!==null){if(r[E]!==void 0)return r[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let D=A;if(A===r.RED&&(O===r.FLOAT&&(D=r.R32F),O===r.HALF_FLOAT&&(D=r.R16F),O===r.UNSIGNED_BYTE&&(D=r.R8)),A===r.RED_INTEGER&&(O===r.UNSIGNED_BYTE&&(D=r.R8UI),O===r.UNSIGNED_SHORT&&(D=r.R16UI),O===r.UNSIGNED_INT&&(D=r.R32UI),O===r.BYTE&&(D=r.R8I),O===r.SHORT&&(D=r.R16I),O===r.INT&&(D=r.R32I)),A===r.RG&&(O===r.FLOAT&&(D=r.RG32F),O===r.HALF_FLOAT&&(D=r.RG16F),O===r.UNSIGNED_BYTE&&(D=r.RG8)),A===r.RG_INTEGER&&(O===r.UNSIGNED_BYTE&&(D=r.RG8UI),O===r.UNSIGNED_SHORT&&(D=r.RG16UI),O===r.UNSIGNED_INT&&(D=r.RG32UI),O===r.BYTE&&(D=r.RG8I),O===r.SHORT&&(D=r.RG16I),O===r.INT&&(D=r.RG32I)),A===r.RGB_INTEGER&&(O===r.UNSIGNED_BYTE&&(D=r.RGB8UI),O===r.UNSIGNED_SHORT&&(D=r.RGB16UI),O===r.UNSIGNED_INT&&(D=r.RGB32UI),O===r.BYTE&&(D=r.RGB8I),O===r.SHORT&&(D=r.RGB16I),O===r.INT&&(D=r.RGB32I)),A===r.RGBA_INTEGER&&(O===r.UNSIGNED_BYTE&&(D=r.RGBA8UI),O===r.UNSIGNED_SHORT&&(D=r.RGBA16UI),O===r.UNSIGNED_INT&&(D=r.RGBA32UI),O===r.BYTE&&(D=r.RGBA8I),O===r.SHORT&&(D=r.RGBA16I),O===r.INT&&(D=r.RGBA32I)),A===r.RGB&&O===r.UNSIGNED_INT_5_9_9_9_REV&&(D=r.RGB9_E5),A===r.RGBA){let T=P?Ba:Ye.getTransfer(N);O===r.FLOAT&&(D=r.RGBA32F),O===r.HALF_FLOAT&&(D=r.RGBA16F),O===r.UNSIGNED_BYTE&&(D=T===Qe?r.SRGB8_ALPHA8:r.RGBA8),O===r.UNSIGNED_SHORT_4_4_4_4&&(D=r.RGBA4),O===r.UNSIGNED_SHORT_5_5_5_1&&(D=r.RGB5_A1)}return D!==r.R16F&&D!==r.R32F&&D!==r.RG16F&&D!==r.RG32F&&D!==r.RGBA16F&&D!==r.RGBA32F||e.get("EXT_color_buffer_float"),D}function M(E,A){let O;return E?A===null||A===pi||A===nr?O=r.DEPTH24_STENCIL8:A===cn?O=r.DEPTH32F_STENCIL8:A===Wr&&(O=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===pi||A===nr?O=r.DEPTH_COMPONENT24:A===cn?O=r.DEPTH_COMPONENT32F:A===Wr&&(O=r.DEPTH_COMPONENT16),O}function I(E,A){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==Qt&&E.minFilter!==Tn?Math.log2(Math.max(A.width,A.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?A.mipmaps.length:1}function C(E){let A=E.target;A.removeEventListener("dispose",C),(function(O){let N=n.get(O);if(N.__webglInit===void 0)return;let P=O.source,D=d.get(P);if(D){let T=D[N.__cacheKey];T.usedTimes--,T.usedTimes===0&&F(O),Object.keys(D).length===0&&d.delete(P)}n.remove(O)})(A),A.isVideoTexture&&h.delete(A)}function L(E){let A=E.target;A.removeEventListener("dispose",L),(function(O){let N=n.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),n.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let D=0;D<6;D++){if(Array.isArray(N.__webglFramebuffer[D]))for(let T=0;T<N.__webglFramebuffer[D].length;T++)r.deleteFramebuffer(N.__webglFramebuffer[D][T]);else r.deleteFramebuffer(N.__webglFramebuffer[D]);N.__webglDepthbuffer&&r.deleteRenderbuffer(N.__webglDepthbuffer[D])}else{if(Array.isArray(N.__webglFramebuffer))for(let D=0;D<N.__webglFramebuffer.length;D++)r.deleteFramebuffer(N.__webglFramebuffer[D]);else r.deleteFramebuffer(N.__webglFramebuffer);if(N.__webglDepthbuffer&&r.deleteRenderbuffer(N.__webglDepthbuffer),N.__webglMultisampledFramebuffer&&r.deleteFramebuffer(N.__webglMultisampledFramebuffer),N.__webglColorRenderbuffer)for(let D=0;D<N.__webglColorRenderbuffer.length;D++)N.__webglColorRenderbuffer[D]&&r.deleteRenderbuffer(N.__webglColorRenderbuffer[D]);N.__webglDepthRenderbuffer&&r.deleteRenderbuffer(N.__webglDepthRenderbuffer)}let P=O.textures;for(let D=0,T=P.length;D<T;D++){let U=n.get(P[D]);U.__webglTexture&&(r.deleteTexture(U.__webglTexture),a.memory.textures--),n.remove(P[D])}n.remove(O)})(A)}function F(E){let A=n.get(E);r.deleteTexture(A.__webglTexture);let O=E.source;delete d.get(O)[A.__cacheKey],a.memory.textures--}let G=0;function q(E,A){let O=n.get(E);if(E.isVideoTexture&&(function(N){let P=a.render.frame;h.get(N)!==P&&(h.set(N,P),N.update())})(E),E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){let N=E.image;if(N===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else{if(N.complete!==!1)return void ee(O,E,A);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete")}}t.bindTexture(r.TEXTURE_2D,O.__webglTexture,r.TEXTURE0+A)}let Z={[Gr]:r.REPEAT,[Vr]:r.CLAMP_TO_EDGE,[zo]:r.MIRRORED_REPEAT},j={[Qt]:r.NEAREST,[Ju]:r.NEAREST_MIPMAP_NEAREST,[Ss]:r.NEAREST_MIPMAP_LINEAR,[Tn]:r.LINEAR,[$a]:r.LINEAR_MIPMAP_NEAREST,[Ji]:r.LINEAR_MIPMAP_LINEAR},H={[Ku]:r.NEVER,[rd]:r.ALWAYS,[$u]:r.LESS,[ed]:r.LEQUAL,[Qu]:r.EQUAL,[id]:r.GEQUAL,[td]:r.GREATER,[nd]:r.NOTEQUAL};function z(E,A){if(A.type!==cn||e.has("OES_texture_float_linear")!==!1||A.magFilter!==Tn&&A.magFilter!==$a&&A.magFilter!==Ss&&A.magFilter!==Ji&&A.minFilter!==Tn&&A.minFilter!==$a&&A.minFilter!==Ss&&A.minFilter!==Ji||console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(E,r.TEXTURE_WRAP_S,Z[A.wrapS]),r.texParameteri(E,r.TEXTURE_WRAP_T,Z[A.wrapT]),E!==r.TEXTURE_3D&&E!==r.TEXTURE_2D_ARRAY||r.texParameteri(E,r.TEXTURE_WRAP_R,Z[A.wrapR]),r.texParameteri(E,r.TEXTURE_MAG_FILTER,j[A.magFilter]),r.texParameteri(E,r.TEXTURE_MIN_FILTER,j[A.minFilter]),A.compareFunction&&(r.texParameteri(E,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(E,r.TEXTURE_COMPARE_FUNC,H[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===Qt||A.minFilter!==Ss&&A.minFilter!==Ji||A.type===cn&&e.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||n.get(A).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");r.texParameterf(E,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,i.getMaxAnisotropy())),n.get(A).__currentAnisotropy=A.anisotropy}}}function se(E,A){let O=!1;E.__webglInit===void 0&&(E.__webglInit=!0,A.addEventListener("dispose",C));let N=A.source,P=d.get(N);P===void 0&&(P={},d.set(N,P));let D=(function(T){let U=[];return U.push(T.wrapS),U.push(T.wrapT),U.push(T.wrapR||0),U.push(T.magFilter),U.push(T.minFilter),U.push(T.anisotropy),U.push(T.internalFormat),U.push(T.format),U.push(T.type),U.push(T.generateMipmaps),U.push(T.premultiplyAlpha),U.push(T.flipY),U.push(T.unpackAlignment),U.push(T.colorSpace),U.join()})(A);if(D!==E.__cacheKey){P[D]===void 0&&(P[D]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,O=!0),P[D].usedTimes++;let T=P[E.__cacheKey];T!==void 0&&(P[E.__cacheKey].usedTimes--,T.usedTimes===0&&F(A)),E.__cacheKey=D,E.__webglTexture=P[D].texture}return O}function ee(E,A,O){let N=r.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(N=r.TEXTURE_2D_ARRAY),A.isData3DTexture&&(N=r.TEXTURE_3D);let P=se(E,A),D=A.source;t.bindTexture(N,E.__webglTexture,r.TEXTURE0+O);let T=n.get(D);if(D.version!==T.__version||P===!0){t.activeTexture(r.TEXTURE0+O);let U=Ye.getPrimaries(Ye.workingColorSpace),X=A.colorSpace===Hn?null:Ye.getPrimaries(A.colorSpace),he=A.colorSpace===Hn||U===X?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,A.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,A.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);let W=_(A.image,!1,i.maxTextureSize);W=we(A,W);let oe=s.convert(A.format,A.colorSpace),ce=s.convert(A.type),b,V=y(A.internalFormat,oe,ce,A.colorSpace,A.isVideoTexture);z(N,A);let k=A.mipmaps,J=A.isVideoTexture!==!0,$=T.__version===void 0||P===!0,_e=D.dataReady,ve=I(A,W);if(A.isDepthTexture)V=M(A.format===ir,A.type),$&&(J?t.texStorage2D(r.TEXTURE_2D,1,V,W.width,W.height):t.texImage2D(r.TEXTURE_2D,0,V,W.width,W.height,0,oe,ce,null));else if(A.isDataTexture)if(k.length>0){J&&$&&t.texStorage2D(r.TEXTURE_2D,ve,V,k[0].width,k[0].height);for(let ge=0,Se=k.length;ge<Se;ge++)b=k[ge],J?_e&&t.texSubImage2D(r.TEXTURE_2D,ge,0,0,b.width,b.height,oe,ce,b.data):t.texImage2D(r.TEXTURE_2D,ge,V,b.width,b.height,0,oe,ce,b.data);A.generateMipmaps=!1}else J?($&&t.texStorage2D(r.TEXTURE_2D,ve,V,W.width,W.height),_e&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,W.width,W.height,oe,ce,W.data)):t.texImage2D(r.TEXTURE_2D,0,V,W.width,W.height,0,oe,ce,W.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){J&&$&&t.texStorage3D(r.TEXTURE_2D_ARRAY,ve,V,k[0].width,k[0].height,W.depth);for(let ge=0,Se=k.length;ge<Se;ge++)if(b=k[ge],A.format!==hn)if(oe!==null)if(J){if(_e)if(A.layerUpdates.size>0){let Ee=fh(b.width,b.height,A.format,A.type);for(let Ie of A.layerUpdates){let ye=b.data.subarray(Ie*Ee/b.data.BYTES_PER_ELEMENT,(Ie+1)*Ee/b.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ge,0,0,Ie,b.width,b.height,1,oe,ye)}A.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ge,0,0,0,b.width,b.height,W.depth,oe,b.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ge,V,b.width,b.height,W.depth,0,b.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else J?_e&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ge,0,0,0,b.width,b.height,W.depth,oe,ce,b.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ge,V,b.width,b.height,W.depth,0,oe,ce,b.data)}else{J&&$&&t.texStorage2D(r.TEXTURE_2D,ve,V,k[0].width,k[0].height);for(let ge=0,Se=k.length;ge<Se;ge++)b=k[ge],A.format!==hn?oe!==null?J?_e&&t.compressedTexSubImage2D(r.TEXTURE_2D,ge,0,0,b.width,b.height,oe,b.data):t.compressedTexImage2D(r.TEXTURE_2D,ge,V,b.width,b.height,0,b.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):J?_e&&t.texSubImage2D(r.TEXTURE_2D,ge,0,0,b.width,b.height,oe,ce,b.data):t.texImage2D(r.TEXTURE_2D,ge,V,b.width,b.height,0,oe,ce,b.data)}else if(A.isDataArrayTexture)if(J){if($&&t.texStorage3D(r.TEXTURE_2D_ARRAY,ve,V,W.width,W.height,W.depth),_e)if(A.layerUpdates.size>0){let ge=fh(W.width,W.height,A.format,A.type);for(let Se of A.layerUpdates){let Ee=W.data.subarray(Se*ge/W.data.BYTES_PER_ELEMENT,(Se+1)*ge/W.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,Se,W.width,W.height,1,oe,ce,Ee)}A.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,W.width,W.height,W.depth,oe,ce,W.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,V,W.width,W.height,W.depth,0,oe,ce,W.data);else if(A.isData3DTexture)J?($&&t.texStorage3D(r.TEXTURE_3D,ve,V,W.width,W.height,W.depth),_e&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,W.width,W.height,W.depth,oe,ce,W.data)):t.texImage3D(r.TEXTURE_3D,0,V,W.width,W.height,W.depth,0,oe,ce,W.data);else if(A.isFramebufferTexture){if($)if(J)t.texStorage2D(r.TEXTURE_2D,ve,V,W.width,W.height);else{let ge=W.width,Se=W.height;for(let Ee=0;Ee<ve;Ee++)t.texImage2D(r.TEXTURE_2D,Ee,V,ge,Se,0,oe,ce,null),ge>>=1,Se>>=1}}else if(k.length>0){if(J&&$){let ge=te(k[0]);t.texStorage2D(r.TEXTURE_2D,ve,V,ge.width,ge.height)}for(let ge=0,Se=k.length;ge<Se;ge++)b=k[ge],J?_e&&t.texSubImage2D(r.TEXTURE_2D,ge,0,0,oe,ce,b):t.texImage2D(r.TEXTURE_2D,ge,V,oe,ce,b);A.generateMipmaps=!1}else if(J){if($){let ge=te(W);t.texStorage2D(r.TEXTURE_2D,ve,V,ge.width,ge.height)}_e&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,oe,ce,W)}else t.texImage2D(r.TEXTURE_2D,0,V,oe,ce,W);m(A)&&g(N),T.__version=D.version,A.onUpdate&&A.onUpdate(A)}E.__version=A.version}function pe(E,A,O,N,P,D){let T=s.convert(O.format,O.colorSpace),U=s.convert(O.type),X=y(O.internalFormat,T,U,O.colorSpace),he=n.get(A),W=n.get(O);if(W.__renderTarget=A,!he.__hasExternalTextures){let oe=Math.max(1,A.width>>D),ce=Math.max(1,A.height>>D);P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY?t.texImage3D(P,D,X,oe,ce,A.depth,0,T,U,null):t.texImage2D(P,D,X,oe,ce,0,T,U,null)}t.bindFramebuffer(r.FRAMEBUFFER,E),xe(A)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,N,P,W.__webglTexture,0,le(A)):(P===r.TEXTURE_2D||P>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&P<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,N,P,W.__webglTexture,D),t.bindFramebuffer(r.FRAMEBUFFER,null)}function me(E,A,O){if(r.bindRenderbuffer(r.RENDERBUFFER,E),A.depthBuffer){let N=A.depthTexture,P=N&&N.isDepthTexture?N.type:null,D=M(A.stencilBuffer,P),T=A.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,U=le(A);xe(A)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,U,D,A.width,A.height):O?r.renderbufferStorageMultisample(r.RENDERBUFFER,U,D,A.width,A.height):r.renderbufferStorage(r.RENDERBUFFER,D,A.width,A.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,T,r.RENDERBUFFER,E)}else{let N=A.textures;for(let P=0;P<N.length;P++){let D=N[P],T=s.convert(D.format,D.colorSpace),U=s.convert(D.type),X=y(D.internalFormat,T,U,D.colorSpace),he=le(A);O&&xe(A)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,he,X,A.width,A.height):xe(A)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,he,X,A.width,A.height):r.renderbufferStorage(r.RENDERBUFFER,X,A.width,A.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Ae(E){let A=n.get(E),O=E.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==E.depthTexture){let N=E.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),N){let P=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,N.removeEventListener("dispose",P)};N.addEventListener("dispose",P),A.__depthDisposeCallback=P}A.__boundDepthTexture=N}if(E.depthTexture&&!A.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");(function(N,P){if(P&&P.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,N),!P.depthTexture||!P.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let D=n.get(P.depthTexture);D.__renderTarget=P,D.__webglTexture&&P.depthTexture.image.width===P.width&&P.depthTexture.image.height===P.height||(P.depthTexture.image.width=P.width,P.depthTexture.image.height=P.height,P.depthTexture.needsUpdate=!0),q(P.depthTexture,0);let T=D.__webglTexture,U=le(P);if(P.depthTexture.format===Xr)xe(P)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,T,0,U):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,T,0);else{if(P.depthTexture.format!==ir)throw new Error("Unknown depthTexture format");xe(P)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,T,0,U):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,T,0)}})(A.__webglFramebuffer,E)}else if(O){A.__webglDepthbuffer=[];for(let N=0;N<6;N++)if(t.bindFramebuffer(r.FRAMEBUFFER,A.__webglFramebuffer[N]),A.__webglDepthbuffer[N]===void 0)A.__webglDepthbuffer[N]=r.createRenderbuffer(),me(A.__webglDepthbuffer[N],E,!1);else{let P=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,D=A.__webglDepthbuffer[N];r.bindRenderbuffer(r.RENDERBUFFER,D),r.framebufferRenderbuffer(r.FRAMEBUFFER,P,r.RENDERBUFFER,D)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=r.createRenderbuffer(),me(A.__webglDepthbuffer,E,!1);else{let N=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,P=A.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,P),r.framebufferRenderbuffer(r.FRAMEBUFFER,N,r.RENDERBUFFER,P)}t.bindFramebuffer(r.FRAMEBUFFER,null)}let Ce=[],ue=[];function le(E){return Math.min(i.maxSamples,E.samples)}function xe(E){let A=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function we(E,A){let O=E.colorSpace,N=E.format,P=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||O!==mr&&O!==Hn&&(Ye.getTransfer(O)===Qe?N===hn&&P===Wn||console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),A}function te(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=function(){let E=G;return E>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+i.maxTextures),G+=1,E},this.resetTextureUnits=function(){G=0},this.setTexture2D=q,this.setTexture2DArray=function(E,A){let O=n.get(E);E.version>0&&O.__version!==E.version?ee(O,E,A):t.bindTexture(r.TEXTURE_2D_ARRAY,O.__webglTexture,r.TEXTURE0+A)},this.setTexture3D=function(E,A){let O=n.get(E);E.version>0&&O.__version!==E.version?ee(O,E,A):t.bindTexture(r.TEXTURE_3D,O.__webglTexture,r.TEXTURE0+A)},this.setTextureCube=function(E,A){let O=n.get(E);E.version>0&&O.__version!==E.version?(function(N,P,D){if(P.image.length!==6)return;let T=se(N,P),U=P.source;t.bindTexture(r.TEXTURE_CUBE_MAP,N.__webglTexture,r.TEXTURE0+D);let X=n.get(U);if(U.version!==X.__version||T===!0){t.activeTexture(r.TEXTURE0+D);let he=Ye.getPrimaries(Ye.workingColorSpace),W=P.colorSpace===Hn?null:Ye.getPrimaries(P.colorSpace),oe=P.colorSpace===Hn||he===W?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,P.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,P.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,oe);let ce=P.isCompressedTexture||P.image[0].isCompressedTexture,b=P.image[0]&&P.image[0].isDataTexture,V=[];for(let ye=0;ye<6;ye++)V[ye]=ce||b?b?P.image[ye].image:P.image[ye]:_(P.image[ye],!0,i.maxCubemapSize),V[ye]=we(P,V[ye]);let k=V[0],J=s.convert(P.format,P.colorSpace),$=s.convert(P.type),_e=y(P.internalFormat,J,$,P.colorSpace),ve=P.isVideoTexture!==!0,ge=X.__version===void 0||T===!0,Se=U.dataReady,Ee,Ie=I(P,k);if(z(r.TEXTURE_CUBE_MAP,P),ce){ve&&ge&&t.texStorage2D(r.TEXTURE_CUBE_MAP,Ie,_e,k.width,k.height);for(let ye=0;ye<6;ye++){Ee=V[ye].mipmaps;for(let Re=0;Re<Ee.length;Re++){let We=Ee[Re];P.format!==hn?J!==null?ve?Se&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re,0,0,We.width,We.height,J,We.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re,_e,We.width,We.height,0,We.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ve?Se&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re,0,0,We.width,We.height,J,$,We.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re,_e,We.width,We.height,0,J,$,We.data)}}}else{if(Ee=P.mipmaps,ve&&ge){Ee.length>0&&Ie++;let ye=te(V[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,Ie,_e,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(b){ve?Se&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,V[ye].width,V[ye].height,J,$,V[ye].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,_e,V[ye].width,V[ye].height,0,J,$,V[ye].data);for(let Re=0;Re<Ee.length;Re++){let We=Ee[Re].image[ye].image;ve?Se&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re+1,0,0,We.width,We.height,J,$,We.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re+1,_e,We.width,We.height,0,J,$,We.data)}}else{ve?Se&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,J,$,V[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,_e,J,$,V[ye]);for(let Re=0;Re<Ee.length;Re++){let We=Ee[Re];ve?Se&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re+1,0,0,J,$,We.image[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Re+1,_e,J,$,We.image[ye])}}}m(P)&&g(r.TEXTURE_CUBE_MAP),X.__version=U.version,P.onUpdate&&P.onUpdate(P)}N.__version=P.version})(O,E,A):t.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture,r.TEXTURE0+A)},this.rebindTextures=function(E,A,O){let N=n.get(E);A!==void 0&&pe(N.__webglFramebuffer,E,E.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),O!==void 0&&Ae(E)},this.setupRenderTarget=function(E){let A=E.texture,O=n.get(E),N=n.get(A);E.addEventListener("dispose",L);let P=E.textures,D=E.isWebGLCubeRenderTarget===!0,T=P.length>1;if(T||(N.__webglTexture===void 0&&(N.__webglTexture=r.createTexture()),N.__version=A.version,a.memory.textures++),D){O.__webglFramebuffer=[];for(let U=0;U<6;U++)if(A.mipmaps&&A.mipmaps.length>0){O.__webglFramebuffer[U]=[];for(let X=0;X<A.mipmaps.length;X++)O.__webglFramebuffer[U][X]=r.createFramebuffer()}else O.__webglFramebuffer[U]=r.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){O.__webglFramebuffer=[];for(let U=0;U<A.mipmaps.length;U++)O.__webglFramebuffer[U]=r.createFramebuffer()}else O.__webglFramebuffer=r.createFramebuffer();if(T)for(let U=0,X=P.length;U<X;U++){let he=n.get(P[U]);he.__webglTexture===void 0&&(he.__webglTexture=r.createTexture(),a.memory.textures++)}if(E.samples>0&&xe(E)===!1){O.__webglMultisampledFramebuffer=r.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let U=0;U<P.length;U++){let X=P[U];O.__webglColorRenderbuffer[U]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,O.__webglColorRenderbuffer[U]);let he=s.convert(X.format,X.colorSpace),W=s.convert(X.type),oe=y(X.internalFormat,he,W,X.colorSpace,E.isXRRenderTarget===!0),ce=le(E);r.renderbufferStorageMultisample(r.RENDERBUFFER,ce,oe,E.width,E.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+U,r.RENDERBUFFER,O.__webglColorRenderbuffer[U])}r.bindRenderbuffer(r.RENDERBUFFER,null),E.depthBuffer&&(O.__webglDepthRenderbuffer=r.createRenderbuffer(),me(O.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(D){t.bindTexture(r.TEXTURE_CUBE_MAP,N.__webglTexture),z(r.TEXTURE_CUBE_MAP,A);for(let U=0;U<6;U++)if(A.mipmaps&&A.mipmaps.length>0)for(let X=0;X<A.mipmaps.length;X++)pe(O.__webglFramebuffer[U][X],E,A,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+U,X);else pe(O.__webglFramebuffer[U],E,A,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+U,0);m(A)&&g(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(T){for(let U=0,X=P.length;U<X;U++){let he=P[U],W=n.get(he);t.bindTexture(r.TEXTURE_2D,W.__webglTexture),z(r.TEXTURE_2D,he),pe(O.__webglFramebuffer,E,he,r.COLOR_ATTACHMENT0+U,r.TEXTURE_2D,0),m(he)&&g(r.TEXTURE_2D)}t.unbindTexture()}else{let U=r.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(U=E.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(U,N.__webglTexture),z(U,A),A.mipmaps&&A.mipmaps.length>0)for(let X=0;X<A.mipmaps.length;X++)pe(O.__webglFramebuffer[X],E,A,r.COLOR_ATTACHMENT0,U,X);else pe(O.__webglFramebuffer,E,A,r.COLOR_ATTACHMENT0,U,0);m(A)&&g(U),t.unbindTexture()}E.depthBuffer&&Ae(E)},this.updateRenderTargetMipmap=function(E){let A=E.textures;for(let O=0,N=A.length;O<N;O++){let P=A[O];if(m(P)){let D=v(E),T=n.get(P).__webglTexture;t.bindTexture(D,T),g(D),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(E){if(E.samples>0){if(xe(E)===!1){let A=E.textures,O=E.width,N=E.height,P=r.COLOR_BUFFER_BIT,D=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,T=n.get(E),U=A.length>1;if(U)for(let X=0;X<A.length;X++)t.bindFramebuffer(r.FRAMEBUFFER,T.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,T.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,T.__webglFramebuffer);for(let X=0;X<A.length;X++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(P|=r.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(P|=r.STENCIL_BUFFER_BIT)),U){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,T.__webglColorRenderbuffer[X]);let he=n.get(A[X]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,he,0)}r.blitFramebuffer(0,0,O,N,0,0,O,N,P,r.NEAREST),l===!0&&(Ce.length=0,ue.length=0,Ce.push(r.COLOR_ATTACHMENT0+X),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Ce.push(D),ue.push(D),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,ue)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Ce))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),U)for(let X=0;X<A.length;X++){t.bindFramebuffer(r.FRAMEBUFFER,T.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.RENDERBUFFER,T.__webglColorRenderbuffer[X]);let he=n.get(A[X]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+X,r.TEXTURE_2D,he,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,T.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){let A=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[A])}}},this.setupDepthRenderbuffer=Ae,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=xe}function jp(r,e){return{convert:function(t,n=""){let i,s=Ye.getTransfer(n);if(t===Wn)return r.UNSIGNED_BYTE;if(t===sc)return r.UNSIGNED_SHORT_4_4_4_4;if(t===ac)return r.UNSIGNED_SHORT_5_5_5_1;if(t===Bh)return r.UNSIGNED_INT_5_9_9_9_REV;if(t===Oh)return r.BYTE;if(t===Fh)return r.SHORT;if(t===Wr)return r.UNSIGNED_SHORT;if(t===rc)return r.INT;if(t===pi)return r.UNSIGNED_INT;if(t===cn)return r.FLOAT;if(t===as)return r.HALF_FLOAT;if(t===zh)return r.ALPHA;if(t===kh)return r.RGB;if(t===hn)return r.RGBA;if(t===Hh)return r.LUMINANCE;if(t===Gh)return r.LUMINANCE_ALPHA;if(t===Xr)return r.DEPTH_COMPONENT;if(t===ir)return r.DEPTH_STENCIL;if(t===oc)return r.RED;if(t===lc)return r.RED_INTEGER;if(t===Vh)return r.RG;if(t===cc)return r.RG_INTEGER;if(t===hc)return r.RGBA_INTEGER;if(t===ta||t===na||t===ia||t===ra)if(s===Qe){if(i=e.get("WEBGL_compressed_texture_s3tc_srgb"),i===null)return null;if(t===ta)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(t===na)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(t===ia)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(t===ra)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(i=e.get("WEBGL_compressed_texture_s3tc"),i===null)return null;if(t===ta)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(t===na)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(t===ia)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(t===ra)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(t===ko||t===Ho||t===Go||t===Vo){if(i=e.get("WEBGL_compressed_texture_pvrtc"),i===null)return null;if(t===ko)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(t===Ho)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(t===Go)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(t===Vo)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(t===Wo||t===Xo||t===jo){if(i=e.get("WEBGL_compressed_texture_etc"),i===null)return null;if(t===Wo||t===Xo)return s===Qe?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(t===jo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}if(t===qo||t===Yo||t===Zo||t===Jo||t===Ko||t===$o||t===Qo||t===el||t===tl||t===nl||t===il||t===rl||t===sl||t===al){if(i=e.get("WEBGL_compressed_texture_astc"),i===null)return null;if(t===qo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(t===Yo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(t===Zo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(t===Jo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(t===Ko)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(t===$o)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(t===Qo)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(t===el)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(t===tl)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(t===nl)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(t===il)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(t===rl)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(t===sl)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(t===al)return s===Qe?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}if(t===sa||t===ol||t===ll){if(i=e.get("EXT_texture_compression_bptc"),i===null)return null;if(t===sa)return s===Qe?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(t===ol)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(t===ll)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(t===Wh||t===cl||t===hl||t===ul){if(i=e.get("EXT_texture_compression_rgtc"),i===null)return null;if(t===sa)return i.COMPRESSED_RED_RGTC1_EXT;if(t===cl)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(t===hl)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(t===ul)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return t===nr?r.UNSIGNED_INT_24_8:r[t]!==void 0?r[t]:null}}}var Al=class extends bt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Ke=class extends yt{constructor(){super(),this.isGroup=!0,this.type="Group"}},qp={type:"move"},Br=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ke,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ke,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ke,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),g=this._getHandJoint(c,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,f=.005;c.inputState.pinching&&d>p+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(qp)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ke;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Rl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let i=new Lt;e.properties.get(i).__webglTexture=t.texture,t.depthNear==n.depthNear&&t.depthFar==n.depthFar||(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new mn({vertexShader:`
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

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Et(new nn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Cl=class extends Xn{constructor(e,t){super();let n=this,i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,f=null,_=new Rl,m=t.getContextAttributes(),g=null,v=null,y=[],M=[],I=new fe,C=null,L=new bt;L.viewport=new Ze;let F=new bt;F.viewport=new Ze;let G=[L,F],q=new Al,Z=null,j=null;function H(ue){let le=M.indexOf(ue.inputSource);if(le===-1)return;let xe=y[le];xe!==void 0&&(xe.update(ue.inputSource,ue.frame,c||a),xe.dispatchEvent({type:ue.type,data:ue.inputSource}))}function z(){i.removeEventListener("select",H),i.removeEventListener("selectstart",H),i.removeEventListener("selectend",H),i.removeEventListener("squeeze",H),i.removeEventListener("squeezestart",H),i.removeEventListener("squeezeend",H),i.removeEventListener("end",z),i.removeEventListener("inputsourceschange",se);for(let ue=0;ue<y.length;ue++){let le=M[ue];le!==null&&(M[ue]=null,y[ue].disconnect(le))}Z=null,j=null,_.reset(),e.setRenderTarget(g),p=null,d=null,u=null,i=null,v=null,Ce.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}function se(ue){for(let le=0;le<ue.removed.length;le++){let xe=ue.removed[le],we=M.indexOf(xe);we>=0&&(M[we]=null,y[we].disconnect(xe))}for(let le=0;le<ue.added.length;le++){let xe=ue.added[le],we=M.indexOf(xe);if(we===-1){for(let E=0;E<y.length;E++){if(E>=M.length){M.push(xe),we=E;break}if(M[E]===null){M[E]=xe,we=E;break}}if(we===-1)break}let te=y[we];te&&te.connect(xe)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ue){let le=y[ue];return le===void 0&&(le=new Br,y[ue]=le),le.getTargetRaySpace()},this.getControllerGrip=function(ue){let le=y[ue];return le===void 0&&(le=new Br,y[ue]=le),le.getGripSpace()},this.getHand=function(ue){let le=y[ue];return le===void 0&&(le=new Br,y[ue]=le),le.getHandSpace()},this.setFramebufferScaleFactor=function(ue){s=ue,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ue){o=ue,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ue){c=ue},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return f},this.getSession=function(){return i},this.setSession=async function(ue){if(i=ue,i!==null){if(g=e.getRenderTarget(),i.addEventListener("select",H),i.addEventListener("selectstart",H),i.addEventListener("selectend",H),i.addEventListener("squeeze",H),i.addEventListener("squeezestart",H),i.addEventListener("squeezeend",H),i.addEventListener("end",z),i.addEventListener("inputsourceschange",se),m.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(I),i.renderState.layers===void 0){let le={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(i,t,le),i.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new An(p.framebufferWidth,p.framebufferHeight,{format:hn,type:Wn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let le=null,xe=null,we=null;m.depth&&(we=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=m.stencil?ir:Xr,xe=m.stencil?nr:pi);let te={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:s};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(te),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new An(d.textureWidth,d.textureHeight,{format:hn,type:Wn,depthTexture:new _a(d.textureWidth,d.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Ce.setContext(i),Ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};let ee=new R,pe=new R;function me(ue,le){le===null?ue.matrixWorld.copy(ue.matrix):ue.matrixWorld.multiplyMatrices(le.matrixWorld,ue.matrix),ue.matrixWorldInverse.copy(ue.matrixWorld).invert()}this.updateCamera=function(ue){if(i===null)return;let le=ue.near,xe=ue.far;_.texture!==null&&(_.depthNear>0&&(le=_.depthNear),_.depthFar>0&&(xe=_.depthFar)),q.near=F.near=L.near=le,q.far=F.far=L.far=xe,Z===q.near&&j===q.far||(i.updateRenderState({depthNear:q.near,depthFar:q.far}),Z=q.near,j=q.far),L.layers.mask=2|ue.layers.mask,F.layers.mask=4|ue.layers.mask,q.layers.mask=L.layers.mask|F.layers.mask;let we=ue.parent,te=q.cameras;me(q,we);for(let E=0;E<te.length;E++)me(te[E],we);te.length===2?(function(E,A,O){ee.setFromMatrixPosition(A.matrixWorld),pe.setFromMatrixPosition(O.matrixWorld);let N=ee.distanceTo(pe),P=A.projectionMatrix.elements,D=O.projectionMatrix.elements,T=P[14]/(P[10]-1),U=P[14]/(P[10]+1),X=(P[9]+1)/P[5],he=(P[9]-1)/P[5],W=(P[8]-1)/P[0],oe=(D[8]+1)/D[0],ce=T*W,b=T*oe,V=N/(-W+oe),k=V*-W;if(A.matrixWorld.decompose(E.position,E.quaternion,E.scale),E.translateX(k),E.translateZ(V),E.matrixWorld.compose(E.position,E.quaternion,E.scale),E.matrixWorldInverse.copy(E.matrixWorld).invert(),P[10]===-1)E.projectionMatrix.copy(A.projectionMatrix),E.projectionMatrixInverse.copy(A.projectionMatrixInverse);else{let J=T+V,$=U+V,_e=ce-k,ve=b+(N-k),ge=X*U/$*J,Se=he*U/$*J;E.projectionMatrix.makePerspective(_e,ve,ge,Se,J,$),E.projectionMatrixInverse.copy(E.projectionMatrix).invert()}})(q,L,F):q.projectionMatrix.copy(L.projectionMatrix),(function(E,A,O){O===null?E.matrix.copy(A.matrixWorld):(E.matrix.copy(O.matrixWorld),E.matrix.invert(),E.matrix.multiply(A.matrixWorld)),E.matrix.decompose(E.position,E.quaternion,E.scale),E.updateMatrixWorld(!0),E.projectionMatrix.copy(A.projectionMatrix),E.projectionMatrixInverse.copy(A.projectionMatrixInverse),E.isPerspectiveCamera&&(E.fov=2*pl*Math.atan(1/E.projectionMatrix.elements[5]),E.zoom=1)})(ue,q,we)},this.getCamera=function(){return q},this.getFoveation=function(){if(d!==null||p!==null)return l},this.setFoveation=function(ue){l=ue,d!==null&&(d.fixedFoveation=ue),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=ue)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(q)};let Ae=null,Ce=new Zh;Ce.setAnimationLoop((function(ue,le){if(h=le.getViewerPose(c||a),f=le,h!==null){let xe=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let we=!1;xe.length!==q.cameras.length&&(q.cameras.length=0,we=!0);for(let E=0;E<xe.length;E++){let A=xe[E],O=null;if(p!==null)O=p.getViewport(A);else{let P=u.getViewSubImage(d,A);O=P.viewport,E===0&&(e.setRenderTargetTextures(v,P.colorTexture,d.ignoreDepthValues?void 0:P.depthStencilTexture),e.setRenderTarget(v))}let N=G[E];N===void 0&&(N=new bt,N.layers.enable(E),N.viewport=new Ze,G[E]=N),N.matrix.fromArray(A.transform.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale),N.projectionMatrix.fromArray(A.projectionMatrix),N.projectionMatrixInverse.copy(N.projectionMatrix).invert(),N.viewport.set(O.x,O.y,O.width,O.height),E===0&&(q.matrix.copy(N.matrix),q.matrix.decompose(q.position,q.quaternion,q.scale)),we===!0&&q.cameras.push(N)}let te=i.enabledFeatures;if(te&&te.includes("depth-sensing")){let E=u.getDepthInformation(xe[0]);E&&E.isValid&&E.texture&&_.init(e,E,i.renderState)}}for(let xe=0;xe<y.length;xe++){let we=M[xe],te=y[xe];we!==null&&te!==void 0&&te.update(we,le,c||a)}Ae&&Ae(ue,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),f=null})),this.setAnimationLoop=function(ue){Ae=ue},this.dispose=function(){}}},li=new dn,Yp=new je;function Zp(r,e){function t(i,s){i.matrixAutoUpdate===!0&&i.updateMatrix(),s.value.copy(i.matrix)}function n(i,s){i.opacity.value=s.opacity,s.color&&i.diffuse.value.copy(s.color),s.emissive&&i.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(i.map.value=s.map,t(s.map,i.mapTransform)),s.alphaMap&&(i.alphaMap.value=s.alphaMap,t(s.alphaMap,i.alphaMapTransform)),s.bumpMap&&(i.bumpMap.value=s.bumpMap,t(s.bumpMap,i.bumpMapTransform),i.bumpScale.value=s.bumpScale,s.side===1&&(i.bumpScale.value*=-1)),s.normalMap&&(i.normalMap.value=s.normalMap,t(s.normalMap,i.normalMapTransform),i.normalScale.value.copy(s.normalScale),s.side===1&&i.normalScale.value.negate()),s.displacementMap&&(i.displacementMap.value=s.displacementMap,t(s.displacementMap,i.displacementMapTransform),i.displacementScale.value=s.displacementScale,i.displacementBias.value=s.displacementBias),s.emissiveMap&&(i.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,i.emissiveMapTransform)),s.specularMap&&(i.specularMap.value=s.specularMap,t(s.specularMap,i.specularMapTransform)),s.alphaTest>0&&(i.alphaTest.value=s.alphaTest);let a=e.get(s),o=a.envMap,l=a.envMapRotation;o&&(i.envMap.value=o,li.copy(l),li.x*=-1,li.y*=-1,li.z*=-1,o.isCubeTexture&&o.isRenderTargetTexture===!1&&(li.y*=-1,li.z*=-1),i.envMapRotation.value.setFromMatrix4(Yp.makeRotationFromEuler(li)),i.flipEnvMap.value=o.isCubeTexture&&o.isRenderTargetTexture===!1?-1:1,i.reflectivity.value=s.reflectivity,i.ior.value=s.ior,i.refractionRatio.value=s.refractionRatio),s.lightMap&&(i.lightMap.value=s.lightMap,i.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,i.lightMapTransform)),s.aoMap&&(i.aoMap.value=s.aoMap,i.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,i.aoMapTransform))}return{refreshFogUniforms:function(i,s){s.color.getRGB(i.fogColor.value,Yh(r)),s.isFog?(i.fogNear.value=s.near,i.fogFar.value=s.far):s.isFogExp2&&(i.fogDensity.value=s.density)},refreshMaterialUniforms:function(i,s,a,o,l){s.isMeshBasicMaterial||s.isMeshLambertMaterial?n(i,s):s.isMeshToonMaterial?(n(i,s),(function(c,h){h.gradientMap&&(c.gradientMap.value=h.gradientMap)})(i,s)):s.isMeshPhongMaterial?(n(i,s),(function(c,h){c.specular.value.copy(h.specular),c.shininess.value=Math.max(h.shininess,1e-4)})(i,s)):s.isMeshStandardMaterial?(n(i,s),(function(c,h){c.metalness.value=h.metalness,h.metalnessMap&&(c.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,c.metalnessMapTransform)),c.roughness.value=h.roughness,h.roughnessMap&&(c.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,c.roughnessMapTransform)),h.envMap&&(c.envMapIntensity.value=h.envMapIntensity)})(i,s),s.isMeshPhysicalMaterial&&(function(c,h,u){c.ior.value=h.ior,h.sheen>0&&(c.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),c.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(c.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,c.sheenColorMapTransform)),h.sheenRoughnessMap&&(c.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,c.sheenRoughnessMapTransform))),h.clearcoat>0&&(c.clearcoat.value=h.clearcoat,c.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(c.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,c.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(c.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===1&&c.clearcoatNormalScale.value.negate())),h.dispersion>0&&(c.dispersion.value=h.dispersion),h.iridescence>0&&(c.iridescence.value=h.iridescence,c.iridescenceIOR.value=h.iridescenceIOR,c.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(c.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,c.iridescenceMapTransform)),h.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),h.transmission>0&&(c.transmission.value=h.transmission,c.transmissionSamplerMap.value=u.texture,c.transmissionSamplerSize.value.set(u.width,u.height),h.transmissionMap&&(c.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,c.transmissionMapTransform)),c.thickness.value=h.thickness,h.thicknessMap&&(c.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=h.attenuationDistance,c.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(c.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(c.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=h.specularIntensity,c.specularColor.value.copy(h.specularColor),h.specularColorMap&&(c.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,c.specularColorMapTransform)),h.specularIntensityMap&&(c.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,c.specularIntensityMapTransform))})(i,s,l)):s.isMeshMatcapMaterial?(n(i,s),(function(c,h){h.matcap&&(c.matcap.value=h.matcap)})(i,s)):s.isMeshDepthMaterial?n(i,s):s.isMeshDistanceMaterial?(n(i,s),(function(c,h){let u=e.get(h).light;c.referencePosition.value.setFromMatrixPosition(u.matrixWorld),c.nearDistance.value=u.shadow.camera.near,c.farDistance.value=u.shadow.camera.far})(i,s)):s.isMeshNormalMaterial?n(i,s):s.isLineBasicMaterial?((function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform))})(i,s),s.isLineDashedMaterial&&(function(c,h){c.dashSize.value=h.dashSize,c.totalSize.value=h.dashSize+h.gapSize,c.scale.value=h.scale})(i,s)):s.isPointsMaterial?(function(c,h,u,d){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.size.value=h.size*u,c.scale.value=.5*d,h.map&&(c.map.value=h.map,t(h.map,c.uvTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)})(i,s,a,o):s.isSpriteMaterial?(function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.rotation.value=h.rotation,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)})(i,s):s.isShadowMaterial?(i.color.value.copy(s.color),i.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}}}function Jp(r,e,t,n){let i={},s={},a=[],o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(u,d,p,f){let _=u.value,m=d+"_"+p;if(f[m]===void 0)return f[m]=typeof _=="number"||typeof _=="boolean"?_:_.clone(),!0;{let g=f[m];if(typeof _=="number"||typeof _=="boolean"){if(g!==_)return f[m]=_,!0}else if(g.equals(_)===!1)return g.copy(_),!0}return!1}function c(u){let d={boundary:0,storage:0};return typeof u=="number"||typeof u=="boolean"?(d.boundary=4,d.storage=4):u.isVector2?(d.boundary=8,d.storage=8):u.isVector3||u.isColor?(d.boundary=16,d.storage=12):u.isVector4?(d.boundary=16,d.storage=16):u.isMatrix3?(d.boundary=48,d.storage=48):u.isMatrix4?(d.boundary=64,d.storage=64):u.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",u),d}function h(u){let d=u.target;d.removeEventListener("dispose",h);let p=a.indexOf(d.__bindingPointIndex);a.splice(p,1),r.deleteBuffer(i[d.id]),delete i[d.id],delete s[d.id]}return{bind:function(u,d){let p=d.program;n.uniformBlockBinding(u,p)},update:function(u,d){let p=i[u.id];p===void 0&&((function(m){let g=m.uniforms,v=0,y=16;for(let I=0,C=g.length;I<C;I++){let L=Array.isArray(g[I])?g[I]:[g[I]];for(let F=0,G=L.length;F<G;F++){let q=L[F],Z=Array.isArray(q.value)?q.value:[q.value];for(let j=0,H=Z.length;j<H;j++){let z=c(Z[j]),se=v%y,ee=se%z.boundary,pe=se+ee;v+=ee,pe!==0&&y-pe<z.storage&&(v+=y-pe),q.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=v,v+=z.storage}}}let M=v%y;M>0&&(v+=y-M),m.__size=v,m.__cache={}})(u),p=(function(m){let g=(function(){for(let I=0;I<o;I++)if(a.indexOf(I)===-1)return a.push(I),I;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0})();m.__bindingPointIndex=g;let v=r.createBuffer(),y=m.__size,M=m.usage;return r.bindBuffer(r.UNIFORM_BUFFER,v),r.bufferData(r.UNIFORM_BUFFER,y,M),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,g,v),v})(u),i[u.id]=p,u.addEventListener("dispose",h));let f=d.program;n.updateUBOMapping(u,f);let _=e.render.frame;s[u.id]!==_&&((function(m){let g=i[m.id],v=m.uniforms,y=m.__cache;r.bindBuffer(r.UNIFORM_BUFFER,g);for(let M=0,I=v.length;M<I;M++){let C=Array.isArray(v[M])?v[M]:[v[M]];for(let L=0,F=C.length;L<F;L++){let G=C[L];if(l(G,M,L,y)===!0){let q=G.__offset,Z=Array.isArray(G.value)?G.value:[G.value],j=0;for(let H=0;H<Z.length;H++){let z=Z[H],se=c(z);typeof z=="number"||typeof z=="boolean"?(G.__data[0]=z,r.bufferSubData(r.UNIFORM_BUFFER,q+j,G.__data)):z.isMatrix3?(G.__data[0]=z.elements[0],G.__data[1]=z.elements[1],G.__data[2]=z.elements[2],G.__data[3]=0,G.__data[4]=z.elements[3],G.__data[5]=z.elements[4],G.__data[6]=z.elements[5],G.__data[7]=0,G.__data[8]=z.elements[6],G.__data[9]=z.elements[7],G.__data[10]=z.elements[8],G.__data[11]=0):(z.toArray(G.__data,j),j+=se.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,q,G.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)})(u),s[u.id]=_)},dispose:function(){for(let u in i)r.deleteBuffer(i[u]);a=[],i={},s={}}}}var ya=class{constructor(e={}){let{canvas:t=ad(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e,p;if(this.isWebGLRenderer=!0,n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let f=new Uint32Array(4),_=new Int32Array(4),m=null,g=null,v=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=vt,this.toneMapping=0,this.toneMappingExposure=1;let M=this,I=!1,C=0,L=0,F=null,G=-1,q=null,Z=new Ze,j=new Ze,H=null,z=new ze(0),se=0,ee=t.width,pe=t.height,me=1,Ae=null,Ce=null,ue=new Ze(0,0,ee,pe),le=new Ze(0,0,ee,pe),xe=!1,we=new or,te=!1,E=!1,A=new je,O=new je,N=new R,P=new Ze,D={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},T=!1;function U(){return F===null?me:1}let X,he,W,oe,ce,b,V,k,J,$,_e,ve,ge,Se,Ee,Ie,ye,Re,We,Rt,In,mt,ot,sn,Y=n;function jt(w,K){return t.getContext(w,K)}try{let w={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",yr,!1),t.addEventListener("webglcontextrestored",Ei,!1),t.addEventListener("webglcontextcreationerror",xr,!1),Y===null){let K="webgl2";if(Y=jt(K,w),Y===null)throw jt(K)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}function qt(){X=new Id(Y),X.init(),mt=new jp(Y,X),he=new Ad(Y,X,e,mt),W=new Wp(Y,X),he.reverseDepthBuffer&&d&&W.buffers.depth.setReversed(!0),oe=new Dd(Y),ce=new Dp,b=new Xp(Y,X,W,ce,he,mt,oe),V=new Cd(M),k=new Pd(M),J=new Sd(Y),ot=new Td(Y,J),$=new Ld(Y,J,oe,ot),_e=new Od(Y,$,J,oe),We=new Nd(Y,he,b),Ie=new Rd(ce),ve=new Up(M,V,k,X,he,ot,Ie),ge=new Zp(M,ce),Se=new Op,Ee=new Hp(X),Re=new Ed(M,V,k,W,_e,p,l),ye=new Gp(M,_e,he),sn=new Jp(Y,oe,he,W),Rt=new wd(Y,X,oe),In=new Ud(Y,X,oe),oe.programs=ve.programs,M.capabilities=he,M.extensions=X,M.properties=ce,M.renderLists=Se,M.shadowMap=ye,M.state=W,M.info=oe}qt();let it=new Cl(M,Y);function yr(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function Ei(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;let w=oe.autoReset,K=ye.enabled,ne=ye.autoUpdate,x=ye.needsUpdate,S=ye.type;qt(),oe.autoReset=w,ye.enabled=K,ye.autoUpdate=ne,ye.needsUpdate=x,ye.type=S}function xr(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function Mr(w){let K=w.target;K.removeEventListener("dispose",Mr),(function(ne){(function(x){let S=ce.get(x).programs;S!==void 0&&(S.forEach((function(B){ve.releaseProgram(B)})),x.isShaderMaterial&&ve.releaseShaderCache(x))})(ne),ce.remove(ne)})(K)}function Ti(w,K,ne){w.transparent===!0&&w.side===2&&w.forceSinglePass===!1?(w.side=1,w.needsUpdate=!0,Ci(w,K,ne),w.side=0,w.needsUpdate=!0,Ci(w,K,ne),w.side=2):Ci(w,K,ne)}this.xr=it,this.getContext=function(){return Y},this.getContextAttributes=function(){return Y.getContextAttributes()},this.forceContextLoss=function(){let w=X.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=X.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(w){w!==void 0&&(me=w,this.setSize(ee,pe,!1))},this.getSize=function(w){return w.set(ee,pe)},this.setSize=function(w,K,ne=!0){it.isPresenting?console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting."):(ee=w,pe=K,t.width=Math.floor(w*me),t.height=Math.floor(K*me),ne===!0&&(t.style.width=w+"px",t.style.height=K+"px"),this.setViewport(0,0,w,K))},this.getDrawingBufferSize=function(w){return w.set(ee*me,pe*me).floor()},this.setDrawingBufferSize=function(w,K,ne){ee=w,pe=K,me=ne,t.width=Math.floor(w*ne),t.height=Math.floor(K*ne),this.setViewport(0,0,w,K)},this.getCurrentViewport=function(w){return w.copy(Z)},this.getViewport=function(w){return w.copy(ue)},this.setViewport=function(w,K,ne,x){w.isVector4?ue.set(w.x,w.y,w.z,w.w):ue.set(w,K,ne,x),W.viewport(Z.copy(ue).multiplyScalar(me).round())},this.getScissor=function(w){return w.copy(le)},this.setScissor=function(w,K,ne,x){w.isVector4?le.set(w.x,w.y,w.z,w.w):le.set(w,K,ne,x),W.scissor(j.copy(le).multiplyScalar(me).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(w){W.setScissorTest(xe=w)},this.setOpaqueSort=function(w){Ae=w},this.setTransparentSort=function(w){Ce=w},this.getClearColor=function(w){return w.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor.apply(Re,arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha.apply(Re,arguments)},this.clear=function(w=!0,K=!0,ne=!0){let x=0;if(w){let S=!1;if(F!==null){let B=F.texture.format;S=B===hc||B===cc||B===lc}if(S){let B=F.texture.type,ie=B===Wn||B===pi||B===Wr||B===nr||B===sc||B===ac,re=Re.getClearColor(),Q=Re.getClearAlpha(),de=re.r,Me=re.g,Te=re.b;ie?(f[0]=de,f[1]=Me,f[2]=Te,f[3]=Q,Y.clearBufferuiv(Y.COLOR,0,f)):(_[0]=de,_[1]=Me,_[2]=Te,_[3]=Q,Y.clearBufferiv(Y.COLOR,0,_))}else x|=Y.COLOR_BUFFER_BIT}K&&(x|=Y.DEPTH_BUFFER_BIT),ne&&(x|=Y.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y.clear(x)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",yr,!1),t.removeEventListener("webglcontextrestored",Ei,!1),t.removeEventListener("webglcontextcreationerror",xr,!1),Se.dispose(),Ee.dispose(),ce.dispose(),V.dispose(),k.dispose(),_e.dispose(),ot.dispose(),sn.dispose(),ve.dispose(),it.dispose(),it.removeEventListener("sessionstart",ps),it.removeEventListener("sessionend",ms),_n.stop()},this.renderBufferDirect=function(w,K,ne,x,S,B){K===null&&(K=D);let ie=S.isMesh&&S.matrixWorld.determinant()<0,re=(function(Ue,qe,st,Be,Ne){qe.isScene!==!0&&(qe=D),b.resetTextureUnits();let Ct=qe.fog,an=Be.isMeshStandardMaterial?qe.environment:null,at=F===null?M.outputColorSpace:F.isXRRenderTarget===!0?F.texture.colorSpace:mr,Yt=(Be.isMeshStandardMaterial?k:V).get(Be.envMap||an),Qn=Be.vertexColors===!0&&!!st.attributes.color&&st.attributes.color.itemSize===4,Ln=!!st.attributes.tangent&&(!!Be.normalMap||Be.anisotropy>0),Un=!!st.morphAttributes.position,xt=!!st.morphAttributes.normal,Tr=!!st.morphAttributes.color,vs=0;Be.toneMapped&&(F!==null&&F.isXRRenderTarget!==!0||(vs=M.toneMapping));let _s=st.morphAttributes.position||st.morphAttributes.normal||st.morphAttributes.color,Dn=_s!==void 0?_s.length:0,Ge=ce.get(Be),Pi=g.state.lights;if(te===!0&&(E===!0||Ue!==q)){let gt=Ue===q&&Be.id===G;Ie.setState(Be,Ue,gt)}let Ut=!1;Be.version===Ge.__version?Ge.needsLights&&Ge.lightsStateVersion!==Pi.state.version||Ge.outputColorSpace!==at||Ne.isBatchedMesh&&Ge.batching===!1?Ut=!0:Ne.isBatchedMesh||Ge.batching!==!0?Ne.isBatchedMesh&&Ge.batchingColor===!0&&Ne.colorTexture===null||Ne.isBatchedMesh&&Ge.batchingColor===!1&&Ne.colorTexture!==null||Ne.isInstancedMesh&&Ge.instancing===!1?Ut=!0:Ne.isInstancedMesh||Ge.instancing!==!0?Ne.isSkinnedMesh&&Ge.skinning===!1?Ut=!0:Ne.isSkinnedMesh||Ge.skinning!==!0?Ne.isInstancedMesh&&Ge.instancingColor===!0&&Ne.instanceColor===null||Ne.isInstancedMesh&&Ge.instancingColor===!1&&Ne.instanceColor!==null||Ne.isInstancedMesh&&Ge.instancingMorph===!0&&Ne.morphTexture===null||Ne.isInstancedMesh&&Ge.instancingMorph===!1&&Ne.morphTexture!==null||Ge.envMap!==Yt||Be.fog===!0&&Ge.fog!==Ct?Ut=!0:Ge.numClippingPlanes===void 0||Ge.numClippingPlanes===Ie.numPlanes&&Ge.numIntersection===Ie.numIntersection?(Ge.vertexAlphas!==Qn||Ge.vertexTangents!==Ln||Ge.morphTargets!==Un||Ge.morphNormals!==xt||Ge.morphColors!==Tr||Ge.toneMapping!==vs||Ge.morphTargetsCount!==Dn)&&(Ut=!0):Ut=!0:Ut=!0:Ut=!0:Ut=!0:(Ut=!0,Ge.__version=Be.version);let on=Ge.currentProgram;Ut===!0&&(on=Ci(Be,qe,Ne));let ei=!1,ti=!1,Ii=!1,tt=on.getUniforms(),Dt=Ge.uniforms;if(W.useProgram(on.program)&&(ei=!0,ti=!0,Ii=!0),Be.id!==G&&(G=Be.id,ti=!0),ei||q!==Ue){W.buffers.depth.getReversed()?(A.copy(Ue.projectionMatrix),(function(Zt){let $e=Zt.elements;$e[2]=.5*$e[2]+.5*$e[3],$e[6]=.5*$e[6]+.5*$e[7],$e[10]=.5*$e[10]+.5*$e[11],$e[14]=.5*$e[14]+.5*$e[15]})(A),(function(Zt){let $e=Zt.elements;$e[11]===-1?($e[10]=-$e[10]-1,$e[14]=-$e[14]):($e[10]=-$e[10],$e[14]=1-$e[14])})(A),tt.setValue(Y,"projectionMatrix",A)):tt.setValue(Y,"projectionMatrix",Ue.projectionMatrix),tt.setValue(Y,"viewMatrix",Ue.matrixWorldInverse);let gt=tt.map.cameraPosition;gt!==void 0&&gt.setValue(Y,N.setFromMatrixPosition(Ue.matrixWorld)),he.logarithmicDepthBuffer&&tt.setValue(Y,"logDepthBufFC",2/(Math.log(Ue.far+1)/Math.LN2)),(Be.isMeshPhongMaterial||Be.isMeshToonMaterial||Be.isMeshLambertMaterial||Be.isMeshBasicMaterial||Be.isMeshStandardMaterial||Be.isShaderMaterial)&&tt.setValue(Y,"isOrthographic",Ue.isOrthographicCamera===!0),q!==Ue&&(q=Ue,ti=!0,Ii=!0)}if(Ne.isSkinnedMesh){tt.setOptional(Y,Ne,"bindMatrix"),tt.setOptional(Y,Ne,"bindMatrixInverse");let gt=Ne.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),tt.setValue(Y,"boneTexture",gt.boneTexture,b))}Ne.isBatchedMesh&&(tt.setOptional(Y,Ne,"batchingTexture"),tt.setValue(Y,"batchingTexture",Ne._matricesTexture,b),tt.setOptional(Y,Ne,"batchingIdTexture"),tt.setValue(Y,"batchingIdTexture",Ne._indirectTexture,b),tt.setOptional(Y,Ne,"batchingColorTexture"),Ne._colorsTexture!==null&&tt.setValue(Y,"batchingColorTexture",Ne._colorsTexture,b));let Li=st.morphAttributes;Li.position===void 0&&Li.normal===void 0&&Li.color===void 0||We.update(Ne,st,on),(ti||Ge.receiveShadow!==Ne.receiveShadow)&&(Ge.receiveShadow=Ne.receiveShadow,tt.setValue(Y,"receiveShadow",Ne.receiveShadow)),Be.isMeshGouraudMaterial&&Be.envMap!==null&&(Dt.envMap.value=Yt,Dt.flipEnvMap.value=Yt.isCubeTexture&&Yt.isRenderTargetTexture===!1?-1:1),Be.isMeshStandardMaterial&&Be.envMap===null&&qe.environment!==null&&(Dt.envMapIntensity.value=qe.environmentIntensity),ti&&(tt.setValue(Y,"toneMappingExposure",M.toneMappingExposure),Ge.needsLights&&(Pt=Ii,(Ht=Dt).ambientLightColor.needsUpdate=Pt,Ht.lightProbe.needsUpdate=Pt,Ht.directionalLights.needsUpdate=Pt,Ht.directionalLightShadows.needsUpdate=Pt,Ht.pointLights.needsUpdate=Pt,Ht.pointLightShadows.needsUpdate=Pt,Ht.spotLights.needsUpdate=Pt,Ht.spotLightShadows.needsUpdate=Pt,Ht.rectAreaLights.needsUpdate=Pt,Ht.hemisphereLights.needsUpdate=Pt),Ct&&Be.fog===!0&&ge.refreshFogUniforms(Dt,Ct),ge.refreshMaterialUniforms(Dt,Be,me,pe,g.state.transmissionRenderTarget[Ue.id]),Qi.upload(Y,gs(Ge),Dt,b));var Ht,Pt;if(Be.isShaderMaterial&&Be.uniformsNeedUpdate===!0&&(Qi.upload(Y,gs(Ge),Dt,b),Be.uniformsNeedUpdate=!1),Be.isSpriteMaterial&&tt.setValue(Y,"center",Ne.center),tt.setValue(Y,"modelViewMatrix",Ne.modelViewMatrix),tt.setValue(Y,"normalMatrix",Ne.normalMatrix),tt.setValue(Y,"modelMatrix",Ne.matrixWorld),Be.isShaderMaterial||Be.isRawShaderMaterial){let gt=Be.uniformsGroups;for(let Zt=0,$e=gt.length;Zt<$e;Zt++){let et=gt[Zt];sn.update(et,on),sn.bind(et,on)}}return on})(w,K,ne,x,S);W.setMaterial(x,ie);let Q=ne.index,de=1;if(x.wireframe===!0){if(Q=$.getWireframeAttribute(ne),Q===void 0)return;de=2}let Me=ne.drawRange,Te=ne.attributes.position,ae=Me.start*de,Oe=(Me.start+Me.count)*de;B!==null&&(ae=Math.max(ae,B.start*de),Oe=Math.min(Oe,(B.start+B.count)*de)),Q!==null?(ae=Math.max(ae,0),Oe=Math.min(Oe,Q.count)):Te!=null&&(ae=Math.max(ae,0),Oe=Math.min(Oe,Te.count));let Le=Oe-ae;if(Le<0||Le===1/0)return;let Fe;ot.setup(S,x,re,ne,Q);let He=Rt;if(Q!==null&&(Fe=J.get(Q),He=In,He.setIndex(Fe)),S.isMesh)x.wireframe===!0?(W.setLineWidth(x.wireframeLinewidth*U()),He.setMode(Y.LINES)):He.setMode(Y.TRIANGLES);else if(S.isLine){let Ue=x.linewidth;Ue===void 0&&(Ue=1),W.setLineWidth(Ue*U()),S.isLineSegments?He.setMode(Y.LINES):S.isLineLoop?He.setMode(Y.LINE_LOOP):He.setMode(Y.LINE_STRIP)}else S.isPoints?He.setMode(Y.POINTS):S.isSprite&&He.setMode(Y.TRIANGLES);if(S.isBatchedMesh)if(S._multiDrawInstances!==null)He.renderMultiDrawInstances(S._multiDrawStarts,S._multiDrawCounts,S._multiDrawCount,S._multiDrawInstances);else if(X.get("WEBGL_multi_draw"))He.renderMultiDraw(S._multiDrawStarts,S._multiDrawCounts,S._multiDrawCount);else{let Ue=S._multiDrawStarts,qe=S._multiDrawCounts,st=S._multiDrawCount,Be=Q?J.get(Q).bytesPerElement:1,Ne=ce.get(x).currentProgram.getUniforms();for(let Ct=0;Ct<st;Ct++)Ne.setValue(Y,"_gl_DrawID",Ct),He.render(Ue[Ct]/Be,qe[Ct])}else if(S.isInstancedMesh)He.renderInstances(ae,Le,S.count);else if(ne.isInstancedBufferGeometry){let Ue=ne._maxInstanceCount!==void 0?ne._maxInstanceCount:1/0,qe=Math.min(ne.instanceCount,Ue);He.renderInstances(ae,Le,qe)}else He.render(ae,Le)},this.compile=function(w,K,ne=null){ne===null&&(ne=w),g=Ee.get(ne),g.init(K),y.push(g),ne.traverseVisible((function(S){S.isLight&&S.layers.test(K.layers)&&(g.pushLight(S),S.castShadow&&g.pushShadow(S))})),w!==ne&&w.traverseVisible((function(S){S.isLight&&S.layers.test(K.layers)&&(g.pushLight(S),S.castShadow&&g.pushShadow(S))})),g.setupLights();let x=new Set;return w.traverse((function(S){if(!(S.isMesh||S.isPoints||S.isLine||S.isSprite))return;let B=S.material;if(B)if(Array.isArray(B))for(let ie=0;ie<B.length;ie++){let re=B[ie];Ti(re,ne,S),x.add(re)}else Ti(B,ne,S),x.add(B)})),y.pop(),g=null,x},this.compileAsync=function(w,K,ne=null){let x=this.compile(w,K,ne);return new Promise((S=>{function B(){x.forEach((function(ie){ce.get(ie).currentProgram.isReady()&&x.delete(ie)})),x.size!==0?setTimeout(B,10):S(w)}X.get("KHR_parallel_shader_compile")!==null?B():setTimeout(B,10)}))};let Sr=null;function ps(){_n.stop()}function ms(){_n.start()}let _n=new Zh;function wi(w,K,ne,x){if(w.visible===!1)return;if(w.layers.test(K.layers)){if(w.isGroup)ne=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(K);else if(w.isLight)g.pushLight(w),w.castShadow&&g.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||we.intersectsSprite(w)){x&&P.setFromMatrixPosition(w.matrixWorld).applyMatrix4(O);let B=_e.update(w),ie=w.material;ie.visible&&m.push(w,B,ie,ne,P.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||we.intersectsObject(w))){let B=_e.update(w),ie=w.material;if(x&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),P.copy(w.boundingSphere.center)):(B.boundingSphere===null&&B.computeBoundingSphere(),P.copy(B.boundingSphere.center)),P.applyMatrix4(w.matrixWorld).applyMatrix4(O)),Array.isArray(ie)){let re=B.groups;for(let Q=0,de=re.length;Q<de;Q++){let Me=re[Q],Te=ie[Me.materialIndex];Te&&Te.visible&&m.push(w,B,Te,ne,P.z,Me)}}else ie.visible&&m.push(w,B,ie,ne,P.z,null)}}let S=w.children;for(let B=0,ie=S.length;B<ie;B++)wi(S[B],K,ne,x)}function Ai(w,K,ne,x){let S=w.opaque,B=w.transmissive,ie=w.transparent;g.setupLightsView(ne),te===!0&&Ie.setGlobalState(M.clippingPlanes,ne),x&&W.viewport(Z.copy(x)),S.length>0&&Ri(S,K,ne),B.length>0&&Ri(B,K,ne),ie.length>0&&Ri(ie,K,ne),W.buffers.depth.setTest(!0),W.buffers.depth.setMask(!0),W.buffers.color.setMask(!0),W.setPolygonOffset(!1)}function fs(w,K,ne,x){if((ne.isScene===!0?ne.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[x.id]===void 0&&(g.state.transmissionRenderTarget[x.id]=new An(1,1,{generateMipmaps:!0,type:X.has("EXT_color_buffer_half_float")||X.has("EXT_color_buffer_float")?as:Wn,minFilter:Ji,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));let S=g.state.transmissionRenderTarget[x.id],B=x.viewport||Z;S.setSize(B.z,B.w);let ie=M.getRenderTarget();M.setRenderTarget(S),M.getClearColor(z),se=M.getClearAlpha(),se<1&&M.setClearColor(16777215,.5),M.clear(),T&&Re.render(ne);let re=M.toneMapping;M.toneMapping=0;let Q=x.viewport;if(x.viewport!==void 0&&(x.viewport=void 0),g.setupLightsView(x),te===!0&&Ie.setGlobalState(M.clippingPlanes,x),Ri(w,ne,x),b.updateMultisampleRenderTarget(S),b.updateRenderTargetMipmap(S),X.has("WEBGL_multisampled_render_to_texture")===!1){let de=!1;for(let Me=0,Te=K.length;Me<Te;Me++){let ae=K[Me],Oe=ae.object,Le=ae.geometry,Fe=ae.material,He=ae.group;if(Fe.side===2&&Oe.layers.test(x.layers)){let Ue=Fe.side;Fe.side=1,Fe.needsUpdate=!0,br(Oe,ne,x,Le,Fe,He),Fe.side=Ue,Fe.needsUpdate=!0,de=!0}}de===!0&&(b.updateMultisampleRenderTarget(S),b.updateRenderTargetMipmap(S))}M.setRenderTarget(ie),M.setClearColor(z,se),Q!==void 0&&(x.viewport=Q),M.toneMapping=re}function Ri(w,K,ne){let x=K.isScene===!0?K.overrideMaterial:null;for(let S=0,B=w.length;S<B;S++){let ie=w[S],re=ie.object,Q=ie.geometry,de=x===null?ie.material:x,Me=ie.group;re.layers.test(ne.layers)&&br(re,K,ne,Q,de,Me)}}function br(w,K,ne,x,S,B){w.onBeforeRender(M,K,ne,x,S,B),w.modelViewMatrix.multiplyMatrices(ne.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),S.onBeforeRender(M,K,ne,x,w,B),S.transparent===!0&&S.side===2&&S.forceSinglePass===!1?(S.side=1,S.needsUpdate=!0,M.renderBufferDirect(ne,K,x,S,w,B),S.side=0,S.needsUpdate=!0,M.renderBufferDirect(ne,K,x,S,w,B),S.side=2):M.renderBufferDirect(ne,K,x,S,w,B),w.onAfterRender(M,K,ne,x,S,B)}function Ci(w,K,ne){K.isScene!==!0&&(K=D);let x=ce.get(w),S=g.state.lights,B=g.state.shadowsArray,ie=S.state.version,re=ve.getParameters(w,S.state,B,K,ne),Q=ve.getProgramCacheKey(re),de=x.programs;x.environment=w.isMeshStandardMaterial?K.environment:null,x.fog=K.fog,x.envMap=(w.isMeshStandardMaterial?k:V).get(w.envMap||x.environment),x.envMapRotation=x.environment!==null&&w.envMap===null?K.environmentRotation:w.envMapRotation,de===void 0&&(w.addEventListener("dispose",Mr),de=new Map,x.programs=de);let Me=de.get(Q);if(Me!==void 0){if(x.currentProgram===Me&&x.lightsStateVersion===ie)return Er(w,re),Me}else re.uniforms=ve.getUniforms(w),w.onBeforeCompile(re,M),Me=ve.acquireProgram(re,Q),de.set(Q,Me),x.uniforms=re.uniforms;let Te=x.uniforms;return(w.isShaderMaterial||w.isRawShaderMaterial)&&w.clipping!==!0||(Te.clippingPlanes=Ie.uniform),Er(w,re),x.needsLights=(function(ae){return ae.isMeshLambertMaterial||ae.isMeshToonMaterial||ae.isMeshPhongMaterial||ae.isMeshStandardMaterial||ae.isShadowMaterial||ae.isShaderMaterial&&ae.lights===!0})(w),x.lightsStateVersion=ie,x.needsLights&&(Te.ambientLightColor.value=S.state.ambient,Te.lightProbe.value=S.state.probe,Te.directionalLights.value=S.state.directional,Te.directionalLightShadows.value=S.state.directionalShadow,Te.spotLights.value=S.state.spot,Te.spotLightShadows.value=S.state.spotShadow,Te.rectAreaLights.value=S.state.rectArea,Te.ltc_1.value=S.state.rectAreaLTC1,Te.ltc_2.value=S.state.rectAreaLTC2,Te.pointLights.value=S.state.point,Te.pointLightShadows.value=S.state.pointShadow,Te.hemisphereLights.value=S.state.hemi,Te.directionalShadowMap.value=S.state.directionalShadowMap,Te.directionalShadowMatrix.value=S.state.directionalShadowMatrix,Te.spotShadowMap.value=S.state.spotShadowMap,Te.spotLightMatrix.value=S.state.spotLightMatrix,Te.spotLightMap.value=S.state.spotLightMap,Te.pointShadowMap.value=S.state.pointShadowMap,Te.pointShadowMatrix.value=S.state.pointShadowMatrix),x.currentProgram=Me,x.uniformsList=null,Me}function gs(w){if(w.uniformsList===null){let K=w.currentProgram.getUniforms();w.uniformsList=Qi.seqWithValue(K.seq,w.uniforms)}return w.uniformsList}function Er(w,K){let ne=ce.get(w);ne.outputColorSpace=K.outputColorSpace,ne.batching=K.batching,ne.batchingColor=K.batchingColor,ne.instancing=K.instancing,ne.instancingColor=K.instancingColor,ne.instancingMorph=K.instancingMorph,ne.skinning=K.skinning,ne.morphTargets=K.morphTargets,ne.morphNormals=K.morphNormals,ne.morphColors=K.morphColors,ne.morphTargetsCount=K.morphTargetsCount,ne.numClippingPlanes=K.numClippingPlanes,ne.numIntersection=K.numClipIntersection,ne.vertexAlphas=K.vertexAlphas,ne.vertexTangents=K.vertexTangents,ne.toneMapping=K.toneMapping}_n.setAnimationLoop((function(w){Sr&&Sr(w)})),typeof self<"u"&&_n.setContext(self),this.setAnimationLoop=function(w){Sr=w,it.setAnimationLoop(w),w===null?_n.stop():_n.start()},it.addEventListener("sessionstart",ps),it.addEventListener("sessionend",ms),this.render=function(w,K){if(K!==void 0&&K.isCamera!==!0)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(I===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),K.parent===null&&K.matrixWorldAutoUpdate===!0&&K.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(it.cameraAutoUpdate===!0&&it.updateCamera(K),K=it.getCamera()),w.isScene===!0&&w.onBeforeRender(M,w,K,F),g=Ee.get(w,y.length),g.init(K),y.push(g),O.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),we.setFromProjectionMatrix(O),E=this.localClippingEnabled,te=Ie.init(this.clippingPlanes,E),m=Se.get(w,v.length),m.init(),v.push(m),it.enabled===!0&&it.isPresenting===!0){let B=M.xr.getDepthSensingMesh();B!==null&&wi(B,K,-1/0,M.sortObjects)}wi(w,K,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(Ae,Ce),T=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,T&&Re.addToRenderList(m,w),this.info.render.frame++,te===!0&&Ie.beginShadows();let ne=g.state.shadowsArray;ye.render(ne,w,K),te===!0&&Ie.endShadows(),this.info.autoReset===!0&&this.info.reset();let x=m.opaque,S=m.transmissive;if(g.setupLights(),K.isArrayCamera){let B=K.cameras;if(S.length>0)for(let ie=0,re=B.length;ie<re;ie++)fs(x,S,w,B[ie]);T&&Re.render(w);for(let ie=0,re=B.length;ie<re;ie++){let Q=B[ie];Ai(m,w,Q,Q.viewport)}}else S.length>0&&fs(x,S,w,K),T&&Re.render(w),Ai(m,w,K);F!==null&&(b.updateMultisampleRenderTarget(F),b.updateRenderTargetMipmap(F)),w.isScene===!0&&w.onAfterRender(M,w,K),ot.resetDefaultState(),G=-1,q=null,y.pop(),y.length>0?(g=y[y.length-1],te===!0&&Ie.setGlobalState(M.clippingPlanes,g.state.camera)):g=null,v.pop(),m=v.length>0?v[v.length-1]:null},this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return F},this.setRenderTargetTextures=function(w,K,ne){ce.get(w.texture).__webglTexture=K,ce.get(w.depthTexture).__webglTexture=ne;let x=ce.get(w);x.__hasExternalTextures=!0,x.__autoAllocateDepthBuffer=ne===void 0,x.__autoAllocateDepthBuffer||X.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),x.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,K){let ne=ce.get(w);ne.__webglFramebuffer=K,ne.__useDefaultFramebuffer=K===void 0},this.setRenderTarget=function(w,K=0,ne=0){F=w,C=K,L=ne;let x=!0,S=null,B=!1,ie=!1;if(w){let re=ce.get(w);if(re.__useDefaultFramebuffer!==void 0)W.bindFramebuffer(Y.FRAMEBUFFER,null),x=!1;else if(re.__webglFramebuffer===void 0)b.setupRenderTarget(w);else if(re.__hasExternalTextures)b.rebindTextures(w,ce.get(w.texture).__webglTexture,ce.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let Me=w.depthTexture;if(re.__boundDepthTexture!==Me){if(Me!==null&&ce.has(Me)&&(w.width!==Me.image.width||w.height!==Me.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");b.setupDepthRenderbuffer(w)}}let Q=w.texture;(Q.isData3DTexture||Q.isDataArrayTexture||Q.isCompressedArrayTexture)&&(ie=!0);let de=ce.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(S=Array.isArray(de[K])?de[K][ne]:de[K],B=!0):S=w.samples>0&&b.useMultisampledRTT(w)===!1?ce.get(w).__webglMultisampledFramebuffer:Array.isArray(de)?de[ne]:de,Z.copy(w.viewport),j.copy(w.scissor),H=w.scissorTest}else Z.copy(ue).multiplyScalar(me).floor(),j.copy(le).multiplyScalar(me).floor(),H=xe;if(W.bindFramebuffer(Y.FRAMEBUFFER,S)&&x&&W.drawBuffers(w,S),W.viewport(Z),W.scissor(j),W.setScissorTest(H),B){let re=ce.get(w.texture);Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_CUBE_MAP_POSITIVE_X+K,re.__webglTexture,ne)}else if(ie){let re=ce.get(w.texture),Q=K||0;Y.framebufferTextureLayer(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,re.__webglTexture,ne||0,Q)}G=-1},this.readRenderTargetPixels=function(w,K,ne,x,S,B,ie){if(!w||!w.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let re=ce.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ie!==void 0&&(re=re[ie]),re){W.bindFramebuffer(Y.FRAMEBUFFER,re);try{let Q=w.texture,de=Q.format,Me=Q.type;if(!he.textureFormatReadable(de))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!he.textureTypeReadable(Me))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");K>=0&&K<=w.width-x&&ne>=0&&ne<=w.height-S&&Y.readPixels(K,ne,x,S,mt.convert(de),mt.convert(Me),B)}finally{let Q=F!==null?ce.get(F).__webglFramebuffer:null;W.bindFramebuffer(Y.FRAMEBUFFER,Q)}}},this.readRenderTargetPixelsAsync=async function(w,K,ne,x,S,B,ie){if(!w||!w.isWebGLRenderTarget)throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let re=ce.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ie!==void 0&&(re=re[ie]),re){let Q=w.texture,de=Q.format,Me=Q.type;if(!he.textureFormatReadable(de))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!he.textureTypeReadable(Me))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(K>=0&&K<=w.width-x&&ne>=0&&ne<=w.height-S){W.bindFramebuffer(Y.FRAMEBUFFER,re);let Te=Y.createBuffer();Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Te),Y.bufferData(Y.PIXEL_PACK_BUFFER,B.byteLength,Y.STREAM_READ),Y.readPixels(K,ne,x,S,mt.convert(de),mt.convert(Me),0);let ae=F!==null?ce.get(F).__webglFramebuffer:null;W.bindFramebuffer(Y.FRAMEBUFFER,ae);let Oe=Y.fenceSync(Y.SYNC_GPU_COMMANDS_COMPLETE,0);return Y.flush(),await(function(Le,Fe,He){return new Promise((function(Ue,qe){setTimeout((function st(){switch(Le.clientWaitSync(Fe,Le.SYNC_FLUSH_COMMANDS_BIT,0)){case Le.WAIT_FAILED:qe();break;case Le.TIMEOUT_EXPIRED:setTimeout(st,He);break;default:Ue()}}),He)}))})(Y,Oe,4),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Te),Y.getBufferSubData(Y.PIXEL_PACK_BUFFER,0,B),Y.deleteBuffer(Te),Y.deleteSync(Oe),B}throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,K=null,ne=0){w.isTexture!==!0&&(Fr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),K=arguments[0]||null,w=arguments[1]);let x=Math.pow(2,-ne),S=Math.floor(w.image.width*x),B=Math.floor(w.image.height*x),ie=K!==null?K.x:0,re=K!==null?K.y:0;b.setTexture2D(w,0),Y.copyTexSubImage2D(Y.TEXTURE_2D,ne,0,0,ie,re,S,B),W.unbindTexture()},this.copyTextureToTexture=function(w,K,ne=null,x=null,S=0){let B,ie,re,Q,de,Me,Te,ae,Oe;w.isTexture!==!0&&(Fr("WebGLRenderer: copyTextureToTexture function signature has changed."),x=arguments[0]||null,w=arguments[1],K=arguments[2],S=arguments[3]||0,ne=null);let Le=w.isCompressedTexture?w.mipmaps[S]:w.image;ne!==null?(B=ne.max.x-ne.min.x,ie=ne.max.y-ne.min.y,re=ne.isBox3?ne.max.z-ne.min.z:1,Q=ne.min.x,de=ne.min.y,Me=ne.isBox3?ne.min.z:0):(B=Le.width,ie=Le.height,re=Le.depth||1,Q=0,de=0,Me=0),x!==null?(Te=x.x,ae=x.y,Oe=x.z):(Te=0,ae=0,Oe=0);let Fe=mt.convert(K.format),He=mt.convert(K.type),Ue;K.isData3DTexture?(b.setTexture3D(K,0),Ue=Y.TEXTURE_3D):K.isDataArrayTexture||K.isCompressedArrayTexture?(b.setTexture2DArray(K,0),Ue=Y.TEXTURE_2D_ARRAY):(b.setTexture2D(K,0),Ue=Y.TEXTURE_2D),Y.pixelStorei(Y.UNPACK_FLIP_Y_WEBGL,K.flipY),Y.pixelStorei(Y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),Y.pixelStorei(Y.UNPACK_ALIGNMENT,K.unpackAlignment);let qe=Y.getParameter(Y.UNPACK_ROW_LENGTH),st=Y.getParameter(Y.UNPACK_IMAGE_HEIGHT),Be=Y.getParameter(Y.UNPACK_SKIP_PIXELS),Ne=Y.getParameter(Y.UNPACK_SKIP_ROWS),Ct=Y.getParameter(Y.UNPACK_SKIP_IMAGES);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,Le.width),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,Le.height),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,Q),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,de),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,Me);let an=w.isDataArrayTexture||w.isData3DTexture,at=K.isDataArrayTexture||K.isData3DTexture;if(w.isRenderTargetTexture||w.isDepthTexture){let Yt=ce.get(w),Qn=ce.get(K),Ln=ce.get(Yt.__renderTarget),Un=ce.get(Qn.__renderTarget);W.bindFramebuffer(Y.READ_FRAMEBUFFER,Ln.__webglFramebuffer),W.bindFramebuffer(Y.DRAW_FRAMEBUFFER,Un.__webglFramebuffer);for(let xt=0;xt<re;xt++)an&&Y.framebufferTextureLayer(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,ce.get(w).__webglTexture,S,Me+xt),w.isDepthTexture?(at&&Y.framebufferTextureLayer(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,ce.get(K).__webglTexture,S,Oe+xt),Y.blitFramebuffer(Q,de,B,ie,Te,ae,B,ie,Y.DEPTH_BUFFER_BIT,Y.NEAREST)):at?Y.copyTexSubImage3D(Ue,S,Te,ae,Oe+xt,Q,de,B,ie):Y.copyTexSubImage2D(Ue,S,Te,ae,Oe+xt,Q,de,B,ie);W.bindFramebuffer(Y.READ_FRAMEBUFFER,null),W.bindFramebuffer(Y.DRAW_FRAMEBUFFER,null)}else at?w.isDataTexture||w.isData3DTexture?Y.texSubImage3D(Ue,S,Te,ae,Oe,B,ie,re,Fe,He,Le.data):K.isCompressedArrayTexture?Y.compressedTexSubImage3D(Ue,S,Te,ae,Oe,B,ie,re,Fe,Le.data):Y.texSubImage3D(Ue,S,Te,ae,Oe,B,ie,re,Fe,He,Le):w.isDataTexture?Y.texSubImage2D(Y.TEXTURE_2D,S,Te,ae,B,ie,Fe,He,Le.data):w.isCompressedTexture?Y.compressedTexSubImage2D(Y.TEXTURE_2D,S,Te,ae,Le.width,Le.height,Fe,Le.data):Y.texSubImage2D(Y.TEXTURE_2D,S,Te,ae,B,ie,Fe,He,Le);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,qe),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,st),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,Be),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,Ne),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,Ct),S===0&&K.generateMipmaps&&Y.generateMipmap(Ue),W.unbindTexture()},this.copyTextureToTexture3D=function(w,K,ne=null,x=null,S=0){return w.isTexture!==!0&&(Fr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ne=arguments[0]||null,x=arguments[1]||null,w=arguments[2],K=arguments[3],S=arguments[4]||0),Fr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(w,K,ne,x,S)},this.initRenderTarget=function(w){ce.get(w).__webglFramebuffer===void 0&&b.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?b.setTextureCube(w,0):w.isData3DTexture?b.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?b.setTexture2DArray(w,0):b.setTexture2D(w,0),W.unbindTexture()},this.resetState=function(){C=0,L=0,F=null,W.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return rr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}},xa=class r{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ze(e),this.density=t}clone(){return new r(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Ma=class extends yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new dn,this.environmentIntensity=1,this.environmentRotation=new dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Em=new R;var Tm=new R,wm=new R,Am=new R,Rm=new fe,Cm=new fe,Pm=new je,Im=new R,Lm=new R,Um=new R,Dm=new fe,Nm=new fe,Om=new fe;var Fm=new R,Bm=new R;var zm=new R,km=new Ze,Hm=new Ze,Gm=new R,Vm=new je,Wm=new R,Xm=new tn,jm=new je,qm=new jn;var Pl=class extends Lt{constructor(e=null,t=1,n=1,i,s,a,o,l,c=1003,h=1003,u,d){super(null,a,o,l,c,h,i,s,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ym=new je,Zm=new je;var Sa=class extends ht{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Zi=new je,gh=new je,Vs=[],vh=new Ft,Kp=new je,Ur=new Et,Dr=new tn,lr=class extends Et{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Sa(new Float32Array(16*n),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Kp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ft),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Zi),vh.copy(e.boundingBox).applyMatrix4(Zi),this.boundingBox.union(vh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new tn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Zi),Dr.copy(e.boundingSphere).applyMatrix4(Zi),this.boundingSphere.union(Dr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,3*e)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,16*e)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=e*(n.length+1)+1;for(let a=0;a<n.length;a++)n[a]=i[s+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Ur.geometry=this.geometry,Ur.material=this.material,Ur.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Dr.copy(this.boundingSphere),Dr.applyMatrix4(n),e.ray.intersectsSphere(Dr)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Zi),gh.multiplyMatrices(n,Zi),Ur.matrixWorld=gh,Ur.raycast(e,Vs);for(let a=0,o=Vs.length;a<o;a++){let l=Vs[a];l.instanceId=s,l.object=this,t.push(l)}Vs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Sa(new Float32Array(3*this.instanceMatrix.count).fill(1),3)),t.toArray(this.instanceColor.array,3*e)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,16*e)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Pl(new Float32Array(i*this.count),i,this.count,oc,cn));let s=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Il=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,i){let s=this.pool,a=this.list;this.index>=s.length&&s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];a.push(o),this.index++,o.start=e,o.count=t,o.z=n,o.index=i}reset(){this.list.length=0,this.index=0}},Jm=new je,Km=new ze(1,1,1),$m=new or,Qm=new Ft,ef=new tn,tf=new R,nf=new R,rf=new R,sf=new Il,af=new Et;var cr=class extends Rn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new ze(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ba=new R,Ea=new R,_h=new je,Nr=new jn,Ws=new tn,Ro=new R,yh=new R,qr=class extends yt{constructor(e=new Je,t=new cr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)ba.fromBufferAttribute(t,i-1),Ea.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=ba.distanceTo(Ea);e.setAttribute("lineDistance",new De(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ws.copy(n.boundingSphere),Ws.applyMatrix4(i),Ws.radius+=s,e.ray.intersectsSphere(Ws)===!1)return;_h.copy(i).invert(),Nr.copy(e.ray).applyMatrix4(_h);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let d=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let f=d,_=p-1;f<_;f+=c){let m=h.getX(f),g=h.getX(f+1),v=Xs(this,e,Nr,l,m,g);v&&t.push(v)}if(this.isLineLoop){let f=h.getX(p-1),_=h.getX(d),m=Xs(this,e,Nr,l,f,_);m&&t.push(m)}}else{let d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let f=d,_=p-1;f<_;f+=c){let m=Xs(this,e,Nr,l,f,f+1);m&&t.push(m)}if(this.isLineLoop){let f=Xs(this,e,Nr,l,p-1,d);f&&t.push(f)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}};function Xs(r,e,t,n,i,s){let a=r.geometry.attributes.position;if(ba.fromBufferAttribute(a,i),Ea.fromBufferAttribute(a,s),t.distanceSqToSegment(ba,Ea,Ro,yh)>n)return;Ro.applyMatrix4(r.matrixWorld);let o=e.ray.origin.distanceTo(Ro);return o<e.near||o>e.far?void 0:{distance:o,point:yh.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}var xh=new R,Mh=new R,Ta=class extends qr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)xh.fromBufferAttribute(t,i),Mh.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+xh.distanceTo(Mh);e.setAttribute("lineDistance",new De(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var hr=class extends Rn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ze(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Sh=new je,Ll=new jn,js=new tn,qs=new R,Yr=class extends yt{constructor(e=new Je,t=new hr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),js.copy(n.boundingSphere),js.applyMatrix4(i),js.radius+=s,e.ray.intersectsSphere(js)===!1)return;Sh.copy(i).invert(),Ll.copy(e.ray).applyMatrix4(Sh);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null)for(let u=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);u<d;u++){let p=c.getX(u);qs.fromBufferAttribute(h,p),bh(qs,p,l,i,e,t,this)}else for(let u=Math.max(0,a.start),d=Math.min(h.count,a.start+a.count);u<d;u++)qs.fromBufferAttribute(h,u),bh(qs,u,l,i,e,t,this)}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}};function bh(r,e,t,n,i,s,a){let o=Ll.distanceSqToPoint(r);if(o<t){let l=new R;Ll.closestPointToPoint(r,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Zr=class extends Lt{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Wt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),i=0,s=n.length,a;a=t||e*n[s-1];let o,l=0,c=s-1;for(;l<=c;)if(i=Math.floor(l+(c-l)/2),o=n[i]-a,o<0)l=i+1;else{if(!(o>0)){c=i;break}c=i-1}if(i=c,n[i]===a)return i/(s-1);let h=n[i];return(i+(a-h)/(n[i+1]-h))/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);let a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new fe:new R);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new R,i=[],s=[],a=[],o=new R,l=new je;for(let p=0;p<=e;p++){let f=p/e;i[p]=this.getTangentAt(f,new R)}s[0]=new R,a[0]=new R;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(i[p-1],i[p]),o.length()>Number.EPSILON){o.normalize();let f=Math.acos(_t(i[p-1].dot(i[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(o,f))}a[p].crossVectors(i[p],s[p])}if(t===!0){let p=Math.acos(_t(s[0].dot(s[e]),-1,1));p/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(p=-p);for(let f=1;f<=e;f++)s[f].applyMatrix4(l.makeRotationAxis(i[f],p*f)),a[f].crossVectors(i[f],s[f])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},mi=class extends Wt{constructor(e=0,t=0,n=1,i=1,s=0,a=2*Math.PI,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new fe){let n=t,i=2*Math.PI,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(s=a?0:i),this.aClockwise!==!0||a||(s===i?s=-i:s-=i);let o=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ul=class extends mi{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function dc(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,u){let d=(a-s)/c-(o-s)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,p*=h,i(a,o,d,p)},calc:function(s){let a=s*s;return r+e*s+t*a+n*(a*s)}}}var Ys=new R,Co=new dc,Po=new dc,Io=new dc,Jr=class extends Wt{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new R){let n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e,o,l,c=Math.floor(a),h=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/s)+1)*s:h===0&&c===s-1&&(c=s-2,h=1),this.closed||c>0?o=i[(c-1)%s]:(Ys.subVectors(i[0],i[1]).add(i[0]),o=Ys);let u=i[c%s],d=i[(c+1)%s];if(this.closed||c+2<s?l=i[(c+2)%s]:(Ys.subVectors(i[s-1],i[s-2]).add(i[s-1]),l=Ys),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,f=Math.pow(o.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(l),p);_<1e-4&&(_=1),f<1e-4&&(f=_),m<1e-4&&(m=_),Co.initNonuniformCatmullRom(o.x,u.x,d.x,l.x,f,_,m),Po.initNonuniformCatmullRom(o.y,u.y,d.y,l.y,f,_,m),Io.initNonuniformCatmullRom(o.z,u.z,d.z,l.z,f,_,m)}else this.curveType==="catmullrom"&&(Co.initCatmullRom(o.x,u.x,d.x,l.x,this.tension),Po.initCatmullRom(o.y,u.y,d.y,l.y,this.tension),Io.initCatmullRom(o.z,u.z,d.z,l.z,this.tension));return n.set(Co.calc(h),Po.calc(h),Io.calc(h)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new R().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Eh(r,e,t,n,i){let s=.5*(n-e),a=.5*(i-t),o=r*r;return(2*t-2*n+s+a)*(r*o)+(-3*t+3*n-2*s-a)*o+s*r+t}function zr(r,e,t,n){return(function(i,s){let a=1-i;return a*a*s})(r,e)+(function(i,s){return 2*(1-i)*i*s})(r,t)+(function(i,s){return i*i*s})(r,n)}function kr(r,e,t,n,i){return(function(s,a){let o=1-s;return o*o*o*a})(r,e)+(function(s,a){let o=1-s;return 3*o*o*s*a})(r,t)+(function(s,a){return 3*(1-s)*s*s*a})(r,n)+(function(s,a){return s*s*s*a})(r,i)}var wa=class extends Wt{constructor(e=new fe,t=new fe,n=new fe,i=new fe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new fe){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(kr(e,i.x,s.x,a.x,o.x),kr(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Dl=class extends Wt{constructor(e=new R,t=new R,n=new R,i=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new R){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(kr(e,i.x,s.x,a.x,o.x),kr(e,i.y,s.y,a.y,o.y),kr(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Aa=class extends Wt{constructor(e=new fe,t=new fe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new fe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new fe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Nl=class extends Wt{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ra=class extends Wt{constructor(e=new fe,t=new fe,n=new fe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new fe){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(zr(e,i.x,s.x,a.x),zr(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ca=class extends Wt{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(zr(e,i.x,s.x,a.x),zr(e,i.y,s.y,a.y),zr(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Pa=class extends Wt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new fe){let n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Eh(o,l.x,c.x,h.x,u.x),Eh(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new fe().fromArray(i))}return this}},Ia=Object.freeze({__proto__:null,ArcCurve:Ul,CatmullRomCurve3:Jr,CubicBezierCurve:wa,CubicBezierCurve3:Dl,EllipseCurve:mi,LineCurve:Aa,LineCurve3:Nl,QuadraticBezierCurve:Ra,QuadraticBezierCurve3:Ca,SplineCurve:Pa}),Ol=class extends Wt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ia[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),s=0;for(;s<i.length;){if(i[s]>=n){let a=i[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,s=this.curves;i<s.length;i++){let a=s[i],o=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Ia[i.type]().fromJSON(i))}return this}},Kr=class extends Ol{constructor(e){super(),this.type="Path",this.currentPoint=new fe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Aa(this.currentPoint.clone(),new fe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let s=new Ra(this.currentPoint.clone(),new fe(e,t),new fe(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,a){let o=new wa(this.currentPoint.clone(),new fe(e,t),new fe(n,i),new fe(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Pa(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,s,a),this}absarc(e,t,n,i,s,a){return this.absellipse(e,t,n,n,i,s,a),this}ellipse(e,t,n,i,s,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,s,a,o,l),this}absellipse(e,t,n,i,s,a,o,l){let c=new mi(e,t,n,i,s,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},fi=class r extends Je{constructor(e=[new fe(0,-.5),new fe(.5,0),new fe(0,.5)],t=12,n=0,i=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=_t(i,0,2*Math.PI);let s=[],a=[],o=[],l=[],c=[],h=1/t,u=new R,d=new fe,p=new R,f=new R,_=new R,m=0,g=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,g=e[v+1].y-e[v].y,p.x=1*g,p.y=-m,p.z=0*g,_.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[v+1].x-e[v].x,g=e[v+1].y-e[v].y,p.x=1*g,p.y=-m,p.z=0*g,f.copy(p),p.x+=_.x,p.y+=_.y,p.z+=_.z,p.normalize(),l.push(p.x,p.y,p.z),_.copy(f)}for(let v=0;v<=t;v++){let y=n+v*h*i,M=Math.sin(y),I=Math.cos(y);for(let C=0;C<=e.length-1;C++){u.x=e[C].x*M,u.y=e[C].y,u.z=e[C].x*I,a.push(u.x,u.y,u.z),d.x=v/t,d.y=C/(e.length-1),o.push(d.x,d.y);let L=l[3*C+0]*M,F=l[3*C+1],G=l[3*C+0]*I;c.push(L,F,G)}}for(let v=0;v<t;v++)for(let y=0;y<e.length-1;y++){let M=y+v*e.length,I=M,C=M+e.length,L=M+e.length+1,F=M+1;s.push(I,C,F),s.push(L,F,C)}this.setIndex(s),this.setAttribute("position",new De(a,3)),this.setAttribute("uv",new De(o,2)),this.setAttribute("normal",new De(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.points,e.segments,e.phiStart,e.phiLength)}},Fl=class r extends fi{constructor(e=1,t=1,n=4,i=8){let s=new Kr;s.absarc(0,-t/2,e,1.5*Math.PI,0),s.absarc(0,t/2,e,0,.5*Math.PI),super(s.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:i}}static fromJSON(e){return new r(e.radius,e.length,e.capSegments,e.radialSegments)}},qn=class r extends Je{constructor(e=1,t=32,n=0,i=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let s=[],a=[],o=[],l=[],c=new R,h=new fe;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let p=n+u/t*i;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new De(a,3)),this.setAttribute("normal",new De(o,3)),this.setAttribute("uv",new De(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},At=class r extends Je{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),s=Math.floor(s);let h=[],u=[],d=[],p=[],f=0,_=[],m=n/2,g=0;function v(y){let M=f,I=new fe,C=new R,L=0,F=y===!0?e:t,G=y===!0?1:-1;for(let Z=1;Z<=i;Z++)u.push(0,m*G,0),d.push(0,G,0),p.push(.5,.5),f++;let q=f;for(let Z=0;Z<=i;Z++){let j=Z/i*l+o,H=Math.cos(j),z=Math.sin(j);C.x=F*z,C.y=m*G,C.z=F*H,u.push(C.x,C.y,C.z),d.push(0,G,0),I.x=.5*H+.5,I.y=.5*z*G+.5,p.push(I.x,I.y),f++}for(let Z=0;Z<i;Z++){let j=M+Z,H=q+Z;y===!0?h.push(H,H+1,j):h.push(H+1,H,j),L+=3}c.addGroup(g,L,y===!0?1:2),g+=L}(function(){let y=new R,M=new R,I=0,C=(t-e)/n;for(let L=0;L<=s;L++){let F=[],G=L/s,q=G*(t-e)+e;for(let Z=0;Z<=i;Z++){let j=Z/i,H=j*l+o,z=Math.sin(H),se=Math.cos(H);M.x=q*z,M.y=-G*n+m,M.z=q*se,u.push(M.x,M.y,M.z),y.set(z,C,se).normalize(),d.push(y.x,y.y,y.z),p.push(j,1-G),F.push(f++)}_.push(F)}for(let L=0;L<i;L++)for(let F=0;F<s;F++){let G=_[F][L],q=_[F+1][L],Z=_[F+1][L+1],j=_[F][L+1];(e>0||F!==0)&&(h.push(G,q,j),I+=3),(t>0||F!==s-1)&&(h.push(q,Z,j),I+=3)}c.addGroup(g,I,0),g+=I})(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new De(u,3)),this.setAttribute("normal",new De(d,3)),this.setAttribute("uv",new De(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},gi=class r extends At{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,o=2*Math.PI){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},vi=class r extends Je{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let s=[],a=[];function o(d,p,f,_){let m=_+1,g=[];for(let v=0;v<=m;v++){g[v]=[];let y=d.clone().lerp(f,v/m),M=p.clone().lerp(f,v/m),I=m-v;for(let C=0;C<=I;C++)g[v][C]=C===0&&v===m?y:y.clone().lerp(M,C/I)}for(let v=0;v<m;v++)for(let y=0;y<2*(m-v)-1;y++){let M=Math.floor(y/2);y%2==0?(l(g[v][M+1]),l(g[v+1][M]),l(g[v][M])):(l(g[v][M+1]),l(g[v+1][M+1]),l(g[v+1][M]))}}function l(d){s.push(d.x,d.y,d.z)}function c(d,p){let f=3*d;p.x=e[f+0],p.y=e[f+1],p.z=e[f+2]}function h(d,p,f,_){_<0&&d.x===1&&(a[p]=d.x-1),f.x===0&&f.z===0&&(a[p]=_/2/Math.PI+.5)}function u(d){return Math.atan2(d.z,-d.x)}(function(d){let p=new R,f=new R,_=new R;for(let m=0;m<t.length;m+=3)c(t[m+0],p),c(t[m+1],f),c(t[m+2],_),o(p,f,_,d)})(i),(function(d){let p=new R;for(let f=0;f<s.length;f+=3)p.x=s[f+0],p.y=s[f+1],p.z=s[f+2],p.normalize().multiplyScalar(d),s[f+0]=p.x,s[f+1]=p.y,s[f+2]=p.z})(n),(function(){let d=new R;for(let f=0;f<s.length;f+=3){d.x=s[f+0],d.y=s[f+1],d.z=s[f+2];let _=u(d)/2/Math.PI+.5,m=(p=d,Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))/Math.PI+.5);a.push(_,1-m)}var p;(function(){let f=new R,_=new R,m=new R,g=new R,v=new fe,y=new fe,M=new fe;for(let I=0,C=0;I<s.length;I+=9,C+=6){f.set(s[I+0],s[I+1],s[I+2]),_.set(s[I+3],s[I+4],s[I+5]),m.set(s[I+6],s[I+7],s[I+8]),v.set(a[C+0],a[C+1]),y.set(a[C+2],a[C+3]),M.set(a[C+4],a[C+5]),g.copy(f).add(_).add(m).divideScalar(3);let L=u(g);h(v,C+0,f,L),h(y,C+2,_,L),h(M,C+4,m,L)}})(),(function(){for(let f=0;f<a.length;f+=6){let _=a[f+0],m=a[f+2],g=a[f+4],v=Math.max(_,m,g),y=Math.min(_,m,g);v>.9&&y<.1&&(_<.2&&(a[f+0]+=1),m<.2&&(a[f+2]+=1),g<.2&&(a[f+4]+=1))}})()})(),this.setAttribute("position",new De(s,3)),this.setAttribute("normal",new De(s.slice(),3)),this.setAttribute("uv",new De(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.details)}},Bl=class r extends vi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Zs=new R,Js=new R,Lo=new R,Ks=new Gn,zl=class extends Je{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let i=Math.pow(10,4),s=Math.cos(aa*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),d={},p=[];for(let f=0;f<l;f+=3){a?(c[0]=a.getX(f),c[1]=a.getX(f+1),c[2]=a.getX(f+2)):(c[0]=f,c[1]=f+1,c[2]=f+2);let{a:_,b:m,c:g}=Ks;if(_.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),g.fromBufferAttribute(o,c[2]),Ks.getNormal(Lo),u[0]=`${Math.round(_.x*i)},${Math.round(_.y*i)},${Math.round(_.z*i)}`,u[1]=`${Math.round(m.x*i)},${Math.round(m.y*i)},${Math.round(m.z*i)}`,u[2]=`${Math.round(g.x*i)},${Math.round(g.y*i)},${Math.round(g.z*i)}`,u[0]!==u[1]&&u[1]!==u[2]&&u[2]!==u[0])for(let v=0;v<3;v++){let y=(v+1)%3,M=u[v],I=u[y],C=Ks[h[v]],L=Ks[h[y]],F=`${M}_${I}`,G=`${I}_${M}`;G in d&&d[G]?(Lo.dot(d[G].normal)<=s&&(p.push(C.x,C.y,C.z),p.push(L.x,L.y,L.z)),d[G]=null):F in d||(d[F]={index0:c[v],index1:c[y],normal:Lo.clone()})}}for(let f in d)if(d[f]){let{index0:_,index1:m}=d[f];Zs.fromBufferAttribute(o,_),Js.fromBufferAttribute(o,m),p.push(Zs.x,Zs.y,Zs.z),p.push(Js.x,Js.y,Js.z)}this.setAttribute("position",new De(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},fn=class extends Kr{constructor(e){super(e),this.uuid=fr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Kr().fromJSON(i))}return this}},$p=function(r,e,t=2){let n=e&&e.length,i=n?e[0]*t:r.length,s=Th(r,0,i,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,l,c,h,u,d,p;if(n&&(s=(function(f,_,m,g){let v=[],y,M,I,C,L;for(y=0,M=_.length;y<M;y++)I=_[y]*g,C=y<M-1?_[y+1]*g:f.length,L=Th(f,I,C,g,!1),L===L.next&&(L.steiner=!0),v.push(am(L));for(v.sort(im),y=0;y<v.length;y++)m=rm(v[y],m);return m})(r,e,s,t)),r.length>80*t){o=c=r[0],l=h=r[1];for(let f=t;f<i;f+=t)u=r[f],d=r[f+1],u<o&&(o=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-o,h-l),p=p!==0?32767/p:0}return $r(s,a,t,o,l,p,0),a};function Th(r,e,t,n,i){let s,a;if(i===(function(o,l,c,h){let u=0;for(let d=l,p=c-h;d<c;d+=h)u+=(o[p]-o[d])*(o[d+1]+o[p+1]),p=d;return u})(r,e,t,n)>0)for(s=e;s<t;s+=n)a=wh(s,r[s],r[s+1],a);else for(s=t-n;s>=e;s-=n)a=wh(s,r[s],r[s+1],a);return a&&ka(a,a.next)&&(es(a),a=a.next),a}function _i(r,e){if(!r)return r;e||(e=r);let t,n=r;do if(t=!1,n.steiner||!ka(n,n.next)&&rt(n.prev,n,n.next)!==0)n=n.next;else{if(es(n),n=e=n.prev,n===n.next)break;t=!0}while(t||n!==e);return e}function $r(r,e,t,n,i,s,a){if(!r)return;!a&&s&&(function(h,u,d,p){let f=h;do f.z===0&&(f.z=kl(f.x,f.y,u,d,p)),f.prevZ=f.prev,f.nextZ=f.next,f=f.next;while(f!==h);f.prevZ.nextZ=null,f.prevZ=null,(function(_){let m,g,v,y,M,I,C,L,F=1;do{for(g=_,_=null,M=null,I=0;g;){for(I++,v=g,C=0,m=0;m<F&&(C++,v=v.nextZ,v);m++);for(L=F;C>0||L>0&&v;)C!==0&&(L===0||!v||g.z<=v.z)?(y=g,g=g.nextZ,C--):(y=v,v=v.nextZ,L--),M?M.nextZ=y:_=y,y.prevZ=M,M=y;g=v}M.nextZ=null,F*=2}while(I>1)})(f)})(r,n,i,s);let o,l,c=r;for(;r.prev!==r.next;)if(o=r.prev,l=r.next,s?em(r,n,i,s):Qp(r))e.push(o.i/t|0),e.push(r.i/t|0),e.push(l.i/t|0),es(r),r=l.next,c=l.next;else if((r=l)===c){a?a===1?$r(r=tm(_i(r),e,t),e,t,n,i,s,2):a===2&&nm(r,e,t,n,i,s):$r(_i(r),e,t,n,i,s,1);break}}function Qp(r){let e=r.prev,t=r,n=r.next;if(rt(e,t,n)>=0)return!1;let i=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=i<s?i<a?i:a:s<a?s:a,u=o<l?o<c?o:c:l<c?l:c,d=i>s?i>a?i:a:s>a?s:a,p=o>l?o>c?o:c:l>c?l:c,f=n.next;for(;f!==e;){if(f.x>=h&&f.x<=d&&f.y>=u&&f.y<=p&&Ki(i,o,s,l,a,c,f.x,f.y)&&rt(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function em(r,e,t,n){let i=r.prev,s=r,a=r.next;if(rt(i,s,a)>=0)return!1;let o=i.x,l=s.x,c=a.x,h=i.y,u=s.y,d=a.y,p=o<l?o<c?o:c:l<c?l:c,f=h<u?h<d?h:d:u<d?u:d,_=o>l?o>c?o:c:l>c?l:c,m=h>u?h>d?h:d:u>d?u:d,g=kl(p,f,e,t,n),v=kl(_,m,e,t,n),y=r.prevZ,M=r.nextZ;for(;y&&y.z>=g&&M&&M.z<=v;){if(y.x>=p&&y.x<=_&&y.y>=f&&y.y<=m&&y!==i&&y!==a&&Ki(o,h,l,u,c,d,y.x,y.y)&&rt(y.prev,y,y.next)>=0||(y=y.prevZ,M.x>=p&&M.x<=_&&M.y>=f&&M.y<=m&&M!==i&&M!==a&&Ki(o,h,l,u,c,d,M.x,M.y)&&rt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;y&&y.z>=g;){if(y.x>=p&&y.x<=_&&y.y>=f&&y.y<=m&&y!==i&&y!==a&&Ki(o,h,l,u,c,d,y.x,y.y)&&rt(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;M&&M.z<=v;){if(M.x>=p&&M.x<=_&&M.y>=f&&M.y<=m&&M!==i&&M!==a&&Ki(o,h,l,u,c,d,M.x,M.y)&&rt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function tm(r,e,t){let n=r;do{let i=n.prev,s=n.next.next;!ka(i,s)&&eu(i,n,n.next,s)&&Qr(i,s)&&Qr(s,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),es(n),es(n.next),n=r=s),n=n.next}while(n!==r);return _i(n)}function nm(r,e,t,n,i,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&om(a,o)){let l=tu(a,o);return a=_i(a,a.next),l=_i(l,l.next),$r(a,e,t,n,i,s,0),void $r(l,e,t,n,i,s,0)}o=o.next}a=a.next}while(a!==r)}function im(r,e){return r.x-e.x}function rm(r,e){let t=(function(i,s){let a,o=s,l=-1/0,c=i.x,h=i.y;do{if(h<=o.y&&h>=o.next.y&&o.next.y!==o.y){let m=o.x+(h-o.y)*(o.next.x-o.x)/(o.next.y-o.y);if(m<=c&&m>l&&(l=m,a=o.x<o.next.x?o:o.next,m===c))return a}o=o.next}while(o!==s);if(!a)return null;let u=a,d=a.x,p=a.y,f,_=1/0;o=a;do c>=o.x&&o.x>=d&&c!==o.x&&Ki(h<p?c:l,h,d,p,h<p?l:c,h,o.x,o.y)&&(f=Math.abs(h-o.y)/(c-o.x),Qr(o,i)&&(f<_||f===_&&(o.x>a.x||o.x===a.x&&sm(a,o)))&&(a=o,_=f)),o=o.next;while(o!==u);return a})(r,e);if(!t)return e;let n=tu(t,r);return _i(n,n.next),_i(t,t.next)}function sm(r,e){return rt(r.prev,r,e.prev)<0&&rt(e.next,r,r.next)<0}function kl(r,e,t,n,i){return(r=1431655765&((r=858993459&((r=252645135&((r=16711935&((r=(r-t)*i|0)|r<<8))|r<<4))|r<<2))|r<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-n)*i|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function am(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function Ki(r,e,t,n,i,s,a,o){return(i-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(i-a)*(n-o)}function om(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!(function(t,n){let i=t;do{if(i.i!==t.i&&i.next.i!==t.i&&i.i!==n.i&&i.next.i!==n.i&&eu(i,i.next,t,n))return!0;i=i.next}while(i!==t);return!1})(r,e)&&(Qr(r,e)&&Qr(e,r)&&(function(t,n){let i=t,s=!1,a=(t.x+n.x)/2,o=(t.y+n.y)/2;do i.y>o!=i.next.y>o&&i.next.y!==i.y&&a<(i.next.x-i.x)*(o-i.y)/(i.next.y-i.y)+i.x&&(s=!s),i=i.next;while(i!==t);return s})(r,e)&&(rt(r.prev,r,e.prev)||rt(r,e.prev,e))||ka(r,e)&&rt(r.prev,r,r.next)>0&&rt(e.prev,e,e.next)>0)}function rt(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function ka(r,e){return r.x===e.x&&r.y===e.y}function eu(r,e,t,n){let i=Qs(rt(r,e,t)),s=Qs(rt(r,e,n)),a=Qs(rt(t,n,r)),o=Qs(rt(t,n,e));return i!==s&&a!==o||!(i!==0||!$s(r,t,e))||!(s!==0||!$s(r,n,e))||!(a!==0||!$s(t,r,n))||!(o!==0||!$s(t,e,n))}function $s(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Qs(r){return r>0?1:r<0?-1:0}function Qr(r,e){return rt(r.prev,r,r.next)<0?rt(r,e,r.next)>=0&&rt(r,r.prev,e)>=0:rt(r,e,r.prev)<0||rt(r,r.next,e)<0}function tu(r,e){let t=new Hl(r.i,r.x,r.y),n=new Hl(e.i,e.x,e.y),i=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function wh(r,e,t,n){let i=new Hl(r,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function es(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function Hl(r,e,t){this.i=r,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}var Vn=class r{static area(e){let t=e.length,n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return .5*n}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let n=[],i=[],s=[];Ah(e),Rh(n,e);let a=e.length;t.forEach(Ah);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,Rh(n,t[l]);let o=$p(n,i);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}};function Ah(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function Rh(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var Yn=class r extends Je{constructor(e=new fn([new fe(.5,.5),new fe(-.5,.5),new fe(-.5,-.5),new fe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],s=[];for(let o=0,l=e.length;o<l;o++)a(e[o]);function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled===void 0||t.bevelEnabled,p=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:p-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:lm,y,M,I,C,L,F=!1;g&&(y=g.getSpacedPoints(h),F=!0,d=!1,M=g.computeFrenetFrames(h,!1),I=new R,C=new R,L=new R),d||(m=0,p=0,f=0,_=0);let G=o.extractPoints(c),q=G.shape,Z=G.holes;if(!Vn.isClockWise(q)){q=q.reverse();for(let N=0,P=Z.length;N<P;N++){let D=Z[N];Vn.isClockWise(D)&&(Z[N]=D.reverse())}}let j=Vn.triangulateShape(q,Z),H=q;for(let N=0,P=Z.length;N<P;N++){let D=Z[N];q=q.concat(D)}function z(N,P,D){return P||console.error("THREE.ExtrudeGeometry: vec does not exist"),N.clone().addScaledVector(P,D)}let se=q.length,ee=j.length;function pe(N,P,D){let T,U,X,he=N.x-P.x,W=N.y-P.y,oe=D.x-N.x,ce=D.y-N.y,b=he*he+W*W,V=he*ce-W*oe;if(Math.abs(V)>Number.EPSILON){let k=Math.sqrt(b),J=Math.sqrt(oe*oe+ce*ce),$=P.x-W/k,_e=P.y+he/k,ve=((D.x-ce/J-$)*ce-(D.y+oe/J-_e)*oe)/(he*ce-W*oe);T=$+he*ve-N.x,U=_e+W*ve-N.y;let ge=T*T+U*U;if(ge<=2)return new fe(T,U);X=Math.sqrt(ge/2)}else{let k=!1;he>Number.EPSILON?oe>Number.EPSILON&&(k=!0):he<-Number.EPSILON?oe<-Number.EPSILON&&(k=!0):Math.sign(W)===Math.sign(ce)&&(k=!0),k?(T=-W,U=he,X=Math.sqrt(b)):(T=he,U=W,X=Math.sqrt(b/2))}return new fe(T/X,U/X)}let me=[];for(let N=0,P=H.length,D=P-1,T=N+1;N<P;N++,D++,T++)D===P&&(D=0),T===P&&(T=0),me[N]=pe(H[N],H[D],H[T]);let Ae=[],Ce,ue=me.concat();for(let N=0,P=Z.length;N<P;N++){let D=Z[N];Ce=[];for(let T=0,U=D.length,X=U-1,he=T+1;T<U;T++,X++,he++)X===U&&(X=0),he===U&&(he=0),Ce[T]=pe(D[T],D[X],D[he]);Ae.push(Ce),ue=ue.concat(Ce)}for(let N=0;N<m;N++){let P=N/m,D=p*Math.cos(P*Math.PI/2),T=f*Math.sin(P*Math.PI/2)+_;for(let U=0,X=H.length;U<X;U++){let he=z(H[U],me[U],T);we(he.x,he.y,-D)}for(let U=0,X=Z.length;U<X;U++){let he=Z[U];Ce=Ae[U];for(let W=0,oe=he.length;W<oe;W++){let ce=z(he[W],Ce[W],T);we(ce.x,ce.y,-D)}}}let le=f+_;for(let N=0;N<se;N++){let P=d?z(q[N],ue[N],le):q[N];F?(C.copy(M.normals[0]).multiplyScalar(P.x),I.copy(M.binormals[0]).multiplyScalar(P.y),L.copy(y[0]).add(C).add(I),we(L.x,L.y,L.z)):we(P.x,P.y,0)}for(let N=1;N<=h;N++)for(let P=0;P<se;P++){let D=d?z(q[P],ue[P],le):q[P];F?(C.copy(M.normals[N]).multiplyScalar(D.x),I.copy(M.binormals[N]).multiplyScalar(D.y),L.copy(y[N]).add(C).add(I),we(L.x,L.y,L.z)):we(D.x,D.y,u/h*N)}for(let N=m-1;N>=0;N--){let P=N/m,D=p*Math.cos(P*Math.PI/2),T=f*Math.sin(P*Math.PI/2)+_;for(let U=0,X=H.length;U<X;U++){let he=z(H[U],me[U],T);we(he.x,he.y,u+D)}for(let U=0,X=Z.length;U<X;U++){let he=Z[U];Ce=Ae[U];for(let W=0,oe=he.length;W<oe;W++){let ce=z(he[W],Ce[W],T);F?we(ce.x,ce.y+y[h-1].y,y[h-1].x+D):we(ce.x,ce.y,u+D)}}}function xe(N,P){let D=N.length;for(;--D>=0;){let T=D,U=D-1;U<0&&(U=N.length-1);for(let X=0,he=h+2*m;X<he;X++){let W=se*X,oe=se*(X+1);E(P+T+W,P+U+W,P+U+oe,P+T+oe)}}}function we(N,P,D){l.push(N),l.push(P),l.push(D)}function te(N,P,D){A(N),A(P),A(D);let T=i.length/3,U=v.generateTopUV(n,i,T-3,T-2,T-1);O(U[0]),O(U[1]),O(U[2])}function E(N,P,D,T){A(N),A(P),A(T),A(P),A(D),A(T);let U=i.length/3,X=v.generateSideWallUV(n,i,U-6,U-3,U-2,U-1);O(X[0]),O(X[1]),O(X[3]),O(X[1]),O(X[2]),O(X[3])}function A(N){i.push(l[3*N+0]),i.push(l[3*N+1]),i.push(l[3*N+2])}function O(N){s.push(N.x),s.push(N.y)}(function(){let N=i.length/3;if(d){let P=0,D=se*P;for(let T=0;T<ee;T++){let U=j[T];te(U[2]+D,U[1]+D,U[0]+D)}P=h+2*m,D=se*P;for(let T=0;T<ee;T++){let U=j[T];te(U[0]+D,U[1]+D,U[2]+D)}}else{for(let P=0;P<ee;P++){let D=j[P];te(D[2],D[1],D[0])}for(let P=0;P<ee;P++){let D=j[P];te(D[0]+se*h,D[1]+se*h,D[2]+se*h)}}n.addGroup(N,i.length/3-N,0)})(),(function(){let N=i.length/3,P=0;xe(H,P),P+=H.length;for(let D=0,T=Z.length;D<T;D++){let U=Z[D];xe(U,P),P+=U.length}n.addGroup(N,i.length/3-N,1)})()}this.setAttribute("position",new De(i,3)),this.setAttribute("uv",new De(s,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n,i){if(i.shapes=[],Array.isArray(t))for(let s=0,a=t.length;s<a;s++){let o=t[s];i.shapes.push(o.uuid)}else i.shapes.push(t.uuid);return i.options=Object.assign({},n),n.extrudePath!==void 0&&(i.options.extrudePath=n.extrudePath.toJSON()),i})(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];n.push(o)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Ia[i.type]().fromJSON(i)),new r(n,e.options)}},lm={generateTopUV:function(r,e,t,n,i){let s=e[3*t],a=e[3*t+1],o=e[3*n],l=e[3*n+1],c=e[3*i],h=e[3*i+1];return[new fe(s,a),new fe(o,l),new fe(c,h)]},generateSideWallUV:function(r,e,t,n,i,s){let a=e[3*t],o=e[3*t+1],l=e[3*t+2],c=e[3*n],h=e[3*n+1],u=e[3*n+2],d=e[3*i],p=e[3*i+1],f=e[3*i+2],_=e[3*s],m=e[3*s+1],g=e[3*s+2];return Math.abs(o-h)<Math.abs(a-c)?[new fe(a,1-l),new fe(c,1-u),new fe(d,1-f),new fe(_,1-g)]:[new fe(o,1-l),new fe(h,1-u),new fe(p,1-f),new fe(m,1-g)]}},ts=class r extends vi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2;super([-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Gl=class r extends vi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Vl=class r extends Je{constructor(e=.5,t=1,n=32,i=1,s=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n);let o=[],l=[],c=[],h=[],u=e,d=(t-e)/(i=Math.max(1,i)),p=new R,f=new fe;for(let _=0;_<=i;_++){for(let m=0;m<=n;m++){let g=s+m/n*a;p.x=u*Math.cos(g),p.y=u*Math.sin(g),l.push(p.x,p.y,p.z),c.push(0,0,1),f.x=(p.x/t+1)/2,f.y=(p.y/t+1)/2,h.push(f.x,f.y)}u+=d}for(let _=0;_<i;_++){let m=_*(n+1);for(let g=0;g<n;g++){let v=g+m,y=v,M=v+n+1,I=v+n+2,C=v+1;o.push(y,M,C),o.push(M,I,C)}}this.setIndex(o),this.setAttribute("position",new De(l,3)),this.setAttribute("normal",new De(c,3)),this.setAttribute("uv",new De(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},ns=class r extends Je{constructor(e=new fn([new fe(0,.5),new fe(-.5,-.5),new fe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],s=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(o,l,h),o+=l,l=0;function c(h){let u=i.length/3,d=h.extractPoints(t),p=d.shape,f=d.holes;Vn.isClockWise(p)===!1&&(p=p.reverse());for(let m=0,g=f.length;m<g;m++){let v=f[m];Vn.isClockWise(v)===!0&&(f[m]=v.reverse())}let _=Vn.triangulateShape(p,f);for(let m=0,g=f.length;m<g;m++){let v=f[m];p=p.concat(v)}for(let m=0,g=p.length;m<g;m++){let v=p[m];i.push(v.x,v.y,0),s.push(0,0,1),a.push(v.x,v.y)}for(let m=0,g=_.length;m<g;m++){let v=_[m],y=v[0]+u,M=v[1]+u,I=v[2]+u;n.push(y,M,I),l+=3}}this.setIndex(n),this.setAttribute("position",new De(i,3)),this.setAttribute("normal",new De(s,3)),this.setAttribute("uv",new De(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n){if(n.shapes=[],Array.isArray(t))for(let i=0,s=t.length;i<s;i++){let a=t[i];n.shapes.push(a.uuid)}else n.shapes.push(t.uuid);return n})(this.parameters.shapes,e)}static fromJSON(e,t){let n=[];for(let i=0,s=e.shapes.length;i<s;i++){let a=t[e.shapes[i]];n.push(a)}return new r(n,e.curveSegments)}},yi=class r extends Je{constructor(e=1,t=32,n=16,i=0,s=2*Math.PI,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new R,d=new R,p=[],f=[],_=[],m=[];for(let g=0;g<=n;g++){let v=[],y=g/n,M=0;g===0&&a===0?M=.5/t:g===n&&l===Math.PI&&(M=-.5/t);for(let I=0;I<=t;I++){let C=I/t;u.x=-e*Math.cos(i+C*s)*Math.sin(a+y*o),u.y=e*Math.cos(a+y*o),u.z=e*Math.sin(i+C*s)*Math.sin(a+y*o),f.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(C+M,1-y),v.push(c++)}h.push(v)}for(let g=0;g<n;g++)for(let v=0;v<t;v++){let y=h[g][v+1],M=h[g][v],I=h[g+1][v],C=h[g+1][v+1];(g!==0||a>0)&&p.push(y,M,C),(g!==n-1||l<Math.PI)&&p.push(M,I,C)}this.setIndex(p),this.setAttribute("position",new De(f,3)),this.setAttribute("normal",new De(_,3)),this.setAttribute("uv",new De(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},Wl=class r extends vi{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},rn=class r extends Je{constructor(e=1,t=.4,n=12,i=48,s=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);let a=[],o=[],l=[],c=[],h=new R,u=new R,d=new R;for(let p=0;p<=n;p++)for(let f=0;f<=i;f++){let _=f/i*s,m=p/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(f/i),c.push(p/n)}for(let p=1;p<=n;p++)for(let f=1;f<=i;f++){let _=(i+1)*p+f-1,m=(i+1)*(p-1)+f-1,g=(i+1)*(p-1)+f,v=(i+1)*p+f;a.push(_,m,v),a.push(m,g,v)}this.setIndex(a),this.setAttribute("position",new De(o,3)),this.setAttribute("normal",new De(l,3)),this.setAttribute("uv",new De(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},Xl=class r extends Je{constructor(e=1,t=.4,n=64,i=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:s,q:a},n=Math.floor(n),i=Math.floor(i);let o=[],l=[],c=[],h=[],u=new R,d=new R,p=new R,f=new R,_=new R,m=new R,g=new R;for(let y=0;y<=n;++y){let M=y/n*s*Math.PI*2;v(M,s,a,e,p),v(M+.01,s,a,e,f),m.subVectors(f,p),g.addVectors(f,p),_.crossVectors(m,g),g.crossVectors(_,m),_.normalize(),g.normalize();for(let I=0;I<=i;++I){let C=I/i*Math.PI*2,L=-t*Math.cos(C),F=t*Math.sin(C);u.x=p.x+(L*g.x+F*_.x),u.y=p.y+(L*g.y+F*_.y),u.z=p.z+(L*g.z+F*_.z),l.push(u.x,u.y,u.z),d.subVectors(u,p).normalize(),c.push(d.x,d.y,d.z),h.push(y/n),h.push(I/i)}}for(let y=1;y<=n;y++)for(let M=1;M<=i;M++){let I=(i+1)*(y-1)+(M-1),C=(i+1)*y+(M-1),L=(i+1)*y+M,F=(i+1)*(y-1)+M;o.push(I,C,F),o.push(C,L,F)}function v(y,M,I,C,L){let F=Math.cos(y),G=Math.sin(y),q=I/M*y,Z=Math.cos(q);L.x=C*(2+Z)*.5*F,L.y=C*(2+Z)*G*.5,L.z=C*Math.sin(q)*.5}this.setIndex(o),this.setAttribute("position",new De(l,3)),this.setAttribute("normal",new De(c,3)),this.setAttribute("uv",new De(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},is=class r extends Je{constructor(e=new Ca(new R(-1,-1,0),new R(-1,1,0),new R(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};let a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new R,l=new R,c=new fe,h=new R,u=[],d=[],p=[],f=[];function _(m){h=e.getPointAt(m/t,h);let g=a.normals[m],v=a.binormals[m];for(let y=0;y<=i;y++){let M=y/i*Math.PI*2,I=Math.sin(M),C=-Math.cos(M);l.x=C*g.x+I*v.x,l.y=C*g.y+I*v.y,l.z=C*g.z+I*v.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}(function(){for(let m=0;m<t;m++)_(m);_(s===!1?t:0),(function(){for(let m=0;m<=t;m++)for(let g=0;g<=i;g++)c.x=m/t,c.y=g/i,p.push(c.x,c.y)})(),(function(){for(let m=1;m<=t;m++)for(let g=1;g<=i;g++){let v=(i+1)*(m-1)+(g-1),y=(i+1)*m+(g-1),M=(i+1)*m+g,I=(i+1)*(m-1)+g;f.push(v,y,I),f.push(y,M,I)}})()})(),this.setIndex(f),this.setAttribute("position",new De(u,3)),this.setAttribute("normal",new De(d,3)),this.setAttribute("uv",new De(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new r(new Ia[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},jl=class extends Je{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,i=new R,s=new R;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let u=l[c],d=u.start;for(let p=d,f=d+u.count;p<f;p+=3)for(let _=0;_<3;_++){let m=o.getX(p+_),g=o.getX(p+(_+1)%3);i.fromBufferAttribute(a,m),s.fromBufferAttribute(a,g),Ch(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,u=3*o+(c+1)%3;i.fromBufferAttribute(a,h),s.fromBufferAttribute(a,u),Ch(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new De(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Ch(r,e,t){let n=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,i=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(n)!==!0&&t.has(i)!==!0&&(t.add(n),t.add(i),!0)}var of=Object.freeze({__proto__:null,BoxGeometry:pn,CapsuleGeometry:Fl,CircleGeometry:qn,ConeGeometry:gi,CylinderGeometry:At,DodecahedronGeometry:Bl,EdgesGeometry:zl,ExtrudeGeometry:Yn,IcosahedronGeometry:ts,LatheGeometry:fi,OctahedronGeometry:Gl,PlaneGeometry:nn,PolyhedronGeometry:vi,RingGeometry:Vl,ShapeGeometry:ns,SphereGeometry:yi,TetrahedronGeometry:Wl,TorusGeometry:rn,TorusKnotGeometry:Xl,TubeGeometry:is,WireframeGeometry:jl});var La=class extends Rn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function ea(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function cm(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}var ur=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];t:{e:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break e}a=t.length;break n}if(e>=s)break t;{let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break e}a=n,n=0}}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ql=class extends ur{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Mc,endingEnd:Mc}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Sc:s=e,o=2*t-n;break;case bc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Sc:a=e,l=2*n-t;break;case bc:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}let c=.5*(n-t),h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,f=(n-t)/(i-t),_=f*f,m=_*f,g=-d*m+2*d*_-d*f,v=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*f+1,y=(-1-p)*m+(1.5+p)*_+.5*f,M=p*m-p*_;for(let I=0;I!==o;++I)s[I]=g*a[h+I]+v*a[c+I]+y*a[l+I]+M*a[u+I];return s}},Yl=class extends ur{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)s[d]=a[c+d]*u+a[l+d]*h;return s}},Zl=class extends ur{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},en=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ea(t,this.TimeBufferType),this.values=ea(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ea(e.times,Array),values:ea(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Zl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Yl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ql(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case oa:t=this.InterpolantFactoryMethodDiscrete;break;case dl:t=this.InterpolantFactoryMethodLinear;break;case Qa:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(n);this.setInterpolation(this.DefaultInterpolation)}return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return oa;case this.InterpolantFactoryMethodLinear:return dl;case this.InterpolantFactoryMethodSmooth:return Qa}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!=0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&cm(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Qa,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o];if(c!==e[o+1]&&(o!==1||c!==e[0]))if(i)l=!0;else{let h=o*n,u=h-n,d=h+n;for(let p=0;p!==n;++p){let f=t[h+p];if(f!==t[u+p]||f!==t[d+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,u=a*n;for(let d=0;d!==n;++d)t[u+d]=t[h+d]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=new this.constructor(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}};en.prototype.TimeBufferType=Float32Array,en.prototype.ValueBufferType=Float32Array,en.prototype.DefaultInterpolation=dl;var ui=class extends en{constructor(e,t,n){super(e,t,n)}};ui.prototype.ValueTypeName="bool",ui.prototype.ValueBufferType=Array,ui.prototype.DefaultInterpolation=oa,ui.prototype.InterpolantFactoryMethodLinear=void 0,ui.prototype.InterpolantFactoryMethodSmooth=void 0;var Jl=class extends en{};Jl.prototype.ValueTypeName="color";var Kl=class extends en{};Kl.prototype.ValueTypeName="number";var $l=class extends ur{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t),c=e*o;for(let h=c+o;c!==h;c+=4)un.slerpFlat(s,0,a,c-o,a,c,l);return s}},Ua=class extends en{InterpolantFactoryMethodLinear(e){return new $l(this.times,this.values,this.getValueSize(),e)}};Ua.prototype.ValueTypeName="quaternion",Ua.prototype.InterpolantFactoryMethodSmooth=void 0;var di=class extends en{constructor(e,t,n){super(e,t,n)}};di.prototype.ValueTypeName="string",di.prototype.ValueBufferType=Array,di.prototype.DefaultInterpolation=oa,di.prototype.InterpolantFactoryMethodLinear=void 0,di.prototype.InterpolantFactoryMethodSmooth=void 0;var Ql=class extends en{};Ql.prototype.ValueTypeName="vector";var ec=class{constructor(e,t,n){let i=this,s,a=!1,o=0,l=0,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){l++,a===!1&&i.onStart!==void 0&&i.onStart(h,o,l),a=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,l),o===l&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return s?s(h):h},this.setURLModifier=function(h){return s=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],f=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return f}return null}}},hm=new ec,tc=class{constructor(e){this.manager=e!==void 0?e:hm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise((function(i,s){n.load(e,i,t,s)}))}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};tc.DEFAULT_MATERIAL_NAME="__DEFAULT";var rs=class extends yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Da=class extends rs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Uo=new je,Ph=new R,Ih=new R,Na=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new fe(512,512),this.map=null,this.mapPass=null,this.matrix=new je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new or,this._frameExtents=new fe(1,1),this._viewportCount=1,this._viewports=[new Ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Ph.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ph),Ih.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ih),t.updateMatrixWorld(),Uo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Uo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Lh=new je,Or=new R,Do=new R,nc=class extends Na{constructor(){super(new bt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new fe(4,2),this._viewportCount=6,this._viewports=[new Ze(2,1,1,1),new Ze(0,1,1,1),new Ze(3,1,1,1),new Ze(1,1,1,1),new Ze(3,0,1,1),new Ze(1,0,1,1)],this._cubeDirections=[new R(1,0,0),new R(-1,0,0),new R(0,0,1),new R(0,0,-1),new R(0,1,0),new R(0,-1,0)],this._cubeUps=[new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,0,1),new R(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Or.setFromMatrixPosition(e.matrixWorld),n.position.copy(Or),Do.copy(n.position),Do.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Do),n.updateMatrixWorld(),i.makeTranslation(-Or.x,-Or.y,-Or.z),Lh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Lh)}},Oa=class extends rs{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new nc}get power(){return 4*this.intensity*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},ic=class extends Na{constructor(){super(new ga(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ss=class extends rs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.target=new yt,this.shadow=new ic}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var lf=new je,cf=new je,hf=new je;var uf=new R,df=new un,pf=new R,mf=new R;var ff=new R,gf=new un,vf=new R,_f=new R;var pc="\\[\\]\\.:\\/",um=new RegExp("["+pc+"]","g"),No="[^"+pc+"]",dm="[^"+pc.replace("\\.","")+"]",pm=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",No)+/(WCOD+)?/.source.replace("WCOD",dm)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",No)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",No)+"$"),mm=["material","materials","bones","map"],nt=class r{constructor(e,t,n){this.path=t,this.parsedPath=n||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,n):new r(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(um,"")}static parseTrackName(e){let t=pm.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);mm.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[n]===void 0)return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[n]}if(c!==void 0){if(e[c]===void 0)return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[c]}}let a=e[i];if(a===void 0){let c=t.nodeName;return void console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e)}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};nt.Composite=class{constructor(r,e,t){let n=t||nt.parseTrackName(e);this._targetGroup=r,this._bindings=r.subscribe_(e,n)}getValue(r,e){this.bind();let t=this._targetGroup.nCachedObjects_,n=this._bindings[t];n!==void 0&&n.getValue(r,e)}setValue(r,e){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].setValue(r,e)}bind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].bind()}unbind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].unbind()}},nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray],nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var yf=new Float32Array(1);var xf=new je;var Mf=new fe;var Sf=new R,bf=new R;var Ef=new R;var Tf=new R,wf=new je,Af=new je;var Rf=new R,Cf=new ze,Pf=new ze;var If=new R,Lf=new R,Uf=new R;var Df=new R,Nf=new jr;var Of=new Ft;var Ff=new R;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");function nu({scene:r,geometry:e,material:t,basic:n,mesh:i,terrainMaterials:s=[]}){let a=Math.PI*2,o=80631,l=()=>(o=o*16807%2147483647,(o-1)/2147483646),c=[];function h(b,V,k=!0){let J=document.createElement("canvas");J.width=J.height=b,V(J.getContext("2d"),b);let $=new Zr(J);return $.colorSpace=k?vt:Hn,$.wrapS=$.wrapT=Gr,$.anisotropy=2,c.push($),$}let u=h(512,(b,V)=>{b.fillStyle="#343b40",b.fillRect(0,0,V,V);let k=8,J=4,$=V/k,_e=V/J;for(let ve=0;ve<k;ve++)for(let ge=-1;ge<=J;ge++){let Se=ge*_e+ve%2*_e*.5,Ee=ve*$,Ie=114+Math.floor(l()*29);b.fillStyle=`rgb(${Ie+4},${Ie+4},${Ie})`,b.fillRect(Se+2,Ee+2,_e-4,$-4),b.fillStyle="rgba(221,215,194,.23)",b.fillRect(Se+3,Ee+3,_e-6,2),b.fillStyle="rgba(18,25,30,.4)",b.fillRect(Se+3,Ee+$-6,_e-6,3);for(let ye=0;ye<12;ye++){let Re=Se+l()*_e,We=Ee+l()*$;b.fillStyle=l()>.65?"rgba(33,49,42,.23)":"rgba(24,31,34,.13)",b.fillRect(Re,We,1+l()*12,1+l()*4)}l()>.66&&(b.beginPath(),b.moveTo(Se+_e*.2,Ee+2),b.lineTo(Se+_e*.35,Ee+$*.25),b.lineTo(Se+_e*.3,Ee+$*.47),b.strokeStyle="rgba(34,43,47,.45)",b.lineWidth=.8,b.stroke())}for(let ve=0;ve<12e3;ve++){let ge=Math.floor(70+l()*140);b.fillStyle=`rgba(${ge},${ge},${ge},.12)`,b.fillRect(l()*V,l()*V,1,1)}}),d=h(512,(b,V)=>{b.fillStyle="#383838",b.fillRect(0,0,V,V);for(let k=0;k<8;k++)for(let J=-1;J<=4;J++){let $=J*128+k%2*64,_e=k*64;b.fillStyle="#b9b9b9",b.fillRect($+3,_e+3,122,58),b.fillStyle="#dedede",b.fillRect($+5,_e+5,118,2)}for(let k=0;k<9e3;k++)b.fillStyle=l()>.5?"rgba(255,255,255,.12)":"rgba(0,0,0,.12)",b.fillRect(l()*V,l()*V,1,1)},!1),p=h(256,(b,V)=>{b.fillStyle="#c2c0b7",b.fillRect(0,0,V,V);for(let k=0;k<6500;k++){let J=85+Math.floor(l()*150);b.fillStyle=`rgba(${J},${J},${J},${.06+l()*.13})`,b.fillRect(l()*V,l()*V,1+l()*4,1+l()*2)}for(let k=0;k<14;k++){let J=l()*V,$=l()*V;b.beginPath(),b.moveTo(J,$),b.lineTo(J+l()*20,$+l()*25),b.strokeStyle="rgba(45,48,46,.17)",b.lineWidth=.6,b.stroke()}});for(let b of s)b.map=p,b.bumpMap=p,b.bumpScale=.022,b.roughness=.94,b.needsUpdate=!0;let f=t(11382952,{map:u,bumpMap:d,bumpScale:.065,roughness:.94,metalness:.025}),_=t(12763313,{map:u,bumpMap:d,bumpScale:.055,roughness:.91,metalness:.025}),m=t(8753556,{map:u,bumpMap:d,bumpScale:.05,roughness:.96,metalness:.015}),g=t(7635853,{map:u,roughness:1,metalness:0}),v=t(5467523,{roughness:1,metalness:0}),y=t(11836519,{roughness:.62,metalness:.5}),M=t(1319724,{roughness:1,metalness:0}),I=n(14067303,{fog:!0,transparent:!0,opacity:.73}),C=n(7838634,{fog:!0,transparent:!0,opacity:.46});f.addEventListener("dispose",()=>c.forEach(b=>b.dispose()));let L=e("sanctuary:box",()=>new pn(1,1,1)),F=e("sanctuary:octagon",()=>new At(1,1,1,8)),G=e("sanctuary:shaft",()=>new At(.83,1,1,10)),q=e("sanctuary:spire",()=>new gi(1,1,8)),Z=e("sanctuary:sphere",()=>new yi(1,32,20)),j=b=>(b.userData.noCameraCollision=!0,b),H=p.clone();H.repeat.set(34,34),H.needsUpdate=!0,c.push(H);let z=j(i(r,e("sanctuary:terrace",()=>new qn(52,96)),t(5858668,{map:H,roughness:1,metalness:0}),[0,-.06,0],[1,1,1],!1));z.rotation.x=-Math.PI/2,z.receiveShadow=!0;let se=document.createElement("canvas");se.width=1024,se.height=512;let ee=se.getContext("2d"),pe=ee.createLinearGradient(0,0,0,512);pe.addColorStop(0,"#080f1c"),pe.addColorStop(.26,"#132435"),pe.addColorStop(.41,"#2b3d4d"),pe.addColorStop(.475,"#514b49"),pe.addColorStop(.515,"#655247"),pe.addColorStop(.59,"#293a44"),pe.addColorStop(1,"#111c27"),ee.fillStyle=pe,ee.fillRect(0,0,1024,512);for(let b=0;b<100;b++){let V=l()*1024,k=105+l()*160,J=25+l()*70,$=[0];V<J&&$.push(1024),V+J>1024&&$.push(-1024);for(let _e of $){let ve=ee.createRadialGradient(V+_e,k,0,V+_e,k,J);ve.addColorStop(0,b%3?"rgba(87,111,126,.055)":"rgba(5,16,27,.065)"),ve.addColorStop(1,"rgba(18,31,44,0)"),ee.fillStyle=ve,ee.fillRect(V+_e-J,k-J,J*2,J*2)}}for(let b=0;b<2;b++){let V=b?267:254,k=b?1.35:.35;ee.beginPath();for(let J=0;J<=160;J++){let $=J/160*a,_e=7+Math.sin($*3+k)*5+Math.sin($*7+k)*3+Math.abs(Math.sin($*17+k))*7,ve=J/160*1024,ge=V-_e;J?ee.lineTo(ve,ge):ee.moveTo(ve,ge)}ee.lineTo(1024,512),ee.lineTo(0,512),ee.closePath(),ee.fillStyle=b?"rgba(22,36,48,.54)":"rgba(35,51,64,.46)",ee.fill()}for(let b=0;b<190;b++)ee.fillStyle=`rgba(188,206,215,${.12+l()*.38})`,ee.fillRect(l()*1024,24+l()*178,l()>.93?1.5:.7,.7);let me=new Zr(se);me.colorSpace=vt,me.mapping=Hr,c.push(me),r.background=me;function Ae(b,V,k,J){let $=(1-Math.abs(b))*Math.PI/3;return new fe(Math.sign(b)*(2*V*Math.cos($)-V),k+2*J/Math.sqrt(3)*Math.sin($))}function Ce(b,V,k,J,$,_e=-1,ve=1){let ge=`sanctuary:arch:${b}:${V}:${k}:${J}:${$}:${_e}:${ve}`;return e(ge,()=>{let Se=new fn,Ee=Math.ceil(28*(ve-_e)/2);for(let ye=0;ye<=Ee;ye++){let Re=Ae(_e+(ve-_e)*ye/Ee,b,V,k);ye?Se.lineTo(Re.x,Re.y):Se.moveTo(Re.x,Re.y)}for(let ye=Ee;ye>=0;ye--){let Re=Ae(_e+(ve-_e)*ye/Ee,b+J,V,k+J);Se.lineTo(Re.x,Re.y)}Se.closePath();let Ie=new Yn(Se,{depth:$,bevelEnabled:!0,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025});Ie.translate(0,0,-$/2),Ie.userData.cameraBoxes=[];for(let ye=0;ye<Ee;ye+=2){let Re=new Ft;for(let We=ye;We<=Math.min(ye+2,Ee);We++){let Rt=_e+(ve-_e)*We/Ee;for(let[In,mt]of[[b,k],[b+J,k+J]]){let ot=Ae(Rt,In,V,mt);Re.expandByPoint(new R(ot.x,ot.y,-$/2)),Re.expandByPoint(new R(ot.x,ot.y,$/2))}}Ie.userData.cameraBoxes.push(Re)}return Ie})}function ue(b,V,k,J,$,_e,ve,ge=-1,Se=1,Ee=0){let Ie=Ce(V,k,J,$,_e,ge,Se),ye=i(b,Ie,ve,[0,0,Ee]);return ye.userData.cameraCollisionBoxes=Ie.userData.cameraBoxes,ye}function le(b,V,k,J,$=.34,_e=!1){i(b,L,m,[V,.18,k],[$*3,.36,$*3]),i(b,F,_,[V,.47,k],[$*1.3,.22,$*1.3]);let ve=Math.ceil((J-.7)/.62),ge=(J-.7)/ve;for(let Se=0;Se<ve;Se++){let Ee=i(b,G,Se%3?f:_,[V,.64+ge*(Se+.5),k],[$,ge-.017,$]);_e&&Se===ve-1&&(Ee.rotation.z=.12)}_e||(i(b,F,_,[V,J+.03,k],[$*1.28,.22,$*1.28]),i(b,L,m,[V,J+.22,k],[$*2.9,.19,$*2.9]))}function xe(b,V,k,J,$,_e,ve=!1){let ge=_e*.55,Se=_e*.45,Ee=e(`sanctuary:window:${$}:${_e}`,()=>{let Re=new fn;Re.moveTo(-$,0),Re.lineTo(-$,ge);for(let We=0;We<=24;We++){let Rt=Ae(-1+We/12,$,ge,Se);Re.lineTo(Rt.x,Rt.y)}return Re.lineTo($,0),Re.closePath(),new ns(Re)}),Ie=new Ke;Ie.position.set(V,k,J),b.add(Ie),j(i(Ie,Ee,M,[0,0,0],[1,1,1],!1));let ye=ue(Ie,$,ge,Se,.09,.09,_,-1,1,.035);j(ye);for(let Re of[-1,1])j(i(Ie,L,_,[Re*($+.04),ge/2,.035],[.09,ge,.09]));if(ve){let Re=j(i(Ie,Ee,ve==="cool"?C:I,[0,.03,.012],[.72,.93,1],!1));Re.renderOrder=1}j(i(Ie,L,m,[0,_e*.4,.08],[.045,_e*.78,.04],!1)),j(i(Ie,L,m,[0,_e*.43,.08],[$*1.85,.06,.04],!1))}function we(b,V,k,J,$=y){let _e=e(`sanctuary:rose:${V}`,()=>new rn(V,.055,6,48));j(i(b,_e,$,[0,k,J],[1,1,1],!1));let ve=e(`sanctuary:petal:${V}`,()=>{let Se=new mi(0,V*.36,V*.18,V*.35,0,a,!1,0).getPoints(18).map(Ee=>new R(Ee.x,Ee.y,0));return new is(new Jr(Se,!0),24,.027,4,!0)});for(let ge=0;ge<8;ge++){let Se=j(i(b,ve,$,[0,k,J],[1,1,1],!1));Se.rotation.z=ge*a/8}j(i(b,e(`sanctuary:rosecore:${V}`,()=>new rn(V*.19,.035,5,24)),$,[0,k,J],[1,1,1],!1))}function te(b,V,k,J=1,$=!1,_e=!1){let ve=new Ke;ve.position.set(b,-.05,V),ve.scale.setScalar(J),ve.rotation.y=Math.atan2(-b,-V);let ge=$?v:f;i(ve,L,$?v:m,[0,.3,0],[2.25,.6,2.25]);let Se=$?k*.62:k;if(i(ve,F,ge,[0,Se/2+.5,0],[.91,Se,.91]),$){i(ve,F,v,[0,Se+.62,0],[1.02,.22,1.02]);let Ee=new Ke;Ee.position.y=Se+.76,ue(Ee,.55,.8,1,.2,.6,v);for(let Ie of[-1,1])i(Ee,L,v,[Ie*.65,.4,0],[.2,.8,.6]);ve.add(Ee);for(let Ie of[-1,1])i(ve,L,v,[Ie*.75,Se*.38,.33],[.17,Se*.76,.2]);k=Se+2.2}if(!$){for(let Ee of[-.8,.8])for(let Ie of[-.8,.8])i(ve,L,m,[Ee,k*.35,Ie],[.33,k*.7,.33]),i(ve,q,_,[Ee,k*.72+.2,Ie],[.27,1.1,.27]);[2.5,5.5,k-.25].filter(Ee=>Ee<k).forEach(Ee=>i(ve,F,_,[0,Ee,0],[1.03,.18,1.03])),xe(ve,0,2.5,.924,.32,2.7,"warm"),k>8&&xe(ve,0,6.15,.924,.25,1.9,"cool")}if(i(ve,F,$?v:_,[0,k+.58,0],[1.12,.34,1.12]),!_e)i(ve,q,$?v:m,[0,k+2.65,0],[1.14,3.9,1.14]),j(i(ve,G,y,[0,k+4.8,0],[.045,.85,.045],!1));else for(let Ee=0;Ee<6;Ee++){let Ie=Ee*a/6,ye=i(ve,L,ge,[Math.sin(Ie)*.7,k+.85+l()*.55,Math.cos(Ie)*.7],[.35,.5+l()*.7,.32]);ye.rotation.z=(l()-.5)*.3}return r.add(ve),ve}let E=new Ke;E.position.set(0,0,-13.7);let A=2.65,O=3.05,N=4.65;ue(E,A,O,N,.6,1.25,f),ue(E,A+.67,O,N+.66,.16,.45,_,-1,1,.57),ue(E,A-.08,O,N-.12,.075,.13,y,-1,1,.68);for(let b of[-1,1]){i(E,L,f,[b*2.95,O/2,0],[.61,O,1.25]),le(E,b*3.48,.14,5.4,.34),le(E,b*2.62,.68,O-.15,.105),i(E,L,m,[b*3.24,.2,.1],[1.8,.4,1.8]),i(E,q,m,[b*3.48,6.35,.14],[.5,1.65,.5]),j(i(E,G,y,[b*3.48,7.3,.14],[.035,.6,.035],!1));let V=i(E,L,m,[b*4.24,2.5,-.8],[.55,4.7,1.3]);V.rotation.z=b*-.22,xe(E,b*4.1,.8,.5,.42,2.5,!1)}r.add(E),te(-5.5,-17.2,8.6,1.05,!1,!1),te(5.9,-17.8,9.5,1,!1,!0),[Math.PI/3,2*Math.PI/3,Math.PI,4*Math.PI/3,5*Math.PI/3].forEach((b,V)=>{let k=new Ke;k.position.set(Math.sin(b)*13.4,0,-Math.cos(b)*13.4),k.rotation.y=-b;let J=V===1||V===4;ue(k,2.2,2.75,3.65,.44,.8,V%2?m:f,-1,J?.27:1),J||ue(k,2.15,2.75,3.56,.065,.12,_,-1,1,.47);for(let $ of[-1,1])le(k,$*2.43,0,J&&$>0?2.1:2.7,.29,J&&$>0),i(k,L,m,[$*2.9,1.1,-.2],[.55,2.2,1]);V===2&&(we(k,.75,5.05,.48,_),j(i(k,e("sanctuary:roseglass",()=>new qn(.73,48)),C,[0,5.05,.45],[1,1,1],!1))),r.add(k)});for(let b=0;b<13;b++){let V=(b+.35)*a/13,k=24+l()*10,J=7+l()*8;te(Math.sin(V)*k,-Math.cos(V)*k,J,.7+l()*.65,!0,b%4===0)}for(let b=0;b<16;b++){let V=b*a/16+.1,k=17.6+l()*1.6,J=new Ke;J.position.set(Math.sin(V)*k,-.055,-Math.cos(V)*k),J.rotation.y=-V;for(let $=0;$<3;$++)for(let _e=0;_e<5;_e++){if($===2&&l()>.58)continue;let ve=i(J,L,($+_e)%3?g:m,[(_e-2)*.72+$%2*.15,.18+$*.35,0],[.7,.335,.64]);$===2&&(ve.rotation.z=(l()-.5)*.08)}if(b%4===0){let $=new Ke;$.position.set(-1.1,0,-.25),ue($,.72,1.85,1.5,.22,.55,g,-1,.35),le($,-.83,0,1.85,.16),le($,.83,0,1.25,.16,!0),J.add($)}r.add(J)}for(let b=0;b<34;b++){let V=l()*a,k=10.7+l()*2.4;i(r,L,b%2?m:f,[Math.sin(V)*k,.03+l()*.13,Math.cos(V)*k],[.25+l()*.75,.16+l()*.45,.3+l()*.6]).rotation.set(l()*.24,l()*a,l()*.4)}i(r,L,m,[0,.3,-23],[3.7,.6,2.2]),i(r,L,_,[0,.71,-23],[3,.24,1.7]),i(r,F,M,[0,1.4,-23],[.55,1.2,.55]);for(let b=0;b<7;b++)i(r,L,g,[0,-.03,-15.2-b*.9],[2.9,.09,.72]);let D=h(1024,(b,V)=>{b.clearRect(0,0,V,V),b.translate(V/2,V/2);let k=V*.465;b.strokeStyle="rgba(191,157,94,.83)";for(let J of[1,.975,.89,.86,.69,.65,.28])b.beginPath(),b.arc(0,0,k*J,0,a),b.lineWidth=J===1?4:2,b.stroke();for(let J=0;J<48;J++)b.save(),b.rotate(J*a/48),b.lineWidth=2,b.beginPath(),b.moveTo(-5,-k*.925),b.lineTo(5,-k*.925),b.moveTo(0,-k*.91),b.lineTo(0,-k*.95),J%3===0&&(b.moveTo(-7,-k*.95),b.lineTo(0,-k*.93),b.lineTo(7,-k*.95)),b.stroke(),b.restore();for(let J=0;J<12;J++)b.save(),b.rotate(J*a/12),b.beginPath(),b.moveTo(0,-k*.3),b.bezierCurveTo(-k*.2,-k*.48,-k*.13,-k*.64,0,-k*.82),b.bezierCurveTo(k*.13,-k*.64,k*.2,-k*.48,0,-k*.3),b.lineWidth=2.5,b.stroke(),b.restore();b.fillStyle="rgba(168,129,69,.32)";for(let J=0;J<8;J++)b.save(),b.rotate(J*a/8),b.beginPath(),b.moveTo(0,-k*.25),b.lineTo(-12,-18),b.lineTo(0,0),b.lineTo(12,-18),b.closePath(),b.fill(),b.stroke(),b.restore();b.globalCompositeOperation="destination-out";for(let J=0;J<400;J++)b.fillStyle=`rgba(0,0,0,${l()*.7})`,b.fillRect((l()-.5)*V,(l()-.5)*V,2+l()*7,1+l()*3)}),T=j(i(r,e("sanctuary:medallion",()=>new nn(4.9,4.9)),n(16777215,{map:D,transparent:!0,opacity:.72,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1}),[0,.057,0],[1,1,1],!1));T.rotation.x=-Math.PI/2;let U=new Ke;U.position.set(0,7.6,-31.5);let X=h(256,(b,V)=>{let k=b.createRadialGradient(V/2,V/2,V*.18,V/2,V/2,V/2);k.addColorStop(0,"rgba(225,197,136,0)"),k.addColorStop(.25,"rgba(225,197,136,.21)"),k.addColorStop(.55,"rgba(165,190,193,.065)"),k.addColorStop(1,"rgba(128,160,180,0)"),b.fillStyle=k,b.fillRect(0,0,V,V)}),he=i(U,e("sanctuary:corona",()=>new nn(11,11)),n(16777215,{map:X,transparent:!0,depthWrite:!1,blending:pr,fog:!1,side:dr}),[0,0,-.3],[1,1,1],!1);he.renderOrder=-1,i(U,Z,n(14010531,{fog:!1}),[0,0,0],[1.86,1.86,.34],!1),i(U,Z,n(1516333,{fog:!1}),[.18,.12,.26],[1.77,1.77,.34],!1);let W=n(11183491,{transparent:!0,opacity:.65,fog:!1,side:dr,depthWrite:!1});for(let b of[2.12,2.6,2.68])i(U,e(`sanctuary:halo:${b}`,()=>new rn(b,b===2.6?.017:.009,4,128)),W,[0,0,-.1],[1,1,1],!1);let oe=[];for(let b=0;b<32;b++){let V=b*a/32,k=b%4?2.65:2.52,J=b%4?2.74:2.88;oe.push(Math.sin(V)*k,Math.cos(V)*k,-.1,Math.sin(V)*J,Math.cos(V)*J,-.1)}let ce=e("sanctuary:astralmarks",()=>{let b=[];for(let V=0;V<oe.length;V+=6){let k=oe[V],J=oe[V+1],$=oe[V+3],_e=oe[V+4],ve=Math.hypot($-k,_e-J),ge=-(_e-J)/ve*.008,Se=($-k)/ve*.008;b.push(k+ge,J+Se,-.1,k-ge,J-Se,-.1,$+ge,_e+Se,-.1,k-ge,J-Se,-.1,$-ge,_e-Se,-.1,$+ge,_e+Se,-.1)}return new Je().setAttribute("position",new De(b,3))});return i(U,ce,W,[0,0,0],[1,1,1],!1),U.traverse(b=>{b.userData.noStaticBatch=!0,b.userData.noCameraCollision=!0}),r.add(U),{moonHalo:U}}var Mi=(r,e=0,t=1)=>Math.max(e,Math.min(t,r)),xi=r=>{let e=Mi(r);return e*e*(3-2*e)},fm=(r,e,t)=>r+(e-r)*t,iu=["la","ra","laz","raz","lay","ray","le","re","ll","rl","llz","rlz","lk","rk","lf","rf","bx","by","bz","hx","hy","hz","rootY","lean","sway","fall"];function ru(){let r={},e={};for(let t of iu)r[t]=e[t]=0;return{pose:r,target:e,phase:0,speed:0,impact:0,previousHealth:null,previousState:"",previousSequence:0,lastX:null,lastZ:null,ready:!1,stanceTime:0,resetMarker:null}}function su(r,e,t,n,i=!1){t=Mi(Number.isFinite(t)?t:0,0,.1);let s=e.state||"idle",a=r.target,o=Mi(e.style||0,0,2),l=e.yaw||0,c=Math.sin(l),h=Math.cos(l),u=r.resetMarker!==e,d=u||r.lastX===null?0:e.x-r.lastX,p=u||r.lastZ===null?0:e.z-r.lastZ;u&&(r.ready=!1,r.impact=0,r.speed=0,r.previousHealth=e.health,r.previousState="",r.phase=0,r.resetMarker=e);let f=Number.isFinite(e.vx)?e.vx:t>0?d/t:0,_=Number.isFinite(e.vz)?e.vz:t>0?p/t:0,m=Math.min(8,Math.hypot(f,_));r.lastX=e.x,r.lastZ=e.z;let g=s==="idle"||s==="guard"||s==="recovery";r.speed+=((g?m:0)-r.speed)*(1-Math.exp(-t*18)),Number.isFinite(e.movePhase)?r.phase=e.movePhase:g&&(r.phase+=m*t*4),r.stanceTime+=t;let v=Mi(r.speed/3.8),y=m>.05?Mi((f*c+_*h)/m,-1,1):0,M=m>.05?Mi((f*h-_*c)/m,-1,1):0,I=r.phase,C=Math.sin(I),L=Math.sin(I+Math.PI),F=Math.sin(r.stanceTime*2.3+(i?1.1:0)),G=Math.sin(r.stanceTime*1.05+(i?2:0)),q=Mi((e.stateTime||0)/Math.max(.001,e.stateDuration||1));if(a.la=-.46,a.ra=-.2,a.laz=.16,a.raz=-.22,a.lay=-.12,a.ray=.12,a.le=-1.9,a.re=-2.02,a.ll=-.13,a.rl=.13,a.llz=.07,a.rlz=-.08,a.lk=.19,a.rk=.18,a.lf=-.06,a.rf=-.08,a.bx=.035+F*.012,a.by=-.14,a.bz=G*.016,a.hx=-.02,a.hy=.11,a.hz=-G*.01,a.rootY=-.025+F*.005,a.lean=0,a.sway=G*.008,a.fall=0,o===1?(a.la=-.62,a.ra=-.34,a.le=-1.65,a.re=-1.88,a.laz=.06,a.raz=-.1,a.by=-.08,a.hy=.06,a.ll=-.09,a.rl=.08):o===2&&(a.by=-.38,a.hy=.28,a.la=-.2,a.ra=.05,a.le=-1.8,a.re=-1.95,a.ll=-.23,a.rl=.22,a.laz=.25,a.raz=-.27,a.lk=.24,a.rk=.17),v>.001){let H=s==="guard"?.64:1;a.ll+=C*.48*v*y*H,a.rl+=L*.48*v*y*H,a.llz+=C*M*.27*v,a.rlz+=L*M*.27*v,a.lk+=Math.max(0,-C)*.56*v,a.rk+=Math.max(0,-L)*.56*v,a.la-=C*.13*v,a.ra+=C*.13*v,a.by+=C*.085*v,a.hy-=C*.06*v,a.bx+=y*.055*v,a.bz-=M*.06*v,a.sway+=C*.019*v,a.rootY+=Math.abs(Math.cos(I))*.027*v-.018*v,a.lf=-a.ll*.35-a.lk*.3,a.rf=-a.rl*.35-a.rk*.3}let Z=e.attack;if(Z&&(s==="windup"||s==="active"||s==="recovery")){let H=s==="windup"?xi(q):s==="active"?1:1-xi(q),z=s==="active"?1-xi(Math.max(0,q-.68)/.32)*.12:s==="recovery"?.88*(1-xi(q)):0,se=Number.isFinite(e.weightShift)?e.weightShift:H,ee=Z.style??o,pe=Z.kind!=="light",me=(Z.comboIndex??e.comboIndex??e.attackSequence??0)%2?1:-1;if(a.rootY-=.045*H*(1-z),a.by=-.38*H+.75*z,a.hy=-a.by*.65,a.bx=-.035*H+.13*z,a.lean=.045*se,a.ll=-.2-.14*z,a.rl=.17+.1*z,a.lk=.22,a.rk=.23-.09*z,ee===2||Z.sweep)a.rl=-.2-.9*H-.43*z,a.rk=.15+1.62*H-1.52*z,a.rlz=Z.sweep?-.65*z:pe?-.32*z:-.1,a.bx=-.21*H,a.bz=-.11*z,a.by=Z.sweep?-.7*H+(1.1+(s==="active"?q*.65:.65))*z:-.32*H+.62*z,a.hy=-a.by*.55,a.la=-.35,a.ra=.65,a.le=-.94,a.re=-.9,a.laz=.45*H,a.raz=-.62*H,a.rootY+=.035*z,a.lk=.22,a.rf=-.32;else if(ee===0&&pe)a.ra=-.25*H-1.06*z,a.raz=-.22-.66*H+.55*z,a.ray=-.85*H+1.05*z,a.re=-1.9,a.la=-.36,a.le=-1.8,a.laz=.2,a.by=-.62*H+1*z,a.hy=-a.by*.55,a.bx=.02+.15*z,a.rootY-=.02*H,a.rl=.25-.17*z,a.rk=.24;else{let Ae=.28*H-1.86*z,Ce=-1.65*H+1.54*z;me>0?(a.ra=Ae,a.re=Ce,a.raz=-.05,a.ray=-.12*z):(a.la=Ae,a.le=Ce,a.laz=.05,a.lay=.12*z),a.by=me*(-.33*H+.62*z),a.hy=-a.by*.72,ee===1&&pe&&(a.la=Ae*.92,a.le=Ce-.14,a.laz=.08)}}if(s==="guard"||s==="guarding")a.la=-1.05,a.ra=-1.02,a.le=-1.9,a.re=-1.93,a.laz=-.1,a.raz=.1,a.lay=-.04,a.ray=.04,a.bx=.095,a.hx=.05,a.lk+=.08,a.rk+=.08,a.rootY-=.035;else if(s==="evade"||s==="evading"){let H=Math.sin(Math.PI*xi(q)),z=(e.dodgeX||0)*h-(e.dodgeZ||0)*c,se=(e.dodgeX||0)*c+(e.dodgeZ||0)*h;a.rootY=-.08-.26*H,a.bx=.22+.3*H,a.bz=-z*.32*H,a.by=-z*.25,a.hx=-.18,a.hy=-a.by*.6,a.ll=-.24-.42*H+se*.18,a.rl=-.34-.5*H-se*.16,a.lk=.45+.93*H,a.rk=.56+.95*H,a.la=-.4,a.ra=-.5,a.le=-1.35,a.re=-1.45,a.laz=.2+Math.max(0,z)*.4,a.raz=-.2+Math.min(0,z)*.4,a.lf=-.1,a.rf=-.1}else if(s==="switch"||s==="switching"){let H=Math.sin(xi(q)*Math.PI);a.by+=H*.55,a.hy=-a.by*.65,a.la=-.6,a.ra=-.65,a.le=-1.35,a.re=-1.45,a.rootY-=H*.045,a.ll-=H*.12,a.rl+=H*.12}else if(s==="stun"||s==="hitstun"){let H=1-xi(q);a.bx=-.35*H,a.bz=.12*H,a.hx=-.21*H,a.la=.2+.25*H,a.ra=.3+.32*H,a.le=-.8,a.re=-.62,a.rootY=-.05,a.ll=-.18,a.rl=.28,a.lk=.22,a.rk=.35}else s==="broken"||s==="posturebroken"?(a.rootY=-.37,a.bx=.55,a.hx=.25,a.ll=-.75,a.rl=-.35,a.lk=1.55,a.rk=1.05,a.la=.08,a.ra=-.1,a.le=-.48,a.re=-.55):s==="dead"&&(a.fall=1.49,a.rootY=.15,a.bx=.08,a.by=-.12,a.la=-.55,a.ra=.28,a.le=-.28,a.re=-.42,a.ll=.25,a.rl=-.3,a.lk=.35,a.rk=.5,a.hx=-.18);r.previousHealth!==null&&e.health<r.previousHealth&&(r.impact=1),s==="stun"&&r.previousState!==s&&(r.impact=1),r.impact*=Math.exp(-t*12),r.previousHealth=e.health,r.previousState=s,a.bz+=r.impact*.08,a.hx-=r.impact*.13;let j=r.ready?1-Math.exp(-t*(s==="active"?62:s==="stun"?30:17)):1;for(let H of iu)r.pose[H]=fm(r.pose[H],a[H],j);return r.ready=!0,r.pose}function au(r,e){let t=new Map;e.traverse(s=>{if(!s.isMesh||s.material.transparent)return;let a=`${s.geometry.uuid}/${s.material.uuid}/${s.castShadow}/${s.receiveShadow}`;t.has(a)||t.set(a,[]),t.get(a).push(s)});let n=[];for(let s of t.values()){if(s.length<2)continue;let a=s[0],o=new lr(a.geometry,a.material,s.length);o.castShadow=a.castShadow,o.receiveShadow=a.receiveShadow,o.frustumCulled=!1,o.instanceMatrix.setUsage(Xh);for(let l of s)l.layers.disableAll();r.add(o),n.push({mesh:o,parts:s})}function i(s){for(let a=s;a;a=a.parent)if(!a.visible)return!1;return!0}return{sync(){e.updateWorldMatrix(!0,!0);for(let{mesh:s,parts:a}of n){let o=0;for(let l of a)i(l)&&s.setMatrixAt(o++,l.matrixWorld);s.count=o,s.instanceMatrix.needsUpdate=!0}},dispose(){for(let{mesh:s}of n)s.dispose()}}}var gn=Math.PI*2,os=[14989680,10345430,12366061],Cn=(r,e,t)=>Math.max(e,Math.min(t,r)),gm=r=>(r=Cn(r,0,1),r*r*(3-2*r));function ou(r){let e=new ya({canvas:r,antialias:!0,alpha:!1,powerPreference:"high-performance"}),t=1,n=0,i=0;function s(){let x=Math.min(window.devicePixelRatio||1,1.75,Math.sqrt(24e5/(me*Ae)));e.setPixelRatio(x*t)}function a(x){if(x<=0||x>1){n=i=0;return}n=x>.026?n+x:Math.max(0,n-x*2),i=x<.0185?i+x:0,(n>=1.6&&t>.65||i>=6&&t<1)&&(t=Cn(t+(n>=1.6?-.15:.1),.65,1),n=i=0,s())}e.outputColorSpace=vt,e.toneMapping=Dh,e.toneMappingExposure=1.26,e.shadowMap.enabled=!0,e.shadowMap.type=Uh;let o=new Ma;o.background=new ze(1384493),o.fog=new xa(2505290,.026);let l=new bt(58,1,.08,110),c=new R(0,1.15,2.25),h=c.clone(),u=new R,d=new R,p=new R(0,1.1,3),f=new R,_=new R,m=new R,g=new R,v=new R,y=new R,M=new jn,I=[],C=Math.PI,L=Math.PI,F=.34,G=.34,q=!1,Z=!0,j=!1;l.position.set(.65,2.9,8.1),l.lookAt(c);let H=new Map,z=new Set,se=[],ee=[],pe={},me=1,Ae=1,Ce=null,ue=null;function le(x,S){return H.has(x)||H.set(x,S()),H.get(x)}function xe(x,S={}){let B=new La({color:x,roughness:.85,metalness:.06,...S});return z.add(B),B}function we(x,S={}){let B=new sr({color:x,...S});return z.add(B),B}function te(x,S,B,ie=[0,0,0],re=[1,1,1],Q=!0){let de=new Et(S,B);return de.position.set(...ie),de.scale.set(...re),de.castShadow=Q,de.receiveShadow=Q,x.add(de),de}let E=le("box",()=>new pn(1,1,1)),A=le("cylinder",()=>new At(1,1,1,12)),O=le("tapered",()=>new At(.85,1,1,10)),N=le("sphere",()=>new yi(1,12,9)),P=le("octa",()=>new ts(1,0)),D=[4868939,5592144,4738640,5264207,4540489,5854800].map(x=>xe(x)),T=xe(3554882),U=xe(2107952),X=xe(12098146,{roughness:.54,metalness:.48}),he=xe(10323547,{roughness:.7,metalness:.22}),W=we(16770467),oe=we(15561523,{transparent:!0,opacity:.62,depthWrite:!1,blending:pr}),ce=4817;function b(){return ce=ce*16807%2147483647,(ce-1)/2147483646}function V(x,S,B,ie,re=.035,Q=96){let de=te(x,le(`ring:${S}:${B}:${Q}`,()=>new rn(S,B,5,Q)),ie,[0,re,0],[1,1,1],!1);return de.rotation.x=Math.PI/2,de}function k(x,S,B){return le(`tile:${x}:${S}:${B}`,()=>{let re=gn/B,Q=new fn;Q.absarc(0,0,S,.012,re-.012,!1),Q.lineTo(Math.cos(re-.012)*x,Math.sin(re-.012)*x),Q.absarc(0,0,x,re-.012,.012,!0),Q.closePath();let de=new Yn(Q,{depth:.075,bevelEnabled:!1,curveSegments:3});return de.rotateX(-Math.PI/2),de})}o.add(new Da(11124694,4996656,1.85));let J=new ss(12177898,2.45);J.position.set(-8,16,-12),J.castShadow=!0,J.shadow.mapSize.set(1024,1024),Object.assign(J.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:48}),J.shadow.bias=-8e-4,J.shadow.normalBias=.035,o.add(J);let $=new ss(15121803,.88);$.position.set(7,5,10),o.add($),te(o,le("land",()=>new At(20,22,.6,64)),xe(1449765),[0,-.7,0],[1,1,1]),te(o,le("foundation",()=>new At(9.75,10.15,.58,96)),T,[0,-.32,0]),te(o,le("floor",()=>new At(9.25,9.25,.16,96)),U,[0,-.09,0]),[[1.7,3.28,24],[3.34,5.1,32],[5.16,6.86,40],[6.92,8.7,48]].forEach(([x,S,B],ie)=>{let re=k(x,S,B);for(let Q=0;Q<B;Q++){let de=te(o,re,D[Math.floor(b()*D.length)],[0,-.05+b()*.014,0]);de.rotation.y=Q*gn/B+(ie%2?.075:0),de.castShadow=!1}}),te(o,le("centerdisc",()=>new At(1.64,1.64,.08,64)),D[3],[0,-.007,0]),[1.7,3.3,5.12,6.9,8.74,9.13].forEach((x,S)=>V(o,x,S===5?.035:.014,S>3?X:he)),V(o,.82,.016,he,.045,64),V(o,1.48,.018,X,.045,64);for(let x=0;x<8;x++){let S=new Ke;S.rotation.y=x*gn/8;let B=te(S,E,he,[0,.042,.95],[.018,.008,.85],!1);B.rotation.y=.32;let ie=te(S,E,he,[0,.042,.95],[.018,.008,.85],!1);ie.rotation.y=-.32,o.add(S)}for(let x=0;x<24;x++){let S=new Ke,B=x*gn/24;S.position.set(Math.sin(B)*7.82,.046,Math.cos(B)*7.82),S.rotation.y=B,te(S,E,he,[0,0,0],[.025,.008,.32],!1),te(S,E,he,[.085,0,-.04],[.18,.008,.022],!1),te(S,E,he,[-.07,0,.09],[.13,.008,.022],!1),x%2===0&&te(S,E,he,[.08,0,.13],[.02,.008,.12],!1),o.add(S)}for(let x=0;x<48;x++){let S=gn*x/48,B=te(o,E,x%3?T:D[1],[Math.sin(S)*9.27,.09,Math.cos(S)*9.27],[1.17,.23,.48]);B.rotation.y=S}let _e=[];for(let x=0;x<30;x++){let S=b()*gn,B=2+b()*6.4,ie=Math.sin(S)*B,re=Math.cos(S)*B;_e.push(ie,.041,re,ie+.15+b()*.25,.041,re+.08+b()*.24)}let ve=le("cracks",()=>new Je().setAttribute("position",new De(_e,3))),ge=new cr({color:2370350,transparent:!0,opacity:.75});z.add(ge),o.add(new Ta(ve,ge));let{moonHalo:Se}=nu({scene:o,geometry:le,material:xe,basic:we,mesh:te,terrainMaterials:D});function Ee(x,S,B){let ie=new Ke;ie.position.set(x,0,S),te(ie,A,T,[0,.16,0],[.44,.32,.44]),te(ie,A,U,[0,.63,0],[.16,.8,.16]),te(ie,le("bowl",()=>new At(.36,.22,.25,10)),X,[0,1.03,0]);let re=te(ie,P,oe,[0,1.43,0],[.23,.52,.23],!1),Q=te(ie,P,W,[.015,1.34,0],[.12,.3,.12],!1),de=new Oa(16753489,8.5,7,2);de.position.set(0,1.6,0),ie.add(de),ee.push({outer:re,inner:Q,light:de,phase:B,x,z:S}),o.add(ie)}Ee(-7.8,-5.3,.5),Ee(7.8,-5.3,2.3),Ee(-6.5,7.2,4.5),Ee(6.5,7.2,7.1);let Ie=100,ye=new Float32Array(Ie*3),Re=[];for(let x=0;x<Ie;x++){let S=b()*gn,B=2+b()*11;Re.push({x:Math.sin(S)*B,z:Math.cos(S)*B,y:b()*5.5,speed:.12+b()*.25,phase:b()*gn})}let We=le("dust",()=>new Je().setAttribute("position",new ht(ye,3))),Rt=new hr({color:13806706,size:.025,transparent:!0,opacity:.52,depthWrite:!1,blending:pr});z.add(Rt),o.add(new Yr(We,Rt)),o.updateMatrixWorld(!0);let In=new Set(ee.flatMap(x=>[x.outer,x.inner])),mt=new Map;o.traverse(x=>{if(!x.isMesh||In.has(x)||x.userData.noStaticBatch)return;x.geometry.computeBoundingBox();let S=x.geometry.boundingBox.clone().applyMatrix4(x.matrixWorld),B=S.getCenter(new R);if(!x.userData.noCameraCollision&&S.max.y>.65&&S.min.y<7&&Math.hypot(B.x,B.z)<16)if(x.userData.cameraCollisionBoxes)for(let re of x.userData.cameraCollisionBoxes)I.push(re.clone().applyMatrix4(x.matrixWorld).expandByScalar(.24));else I.push(S.expandByScalar(.24));let ie=`${x.geometry.uuid}:${x.material.uuid}:${x.castShadow}:${x.receiveShadow}`;mt.has(ie)||mt.set(ie,[]),mt.get(ie).push(x)});for(let x of mt.values()){if(x.length<2)continue;let S=x[0],B=new lr(S.geometry,S.material,x.length);B.castShadow=S.castShadow,B.receiveShadow=S.receiveShadow,x.forEach((ie,re)=>{B.setMatrixAt(re,ie.matrixWorld),ie.removeFromParent()}),B.instanceMatrix.needsUpdate=!0,B.computeBoundingSphere(),o.add(B),se.push(B)}function ot(x,S,B,ie,re,Q,de,Me,Te,ae=!1){let Oe=new Ke;Oe.position.set(S,B,ie),x.add(Oe);let Le=le("fighter-muscle",()=>new fi([new fe(0,-.5),new fe(.65,-.47),new fe(.94,-.27),new fe(1,.08),new fe(.75,.43),new fe(0,.5)],10));te(Oe,Le,Me,[0,-re/2,0],[ae?.126:.088,re,ae?.118:.082]);let Fe=new Ke;Fe.position.y=-re,Oe.add(Fe),te(Fe,Le,ae?Me:de,[0,-Q/2,0],[ae?.091:.067,Q,ae?.093:.067]),te(Fe,O,Te,[0,-Q*.66,0],[ae?.098:.075,Q*.54,ae?.098:.075]);for(let Ue of[-.06,.035]){let qe=te(Fe,A,Me,[0,-Q*.66+Ue,0],[ae?.1:.077,.012,ae?.1:.077]);qe.rotation.z=.08}let He=new Ke;return He.position.y=-Q,Fe.add(He),ae?(te(He,N,Me,[0,.007,.07],[.089,.065,.155]),te(He,E,Te,[0,-.028,.08],[.17,.025,.27])):(te(He,N,de,[0,-.025,.013],[.067,.084,.067]),te(He,E,Te,[0,-.004,.055],[.1,.09,.025])),{pivot:Oe,joint:Fe,foot:He}}function sn(x){let S=x==="enemy",B=new Ke,ie=xe(S?10521207:11898217,{roughness:.72,metalness:0}),re=xe(S?4272956:2704200,{roughness:.96,metalness:0}),Q=xe(S?6510939:5661534,{roughness:.98,metalness:0}),de=xe(S?2631726:2437943,{roughness:.94,metalness:0}),Me=xe(S?11575690:13220768,{roughness:1,metalness:0}),Te=xe(S?6380105:5989725,{roughness:.55,metalness:.55}),ae=xe(S?11901543:10848850,{roughness:.55,metalness:.62}),Oe=xe(S?9588285:os[0],{roughness:.88,metalness:.12}),Le=xe(S?10329232:1515041,{roughness:.9}),Fe=we(S?14459754:2566953),He=le("fighter-tattered-panel",()=>{let et=new fn;et.moveTo(-.5,0),et.lineTo(.5,0),et.lineTo(.43,-.83),et.lineTo(.23,-.96),et.lineTo(.13,-.84),et.lineTo(-.08,-1),et.lineTo(-.22,-.89),et.lineTo(-.43,-.96),et.closePath();let Ui=new Yn(et,{depth:.014,bevelEnabled:!1});return Ui.translate(0,0,-.007),Ui}),Ue=(et,Ui,Za,_u,yu,xu,Mu)=>{let ys=new Ke;return ys.position.set(Za,_u,yu),et.add(ys),te(ys,He,Ui,[0,0,0],[xu,Mu,1]),ys},qe=new Ke;qe.position.y=1.05,B.add(qe);let st=le("fighter-torso",()=>new fi([new fe(0,-.21),new fe(.2,-.2),new fe(.225,-.08),new fe(.29,.14),new fe(.315,.28),new fe(.2,.39),new fe(0,.4)],12));te(qe,st,re,[0,0,0],[1,1,.62]);let Be=te(qe,E,Me,[-.065,.16,.175],[.06,.48,.026]);Be.rotation.z=-.37;let Ne=te(qe,E,Q,[.075,.16,.185],[.1,.47,.032]);Ne.rotation.z=.32,Ue(qe,Q,0,.32,-.18,.52,.54);let Ct=te(qe,le("fighter-seal",()=>new rn(.074,.008,5,20)),ae,[0,.14,-.202],[1,1.15,1]);te(qe,E,ae,[0,.14,-.208],[.012,.13,.012]),te(qe,E,ae,[0,.14,-.208],[.11,.012,.012]),te(qe,A,ie,[0,.445,0],[.072,.12,.072]),te(qe,O,Q,[0,.39,-.035],[.135,.13,.13]);let an=te(qe,le("fighter-cord",()=>new rn(.115,.012,5,20,Math.PI)),ae,[0,.34,.163],[1,1,1]);an.rotation.z=Math.PI,te(qe,P,ae,[0,.2,.205],[.027,.055,.017]);let at=new Ke;at.position.set(0,.59,0),qe.add(at),te(at,N,ie,[0,.024,0],[.131,.175,.127]),te(at,N,ie,[0,-.064,.025],[.105,.09,.105]),te(at,N,Le,[0,.105,-.033],[.137,.12,.125]),te(at,N,Le,[0,.205,-.058],[.057,.06,.06]),te(at,A,ae,[0,.192,-.058],[.058,.015,.061]),te(at,E,S?Te:re,[0,.074,.112],[.235,.032,.027]);for(let et of[-1,1])te(at,N,ie,[et*.13,.015,-.005],[.022,.045,.024]),te(at,E,Fe,[et*.052,.05,.127],[.026,.009,.009],!1);te(at,P,S?Te:ie,[0,.012,.13],[.026,.048,.033]),S&&te(at,O,Le,[0,-.1,.055],[.075,.16,.065]),te(B,O,de,[0,.87,0],[.235,.22,.17]),te(B,A,Oe,[0,.96,0],[.245,.075,.188]),te(B,E,ae,[0,.96,.195],[.105,.085,.028]);let Yt=Ue(B,S?Me:Oe,-.11,.93,.176,.14,.53),Qn=Ue(B,Q,.11,.93,.175,.1,.44),Ln=Ue(B,re,-.12,.94,-.16,.24,.56),Un=Ue(B,Q,.12,.94,-.16,.22,.5),xt=ot(qe,-.315,.33,0,.29,.29,ie,re,Me),Tr=ot(qe,.315,.33,0,.29,.29,ie,re,Me),vs=ot(B,-.15,.87,0,.37,.38,ie,de,Me,!0),_s=ot(B,.15,.87,0,.37,.38,ie,de,Me,!0);te(xt.pivot,N,Te,[0,-.04,-.008],[.127,.12,.13]),te(xt.pivot,E,ae,[0,-.09,-.126],[.15,.025,.018]),te(Tr.pivot,H.get("fighter-muscle"),Q,[0,-.12,0],[.098,.23,.09]);for(let et of[xt,Tr])te(et.joint,E,Te,[0,-.16,-.065],[.09,.15,.027]),te(et.joint,E,ae,[0,-.16,-.083],[.015,.115,.01]);let Dn=new Ke;[-1,1].forEach(et=>{let Ui=te(Dn,O,Te,[et*.28,.38,-.045],[.17,.15,.22]);Ui.rotation.z=et*.45;let Za=te(Dn,P,ae,[et*.32,.51,-.08],[.045,.19,.055]);Za.rotation.z=et*-.4}),te(Dn,O,Te,[0,.39,-.105],[.18,.25,.14]),qe.add(Dn),Dn.visible=!1,o.add(B);let Ge=new Ke,Pi=we(S?13268563:os[0],{transparent:!0,opacity:.65,depthWrite:!1});V(Ge,.49,.012,Pi,.052,48),V(Ge,.55,.006,Pi,.052,48);let Ut=te(Ge,le("direction",()=>new gi(.065,.15,3)),Pi,[0,.05,.68],[1,1,1],!1);Ut.rotation.x=Math.PI/2,o.add(Ge);let on=te(o,le("shadow",()=>new qn(.48,32)),we(527118,{transparent:!0,opacity:.3,depthWrite:!1}),[0,.04,0],[1,1,1],!1);on.rotation.x=-Math.PI/2;let ei=new Ke,ti=te(ei,le("healthback",()=>new nn(.85,.052)),we(725013,{transparent:!0,opacity:.8,depthTest:!1}),[0,0,0],[1,1,1],!1),Ii=te(ei,le("healthfill",()=>new nn(.81,.025)),we(S?14652778:12963758,{depthTest:!1}),[0,0,.002],[1,1,1],!1);ti.renderOrder=5,Ii.renderOrder=6,o.add(ei);let tt=new Float32Array(360),Dt=new Je;Dt.setAttribute("position",new ht(tt,3)),H.set(`${x}:cone`,Dt);let Li=we(S?15379812:14146489,{transparent:!0,opacity:.15,side:dr,depthWrite:!1}),Ht=te(o,Dt,Li,[0,.063,0],[1,1,1],!1),Pt=new Float32Array(129),gt=new Je;gt.setAttribute("position",new ht(Pt,3)),H.set(`${x}:arc`,gt);let Zt=new cr({color:S?16762233:16050635,transparent:!0,opacity:.7,depthWrite:!1});z.add(Zt);let $e=new qr(gt,Zt);return $e.position.y=.075,o.add($e),{root:B,body:qe,head:at,leftArm:xt,rightArm:Tr,leftLeg:vs,rightLeg:_s,sash:Yt,sash2:Qn,coatLeft:Ln,coatRight:Un,belt:Oe,skin:ie,cloth:re,armor:Te,footMat:Pi,footprint:Ge,shadow:on,indicator:ei,healthFill:Ii,cone:Ht,coneGeo:Dt,coneMat:Li,conePositions:tt,arc:$e,arcGeo:gt,arcMat:Zt,arcPositions:Pt,mantle:Dn,motion:ru(),walkPhase:0}}pe.player=sn("player"),pe.enemy=sn("enemy");let Y=Object.values(pe).map(x=>au(o,x.root)),jt=180,qt=new Float32Array(jt*3).fill(-99),it=new Float32Array(jt*3),yr=Array.from({length:jt},()=>({life:0,duration:1,vx:0,vy:0,vz:0,r:1,g:1,b:1})),Ei=le("particles",()=>new Je().setAttribute("position",new ht(qt,3)).setAttribute("color",new ht(it,3))),xr=new hr({size:.065,vertexColors:!0,transparent:!0,opacity:.95,depthWrite:!1,blending:pr});z.add(xr);let Mr=new Yr(Ei,xr);Mr.frustumCulled=!1,o.add(Mr);let Ti=Array.from({length:8},()=>{let x=we(16767126,{transparent:!0,opacity:0,depthWrite:!1}),S=V(o,1,.018,x,.08,64);return S.visible=!1,{item:S,mat:x,life:0,duration:.5,radius:1}}),Sr=0,ps=0;function ms(x){if(!x||!Number.isFinite(x.x)||!Number.isFinite(x.z))return;let S=x.type;if(!["hit","block","deflect","break","style","phase","win","evade","strike"].includes(S))return;let B=x.kind==="heavy"||x.kind==="hybrid"||x.damage>=20,ie=pe[x.actor],re=ie?ie.root.rotation.y:0,Q=new ze(S==="deflect"?14219007:S==="style"?os[x.style??0]:S==="break"||S==="phase"?15301198:16764548),de=S==="strike"?0:S==="evade"?5:S==="deflect"||S==="break"?28:S==="win"?48:B?20:9;for(let Me=0;Me<de;Me++){let Te=Sr++%jt,ae=yr[Te],Oe=S==="hit"?re+(b()-.5)*2.6:b()*gn,Le=(B?1.4:.7)+b()*2.5;ae.life=ae.duration=.22+b()*.42,ae.vx=Math.sin(Oe)*Le,ae.vz=Math.cos(Oe)*Le,ae.vy=1.2+b()*2.2,ae.r=Q.r,ae.g=Q.g,ae.b=Q.b;let Fe=S==="hit"?-.28:0;qt[Te*3]=x.x+Math.sin(re)*Fe,qt[Te*3+1]=S==="style"||S==="evade"?.1:.8+b()*.35,qt[Te*3+2]=x.z+Math.cos(re)*Fe}if(["deflect","break","style","phase","win"].includes(S)){let Me=Ti[ps++%Ti.length];Me.life=Me.duration=S==="phase"||S==="win"?.8:.4,Me.radius=S==="phase"||S==="win"?3.8:1.35,Me.item.position.set(x.x,.09,x.z),Me.mat.color.copy(Q),Me.item.visible=!0}}function _n(x,S,B){let ie=String(S.state||"idle").toLowerCase(),re=S.attack,Q=re&&(ie==="windup"||ie==="active")&&(B||ie==="active");if(x.cone.visible=x.arc.visible=!!Q,!Q)return;let de=re.range||1.7,Me=Cn(re.arc||1.4,.1,gn);if(x.tellRadius!==de||x.tellArc!==Me){x.tellRadius=de,x.tellArc=Me;for(let ae=0;ae<40;ae++){let Oe=-Me/2+Me*ae/40,Le=-Me/2+Me*(ae+1)/40,Fe=ae*9;x.conePositions[Fe]=0,x.conePositions[Fe+1]=0,x.conePositions[Fe+2]=0,x.conePositions[Fe+3]=Math.sin(Oe)*de,x.conePositions[Fe+4]=0,x.conePositions[Fe+5]=Math.cos(Oe)*de,x.conePositions[Fe+6]=Math.sin(Le)*de,x.conePositions[Fe+7]=0,x.conePositions[Fe+8]=Math.cos(Le)*de}x.arcPositions[0]=0,x.arcPositions[1]=0,x.arcPositions[2]=0;for(let ae=0;ae<=40;ae++){let Oe=-Me/2+Me*ae/40;x.arcPositions[(ae+1)*3]=Math.sin(Oe)*de,x.arcPositions[(ae+1)*3+1]=0,x.arcPositions[(ae+1)*3+2]=Math.cos(Oe)*de}x.arcPositions[126]=x.arcPositions[127]=x.arcPositions[128]=0,x.coneGeo.attributes.position.needsUpdate=!0,x.arcGeo.attributes.position.needsUpdate=!0,x.coneGeo.computeBoundingSphere(),x.arcGeo.computeBoundingSphere()}x.cone.position.set(S.x,.063,S.z),x.arc.position.set(S.x,.078,S.z),x.cone.rotation.y=x.arc.rotation.y=S.yaw||0;let Te=Cn((S.stateTime||0)/(S.stateDuration||re.windup||1),0,1);x.coneMat.opacity=B?ie==="active"?.27:.075+.14*Te:.1,x.arcMat.opacity=ie==="active"?.95:.35+.55*Te,x.coneMat.color.setHex(ie==="active"?B?15499339:15129792:re.sweep?13991528:15314276)}function wi(x,S,B,ie,re,Q){if(!S){x.root.visible=x.footprint.visible=x.shadow.visible=x.indicator.visible=!1;return}x.root.visible=x.footprint.visible=x.shadow.visible=!0;let de=String(S.state||"idle").toLowerCase(),Me=Cn(S.style||0,0,2),Te=re&&Q==="boss"?1.15:1;x.root.scale.setScalar(Te),x.mantle.visible=re&&Q==="boss",x.belt.color.setHex(re?Q==="boss"?11031612:8491405:os[Me]),x.footMat.color.setHex(S.invulnerable?14742760:re?14518632:os[Me]);let ae=su(x.motion,S,B,ie,re),Oe=x.motion.stanceTime,Le=x.motion.speed;x.walkPhase=x.motion.phase;let Fe=Math.sin(S.yaw||0),He=Math.cos(S.yaw||0);x.root.position.set(S.x+Fe*ae.lean+He*ae.sway,ae.rootY,S.z+He*ae.lean-Fe*ae.sway),x.root.rotation.set(0,S.yaw||0,ae.fall),x.body.rotation.set(ae.bx,ae.by,ae.bz),x.head.rotation.set(ae.hx,ae.hy,ae.hz),x.leftArm.pivot.rotation.set(ae.la,ae.lay,ae.laz),x.rightArm.pivot.rotation.set(ae.ra,ae.ray,ae.raz),x.leftArm.joint.rotation.x=ae.le,x.rightArm.joint.rotation.x=ae.re,x.leftLeg.pivot.rotation.set(ae.ll,0,ae.llz),x.rightLeg.pivot.rotation.set(ae.rl,0,ae.rlz),x.leftLeg.joint.rotation.x=ae.lk,x.rightLeg.joint.rotation.x=ae.rk,x.leftLeg.foot.rotation.x=ae.lf,x.rightLeg.foot.rotation.x=ae.rf,x.sash.rotation.set(Math.sin(Oe*3.2+x.walkPhase)*.035-Le*.025,ae.by*.1,-.12+Math.sin(x.walkPhase)*Math.min(Le,4)*.014),x.sash2.rotation.set(-Math.sin(Oe*2.8+x.walkPhase)*.03-Le*.018,-ae.by*.08,.12-Math.sin(x.walkPhase)*Math.min(Le,4)*.012),x.coatLeft.rotation.set(.045+Le*.032+Math.max(0,ae.ll)*.18,ae.by*.12,-.035+ae.bz*.2),x.coatRight.rotation.set(.035+Le*.028+Math.max(0,ae.rl)*.18,-ae.by*.1,.035+ae.bz*.2),x.cloth.emissive.setRGB(x.motion.impact*.12,x.motion.impact*.035,x.motion.impact*.015),x.skin.emissive.setRGB(x.motion.impact*.055,x.motion.impact*.018,0),x.footprint.position.set(S.x,0,S.z),x.footprint.rotation.y=S.yaw||0,x.footMat.opacity=de==="dead"?.2:.65,x.shadow.position.set(S.x,.04,S.z),x.indicator.visible=S.health>0&&(re||S.health<S.maxHealth),x.indicator.position.set(S.x,Te*2.15,S.z),x.indicator.quaternion.copy(l.quaternion);let Ue=Cn(S.health/(S.maxHealth||100),0,1);x.healthFill.scale.x=Math.max(.001,Ue),x.healthFill.position.x=-(1-Ue)*.405,_n(x,S,re)}function Ai(x){let S=x?.player;if(!S)return;let B=x.enemy,ie=B?B.x-S.x:0,re=B?B.z-S.z:0;C=L=Math.hypot(ie,re)>.1?Math.atan2(ie,re):S.yaw??Math.PI,F=G=.34,Z=!0,q=!0,p.set(S.x,1.1,S.z),br(x,0,!0,!0)}function fs(x,S){!Number.isFinite(x)||!Number.isFinite(S)||(L-=x*.004,L=Math.atan2(Math.sin(L),Math.cos(L)),G=Cn(G+S*.003,-.08,.62))}function Ri(x){v.subVectors(l.position,x);let S=v.length();if(S<.001)return;v.multiplyScalar(1/S),M.set(x,v);let B=S;for(let ie of I){if(!M.intersectBox(ie,y))continue;let re=y.distanceTo(x);re<B&&(B=Math.max(.12,re-.035))}j=B<S-.001,j&&l.position.copy(x).addScaledVector(v,B),l.position.y=Math.max(.38,l.position.y)}function br(x,S,B,ie=!1){let re=x.player;if(!re)return;if(!q){Ai(x);return}let Q=x.enemy;Z=!!B&&!!Q;let de=ie?1:1-Math.exp(-S*9),Me=ie?1:1-Math.exp(-S*14),Te=ie?1:1-Math.exp(-S*12);m.set(re.x,1.1,re.z),p.lerp(m,Me);let ae=L,Oe=G,Le=0;if(Z){let Un=Q.x-re.x,xt=Q.z-re.z;Le=Math.hypot(Un,xt),ae=Le>.65?Math.atan2(Un,xt):C,Oe=.34}let Fe=Math.atan2(Math.sin(ae-C),Math.cos(ae-C));C+=Fe*de,C=Math.atan2(Math.sin(C),Math.cos(C)),F+=(Oe-F)*de,Z&&(L=C,G=F);let He=Math.sin(C),Ue=Math.cos(C),qe=-Ue,st=He,Be=l.aspect<.85,Ne=Be?5.1:4.6,Ct=Z?1-Cn((Le-1)/4,0,1):0,an=(Be?1.05:1.45)+Ct*.6,at=Z?Math.min(.75,Le*.32):.45,Yt=Math.cos(F)*Ne;f.set(p.x-He*Yt+qe*an,p.y+Math.sin(F)*Ne,p.z-Ue*Yt+st*an),_.set(p.x+He*at+qe*an*.3,p.y+.05,p.z+Ue*at+st*an*.3),ie?(l.position.copy(f),c.copy(_)):(l.position.lerp(f,Te),c.lerp(_,Me)),Ri(m),h.copy(c);let Qn=m.distanceTo(l.position),Ln=1-gm((Qn-1.8)/2.2);Ln>0&&(u.subVectors(m,l.position).normalize(),Z&&(d.set(Q.x,1.1,Q.z).sub(l.position).normalize(),u.add(d).normalize()),u.multiplyScalar(Math.max(.5,l.position.distanceTo(c))).add(l.position),h.lerp(u,Ln)),l.lookAt(h),l.updateMatrixWorld(!0),Se.quaternion.copy(l.quaternion)}function Ci(){l.getWorldDirection(g);let x=Math.hypot(g.x,g.z),S=x>1e-4?g.x/x:Math.sin(C),B=x>1e-4?g.z/x:Math.cos(C);return{forward:{x:S,z:B},right:{x:-B,z:S}}}function gs(x){l.updateMatrixWorld(!0);let S=re=>({x:re.x,y:re.y,z:re.z}),B=(re,Q)=>re?S(new R(re.x,Q,re.z).project(l)):null,ie=x?.mode==="boss"?2.16:1.88;return{type:"perspective",perspective:l.isPerspectiveCamera,fov:l.fov,aspect:l.aspect,locked:Z,obstructed:j,position:S(l.position),target:S(h),player:B(x?.player,1),enemy:B(x?.enemy,ie*.52),playerBounds:{feet:B(x?.player,.03),head:B(x?.player,1.88)},enemyBounds:{feet:B(x?.enemy,.03),head:B(x?.enemy,ie)}}}function Er(){let x=r.getBoundingClientRect();me=Math.max(1,x.width),Ae=Math.max(1,x.height),s(),e.setSize(me,Ae,!1),l.aspect=me/Ae,l.fov=l.aspect<.85?66:l.aspect<1.2?62:58,l.updateProjectionMatrix()}function w(x,S=1/60,B=0,ie=!0){S=Cn(S||0,0,.1),B=Number.isFinite(B)?B:x.elapsed||0,(Ce!==x.mode||ue&&ue!=="playing"&&x.result==="playing")&&(Ce=x.mode,Ai(x)),ue=x.result;let re=!x.presentationPlaying&&l.aspect>1.25?-Math.min(10,l.aspect*5):0;l.filmOffset!==re&&(l.filmOffset=re,l.updateProjectionMatrix()),br(x,S,ie),wi(pe.player,x.player,S,B,!1,x.mode),wi(pe.enemy,x.enemy,S,B,!0,x.mode);for(let Q of Y)Q.sync();ee.forEach(Q=>{let de=1+Math.sin(B*8.5+Q.phase)*.12+Math.sin(B*17+Q.phase)*.05;Q.outer.scale.set(.23*(2-de),.52*de,.23*(2-de)),Q.outer.rotation.y=B*.6+Q.phase,Q.inner.scale.y=.3*de,Q.light.intensity=8.5*de});for(let Q=0;Q<Ie;Q++){let de=Re[Q];ye[Q*3]=de.x+Math.sin(B*.25+de.phase)*.28,ye[Q*3+1]=(de.y+B*de.speed)%5.5,ye[Q*3+2]=de.z+Math.cos(B*.2+de.phase)*.15}We.attributes.position.needsUpdate=!0;for(let Q=0;Q<jt;Q++){let de=yr[Q];if(de.life<=0){qt[Q*3+1]=-99;continue}de.life-=S,de.vy-=S*5,qt[Q*3]+=de.vx*S,qt[Q*3+1]+=de.vy*S,qt[Q*3+2]+=de.vz*S;let Me=Math.max(0,de.life/de.duration);it[Q*3]=de.r*Me,it[Q*3+1]=de.g*Me,it[Q*3+2]=de.b*Me}Ei.attributes.position.needsUpdate=!0,Ei.attributes.color.needsUpdate=!0;for(let Q of Ti){if(Q.life<=0){Q.item.visible=!1;continue}Q.life-=S;let de=1-Q.life/Q.duration;Q.item.scale.setScalar(.25+de*Q.radius),Q.mat.opacity=(1-de)*.7}e.render(o,l)}function K(){for(let x of Y)x.dispose();se.forEach(x=>x.dispose()),H.forEach(x=>x.dispose()),z.forEach(x=>x.dispose()),J.shadow.map?.dispose(),J.shadow.mapPass?.dispose(),e.dispose()}return Er(),{render:w,resize:Er,burst:ms,dispose:K,stats:()=>({renderScale:t,pixelRatio:e.getPixelRatio(),calls:e.info.render.calls,triangles:e.info.render.triangles,geometries:e.info.memory.geometries,staticBatches:se.length}),resetCamera:Ai,orbit:fs,movementBasis:Ci,cameraSnapshot:gs,trackFrameTime:a}}function lu(){let r,e,t,n=!0,i,s=()=>n&&r?.state==="running"&&!document.hidden;function a(h,u,d,p,f="sine",_=0){if(!s())return;let m=r.currentTime+_,g=r.createOscillator(),v=r.createGain();g.type=f,g.frequency.setValueAtTime(h,m),g.frequency.exponentialRampToValueAtTime(u,m+d),v.gain.setValueAtTime(1e-4,m),v.gain.exponentialRampToValueAtTime(p,m+.006),v.gain.exponentialRampToValueAtTime(1e-4,m+d),g.connect(v).connect(e),g.start(m),g.stop(m+d+.01),g.onended=()=>{g.disconnect(),v.disconnect()}}function o(h,u,d,p){if(!s())return;let f=r.currentTime,_=r.createBufferSource(),m=r.createBiquadFilter(),g=r.createGain();_.buffer=t,m.type="bandpass",m.Q.value=.8,m.frequency.setValueAtTime(d,f),m.frequency.exponentialRampToValueAtTime(p,f+h),g.gain.setValueAtTime(1e-4,f),g.gain.exponentialRampToValueAtTime(u,f+.009),g.gain.exponentialRampToValueAtTime(1e-4,f+h),_.connect(m).connect(g).connect(e),_.start(f,Math.random()*.45,h),_.onended=()=>{_.disconnect(),m.disconnect(),g.disconnect()}}function l(h,u,d){for(let[p,f,_]of[[1,1,1],[2.39,.31,.65],[3.07,.18,.4],[4.16,.08,.22]])a(h*p,h*p*.995,u*_,d*f)}let c=0;return{async unlock(){try{if(!r){r=new(window.AudioContext||window.webkitAudioContext)({latencyHint:"interactive"}),e=r.createGain(),e.gain.value=n?.36:0,e.connect(r.destination),t=r.createBuffer(1,r.sampleRate,r.sampleRate);let h=t.getChannelData(0);for(let u=0;u<h.length;u++)h[u]=Math.random()*2-1}if(await r.resume(),!i){let h=()=>l([73.42,110,82.41,73.42][c++%4],3.1,.047);h(),i=setInterval(h,12500)}}catch{}},setEnabled(h){n=h,e&&e.gain.setTargetAtTime(h?.36:0,r.currentTime,.025)},step(h){o(.085,h*.15,1200,350),a(82,45,.085,h*.07)},event(h){let u=h.kind==="heavy"||h.kind==="hybrid"||h.damage>=20,d=h.actor==="enemy"?.84:1;switch(h.type){case"strike":o(u?.16:.09,u?.34:.23,620*d,(u?1550:2600)*d);break;case"hit":o(u?.14:.083,u?.72:.47,2200*d,360),a((u?118:170)*d,u?39:64,u?.2:.11,u?.58:.34);break;case"block":o(.08,.36,2100,720),a(238,92,.13,.2,"triangle");break;case"deflect":o(.045,.32,4200,1800),l(836,.72,.17);break;case"evade":o(.19,.19,1500,430);break;case"style":l([330,392,440][h.style]||330,.35,.08);break;case"break":o(.24,.54,1750,260),a(95,31,.33,.41);break;case"phase":l(65.41,2.3,.24);break;case"win":l(196,1.7,.15),a(293.66,293.66,1.3,.12,"sine",.22);break;case"lose":l(73.42,2.2,.18);break}},dispose(){clearInterval(i),r?.close()}}}function cu({root:r,button:e,onReset:t,onChange:n,onNotice:i}){let s=()=>document.fullscreenElement===r||document.webkitFullscreenElement===r,a=!1,o=s();function l(){let h=s();document.body.classList.toggle("is-fullscreen",h),e.setAttribute("aria-pressed",String(h)),e.setAttribute("aria-label",h?"Exit full screen":"Enter full screen"),e.title=h?"Exit full screen":"Enter full screen";let u=o;o=h,t(),n({enabled:h,exited:u&&!h})}async function c(){if(!a){a=!0,t();try{if(s()){let h=document.exitFullscreen||document.webkitExitFullscreen;h&&await h.call(document)}else{let h=r.requestFullscreen||r.webkitRequestFullscreen;if(!h)throw new Error("Fullscreen unavailable");await h.call(r)}}catch{i("Use the app\u2019s expand control, or open this game in your browser for full screen.",4),n({enabled:s(),exited:!1})}finally{a=!1}}}return e.addEventListener("click",c),document.addEventListener("fullscreenchange",l),document.addEventListener("webkitfullscreenchange",l),e.setAttribute("aria-pressed",String(s())),{active:s,toggle:c,get busy(){return a}}}var ke=r=>document.getElementById(r),Tt=ke("arena"),Pe=new Ms("sparring"),hs=lu(),kt;try{kt=ou(Tt)}catch(r){let e=document.createElement("div");e.className="browser-error",e.textContent="The courtyard needs WebGL 2. Try a current Chrome, Edge, Firefox or Safari with hardware acceleration enabled.",document.body.append(e),console.error(r)}var pt=!1,ct=!1,us="sparring",Ga=0,Zn=!1,zt=!0,Va=performance.now(),cs=0,Xt=null,Ha=0,qa=!1,vr=0,Wa=-1,hu="",$n=null,Jn=null,Bt=new Set,Pn={x:0,z:0},Si={hits:0,deflects:0,start:0};function Kn(r,e=1.4){ke("combat-message").classList.remove("app-notice"),ke("combat-message").textContent=r,ke("combat-message").classList.add("visible"),Ha=cs+e}function bi(){Bt.clear(),Pn.x=0,Pn.z=0,Pe.setGuard(!1),Pe.player.buffer=null;let r=Xt;Xt=null,r&&Tt.hasPointerCapture(r.id)&&Tt.releasePointerCapture(r.id);let e=$n,t=Jn;$n=null,Jn=null;let n=ke("joystick");e!==null&&n?.hasPointerCapture(e)&&n.releasePointerCapture(e),t?.element.hasPointerCapture(t.id)&&t.element.releasePointerCapture(t.id),ke("joystick-nub")&&(ke("joystick-nub").style.transform="translate(-50%, -50%)")}var Xa=cu({root:document.querySelector(".game-shell"),button:ke("fullscreen-toggle"),onReset:bi,onChange({exited:r}){Va=performance.now(),kt?.resize(),r?vn(!0):pt&&!ct&&Pe.result==="playing"&&Tt.focus({preventScroll:!0})},onNotice(r,e){Kn(r,e),ke("combat-message").classList.add("app-notice")}}),vc=()=>{bi(),Va=performance.now(),kt?.resize()},vm=new ResizeObserver(vc);vm.observe(document.querySelector(".game-shell"));function _c(r=us){kt&&(us=r,Pe.reset(r),Pe.presentationPlaying=!0,Pe.player.style=Ga,Pe.player.hybridStyle=(Ga+1)%Ni.length,Pe.drainEvents(),pt=!0,ct=!1,qa=!1,zt=!0,ja.player=ja.enemy=0,kt.resetCamera(Pe),pu(),vr=0,bi(),Si.hits=0,Si.deflects=0,Si.start=cs,ke("start-overlay").hidden=!0,ke("pause-overlay").hidden=!0,ke("result-overlay").hidden=!0,document.body.classList.add("is-playing"),document.body.classList.remove("is-paused"),ke("pause-toggle").setAttribute("aria-pressed","false"),ke("pause-toggle").setAttribute("aria-label","Pause game"),Tt.focus({preventScroll:!0}),hs.unlock(),ke("combat-message").classList.remove("visible","app-notice"),Wa=-1,Ya())}function vn(r=!ct){!pt||Pe.result!=="playing"||(ct=r,bi(),ke("pause-overlay").hidden=!r,document.body.classList.toggle("is-paused",r),ke("pause-toggle").setAttribute("aria-pressed",String(r)),ke("pause-toggle").setAttribute("aria-label",r?"Resume game":"Pause game"),r?document.querySelector("[data-resume]")?.focus():Tt.focus({preventScroll:!0}))}function du(){pt=!1,ct=!1,qa=!1,bi(),Pe.reset(us),Pe.presentationPlaying=!1,kt?.resetCamera(Pe),ke("start-overlay").hidden=!1,ke("pause-overlay").hidden=!0,ke("result-overlay").hidden=!0,document.body.classList.remove("is-playing","is-paused"),document.querySelector("[data-start]")?.focus()}function _r(r,e){!pt||ct||Pe.result!=="playing"||(r==="evade"&&Pe.setInput(gu()),r==="hybrid"&&Pe.setHybridStyle((Pe.player.style+1)%Ni.length),!Pe.action(r,e)&&Pe.player.stamina<25&&Kn("CATCH YOUR BREATH",.7))}function pu(){ke("camera-help").hidden=zt,ke("lock-toggle").setAttribute("aria-pressed",String(zt)),ke("lock-toggle").setAttribute("aria-label",zt?"Release opponent lock":"Lock onto opponent"),ke("lock-toggle").title=zt?"Opponent locked \xB7 Tab":"Free camera \xB7 Tab to lock"}function mu(){!pt||ct||Pe.result!=="playing"||(zt=!zt,pu(),Tt.focus({preventScroll:!0}))}ke("lock-toggle").addEventListener("click",mu);document.querySelectorAll("[data-start]").forEach(r=>r.addEventListener("click",()=>_c()));document.querySelectorAll("[data-restart]").forEach(r=>r.addEventListener("click",()=>_c()));document.querySelectorAll("[data-return]").forEach(r=>r.addEventListener("click",du));document.querySelectorAll("[data-resume]").forEach(r=>r.addEventListener("click",()=>vn(!1)));document.querySelectorAll("[data-mode]").forEach(r=>r.addEventListener("click",()=>{us=r.dataset.mode,document.querySelectorAll("[data-mode]").forEach(e=>e.setAttribute("aria-pressed",String(e===r))),pt||Pe.reset(us)}));document.querySelectorAll("[data-style]").forEach(r=>r.addEventListener("click",()=>{let e=Number(r.dataset.style);pt?(_r("style",e),ct||Tt.focus({preventScroll:!0})):(Ga=e,Pe.player.style=e,Wa=-1,Ya())}));ke("pause-toggle").addEventListener("click",()=>vn());ke("sound-toggle").addEventListener("click",r=>{Zn=!Zn,hs.setEnabled(!Zn),Zn||hs.unlock(),ke("sound-toggle").setAttribute("aria-pressed",String(!Zn)),ke("sound-toggle").setAttribute("aria-label",Zn?"Enable sound":"Mute sound"),ke("sound-toggle").classList.toggle("muted",Zn),Kn(Zn?"SOUND OFF":"SOUND ON",.8),r.detail>0&&pt&&!ct&&Tt.focus({preventScroll:!0})});ke("help-toggle")?.addEventListener("click",()=>{pt&&!ct?vn(!0):pt?vn(!1):document.querySelector(".controls-guide")?.classList.toggle("expanded")});window.addEventListener("keydown",r=>{if(!pt)return;if(r.code==="Escape"||r.code==="KeyP"){r.preventDefault(),r.repeat||(r.code==="Escape"&&Xa.active()?(vn(!0),Xa.toggle()):vn());return}if(ct||Pe.result!=="playing"||r.target instanceof Element&&r.target.closest('button, a, input, select, textarea, [contenteditable="true"]')||!["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowLeft","ArrowDown","ArrowRight","Space","KeyF","KeyJ","KeyK","KeyQ","KeyE","KeyR","Digit1","Digit2","Digit3","Tab"].includes(r.code)||(r.preventDefault(),Bt.add(r.code),r.repeat))return;let t={KeyJ:"light",KeyK:"heavy",Space:"evade",KeyQ:"style",KeyE:"hybrid"};t[r.code]&&_r(t[r.code]),r.code==="KeyF"&&Pe.setGuard(!0),r.code==="KeyR"&&_c(),r.code.startsWith("Digit")&&_r("style",Number(r.code.slice(-1))-1),r.code==="Tab"&&mu()});window.addEventListener("keyup",r=>{Bt.delete(r.code),r.code==="KeyF"&&Pe.setGuard(Jn!==null)});window.addEventListener("blur",()=>{pt&&!ct&&!Xa.busy&&vn(!0),bi()});document.addEventListener("visibilitychange",()=>{document.hidden&&pt&&vn(!0)});Tt.addEventListener("contextmenu",r=>r.preventDefault());Tt.addEventListener("pointermove",r=>{if(Xt?.id!==r.pointerId)return;let e=r.clientX-Xt.x,t=r.clientY-Xt.y;Xt.x=r.clientX,Xt.y=r.clientY,!ct&&!zt&&kt?.orbit(e,t)});Tt.addEventListener("pointerdown",r=>{if(!(!pt||ct||Pe.result!=="playing")){if(Tt.focus({preventScroll:!0}),r.button===2&&zt&&r.pointerType==="mouse"){_r("heavy");return}if(r.pointerType==="touch"||r.button===2){if(zt||(r.preventDefault(),Xt!==null))return;Xt={id:r.pointerId,x:r.clientX,y:r.clientY},Tt.setPointerCapture(r.pointerId)}else r.button===0&&_r("light")}});for(let r of["pointerup","pointercancel","lostpointercapture"])Tt.addEventListener(r,e=>{Xt?.id===e.pointerId&&(Xt=null)});document.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("pointerdown",e=>{e.preventDefault(),_r(r.dataset.action)})});document.querySelectorAll("[data-guard]").forEach(r=>{r.addEventListener("pointerdown",e=>{e.preventDefault(),!(!pt||ct||Jn!==null||Pe.result!=="playing")&&(Jn={id:e.pointerId,element:r},r.setPointerCapture(e.pointerId),Pe.setGuard(!0))});for(let e of["pointerup","pointercancel","lostpointercapture"])r.addEventListener(e,t=>{Jn?.id===t.pointerId&&(Jn=null,Pe.setGuard(Bt.has("KeyF")))})});var ds=ke("joystick");function fu(r){let e=ds.getBoundingClientRect(),t=(r.clientX-e.left-e.width/2)/(e.width*.32),n=(r.clientY-e.top-e.height/2)/(e.height*.32),i=Math.hypot(t,n);i>1&&(t/=i,n/=i),Pn.x=t,Pn.z=n,ke("joystick-nub").style.transform=`translate(calc(-50% + ${t*e.width*.25}px), calc(-50% + ${n*e.height*.25}px))`}ds?.addEventListener("pointerdown",r=>{r.preventDefault(),!(!pt||ct||$n!==null||Pe.result!=="playing")&&($n=r.pointerId,ds.setPointerCapture(r.pointerId),fu(r))});ds?.addEventListener("pointermove",r=>{r.pointerId===$n&&fu(r)});for(let r of["pointerup","pointercancel","lostpointercapture"])ds?.addEventListener(r,e=>{$n===e.pointerId&&(Pn.x=Pn.z=0,$n=null,ke("joystick-nub").style.transform="translate(-50%, -50%)")});var _m=["player-health","player-stamina","player-posture","enemy-health","enemy-posture","health-value","stamina-value","enemy-name"],gc=Object.fromEntries(_m.map(r=>[r,ke(r)])),uu=new Map;function ls(r,e,t){let n=Math.round(Math.min(1,Math.max(0,e/t))*500)/500;uu.get(r)!==n&&(uu.set(r,n),gc[r].style.transform=`scaleX(${n})`)}function fc(r,e){let t=String(e);gc[r].textContent!==t&&(gc[r].textContent=t)}function Ya(){let r=Pe.player,e=Pe.enemy;ls("player-health",r.health,r.maxHealth),ls("player-stamina",r.stamina,100),ls("player-posture",r.posture,r.maxPosture),ls("enemy-health",e.health,e.maxHealth),ls("enemy-posture",e.posture,e.maxPosture),fc("health-value",Math.ceil(r.health)),fc("stamina-value",Math.ceil(r.stamina)),fc("enemy-name",Pe.mode==="boss"?"THE FRACTURED MASTER":"THE SILENT DISCIPLE");let t=e.state==="windup"?`${e.attack?.name||"Attack"} \xB7 Incoming`:e.state==="broken"?"Posture broken \xB7 Strike now":e.state==="recovery"?"An opening":Pe.phase>1?"Phase II \xB7 Unbound":Pe.mode==="boss"?"Guardian of the ashen courtyard":"Watch the amber tell, then counter.";if(t!==hu&&(ke("enemy-intent").textContent=t,hu=t),ke("enemy-intent").classList.toggle("danger",e.state==="windup"),document.body.classList.toggle("low-health",r.health<r.maxHealth*.25&&r.health>0),r.style!==Wa){Wa=r.style,Ga=r.style;let n=Ni[r.style];ke("style-description").textContent=n.description,document.querySelectorAll("[data-style]").forEach(i=>i.setAttribute("aria-pressed",String(Number(i.dataset.style)===r.style))),document.documentElement.style.setProperty("--style-color",n.color)}}var ja={player:0,enemy:0};function ym(){for(let r of[Pe.player,Pe.enemy]){let e=Math.floor(r.movePhase/Math.PI);Number.isFinite(e)&&e!==ja[r.id]&&(ja[r.id]=e,r.speed>.18&&hs.step(r.id==="player"?.85:.46))}}function xm(){for(let r of Pe.drainEvents())kt?.burst(r),hs.event(r),r.type==="hit"&&(vr=Math.max(vr,r.kind==="light"?.018:.036),r.actor==="player"&&Si.hits++),r.type==="deflect"&&(vr=.048,Si.deflects++,Kn("PERFECT DEFLECT",1)),r.type==="break"&&Kn(r.actor==="player"?"YOUR POSTURE IS BROKEN":"POSTURE BROKEN \xB7 STRIKE",1.4),r.type==="phase"&&Kn("PHASE II \xB7 THE MASTER UNBOUND",2.5),r.type==="style"&&Kn(Ni[Pe.player.style].name.toUpperCase(),.8)}function Mm(){qa=!0,bi();let r=Pe.result==="won";ke("result-title").textContent=r?"A form remembered.":"Rise. And try again.";let e=Math.floor(Pe.time);ke("result-detail").textContent=r?`${Pe.mode==="boss"?"The master yields.":"The disciple bows."} ${Si.hits} strikes \xB7 ${Si.deflects} deflects \xB7 ${e}s`:"Every defeat has something to teach. Watch the amber tell, evade the strike, and punish the recovery.",ke("result-overlay").hidden=!1,document.querySelector("[data-restart]")?.focus()}function gu(){let r=(Bt.has("KeyD")||Bt.has("ArrowRight")?1:0)-(Bt.has("KeyA")||Bt.has("ArrowLeft")?1:0)+Pn.x,e=(Bt.has("KeyW")||Bt.has("ArrowUp")?1:0)-(Bt.has("KeyS")||Bt.has("ArrowDown")?1:0)-Pn.z,t=kt.movementBasis(),n=r*t.right.x+e*t.forward.x,i=r*t.right.z+e*t.forward.z,s=Math.hypot(n,i);s>1&&(n/=s,i/=s);let a=zt?{x:Pe.enemy.x-Pe.player.x,z:Pe.enemy.z-Pe.player.z}:s>.01?{x:n,z:i}:{x:Math.sin(Pe.player.yaw),z:Math.cos(Pe.player.yaw)};return{x:n,z:i,aimX:a.x,aimZ:a.z}}function vu(r){let e=Math.max(0,(r-Va)/1e3),t=Math.min(e,.08);if(Va=r,!ct&&!document.hidden&&kt?.trackFrameTime(e),cs+=t,pt&&!ct&&Pe.result==="playing"){let n=Math.min(t,vr);vr-=n,Pe.update(t-n,gu()),ym(),xm(),Ya(),Pe.result!=="playing"&&!qa&&Mm()}Ha&&cs>Ha&&(ke("combat-message").classList.remove("visible"),Ha=0),kt?.render(Pe,ct?0:t,cs,zt),requestAnimationFrame(vu)}window.addEventListener("resize",vc);window.visualViewport?.addEventListener("resize",vc);Tt.addEventListener("webglcontextlost",r=>{r.preventDefault(),vn(!0),Kn("Graphics paused. Reload the game to reconnect.",30)});document.querySelector(".brand")?.addEventListener("click",r=>{r.preventDefault(),du()});Ya();requestAnimationFrame(vu);Object.defineProperty(window,"__THOUSAND_FORMS__",{value:{snapshot:()=>({started:pt,paused:ct,locked:zt,renderStats:kt?.stats(),camera:kt?.cameraSnapshot(Pe),cameraLookPointer:Xt?.id??null,fullscreen:Xa.active(),keys:[...Bt],joystick:{...Pn},joystickPointer:$n,touchGuard:Jn?.id??null,mode:Pe.mode,result:Pe.result,phase:Pe.phase,player:{...Pe.player},enemy:{...Pe.enemy},time:Pe.time})},writable:!1});})();
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
