// // main.js
// const { launchBrowser } = require("./browser");
// const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
// const { 
//   insertNovel, 
//   insertChapters, 
//   checkNovelExists,
//   getLatestChapterNumber,
//   closeDbConnection
// } = require("./DatabaseOperations");

// // Main execution function
// async function main() {
//     const url = "https://www.mvlempyr.com/novel/reawakening-sss-rank-villains-pov"; // Target URL
//     const browser = await launchBrowser();
//     const page = await browser.newPage();
    
//     try {
//         // Set up the page
//         await page.setUserAgent(
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//         );
//         await page.goto(url, { waitUntil: "networkidle2" });

//         // Scrape novel details
//         const novelData = await scrapeNovelDetails(page);
//         console.log("Novel information:", novelData);

//         if (!novelData.title || !novelData.author) {
//             console.log("Missing essential novel data (title or author). Exiting.");
//             return;
//         }

//         // Store novel in database or get existing ID
//         const novelId = await insertNovel({
//             title: novelData.title,
//             author: novelData.author,
//             description: novelData.synopsis,
//             cover_image_url: novelData.imageLink,
//             tags: novelData.tags,
//             genres: novelData.genres,
//             status: novelData.status,
//         });

//         if (!novelId) {
//             console.log("Failed to process novel data. Exiting.");
//             return;
//         }

//         // Get latest chapter from DB to determine how many chapters to scrape
//         const latestChapterNumber = await getLatestChapterNumber(novelId);
//         console.log(`Current chapters in database: ${latestChapterNumber}`);
//         console.log(`Total chapters on site: ${novelData.numOfCh}`);

//         if (latestChapterNumber >= novelData.numOfCh) {
//             console.log("Novel is already up to date. No new chapters to scrape.");
//             return;
//         }

//         // Calculate how many new chapters to scrape
//         const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
//         console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

//         // Scrape chapters (only the new ones)
//         // If no chapters exist, scrape all. Otherwise, scrape only new chapters
//         const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
//         console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

//         // Store new chapters in database
//         if (scrapedChapters.length > 0) {
//             const newChaptersCount = await insertChapters(novelId, scrapedChapters);
//             console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
//         } else {
//             console.log("No new chapters to store.");
//         }

//     } catch (error) {
//         console.error("Error during scraping:", error);
//     } finally {
//         // Close browser when done
//         await browser.close();
//         // Close database connection
//         await closeDbConnection();
//         console.log("Scraping process completed");
//     }
// }

// // Execute the main function
// main().catch(console.error);

// main.js
const { launchBrowser } = require("./browser");
const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
const { 
  insertNovel, 
  insertChapters, 
  checkNovelExists,
  getLatestChapterNumber,
  closeDbConnection
} = require("./DatabaseOperations");

