# AutoStamp Bot

## Automatically gets the highest prize possible on DDD stampgame

-   This bot will play the DDD stampgame for you. Each game will have either the Highest Possible prize available or the second highest prize available (some games its impossible to win the Highest Prize even though it gets displayed). The bot will automatically click to get the highest possible prize that can be acheived.

-   I'm not responsible for any bans, use at your own discretion. Multiple people have used this for a few months without issue and bans are extremely unlikely, but not impossible.

-   Message Camheff on discord (@omni_soft) about any issues for help. This is free of charge, but if you want to send a tip for any of my work:
    -   Tips:
        -   BTC: 3DP4kqweWydfaN1Xd3X7KuBu2dQNQvQPxE
        -   Eth: 0x7E5546922FEfE24171d7F6Aa8CcdE33922305F7f

## To setup

-   Open the project folder in VS Code (open folder at "/AutoStamp") and open a terminal. Then run the command "npm install"

-   Get your Chrome ready the same way as Autojack. Close all Chrome Windows, then create a Shortcut to Chrome. Right Click it, then Click Properties. Under the Shortcut tab, edit the "Target" Field and add TO THE END (without the double quotes)

    -   " --remote-debugging-port=9222 --disable-features=UseEcoQoSForBackgroundProcess"

-   MAKE SURE to include the leading space.

-   Full example after editing looks like:

    -   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --disable-features=UseEcoQoSForBackgroundProcess

## To Run it

-   ONLY use this shortcut to open Chrome. Navigate to DDD and go to the Stampgame, now you can start the bot. Start the bot with the command "npm run start".

-   The bot will connect to the page, and you will see a small red dot appear on the screen. MAKE SURE this dot lines up with the Game Button. If not, Press "Ctrl + C" buttons (while focused on the terminal window) to stop the bot, then drag your Chrome windows resolution until the Red dot lines up with the button (or you can edit the numbers inside the index.js file, up to you).

-   Once the Red Dot is lined up, run the program and let the bot play.

-   At the top of index.js are two values you may need to edit, the constants "delayBuffer" and "viewClickPoint".

    -   Set viewClickPoint to false if you already lined up the click point and want to skip that step (the bot runs slightly faster). This is optional.

    -   Edit the delayBuffer if the bot is repeatedly clicking too fast or too slow. The click delay needed varies from player to player, but 550 seems to work 3/4ths of the time for most people.
    -   The terminal will display text letting you know when its clicking, I'd recommend taking a video for your first couple of runs to see if the bot is clicking at the right time, too slow, too fast, etc.
        -   Increasing the delayBuffer will make the click wait LONGER (slower).
        -   Decreasing it will make the click wait LESS (faster). Adjust accordingly.
