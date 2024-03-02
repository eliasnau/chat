import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";
import axios, { AxiosError } from "axios";

async function createNewMessage(body: any, currentUser: any) {
  return prisma.message.create({
    include: {
      seen: true,
      sender: true,
    },
    data: {
      body: body.message,
      image: body.image,
      conversation: {
        connect: { id: body.conversationId },
      },
      sender: {
        connect: { id: currentUser.id },
      },
      seen: {
        connect: {
          id: currentUser.id,
        },
      },
    },
  });
}

async function updateConversation(
  conversationId: string,
  newMessageId: string
) {
  return prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt: new Date(),
      messages: {
        connect: {
          id: newMessageId,
        },
      },
    },
    include: {
      users: true,
      messages: {
        include: {
          seen: true,
        },
      },
    },
  });
}

async function triggerPusherEvents(
  conversationId: string,
  newMessage: any,
  lastMessage: any,
  users: any[]
) {
  await pusherServer.trigger(conversationId, "messages:new", newMessage);

  const lastMessageForUpdate = lastMessage || newMessage;

  users.map((user) => {
    pusherServer.trigger(user.email!, "conversation:update", {
      id: conversationId,
      messages: [lastMessageForUpdate],
    });
  });
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { message, image, conversationId } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newMessage = await createNewMessage(body, currentUser);

    const updatedConversation = await updateConversation(
      conversationId,
      newMessage.id
    );

    await triggerPusherEvents(
      conversationId,
      newMessage,
      updatedConversation.messages.slice(-1)[0],
      updatedConversation.users
    );

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error_MESSAGES", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Axios error details:", axiosError.response?.data);
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
