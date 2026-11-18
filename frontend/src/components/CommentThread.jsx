import { useState } from 'react'
import { commentApi } from '../api/client'

export default function CommentThread({ ticketId, comments: initial, currentUser }) {
  const [comments, setComments] = useState(initial)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    setError('')
    try {
      const comment = await commentApi.add(ticketId, body.trim())
      setComments(c => [...c, comment])
      setBody('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <span className="comment-section-title">Discussion</span>
        <span className="comment-count">{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="comment-list">
        {comments.length === 0 && (
          <p className="comment-empty">No comments yet. Be the first to add one.</p>
        )}
        {comments.map(c => {
          const isMe = c.author_id === currentUser?.id
          return (
            <div key={c.id} className={`comment-item ${isMe ? 'comment-mine' : ''}`}>
              <div className="comment-meta">
                <span className="comment-author">{c.author.name}</span>
                {isMe && <span className="comment-you-tag">you</span>}
                <span className="comment-time">
                  {new Date(c.created_at).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="comment-body">{c.body}</p>
            </div>
          )
        })}
      </div>

      <form onSubmit={submit} className="comment-form">
        {error && <div className="form-error-banner"><span>⚠</span> {error}</div>}
        <label className="form-label">Add a comment</label>
        <textarea
          className="form-input form-textarea comment-input"
          rows={3}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your comment…"
          required
        />
        <button
          type="submit"
          className="btn-comment-submit"
          disabled={loading || !body.trim()}
        >
          {loading ? <><span className="btn-spinner" /> Posting…</> : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}
