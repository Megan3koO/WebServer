//https://docs.saucelabs.com/error-reporting/advanced/morgue/
//morgue list gameloft/Apex --count fingerprint --factor timestamp.edt.day --head timestamp.edt.day --quantize-uint timestamp.edt.day,timestamp,1d,-4h --limit=10 --sort="-;count"
//above can be used to auto generate graphs
const express=require("express");
const { write } = require("fs");
const utf8=require('utf8');
const FINGERPRINT_SUBSTR_LENGTH=7;
const router=express.Router();
const process=require('process');
const { request } = require("http");
const Confluence = require("confluence-api");
const parse = require('node-html-parser').parse

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

const regex = RegExp('[a-zA-Z]+');

const PROJECT = 'PROJECT_NAME';

function execute(command, callback){
    exec(command, function(error, stdout, stderr){callback(error, stdout, stderr)});
}

function getShortFingerprint(fingerprint)
{
    if (fingerprint.substring(0, FINGERPRINT_SUBSTR_LENGTH) === Array(FINGERPRINT_SUBSTR_LENGTH).fill('0').join(''))
    {
        return fingerprint.substring(fingerprint.length - FINGERPRINT_SUBSTR_LENGTH);
    }
    return fingerprint.substring(0, FINGERPRINT_SUBSTR_LENGTH);
}

router.get("/backtrace", async (req, res, next) =>{
    console.log("Hello mother fucker");
    try{
        let params = req.query['text'].split(' ');
        if (params.length < 2)
        {
            console.log('ERROR missing parameter');
            res.send("Invalid parameter! Please try again. Example: /apexbacktrace 1.11.1a xbox");
            return ;
        }
        let version = params[0].trim();
        let platform = params[1].trim();
        console.log(`Version: ${version}`);
        console.log(`Platform: ${platform}`);

        let cmd = `morgue list ${PROJECT} --factor=fingerprint --age=50y --limit=10 --filter=app.buildType,regular-expression,"${platform}" --filter=app.buildType,not-contains,googleplay --filter=app.version,regular-expression,"${version}" --head=fingerprint --head=error.message --head=callstack --sort=\"-;count\"`;
        execute(cmd, (error, stdout, stderr) =>
            {
                if (error && error.code != 0)
                {
                    res.send(`Oops! There is an error with code ${error.code}. Please contact the server owner to address it!`);
                    return ;
                }

                let arr = stdout.toString().split("\n\n");
                arr.pop();
                let listfingerprint = [];
                let stringToSend = `Trigger command: /apexbacktrace ${version} ${platform} \n\n\n |No|Status|Note|Total trigger|Percentage|Fingerprint|Callstack|Jira|Issue|\n|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|`;
                let path_to_callstack = `D:\\APEX\\WebServer\\backtrace_callstacks\\${regex.exec(platform)[0]}\\` 
                let shared_folder = 'file://COMPUTER_NAME/backtrace_callstacks/' //Todo: Change this to build machine shared folder

                for (let i=0; i<arr.length; i++)
                {
                    let dataStr = arr[i].split("\n");

                    //Retrieve trigger times and percentage
                    let temp = dataStr[3].trim().replace('(', '').replace(')', '').split(' ');
                    let occ = temp[1];
                    let per = temp[2];

                    //Retrieve full fingerprint
                    let fingerprint = dataStr[4].substring(19).trim(); //head(fingerprint): 30224f7f5ef057eab4d6a5fafcab2530f9306de5d53288f975f1662d3f858ef9: start from 19-th position
                    
                    let error = dataStr[5].substring(20).trim();
                    let callstack = dataStr.slice(7, Math.min(dataStr.length, 8)).join('\n');
                    stringToSend+= `\n|${i+1}|Update by Hand|Update by Hand|${occ}|${per}|[${getShortFingerprint(fingerprint)}](https://gameloft.sp.backtrace.io/p/Apex/triage?time=all&stats=(app.version%2Capp.buildType)&fingerprint=${fingerprint}&similarity=false)|${shared_folder}${getShortFingerprint(fingerprint)}.txt (Update by Hand)|Update by Hand|${[error, 'in', callstack].join(' ')}|`;
                    listfingerprint.push(fingerprint);
                }
            
                if (listfingerprint.length > 0)
                {
                    let fingerprints = listfingerprint.join('_');
                    let cmdd = `${process.cwd()}\\scripts\\extractCallstacks.py`;
                        //${platform.replaceAll('|', '_')}
                    let temp = spawn('python', [cmdd, version, platform, fingerprints, path_to_callstack]);
                    temp.stdout.on('data', (data) => {
                        console.log(data);
                    });
                    temp.stderr.on('data', (data) => {
                        console.log('Error: ' + data);
                    })
                    temp.on('exit', (code, signal)=>{
                        if (code) {
                            console.error('Child exited with code', code)
                            } else if (signal) {
                            console.error('Child was killed with signal', signal);
                            } else {
                            console.log('Child exited okay');
                            }
                    });
        
                    res.send(stringToSend);
                }
                else{
                    res.status(200);
                    res.send("Empty");
                }
            }
            );
    }
    catch (error)
    {
        console.log(error);
        res.send(error);
    }

}
);

module.exports=router
