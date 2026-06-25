import { db } from "@/lib/db";

export const GetSnaps = (
    userID: string | undefined,
    searchQuery: string = "",
    sortBy: "asc" | "desc" = "desc",
) => {
    return db.snap.findMany({
        where: {
            authorId: userID,
            OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { language: { contains: searchQuery, mode: "insensitive" } },
            ],
        },
        orderBy: {
            createdAt: sortBy,
        },
    });
};
