import { NextResponse } from "next/server";
import axios from "axios";

const PISTON_API_BASE_URL =
    process.env.NEXT_PUBLIC_PISTON_API_BASE_URL?.replace(/\/$/, "") ??
    "https://emkc.org/api/v2/piston";

async function proxyRequest(path: string, req: Request) {
    const url = `${PISTON_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const body = await req.json();

    try {
        const response = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 20000,
        });

        return NextResponse.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        const axiosError = axios.isAxiosError(error) ? error : null;
        const message =
            axiosError?.response?.data?.message ||
            axiosError?.message ||
            "Piston proxy request failed.";
        const status = axiosError?.response?.status || 500;

        return NextResponse.json({ message }, { status });
    }
}

export async function POST(req: Request) {
    return proxyRequest("/execute", req);
}
