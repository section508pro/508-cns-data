import Walker from 'walker';
import fs from 'fs';

buildIndexJson('mobile');
buildIndexJson('desktop');
buildA11yJson('mobile');
buildA11yJson('desktop');
buildRollupJson('mobile');
buildRollupJson('desktop');

function buildIndexJson(type){
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
            fs.writeFileSync(`reports/${type}/index.json`, JSON.stringify(dates.sort(), null, 2));
            console.log(`reports/${type}/index.json`);
        }catch(err){
            console.error(err);
        }        
    });
}

function buildA11yJson(type){    
    Walker(`reports/${type}`)
    .on('dir', (dir, stat) => {
        const path = `${process.cwd()}/${dir}`;
        let lhFile = `${path}/lighthouse.json`;
        try {
            if (fs.existsSync(lhFile)) {
                let a11y = [];
                let errors = [];
                const lh = JSON.parse(fs.readFileSync(lhFile, 'utf8'));
                lh.categories.accessibility.auditRefs.forEach((auditRef) => { 
                    let audit = lh.audits[auditRef.id];
                    a11y.push(audit); 
                    if(audit.score == 0){                
                        audit.errorCount = audit.details.items.length;
                        errors.push(audit);
                    }
                });
                fs.writeFileSync(`${path}/a11y.json`, JSON.stringify(a11y, null, 2));
                fs.writeFileSync(`${path}/a11y-errors.json`, JSON.stringify(errors, null, 2));
            }
          } catch(err) {
            console.error(err)
          }
    })
    .on('end', ()=>{
        try{
            
        }catch(err){
            console.error(err);
        }        
    });
}

function buildRollupJson(type){
    const path = `${process.cwd()}/reports/${type}`;
    const dirs = JSON.parse(fs.readFileSync(`${path}/index.json`, 'utf8'));
    dirs.forEach((dir) => {
        let date = dir.split('/')[2];
        let rollups = [];
        Walker(`reports/${type}/${date}`)
            .on('dir', (dir, stat) => {
                let a11yErrorsFile = `./${dir}/a11y-errors.json`;
                try {
                    if (fs.existsSync(a11yErrorsFile)) {
                        const errors = JSON.parse(fs.readFileSync(a11yErrorsFile, 'utf8'));
                        errors.forEach((auditRef) => { 
                            let rollup = {}
                            rollup.id = auditRef.id;
                            rollup.errorCount = auditRef.errorCount;
                            rollups.push(rollup);                            
                        });
                    }
                  } catch(err) {
                    console.error(err)
                  }
            })
            .on('end', ()=>{
                try{
                    // consolidate/sum multiple entries
                    let condensed = new Map();
                    rollups.forEach((it) => {
                        let sum = condensed.get(it.id) || 0;
                        condensed.set(it.id, sum += it.errorCount);                        
                    });

                    //sort by errorCount, largest to smallest
                    let condensedSorted = new Map([...condensed.entries()].sort((a,b) => b[1] - a[1]));

                    // convert to array
                    // let sorted = Array.from(condensedSorted, ([name, value]) => ({ name, value }));
                    
                    //write to file
                    // fs.writeFileSync(`./reports/${type}/${date}/summary.json`, JSON.stringify(sorted, null, 2));
                    fs.writeFileSync(`./reports/${type}/${date}/errors-summary-lighthouse.json`, JSON.stringify(Object.fromEntries(condensedSorted), null, 2));
                    console.log(`./reports/${type}/${date}/errors-summary-lighthouse.json`);                    
                }catch(err){
                    console.error(err);
                }        
            });        
    });    
}