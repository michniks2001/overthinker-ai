"use server"

import weaviate from "weaviate-client";
import pdfParse from "pdf-parse";

// Environment variables for Weaviate connection
const weaviateURL = process.env.WEAVIATE_URL;
const weaviateAPIKey = process.env.WEAVIATE_API_KEY;

// Function to handle the POST request for PDF upload and parsing
export async function POST(request) {
    try {
        // Get the PDF file from the request
        const formData = await request.formData();
        const file = formData.get("pdf");

        if (!file) {
            return new Response("No file uploaded", { status: 400 });
        }

        // Convert file to buffer and parse it with pdf-parse
        const buffer = await file.arrayBuffer();
        const data = await pdfParse(buffer);

        // Extract text from the PDF
        const text = data.text;
        console.log("Extracted Text: " + text);

        // Connect to Weaviate cloud client
        const client = await weaviate.connectToWeaviateCloud(
            weaviateURL,
            {
                authCredentials: new weaviate.ApiKey(weaviateAPIKey),
            }
        );

        // Check client readiness
        const clientReadiness = await client.isReady();
        console.log("Weaviate Client Readiness: " + clientReadiness);

        // You can now proceed to interact with Weaviate (e.g., store the PDF text in Weaviate)

        // Close the Weaviate client connection
        client.close();

        // Return a successful response with the parsed text
        return new Response(JSON.stringify({ message: "File uploaded and parsed successfully", extractedText: text }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error processing PDF:", error);
        return new Response("Failed to process PDF", { status: 500 });
    }
}
