var nodemon = require('nodemon');
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const newFlags = chromeLauncher.Launcher.defaultFlags().filter(flag => flag !== '--disable-setuid-sandbox')
const express = require('express')

const url = 'http://localhost:8080/index.html'
const dir = 'dep_pack'

nodemon({
  script: 'app.js',
  ext: 'js json html css'
});

function delay(ms){
  return new Promise((resolve) => {
    setTimeout(resolve(true), ms)
  })
}

async function main(){
  const chrome = await chromeLauncher.launch({
    ignoreDefaultFlags: true,
    chromeFlags: newFlags,
    startingUrl: url
  })
  const client = await CDP({port: chrome.port});
  const {Network, Page} = client;
  Page.navigate({url: url});
  nodemon.on('start', (data)=>{
    console.log('Starting the server')
  }).on('quit', ()=> {
    console.log('App has quit');
    chromeLauncher.killAll();
    process.exit();
  }).on('restart', async (files) => {
    let dat = null;
    let failed = false;
    Network.requestWillBeSent((data)=> {
      //console.log('DATA\n', data)
      dat = data;
    })
    Network.loadingFailed((params) => {
      console.log('ERRORRRRRR', params)
      failed = true;
    })
    //console.log('FILEEEEEEEEEEEEEEEE ', files[0])
    await Network.enable();
    await Page.enable();
    if(files[0].includes(dir)){
      let newurl = url.split('/index.html')[0] + files[0].split(dir)[1];
      Page.navigate({url: newurl}).then((resp) => {
        //console.log(resp)
        if(resp.errorText){
          console.log('Errrooorr', resp.errorText)
          Page.navigate({url: newurl})
        }
      })
    }
    else {
      console.log(files[0] + ' is not in the served directory')
    }
  });
}

main()

// Wait for window.onload before doing stuff.
/* Page.loadEventFired(async () => {

  if (pageNum === 0) {
    const result1 = await Runtime.evaluate({expression: "document.querySelector('title').textContent"});

    // Prints "Google"
    console.log('Title of page: ' + result1.result.value);

    // Navigate to the About page
    const result2 = await Runtime.evaluate({expression: "document.querySelector('#fsl a:nth-child(3)').click()"});
    pageNum = 1;

  } else if (pageNum === 1) {
    const result3 = await Runtime.evaluate({expression: "document.querySelector('title').textContent"});

    // Prints "About Us | Google"
    console.log('Title of page: ' + result3.result.value);

    protocol.close();
  }

}); */
