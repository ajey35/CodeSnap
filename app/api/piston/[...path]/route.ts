import { NextResponse } from "next/server";
import axios from "axios";

const PISTON_API_BASE_URL =
    process.env.NEXT_PUBLIC_PISTON_API_BASE_URL?.replace(/\/$/, "") ??
    "https://emkc.org/api/v2/piston";

function buildPistonUrl(path: string[]) {
    const joinedPath = path.join("/");
    return `${PISTON_API_BASE_URL}/${joinedPath}`;
}

async function proxyRequest(req: Request, path: string[]) {
    const url = buildPistonUrl(path);

    try {
        const requestInit: any = {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 20000,
        };

        if (req.method !== "GET" && req.method !== "HEAD") {
            requestInit.data = await req.json();
        }

        const response = await axios.request({
            url,
            ...requestInit,
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

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
    return proxyRequest(req, params.path ?? []);
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
    return proxyRequest(req, params.path ?? []);
}

export async function DELETE(
    req: Request,
    { params }: { params: { path: string[] } },
) {
    return proxyRequest(req, params.path ?? []);
}

export async function PATCH(
    req: Request,
    { params }: { params: { path: string[] } },
) {
    return proxyRequest(req, params.path ?? []);
}
