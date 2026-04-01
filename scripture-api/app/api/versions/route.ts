import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataDir);
    
    // Filter for JSON files and remove the .json extension
    const versions = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
      
    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Failed to read data directory', error);
    return NextResponse.json({ error: 'Failed to read available versions' }, { status: 500 });
  }
}
