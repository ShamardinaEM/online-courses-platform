import { Db, MongoClient, type MongoClientOptions } from "mongodb";

const CONNECTION = process.env.MONGO_URL || "mongodb://localhost:27017/";

export const client = new MongoClient(CONNECTION, {
    monitorCommands: true,
} as MongoClientOptions);

export async function run(code: (db: Db) => Promise<void>) {
    const dbName = "online-courses" + genPrefix();
    try {
        await client.connect();
        const db = client.db(dbName);
        try {
            await code(db);
        } finally {
            await db.dropDatabase();
        }
    } finally {
        await client.close();
    }
}

console.log("MongoDB инициализирован");

export function genPrefix() {
    return Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
}

export const getDbName = () => "online-courses" + genPrefix();
