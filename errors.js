import Walker from 'walker';
import fs from 'fs';

buildA11yJson('mobile');
buildA11yJson('desktop');

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
                console.log(`Wrote ${path}/a11y.json`);
                console.log(`Wrote ${path}/a11y-errors.json`);                              
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