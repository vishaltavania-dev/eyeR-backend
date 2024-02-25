const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors')
const { generateAIresponse } = require('./config/commonFunction');
const Restaurant = require('./models/review');
const { saveIndicators } = require('./business-rule/sentiment');
const Indicator = require('./models/indicator');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const scraperApiBaseUrl = 'https://api.scraperapi.com';
const scraperApiKey = process.env.SCRAPER_API_KEY;
mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@cluster0.o0zy1.mongodb.net/eyer-puppeteer`
    )
    .then((db) => {
        console.log('db is connected');
    })
    .catch(() => {
        console.log(`Error in connecting in DB`);
    });

app.get('/', (req, res) => {
    console.log('comming');
    res.send('Welcome to EyeR');
});
// review scraping of McDonald or Jollibee restaurant branches in Manila
app.get('/multiple-url', async(req, res) => {
    try {
        const { data } = await axios({
            data: {
                apiKey: process.env.SCRAPPER_API,
                urls: ['https://example.com/page1', 'https://example.com/page2'],
            },
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            url: 'https://async.scraperapi.com/batchjobs',
        });

        console.log(data);
    } catch (error) {
        console.log('error');
    }
});
app.get('/get-google-reviews', async(req, res) => {
    try {
        const searchQuery = "McDonald's SM Manila";
        const payload = {
            api,
        };

        //   const newLocal = `${scraperApiBaseUrl}/?api_key=${scraperApiKey}&url=https://www.google.com/search?q=${encodeURIComponent(
        //       searchQuery
        //   )}`;
        // Make a request to Scraper API to get the Google search results
        // const scraperApiUrl = newLocal;

        const { data } = await axios.get();

        //review-snippet

        // Extract and parse the relevant information from the HTML (customize based on actual structure)
        const reviews = data;

        res.json({ success: true, reviews });
    } catch (error) {}
});

app.get('/test', async(req, res) => {
    const productData = [];
    const apiKey = process.env.SCRAPER_API_KEY; // Replace with your Scraper API key
    const productUrl = `https://www.google.com/maps/place/McDonald's+SM+Manila/@14.5901896,120.9112981,13z/data=!4m12!1m2!2m1!1smcdonald's+manila!3m8!1s0x3397ca1f56da8bf3:0x7c0e52c8ccc35f9c!8m2!3d14.5901896!4d120.9833959!9m1!1b1!15sChFtY2RvbmFsZCdzIG1hbmlsYSIDiAEBWhMiEW1jZG9uYWxkJ3MgbWFuaWxhkgEUZmFzdF9mb29kX3Jlc3RhdXJhbnTgAQA!16s%2Fg%2F11xkjbwsm?entry=ttu`;
    const payload = {
        api_key: apiKey,
        url: productUrl,
        autoparse: 'true',
    };

    try {
        const response = await axios.get('https://api.scraperapi.com', {
            params: payload,
        });
        const product = response.data;

        console.log(productData);
    } catch (error) {
        console.log(error);
    }
});

// sentimental analysis api of chatgpt

