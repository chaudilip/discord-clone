import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { emit } from "process";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(404).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(401).json({ message: "Server Id Missing" });
    }
    if (!channelId) {
      return res.status(401).json({ message: "Channel Id Missing" });
    }
    if (!content) {
      return res.status(401).json({ message: "Content Id Missing" });
    }
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ message: "Server Not Found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel) {
      return res.status(404).json({ message: "Channel Not Found" });
    }
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );
    if (!member) {
      return res.status(404).json({ message: "Member Not Found" });
    }
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channel.id as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey,message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("MESSAGES_HOST_ERROR : ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
