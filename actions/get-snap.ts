import { db } from "@/lib/db";

export const GetSnap = (snapID: string) => {
    return db.snap.findUnique({ where: { id: snapID } });
};
