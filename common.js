function setPref(key, value) {
  var config = {};
  if (localStorage.config) {
    config = JSON.parse(localStorage.config);
  }
  config[key] = value;
  localStorage.config = JSON.stringify(config);
}

function getPref(key) {
  if (!localStorage.config) {
    return undefined;
  }
  var config = JSON.parse(localStorage.config);
  return config[key];
}


var config = new Object();
// Load the config objects into memory since we cannot access them directly in content scripts yet
sendMessage('sab_url');
sendMessage('api_key');
sendMessage('sab_user');
sendMessage('sab_pass');

function checkEndSlash(input) {
    if (input.charAt(input.length) == '/') {
        return input;
    } else {
        var output = input+'/';
        return output;
    }
}

function addToSABnzbd(addLink, nzb, mode) {

    
    var sabUrl = checkEndSlash(config.sab_url);
    var apikey = config.api_key;
    var sabUser = config.sab_user;
    var sabPass = config.sab_pass;
    
    var data = { mode: mode, name: nzb };
    
    if (apikey) {
        data.apikey = apikey;
    }
    
    if (sabUser && sabPass) {
        data.ma_username = sabUser;
        data.ma_password = sabPass;
    }
    
    $.ajax({
        type: "GET",
        url: sabUrl + "api",
        data: data,
        success: function(data) {
            var img = chrome.extension.getURL('images/sab2_16_green.png');
            $(addLink).find('img').attr("src", img);
        },
        error: function() {
            // This seems to get called on a success message from sabnzbd.
            //var img = chrome.extension.getURL('sab2_16_red.png');
            var img = chrome.extension.getURL('images/sab2_16_green.png');
            $(addLink).find('img').attr("src", img);
        }
    });
 
    
}



function sendMessage(key) {
    // Create a short-lived named channel to the extension and send a single
    // message through it.
    var port = chrome.extension.connect({name: "notifyChannel"});
    port.postMessage({get: key});
}

// Also listen for new channels from the extension for when the button is
// pressed.
chrome.extension.onConnect.addListener(function(port, name) {
  port.onMessage.addListener(function(msg) {
    if (msg.value) {
        config[msg.key] = msg.value;
    }
  });
});