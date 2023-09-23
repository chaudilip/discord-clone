import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { channel } from "diagnostics_channel";

const MESSAGE_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    //cursor used for load the messages and told that what next batch of next messages should load
    const cursor = searchParams.get("cursor");

    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!conversationId) {
      return new NextResponse("conversation Id Missing", { status: 400 });
    }

    let messages: DirectMessage[] = [];
    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
         conversationId ,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor  = null;
    //if we reached to the last message 10 then get the id
    if(messages.length === MESSAGE_BATCH){
        nextCursor = messages[MESSAGE_BATCH-1].id;
    }
    return NextResponse.json({
        items:messages,
        nextCursor
    })
  } catch (error) {
    console.log("[DIRECT_MESSAGE_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
