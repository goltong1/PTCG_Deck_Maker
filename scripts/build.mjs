import {rm,mkdir,cp} from 'node:fs/promises';
import {verifyRelease} from './verify-release.mjs';
await verifyRelease();
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Built PTCG Canvas in dist/');