// testing different scrapper
// 1. ScrappingBee
async function saveDataToDatabase(reviewsData) {
    try {
        // Create a new restaurant instance
        const restaurant = new Restaurant({
            branch_code: reviewsData.branch_code,
            restaurant_name: reviewsData.restaurant_name,
            overall_rating: reviewsData.overall_rating,
            total_rating: reviewsData.total_rating.overall,
            five_star_percentage: parseFloat(
                reviewsData.five_to_one_star_percentage[0]
            ),
            four_star_percentage: parseFloat(
                reviewsData.five_to_one_star_percentage[1]
            ),
            three_star_percentage: parseFloat(
                reviewsData.five_to_one_star_percentage[2]
            ),
            two_star_percentage: parseFloat(
                reviewsData.five_to_one_star_percentage[3]
            ),
            one_star_percentage: parseFloat(
                reviewsData.five_to_one_star_percentage[4]
            ),
            reviews: [],
        });

        // Loop through reviews and add them to the restaurant instance
        for (const review of reviewsData.reviews) {
            restaurant.reviews.push({
                reviewer_name: review.reviewer_name,
                comment: review.comment,
                created_at: review.created_at,
                ratings: review.ratings,
            });
        }

        // Save the restaurant instance to the database
        await restaurant.save();
        console.log('Data saved successfully!');
    } catch (error) {
        console.error('Error saving data to the database:', error);
    } finally {
        // Close the Mongoose connection after saving
        mongoose.connection.close();
    }
}
app.get('/get-foodpanda-reviews', async(req, res) => {
    try {
        let branchCode = req.body.branchcode || 'y2lt';

        const encodedUrl = `https://www.foodpanda.ph/restaurant/${branchCode}`;
        const apiKey =
            'AYXZP2NCYNWXZEHCYVZZRWNQEOLDBIK21PPJD8682OMLIAFT9W4XEBLTGN4XNR9R3MUIR57ALDB8KXRH';
        const scrapingbee = require('scrapingbee');

        async function get(url) {
            var client = new scrapingbee.ScrapingBeeClient(apiKey);
            let response = await client.get({
                url: url,
                params: {
                    block_resources: false,

                    js_scenario: {
                        instructions: [{
                                wait_for_and_click: '//span[text()="See reviews"]',
                            },
                            {
                                wait_for: '.info-reviews-modal-review-card',
                            },
                        ],
                    },
                    extract_rules: {
                        restaurant_name: '.bds-c-modal__header__subtitle--truncate',
                        overall_rating: '//div[@data-testid="summary-section-rating-score"]',
                        total_rating: {
                            selector: '//div[@data-testid="summary-section-rating-count"]',
                            type: 'item',
                            output: {
                                overall: '.f-label-small-font-size.fw-label-small-font-weight.lh-label-small-line-height.ff-label-small-font-family',
                            },
                        },
                        five_to_one_star_percentage: {
                            selector: '//div[@data-testid="ratings-distribution-end"]',
                            type: 'list',
                        },

                        reviews: {
                            selector: '.info-reviews-modal-review-card',
                            type: 'list',
                            output: {
                                reviewer_name: '.info-reviews-modal-reviewer-name',
                                comment: '.info-reviews-modal-description',
                                created_at: '.vendor-info-modal-review-date',
                                ratings: {
                                    selector: '.box-flex.rating.rating--star-type-full.ai-center.fw-nowrap.fd-row',
                                    type: 'list',
                                },
                            },
                        },
                    },
                },
            });

            return response;
        }

        get(encodedUrl)
            .then(async function(response) {
                console.log('response =>', response);
                var decoder = new TextDecoder();
                let text = JSON.parse(decoder.decode(response.data));

                text.reviews.forEach((singleItem) => {
                    singleItem.ratings = singleItem.ratings.length;
                    return singleItem;
                });

                const saveDataInDb = await saveDataToDatabase(text);
                console.log('saveDataInDb');
                return res.send({ branch_code: branchCode, ...text });
            })
            .catch((e) => console.log('A problem occurs: ' + e.response.data));
    } catch (error) {
        console.log(error);
    }
});
app.get('/generate-response', async(req, res) => {
    // Sample data - you can replace this with actual data
    const systemPrompt =
        'You will be given with reviews of restraunt on foodpanda for different restraunt you need to analyze sentiments of that and only give response in positive , negative and neutral';
    const userPrompt = `Staff/Crew McD Btu, macam mana nak mkn bubur if tak provide cutleries w/pun dah request tapi tak bagi? Celup guna jari ke? Nasi lemak boleh la mkn dgn tgn…bubur?`;
    const tokenLength = 10; // Example token length

    try {
        // Call the generateResponse function from gptService
        const response = await generateAIresponse(
            systemPrompt,
            userPrompt,
            tokenLength
        );

        // Send the response back to the client
        res.send(response);
    } catch (error) {
        // Handle errors
        console.error('Error generating response:', error);
        res.status(500).send('Error generating response');
    }
});
app.get('/indicators/:id', async(req, res) => {
    try {
        let vendorId = req.params.id;
        const restaurant = await Restaurant.findOne({
            branch_code: vendorId
        })
        console.log(restaurant);

        const indicatorData = await Indicator.findOne({ restaurant: restaurant._id });;

        if (!indicatorData) {
            throw new Error('Indicator data not found for the given branch code');
        }

        res.send({ status: true, statusCode: 200, data: indicatorData, error: null });
    } catch (error) {
        res.send({ status: false, statusCode: 500, data: null, error: error });
    }

})

const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
    console.log(`Server is running on ${PORT}`);
    // saveIndicators()


});