const {Builder, By, Browser, until} = require("selenium-webdriver")
const fs = require("fs");
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const { color, log } = require('console-log-colors');
const { red, green, cyan } = color;
const firefox = require('selenium-webdriver/firefox');
const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({
    format: 'Progress |' + color.cyan('{bar}') + '| {percentage}% || {filename} | {value}/{total} || {duration_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, cliProgress.Presets.shades_classic);

async function Scrape() {
    // create a new progress bar instance and use shades_classic theme
    
    let handle = "", password = "", tags = "";
    
    tags = await new Promise(resolve => {
        rl.question(green('Enter the tags: '), tags => {
            resolve(tags);
        });
    });

    handle = await new Promise(resolve => {
        rl.question(green('Enter your handle: '), handle => {
            resolve(handle);
        });
    });
    
    password = await hiddenQuestion(green('Enter your password: '));
    
    
    // launch the browser
    let options = new firefox.Options();
    // options.addArguments("-headless");
    options.setBinary("./geckodriver");
    let driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
    
    // get to codeforces login page
    await driver.get('https://codeforces.com/enter?back=/problemset?tags=' + tags);
    await driver.findElement(By.id('handleOrEmail')).sendKeys(handle);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.className('submit')).click();
    
    let lastPageNumber;
    try {
        await driver.wait(until.elementLocated(By.className('pagination')), 10000);
        let pagination = await driver.findElement(By.className('pagination'));
        let pages = await pagination.findElements(By.className('page-index'));
        let lastPage = await pages[pages.length - 1].getText();
        lastPageNumber = parseInt(lastPage);
    } catch {
        lastPageNumber = 1;
    }

    console.log(color.yellow('Total Pages:'), color.cyan(lastPageNumber));
    bar1.start(lastPageNumber, 0);
    
    let cntProblems = 0;
    let problemsFile = fs.createWriteStream('problems.md');
    problemsFile.write(`# ${tags.replace(/,/g, ' ')} Problems` + '\n');
    
    for (let pageIndex = 1; pageIndex <= lastPageNumber; pageIndex++) {
        await driver.get('https://codeforces.com/problemset/page/' + pageIndex + '?tags=' + tags);
        
        try {
            await driver.wait(until.elementLocated(By.className('accepted-problem')), 2000);
        } catch (err) {
            continue;
        }
        
        let problems = await driver.findElements(By.className('accepted-problem'));
        
        for (let problem of problems) {
            // find all elements with css 'a'
            let links = await problem.findElements(By.css('a'));
            if (links.length > 0) {
                let problemName = await links[1].getText();
                let problemLink = await links[1].getAttribute('href');
                let contentInFile = '[' + problemName + '](' + problemLink + ')';
                // write to file
                problemsFile.write(contentInFile + '\n\n');
                cntProblems++;
            }
        }
        bar1.update(pageIndex, {filename: "Pages"});
    }

    bar1.stop();
    console.log(color.yellow('Total Problems:'), cyan(cntProblems));

    driver.quit();
    rl.close();
}

const hiddenQuestion = query => new Promise((resolve, reject) => {
    
    const stdin = process.openStdin();
    process.stdin.on('data', char => {
    char = char + '';
    switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
        stdin.pause();
        break;
        default:
        process.stdout.clearLine();
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(query + Array(rl.line.length + 1).join(red('*')));
        break;
    }
    });
    rl.question(query, value => {
        rl.history = rl.history.slice(1);
        resolve(value);
    });
});
  

Scrape();
