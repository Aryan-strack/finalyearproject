const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });

const analyzeProductImage = async (base64Data) => {
    const key = process.env.GEMINI_API_KEY?.trim();

    if (!key || key === "your_gemini_api_key_here") {
        throw new Error("Gemini API Key is missing or invalid in config.env");
    }

    const ai = new GoogleGenAI({ apiKey: key });

    try {
        console.log("AI: Initializing analysis with Gemini 3 Flash...");

        const mimeMatch = base64Data.match(/^data:(.*);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const base64Content = base64Data.includes("base64,")
            ? base64Data.split("base64,")[1]
            : base64Data.split(",")[1];

        const prompt = `
You are an expert product identification AI. Analyze the uploaded image and identify the product with MAXIMUM PRECISION.

CRITICAL CATEGORY RULES - You MUST follow these exactly:
- If you see a LAPTOP / NOTEBOOK COMPUTER → suggestedCategory = "Laptop"
- If you see a MOBILE PHONE / SMARTPHONE → suggestedCategory = "Mobile"
- If you see a CAMERA / DSLR / MIRRORLESS → suggestedCategory = "Camera"
- If you see HEADPHONES / EARBUDS / SPEAKERS → suggestedCategory = "Audio"
- If you see a SMARTWATCH / FITNESS BAND → suggestedCategory = "Wearable"
- If you see SMART HOME devices (speaker, hub, bulb) → suggestedCategory = "Smart Home"
- If you see JEWELRY (necklace, ring, bracelet, earrings) → suggestedCategory = "Jewelry"
- If you see HOME DECOR (vase, frame, candle, cushion) → suggestedCategory = "Home Decor"
- If you see CLOTHING (shirt, dress, jacket, jeans) → suggestedCategory = "Clothing"
- If you see POTTERY / CERAMICS → suggestedCategory = "Pottery"
- If you see ART / PAINTING / PRINT → suggestedCategory = "Art & Prints"
- If you see TEXTILES (fabric, rug, tapestry, weave) → suggestedCategory = "Textiles"
- If you see LEATHER products (bag, wallet, belt, shoes) → suggestedCategory = "Leather"
- If you see BATH / BODY products (soap, lotion, scrub) → suggestedCategory = "Bath & Body"
- If you see KITCHEN items (utensils, cookware, gadgets) → suggestedCategory = "Kitchen"
- If you see BEAUTY products (makeup, skincare, perfume) → suggestedCategory = "Beauty"
- If you see GARDEN items (pots, tools, plants) → suggestedCategory = "Garden"
- If you see ACCESSORIES (sunglasses, watch, belt, hat) → suggestedCategory = "Accessories"
- If you see GLASS products (glassware, glass art) → suggestedCategory = "Glass"
- If you see METALWORK (metal art, metal decor) → suggestedCategory = "Metalwork"
- DO NOT use the broad "Electronics" category unless it truly does not fit any specific sub-category above.

INSTRUCTIONS:
1. Identify the EXACT product type (e.g., "gaming laptop", "ceramic coffee mug", "silver necklace", "wireless earbuds")
2. Pick suggestedCategory STRICTLY from the rules above — be SPECIFIC, NEVER broad
3. Generate 8-12 SPECIFIC keywords describing this exact product (include material, color, style, use case)
4. Generate 3-5 search phrases a customer would type to find this exact product
5. Identify dominant colors and materials visible

Return ONLY a valid JSON object with this EXACT structure (no extra text):
{
    "description": "3-6 word description of the exact product",
    "keywords": ["8-12 specific keywords"],
    "searchPhrases": ["3-5 natural search phrases"],
    "suggestedCategory": "exact category from the rules above",
    "productType": "specific product type e.g. laptop, smartphone, necklace, mug, jacket",
    "colors": ["dominant colors"],
    "materials": ["materials visible"],
    "style": "style like modern, vintage, minimalist, bohemian, industrial"
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { data: base64Content, mimeType: mimeType } },
                ],
            },
        });

        const text = response.text?.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("AI returned an invalid response format");
        }

        console.log("AI: Analysis complete.");
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and normalize response
        if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
            parsed.keywords = [];
        }
        if (!parsed.searchPhrases || !Array.isArray(parsed.searchPhrases)) {
            parsed.searchPhrases = [];
        }
        if (!parsed.colors || !Array.isArray(parsed.colors)) {
            parsed.colors = [];
        }
        if (!parsed.materials || !Array.isArray(parsed.materials)) {
            parsed.materials = [];
        }

        return parsed;

    } catch (error) {
        console.error("AI Detail:", error.message);

        if (error.status === 429 || error.message.includes("429")) {
            throw new Error("Google API Limit: Please wait 30 seconds before trying again.");
        }

        if (error.status === 404) {
            throw new Error("Gemini model not found. Verify your API key has access.");
        }

        throw new Error(`AI Analysis Error: ${error.message}`);
    }
};

module.exports = { analyzeProductImage };