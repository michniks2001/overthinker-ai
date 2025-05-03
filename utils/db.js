import weaviate, { generative, vectorizer, generativeParameters } from "weaviate-client"

const weaviateUrl = process.env.WEAVIATE_URL
const weaviateApiKey = process.env.WEAVIATE_API_KEY

export async function connectToDB() {
    const client = weaviate.connectToWeaviateCloud(
        weaviateUrl,
        {
            authCredentials: new weaviate.ApiKey(weaviateApiKey),
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
        vectorizers: vectorizer.text2VecWeaviate(),
        generative: generative.openAI(
            {
                model: "gpt-4o"
            }
        )
    })
}

export async function storeDoc(client, collectionName, fileName, text, originalFileName) { 
    const collection = client.collections.get(collectionName)
    const uuid = await collection.data.insert({
        'file_name': fileName,
        'text': text,
        'original_file_name': originalFileName
    })
    
    return uuid
}

export async function resetDb(client) {
    await client.collections.deleteAll()
}

