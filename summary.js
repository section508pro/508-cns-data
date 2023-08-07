import Walker from 'walker';
import fs from 'fs';

buildJson('mobile');
buildJson('desktop');

function buildJson(type){
    let dates = [];

    Walker(`reports/${type}`)
    .on('dir', (dir, stat) => {
        const dirParts = dir.split('/');
       if(dirParts.length == 3){
            dates.push(dir);
       }       
    })
    .on('end', ()=>{
        try{
            fs.writeFileSync(`reports/${type}/index.json`, JSON.stringify(dates));
            console.log(`reports/${type}/index.json`);
        }catch(err){
            console.error(err);
        }        
    });
}   