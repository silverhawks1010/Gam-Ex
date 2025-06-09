'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import PhotoSphereViewer from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';

interface Image360 {
  name: string
  path: string
}

export default function View360Page() {
  const [images, setImages] = useState<Image360[]>([])
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const psvInstance = useRef<any>(null)

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/360-images')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error('Error loading images:', err))
  }, [])

  useEffect(() => {
    if (selectedImage && viewerRef.current) {
      if (psvInstance.current) {
        psvInstance.current.destroy()
      }
      psvInstance.current = new PhotoSphereViewer.Viewer({
        container: viewerRef.current,
        panorama: selectedImage,
        navbar: [
          'zoom',
          'fullscreen'
        ],
      })
    }
    return () => {
      if (psvInstance.current) {
        psvInstance.current.destroy()
        psvInstance.current = null
      }
    }
  }, [selectedImage])

  const handleImageSelect = (value: string) => {
    setSelectedImage(value)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">360° Image Viewer</h1>
      <Card className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-select">Sélectionner une image 360°</Label>
            <Select onValueChange={handleImageSelect} value={selectedImage}>
              <SelectTrigger id="image-select" className="w-full">
                <SelectValue placeholder="Choisir une image" />
              </SelectTrigger>
              <SelectContent>
                {images.map((image) => (
                  <SelectItem key={image.path} value={image.path}>
                    {image.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      {selectedImage && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div ref={viewerRef} className="aspect-video w-full bg-gray-100" />
        </div>
      )}
    </div>
  )
}