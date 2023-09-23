"use client";

import qs from "query-string";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChannelType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModel } from "@/hooks/use-model-store";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormControl, FormLabel, FormField, FormMessage, FormItem, Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name => name !== "general",
        {
            message: "Channel name cannot be 'general'"
        }
    ),
    type: z.nativeEnum(ChannelType)
});

export const CreateChannelModel = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();
    const params = useParams();
    const isModelOpen = isOpen && type === "createChannel";
    const { channelType } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT,
        }
    });

    useEffect(() => {
        if (channelType) {
            form.setValue("type", channelType);
        }
        else {
            form.setValue("type", ChannelType.TEXT);
        }
    }, [channelType, form]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId
                },
            });
            await axios.post(url, values);
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModelOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create Channel
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Channel Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Enter Channel name "
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Channel Type
                                            <Select disabled={isLoading}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl >
                                                    <SelectTrigger
                                                        className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none"
                                                    >
                                                        <SelectValue
                                                            placeholder="Select a channel type"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(ChannelType).map((type) => (
                                                        <SelectItem key={type}
                                                            value={type}
                                                            className="capitalize"
                                                        >
                                                            {type.toLowerCase()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-green-100 px-6 py-4">
                            <Button variant={"primary"} disabled={isLoading}>Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}