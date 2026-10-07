import { cp, mkdir, rm } from 'node:fs/promises';
import './check.mjs';
// Remove the previous output so a stale textbook copy cannot survive a rebuild.
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const path of ['index.html','src','public'])await cp(path,`dist/${path}`,{recursive:true});
console.log('Built static app in dist/ without the textbook.');
