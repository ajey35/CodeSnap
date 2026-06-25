import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, password } = body;

        // check if email already exists
        const existingUserByEmail = await db.user.findUnique({
            where: { email },
        });

        // run if email already exists
        if (existingUserByEmail) {
            return NextResponse.json(
                { user: null, message: "User already exists" },
                { status: 409 },
            );
        }

        // generate hashed password from bcrypt
        const hashedPassword = await hash(password, 10);

        if (!hashedPassword) {
            return;
        }

        // add new user to the database
        const newUser = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // Remove the password from the response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            {
                user: userWithoutPassword,
                message: "User Created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 },
        );
    }
}
