const WORKS = ["Construction of community hall","Drinking water supply upgrade","Road widening and repair","Solar street lighting","Government school renovation","Rural health sub-centre","Drainage system construction","Public library building"];
const MPS = ["A. Sharma","R. Verma","S. Reddy","K. Nair","M. Iyer","P. Singh"];
const DISTRICTS = ["North district","Riverside constituency","Hill block","Central ward"];

function rnd(min, max){ return Math.random()*(max-min)+min }
function choice(a){ return a[Math.floor(Math.random()*a.length)] }

export function tierOf(risk){ return risk>=65?'high': risk>=35?'med':'low'; }

function genProjects(n){
  const list = [];
  for(let i=0;i<n;i++){
    const sanctioned = Math.round(rnd(8,60))*100000;
    const costDeviation = rnd(-5,60);
    const progress = Math.round(rnd(10,100));
    const spentRatio = Math.min(100, Math.round(progress + rnd(-15,35)));
    const spent = Math.round(sanctioned*spentRatio/100);
    const delayDays = Math.round(rnd(0,220));
    const duplicateSim = rnd(0,1);
    const photoMismatch = rnd(0,1);

    const finSignal = Math.max(0, Math.min(100, costDeviation*1.3 + (spentRatio-progress)*1.5));
    const netSignal = Math.max(0, Math.min(100, delayDays/220*100*0.6 + rnd(0,25)));
    const dupSignal = Math.round(duplicateSim*100);
    const photoSignal = Math.round(photoMismatch*100);
    const risk = Math.round(finSignal*0.35 + netSignal*0.25 + dupSignal*0.20 + photoSignal*0.20);

    list.push({
      id: 'MPL-'+(1000+i), work: choice(WORKS), mp: choice(MPS), district: choice(DISTRICTS),
      sanctioned, spent, progress, delayDays,
      finSignal: Math.round(finSignal), netSignal: Math.round(netSignal), dupSignal, photoSignal,
      risk
    });
  }
  return list.sort((a,b)=>b.risk-a.risk);
}

export const projects = genProjects(24);

export function getStats(){
  return {
    total: projects.length,
    high: projects.filter(p=>tierOf(p.risk)==='high').length,
    med: projects.filter(p=>tierOf(p.risk)==='med').length,
    low: projects.filter(p=>tierOf(p.risk)==='low').length,
    fundReleased: projects.reduce((s,p)=>s+p.spent,0),
  };
}
