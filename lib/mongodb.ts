import { MongoClient, Db } from "mongodb"

const DEFAULT_URI = "mongodb://localhost:27017/library-donation"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  const uri = process.env.MONGODB_URI || DEFAULT_URI
  const client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise!

export async function getDb(dbName?: string): Promise<Db> {
  const client = await clientPromise
  // If the URI has a database name, client.db() will use it by default
  return dbName ? client.db(dbName) : client.db()
}


