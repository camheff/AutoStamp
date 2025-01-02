import puppeteer from 'puppeteer-core';
import ghostCursor from 'ghost-cursor';
const { installMouseHelper } = ghostCursor;
import axios from 'axios';

// This is the delay buffer. May need to adjust this if it clicks too early or too late
// 550 seems to work 3/4ths of the time
const delayBuffer = 550;

// Set this value to false if you dont want to skip showing the click point
let viewClickPoint = true;

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
                .includes('backend-prod.dingdingding.com/game/stamp/map') &&
            response.request().method() !== 'OPTIONS'
        ) {
            try {
                const jsonResponse = await response.json();
                if (
                    jsonResponse &&
                    jsonResponse.data &&
                    jsonResponse.data.map
                ) {
                    stepsPassMs = jsonResponse.data.stepsPassMs;
                    let gameOrder = jsonResponse.data.map.steps;
                    let gamePrizes = jsonResponse.data.map.prizes;
                    let biggestPrize = gamePrizes.find((prize) => {
                        return prize.type === 'big_prize' ? prize : null;
                    });
                    let secondBiggestPrize = gamePrizes.find((prize) => {
                        return prize.items[0].amount === 800 ? prize : null;
                    });
                    if (!secondBiggestPrize) {
                        throw new Error('Second biggest prize not found');
                    }
                    console.log(gameOrder);
                    console.log(gamePrizes);
                    // Check if gameOrder contains the index of the biggest prize
                    // If not, use the second biggest prize
                    let prizeToGet;
                    if (gameOrder.includes(biggestPrize?.index)) {
                        prizeToGet = biggestPrize;
                        console.log('Biggest prize is in the game order');
                        indexDesired = gameOrder.indexOf(biggestPrize.index);
                        clickDelay = stepsPassMs * indexDesired + delayBuffer;
                        console.log(
                            `Click Delay will be: ${clickDelay} for Index ${indexDesired}`
                        );
                    } else if (gameOrder.includes(secondBiggestPrize.index)) {
                        prizeToGet = secondBiggestPrize;
                        console.log(
                            'Second biggest prize is in the game order'
                        );
                        indexDesired = gameOrder.indexOf(
                            secondBiggestPrize.index
                        );
                        clickDelay = stepsPassMs * indexDesired + delayBuffer;
                        console.log(
                            `Click Delay will be: ${clickDelay} for Index ${indexDesired}`
                        );
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
    // Increase to move mouse click higher
    let heightOffset = 150;

    // Increase to move mouse more to the Right, Decrease to move more to the Left
    // Negative values are allowed
    let widthOffset = 100;

    const browser = await initializeBrowser();
    const pages = await browser.pages();
    const page = await pages.find((page) =>
        page.url().includes('dingdingding.com')
    );
    if (!page) {
        throw new Error('Failed to find a page on ding ding ding');
    }

    // TODO: IMPORTANT:
    // Uncomment this if we need the bot to refresh the page
    // In order ro get the Map response call to trigger,
    // Might happen if it only happens on load
    page.reload();

    await createListeners(page);
    await delay(1000);

    // Move mouse to center X of screen, 50 pixels above the bottom for height
    // Use Screen Size to calculate the center
    const screenSize = await page.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    });
    const centerX = screenSize.width / 2 + widthOffset;

    // TODO: IMPORTANT:
    // If you need it to be higher (height wise), change the 50 to a higher number
    const centerY = screenSize.height - heightOffset;

    if (viewClickPoint) {
        // Create an overlay div and mark the click location, wait 5 seconds before removing incase changes are needed
        await page.evaluate(
            (x, y) => {
                let overlay = document.createElement('div');
                overlay.id = 'uniqueOverlayId';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.zIndex = '9999';
                overlay.style.pointerEvents = 'none';
                document.body.appendChild(overlay);

                let marker = document.createElement('div');
                marker.style.position = 'absolute';
                marker.style.top = y + 'px';
                marker.style.left = x + 'px';
                marker.style.width = '10px';
                marker.style.height = '10px';
                marker.style.background = 'red';
                overlay.appendChild(marker);
            },
            centerX,
            centerY
        );
        await delay(5000);
        // Remove the overlay
        await page.evaluate(() => {
            let overlay = document.querySelector('#uniqueOverlayId');
            document.body.removeChild(overlay);
        });
    }
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
    await page.mouse.click(centerX + 5, centerY + 3);
    await page.mouse.click(centerX + 7, centerY + 9);
    await page.mouse.click(centerX + 8, centerY + 4);
    console.log('CLICKED FOR PRIZE');
}

await main();
