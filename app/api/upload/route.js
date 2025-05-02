import weaviate from "weaviate-client";
import pdf from "pdf-parse"

const weaviateURL = process.env.WEAVIATE_URL
const weaviateAPIKey = process.env.WEAVIATE_API_KEY

export async function POST(request) {
    const client = await weaviate.connectToWeaviateCloud(
        weaviateURL,
        {
            authCredentials: new weaviate.ApiKey(weaviateAPIKey)
        }
    )

    var clientReadiness = await client.isReady()
    console.log(clientReadiness)

    client.close()

    return new Response("Client is ready", {
        status: 200
    })
}