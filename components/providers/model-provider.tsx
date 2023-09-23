"use client";

import { CreateServerModel } from "@/components/modals/create-server-model";
import { InviteModel } from "@/components/modals/invite-model";
import { useEffect, useState } from "react";
import { EditServerModel } from "@/components/modals/edit-server-model copy";
import { MembersModel } from "@/components/modals/members-model";
import { CreateChannelModel } from "@/components/modals/create-channel-model";
import { LeaveServerModel } from "@/components/modals/leave-server-model";
import { DeleteServerModel } from "@/components/modals/delete-server-model";
import { DeleteChannelModel } from "@/components/modals/delete-channel-model";
import { EditChannelModel } from "@/components/modals/edit-channel-model";
import { MessageFileModel } from "@/components/modals/message-file-model";
import { DeleteMessageModel } from "@/components/modals/delete-message-model";

export const ModelProvider = ()=>{
    const [isMounted,setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    if(!isMounted){
        return null;
    }
    return(
        <>
        <CreateServerModel />
        <InviteModel />
        <EditServerModel />
        <MembersModel />
        <CreateChannelModel />
        <LeaveServerModel />
        <DeleteServerModel />
        <DeleteChannelModel />
        <EditChannelModel />
        <MessageFileModel />
        <DeleteMessageModel />
        </>
    )
}