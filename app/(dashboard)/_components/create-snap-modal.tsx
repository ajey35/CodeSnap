"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { PlusIcon } from "lucide-react";
import { Input } from "@nextui-org/input";
import { RadioGroup } from "@nextui-org/radio";
import { cn } from "@nextui-org/theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { Image } from "@nextui-org/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

import { codeSnaps, languageOptions } from "@/config/languages";
import { CustomRadio } from "@/components/custom-radio";
import { CreateSnap } from "@/actions";
import { usePRouter } from "@/components/custom-router";

export default function CreateSnapModal({ isMobile }: { isMobile: boolean }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = usePRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.done();
    }, [pathname, searchParams]);

    const FormSchema = z.object({
        snapName: z
            .string()
            .min(1, "Snap Name is required")
            .max(20, "Snap Name must be less than 20 characters")
            .regex(
                /^[a-zA-Z0-9-.]+$/,
                "Snap Names can only include letters, numbers, underscores (-), hyphen (-), and periods (.).",
            ),
        language: z.string().min(1, "Language is required"),
        visibility: z.string().min(1, "Visibility is required"),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            snapName: "",
            language: "",
            visibility: "",
        },
    });

    // find code snippets from language name
    function getCodeByLanguageName(name: string) {
        return codeSnaps[name] || "";
    }

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        setIsLoading(true);
        const userId = session?.user?.id;

        const code = getCodeByLanguageName(values.language);
        let response;

        try {
            response = await CreateSnap(values, userId, code);
        } catch (error) {
            toast.error(
                "An unexpected error occurred. Please try again later.",
            );

            return;
        } finally {
            setIsLoading(false);
        }

        if (response?.snap) {
            toast.success("snap created");

            form.reset();
            onOpenChange();

            router.push(`/snap/${response.snap.id}`);
        } else {
            toast.error("Failed creating snap. Try again later.");
        }
    };

    const handleModalClose = () => {
        form.reset();
    };

    return (
        <>
            <Button
                color="primary"
                endContent={<PlusIcon size={16} />}
                isIconOnly={isMobile}
                onPress={onOpen}
            >
                <span className="hidden sm:flex">Create Snap</span>
            </Button>
            <Modal
                hideCloseButton={isLoading}
                isDismissable={false}
                isOpen={isOpen}
                placement="top"
                onClose={handleModalClose}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1">
                            Create a New Code Snap
                        </ModalHeader>
                        <ModalBody>
                            <Autocomplete
                                defaultItems={languageOptions}
                                errorMessage={
                                    form.formState.errors.language?.message
                                }
                                isDisabled={isLoading}
                                isInvalid={!!form.formState.errors.language}
                                label="Select Language"
                                placeholder="Search for a programming language"
                                required={false}
                                selectedKey={form.watch("language") || null}
                                onSelectionChange={(key) => {
                                    form.setValue("language", key as string, {
                                        shouldValidate: true,
                                    });
                                }}
                            >
                                {(language) => (
                                    <AutocompleteItem
                                        key={language.name}
                                        endContent={language.version}
                                        startContent={
                                            <Image
                                                alt={language.name}
                                                className="h-6 w-6 rounded-none bg-transparent"
                                                src={language.imageURL}
                                            />
                                        }
                                        value={language.name}
                                    >
                                        {language.name}
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>
                            <Input
                                errorMessage={
                                    form.formState.errors.snapName?.message
                                }
                                isDisabled={isLoading}
                                isInvalid={!!form.formState.errors.snapName}
                                label="Snap Name"
                                placeholder="Give your snap a descriptive name"
                                required={false}
                                type="text"
                                value={form.watch("snapName")}
                                onValueChange={(value) => {
                                    form.setValue("snapName", value, {
                                        shouldValidate: true,
                                    });
                                }}
                            />
                            <RadioGroup
                                isRequired
                                classNames={{
                                    wrapper: cn("justify-between"),
                                    description: cn("text-foreground-500"),
                                }}
                                description="Choose who can view your snap. You can change this later."
                                errorMessage={
                                    form.formState.errors.visibility?.message
                                }
                                isDisabled={isLoading}
                                isInvalid={!!form.formState.errors.visibility}
                                orientation="horizontal"
                                size="sm"
                                value={form.watch("visibility")}
                                onValueChange={(value) => {
                                    form.setValue("visibility", value, {
                                        shouldValidate: true,
                                    });
                                }}
                            >
                                <CustomRadio
                                    description="Visible to everyone"
                                    value="public"
                                >
                                    Public
                                </CustomRadio>
                                <CustomRadio
                                    description="Visible only to you"
                                    value="private"
                                >
                                    Private
                                </CustomRadio>
                            </RadioGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                fullWidth
                                color="primary"
                                isDisabled={isLoading}
                                startContent={
                                    !isLoading && <PlusIcon size={16} />
                                }
                                type="submit"
                            >
                                {isLoading ? (
                                    <Spinner color="current" size="sm" />
                                ) : (
                                    "Create Snap"
                                )}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
