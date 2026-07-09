import { useCallback, useRef, useState } from 'react'

type ImageDropzoneProps = {
  value: string | null
  onChange: (dataUrl: string | null) => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith('image/')) return
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
    },
    [onChange],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      handleFile(event.dataTransfer.files[0])
    },
    [handleFile],
  )

  if (value) {
    return (
      <div className="image-dropzone image-dropzone--filled">
        <img src={value} alt="Recipe preview" className="image-dropzone__preview" />
        <button type="button" className="image-dropzone__remove" onClick={() => onChange(null)}>
          Remove image
        </button>
      </div>
    )
  }

  return (
    <div
      className={`image-dropzone${isDragOver ? ' image-dropzone--drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
    >
      <span className="image-dropzone__icon" aria-hidden="true">📷</span>
      <span className="image-dropzone__label">Drag & drop a photo, or click to browse</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="image-dropzone__input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
