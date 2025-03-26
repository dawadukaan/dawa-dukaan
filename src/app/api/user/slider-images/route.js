// src/app/api/user/slider-images/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Slider from '@/lib/db/models/Slider';

export async function GET() {
  try {
    await connectDB();

    // Fetch only active sliders and sort by newest first
    const sliders = await Slider.find({ isActive: true })
      .select('title description image link')
      .sort({ _id: -1 });

    return NextResponse.json({
      success: true,
      data: sliders
    });
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sliders'
      },
      { status: 500 }
    );
  }
}
