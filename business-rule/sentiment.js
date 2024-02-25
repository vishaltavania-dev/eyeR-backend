const Restaurant = require('../models/review');
const Indicator = require("../models/indicator");
const { generateAIresponse } = require('../config/commonFunction');

const saveIndicators = async() => {
    let restaurant = await Restaurant.findOne({
        branch_code: "s6bh"
    })
    console.log(restaurant.reviews)
    let comments = restaurant.reviews.map((c) => {
        return c.comment
    })
    console.log(comments);
    const systemPrompt =
        `You will be given with reviews of restraunt on foodpanda for different restraunt you need to analyze sentiments of that and only give response in positive , negative and neutral 
        like if review is packaging of food is great then it comes in positive ,then give response like in positives - packaging and it should be 1 or 2 word only.
        So give points all the three indicators based on reviews  and summary of the indicators based on the given points of max 30 words and max 8 points in negative,positive and neutral indicator   in object {positive:[],negative:[],neutral:[],positiveSummary:"",negativeSummary:"",neutralSummary:""} , give in english language if reviews are in other language .
         `;
    const userPrompt = `Reviews:${comments}`;
    const tokenLength = 15; // Example
    const response = await generateAIresponse(
        systemPrompt,
        userPrompt,
        3000

    );
    let indicators = await JSON.parse(response);
    console.log(indicators);
    const newIndicator = new Indicator({
        positive: indicators.positive,
        negative: indicators.negative,
        neutral: indicators.neutral,
        positiveSummary: indicators.positiveSummary,
        negativeSummary: indicators.negativeSummary,
        neutralSummary: indicators.neutralSummary,
        restaurant: restaurant._id // Assign the student to the newly created class
    });

    // Save the new student to the database
    let data = await newIndicator.save();
    console.log(data);

}

module.exports = {
    saveIndicators
}