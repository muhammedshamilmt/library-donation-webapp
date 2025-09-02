import { MongoClient, Db } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  const uri = process.env.MONGODB_URI
  if (!uri || uri.trim().length === 0) {
    throw new Error("MONGODB_URI is not set. Please define it in your environment.")
  }
  const client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise!

export async function getDb(dbName?: string): Promise<Db> {
  const client = await clientPromise
  // Priority: explicit arg > env MONGODB_DB
  if (dbName && dbName.trim().length > 0) {
    return client.db(dbName)
  }
  const envDb = process.env.MONGODB_DB
  if (envDb && envDb.trim().length > 0) {
    return client.db(envDb)
  }
  throw new Error("MONGODB_DB is not set. Please define it in your environment.")
}


