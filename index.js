import puppeteer from 'puppeteer-core';
import ghostCursor from 'ghost-cursor';
const { installMouseHelper } = ghostCursor;
import axios from 'axios';

let indexDesired;
let stepsPassMs;
let clickDelay;

async function initializeBrowser() {
    let response;
    try {
        response = await axios.get('http://127.0.0.1:9222/json/version');
    } catch (error) {
        throw new Error(
            'Failed to connect to Chrome. Make sure your running Chrome with the --remote-debugging-port=9222 flag'
        );
    }
    const webSocketDebuggerUrl = response.data.webSocketDebuggerUrl;
    if (!webSocketDebuggerUrl) {
        throw new Error('webSocketDebuggerUrl not found');
    }
    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl,
            defaultViewport: null,
            slowMo: 0,
        });
        return browser;
    } catch (error) {
        throw new Error(
            'Failed to connect to Chrome with the webSocketDebuggerUrl'
        );
    }
}

async function createListeners(page) {
    page.on('response', async (response) => {
        if (
            response
                .url()
                .includes('backend-prod.dingdingding.com/game/stamp/map')
        ) {
            try {
                const jsonResponse = await response.json();
                if (jsonResponse && jsonResponse.data) {
                    stepsPassMs = jsonResponse.data.stepsPassMs;
                    let gameOrder = response.data.map.steps;
                    let gamePrizes = response.data.map.prizes;
                    let biggestPrize = gamePrizes.find((prize) => {
                        return prize.type === 'big_prize' ? prize : null;
                    });
                    if (!biggestPrize) {
                        throw new Error('Biggest prize not found');
                    }
                    let secondBiggestPrize = gamePrizes.find((prize) => {
                        return prize.items[0].amount === 2160000 ? prize : null;
                    });
                    if (!secondBiggestPrize) {
                        throw new Error('Second biggest prize not found');
                    }

                    // Check if gameOrder contains the index of the biggest prize
                    // If not, use the second biggest prize
                    let prizeToGet;
                    if (gameOrder.includes(biggestPrize?.index)) {
                        prizeToGet = biggestPrize;
                        console.log('Biggest prize is in the game order');
                        indexDesired = gameOrder.indexOf(
                            secondBiggestPrize.index
                        );
                        // Buffer is 200 MS, still have 150MS left after clicking
                        clickDelay = stepsPassMs * indexDesired + 50;
                    } else if (gameOrder.includes(secondBiggestPrize.index)) {
                        prizeToGet = secondBiggestPrize;
                        console.log(
                            'Second biggest prize is in the game order'
                        );
                        indexDesired = gameOrder.indexOf(
                            secondBiggestPrize.index
                        );
                        // Buffer is 200 MS, still have 150MS left after clicking
                        clickDelay = stepsPassMs * indexDesired + 50;
                    } else {
                        throw new Error(
                            'Biggest prize and second biggest prize not in game order'
                        );
                    }
                }
            } catch (error) {
                console.log('error', error);
            }
        }
    });
}

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function main() {
    const browser = await initializeBrowser();
    //const page = await browser.newPage();
    const pages = await browser.pages();
    const page = await pages.find((page) =>
        page.url().includes('dingdingding.com')
    );
    if (!page) {
        throw new Error('Failed to find a page on ding ding ding');
    }
    await installMouseHelper(page);

    // TODO: IMPORTANT:
    // Uncomment this if we need the bot to refresh the page
    // In order ro get the Map response call to trigger,
    // Might happen if it only happens on load
    //page.reload();

    await createListeners(page);
    await delay(1000);

    // Move mouse to center X of screen, 50 pixels above the bottom for height
    // Dont use ghost cursor
    // Use Screen Size to calculate the center
    const screenSize = await page.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });
    const centerX = screenSize.width / 2;

    // TODO: IMPORTANT:
    // If you need it to be higher (height wise), change the 50 to a higher number
    const centerY = screenSize.height - 50;
    await page.mouse.move(centerX, centerY);

    // Wait for clickDelay to have a value before clicking to start the game
    // When the game starts (right after the first click), await the clickDelay amount in MS, then click again

    await delay(5000);
    // Loop until clickDelay has a value
    while (!clickDelay) {
        await delay(1000);
    }

    console.log('STARTING GAME');
    // Click to start the game
    await page.mouse.click(centerX, centerY);
    await delay(clickDelay);
    await page.mouse.click(centerX, centerY);
    console.log('CLICKED FOR PRIZE');
}

await main();
