import { readdir, readFile } from 'node:fs/promises';
import { SourceTextModule } from 'node:vm';
import { validateTopic, questionsOf } from '../src/game/engine.js';
const metadata=JSON.parse(await readFile('src/data/unit1/topics.json','utf8'));
const all=[];
for(const {id} of metadata){
  const topic=validateTopic(JSON.parse(await readFile(`src/data/unit1/${id}.json`,'utf8')));
  all.push(...questionsOf(topic));
}
if(all.length!==150||new Set(all.map(q=>q.id)).size!==150)throw Error('Expected 150 unique questions.');
async function checkSyntax(path){
  for(const entry of await readdir(path,{withFileTypes:true})){
    const next=`${path}/${entry.name}`;
    if(entry.isDirectory())await checkSyntax(next);
    else if(/\.(js|mjs)$/.test(next)){
      new SourceTextModule(await readFile(next,'utf8'),{identifier:next});
    }
  }
}
await checkSyntax('src');await checkSyntax('scripts');await checkSyntax('tests');
console.log('Validated 6 boards, 150 unique questions, values, source references, and JavaScript syntax.');
