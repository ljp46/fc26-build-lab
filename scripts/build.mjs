import fs from 'node:fs';
fs.mkdirSync('dist',{recursive:true});
for(const file of ['index.html','favicon.svg'])fs.copyFileSync(file,'dist/'+file);
for(const dir of ['src','data'])fs.cpSync(dir,'dist/'+dir,{recursive:true});
console.log('Static site built in dist. Backend and secrets are excluded.');
