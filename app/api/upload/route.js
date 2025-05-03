"use server"

/**
 * @fileoverview API route handler for PDF file uploads.
 * This module processes uploaded PDF files, extracts their text content,
 * and stores them in a Weaviate vector database for later retrieval and analysis.
 * 
 * The upload process involves:
 * 1. Receiving PDF files via form data
 * 2. Saving the file temporarily
 * 3. Parsing the PDF content using pdf2json
 * 4. Storing the document in the Weaviate database
 * 5. Cleaning up temporary files
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import { connectToDB, closeConnection, createCollection, storeDoc, resetDb } from "../../../utils/db";

/**
 * Name of the Weaviate collection where documents will be stored
 * @constant {string}
 */
const COLLECTION_NAME = "Documents";

/**
 * Handles POST requests for PDF file uploads.
 * 
 * @async
 * @function POST
 * @param {Request} req - The incoming HTTP request containing form data with PDF file
 * @returns {NextResponse} JSON response indicating success or failure of the upload process
 */
export async function POST(req) {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("pdf");
    let fileName = "";
    let parsedText = "";
    let originalFileName = "";
    let dbClient = null;
    let docId = null;

    try {
        if (uploadedFiles && uploadedFiles.length > 0) {
            const uploadedFile = uploadedFiles[0];
            console.log('Uploaded file:', uploadedFile);

            if (uploadedFile instanceof File) {
                fileName = uuidv4();
                originalFileName = uploadedFile.name;
                console.log(`Processing file: ${originalFileName} with ID: ${fileName}`);

                const tempFilePath = `/tmp/${fileName}.pdf`;

                try {
                    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
                    await fs.writeFile(tempFilePath, fileBuffer);
                    console.log(`File saved to temporary path: ${tempFilePath}`);
                    
                    const pdfParser = new PDFParser(null, 1);

                    pdfParser.on("pdfParser_dataError", (errData) => {
                        console.error("PDF parsing error:", errData.parserError);
                    });

                    pdfParser.on("pdfParser_dataReady", () => {
                        console.log("PDF parsing completed");
                        parsedText = pdfParser.getRawTextContent();
                    });

                    await new Promise((resolve, reject) => {
                        pdfParser.loadPDF(tempFilePath);
                        pdfParser.on("pdfParser_dataReady", resolve);
                        pdfParser.on("pdfParser_dataError", reject);
                    });
                    console.log(`PDF successfully parsed, content length: ${parsedText.length} characters`);
                } catch (fileError) {
                    console.error("Error processing file:", fileError);
                    throw new Error(`File processing error: ${fileError.message}`);
                }

                try {
                    // SECTION: Database Connection and Setup
                    console.log("Connecting to Weaviate database...");
                    dbClient = await connectToDB();
                    console.log("Database connection established");
                    
                    console.log("Resetting database...");
                    await resetDb(dbClient);
                    console.log("Database reset complete");

                    try {
                        // Create collection if it doesn't exist
                        console.log(`Creating collection: ${COLLECTION_NAME}`);
                        await createCollection(dbClient, COLLECTION_NAME);
                        console.log("Collection created successfully");
                    } catch (collectionError) {
                        // Collection might already exist, which is fine
                        console.log("Collection creation note:", collectionError.message);
                    }
                } catch (dbError) {
                    console.error("Database error:", dbError);
                    throw new Error(`Database error: ${dbError.message}`);
                }

                try {
                    // SECTION: Document Storage
                    console.log("Storing document in database...");
                    console.log(`Collection: ${COLLECTION_NAME}, FileName: ${fileName}, ContentLength: ${parsedText.length}`);
                    
                    docId = await storeDoc(
                        dbClient, 
                        COLLECTION_NAME, 
                        fileName, 
                        parsedText, 
                        originalFileName
                    );
                    console.log("Document stored in database with ID:", docId);
                    
                    // SECTION: Cleanup
                    try {
                        console.log(`Cleaning up temporary file: ${tempFilePath}`);
                        await fs.unlink(tempFilePath);
                        console.log("Temporary file deleted successfully");
                    } catch (unlinkError) {
                        console.warn("Failed to delete temporary file:", unlinkError);
                        // Non-critical error, continue execution
                    }
                } catch (storeError) {
                    console.error("Error storing document in database:", storeError);
                    throw new Error(`Database storage error: ${storeError.message}`);
                }
            } else {
                console.log('Uploaded file is not in the expected format.');
                return new NextResponse("Uploaded file is not in the expected format.", {
                    status: 500,
                });
            }
        } else {
            console.log('No files found.');
            return new NextResponse("No File Found", { status: 404 });
        }

        // SECTION: Response Generation
        const response = new NextResponse(JSON.stringify({
            success: true,
            message: "File uploaded and stored in database",
            fileName: fileName,
            originalFileName: originalFileName,
            documentId: docId,
            parsedText: parsedText
        }));
        response.headers.set("Content-Type", "application/json");
        return response;
    } catch (error) {
        // SECTION: Error Handling
        console.error("Error processing upload:", error);
        return new NextResponse(JSON.stringify({
            success: false,
            message: "Error processing upload",
            error: error.message
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    } finally {
        // SECTION: Resource Cleanup
        if (dbClient) {
            await closeConnection(dbClient);
            console.log("Database connection closed");
        }
    }
}