const express=require("express");
const { write } = require("fs");
const utf8=require('utf8');
const FINGERPRINT_SUBSTR_LENGTH=7;
const router=express.Router();
const process=require('process');
const { request } = require("http");
const Confluence = require("confluence-api");
const parse = require('node-html-parser').parse

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;


function execute(command, callback){
    exec(command, function(error, stdout, stderr){callback(error, stdout, stderr)});
}

function ExtractUniqueFingerprints(matches)
{
    let visited = Set();
    let visited_matches = [];
    for (let i=0; i<matches.length; i++)
    {

    }
}
function extractFingerprintAndCallstack(record)
{

    let keyword = 'fingerprint:';
    var start = record.indexOf(keyword);
    var end = record.indexOf('\n');
    if (start != -1)
    {
        a = record.substring(start + keyword.length, end).trim();
    }
}
function writeCallstacks(error, stdout, stderr)
{
    const pattern = /fingerprint:\s([a-f0-9]+)\s*callstack:\s([\s\S]+?)(?=\n#|\Z)/;
    var arr = stdout.toString().match(pattern);

}

function QueryCallbackAsync (error, stdout, stderr, platform, version, res)
{
    //Process result here;
    try{
    if (error)
    {
        res.status(403);
        res.send(error);
        return ;
    }
    var arr = stdout.toString().split("\n\n");
    arr.pop();
    var listfingerprint = [];
    var stringToSend = "|No|Status|Note|Total trigger|Percentage|Fingerprint|Callstack|Jira|Issue|\n|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|";
    for (let i=0; i<arr.length; i++)
    {
        let dataStr = arr[i].split("\n");
        let fingerprint = dataStr[0].substring(0, FINGERPRINT_SUBSTR_LENGTH);
        let temp = dataStr[3].trim().replace('(', '').replace(')', '').split(' ');
        let occ = temp[1];
        let per = temp[2];

        stringToSend+= `\n|${i+1}|ByHand|ByHand|${occ}|${per}|${fingerprint} (update by hand)|${fingerprint}.txt (update by hand)|ByHand|ByHand|`;
        listfingerprint.push(fingerprint);
    }

    if (listfingerprint.length > 0)
    {
        let fingerprints = listfingerprint.join('_');
        
        let cmd = `python ${process.cwd()}\\scripts\\extractCallstacks.py ${version} ${platform} ${fingerprints}`;
        console.log(cmd);
        exec(cmd, (error, stdout, stderr) => {
            console.log(stdout);
        });

        res.send(stringToSend);
    }
    else{
        res.status(200);
        res.send("Empty");
    }
}
catch (err)
{
    res.send(err);
}
}
///backtrace/:version/:platform
router.get("/backtrace/:version/:platform", async (req, res, next) =>{

    var version = req.params.version;
    var platform = req.params.platform;
    console.log(req.query)
    execute(`morgue list gameloft/Apex --factor=fingerprint --age=50y --limit=10 --filter=app.buildType,regular-expression,"${platform}"--filter=app.buildType,not-contains,googleplay  --filter=app.version,regular-expression,"${version}" --sort=\"-;count\"` , (err, stdout, stderr, platform, version) =>
    {
        QueryCallbackasync(err, stdout, stderr, platform, version, res);
    }
    );
    }
);

router.get("/backtrace", async (req, res, next) =>{
    try{
        var params = req.query['text'].split(' ');
        var version = params[0].trim();
        var platform = params[1].trim();
        var cmd = `morgue list gameloft/Apex --factor=fingerprint --age=50y --limit=10 --filter=app.buildType,regular-expression,"${platform}" --filter=app.buildType,not-contains,googleplay --filter=app.version,regular-expression,"${version}" --sort=\"-;count\"`;
        execute(cmd , async (err, stdout, stderr) =>
            {
                if (err)
                    {
                        res.status(403);
                        res.send(err);
                        return ;
                    }
                    var arr = stdout.toString().split("\n\n");
                    arr.pop();
                    var listfingerprint = [];
                    var stringToSend = "|No|Status|Note|Total trigger|Percentage|Fingerprint|Callstack|Jira|Issue|\n|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|:-----|";
                    for (let i=0; i<arr.length; i++)
                    {
                        let dataStr = arr[i].split("\n");
                        let fingerprint = dataStr[0].substring(0, FINGERPRINT_SUBSTR_LENGTH);
                        let temp = dataStr[3].trim().replace('(', '').replace(')', '').split(' ');
                        let occ = temp[1];
                        let per = temp[2];
                
                        stringToSend+= `\n|${i+1}|ByHand|ByHand|${occ}|${per}|${fingerprint} (update by hand)|${fingerprint}.txt (update by hand)|ByHand|ByHand|`;
                        listfingerprint.push(fingerprint);
                    }
                
                    if (listfingerprint.length > 0)
                    {
                        let fingerprints = listfingerprint.join('_');
                        
                        /*
                        let path_to_callstack = 'D:\\APEX\\WebServer\\test'
                        let cmd = `python ${process.cwd()}\\scripts\\extractCallstacks.py ${version} ${platform} ${fingerprints} ${path_to_callstack}`;
                        console.log(cmd);
                        exec(cmd, (error, stdout, stderr) => {
                            console.log(stderr);
                            console.log(stdout);
                        });
                        */
                       
                        let cmdd = `${process.cwd()}\\scripts\\extractCallstacks.py`;
                        let path_to_callstack = `D:\\APEX\\WebServer\\backtrace_callstacks\\${platform.replaceAll('|', '_')}`
                        console.log(platform)
                        var temp = spawn('python', [cmdd, version, platform, fingerprints, path_to_callstack]);
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
        res.send(error);
    }

}
);

router.get("/backtrace/test", async (req, res, next) => 
{
    const Confluence = require("confluence-api");
    var config = 
    {
        /*
        username: 
        password: 
        baseUrl:
        */ 
    };

    var confluence = new Confluence(config);

    var page = await confluence.getContentByPageTitle("GLSAII", "BACKTRACETEST", (err, data) => {
        let dataobj = data['results'][0]; 

        
        //confluence.putContent('GLSAII', '727661229'/*TEST page*/, 5 /*should increment on new update*/, 'BACKTRACETEST', dataobj['body']['storage']['value'], (err, res) =>
        //{
        //    confluence.createAttachment("GLSAII", '727661229', "D:\\APEX\\WebServer\\backtrace_callstacks\\c313c20.txt", (err, res) => {
       //         console.log(res);
        //    });
        //    console.log(res);
        //} );
        const root = parse(dataobj['body']['storage']['value']);
        const test = root.querySelectorAll(".structured-macro");
        console.log(test)
        //res.send(dataobj['body']['storage']['value']);
        res.send(dataobj)
    });
    //res.send("Fuck");
});

router.get("/backtrace/test1", (req, res, next) =>
{


    var confluence = new Confluence(config);
    //confluence.createAttachment("GLSAII", '727661229', "D:\\APEX\\WebServer\\backtrace_callstacks\\0d8fcf9.txt", (err, ress) => {
    //    res.send(ress);
    //});
    confluence.getAttachments('GLSAII', '727662665', (err, ress) =>
    {
        res.send(ress);
    });
})

module.exports=router