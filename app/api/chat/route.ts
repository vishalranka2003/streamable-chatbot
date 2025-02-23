// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const streamingResponse = await model.generateContentStream(prompt);

    const responseStream = new ReadableStream({
      async start(controller) {
        const stream = streamingResponse.stream;
        for await (const chunk of stream) {
          const content = chunk.text();
          if (content) {
            controller.enqueue(content);
          }
        }
        controller.close();
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
