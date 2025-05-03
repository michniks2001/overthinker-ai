import weaviate, { generative, vectorizer, generativeParameters, configure, dataType } from "weaviate-client"

const weaviateUrl = process.env.WEAVIATE_URL
const weaviateApiKey = process.env.WEAVIATE_API_KEY

export async function connectToDB() {
    // Get the OpenAI API key from the environment
    const openaiApiKey = process.env.OPENAI_APIKEY;
    
    const client = weaviate.connectToWeaviateCloud(
        weaviateUrl,
        {
            authCredentials: new weaviate.ApiKey(weaviateApiKey),
            headers: {
                'X-OpenAI-Api-Key': openaiApiKey  // Pass OpenAI API key in the headers
            },
            // Configure generative provider for OpenAI
            generative: generative.openAI({
                apiKey: openaiApiKey,
                model: 'gpt-4o', // or any other model you prefer
                maxTokens: 1000
            })
        }
    )

    return client
}

export async function closeConnection(client) {
    if (client)
        client.close()
    else
        console.log("No client found")
}

export async function createCollection(client, collectionName) {
    await client.collections.create({
        name: collectionName,
        vectorizers: [
            vectorizer.text2VecOpenAI({
                name: 'text',
                sourceProperties: ['text'],
                vectorIndexConfig: configure.vectorIndex.hnsw()
            })
        ],
        properties: [
            {
                name: 'file_name', 
                dataType: dataType.TEXT  // Changed from array to string
            },
            {
                name: 'text', 
                dataType: dataType.TEXT  // Changed from array to string
            },
            {
                name: 'original_file_name', 
                dataType: dataType.TEXT  // Changed from array to string
            }
        ]
    })
}

export async function storeDoc(client, collectionName, fileName, text, originalFileName) {
    const collection = client.collections.get(collectionName)
    const uuid = await collection.data.insert({
        properties: {
            'file_name': fileName,
            'text': text,
            'original_file_name': originalFileName
        }
    })

    return uuid
}

export async function resetDb(client) {
    await client.collections.deleteAll()
}

