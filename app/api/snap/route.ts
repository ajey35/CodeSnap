import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { language, snapName, visibility, userId, code } = body;

        // Validate that required fields are present
        if (!language || !snapName || !visibility || !userId || !code) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 },
            );
        }

        // Create new snap in the database
        const newSnap = await db.snap.create({
            data: {
                language,
                name: snapName,
                visibility,
                authorId: userId,
                code,
            },
        });

        return NextResponse.json(
            {
                message: "Snap created successfully",
                snap: newSnap,
            },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 },
        );
    } finally {
        db.$disconnect();
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { snapId, code } = body;

        if (!snapId || !code) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 },
            );
        }

        const updatedSnap = await db.snap.update({
            where: { id: snapId },
            data: { code },
        });

        return NextResponse.json(
            {
                message: "Snap updated successfully",
                snap: updatedSnap,
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 },
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const snapId = searchParams.get("id");

        if (!snapId) {
            return NextResponse.json(
                { message: "Snap ID is required" },
                { status: 400 },
            );
        }

        await db.snap.delete({
            where: { id: snapId },
        });

        return NextResponse.json(
            { message: "Snap deleted successfully" },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 },
        );
    }
}
