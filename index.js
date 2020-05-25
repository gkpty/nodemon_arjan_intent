var nodemon = require('nodemon');
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const newFlags = chromeLauncher.Launcher.defaultFlags().filter(flag => flag !== '--disable-setuid-sandbox')

const url = 'http://localhost:8080/index.html'

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
  Network.requestWillBeSent();
  await Network.enable();
  await Page.enable();
  Page.navigate({url: url});
  nodemon.on('start', (data)=>{
    console.log('Starting the server')
  }).on('quit', ()=> {
    console.log('App has quit');
    chromeLauncher.killAll();
    process.exit();
  }).on('restart', async (files) => {
    console.log('Hello')
    Page.navigate({url: url})
    Page.loadEventFired().then((ev) => {
      console.log('EVENT') 
      Page.navigate({url: url})
    })
    console.log('FILEEEEEEEEEEEEEEEE ', files[0])
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
