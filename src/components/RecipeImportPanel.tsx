import { useRef, useState } from 'react'
import { parseRecipeText, tryFetchUrlText, type ParsedRecipeDraft } from '../lib/recipeImport'

type RecipeImportPanelProps = {
  onUseDraft: (draft: ParsedRecipeDraft) => void
}

export function RecipeImportPanel({ onUseDraft }: RecipeImportPanelProps) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [imageHint, setImageHint] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [draft, setDraft] = useState<ParsedRecipeDraft | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFetch = async () => {
    if (!url.trim()) return
    setIsFetching(true)
    setStatus(null)
    const result = await tryFetchUrlText(url.trim())
    setIsFetching(false)
    if ('error' in result) {
      setStatus(result.error)
      return
    }
    setText(result.text.trim())
    setImageHint(result.imageUrl)
    setStatus('Fetched — review the extracted text below, then parse it.')
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const fileText = await file.text()
    setText(fileText)
    setStatus(`Loaded ${file.name} — parse it below.`)
  }

  const handleParse = () => {
    if (!text.trim()) return
    const parsed = parseRecipeText(text, imageHint)
    setDraft(parsed)
    setStatus(null)
  }

  return (
    <div className="recipe-import">
      <p className="pool-manager__hint">
        Paste a link, upload a text file, or paste recipe text directly — we'll scan it for a title, ingredients,
        macros, and a food photo. Most recipe sites block direct fetching from browsers, so pasting the text is the
        most reliable option.
      </p>

      <div className="recipe-import__url-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/recipe"
        />
        <button type="button" onClick={handleFetch} disabled={isFetching || !url.trim()}>
          {isFetching ? 'Fetching…' : 'Try fetch'}
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Upload .txt
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="image-dropzone__input"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {status && <p className="recipe-import__status">{status}</p>}

      <textarea
        className="recipe-import__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste recipe text here — title on the first line, then an Ingredients section works best."
        rows={6}
      />

      <button type="button" className="recipe-import__parse" onClick={handleParse} disabled={!text.trim()}>
        Extract recipe
      </button>

      {draft && (
        <div className="recipe-import__preview">
          {draft.imageUrl && <img src={draft.imageUrl} alt="" className="recipe-import__preview-image" />}
          <div className="recipe-import__preview-body">
            <strong>{draft.name || 'Untitled recipe'}</strong>
            <span>
              {draft.ingredients.length} ingredient{draft.ingredients.length === 1 ? '' : 's'} found
              {draft.calories ? ` · ${draft.calories} cal` : ''}
            </span>
            <button type="button" className="recipe-import__use" onClick={() => onUseDraft(draft)}>
              Use this in the form below
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
