const { Builder, By, Browser, until } = require("selenium-webdriver")
const fs = require("fs");
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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

    let handle = "",
        password = "",
        tags = "";

    // check if the .env file exists
    const isEnvExist = require('dotenv').config();

    if (isEnvExist.error) {
        console.log(red("Error: .env file not found! ... try to change .env.example to .env ❌\n"));
        process.exit(0);
    }

    // Gettings the data from the .env file
    handle = process.env.userHandl;
    password = process.env.userPass;
    tags = process.env.problemTags;

    // check if the user has entered the data in the .env file
    if (handle === "" || password === "" || tags === "") {
        log(red("Please enter the details in the .env file ❌\n"));
        process.exit(0);
    }

    // launch the browser
    let driver = await new Builder().forBrowser("firefox").setFirefoxOptions(new firefox.Options().headless()).build();

    // get to codeforces login page
    await driver.get('https://codeforces.com/enter?back=/problemset?tags=' + tags.replace(/[ ,]+/g, ","));
    await driver.findElement(By.id('handleOrEmail')).sendKeys(handle);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.className('submit')).click();

    log(cyan("logging in...\n"));

    // wait for the page to load
    await driver.sleep(5000);

    let isLogged = false;

    try {
        await driver.findElement(By.className('error'));
        isLogged = false;
    } catch (error) {
        isLogged = true;
    }

    if (!isLogged) {
        log(red("Wrong username or password! ❌\n"));
        driver.quit();
        process.exit(0);
    } else {
        log(green("Logged in successfully! ✅\n"));
    }


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
    problemsFile.write(`# ${tags.replace(/,/g, ' ')} Problems Solved by ${handle}\n\n`);

    for (let pageIndex = 1; pageIndex <= lastPageNumber; pageIndex++) {
        await driver.get('https://codeforces.com/problemset/page/' + pageIndex + '?tags=' + tags.replace(/[ ,]+/g, ","));
        
        bar1.update(pageIndex, { filename: "Pages" });
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
                problemsFile.write(contentInFile + '\n' + (problem === problems[problems.length - 1] ? '' : '\n'));
                cntProblems++;
            }
        }
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
