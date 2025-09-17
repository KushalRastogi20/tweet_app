import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { content, userId } = body;

        if (!content || !userId) {
            return NextResponse.json({ error: 'Content and userId are required' }, { status: 400 });
        }

        // Simulate saving the tweet to a database
        const newTweet = {
            id: Date.now(), // Replace with actual database ID
            content,
            userId,
            createdAt: new Date(),
        };

        // Respond with the created tweet
        return NextResponse.json(newTweet, { status: 201 });
    } catch (error) {
        console.error('Error creating tweet:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}