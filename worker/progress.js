// Public milestone projection only. No database binding or private registration reads.
export function serveProgress(request, body) {
 const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0','x-content-type-options':'nosniff','access-control-allow-origin':'*','allow':'GET, HEAD'};
 if(!['GET','HEAD'].includes(request.method))return new Response(JSON.stringify({error:'Method not allowed.'}),{status:405,headers});
 if(typeof body!=='string')return new Response(JSON.stringify({error:'Progress snapshot unavailable.'}),{status:503,headers});
 return new Response(request.method==='HEAD'?null:body,{headers});
}
