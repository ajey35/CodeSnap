"use client";

import { LoaderCircle, Play } from "lucide-react";
import { Button } from "@nextui-org/button";
import { toast } from "sonner";

import { useCodeStore } from "@/stores";
import { ExecuteCode } from "@/actions";

export default function RunButton() {
    const { code, language, running, setRunning, setOutput, setError } =
        useCodeStore();

    async function getOutput() {
        setRunning(true);
        const requestData = {
            language: language.name,
            version: language.version,
            files: [
                {
                    content: code,
                },
            ],
        };

        try {
            const result = await ExecuteCode(requestData);

            if (!result.run.stderr) {
                setOutput(result.run.output.split("\n"));
                setError(false);
                toast.success("Compiled Successfully");
            } else {
                setOutput(result.run.output.split("\n"));
                setError(true);
                toast.error("Compile Error!");
            }

            setRunning(false);
        } catch (error) {
            setError(true);
            setRunning(false);
            toast.error("Failed to compile the Code");
        }
    }

    return (
        <>
            <Button
                className="h-8 justify-self-center text-sm font-semibold text-white"
                color="success"
                isDisabled={running}
                size="sm"
                startContent={
                    running ? (
                        <LoaderCircle
                            className="animate-spinner-linear-spin"
                            size={16}
                        />
                    ) : (
                        <Play fill="currentColor" size={16} />
                    )
                }
                onPress={getOutput}
            >
                Run
            </Button>
        </>
    );
}
