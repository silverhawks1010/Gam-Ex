import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const imagesDir = join(process.cwd(), 'public', '360')
    const files = await readdir(imagesDir)
    
    const images = files
      .filter(file => file.toLowerCase().endsWith('.jpg'))
      .map(file => ({
        name: file,
        path: `/360/${file}`
      }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading 360 images directory:', error)
    return NextResponse.json({ error: 'Failed to read images directory' }, { status: 500 })
  }
} 