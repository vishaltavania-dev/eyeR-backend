const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const generateAIresponse = async (systemPrompt, userPrompt, tokenLength) => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: tokenLength,
      model: process.env.OPEN_AI_MODAL,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response from OpenAI:', error);
    throw error;
  }
};

module.exports = {
  generateAIresponse,
};
