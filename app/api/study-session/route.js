import { closeConnection, connectToDB } from "@/utils/db";
import { NextResponse } from "next/server";
import { generativeParameters } from "weaviate-client";

export async function GET(req) {
    let client = null;
    try {
        // Connect to the database
        client = await connectToDB();
        console.log("Connected to database");
        
        // Use the Documents collection with the use method
        const documents = client.collections.use("Documents");
        console.log("Searching for documents...");
        
        // Use the RAG pattern with nearText as shown in the example
        const searchResponse = await documents.generate.nearText("summary", {
            singlePrompt: {
                prompt: "Summarize this text: {text}"
            },
            groupedTask: { 
                prompt: "Provide a comprehensive summary of this document"
            },
            config: generativeParameters.openAI({
                model: "gpt-4o",
            }),
        },{ 
            limit: 1,
            targetVector: "text",
        });
        
        console.log(`Found ${searchResponse.objects.length} documents`);
        
        if (searchResponse.objects.length > 0) {
            // Process the results as shown in the example
            for (const result of searchResponse.objects) {
                console.log("Properties:", JSON.stringify(result.properties, null, 2));
                console.log("Single prompt result:", result.generative?.text);
                console.log("Grouped task result:", searchResponse.generative?.text);
            }
            
            return NextResponse.json({
                status: 200,
                summary: searchResponse.objects[0].generative?.text,
                groupedSummary: searchResponse.generative?.text,
                document: searchResponse.objects[0].properties
            });
        } else {
            return NextResponse.json({
                status: 404,
                message: "No documents found"
            });
        }
    } catch (error) {
        console.error("Error in study session:", error);
        return NextResponse.json({
            status: 500,
            error: error.message
        }, { status: 500 });
    } finally {
        if (client) {
            closeConnection(client);
            console.log("Database connection closed");
        }
    }
}