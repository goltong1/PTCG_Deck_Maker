import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');
const portArg=process.argv.indexOf('--port');
const port=Number(process.env.PORT || (portArg>=0 ? process.argv[portArg+1] : 5173));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.gz':'application/gzip','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'};
http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';const f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const s=await stat(f);if(!s.isFile())throw Error();res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(f));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0',()=>console.log('PTCG Canvas dev server ready'));
