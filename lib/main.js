const {components} = require("chrome"); 
var tabs = require('sdk/tabs');
var tmr = require('timer');
var promptService = components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(components.interfaces.nsIPromptService);
var isCountOn = false;
var timeOutId;
var showPopUpNow = false;

tabs.on("ready", logURL);
function logURL(tab) {
    if(tab.url.indexOf('facebook.com')!=-1 && !isCountOn)
        runScript();
}

tabs.on('close', function(tab) {
    if(!isFacebookTab() && isCountOn){
        isCountOn = false;
        showPopUpNow = false;
        // console.log("Timer Stopped");
        tmr.clearTimeout(timeOutId);
    }
});



if(isFacebookTab() && !isCountOn){
    runScript();
}

function runScript() {
    
    var callShowPopUp = function(){ 
        
        var showingPopUp = function(){
            if(tabs.activeTab.url.indexOf('facebook.com')!=-1 && showPopUpNow){
                var result = promptService.confirm(null,"Warning Message","You are advised to stop using facebook. It has been "+timeElapsed+" minutes.");
                if(result){
                    var closeFBTabs = function(){
                        for each (var tab in tabs){
                            if(tab.url.indexOf('facebook.com')!=-1 )
                                tab.close();
                        }
                    }
                    
                    tmr.clearTimeout(timeOutId);
                    isCountOn = false;
                    showPopUpNow = false;
                    closeFBTabs();
                    //console.log("Show pop up stopped");
                    //console.log("Timer stopped");
                }
                else{
                    tmr.clearTimeout(timeOutId);
                    timeElapsed +=15;
                    //console.log("15 min added");
                    showPopUpNow = false;
                    createTimeout();
                    //console.log("Show pop up stopped");
                }
                
            }
        }
        
        //console.log("ShowPopUp");
        showPopUpNow = true;        
        showingPopUp();
        
        tabs.on('activate', function () {
            showingPopUp();
        });
    }
    
    
    isCountOn = true;
    var timeElapsed = 15;
    //console.log("Timer Started");
    var createTimeout = function(){
        timeOutId = tmr.setTimeout(callShowPopUp,(15*60*1000));
    }
    createTimeout();
}




function isFacebookTab(){
    for each (var tab in tabs){
        if(tab.url.indexOf('facebook.com')!=-1 )
            return true;
    }
    return false;
}