import { closeConnection, connectToDB } from "@/utils/db";
import { NextResponse } from "next/server";
import { generativeParameters } from "weaviate-client";

export async function GET(req) {
    let client = null;
    try {
        // Get the search query from the URL
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || "quiz";
        
        // Connect to the database
        client = await connectToDB();
        console.log("Connected to database");
        
        // Use the Documents collection with the use method as shown in the template
        const documents = client.collections.use("Documents");
        console.log("Searching for documents...");
        
        // Use the RAG pattern with nearText as shown in the template
        const searchResponse = await documents.generate.nearText(query, {
            singlePrompt: {
                prompt: "Summarize this text: {text}"
            },
            groupedTask: { 
                prompt: `You are a helpful AI tutor for computer science students.
                Based on the document content, generate a series of learning steps including explanations, questions, and hands-on coding exercises, in JSON format.
                For the explanation question type, provide a comprehensive explanation of the topic using unhinged and creative language and references while making it easy to digest. Provide comparisons that would make sense while still allowing the user to understand key terms.
                For explanations and hints, make sure to use unhinged and creative language and references while making it easy to digest. Provide comparisons that would make sense while still allowing the user to understand key terms.
                Return the response as a valid JSON object with the following schema:
                {
                  "questions": [
                    {
                      "type": "explanation",
                      "title": "string",
                      "content": "string"
                    },
                    {
                      "type": "multiple_choice_question",
                      "question": "string",
                      "options": ["string", "string", "..."],
                      "correct_option_index": number,
                      "explanation": "string",
                      "hint": "string"
                    },
                    {
                      "type": "code_question",
                      "prompt": "string",
                      "language": "string",
                      "starter_code": "string",
                      "solution": "string",
                      "hint": "string",
                      "explanation": "string"
                    },
                    {
                      "type": "true_false_question",
                      "question": "string",
                      "answer": true or false,
                      "explanation": "string",
                      "hint": "string"
                    },
                    {
                      "type": "free_response_question",
                      "question": "string",
                      "explanation": "string",
                      "hint": "string"
                    },
                    {
                      "type": "quiz_end_summary",
                      "feedback": "string"
                    }
                  ]
                }
                
                Include at least one question of each type. Make sure the JSON is valid and properly formatted.
                Make sure the questions are relevant to the document content.
                `
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
            // Process the results as shown in the template
            for (const result of searchResponse.objects) {
                console.log("Properties:", JSON.stringify(result.properties, null, 2));
                console.log("Single prompt result:", result.generative?.text);
                console.log("Grouped task result:", searchResponse.generative?.text);
            }
            
            // Try to parse the quiz content
            let quizData;
            try {
                // Get the response text
                let responseText = searchResponse.generative?.text || "";
                
                // Remove markdown code block syntax if present
                responseText = responseText.replace(/^```json\n|^```\n|\n```$/g, "");
                
                // Log the cleaned text for debugging
                console.log("Cleaned JSON text:", responseText.substring(0, 100) + "...");
                
                // Try to parse the cleaned text as JSON
                quizData = JSON.parse(responseText);
                console.log("Successfully generated quiz");
            } catch (parseError) {
                console.error("Error parsing quiz JSON:", parseError);
                console.log("Raw response:", searchResponse.generative?.text);
                
                // Return error with the raw text
                return NextResponse.json({
                    status: 500,
                    error: "Failed to generate valid quiz format",
                    rawResponse: searchResponse.generative?.text
                });
            }
            
            return NextResponse.json({
                status: 200,
                quiz: quizData,
                documentName: searchResponse.objects[0].properties.original_file_name
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