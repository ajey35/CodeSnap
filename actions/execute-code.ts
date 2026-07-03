import axios, { AxiosError } from "axios";

const PISTON_API_BASE_URL =
    process.env.NEXT_PUBLIC_PISTON_API_BASE_URL?.replace(/\/$/, "") ??
    "/api/piston";

export interface PistonFile {
    name?: string;
    content: string;
    encoding?: "base64" | "hex" | "utf8";
}

export interface PistonExecuteRequest {
    language: string;
    version: string;
    files: PistonFile[];
    stdin?: string;
    args?: string[];
    run_timeout?: number;
    compile_timeout?: number;
    compile_memory_limit?: number;
    run_memory_limit?: number;
}

export interface PistonStageResult {
    stdout: string;
    stderr: string;
    output: string;
    code: number | null;
    signal: string | null;
}

export interface PistonExecuteResponse {
    language: string;
    version: string;
    run: PistonStageResult;
    compile?: PistonStageResult;
}

export interface PistonRuntime {
    language: string;
    version: string;
    aliases: string[];
    runtime?: string;
}

export interface PistonPackage {
    language: string;
    language_version: string;
    installed: boolean;
}

export interface PistonPackageRequest {
    language: string;
    version: string;
}

export interface PistonPackageResponse {
    language: string;
    version: string;
}

async function pistonRequest<T>(
    path: string,
    options: { method?: "GET" | "POST" | "DELETE"; data?: unknown } = {}
): Promise<T> {
    const url = `${PISTON_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    try {
        const { data } = await axios.request<T>({
            url,
            method: options.method ?? "GET",
            data: options.data,
            timeout: 20000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message =
                (error.response?.data as { message?: string } | undefined)
                    ?.message ??
                error.message ??
                "Piston request failed";

            throw new Error(message);
        }

        throw error;
    }
}

export async function GetPistonRuntimes(): Promise<PistonRuntime[]> {
    return pistonRequest<PistonRuntime[]>("/runtimes");
}

export async function ExecuteCode(
    requestPayload: PistonExecuteRequest
): Promise<PistonExecuteResponse> {
    return pistonRequest<PistonExecuteResponse>("/execute", {
        method: "POST",
        data: requestPayload,
    });
}

export async function GetPistonPackages(): Promise<PistonPackage[]> {
    return pistonRequest<PistonPackage[]>("/packages");
}

export async function InstallPistonPackage(
    requestPayload: PistonPackageRequest
): Promise<PistonPackageResponse> {
    return pistonRequest<PistonPackageResponse>("/packages", {
        method: "POST",
        data: requestPayload,
    });
}

export async function UninstallPistonPackage(
    requestPayload: PistonPackageRequest
): Promise<PistonPackageResponse> {
    return pistonRequest<PistonPackageResponse>("/packages", {
        method: "DELETE",
        data: requestPayload,
    });
}