// Main execution function
async function main() {

    const urls = [
        "https://www.mvlempyr.com/novel/clearing-an-isekai-with-the-zero-believers-goddess---the-weakest-mage-among-the-classmates-wn",
  "https://www.mvlempyr.com/novel/climbing-the-tower-to-be-a-god-with-10x-gacha-system",
  "https://www.mvlempyr.com/novel/code-zulu-alpha-nerd-in-the-apocalypse",
  "https://www.mvlempyr.com/novel/coiling-dragon",
  "https://www.mvlempyr.com/novel/combat-maid-harem",
  "https://www.mvlempyr.com/novel/come-on-son-you-got-to-breakthrough-now",
  "https://www.mvlempyr.com/novel/common-sense-of-a-dukes-daughter",
  "https://www.mvlempyr.com/novel/commushou-no-ore-ga-koushou-skill-ni-zenfurishite-tenseishita-kekka",
  "https://www.mvlempyr.com/novel/complete-martial-arts-attributes",
  "https://www.mvlempyr.com/novel/comprehension-ability-creating-and-teaching-the-dao-in-various-worlds",
  "https://www.mvlempyr.com/novel/concubines-lead-to-strength-the-path-to-immortality-begins-with-taking-a-spouse",
  "https://www.mvlempyr.com/novel/confinement-king-wn",
  "https://www.mvlempyr.com/novel/conquering-his-cold-heart",
  "https://www.mvlempyr.com/novel/conquering-system-harem-with-infinite-rebirths",
  "https://www.mvlempyr.com/novel/conquering-the-games-world",
  "https://www.mvlempyr.com/novel/conquering-the-novel",
  "https://www.mvlempyr.com/novel/conquest-of-taboo-and-debauchery",
  "https://www.mvlempyr.com/novel/conquest-of-the-fallen-dark-dominions",
  "https://www.mvlempyr.com/novel/cooking-with-wild-game-ln",
  "https://www.mvlempyr.com/novel/cosmic-ruler",
  "https://www.mvlempyr.com/novel/cosmic-trading-system",
  "https://www.mvlempyr.com/novel/counterattack-of-the-cannon-fodder-chambermaid",
  "https://www.mvlempyr.com/novel/crazy-are-you-really-a-beast-tamer",
  "https://www.mvlempyr.com/novel/creating-an-industrial-empire-in-19th-century-parallel-world",
  "https://www.mvlempyr.com/novel/creating-heavenly-laws",
  "https://www.mvlempyr.com/novel/creating-the-shura-palace-in-a-fantasy-world",
  "https://www.mvlempyr.com/novel/creation-of-all-things",
  "https://www.mvlempyr.com/novel/criminal-x-epitome-of-evil",
  "https://www.mvlempyr.com/novel/cronus-system-against-the-gods",
  "https://www.mvlempyr.com/novel/crossdressing-to-survive-an-apocalypse-bl",
  "https://www.mvlempyr.com/novel/crossing-to-the-future-its-not-easy-to-be-a-man",
  "https://www.mvlempyr.com/novel/crushing-flags-and-claiming-the-villainess",
  "https://www.mvlempyr.com/novel/cub-raising-association",
  "https://www.mvlempyr.com/novel/cuckold-wizards-adventure",
  "https://www.mvlempyr.com/novel/cultivating-disciples-to-breakthrough",
  "https://www.mvlempyr.com/novel/cultivating-for-a-hundred-lifetimes-to-ascension",
  "https://www.mvlempyr.com/novel/cultivation-chat-group",
  "https://www.mvlempyr.com/novel/cultivation-is-creation-world-hopping-plant-based-xianxia",
  "https://www.mvlempyr.com/novel/cultivation-is-just-so-scientific",
  "https://www.mvlempyr.com/novel/cultivation-my-augmented-statuses-have-unlimited-duration",
  "https://www.mvlempyr.com/novel/cultivation-online",
  "https://www.mvlempyr.com/novel/cultivation-starts-from-devouring-the-dao-fruits",
  "https://www.mvlempyr.com/novel/cultivation-when-you-take-things-to-the-extreme",
  "https://www.mvlempyr.com/novel/cultivator-with-modern-ai",
  "https://www.mvlempyr.com/novel/cursed-immortality",
  "https://www.mvlempyr.com/novel/custom-made-demon-king"
      ];

    const browser = await launchBrowser();

    try {
        for (let url of urls) {
            console.log(`Scraping novel from URL: ${url}`);
            const page = await browser.newPage();

            try {
                // Set up the page
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                );
                await page.goto(url, { waitUntil: "networkidle2" });

                // // Scrape novel details
                // const novelData = await scrapeNovelDetails(page);
                // console.log("Novel information:", novelData);

                // if (!novelData.title || !novelData.author) {
                //     console.log("Missing essential novel data (title or author). Exiting.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Store novel in database or get existing ID
                // const novelId = await insertNovel({
                //     title: novelData.title,
                //     author: novelData.author,
                //     description: novelData.synopsis,
                //     cover_image_url: novelData.imageLink,
                //     tags: novelData.tags,
                //     genres: novelData.genres,
                //     status: novelData.status,
                // });

                // if (!novelId) {
                //     console.log("Failed to process novel data. Skipping.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Get latest chapter from DB to determine how many chapters to scrape
                // const latestChapterNumber = await getLatestChapterNumber(novelId);
                // console.log(`Current chapters in database: ${latestChapterNumber}`);
                // console.log(`Total chapters on site: ${novelData.numOfCh}`);

                // if (latestChapterNumber >= novelData.numOfCh) {
                //     console.log("Novel is already up to date. No new chapters to scrape.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Calculate how many new chapters to scrape
                // const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
                // console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

                // // Scrape chapters (only the new ones)
                // const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
                // console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Scrape novel details
        const novelData = await scrapeNovelDetails(page);
        console.log("Novel information:", novelData);

        if (!novelData.title || !novelData.author) {
            console.log("Missing essential novel data (title or author). Exiting.");
            continue;  // Skip this novel and move to the next one
        }

        // Store novel in database or get existing ID
        const novelId = await insertNovel({
            title: novelData.title,
            author: novelData.author,
            description: novelData.synopsis,
            cover_image_url: novelData.imageLink,
            tags: novelData.tags,
            genres: novelData.genres,
            status: novelData.status,
        });

        if (!novelId) {
            console.log("Failed to process novel data. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Get latest chapter from DB to determine how many chapters to scrape
        const latestChapterNumber = await getLatestChapterNumber(novelId);
        
        // Use the most reliable chapter count - prefer numOfCh but fall back to chapters
        // if numOfCh is zero
        const totalChapters = novelData.numOfCh || parseInt(novelData.chapters) || 0;
        
        console.log(`Current chapters in database: ${latestChapterNumber}`);
        console.log(`Total chapters on site: ${totalChapters}`);

        if (latestChapterNumber >= totalChapters || totalChapters === 0) {
            console.log("Novel is already up to date or no chapters found. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Calculate how many new chapters to scrape
        const chaptersToScrape = totalChapters - latestChapterNumber;
        console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

        // Scrape chapters (only the new ones)
        const scrapedChapters = await scrapeChapters(page, totalChapters, latestChapterNumber);
        console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Store new chapters in database
                if (scrapedChapters.length > 0) {
                    const newChaptersCount = await insertChapters(novelId, scrapedChapters);
                    console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
                } else {
                    console.log("No new chapters to store.");
                }

            } catch (error) {
                console.error(`Error during scraping URL: ${url}`, error);
            } finally {
                // Close the page after scraping
                await page.close();
            }
        }

    } catch (error) {
        console.error("Error during scraping process:", error);
    } finally {
        // Close browser when done
        await browser.close();
        // Close database connection
        await closeDbConnection();
        console.log("Scraping process completed");
    }
}

// Execute the main function
main().catch(console.error);
