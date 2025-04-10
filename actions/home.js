"use server";

import { serializedCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";

async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await db.cars.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return cars.map(serializedCarData);
  } catch (error) {
    throw new Error("Error fetching cars: " + error.message);
  }
}

export async function processImageSearch(file) {
  try {
    const req = await request();
    // Deduct 1 token from the bucket
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests.Please try again later");
      }

      throw new Error("Request blocked");
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("AI API Key is not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
     Analyze this car image and extract the following information:
     1. Make (manufacturer)
     2. Model
     3. Year (approximately)
     4. Color
     5. Body type (SUV, Sedan, Hatchback, etc.)
     6. Mileage
     7. Fuel type (your best guess)
     8. Transmission type (your best guess)
     9. Price (your best guess)
     9. Short Description as to be added to a car listing

     Format your response as a clean JSON object with these fields:
     {
       "make": "",
       "model": "",
       "year": 0000,
       "color": "",
       "price": "",
       "mileage": "",
       "bodyType": "",
       "fuelType": "",
       "transmission": "",
       "description": "",
       "confidence": 0.0
     }

     For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
     Only respond with the JSON object, nothing else.
   `;

    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    try {
      const carDetails = JSON.parse(cleanedText);

      // Validate the response format
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`
        );
      }

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {}
}
